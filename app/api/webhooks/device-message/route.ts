import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Device, DeviceEvent } from '@/models';
import { connectDB } from '@/lib/mongodb';

interface MessageWebhookPayload {
  device: {
    deviceHash: string;
  };
  message: {
    id: string;
    from: string;
    to: string;
    body?: string;
    type: string;
    timestamp: number;
    fromMe: boolean;
  };
  timestamp: string;
}

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
    const webhookData: MessageWebhookPayload = JSON.parse(body);
    
    const { device: deviceInfo, message, timestamp } = webhookData;

    // Encontrar o dispositivo pelo número de telefone
    const device = await Device.findOne({ 
      deviceHash: deviceInfo.deviceHash 
    });

    if (!device) {
      console.warn(`Dispositivo não encontrado: ${deviceInfo.deviceHash}`);
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    // Validar assinatura se houver secret configurado
    if (device.webhookSecret) {
      const signature = request.headers.get('x-webhook-signature');
      
      if (!signature) {
        console.warn('Webhook signature não fornecida');
        return NextResponse.json(
          { error: 'Missing signature' },
          { status: 401 }
        );
      }

      if (!validateWebhookSignature(body, signature, device.webhookSecret)) {
        console.warn('Webhook signature inválida');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Determinar tipo de evento
    const eventType = message.fromMe ? 'message_sent' : 'message_received';
    
    // Criar mensagem descritiva
    const eventMessage = message.fromMe 
      ? `Mensagem enviada para ${message.to}: ${message.body?.substring(0, 100) || `[${message.type}]`}`
      : `Mensagem recebida de ${message.from}: ${message.body?.substring(0, 100) || `[${message.type}]`}`;

    // Registrar evento no histórico
    await DeviceEvent.create({
      device: device._id,
      eventType,
      status: device.status,
      message: eventMessage,
      metadata: {
        messageId: message.id,
        messageType: message.type,
        from: message.from,
        to: message.to,
        fromMe: message.fromMe,
        messageTimestamp: message.timestamp,
        webhookTimestamp: timestamp,
        ...(message.body && { messagePreview: message.body.substring(0, 200) })
      },
      timestamp: new Date(timestamp),
    });

    // Atualizar última atividade do dispositivo
    await Device.findByIdAndUpdate(device._id, {
      lastSeen: new Date(timestamp)
    });

    console.log(`Mensagem registrada para dispositivo ${device.name}: ${eventType}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro ao processar webhook de mensagem:', error);
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
    endpoint: 'device-message-webhook',
    timestamp: new Date().toISOString()
  });
}