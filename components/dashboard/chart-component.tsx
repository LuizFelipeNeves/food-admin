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
          data={data}
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
}

// Componente memoizado para evitar re-renderizações desnecessárias
const MemoizedChartComponent = memo(ChartComponentClient);

// Componente principal que será exportado
export default function ChartComponent({ data }: ChartComponentProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center">
        <Skeleton className="h-[350px] w-full" />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

  // Renderizar o componente do cliente apenas quando montado
  return <MemoizedChartComponent data={data} />;
} 