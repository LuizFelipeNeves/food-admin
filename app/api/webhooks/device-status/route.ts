import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Device, DeviceEvent } from '@/models';
import { connectDB } from '@/lib/mongodb';

interface WebhookPayload {
  device: {
    phoneNumber: string;
    name: string;
    status: string;
  };
  event: {
    type: string;
    code: string;
    message: string;
    data?: any;
  };
  timestamp: string;
}

// Mapeamento de eventos do webhook para eventos internos
const eventTypeMapping: Record<string, string> = {
  'login_success': 'authenticated',
  'connected': 'connected',
  'disconnected': 'disconnected',
  'auth_failed': 'error',
  'container_event': 'connected', // Pode ser ajustado baseado no código
};

// Mapeamento de status do webhook para status interno
const statusMapping: Record<string, string> = {
  'connected': 'active',
  'disconnected': 'registered',
  'running': 'active',
  'stopped': 'stopped',
  'error': 'error',
};

function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
      
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Erro ao validar assinatura do webhook:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.text();
    const webhookData: WebhookPayload = JSON.parse(body);
    
    const { device: deviceInfo, event, timestamp } = webhookData;

    // Encontrar o dispositivo pelo número de telefone
    const device = await Device.findOne({ 
      phoneNumber: deviceInfo.phoneNumber 
    });

    if (!device) {
      console.warn(`Dispositivo não encontrado: ${deviceInfo.phoneNumber}`);
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    // Validar assinatura se houver secret configurado
    if (device.statusWebhookSecret) {
      const signature = request.headers.get('x-webhook-signature');
      
      if (!signature) {
        console.warn('Webhook signature não fornecida');
        return NextResponse.json(
          { error: 'Missing signature' },
          { status: 401 }
        );
      }

      if (!validateWebhookSignature(body, signature, device.statusWebhookSecret)) {
        console.warn('Webhook signature inválida');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Mapear tipo de evento
    let eventType = eventTypeMapping[event.type] || event.type;
    
    // Para eventos de container, ajustar baseado no código
    if (event.type === 'container_event') {
      if (event.code === 'CONTAINER_START') {
        eventType = 'connected';
      } else if (event.code === 'CONTAINER_STOP') {
        eventType = 'disconnected';
      }
    }

    // Mapear status
    const mappedStatus = statusMapping[deviceInfo.status] || deviceInfo.status;

    // Atualizar status do dispositivo
    await Device.findByIdAndUpdate(device._id, {
      status: mappedStatus,
      lastSeen: new Date(timestamp),
      // Se foi autenticado com sucesso, limpar QR code antigo
      ...(event.type === 'login_success' && { qrCode: null })
    });

    // Registrar evento no histórico
    await DeviceEvent.create({
      device: device._id,
      eventType,
      status: mappedStatus,
      message: event.message,
      metadata: {
        originalEvent: event,
        webhookTimestamp: timestamp,
        code: event.code,
        ...(event.data && { data: event.data })
      },
      timestamp: new Date(timestamp),
    });

    console.log(`Evento registrado para dispositivo ${device.name} (${deviceInfo.phoneNumber}): ${eventType}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro ao processar webhook de status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Método GET para verificação de saúde do webhook
export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    endpoint: 'device-status-webhook',
    timestamp: new Date().toISOString()
  });
}