'use client'

import { Layout } from '@/components/layout/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { useState, useEffect, useMemo } from 'react'
import { trpc } from '@/app/_trpc/client'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTheme } from 'next-themes'
import { CacheIndicator } from '@/components/ui/cache-indicator'
import { useStoreId } from '@/hooks/useStoreId'

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
    loading: () => <Skeleton className="h-[400px] w-full" />
  }
);

// Configuração de cores para os métodos de pagamento (modo claro)
const paymentMethodLightColors: Record<string, string> = {
  'Cartão de Crédito': '#4f46e5', // Indigo
  'Cartão de Débito': '#0ea5e9', // Sky
  'PIX': '#10b981', // Emerald
  'Dinheiro': '#f59e0b', // Amber
  'Vale Refeição': '#ec4899', // Pink
  'Outros': '#6b7280', // Gray
};

// Configuração de cores para os métodos de pagamento (modo escuro)
const paymentMethodDarkColors: Record<string, string> = {
  'Cartão de Crédito': '#818cf8', // Indigo mais brilhante
  'Cartão de Débito': '#38bdf8', // Sky mais brilhante
  'PIX': '#34d399', // Emerald mais brilhante
  'Dinheiro': '#fbbf24', // Amber mais brilhante
  'Vale Refeição': '#f472b6', // Pink mais brilhante
  'Outros': '#d1d5db', // Gray mais brilhante
};

// Cores para o gráfico de produtos (modo claro)
const productLightColors: string[] = [
  '#4f46e5', // Indigo
  '#0ea5e9', // Sky
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#84cc16', // Lime
  '#6b7280', // Gray
];

// Cores para o gráfico de produtos (modo escuro)
const productDarkColors: string[] = [
  '#818cf8', // Indigo mais brilhante
  '#38bdf8', // Sky mais brilhante
  '#34d399', // Emerald mais brilhante
  '#fbbf24', // Amber mais brilhante
  '#f472b6', // Pink mais brilhante
  '#a78bfa', // Violet mais brilhante
  '#22d3ee', // Cyan mais brilhante
  '#fb7185', // Rose mais brilhante
  '#a3e635', // Lime mais brilhante
  '#d1d5db', // Gray mais brilhante
];

// Interfaces para tipagem
interface CustomerStats {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  retentionRate: number;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  orderCount: number;
  totalSpent: number;
  lastOrder: string;
  customerName?: string;
}

interface CustomerData {
  stats: CustomerStats;
  topCustomers: Customer[];
}

interface PaymentMethod {
  name: string;
  count: number;
  countPercentage: number;
  total: number;
  percentage: number;
}

interface Product {
  _id: string;
  name: string;
  quantity: number;
  revenue: number;
}

interface ApiResponse<T> {
  data: T;
  timestamp: string;
  fromCache: boolean;
}

export default function AnalyticsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('month');
  const storeId = useStoreId();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Escolher o conjunto de cores com base no tema
  const productColors = isDarkMode ? productDarkColors : productLightColors;
  const paymentMethodColors = isDarkMode ? paymentMethodDarkColors : paymentMethodLightColors;

  const [dataTimestamps, setDataTimestamps] = useState<{
    revenue?: { time: Date; fromCache: boolean };
    products?: { time: Date; fromCache: boolean };
    customers?: { time: Date; fromCache: boolean };
    payments?: { time: Date; fromCache: boolean };
  }>({});
  const [refreshing, setRefreshing] = useState(false);

  // Buscar dados de receita mensal
  const { data: revenueResponse, isLoading: isLoadingRevenue, refetch: refetchRevenue } = trpc.analytics.getMonthlyRevenue.useQuery({
    storeId,
    months: 6
  }, {
    enabled: !!storeId && isMounted,
    onSuccess: (data) => {
      if (data) {
        setDataTimestamps(prev => ({
          ...prev,
          revenue: { time: new Date(data.timestamp), fromCache: data.fromCache }
        }));
      }
    }
  });

  const revenueData = revenueResponse?.data || [];

  // Buscar dados de produtos mais vendidos
  const { data: topProductsResponse, isLoading: isLoadingProducts, refetch: refetchProducts } = trpc.analytics.getTopProducts.useQuery({
    storeId,
    limit: 5,
    period: selectedPeriod
  }, {
    enabled: !!storeId && isMounted,
    onSuccess: (data) => {
      if (data) {
        setDataTimestamps(prev => ({
          ...prev,
          products: { time: new Date(data.timestamp), fromCache: data.fromCache }
        }));
      }
    }
  });

  const topProductsData = (topProductsResponse?.data || []) as Product[];

  // Buscar dados de clientes
  const { data: customerResponse, isLoading: isLoadingCustomers, refetch: refetchCustomers } = trpc.analytics.getCustomerStats.useQuery({
    storeId,
    limit: 5
  }, {
    enabled: !!storeId && isMounted,
    onSuccess: (data) => {
      if (data) {
        setDataTimestamps(prev => ({
          ...prev,
          customers: { time: new Date(data.timestamp), fromCache: data.fromCache }
        }));
      }
    }
  });

  const customerData = (customerResponse?.data || { 
    stats: { 
      totalCustomers: 0, 
      newCustomers: 0, 
      returningCustomers: 0, 
      retentionRate: 0 
    }, 
    topCustomers: [] 
  }) as CustomerData;

  // Buscar dados de métodos de pagamento
  const { data: paymentMethodResponse, isLoading: isLoadingPayments, refetch: refetchPayments } = trpc.analytics.getPaymentMethodStats.useQuery({
    storeId,
    period: selectedPeriod
  }, {
    enabled: !!storeId && isMounted,
    onSuccess: (data) => {
      if (data) {
        setDataTimestamps(prev => ({
          ...prev,
          payments: { time: new Date(data.timestamp), fromCache: data.fromCache }
        }));
      }
    }
  });

  const paymentMethodData = (paymentMethodResponse?.data || []) as PaymentMethod[];

  // Calcular totais usando useMemo
  const totalRevenue = useMemo(() => {
    return Array.isArray(revenueData) 
      ? revenueData.reduce((acc: number, item: { total: number }) => acc + item.total, 0) 
      : 0;
  }, [revenueData]);
  
  const totalOrders = useMemo(() => {
    return Array.isArray(topProductsData) 
      ? topProductsData.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0) 
      : 0;
  }, [topProductsData]);
  
  const averageTicket = useMemo(() => {
    return totalOrders > 0 ? totalRevenue / totalOrders : 0;
  }, [totalRevenue, totalOrders]);

  // Preparar dados para o gráfico de pizza de métodos de pagamento (por contagem)
  const pieChartDataByCount = useMemo(() => {
    if (!Array.isArray(paymentMethodData) || paymentMethodData.length === 0) {
      return [];
    }
    
    // Verificar se os dados de contagem estão presentes e calcular percentuais se necessário
    const totalCount = paymentMethodData.reduce((acc, method) => acc + (method.count || 0), 0);
    
    return paymentMethodData.map(method => {
      // Se countPercentage não existir, calcular com base nos counts disponíveis
      let valuePercentage = 0;
      
      if (typeof method.countPercentage === 'number') {
        valuePercentage = method.countPercentage;
      } else if (totalCount > 0 && typeof method.count === 'number') {
        valuePercentage = Math.round((method.count / totalCount) * 100);
      }
      
      return {
        name: method.name,
        value: valuePercentage,
        count: method.count || 0,
        color: paymentMethodColors[method.name] || '#6b7280',
        darkColor: paymentMethodDarkColors[method.name] || '#d1d5db'
      };
    }).filter(item => item.value > 0);
  }, [paymentMethodData, paymentMethodColors, paymentMethodDarkColors]);

  const pieChartDataByRevenue = useMemo(() => {
    if (!Array.isArray(paymentMethodData) || paymentMethodData.length === 0) {
      return [];
    }
    
    return paymentMethodData.map(method => ({
      name: method.name,
      value: typeof method.percentage === 'number' ? method.percentage : 0,
      total: method.total || 0,
      color: paymentMethodColors[method.name] || '#6b7280',
      darkColor: paymentMethodDarkColors[method.name] || '#d1d5db'
    })).filter(item => item.value > 0);
  }, [paymentMethodData, paymentMethodColors, paymentMethodDarkColors]);

  // Estado para controlar qual visualização mostrar
  const [showByRevenue, setShowByRevenue] = useState(true);
  const [isChangingView, setIsChangingView] = useState(false);

  // Função para alternar o modo de visualização com efeito de carregamento
  const toggleView = (showRevenue: boolean) => {
    if (showByRevenue !== showRevenue) {
      setIsChangingView(true);
      
      // Verifica se há dados para o modo selecionado
      const hasData = showRevenue 
        ? pieChartDataByRevenue.filter(item => item && typeof item.value === 'number' && item.value > 0).length > 0
        : pieChartDataByCount.filter(item => item && typeof item.value === 'number' && item.value > 0).length > 0;
      
      console.log(`Alterando para modo ${showRevenue ? 'Valor' : 'Quantidade'}. Dados disponíveis: ${hasData ? 'Sim' : 'Não'}`);
      
      setShowByRevenue(showRevenue);
      
      // Simular um pequeno delay para a transição
      setTimeout(() => {
        setIsChangingView(false);
      }, 300);
    }
  };

  // Preparar dados para o gráfico de pizza de produtos
  const productPieChartData = useMemo(() => {
    if (!topProductsData || !Array.isArray(topProductsData) || topProductsData.length === 0) {
      return [];
    }

    // Calcular a porcentagem com base na receita total dos produtos
    const totalProductRevenue = topProductsData.reduce((acc, item) => acc + (item.revenue || 0), 0);

    // Verificar se o total é maior que zero para evitar divisão por zero
    if (totalProductRevenue <= 0) {
      return [];
    }

    return topProductsData.map((product, index) => {
      const percentage = Math.round((product.revenue / totalProductRevenue) * 100);

      return {
        name: product.name || `Produto ${index + 1}`,
        value: percentage, // Usar a porcentagem em vez do valor absoluto
        revenue: product.revenue || 0, // Manter o valor absoluto para o tooltip
        color: productColors[index % productColors.length],
        darkColor: productDarkColors[index % productDarkColors.length]
      };
    }).filter(item => item.value > 0); // Filtrar itens com porcentagem zero
  }, [topProductsData, productColors, productDarkColors]);

  useEffect(() => {
    setIsMounted(true);
    console.log('StoreId:', storeId);
  }, [storeId]);

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para formatar data e hora
  const formatDateTime = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Função para atualizar todos os dados
  const refreshAllData = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchRevenue(),
      refetchProducts(),
      refetchCustomers(),
      refetchPayments()
    ]);
    setRefreshing(false);
  };

  // Verificar se há dados para exibir
  useEffect(() => {
    if (paymentMethodData && paymentMethodData.length > 0) {
      console.log('Payment Method Data Completo:', JSON.stringify(paymentMethodData, null, 2));
      
      // Verificação detalhada dos dados
      const paymentDataDiagnostics = paymentMethodData.map(method => ({
        name: method.name,
        hasCount: typeof method.count === 'number',
        countValue: method.count,
        hasCountPercentage: typeof method.countPercentage === 'number',
        countPercentageValue: method.countPercentage,
        hasPercentage: typeof method.percentage === 'number',
        percentageValue: method.percentage,
        hasTotal: typeof method.total === 'number',
        totalValue: method.total
      }));
      
      console.log('Diagnóstico de dados:', paymentDataDiagnostics);
      
      // Verificar se os dados de contagem estão presentes
      const hasMissingCountData = paymentMethodData.some(method => 
        typeof method.countPercentage === 'undefined' || 
        method.countPercentage === null
      );
      
      if (hasMissingCountData) {
        console.warn('⚠️ Alguns métodos de pagamento não têm dados de contagem percentual');
      }

      // Verificar se os dados filtrados para cada visualização estão presentes
      console.log('Dados filtrados (Valor):', 
        pieChartDataByRevenue.filter(item => item && typeof item.value === 'number' && item.value > 0)
      );
      console.log('Dados filtrados (Quantidade):', 
        pieChartDataByCount.filter(item => item && typeof item.value === 'number' && item.value > 0)
      );
    }
    if (topProductsData) {
      console.log('Top Products Data:', topProductsData);
      console.log('Product Pie Chart Data:', productPieChartData);
    }
  }, [paymentMethodData, pieChartDataByCount, pieChartDataByRevenue, topProductsData, productPieChartData]);

  // Log adicional para depuração
  useEffect(() => {
    if (productPieChartData && productPieChartData.length > 0) {
      console.log('Dados do gráfico de produtos prontos para renderização:', {
        length: productPieChartData.length,
        names: productPieChartData.map(item => item.name),
        values: productPieChartData.map(item => item.value),
        total: productPieChartData.reduce((acc, item) => acc + item.value, 0)
      });
    } else {
      console.log('Dados do gráfico de produtos vazios ou inválidos:', productPieChartData);
    }
  }, [productPieChartData]);

  // Log adicional para depuração dos métodos de pagamento
  useEffect(() => {
    if (pieChartDataByRevenue && pieChartDataByRevenue.length > 0) {
      console.log('Dados do gráfico de métodos de pagamento prontos para renderização:', {
        length: pieChartDataByRevenue.length,
        names: pieChartDataByRevenue.map(item => item.name),
        values: pieChartDataByRevenue.map(item => item.value),
        total: pieChartDataByRevenue.reduce((acc, item) => acc + item.value, 0)
      });
    } else {
      console.log('Dados do gráfico de métodos de pagamento vazios ou inválidos:', pieChartDataByRevenue);
    }
  }, [pieChartDataByRevenue]);

  // Verificar se o método existe no paymentMethodData
  const tooltipFormatter = (value: number, name: string) => {
    if (!Array.isArray(paymentMethodData)) return '';
    const method = paymentMethodData.find(m => m.name === name);
    if (!method) return '';
    
    if (showByRevenue) {
      return `${formatCurrency(method.total || 0)} (${value}%)`;
    } else {
      // Dados por quantidade
      const totalCount = paymentMethodData.reduce((acc, m) => acc + (m.count || 0), 0);
      const countPercent = totalCount > 0 && method.count 
        ? Math.round((method.count / totalCount) * 100)
        : value;
        
      return `${method.count || 0} pedidos (${countPercent}%)`;
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
            
            <CacheIndicator 
              dataTimestamps={dataTimestamps}
              refreshing={refreshing}
              onRefresh={refreshAllData}
              ttl={20}
            />
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
                        <div className="text-lg sm:text-xl md:text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
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
                        <div className="text-2xl font-bold">+{customerData.stats?.newCustomers || 0}</div>
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
                  <CardHeader className="flex flex-col space-y-2">
                    <div className="flex flex-row items-center justify-between">
                      <CardTitle>Métodos de Pagamento</CardTitle>
                      <div className="flex gap-2">
                        <div className="inline-flex items-center rounded-md border p-1.5 bg-muted/30">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleView(true)}
                              className={`px-3 py-1 text-sm rounded-md ${
                                showByRevenue 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }`}
                            >
                              Por Valor
                            </button>
                            <button
                              onClick={() => toggleView(false)}
                              className={`px-3 py-1 text-sm rounded-md ${
                                !showByRevenue 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }`}
                            >
                              Por Quantidade
                            </button>
                          </div>
                        </div>
                        <Select
                          value={selectedPeriod}
                          onValueChange={(value) => setSelectedPeriod(value as 'day' | 'week' | 'month')}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Período" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="day">Hoje</SelectItem>
                            <SelectItem value="week">Esta semana</SelectItem>
                            <SelectItem value="month">Este mês</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingPayments || isChangingView ? (
                      <div className="flex items-center justify-center h-[300px]">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : Array.isArray(paymentMethodData) && paymentMethodData.length > 0 ? (
                      <>
                        {showByRevenue ? (
                          pieChartDataByRevenue.filter(item => item && typeof item.value === 'number' && item.value > 0).length > 0 ? (
                            <DynamicPieChart
                              data={pieChartDataByRevenue.filter(item => item && typeof item.value === 'number' && item.value > 0)}
                              type="donut"
                              height={380}
                              showTotal={true}
                              title=""
                              valueFormatter={(value) => `${value}%`}
                              tooltipFormatter={tooltipFormatter}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-[300px]">
                              <p className="text-muted-foreground">Nenhum dado de valor disponível</p>
                            </div>
                          )
                        ) : (
                          pieChartDataByCount.filter(item => item && typeof item.value === 'number' && item.value > 0).length > 0 ? (
                            <DynamicPieChart
                              data={pieChartDataByCount.filter(item => item && typeof item.value === 'number' && item.value > 0)}
                              type="donut"
                              height={380}
                              showTotal={true}
                              title=""
                              valueFormatter={(value) => `${value}%`}
                              tooltipFormatter={tooltipFormatter}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-[300px]">
                              <p className="text-muted-foreground">Nenhum dado de quantidade disponível</p>
                            </div>
                          )
                        )}
                      </>
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
                  <p className="text-sm text-muted-foreground">
                    Comparação entre a distribuição por número de transações e por valor total de receita
                  </p>
                </CardHeader>
                <CardContent>
                  {isLoadingPayments || isChangingView ? (
                    <div className="flex items-center justify-center h-[200px]">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : Array.isArray(paymentMethodData) && paymentMethodData.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 text-sm font-medium text-muted-foreground py-2 border-b border-muted">
                        <div>Método de Pagamento</div>
                        <div className="text-right">{showByRevenue ? 'Valor' : 'Quantidade'}</div>
                      </div>
                      {paymentMethodData.map((method: any) => (
                        <div key={method.name} className="grid grid-cols-1 sm:grid-cols-2 items-center py-2 border-b border-muted">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: paymentMethodColors[method.name] || '#6b7280' }}
                            ></div>
                            <span className="text-sm font-medium">{method.name}</span>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <div className="text-sm text-right">
                              {showByRevenue 
                                ? formatCurrency(method.total || 0) 
                                : `${method.count || 0} pedidos`}
                            </div>
                            <div className="text-sm font-medium w-12 text-right">
                              {showByRevenue 
                                ? (typeof method.percentage === 'number' ? method.percentage : 0)
                                : (typeof method.countPercentage === 'number' ? method.countPercentage : 0)}%
                            </div>
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
                    ) : Array.isArray(topProductsData) && topProductsData.length > 0 ? (
                  <div className="space-y-8">
                        <div className="grid grid-cols-4 text-xs font-medium text-muted-foreground mb-2">
                          <div>Produto</div>
                          <div>Quantidade</div>
                          <div>Receita</div>
                          <div className="text-right">Distribuição</div>
                        </div>
                        {topProductsData.map((product: any, index: number) => {
                          const percentage = productPieChartData.find(p => p.name === product.name)?.value || 0;
                          return (
                            <div key={product._id || index} className="grid grid-cols-4 items-center py-2 border-b border-muted">
                              <div className="text-sm font-medium truncate">{product.name}</div>
                              <div className="text-sm">{product.quantity}</div>
                              <div className="text-sm">{formatCurrency(product.revenue)}</div>
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-xs sm:text-sm font-medium w-9 text-right">{percentage}%</span>
                              </div>
                            </div>
                          );
                        })}
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
                          <p className="text-sm text-muted-foreground">
                      Visualização da distribuição de receita entre os produtos mais vendidos
                          </p>
                  </CardHeader>
                  <CardContent>
                    {isLoadingProducts ? (
                      <div className="flex items-center justify-center h-[300px]">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : productPieChartData && productPieChartData.length > 0 && isMounted ? (
                      <DynamicPieChart
                        data={productPieChartData.filter(item =>
                          item &&
                          typeof item.name === 'string' &&
                          typeof item.value === 'number' &&
                          item.value > 0
                        )}
                        type="pie"
                        height={400}
                        showTotal={false}
                        title="Distribuição por Receita"
                        valueFormatter={(value) => `${value}%`}
                        tooltipFormatter={(value, name) => {
                          const product = topProductsData?.find(p => p.name === name);
                          if (!product) return '';
                          const item = productPieChartData.find(p => p.name === name);
                          if (!item) return '';
                          return `${product.quantity} unidades - ${formatCurrency(item.revenue)} (${value}%)`;
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
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total de Clientes</p>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold">{customerData.stats?.totalCustomers || 0}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Novos Clientes</p>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold">{customerData.stats?.newCustomers || 0}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Clientes Recorrentes</p>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold">{customerData.stats?.returningCustomers || 0}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Taxa de Retenção</p>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold">{customerData.stats?.retentionRate || 0}%</p>
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
                              {customer.orderCount} pedidos | Último: {formatDateTime(customer.lastOrder)}
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
