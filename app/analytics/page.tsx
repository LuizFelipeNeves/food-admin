'use client'

import { Layout } from '@/components/layout/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { useState, useEffect } from 'react'
import { trpc } from '@/app/_trpc/client'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Importação dinâmica dos componentes de gráfico
const DynamicRevenueChart = dynamic(
  () => import('@/components/analytics/revenue-chart'),
  { 
    ssr: false, 
    loading: () => <Skeleton className="h-[240px] w-full" /> 
  }
);

const DynamicPieChart = dynamic(
  () => import('@/components/ui/pie-chart'),
  { 
    ssr: false, 
    loading: () => <Skeleton className="h-[300px] w-full" /> 
  }
);

// Configuração de cores para os métodos de pagamento
const paymentMethodColors = {
  'Cartão de Crédito': '#4f46e5', // Indigo
  'Cartão de Débito': '#0ea5e9', // Sky
  'PIX': '#10b981', // Emerald
  'Dinheiro': '#f59e0b', // Amber
  'Vale Refeição': '#ec4899', // Pink
  'Outros': '#6b7280', // Gray
};

export default function AnalyticsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('month');
  const storeId = '67a05b53927e38337439322f'

  // Buscar dados de receita mensal
  const { data: revenueData, isLoading: isLoadingRevenue } = trpc.analytics.getMonthlyRevenue.useQuery({
    storeId,
    months: 6
  }, {
    enabled: !!storeId && isMounted
  });

  // Buscar dados de produtos mais vendidos
  const { data: topProductsData, isLoading: isLoadingProducts } = trpc.analytics.getTopProducts.useQuery({
    storeId,
    limit: 5,
    period: selectedPeriod
  }, {
    enabled: !!storeId && isMounted
  });

  // Buscar dados de clientes
  const { data: customerData, isLoading: isLoadingCustomers } = trpc.analytics.getCustomerStats.useQuery({
    storeId,
    limit: 5
  }, {
    enabled: !!storeId && isMounted
  });

  // Buscar dados de métodos de pagamento
  const { data: paymentMethodData, isLoading: isLoadingPayments } = trpc.analytics.getPaymentMethodStats.useQuery({
    storeId,
    period: selectedPeriod
  }, {
    enabled: !!storeId && isMounted
  });

  // Calcular totais
  const totalRevenue = revenueData?.reduce((acc: number, item: { total: number }) => acc + item.total, 0) || 0;
  const totalOrders = topProductsData?.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0) || 0;
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Preparar dados para o gráfico de pizza
  const pieChartData = paymentMethodData?.map(method => ({
    name: method.name,
    value: method.percentage
  })) || [];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Função para formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Função para formatar datas
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

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
                    {isLoadingRevenue ? (
                      <Skeleton className="h-8 w-32" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">
                          Últimos 6 meses
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pedidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingProducts ? (
                      <Skeleton className="h-8 w-32" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground">
                          No período selecionado
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Ticket Médio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingRevenue || isLoadingProducts ? (
                      <Skeleton className="h-8 w-32" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{formatCurrency(averageTicket)}</div>
                        <p className="text-xs text-muted-foreground">
                          No período selecionado
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Novos Clientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingCustomers ? (
                      <Skeleton className="h-8 w-32" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">+{customerData?.stats.newCustomers || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          Este mês
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Receita Mensal</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    {isMounted ? (
                      isLoadingRevenue ? (
                        <Skeleton className="h-[240px] w-full" />
                      ) : (
                        <DynamicRevenueChart 
                          data={Array.isArray(revenueData) && revenueData.length > 0 
                            ? revenueData.map(item => ({
                                name: typeof item.name === 'string' ? item.name : '',
                                date: typeof item.date === 'string' ? item.date : '',
                                total: typeof item.total === 'number' ? item.total : 0
                              }))
                            : []
                          } 
                        />
                      )
                    ) : (
                      <Skeleton className="h-[240px] w-full" />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Métodos de Pagamento</CardTitle>
                    <Select
                      value={selectedPeriod}
                      onValueChange={(value) => setSelectedPeriod(value as 'day' | 'week' | 'month')}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecione o período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Hoje</SelectItem>
                        <SelectItem value="week">Esta semana</SelectItem>
                        <SelectItem value="month">Este mês</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardHeader>
                  <CardContent>
                    {isLoadingPayments ? (
                      <div className="flex items-center justify-center h-[300px]">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : paymentMethodData && paymentMethodData.length > 0 ? (
                      <DynamicPieChart 
                        data={pieChartData}
                        type="donut"
                        height={300}
                        showTotal={true}
                        totalLabel="Total"
                        colorMap={paymentMethodColors}
                        tooltipFormatter={(value, name) => {
                          const method = paymentMethodData.find(m => m.name === name);
                          return method ? `${method.count} transações (${value.toFixed(1)}%)` : '';
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-[300px]">
                        <p className="text-muted-foreground">Nenhum dado disponível</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Detalhes dos Métodos de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingPayments ? (
                    <div className="flex items-center justify-center h-[200px]">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : paymentMethodData && paymentMethodData.length > 0 ? (
                    <div className="space-y-8">
                      {paymentMethodData.map((method) => (
                        <div key={method.name} className="flex items-center">
                          <div className="space-y-1 flex-1">
                            <p className="text-sm font-medium leading-none">
                              {method.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {method.count} transações ({method.percentage}%)
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium leading-none">
                              {formatCurrency(method.total)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Receita
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[200px]">
                      <p className="text-muted-foreground">Nenhum dado disponível</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <div className="flex justify-end mb-4">
                <Select
                  value={selectedPeriod}
                  onValueChange={(value) => setSelectedPeriod(value as 'day' | 'week' | 'month')}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Hoje</SelectItem>
                    <SelectItem value="week">Esta semana</SelectItem>
                    <SelectItem value="month">Este mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Produtos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingProducts ? (
                      <div className="flex items-center justify-center h-[200px]">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : topProductsData && topProductsData.length > 0 ? (
                      <div className="space-y-8">
                        {topProductsData.map((product) => (
                          <div key={product._id} className="flex items-center">
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
                                {formatCurrency(product.revenue)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Receita
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-[200px]">
                        <p className="text-muted-foreground">Nenhum produto vendido no período selecionado</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição de Vendas por Produto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingProducts ? (
                      <div className="flex items-center justify-center h-[300px]">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : topProductsData && topProductsData.length > 0 ? (
                      <DynamicPieChart 
                        data={topProductsData.map(product => ({
                          name: product.name,
                          value: product.revenue
                        }))}
                        type="pie"
                        height={300}
                        showTotal={false}
                        valueFormatter={(value) => formatCurrency(value)}
                        tooltipFormatter={(value, name) => {
                          const product = topProductsData.find(p => p.name === name);
                          return product ? `${product.quantity} unidades - ${formatCurrency(value)}` : '';
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-[300px]">
                        <p className="text-muted-foreground">Nenhum produto vendido no período selecionado</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="customers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas de Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingCustomers ? (
                    <div className="flex items-center justify-center h-[100px]">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : customerData ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total de Clientes</p>
                        <p className="text-2xl font-bold">{customerData.stats.totalCustomers}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Novos Clientes</p>
                        <p className="text-2xl font-bold">{customerData.stats.newCustomers}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Clientes Recorrentes</p>
                        <p className="text-2xl font-bold">{customerData.stats.returningCustomers}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Taxa de Retenção</p>
                        <p className="text-2xl font-bold">{customerData.stats.retentionRate}%</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[100px]">
                      <p className="text-muted-foreground">Nenhum dado disponível</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingCustomers ? (
                    <div className="flex items-center justify-center h-[200px]">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : customerData && customerData.topCustomers.length > 0 ? (
                    <div className="space-y-8">
                      {customerData.topCustomers.map((customer) => (
                        <div key={customer._id} className="flex items-center">
                          <div className="space-y-1 flex-1">
                            <p className="text-sm font-medium leading-none">
                              {customer.customerName || 'Cliente sem nome'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {customer.orderCount} pedidos | Último: {formatDate(customer.lastOrder)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium leading-none">
                              {formatCurrency(customer.totalSpent)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Total gasto
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[200px]">
                      <p className="text-muted-foreground">Nenhum cliente encontrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  )
}
