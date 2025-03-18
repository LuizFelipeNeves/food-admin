import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { Order } from '@/models';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import mongoose from 'mongoose';
import { PAYMENT_METHOD_NAMES } from '@/constants/payments';
import { CacheService } from '../services/cache-service';

type PaymentMethodType = 'credit' | 'debit' | 'pix' | 'money' | 'vrRefeicao';

interface CategoryData {
  _id: string;
  name: string;
  count: number;
}

interface PaymentData {
  _id: PaymentMethodType;
  count: number;
}

interface OrderStatus {
  completed: number;
  preparing: number;
  ready: number;
  pending: number;
}

interface HourlyData {
  name: string;
  total: number;
  subtotal: number;
  deliveryFees: number;
  orders: number;
  average: number;
  status: OrderStatus;
}

const methodNames = PAYMENT_METHOD_NAMES

export const dashboardRouter = router({
  getStats: publicProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input }) => {
      // Verificar cache primeiro
      const cacheKey = {
        storeId: input.storeId,
        dataType: 'dashboard.stats'
      };
      
      const cachedData = await CacheService.getCache(cacheKey);
      if (cachedData && typeof cachedData.data === "object") {
        return {
          ...cachedData.data,
          timestamp: cachedData.timestamp,
          fromCache: true
        };
      }
      
      const now = new Date();
      const startOfToday = startOfDay(now);
      const endOfToday = endOfDay(now);
      const startOfYesterday = startOfDay(subDays(now, 1));
      const endOfYesterday = endOfDay(subDays(now, 1));
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Buscar estatísticas do dia
      const [
        todaySales,
        todayOrders,
        yesterdaySales,
        activeCustomers,
        newCustomers,
        deliveryStats,
        lastHourOrders
      ] = await Promise.all([
        Order.aggregate([
          {
            $match: {
              store: new mongoose.Types.ObjectId(input.storeId),
              createdAt: { $gte: startOfToday, $lte: endOfToday },
              status: 'completed'
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$total' },
              subtotal: { $sum: '$subtotal' },
              deliveryFees: { $sum: '$deliveryFee' }
            }
          }
        ]),
        Order.countDocuments({
          store: new mongoose.Types.ObjectId(input.storeId),
          createdAt: { $gte: startOfToday, $lte: endOfToday }
        }),
        Order.aggregate([
          {
            $match: {
              store: new mongoose.Types.ObjectId(input.storeId),
              createdAt: { $gte: startOfYesterday, $lte: endOfYesterday },
              status: 'completed'
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$total' },
              subtotal: { $sum: '$subtotal' },
              deliveryFees: { $sum: '$deliveryFee' }
            }
          }
        ]),
        Order.distinct('user', {
          store: new mongoose.Types.ObjectId(input.storeId),
          createdAt: { $gte: startOfToday, $lte: endOfToday }
        }),
        Order.aggregate([
          {
            $match: {
              store: new mongoose.Types.ObjectId(input.storeId)
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
              firstOrder: { $gte: startOfToday }
            }
          }
        ]),
        // Estatísticas de entrega
        Order.aggregate([
          {
            $match: {
              store: new mongoose.Types.ObjectId(input.storeId),
              status: 'completed',
              deliveryTime: { $exists: true, $ne: null },
              createdAt: { $gte: startOfYesterday, $lte: endOfToday }
            }
          },
          {
            $project: {
              deliveryTime: 1,
              createdAt: 1,
              isToday: {
                $cond: [
                  { $gte: ['$createdAt', startOfToday] },
                  true,
                  false
                ]
              }
            }
          },
          {
            $group: {
              _id: '$isToday',
              averageDeliveryTime: { $avg: '$deliveryTime' },
              count: { $sum: 1 },
              orders: { $push: { deliveryTime: '$deliveryTime', createdAt: '$createdAt' } }
            }
          }
        ]),
        // Pedidos na última hora
        Order.countDocuments({
          store: new mongoose.Types.ObjectId(input.storeId),
          createdAt: { $gte: oneHourAgo }
        })
      ]);

      const todayTotal = todaySales[0]?.total || 0;
      const yesterdayTotal = yesterdaySales[0]?.total || 0;
      const salesGrowth = yesterdayTotal > 0 
        ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100 
        : 0;
      
      const todayStats = deliveryStats.find(stat => stat._id === true) || { averageDeliveryTime: 0, count: 0 };
      const yesterdayStats = deliveryStats.find(stat => stat._id === false) || { averageDeliveryTime: 0, count: 0 };

      const deliveryTimeChange = yesterdayStats.averageDeliveryTime > 0
        ? ((todayStats.averageDeliveryTime - yesterdayStats.averageDeliveryTime) / yesterdayStats.averageDeliveryTime) * 100
        : 0;

      // Salvar no cache e retornar
      const result = {
        dailySales: todayTotal,
        dailyOrders: todayOrders,
        salesGrowth,
        activeCustomers: activeCustomers.length,
        newCustomers: newCustomers.length,
        subtotal: todaySales[0]?.subtotal || 0,
        deliveryFees: todaySales[0]?.deliveryFees || 0,
        averageDeliveryTime: Math.round(todayStats.averageDeliveryTime || 0),
        deliveryTimeChange: Math.round(deliveryTimeChange),
        lastHourOrders,
        timestamp: new Date(),
        fromCache: false
      };
      
      await CacheService.setCache(cacheKey, result);
      return result;
    }),

  getSalesChart: publicProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input }) => {
      // Verificar cache primeiro
      const cacheKey = {
        storeId: input.storeId,
        dataType: 'dashboard.salesChart'
      };
      
      const cachedData = await CacheService.getCache(cacheKey);
      if (cachedData && typeof cachedData.data === "object") {
        return {
          ...cachedData.data,
          timestamp: cachedData.timestamp,
          fromCache: true
        };
      }
      
      const now = new Date();
      const startOfToday = startOfDay(now);
      const endOfToday = endOfDay(now);
      const currentHour = now.getHours();

      const salesByHour = await Order.aggregate([
        {
          $match: {
            store: new mongoose.Types.ObjectId(input.storeId),
            createdAt: { $gte: startOfToday, $lte: endOfToday },
            status: { $in: ['completed', 'preparing', 'ready', 'pending'] }
          }
        },
        {
          $addFields: {
            // Converter para hora local
            localHour: {
              $hour: {
                date: '$createdAt',
                timezone: 'America/Sao_Paulo'
              }
            }
          }
        },
        {
          $group: {
            _id: '$localHour',
            total: { $sum: '$total' },
            subtotal: { $sum: '$subtotal' },
            deliveryFees: { $sum: '$deliveryFee' },
            orders: { $sum: 1 },
            // Calcular valores por status
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            preparing: {
              $sum: { $cond: [{ $eq: ['$status', 'preparing'] }, 1, 0] }
            },
            ready: {
              $sum: { $cond: [{ $eq: ['$status', 'ready'] }, 1, 0] }
            },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            _id: 0,
            hour: '$_id',
            total: 1,
            subtotal: 1,
            deliveryFees: 1,
            orders: 1,
            completed: 1,
            preparing: 1,
            ready: 1,
            pending: 1
          }
        },
        {
          $sort: { hour: 1 }
        }
      ]);

      // Preencher todas as horas do dia até a hora atual
      const salesData: HourlyData[] = Array.from({ length: currentHour + 1 }, (_, hour) => {
        const hourData = salesByHour.find((sale: any) => sale.hour === hour);
        const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
        
        return {
          name: hourLabel,
          total: hourData?.total || 0,
          subtotal: hourData?.subtotal || 0,
          deliveryFees: hourData?.deliveryFees || 0,
          orders: hourData?.orders || 0,
          average: hourData?.orders ? Math.round(hourData.total / hourData.orders) : 0,
          status: {
            completed: hourData?.completed || 0,
            preparing: hourData?.preparing || 0,
            ready: hourData?.ready || 0,
            pending: hourData?.pending || 0
          }
        };
      });

      // Calcular totais e médias
      const totals = salesData.reduce((acc, curr) => ({
        orders: acc.orders + curr.orders,
        revenue: acc.revenue + curr.total,
        completed: acc.completed + curr.status.completed,
        preparing: acc.preparing + curr.status.preparing,
        ready: acc.ready + curr.status.ready,
        pending: acc.pending + curr.status.pending
      }), { 
        orders: 0,
        revenue: 0,
        completed: 0,
        preparing: 0,
        ready: 0,
        pending: 0
      });

      // Encontrar hora de pico
      const peakHour = salesData.reduce((peak, curr) => {
        return curr.orders > (peak?.orders || 0) ? curr : peak;
      }, salesData[0]);

      // Salvar no cache e retornar
      const result = {
        hourly: salesData,
        summary: {
          totalOrders: totals.orders,
          totalRevenue: totals.revenue,
          averageTicket: totals.orders ? Math.round(totals.revenue / totals.orders) : 0,
          peakHour: peakHour?.name || '00:00',
          status: {
            completed: totals.completed,
            preparing: totals.preparing,
            ready: totals.ready,
            pending: totals.pending
          }
        },
        timestamp: new Date(),
        fromCache: false
      };
      
      await CacheService.setCache(cacheKey, result);
      return result;
    }),

  getTopProducts: publicProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input }) => {
      // Verificar cache primeiro
      const cacheKey = {
        storeId: input.storeId,
        dataType: 'dashboard.topProducts'
      };
      
      const cachedData = await CacheService.getCache(cacheKey);
      if (cachedData && typeof cachedData.data === "object") {
        return {
          data: cachedData.data,
          timestamp: cachedData.timestamp,
          fromCache: true
        };
      }
      
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);

      const topItems = await Order.aggregate([
        {
          $match: {
            store: new mongoose.Types.ObjectId(input.storeId),
            createdAt: { $gte: startOfToday, $lte: endOfToday },
            status: 'completed'
          }
        },
        {
          $unwind: '$items'
        },
        {
          $project: {
            itemId: '$items._id',
            name: '$items.name',
            quantity: '$items.quantity',
            price: '$items.price',
            additionals: {
              $reduce: {
                input: '$items.additionals',
                initialValue: 0,
                in: { $add: ['$$value', '$$this.price'] }
              }
            }
          }
        },
        {
          $group: {
            _id: '$itemId',
            name: { $first: '$name' },
            quantity: { $sum: '$quantity' },
            revenue: {
              $sum: {
                $multiply: [
                  { $add: ['$price', '$additionals'] },
                  '$quantity'
                ]
              }
            }
          }
        },
        {
          $sort: { revenue: -1 }
        },
        {
          $limit: 4
        }
      ]);

      // Salvar no cache e retornar
      const result = {
        data: topItems,
        timestamp: new Date(),
        fromCache: false
      };
      
      await CacheService.setCache(cacheKey, result);
      return result;
    }),

  getSystemStatus: publicProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input }) => {
      // Verificar cache primeiro
      const cacheKey = {
        storeId: input.storeId,
        dataType: 'dashboard.systemStatus'
      };
      
      const cachedData = await CacheService.getCache(cacheKey);
      if (cachedData && typeof cachedData.data === "object") {
        return {
          data: cachedData.data,
          timestamp: cachedData.timestamp,
          fromCache: true
        };
      }
      
      // Dados simulados para status do sistema
      const systemStatus = [
        { name: 'API', status: 'online' },
        { name: 'Banco de Dados', status: 'online' },
        { name: 'Processamento de Pagamentos', status: 'online' },
        { name: 'Serviço de Notificações', status: 'online' }
      ];
      
      // Salvar no cache e retornar
      const result = {
        data: systemStatus,
        timestamp: new Date(),
        fromCache: false
      };
      
      await CacheService.setCache(cacheKey, result);
      return result;
    }),

  getOrdersByCategory: publicProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input }) => {
      // Verificar cache primeiro
      const cacheKey = {
        storeId: input.storeId,
        dataType: 'dashboard.ordersByCategory'
      };
      
      const cachedData = await CacheService.getCache(cacheKey);
      if (cachedData && typeof cachedData.data === "object") {
        return {
          data: cachedData.data,
          timestamp: cachedData.timestamp,
          fromCache: true
        };
      }
      
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);

      const ordersByCategory = await Order.aggregate([
        {
          $match: {
            store: new mongoose.Types.ObjectId(input.storeId),
            createdAt: { $gte: startOfToday, $lte: endOfToday },
            status: 'completed'
          }
        },
        {
          $unwind: '$items'
        },
        {
          $lookup: {
            from: 'items',
            let: { 
              itemId: '$items._id',
              store: '$store'
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', { $toObjectId: '$$itemId' }] },
                      { $eq: ['$store', '$$store'] }
                    ]
                  }
                }
              }
            ],
            as: 'item'
          }
        },
        {
          $unwind: '$item'
        },
        {
          $lookup: {
            from: 'categories',
            let: { 
              categoryId: '$item.category',
              store: '$store'
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$categoryId'] },
                      { $eq: ['$store', '$$store'] }
                    ]
                  }
                }
              }
            ],
            as: 'category'
          }
        },
        {
          $unwind: '$category'
        },
        {
          $group: {
            _id: {
              categoryId: '$category._id',
              orderId: '$_id'
            },
            name: { $first: '$category.name' },
            total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        {
          $group: {
            _id: '$_id.categoryId',
            name: { $first: '$name' },
            count: { $sum: 1 },
            total: { $sum: '$total' }
          }
        },
        {
          $sort: { total: -1 }
        }
      ]);

      const totalOrders = ordersByCategory.reduce((acc: number, curr: CategoryData) => acc + curr.count, 0);
      const totalRevenue = ordersByCategory.reduce((acc: number, curr: any) => acc + curr.total, 0);
      
      const categories = ordersByCategory.map((category: any) => ({
        name: category.name,
        value: Math.round((category.count / totalOrders) * 100),
        total: category.total,
        percentage: Math.round((category.total / totalRevenue) * 100)
      }));
      
      // Salvar no cache e retornar
      const result = {
        data: categories,
        timestamp: new Date(),
        fromCache: false
      };
      
      await CacheService.setCache(cacheKey, result);
      return result;
    }),

  getPaymentMethods: publicProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input }) => {
      // Verificar cache primeiro
      const cacheKey = {
        storeId: input.storeId,
        dataType: 'dashboard.paymentMethods'
      };
      
      const cachedData = await CacheService.getCache(cacheKey);
      if (cachedData && typeof cachedData.data === "object") {
        return {
          data: cachedData.data,
          timestamp: cachedData.timestamp,
          fromCache: true
        };
      }
      
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);

      const paymentMethods = await Order.aggregate([
        {
          $match: {
            store: new mongoose.Types.ObjectId(input.storeId),
            createdAt: { $gte: startOfToday, $lte: endOfToday },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 },
            total: { $sum: '$total' },
            subtotal: { $sum: '$subtotal' },
            deliveryFees: { $sum: '$deliveryFee' }
          }
        },
        {
          $sort: { total: -1 }
        }
      ]);

      const totalOrders = paymentMethods.reduce((acc: number, curr: PaymentData) => acc + curr.count, 0);
      const totalRevenue = paymentMethods.reduce((acc: number, curr: any) => acc + curr.total, 0);

      const methods = paymentMethods.map((method: any) => {
        const methodId = method._id as PaymentMethodType;
        return {
          name: methodNames[methodId] || methodId,
          value: Math.round((method.count / totalOrders) * 100),
          total: method.total,
          percentage: Math.round((method.total / totalRevenue) * 100),
          subtotal: method.subtotal,
          deliveryFees: method.deliveryFees
        };
      });
      
      // Salvar no cache e retornar
      const result = {
        data: methods,
        timestamp: new Date(),
        fromCache: false
      };
      
      await CacheService.setCache(cacheKey, result);
      return result;
    })
}); 