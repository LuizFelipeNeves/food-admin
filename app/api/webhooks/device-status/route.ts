import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Device, DeviceEvent } from '@/models';
import { connectDB } from '@/lib/mongodb';

interface WebhookPayload {
  device: {
    deviceHash: string;
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
  'stopped': 'active', // Dispositivo pode estar ativo mas deslogado
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
  const startTime = Date.now();
  console.log('=== WEBHOOK DEVICE STATUS RECEIVED ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Headers:', Object.fromEntries(request.headers.entries()));

  try {
    await connectDB();

    const body = await request.text();
    console.log('Raw body:', body);
    
    const webhookData: WebhookPayload = JSON.parse(body);
    console.log('Parsed webhook data:', JSON.stringify(webhookData, null, 2));
    
    const { device: deviceInfo, event, timestamp } = webhookData;

    // Encontrar o dispositivo pelo deviceHash
    console.log('Searching for device with deviceHash:', deviceInfo.deviceHash);
    const device = await Device.findOne({ 
      deviceHash: deviceInfo.deviceHash 
    });

    if (!device) {
      console.error(`❌ DEVICE NOT FOUND: ${deviceInfo.deviceHash}`);
      console.log('Available devices in database:');
      const allDevices = await Device.find({}, 'deviceHash name phoneNumber').limit(10);
      console.log(allDevices.map(d => `${d.deviceHash} - ${d.name} (${d.phoneNumber})`));
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    console.log(`✅ DEVICE FOUND: ${device.name} (${device.deviceHash})`);

    // Validar assinatura do webhook
    const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = request.headers.get('x-webhook-signature');
      console.log('Webhook secret configured:', !!webhookSecret);
      console.log('Signature header:', signature);
      
      if (!signature) {
        console.warn('⚠️ WEBHOOK SIGNATURE NOT PROVIDED');
        return NextResponse.json(
          { error: 'Missing signature' },
          { status: 401 }
        );
      }

      if (!validateWebhookSignature(body, signature, webhookSecret)) {
        console.error('❌ WEBHOOK SIGNATURE INVALID');
        console.log('Expected signature for body:', body.substring(0, 100) + '...');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
      
      console.log('✅ WEBHOOK SIGNATURE VALID');
    } else {
      console.warn('⚠️ NO WEBHOOK SECRET CONFIGURED - SKIPPING VALIDATION');
    }

    // Mapear tipo de evento
    let eventType = eventTypeMapping[event.type] || event.type;
    console.log('Original event type:', event.type, '-> Mapped to:', eventType);
    
    // Para eventos de container, ajustar baseado no código
    if (event.type === 'container_event') {
      if (event.code === 'CONTAINER_START') {
        eventType = 'connected';
      } else if (event.code === 'CONTAINER_STOP') {
        eventType = 'disconnected';
      } else if (event.code === 'LOGOUT_COMPLETE') {
        eventType = 'disconnected';
      }
      console.log('Container event code:', event.code, '-> Final event type:', eventType);
    }

    // Mapear status
    const mappedStatus = statusMapping[deviceInfo.status] || deviceInfo.status;
    console.log('Original status:', deviceInfo.status, '-> Mapped to:', mappedStatus);

    // Atualizar status do dispositivo
    const updateData = {
      status: mappedStatus,
      lastSeen: new Date(timestamp),
      // Se foi autenticado com sucesso e não estava logado, marcar como logado e limpar QR code
      ...(event.type === 'login_success' && !device.isLoggedIn && { 
        isLoggedIn: true,
        qrCode: null 
      }),
      // Se foi desconectado ou com erro, marcar como não logado
      ...((['disconnected', 'auth_failed'].includes(event.type) || mappedStatus === 'error' || event.code === 'LOGOUT_COMPLETE') && { 
        isLoggedIn: false 
      })
    };
    
    console.log('Updating device with data:', updateData);
    await Device.findByIdAndUpdate(device._id, updateData);
    console.log('✅ DEVICE STATUS UPDATED IN DATABASE');

    // Registrar evento no histórico
    const eventData = {
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
    };
    
    console.log('Creating device event with data:', eventData);
    await DeviceEvent.create(eventData);
    console.log('✅ DEVICE EVENT LOGGED');

    const processingTime = Date.now() - startTime;
    console.log(`✅ WEBHOOK PROCESSED SUCCESSFULLY in ${processingTime}ms`);
    console.log(`📱 Device: ${device.name} (${deviceInfo.deviceHash})`);
    console.log(`🔄 Event: ${eventType} -> Status: ${mappedStatus}`);
    console.log('=== END WEBHOOK PROCESSING ===\n');

    return NextResponse.json({ success: true });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ WEBHOOK PROCESSING FAILED');
    console.error('Processing time:', `${processingTime}ms`);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error type:', error?.constructor?.name || 'Unknown');
    console.error('Error message:', errorMessage);
    if (errorStack) {
      console.error('Error stack:', errorStack);
    }
    
    // Log additional context that might help debug
    if (errorMessage.includes('JSON')) {
      console.error('Possible JSON parsing error - check webhook payload format');
    }
    if (errorMessage.includes('validation')) {
      console.error('Possible validation error - check webhook data structure');
    }
    if (errorMessage.includes('database') || errorMessage.includes('mongo')) {
      console.error('Database error - check MongoDB connection and models');
    }
    
    console.error('=== END WEBHOOK ERROR PROCESSING ===\n');
    
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