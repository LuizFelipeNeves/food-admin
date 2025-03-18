'use client'

import { Layout } from '@/components/layout/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Users,
  TrendingUp,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { trpc } from './_trpc/client'
import { Skeleton } from '@/components/ui/skeleton'
import { Overview } from '@/components/dashboard/overview'
import { SeedButton } from '@/components/dashboard/seed-button'
import { GenerateDataButton } from '@/components/dashboard/generate-data-button'
import { DeliveryStats } from '@/components/dashboard/delivery-stats'
import { useState } from 'react'
import { CacheIndicator } from '@/components/ui/cache-indicator'

export default function HomePage() {
  const storeId = '67a05b53927e38337439322f';
  const [refreshing, setRefreshing] = useState(false);
  const [dataTimestamps, setDataTimestamps] = useState<{
    stats?: { time: Date; fromCache: boolean };
    sales?: { time: Date; fromCache: boolean };
    products?: { time: Date; fromCache: boolean };
    system?: { time: Date; fromCache: boolean };
    categories?: { time: Date; fromCache: boolean };
    payments?: { time: Date; fromCache: boolean };
  }>({});

  const { data: statsResponse, isLoading: statsLoading, refetch: refetchStats } = trpc.dashboard.getStats.useQuery({
    storeId,
  }, {
    onSuccess: (data: any) => {
      if (data) {
        setDataTimestamps(prev => ({
          ...prev,
          stats: { 
            time: new Date(data.timestamp || Date.now()), 
            fromCache: !!data.fromCache 
          }
        }));
      }
    }
  });

  const { data: salesResponse, isLoading: salesLoading, refetch: refetchSales } = trpc.dashboard.getSalesChart.useQuery({
    storeId,
  }, {
    onSuccess: (data: any) => {
      if (data) {
        setDataTimestamps(prev => ({
          ...prev,
          sales: { 
            time: new Date(data.timestamp || Date.now()), 
            fromCache: !!data.fromCache 
          }
        }));
      }
    }
  });

  const { data: topProductsResponse, isLoading: topProductsLoading, refetch: refetchProducts } = trpc.dashboard.getTopProducts.useQuery({
    storeId,
  }, {
    onSuccess: (data: any) => {
      if (data) {
        setDataTimestamps(prev => ({
          ...prev,
          products: { 
            time: new Date(data.timestamp || Date.now()), 
            fromCache: !!data.fromCache 
          }
        }));
      }
    }
  });

  const { data: systemStatusResponse, isLoading: systemStatusLoading, refetch: refetchSystem } = trpc.dashboard.getSystemStatus.useQuery({
    storeId,
  }, {
    onSuccess: (data: any) => {
      if (data) {
        setDataTimestamps(prev => ({
          ...prev,
          system: { 
            time: new Date(data.timestamp || Date.now()), 
            fromCache: !!data.fromCache 
          }
        }));
      }
    }
  });

  const { data: ordersByCategoryResponse, isLoading: ordersByCategoryLoading, refetch: refetchCategories } = trpc.dashboard.getOrdersByCategory.useQuery({
    storeId,
  }, {
    onSuccess: (data: any) => {
      if (data) {
        setDataTimestamps(prev => ({
          ...prev,
          categories: { 
            time: new Date(data.timestamp || Date.now()), 
            fromCache: !!data.fromCache 
          }
        }));
      }
    }
  });

  const { data: paymentMethodsResponse, isLoading: paymentMethodsLoading, refetch: refetchPayments } = trpc.dashboard.getPaymentMethods.useQuery({
    storeId,
  }, {
    onSuccess: (data: any) => {
      if (data) {
        setDataTimestamps(prev => ({
          ...prev,
          payments: { 
            time: new Date(data.timestamp || Date.now()), 
            fromCache: !!data.fromCache 
          }
        }));
      }
    }
  });

  // Extrair os dados das respostas
  const stats = statsResponse;
  const salesData = salesResponse;
  const topProducts = topProductsResponse?.data || [];
  const systemStatus = systemStatusResponse?.data || [];
  const ordersByCategory = ordersByCategoryResponse?.data || [];
  const paymentMethods = paymentMethodsResponse?.data || [];

  // Função para atualizar todos os dados
  const refreshAllData = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchStats(),
      refetchSales(),
      refetchProducts(),
      refetchSystem(),
      refetchCategories(),
      refetchPayments()
    ]);
    setRefreshing(false);
  };

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-2 sm:p-4 md:p-6 lg:p-8 pt-4 sm:pt-6 max-w-[2000px] mx-auto overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            <CacheIndicator 
              dataTimestamps={dataTimestamps}
              refreshing={refreshing}
              onRefresh={refreshAllData}
              ttl={20}
            />
            
            <div className="flex items-center space-x-2">
              <SeedButton />
              <GenerateDataButton storeId={storeId} />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="dark:border-muted">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vendas do Dia
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-4">
              {statsLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">
                    R$ {stats?.dailySales.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(stats?.salesGrowth ?? 0) > 0 ? '+' : ''}{(stats?.salesGrowth ?? 0).toFixed(1)}% em relação a ontem
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="dark:border-muted">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pedidos Hoje
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-4">
              {statsLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats?.dailyOrders ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.lastHourOrders ? `+${stats.lastHourOrders} pedidos` : 'Nenhum pedido'} na última hora
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <DeliveryStats 
            averageDeliveryTime={stats?.averageDeliveryTime ?? 0} 
            deliveryTimeChange={stats?.deliveryTimeChange ?? 0} 
          />

          <Card className="dark:border-muted">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Clientes Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-4">
              {statsLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats?.activeCustomers}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats?.newCustomers} novos hoje
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-7">
          <Card className="col-span-full lg:col-span-4 dark:border-muted">
            <CardHeader className="pb-4">
              <CardTitle>Vendas por Hora</CardTitle>
              <div className="text-xs text-muted-foreground">
                Status: {salesLoading ? 'Carregando...' : (salesData?.hourly ? 'Dados disponíveis' : 'Sem dados')}
              </div>
            </CardHeader>
            <CardContent>
              {salesLoading ? (
                <Skeleton className="h-[350px] w-full" />
              ) : (
                <Overview 
                  data={salesData?.hourly && Array.isArray(salesData.hourly) && salesData.hourly.length > 0 
                    ? salesData.hourly.map((item: any) => ({
                        ...item,
                        total: typeof item.total === 'number' ? item.total : 0,
                        subtotal: typeof item.subtotal === 'number' ? item.subtotal : 0,
                        deliveryFees: typeof item.deliveryFees === 'number' ? item.deliveryFees : 0,
                        orders: typeof item.orders === 'number' ? item.orders : 0,
                        average: typeof item.average === 'number' ? item.average : 0,
                        status: {
                          completed: typeof item.status?.completed === 'number' ? item.status.completed : 0,
                          preparing: typeof item.status?.preparing === 'number' ? item.status.preparing : 0,
                          ready: typeof item.status?.ready === 'number' ? item.status.ready : 0,
                          pending: typeof item.status?.pending === 'number' ? item.status.pending : 0
                        }
                      }))
                    : []
                  } 
                />
              )}
            </CardContent>
          </Card>

          <Card className="col-span-full lg:col-span-3 dark:border-muted">
            <CardHeader className="pb-4">
              <CardTitle>Produtos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {topProductsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(topProducts) && topProducts.map((product: any) => (
                    <div key={product._id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.quantity} unidades
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        R$ {product.revenue.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="dark:border-muted">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium">
                Status do Sistema
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400" />
            </CardHeader>
            <CardContent className="pb-4">
              {systemStatusLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {Array.isArray(systemStatus) && systemStatus.map((item: any) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <p className="text-sm">{item.name}</p>
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400 mr-2" />
                        <span className="text-xs sm:text-sm">Online</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="dark:border-muted">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium">
                Pedidos por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {ordersByCategoryLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {Array.isArray(ordersByCategory) && ordersByCategory.map((category: any) => (
                    <div key={category.name} className="flex items-center justify-between gap-2">
                      <p className="text-sm min-w-[80px]">{category.name}</p>
                      <div className="flex items-center gap-2 flex-1">
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${category.value}%` }}
                          />
                        </div>
                        <span className="text-xs sm:text-sm font-medium tabular-nums w-[40px] text-right">
                          {category.value}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="dark:border-muted">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium">
                Formas de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {paymentMethodsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {Array.isArray(paymentMethods) && paymentMethods.map((payment: any) => (
                    <div key={payment.name} className="flex items-center justify-between gap-2">
                      <p className="text-sm min-w-[80px] truncate">{payment.name}</p>
                      <div className="flex items-center gap-2 flex-1">
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${payment.value}%` }}
                          />
                        </div>
                        <span className="text-xs sm:text-sm font-medium tabular-nums w-[40px] text-right">
                          {payment.value}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}