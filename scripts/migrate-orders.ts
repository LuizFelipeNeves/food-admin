import 'dotenv/config'
import mongoose from 'mongoose'
import { Order } from '../models'
import { getStatusDescription } from '../utils/order-status'

async function migrate() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI!)
    console.log('📦 Conectado ao MongoDB')

    // Buscar todos os pedidos
    const orders = await Order.find({})
    console.log(`🔍 Encontrados ${orders.length} pedidos para migrar`)

    // Atualizar cada pedido
    for (const order of orders) {
      // Calcular valores
      const subtotal = order.total - (order.deliveryFee || 0)
      
      // Criar evento inicial se não existir
      const initialEvent = {
        date: order.createdAt,
        status: order.status,
        description: getStatusDescription(order.status)
      }

      // Atualizar o pedido com $set e $addToSet para garantir que o evento seja adicionado
      await Order.updateOne(
        { _id: order._id },
        { 
          $set: {
            paymentStatus: order.paymentStatus || 'pending',
            deliveryFee: order.deliveryFee || 0,
            subtotal: subtotal
          },
          $addToSet: {
            events: initialEvent
          }
        }
      )

      console.log(`✅ Pedido ${order._id} atualizado`)
    }

    console.log('✨ Migração concluída com sucesso!')
  } catch (error) {
    console.error('❌ Erro durante a migração:', error)
  } finally {
    await mongoose.disconnect()
    console.log('📦 Desconectado do MongoDB')
  }
}

// Executar migração
migrate()
