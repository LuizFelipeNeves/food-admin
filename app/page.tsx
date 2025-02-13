'use client'

import { Layout } from '@/components/layout/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Users,
  TrendingUp,
  Utensils,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { CustomTooltip } from '@/components/dashboard/custom-tooltip'

const salesData = [
  { name: '14:00', value: 1200 },
  { name: '15:00', value: 900 },
  { name: '16:00', value: 600 },
  { name: '17:00', value: 1500 },
  { name: '18:00', value: 2100 },
  { name: '19:00', value: 2800 },
  { name: '20:00', value: 3200 },
  { name: '21:00', value: 2700 },
  { name: '22:00', value: 1800 },
]

const topProducts = [
  { name: 'X-Tudo', quantity: 145, revenue: 2900 },
  { name: 'Açaí 500ml', quantity: 121, revenue: 1815 },
  { name: 'Pizza Grande', quantity: 98, revenue: 2940 },
  { name: 'Refrigerante 2L', quantity: 87, revenue: 783 },
]

export default function HomePage() {
  return (
    <Layout>
      <div className="flex-1 space-y-4 p-2 sm:p-4 md:p-6 lg:p-8 pt-4 sm:pt-6 max-w-[2000px] mx-auto overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <h1 className="text-1xl sm:text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
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
              <div className="text-lg xs:text-xl sm:text-2xl font-bold">R$ 18.435</div>
              <p className="text-xs text-muted-foreground">
                +20.1% em relação a ontem
              </p>
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
              <div className="text-lg xs:text-xl sm:text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">
                +12 pedidos na última hora
              </p>
            </CardContent>
          </Card>

          <Card className="dark:border-muted">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tempo Médio de Entrega
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-lg xs:text-xl sm:text-2xl font-bold">28 min</div>
              <p className="text-xs text-muted-foreground">
                -2 min em relação a ontem
              </p>
            </CardContent>
          </Card>

          <Card className="dark:border-muted">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Clientes Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-lg xs:text-xl sm:text-2xl font-bold">573</div>
              <p className="text-xs text-muted-foreground">
                +48 novos hoje
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-7">
          <Card className="col-span-full lg:col-span-4 dark:border-muted">
            <CardHeader className="pb-4">
              <CardTitle>Vendas por Hora</CardTitle>
            </CardHeader>
            <CardContent className="pl-0 sm:pl-2 pb-4">
              <div className="h-[280px] xs:h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData} margin={{ left: -25 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="name"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `R$ ${value}`}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                    />
                    <Bar
                      dataKey="value"
                      radius={[4, 4, 0, 0]}
                      className="fill-primary"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-full lg:col-span-3 dark:border-muted">
            <CardHeader className="pb-4">
              <CardTitle>Produtos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-4 sm:space-y-6">
                {topProducts.map((product) => (
                  <div key={product.name} className="flex items-center">
                    <Utensils className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="ml-4 space-y-1 flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {product.name}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {product.quantity} unidades
                      </p>
                    </div>
                    <div className="text-right text-sm font-medium tabular-nums shrink-0">
                      R$ {product.revenue}
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="space-y-3 sm:space-y-4">
                {[
                  { name: 'Impressora Fiscal', status: 'online' },
                  { name: 'Integração Delivery', status: 'online' },
                  { name: 'Gateway de Pagamento', status: 'online' },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <p className="text-sm">{item.name}</p>
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400 mr-2" />
                      <span className="text-xs sm:text-sm">Online</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="dark:border-muted">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium">
                Pedidos por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-3 sm:space-y-4">
                {[
                  { name: 'Lanches', value: 42 },
                  { name: 'Bebidas', value: 28 },
                  { name: 'Pizzas', value: 18 },
                  { name: 'Sobremesas', value: 12 },
                ].map((category) => (
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
            </CardContent>
          </Card>

          <Card className="dark:border-muted">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium">
                Formas de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-3 sm:space-y-4">
                {[
                  { name: 'Cartão de Crédito', value: 45 },
                  { name: 'PIX', value: 35 },
                  { name: 'Dinheiro', value: 15 },
                  { name: 'Vale Refeição', value: 5 },
                ].map((payment) => (
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
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}