import { publicProcedure, router } from '../trpc'
import { Order } from '@/models'
import { getStatusDescription } from '@/utils/order-status'
import { z } from 'zod'

export const ordersRouter = router({
  getAll: publicProcedure.query(async () => {
    try {
      const orders = await Order.find()
        .populate('user')
        .sort({ createdAt: -1 })
        .lean()

      return orders
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
      throw new Error('Não foi possível carregar os pedidos')
    }
  }),

  getStats: publicProcedure.query(async () => {
    try {
      const [totalOrders, pendingOrders, completedOrders, totalRevenue] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments({ status: 'completed' }),
        Order.aggregate([
          {
            $match: { status: 'completed' }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$total' }
            }
          }
        ])
      ])

      return {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      throw new Error('Não foi possível carregar as estatísticas')
    }
  }),

  getKanbanOrders: publicProcedure.query(async () => {
    try {
      const orders = await Order.find()
        .populate('user', 'name phone email')
        .sort({ createdAt: -1 })
        .lean()

      console.log(orders)

      return orders
    } catch (error) {
      console.log(error)
      console.error('Erro ao buscar pedidos do kanban:', error)
      throw new Error('Não foi possível carregar os pedidos')
    }
  }),

  updateStatus: publicProcedure
    .input(z.object({
      orderId: z.string(),
      status: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        const newEvent = {
          date: new Date(),
          status: input.status,
          description: getStatusDescription(input.status)
        }

        const updatedOrder = await Order.findByIdAndUpdate(
          input.orderId,
          {
            $set: { status: input.status },
            $push: { events: newEvent }
          },
          { new: true }
        )
        .populate('user')
        .lean()

        return updatedOrder
      } catch (error) {
        console.error('Erro ao atualizar status do pedido:', error)
        throw new Error('Não foi possível atualizar o status do pedido')
      }
    })
})
