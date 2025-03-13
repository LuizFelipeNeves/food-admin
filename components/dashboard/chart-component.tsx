'use client';

import { useState, useEffect, memo } from 'react';
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

// Componente que será renderizado apenas no cliente
function ChartComponentClient({ data }: ChartComponentProps) {
  // Verificar se os dados são válidos
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

  // Verificar se os dados têm a estrutura esperada
  const validData = data.filter(item => 
    item && 
    typeof item === 'object' && 
    'name' in item && 
    'total' in item && 
    'subtotal' in item && 
    'deliveryFees' in item && 
    'orders' in item
  );

  if (validData.length === 0) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Dados inválidos</p>
      </div>
    );
  }

  try {
    // Importar os componentes do Recharts dinamicamente
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
    } = require('recharts');

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
    return (
      <div className="h-[350px] w-full flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Erro ao renderizar o gráfico</p>
      </div>
    );
  }
}

// Componente memoizado para evitar re-renderizações desnecessárias
const MemoizedChartComponent = memo(ChartComponentClient);

// Componente principal que será exportado
export default function ChartComponent({ data }: ChartComponentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      setIsMounted(true);
    } catch (error) {
      console.error('Erro ao montar o componente:', error);
      setHasError(true);
    }
    
    return () => {
      try {
        setIsMounted(false);
      } catch (error) {
        console.error('Erro ao desmontar o componente:', error);
      }
    };
  }, []);

  if (hasError) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Erro ao carregar o gráfico</p>
      </div>
    );
  }

  if (!isMounted) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center">
        <Skeleton className="h-[350px] w-full" />
      </div>
    );
  }

  // Verificação adicional de dados
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

  // Renderizar o componente do cliente apenas quando montado
  try {
    return <MemoizedChartComponent data={data} />;
  } catch (error) {
    console.error('Erro ao renderizar o componente:', error);
    return (
      <div className="h-[350px] w-full flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Erro ao renderizar o gráfico</p>
      </div>
    );
  }
} 