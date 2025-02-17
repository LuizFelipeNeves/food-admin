import 'dotenv/config'
import mongoose from 'mongoose'
import { Order } from '../models'

async function revert() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!)
    console.log('📦 Conectado ao MongoDB')

    await Order.updateMany(
      {},
      { 
        $unset: { 
          events: "",
          paymentStatus: "",
          deliveryFee: "",
          subtotal: ""
        }
      }
    )

    console.log('✨ Reversão concluída com sucesso!')
  } catch (error) {
    console.error('❌ Erro durante a reversão:', error)
  } finally {
    await mongoose.disconnect()
  }
}

revert()
