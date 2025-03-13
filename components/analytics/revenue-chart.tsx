'use client';

import { useState, useEffect, memo } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

// Importar apenas os tipos do Recharts
import type { BarProps, XAxisProps, YAxisProps } from 'recharts';

interface RevenueData {
  name: string;
  total: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

// Componente que será renderizado apenas no cliente
function RevenueChartClient({ data }: RevenueChartProps) {
  // Importar os componentes do Recharts dinamicamente
  const { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } = require('recharts');

  return (
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
            tickFormatter={(value: number) => `R$${value}`}
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
  );
}

// Componente memoizado para evitar re-renderizações desnecessárias
const MemoizedRevenueChart = memo(RevenueChartClient);

// Componente principal que será exportado
export default function RevenueChart({ data }: RevenueChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-[240px] flex items-center justify-center">
        <Skeleton className="h-[240px] w-full" />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="h-[240px] flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

  // Renderizar o componente do cliente apenas quando montado
  return <MemoizedRevenueChart data={data} />;
} 