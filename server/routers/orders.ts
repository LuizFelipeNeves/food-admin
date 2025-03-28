import { publicProcedure, router } from '../trpc'
import { Order } from '@/models'
import { IOrder } from '@/types/order'
import { getStatusDescription } from '@/utils/order-status'
import { z } from 'zod'
import { startOfDay, endOfDay, subDays, differenceInMinutes } from 'date-fns'
import mongoose from 'mongoose'
import { TRPCError } from '@trpc/server'

export const ordersRouter = router({
  getAll: publicProcedure
    .input(z.object({
      customerName: z.string().optional(),
      date: z.date().or(z.string().transform(val => new Date(val))).optional(),
      paymentStatus: z.string().optional(),
      paymentMethod: z.string().optional(),
      orderStatus: z.string().optional(),
      page: z.number().default(1),
      perPage: z.number().default(10),
      storeId: z.string().min(1, 'ID da loja é obrigatório'),
    }))
    .query(async ({ input }) => {
      try {
        if (!input.storeId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'ID da loja é obrigatório',
          });
        }

        const now = new Date()
        const startOfYesterday = startOfDay(subDays(now, 1))
        const endOfToday = endOfDay(now)

        // Construir o filtro base
        const filter: any = {
          store: new mongoose.Types.ObjectId(input.storeId),
          createdAt: { 
            $gte: startOfYesterday,
            $lte: endOfToday 
          }
        }

        // Adicionar filtros condicionais
        if (input.customerName) {
          filter['user.name'] = { $regex: input.customerName, $options: 'i' }
        }

        if (input.date) {
          const startOfDate = startOfDay(new Date(input.date))
          const endOfDate = endOfDay(new Date(input.date))
          filter.createdAt = {
            $gte: startOfDate,
            $lte: endOfDate
          }
        }

        if (input.paymentStatus) {
          filter.paymentStatus = input.paymentStatus
        }

        if (input.paymentMethod) {
          filter.paymentMethod = input.paymentMethod
        }

        if (input.orderStatus) {
          filter.status = input.orderStatus
        }

        // Calcular skip para paginação
        const skip = (input.page - 1) * input.perPage

        // Buscar total de registros
        const total = await Order.countDocuments(filter)

        // Buscar pedidos com paginação
        const orders = await Order.find(filter)
          .populate('user')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(input.perPage)
          .lean()

        return {
          data: orders,
          pagination: {
            total,
            page: input.page,
            perPage: input.perPage,
            pageCount: Math.ceil(total / input.perPage)
          }
        }
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error)
        throw new Error('Não foi possível carregar os pedidos')
      }
    }),

  getStats: publicProcedure
    .input(z.object({
      storeId: z.string().min(1, 'ID da loja é obrigatório'),
    }))
    .query(async ({ input }) => {
      try {
        if (!input.storeId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'ID da loja é obrigatório',
          });
        }

        const filter = { store: new mongoose.Types.ObjectId(input.storeId) };
        const [totalOrders, pendingOrders, completedOrders, totalRevenue] = await Promise.all([
          Order.countDocuments(filter),
          Order.countDocuments({ ...filter, status: 'pending' }),
          Order.countDocuments({ ...filter, status: 'completed' }),
          Order.aggregate([
            {
              $match: { 
                ...filter,
                status: 'completed' 
              }
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

  getKanbanOrders: publicProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const now = new Date()
        const startOfYesterday = startOfDay(subDays(now, 1))
        const endOfToday = endOfDay(now)

        const orders = await Order.find({
          store: new mongoose.Types.ObjectId(input.storeId),
          createdAt: { 
            $gte: startOfYesterday,
            $lte: endOfToday 
          }
        })
          .populate('user', 'name phone email')
          .sort({ createdAt: -1 })
          .lean()

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
        const order = await Order.findById(input.orderId)
        if (!order) {
          throw new Error('Pedido não encontrado')
        }

        const previousStatus = order.status

        const newEvent = {
          date: new Date(),
          status: input.status,
          description: getStatusDescription(input.status)
        }

        const updateData: any = {
          status: input.status,
          $push: { events: newEvent }
        }

        // Calcula o tempo de entrega quando o status for completed
        if (input.status === 'completed') {
          const deliveryTime = differenceInMinutes(new Date(), order.createdAt)
          updateData.deliveryTime = deliveryTime
        }

        const updatedOrder = await Order.findByIdAndUpdate(
          input.orderId,
          updateData,
          { new: true }
        )
        .populate('user')
        .lean()

        // Retorna o pedido atualizado para atualizar o cache
        return {
          previousStatus,
          order: updatedOrder
        }
      } catch (error) {
        console.error('Erro ao atualizar status do pedido:', error)
        throw new Error('Não foi possível atualizar o status do pedido')
      }
    }),

    editOrder: publicProcedure
    .input(z.object({
      orderId: z.string(),
      paymentStatus: z.string(),
      paymentMethod: z.string(),
      observation: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const order = await Order.findById<IOrder>(input.orderId).lean()

        if (!order) {
          throw new Error('Pedido não encontrado')
        }

        const changes = [];

        if (order.paymentStatus !== input.paymentStatus) {
          changes.push(`Status de pagamento alterado de ${order.paymentStatus} para ${input.paymentStatus}`);
        }

        if (order.paymentMethod !== input.paymentMethod) {
          changes.push(`Método de pagamento alterado de ${order.paymentMethod} para ${input.paymentMethod}`);
        }

        if (order.observation !== input.observation) {
          changes.push(`Observação alterada de "${order.observation}" para "${input.observation}"`);
        }

        const newEvents = changes.map(change => ({
          date: new Date(),
          description: change,
        }));

        const updatedOrder = await Order.findByIdAndUpdate(
          input.orderId,
          {
            $set: {
              paymentStatus: input.paymentStatus,
              paymentMethod: input.paymentMethod,
              observation: input.observation,
            },
            $push: { events: { $each: newEvents } },
          },
          { new: true }
        )
        .populate('user')
        .lean()

        return updatedOrder
      } catch (error) {
        console.error('Erro ao editar o pedido:', error)
        throw new Error('Não foi possível editar o pedido')
      }
    }),
})
