'use client'

import { Layout } from '@/components/layout/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const data = [
  {
    name: 'Jan',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Fev',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Mar',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Abr',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Mai',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Jun',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
]

const topProducts = [
  { name: 'X-Tudo', quantity: 150, revenue: 3000 },
  { name: 'X-Bacon', quantity: 120, revenue: 2400 },
  { name: 'X-Salada', quantity: 100, revenue: 1800 },
  { name: 'X-Egg', quantity: 80, revenue: 1400 },
  { name: 'Refrigerante', quantity: 200, revenue: 1000 },
]

export default function AnalyticsPage() {
  return (
    <Layout>
      <div className="flex flex-col h-full">
        <div className="p-4 md:p-8 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
              <p className="text-sm text-muted-foreground">
                Análise detalhada do seu negócio
              </p>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <div className="overflow-x-auto">
              <TabsList className="inline-flex min-w-fit w-full sm:w-auto">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="products">Produtos</TabsTrigger>
                <TabsTrigger value="customers">Clientes</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Receita Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ 45.231,89</div>
                    <p className="text-xs text-muted-foreground">
                      +20.1% em relação ao mês anterior
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pedidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+573</div>
                    <p className="text-xs text-muted-foreground">
                      +12% em relação ao mês anterior
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Ticket Médio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ 78,94</div>
                    <p className="text-xs text-muted-foreground">
                      +2% em relação ao mês anterior
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Novos Clientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+125</div>
                    <p className="text-xs text-muted-foreground">
                      +10% em relação ao mês anterior
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Receita Mensal</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data}>
                        <XAxis
                          dataKey="name"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `R$${value}`}
                        />
                        <Bar
                          dataKey="total"
                          fill="currentColor"
                          radius={[4, 4, 0, 0]}
                          className="fill-primary"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Produtos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {topProducts.map((product) => (
                      <div key={product.name} className="flex items-center">
                        <div className="space-y-1 flex-1">
                          <p className="text-sm font-medium leading-none">
                            {product.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {product.quantity} unidades vendidas
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium leading-none">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(product.revenue)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Receita
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                      <div className="flex items-center">
                        <div className="ml-4 space-y-1 flex-1">
                          <p className="text-sm font-medium leading-none">
                            João Silva
                          </p>
                          <p className="text-sm text-muted-foreground">
                            15 pedidos este mês
                          </p>
                        </div>
                        <div className="ml-auto font-medium">
                          R$ 450,00
                        </div>
                      </div>
                    </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  )
}
