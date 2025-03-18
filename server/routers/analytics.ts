import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { Order } from '@/models';
import { startOfDay, endOfDay, subDays, subMonths, format, startOfMonth, endOfMonth } from 'date-fns';
import mongoose from 'mongoose';
import { PAYMENT_METHOD_NAMES } from '@/constants/payments';
import { CacheService } from '../services/cache-service';

type PaymentMethodType = 'credit' | 'debit' | 'pix' | 'money' | 'vrRefeicao';

interface RevenueData {
  name: string;
  date: string;
  total: number;
}

interface CachedResponse<T> {
  data: T;
  timestamp: Date;
  fromCache: boolean;
}

export const analyticsRouter = router({
  // Obter dados de receita mensal para o gráfico
  getMonthlyRevenue: publicProcedure
    .input(z.object({
      storeId: z.string(),
      months: z.number().min(1).max(12).default(6), // Número de meses para buscar
    }))
    .query(async ({ input }): Promise<CachedResponse<RevenueData[]>> => {
      // Tentar obter do cache primeiro
      const cacheKey = {
        storeId: input.storeId,
        dataType: 'monthlyRevenue',
        params: { months: input.months }
      };

      const cachedData = await CacheService.getCache<RevenueData[]>(cacheKey);
      
      if (cachedData && typeof cachedData.data === "object") {
        return {
          data: cachedData.data,
          timestamp: cachedData.timestamp,
          fromCache: true
        };
      }

      // Se não estiver em cache, buscar dados frescos
      const now = new Date();
      const monthlyData: RevenueData[] = [];

      // Buscar dados para cada mês
      for (let i = 0; i < input.months; i++) {
        const targetMonth = subMonths(now, i);
        const startOfTargetMonth = startOfMonth(targetMonth);
        const endOfTargetMonth = endOfMonth(targetMonth);
        
        const monthData = await Order.aggregate([
          {
            $match: {
              store: new mongoose.Types.ObjectId(input.storeId),
              createdAt: { $gte: startOfTargetMonth, $lte: endOfTargetMonth },
              status: 'completed'
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$total' }
            }
          }
        ]);

        const monthName = format(targetMonth, 'MMM');
        const isoDate = format(targetMonth, 'yyyy-MM-dd');
        
        monthlyData.push({
          name: monthName,
          date: isoDate,
          total: monthData[0]?.total || 0
        });
      }

      // Inverter a ordem para que os meses mais antigos apareçam primeiro
      const result = monthlyData.reverse();
      
      // Salvar no cache
      await CacheService.setCache(cacheKey, result);
      
      return {
        data: result,
        timestamp: new Date(),
        fromCache: false
      };
    }),

  // Obter os produtos mais vendidos
  getTopProducts: publicProcedure
    .input(z.object({
      storeId: z.string(),
      limit: z.number().min(1).max(20).default(10), // Número de produtos para retornar
      period: z.enum(['day', 'week', 'month']).default('month'), // Período para análise
    }))
    .query(async ({ input }) => {
      // Tentar obter do cache primeiro
      const cacheKey = {
        storeId: input.storeId,
        dataType: 'topProducts',
        params: { 
          limit: input.limit,
          period: input.period
        }
      };

      const cachedData = await CacheService.getCache(cacheKey);
      
      if (cachedData && typeof cachedData.data === "object") {
        return {
          data: cachedData.data,
          timestamp: cachedData.timestamp,
          fromCache: true
        };
      }

      // Se não estiver em cache, buscar dados frescos
      const now = new Date();
      let startDate;
      
      // Determinar a data de início com base no período
      switch (input.period) {
        case 'day':
          startDate = startOfDay(now);
          break;
        case 'week':
          startDate = startOfDay(subDays(now, 7));
          break;
        case 'month':
        default:
          startDate = startOfMonth(now);
          break;
      }

      const topProducts = await Order.aggregate([
        {
          $match: {
            store: new mongoose.Types.ObjectId(input.storeId),
            createdAt: { $gte: startDate, $lte: endOfDay(now) },
            status: 'completed'
          }
        },
        {
          $unwind: '$items'
        },
        {
          $group: {
            _id: '$items._id',
            name: { $first: '$items.name' },
            quantity: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        {
          $sort: { revenue: -1 }
        },
        {
          $limit: input.limit
        }
      ]);

      // Salvar no cache
      await CacheService.setCache(cacheKey, topProducts);
      
      return {
        data: topProducts,
        timestamp: new Date(),
        fromCache: false
      };
    }),

  // Obter dados de clientes
  getCustomerStats: publicProcedure
    .input(z.object({
      storeId: z.string(),
      limit: z.number().min(1).max(20).default(10), // Número de clientes para retornar
    }))
    .query(async ({ input }) => {
      // Tentar obter do cache primeiro
      const cacheKey = {
        storeId: input.storeId,
        dataType: 'customerStats',
        params: { limit: input.limit }
      };

      const cachedData = await CacheService.getCache(cacheKey);
      
      if (cachedData && typeof cachedData.data === "object") {
        return {
          data: cachedData.data,
          timestamp: cachedData.timestamp,
          fromCache: true
        };
      }

      // Se não estiver em cache, buscar dados frescos
      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      
      // Buscar os clientes mais ativos (com mais pedidos)
      const topCustomers = await Order.aggregate([
        {
          $match: {
            store: new mongoose.Types.ObjectId(input.storeId),
            status: 'completed',
            user: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: '$user',
            customerName: { $first: '$customerName' },
            orderCount: { $sum: 1 },
            totalSpent: { $sum: '$total' },
            lastOrder: { $max: '$createdAt' }
          }
        },
        {
          $sort: { orderCount: -1 }
        },
        {
          $limit: input.limit
        }
      ]);

      // Calcular estatísticas gerais de clientes
      const [
        totalCustomers,
        newCustomers,
        returningCustomers
      ] = await Promise.all([
        // Total de clientes únicos
        Order.distinct('user', {
          store: new mongoose.Types.ObjectId(input.storeId),
          status: 'completed'
        }).then(users => users.length),
        
        // Novos clientes este mês
        Order.aggregate([
          {
            $match: {
              store: new mongoose.Types.ObjectId(input.storeId),
              user: { $exists: true, $ne: null }
            }
          },
          {
            $sort: { createdAt: 1 }
          },
          {
            $group: {
              _id: '$user',
              firstOrder: { $first: '$createdAt' }
            }
          },
          {
            $match: {
              firstOrder: { $gte: startOfCurrentMonth }
            }
          },
          {
            $count: 'count'
          }
        ]).then(result => result[0]?.count || 0),
        
        // Clientes recorrentes (mais de um pedido)
        Order.aggregate([
          {
            $match: {
              store: new mongoose.Types.ObjectId(input.storeId),
              user: { $exists: true, $ne: null }
            }
          },
          {
            $group: {
              _id: '$user',
              orderCount: { $sum: 1 }
            }
          },
          {
            $match: {
              orderCount: { $gt: 1 }
            }
          },
          {
            $count: 'count'
          }
        ]).then(result => result[0]?.count || 0)
      ]);

      const result = {
        topCustomers,
        stats: {
          totalCustomers,
          newCustomers,
          returningCustomers,
          retentionRate: totalCustomers > 0 
            ? Math.round((returningCustomers / totalCustomers) * 100) 
            : 0
        }
      };

      // Salvar no cache
      await CacheService.setCache(cacheKey, result);
      
      return {
        data: result,
        timestamp: new Date(),
        fromCache: false
      };
    }),

  // Obter dados de métodos de pagamento
  getPaymentMethodStats: publicProcedure
    .input(z.object({
      storeId: z.string(),
      period: z.enum(['day', 'week', 'month']).default('month'), // Período para análise
    }))
    .query(async ({ input }) => {
      // Tentar obter do cache primeiro
      const cacheKey = {
        storeId: input.storeId,
        dataType: 'paymentMethodStats',
        params: { period: input.period }
      };

      const cachedData = await CacheService.getCache(cacheKey);
      
      if (cachedData && typeof cachedData.data === "object") {
        return {
          data: cachedData.data,
          timestamp: cachedData.timestamp,
          fromCache: true
        };
      }

      // Se não estiver em cache, buscar dados frescos
      const now = new Date();
      let startDate;
      
      // Determinar a data de início com base no período
      switch (input.period) {
        case 'day':
          startDate = startOfDay(now);
          break;
        case 'week':
          startDate = startOfDay(subDays(now, 7));
          break;
        case 'month':
        default:
          startDate = startOfMonth(now);
          break;
      }

      const paymentMethods = await Order.aggregate([
        {
          $match: {
            store: new mongoose.Types.ObjectId(input.storeId),
            createdAt: { $gte: startDate, $lte: endOfDay(now) },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 },
            total: { $sum: '$total' }
          }
        },
        {
          $sort: { total: -1 }
        }
      ]);

      const totalOrders = paymentMethods.reduce((acc, curr) => acc + curr.count, 0);
      const totalRevenue = paymentMethods.reduce((acc, curr) => acc + curr.total, 0);

      const result = paymentMethods.map(method => {
        const methodId = method._id as PaymentMethodType;
        return {
          name: PAYMENT_METHOD_NAMES[methodId] || methodId,
          value: Math.round((method.count / totalOrders) * 100),
          total: method.total,
          percentage: Math.round((method.total / totalRevenue) * 100),
          count: method.count
        };
      });

      // Salvar no cache
      await CacheService.setCache(cacheKey, result);
      
      return {
        data: result,
        timestamp: new Date(),
        fromCache: false
      };
    })
}); 