'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

// Definir interfaces
interface SaleStatus {
  completed: number;
  preparing: number;
  ready: number;
  pending: number;
}

interface SaleData {
  name: string;
  total: number;
  subtotal: number;
  deliveryFees: number;
  orders: number;
  average: number;
  status: SaleStatus;
}

interface ChartComponentProps {
  data: SaleData[];
}

// Componente principal que será exportado
export default function ChartComponent({ data }: ChartComponentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isRechartsLoaded, setIsRechartsLoaded] = useState(false);
  const [RechartsComponents, setRechartsComponents] = useState<any>(null);

  // Verificar se os dados são válidos
  const isDataValid = data && Array.isArray(data) && data.length > 0;

  // Verificar se os dados têm a estrutura esperada
  const validData = isDataValid
    ? data.filter(item => 
        item && 
        typeof item === 'object' && 
        'name' in item && 
        'total' in item && 
        'subtotal' in item && 
        'deliveryFees' in item && 
        'orders' in item
      )
    : [];

  useEffect(() => {
    try {
      setIsMounted(true);
      
      // Carregar Recharts apenas no cliente
      const loadRecharts = async () => {
        try {
          // Importar dinamicamente apenas no cliente
          if (typeof window !== 'undefined') {
            // Usar um timeout para garantir que o DOM esteja completamente carregado
            setTimeout(async () => {
              try {
                const recharts = await import('recharts');
                setRechartsComponents(recharts);
                setIsRechartsLoaded(true);
              } catch (error) {
                console.error('Erro ao carregar o Recharts:', error);
                setHasError(true);
              }
            }, 500);
          }
        } catch (error) {
          console.error('Erro ao carregar o Recharts:', error);
          setHasError(true);
        }
      };
      
      loadRecharts();
    } catch (error) {
      console.error('Erro ao montar o componente:', error);
      setHasError(true);
    }
    
    return () => {
      try {
        setIsMounted(false);
        setIsRechartsLoaded(false);
        setRechartsComponents(null);
      } catch (error) {
        console.error('Erro ao desmontar o componente:', error);
      }
    };
  }, []);

  // Renderizar um fallback enquanto o componente não está montado
  if (!isMounted) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center">
        <Skeleton className="h-[350px] w-full" />
      </div>
    );
  }

  // Renderizar um fallback em caso de erro
  if (hasError) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Erro ao carregar o gráfico</p>
      </div>
    );
  }

  // Renderizar um fallback se os dados forem inválidos
  if (!isDataValid || validData.length === 0) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

  // Renderizar um fallback enquanto o Recharts não está carregado
  if (!isRechartsLoaded || !RechartsComponents) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Carregando gráfico...</p>
      </div>
    );
  }

  // Extrair os componentes do Recharts
  const { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    Rectangle, 
    ResponsiveContainer 
  } = RechartsComponents;

  // Renderizar uma tabela simples como fallback se o Recharts não puder ser renderizado
  try {
    return (
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={800}
            height={350}
            data={validData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.2} />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              yAxisId="left"
              tickFormatter={(value: number) => `R$ ${value}`}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              tickFormatter={(value: number) => `${value} pedidos`}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '12px'
              }}
              formatter={(value: any, name: string) => {
                if (name === 'Pedidos') return [value, name];
                return [`R$ ${Number(value).toFixed(2)}`, name];
              }}
              labelFormatter={(label: string) => `Horário: ${label}`}
            />
            <Legend />
            <Bar 
              name="Total" 
              dataKey="total" 
              fill="hsl(var(--primary))"
              activeBar={<Rectangle fill="hsl(var(--primary))" stroke="hsl(var(--primary))" />}
              yAxisId="left"
            />
            <Bar 
              name="Subtotal" 
              dataKey="subtotal" 
              fill="hsl(var(--secondary))"
              activeBar={<Rectangle fill="hsl(var(--secondary))" stroke="hsl(var(--secondary))" />}
              yAxisId="left"
            />
            <Bar 
              name="Taxa de Entrega" 
              dataKey="deliveryFees" 
              fill="hsl(var(--warning))"
              activeBar={<Rectangle fill="hsl(var(--warning))" stroke="hsl(var(--warning))" />}
              yAxisId="left"
            />
            <Bar
              name="Pedidos"
              dataKey="orders"
              fill="hsl(var(--success))"
              activeBar={<Rectangle fill="hsl(var(--success))" stroke="hsl(var(--success))" />}
              yAxisId="right"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (error) {
    console.error('Erro ao renderizar o gráfico:', error);
    
    // Renderizar uma tabela simples como fallback
    return (
      <div className="h-[350px] w-full overflow-auto border rounded-lg p-4">
        <h3 className="text-center mb-4 font-medium">Dados de Vendas por Hora</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Horário</th>
              <th className="p-2 text-right">Total</th>
              <th className="p-2 text-right">Subtotal</th>
              <th className="p-2 text-right">Taxa de Entrega</th>
              <th className="p-2 text-right">Pedidos</th>
            </tr>
          </thead>
          <tbody>
            {validData.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">{item.name}</td>
                <td className="p-2 text-right">R$ {item.total.toFixed(2)}</td>
                <td className="p-2 text-right">R$ {item.subtotal.toFixed(2)}</td>
                <td className="p-2 text-right">R$ {item.deliveryFees.toFixed(2)}</td>
                <td className="p-2 text-right">{item.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
} 