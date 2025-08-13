import { Item, Additional, Order, User } from '@/models'
import mongoose from 'mongoose'
import { whatsAppNotificationService } from './whatsapp-notification-service'

interface OrderItem {
  productId: string
  quantity: number
  notes?: string
  additionals?: string[]
}

interface CreateOrderPayload {
  items: OrderItem[]
  paymentMethod: string
  storeId: string
  customerPhone?: string
  customerName?: string
  sendNotification?: boolean
}

interface CreateOrderResult {
  order: any
  notificationSent: boolean
  notificationMessage?: string
}

export class OrderService {
  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult> {
    try {
      // Buscar informações completas dos produtos
      const productIds = payload.items.map(item => 
        new mongoose.Types.ObjectId(item.productId)
      )
      
      const products = await Item.find({
        _id: { $in: productIds }
      }).populate('additionals')
      
      if (products.length !== productIds.length) {
        throw new Error('Alguns produtos não foram encontrados')
      }
      
      // Buscar todos os adicionais que podem estar nos pedidos
      const allAdditionalIds = payload.items.flatMap(item => item.additionals || [])
        .map(id => new mongoose.Types.ObjectId(id))
      
      const additionals = allAdditionalIds.length > 0 
        ? await Additional.find({ _id: { $in: allAdditionalIds } })
        : []
      
      // Calcular valores
      const orderItems = await Promise.all(payload.items.map(async (item) => {
        const product = products.find(p => 
          p._id.toString() === item.productId
        )
        
        if (!product) {
          throw new Error(`Produto não encontrado: ${item.productId}`)
        }
        
        // Buscar adicionais selecionados
        const selectedAdditionals = item.additionals && item.additionals.length > 0
          ? additionals
              .filter(additional => 
                item.additionals?.includes(additional._id.toString())
              )
              .map(additional => ({
                _id: additional._id.toString(),
                name: additional.name,
                price: additional.price
              }))
          : []
        
        // Calcular preço total do item com adicionais
        const additionalTotal = selectedAdditionals.reduce(
          (sum: number, additional: { price: number }) => sum + additional.price, 
          0
        )
        
        const itemTotal = (product.price + additionalTotal) * item.quantity
        
        return {
          _id: product._id.toString(),
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          notes: item.notes,
          additionals: selectedAdditionals,
          total: itemTotal
        }
      }))
      
      const subtotal = orderItems.reduce(
        (sum, item) => sum + item.total, 
        0
      )
      
      // Buscar ou criar usuário
      let user = await this.getOrCreateUser(payload.customerPhone, payload.customerName)
      
      // Criar o pedido
      const newOrder = new Order({
        items: orderItems,
        paymentMethod: payload.paymentMethod,
        paymentStatus: 'paid',
        subtotal,
        total: subtotal,
        status: 'pending',
        source: 'pos',
        store: payload.storeId,
        user: user._id,
        deliveryType: 'local',
        sendNotification: payload.sendNotification || false,
        events: [{
          date: new Date(),
          status: 'pending',
          description: 'Pedido criado no PDV'
        }]
      })

      await newOrder.save()

      // Popular o pedido com dados completos para notificação
      const populatedOrder = await Order.findById(newOrder._id)
        .populate('user')
        .populate('store')
        .lean()

      // Enviar notificação por WhatsApp apenas se solicitado
      let notificationSent = false
      let notificationMessage = ''
      
      if (payload.sendNotification && populatedOrder) {
        const result = await whatsAppNotificationService.sendOrderCreatedNotification(populatedOrder)
        notificationSent = result.success
        notificationMessage = result.message || result.error || ''
      } else if (!payload.sendNotification) {
        notificationMessage = 'Notificação não solicitada'
      }

      return {
        order: newOrder,
        notificationSent,
        notificationMessage
      }

    } catch (error) {
      console.error('Erro ao criar pedido:', error)
      throw new Error('Não foi possível criar o pedido: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
    }
  }

  async sendOrderNotification(orderId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // Buscar pedido com dados populados
      const order = await Order.findById(orderId)
        .populate('user')
        .populate('store')
        .lean()

      if (!order) {
        return {
          success: false,
          error: 'Pedido não encontrado'
        }
      }

      // Enviar notificação de pedido criado
      const result = await whatsAppNotificationService.sendOrderCreatedNotification(order)
      
      return result

    } catch (error) {
      console.error('Erro ao enviar notificação do pedido:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  private async getOrCreateUser(phone?: string, name?: string) {
    // Se tem telefone e nome, buscar ou criar usuário específico
    if (phone && name) {
      let user = await User.findOne({ phone: phone })
      
      if (!user) {
        user = new User({
          name: name,
          email: `${phone}@cliente.com`,
          phone: phone
        })
        await user.save()
      }
      
      return user
    }
    
    // Caso contrário, usar usuário padrão do PDV
    let user = await User.findOne({ email: 'pdv@sistema.com' })
    if (!user) {
      user = new User({
        name: 'Cliente PDV',
        email: 'pdv@sistema.com',
        phone: '0000000000'
      })
      await user.save()
    }
    
    return user
  }
}

export const orderService = new OrderService()