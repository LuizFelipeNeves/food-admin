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

export default function HomePage() {
  const storeId = '67a05b53927e38337439322f';

  const { data: stats, isLoading: statsLoading } = trpc.dashboard.getStats.useQuery({
    storeId,
  });

  const { data: salesData, isLoading: salesLoading } = trpc.dashboard.getSalesChart.useQuery({
    storeId,
  });

  const { data: topProducts, isLoading: topProductsLoading } = trpc.dashboard.getTopProducts.useQuery({
    storeId,
  });

  const { data: systemStatus, isLoading: systemStatusLoading } = trpc.dashboard.getSystemStatus.useQuery({
    storeId,
  });

  const { data: ordersByCategory, isLoading: ordersByCategoryLoading } = trpc.dashboard.getOrdersByCategory.useQuery({
    storeId,
  });

  const { data: paymentMethods, isLoading: paymentMethodsLoading } = trpc.dashboard.getPaymentMethods.useQuery({
    storeId,
  });

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-2 sm:p-4 md:p-6 lg:p-8 pt-4 sm:pt-6 max-w-[2000px] mx-auto overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <h1 className="text-1xl sm:text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
          <div className="flex items-center space-x-2">
            <SeedButton />
            <GenerateDataButton storeId={storeId} />
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
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
                  <div className="text-lg xs:text-xl sm:text-2xl font-bold">
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
                  <div className="text-lg xs:text-xl sm:text-2xl font-bold">{stats?.dailyOrders ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.lastHourOrders ? `+${stats.lastHourOrders} pedidos` : 'Nenhum pedido'} na última hora
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <DeliveryStats averageDeliveryTime={stats?.averageDeliveryTime ?? 0} deliveryTimeChange={stats?.deliveryTimeChange ?? 0} />

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
                  <div className="text-lg xs:text-xl sm:text-2xl font-bold">{stats?.activeCustomers}</div>
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
              <Overview 
                data={salesData?.hourly ?? []} 
              />
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
                  {topProducts?.map((product) => (
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
                  {systemStatus?.map((item) => (
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
                  {ordersByCategory?.map((category) => (
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
                  {paymentMethods?.map((payment) => (
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