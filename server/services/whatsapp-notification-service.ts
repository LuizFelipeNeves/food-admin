import { Device } from '@/models'
import { whatsAppService } from './whatsapp-service'
import { orderNotificationService } from './order-notification-service'

interface NotificationResult {
  success: boolean
  message?: string
  error?: string
}

export class WhatsAppNotificationService {
  private formatPhoneForWhatsApp(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '')
    return `55${cleanPhone}@s.whatsapp.net`
  }

  private async getActiveDevice(storeId: string) {
    return await Device.findOne({
      company: storeId,
      status: 'active',
      isLoggedIn: true
    }).lean()
  }

  async sendOrderCreatedNotification(order: any): Promise<NotificationResult> {
    try {
      // Verificar se o usuário tem telefone
      if (!order.user?.phone) {
        return {
          success: false,
          message: 'Usuário não possui telefone cadastrado'
        }
      }

      // Buscar dispositivo ativo da loja
      const device = await this.getActiveDevice(order.store._id || order.store)
      if (!device) {
        return {
          success: false,
          message: 'Nenhum dispositivo WhatsApp ativo encontrado para a loja'
        }
      }

      // Formatar telefone para WhatsApp
      const whatsappPhone = this.formatPhoneForWhatsApp(order.user.phone)

      // Gerar mensagem de pedido criado
      const notification = orderNotificationService.createOrderMessage(order)
      
      // Enviar mensagem
      await whatsAppService.sendMessage(
        (device as any).deviceHash,
        whatsappPhone,
        notification.message
      )

      return {
        success: true,
        message: 'Notificação de pedido criado enviada com sucesso'
      }

    } catch (error) {
      console.error('Erro ao enviar notificação WhatsApp de pedido criado:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  async sendOrderStatusUpdateNotification(order: any, status: string): Promise<NotificationResult> {
    try {
      // Verificar se o usuário tem telefone
      if (!order.user?.phone) {
        return {
          success: false,
          message: 'Usuário não possui telefone cadastrado'
        }
      }

      // Buscar dispositivo ativo da loja
      const device = await this.getActiveDevice(order.store._id || order.store)
      if (!device) {
        return {
          success: false,
          message: 'Nenhum dispositivo WhatsApp ativo encontrado para a loja'
        }
      }

      // Formatar telefone para WhatsApp
      const whatsappPhone = this.formatPhoneForWhatsApp(order.user.phone)

      // Gerar mensagem baseada no status
      const notification = orderNotificationService.createStatusUpdateMessage(status)
      
      // Enviar mensagem
      await whatsAppService.sendMessage(
        (device as any).deviceHash,
        whatsappPhone,
        notification.message
      )

      return {
        success: true,
        message: 'Notificação de status atualizado enviada com sucesso'
      }

    } catch (error) {
      console.error('Erro ao enviar notificação WhatsApp de status:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }
}

export const whatsAppNotificationService = new WhatsAppNotificationService()