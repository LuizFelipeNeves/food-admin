// @ts-nocheck - Temporário para resolver problemas de cache do TypeScript
import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { Device, DeviceEvent, UserStore } from '@/models';
import { whatsAppService } from '../services/whatsapp-service';
import { connectDB } from '@/lib/mongodb';

const createDeviceSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  storeId: z.string(),
  isMain: z.boolean().default(false),
  autoStart: z.boolean().default(true),
});

const updateDeviceSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Nome muito curto').optional(),
  isMain: z.boolean().optional(),
  autoStart: z.boolean().optional(),
});

// Helper function para registrar eventos
const logDeviceEvent = async (
  deviceId: string,
  eventType: string,
  status: string,
  message?: string,
  metadata?: any
) => {
  try {
    await DeviceEvent.create({
      device: deviceId,
      eventType,
      status,
      message,
      metadata,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Erro ao registrar evento do dispositivo:', error);
  }
};

export const devicesRouter = router({
  list: protectedProcedure
    .input(z.object({
      storeId: z.string(),
      status: z.string().optional(),
      limit: z.number().default(25),
      offset: z.number().default(0),
    }))
    .query(async ({ input, ctx }) => {
      await connectDB();
      
      // Verificar se o usuário tem acesso à loja
      const userStore = await UserStore.findOne({
        user: ctx.user.id,
        store: input.storeId,
        active: true,
      });

      if (!userStore) {
        throw new Error('Acesso negado à loja');
      }
      
      const filter: any = { company: input.storeId };
      if (input.status) {
        filter.status = input.status;
      }

      const devices = await Device.find(filter)
        .sort({ createdAt: -1 })
        .limit(input.limit)
        .skip(input.offset)
        .populate('company', 'title');

      const total = await Device.countDocuments(filter);

      return {
        devices,
        total,
        hasMore: (input.offset + input.limit) < total,
      };
    }),

  create: protectedProcedure
    .input(createDeviceSchema)
    .mutation(async ({ input, ctx }) => {
      await connectDB();

      // Verificar se o usuário tem acesso à loja
      const userStore = await UserStore.findOne({
        user: ctx.user.id,
        store: input.storeId,
        active: true,
      });

      if (!userStore) {
        throw new Error('Acesso negado à loja');
      }

      // Se for dispositivo principal, remover status principal dos outros
      if (input.isMain) {
        await Device.updateMany(
          { company: input.storeId },
          { isMain: false }
        );
      }

      // Configurar webhooks automaticamente apontando para nossa API
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000';
      const statusWebhookUrl = `${baseUrl}/api/webhooks/device-status`;
      const statusWebhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET || 'default-webhook-secret';

      // Criar dispositivo no serviço WhatsApp
      let whatsappDevice;
      try {
        whatsappDevice = await whatsAppService.createDevice({
          name: input.name,
          statusWebhookUrl,
          statusWebhookSecret,
          autoStart: input.autoStart,
        });
        console.log('WhatsApp device response:', whatsappDevice);
      } catch (error) {
        console.error('Erro ao criar dispositivo no WhatsApp:', error);
        throw new Error(`Falha ao criar dispositivo no WhatsApp: ${error.message}`);
      }

      // Salvar no banco
      let device;
      try {
        device = new Device({
          name: input.name,
          deviceHash: whatsappDevice.data.deviceHash,
          status: whatsappDevice.data.status,
          isMain: input.isMain,
          autoStart: input.autoStart,
          company: input.storeId,
        });

        await device.save();
        await device.populate('company', 'title');
      } catch (error) {
        console.error('Erro ao salvar dispositivo no banco:', error);
        console.error('WhatsApp device data:', whatsappDevice);
        
        throw new Error(`Erro ao salvar dispositivo: ${error.message}`);
      }

      // Log evento de criação
      await logDeviceEvent(
        device._id.toString(),
        'connected',
        device.status,
        `Dispositivo ${device.name} criado com sucesso`,
        { 
          deviceHash: device.deviceHash,
          autoStart: device.autoStart,
          statusWebhookConfigured: true 
        }
      );

      return device;
    }),

  update: protectedProcedure
    .input(updateDeviceSchema.extend({ storeId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await connectDB();

      // Verificar se o usuário tem acesso à loja
      const userStore = await UserStore.findOne({
        user: ctx.user.id,
        store: input.storeId,
        active: true,
      });

      if (!userStore) {
        throw new Error('Acesso negado à loja');
      }

      const device = await Device.findOne({ 
        _id: input.id, 
        company: input.storeId 
      });

      if (!device) {
        throw new Error('Dispositivo não encontrado');
      }

      // Se for para marcar como principal, remover status principal dos outros
      if (input.isMain === true) {
        await Device.updateMany(
          { company: input.storeId, _id: { $ne: input.id } },
          { isMain: false }
        );
      }

      // Preparar dados para atualização no WhatsApp
      const updateData: any = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.autoStart !== undefined) updateData.autoStart = input.autoStart;

      // Atualizar no serviço WhatsApp se há dados relevantes
      if (Object.keys(updateData).length > 0) {
        await whatsAppService.updateDevice(device.deviceHash, updateData);
      }

      // Atualizar no banco
      const updatedDevice = await Device.findByIdAndUpdate(
        input.id,
        { 
          $set: {
            name: input.name,
            isMain: input.isMain,
            autoStart: input.autoStart
          }
        },
        { new: true, runValidators: true }
      ).populate('company', 'title');

      return updatedDevice;
    }),

  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
      storeId: z.string(),
      force: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      await connectDB();

      // Verificar se o usuário tem acesso à loja
      const userStore = await UserStore.findOne({
        user: ctx.user.id,
        store: input.storeId,
        active: true,
      });

      if (!userStore) {
        throw new Error('Acesso negado à loja');
      }

      const device = await Device.findOne({ 
        _id: input.id, 
        company: input.storeId 
      });

      if (!device) {
        throw new Error('Dispositivo não encontrado');
      }

      // Deletar no serviço WhatsApp
      await whatsAppService.deleteDevice(device.deviceHash, input.force);

      // Deletar no banco
      await Device.findByIdAndDelete(input.id);

      // Log evento de remoção
      await logDeviceEvent(
        device._id.toString(),
        'disconnected',
        'stopped',
        `Dispositivo ${device.name} removido`,
        { deviceHash: device.deviceHash, force: input.force }
      );

      return { success: true };
    }),

  getInfo: protectedProcedure
    .input(z.object({
      id: z.string(),
      storeId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      await connectDB();

      // Verificar se o usuário tem acesso à loja
      const userStore = await UserStore.findOne({
        user: ctx.user.id,
        store: input.storeId,
        active: true,
      });

      if (!userStore) {
        throw new Error('Acesso negado à loja');
      }

      const device = await Device.findOne({ 
        _id: input.id, 
        company: input.storeId 
      }).populate('company', 'title');

      if (!device) {
        throw new Error('Dispositivo não encontrado');
      }

      try {
        // Obter informações atualizadas do WhatsApp
        const whatsappInfo = await whatsAppService.getDeviceInfo(device.deviceHash);
        
        // Atualizar informações no banco
        await Device.findByIdAndUpdate(input.id, {
          status: whatsappInfo.status,
          lastSeen: whatsappInfo.lastSeen ? new Date(whatsappInfo.lastSeen) : null,
        });

        return {
          ...device.toObject(),
          status: whatsappInfo.status,
          lastSeen: whatsappInfo.lastSeen,
          // QR Code e processStatus agora são dados temporários retornados apenas pela API
          qrCode: whatsappInfo.qrCode,
          processStatus: whatsappInfo.processStatus,
        };
      } catch (error) {
        // Se falhar ao obter info do WhatsApp, retornar dados do banco
        return device;
      }
    }),

  getQRCode: protectedProcedure
    .input(z.object({
      id: z.string(),
      storeId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      await connectDB();

      // Verificar se o usuário tem acesso à loja
      const userStore = await UserStore.findOne({
        user: ctx.user.id,
        store: input.storeId,
        active: true,
      });

      if (!userStore) {
        throw new Error('Acesso negado à loja');
      }

      const device = await Device.findOne({ 
        _id: input.id, 
        company: input.storeId 
      });

      if (!device) {
        throw new Error('Dispositivo não encontrado');
      }

      const qrData = await whatsAppService.getQRCode(device.deviceHash);
      
      console.log('QR Code response:', JSON.stringify(qrData, null, 2));
      
      // Se dispositivo já está logado, atualizar status
      if (qrData.code === 'ALREADY_LOGGED_IN') {
        await Device.findByIdAndUpdate(input.id, {
          status: 'active',
          isLoggedIn: true,
          lastSeen: new Date(),
        });

        return {
          qrCode: null,
          status: 'ALREADY_LOGGED_IN',
          message: 'Dispositivo já está conectado',
          isAlreadyLoggedIn: true
        };
      }
      
      // QR Code não é mais armazenado no banco, apenas retornado
      // Mapear a estrutura da API para o formato esperado pelo frontend
      return {
        qrCode: qrData.results?.qr_code || null,
        status: qrData.code,
        message: qrData.message,
        qr_duration: qrData.results?.qr_duration || 30,
        isAlreadyLoggedIn: false
      };
    }),

  start: protectedProcedure
    .input(z.object({
      id: z.string(),
      storeId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      await connectDB();

      // Verificar se o usuário tem acesso à loja
      const userStore = await UserStore.findOne({
        user: ctx.user.id,
        store: input.storeId,
        active: true,
      });

      if (!userStore) {
        throw new Error('Acesso negado à loja');
      }

      const device = await Device.findOne({ 
        _id: input.id, 
        company: input.storeId 
      });

      if (!device) {
        throw new Error('Dispositivo não encontrado');
      }

      const result = await whatsAppService.startDevice(device.deviceHash);

      // Atualizar status no banco
      await Device.findByIdAndUpdate(input.id, {
        status: 'registered',
      });

      // Log evento
      await logDeviceEvent(
        device._id.toString(),
        'connected',
        'registered',
        `Dispositivo ${device.name} iniciado`,
        result
      );

      return result;
    }),

  stop: protectedProcedure
    .input(z.object({
      id: z.string(),
      storeId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      await connectDB();

      // Verificar se o usuário tem acesso à loja
      const userStore = await UserStore.findOne({
        user: ctx.user.id,
        store: input.storeId,
        active: true,
      });

      if (!userStore) {
        throw new Error('Acesso negado à loja');
      }

      const device = await Device.findOne({ 
        _id: input.id, 
        company: input.storeId 
      });

      if (!device) {
        throw new Error('Dispositivo não encontrado');
      }

      const result = await whatsAppService.stopDevice(device.deviceHash);

      // Atualizar status no banco
      await Device.findByIdAndUpdate(input.id, {
        status: 'stopped',
      });

      // Log evento
      await logDeviceEvent(
        device._id.toString(),
        'disconnected',
        'stopped',
        `Dispositivo ${device.name} parado`,
        result
      );

      return result;
    }),

  restart: protectedProcedure
    .input(z.object({
      id: z.string(),
      storeId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      await connectDB();

      // Verificar se o usuário tem acesso à loja
      const userStore = await UserStore.findOne({
        user: ctx.user.id,
        store: input.storeId,
        active: true,
      });

      if (!userStore) {
        throw new Error('Acesso negado à loja');
      }

      const device = await Device.findOne({ 
        _id: input.id, 
        company: input.storeId 
      });

      if (!device) {
        throw new Error('Dispositivo não encontrado');
      }

      const result = await whatsAppService.restartDevice(device.deviceHash);

      // Atualizar status no banco
      await Device.findByIdAndUpdate(input.id, {
        status: 'active',
      });

      // Log evento
      await logDeviceEvent(
        device._id.toString(),
        'connected',
        'active',
        `Dispositivo ${device.name} reiniciado`,
        result
      );

      return result;
    }),

  logout: protectedProcedure
    .input(z.object({
      id: z.string(),
      storeId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      await connectDB();

      // Verificar se o usuário tem acesso à loja
      const userStore = await UserStore.findOne({
        user: ctx.user.id,
        store: input.storeId,
        active: true,
      });

      if (!userStore) {
        throw new Error('Acesso negado à loja');
      }

      const device = await Device.findOne({ 
        _id: input.id, 
        company: input.storeId 
      });

      if (!device) {
        throw new Error('Dispositivo não encontrado');
      }

      const result = await whatsAppService.logoutDevice(device.deviceHash);

      // Atualizar status no banco
      await Device.findByIdAndUpdate(input.id, {
        status: 'registered',
        isLoggedIn: false,
        lastSeen: null,
      });

      // Log evento
      await logDeviceEvent(
        device._id.toString(),
        'disconnected',
        'registered',
        `Dispositivo ${device.name} desconectado (logout) por ${ctx.user.email}`,
        { 
          ...result,
          loggedOutBy: {
            userId: ctx.user.id,
            email: ctx.user.email,
            name: ctx.user.name
          },
          action: 'manual_logout'
        }
      );

      return result;
    }),

  getHistory: protectedProcedure
    .input(z.object({
      id: z.string(),
      storeId: z.string(),
      limit: z.number().default(50),
      offset: z.number().default(0),
      eventType: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      await connectDB();

      // Verificar se o usuário tem acesso à loja
      const userStore = await UserStore.findOne({
        user: ctx.user.id,
        store: input.storeId,
        active: true,
      });

      if (!userStore) {
        throw new Error('Acesso negado à loja');
      }

      const device = await Device.findOne({ 
        _id: input.id, 
        company: input.storeId 
      });

      if (!device) {
        throw new Error('Dispositivo não encontrado');
      }

      const filter: any = { device: input.id };
      if (input.eventType) {
        filter.eventType = input.eventType;
      }

      const events = await DeviceEvent.find(filter)
        .sort({ timestamp: -1 })
        .limit(input.limit)
        .skip(input.offset)
        .select('eventType status message metadata timestamp createdAt');

      const total = await DeviceEvent.countDocuments(filter);

      return {
        events,
        total,
        hasMore: (input.offset + input.limit) < total,
      };
    }),

  getStats: protectedProcedure
    .input(z.object({
      id: z.string(),
      storeId: z.string(),
      days: z.number().default(7),
    }))
    .query(async ({ input, ctx }) => {
      await connectDB();

      // Verificar se o usuário tem acesso à loja
      const userStore = await UserStore.findOne({
        user: ctx.user.id,
        store: input.storeId,
        active: true,
      });

      if (!userStore) {
        throw new Error('Acesso negado à loja');
      }

      const device = await Device.findOne({ 
        _id: input.id, 
        company: input.storeId 
      });

      if (!device) {
        throw new Error('Dispositivo não encontrado');
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const stats = await DeviceEvent.aggregate([
        {
          $match: {
            device: device._id,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              eventType: '$eventType',
              date: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$timestamp'
                }
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.eventType',
            events: {
              $push: {
                date: '$_id.date',
                count: '$count'
              }
            },
            total: { $sum: '$count' }
          }
        }
      ]);

      // Calcular tempo de atividade
      const connectionEvents = await DeviceEvent.find({
        device: input.id,
        eventType: { $in: ['connected', 'disconnected'] },
        timestamp: { $gte: startDate }
      }).sort({ timestamp: 1 });

      let uptime = 0;
      let lastConnected = null;

      for (const event of connectionEvents) {
        if (event.eventType === 'connected') {
          lastConnected = event.timestamp;
        } else if (event.eventType === 'disconnected' && lastConnected) {
          uptime += event.timestamp.getTime() - lastConnected.getTime();
          lastConnected = null;
        }
      }

      // Se ainda está conectado, contar até agora
      if (lastConnected) {
        uptime += Date.now() - lastConnected.getTime();
      }

      const uptimePercentage = uptime / (input.days * 24 * 60 * 60 * 1000) * 100;

      return {
        stats,
        uptime: Math.round(uptime / 1000), // em segundos
        uptimePercentage: Math.min(100, Math.round(uptimePercentage)),
        totalEvents: stats.reduce((acc, stat) => acc + stat.total, 0),
      };
    }),
});