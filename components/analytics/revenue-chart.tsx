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
  // Verificar se os dados são válidos
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center border rounded-lg">
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
    typeof item.total === 'number'
  );

  if (validData.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Dados inválidos</p>
      </div>
    );
  }

  try {
    // Importar os componentes do Recharts dinamicamente
    const { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } = require('recharts');

    return (
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={validData}>
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
  } catch (error) {
    console.error('Erro ao renderizar o gráfico:', error);
    return (
      <div className="h-[240px] flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Erro ao renderizar o gráfico</p>
      </div>
    );
  }
}

// Componente memoizado para evitar re-renderizações desnecessárias
const MemoizedRevenueChart = memo(RevenueChartClient);

// Componente principal que será exportado
export default function RevenueChart({ data }: RevenueChartProps) {
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
      <div className="h-[240px] flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Erro ao carregar o gráfico</p>
      </div>
    );
  }

  if (!isMounted) {
    return (
      <div className="h-[240px] flex items-center justify-center">
        <Skeleton className="h-[240px] w-full" />
      </div>
    );
  }

  // Verificação adicional de dados
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

  // Renderizar o componente do cliente apenas quando montado
  try {
    return <MemoizedRevenueChart data={data} />;
  } catch (error) {
    console.error('Erro ao renderizar o componente:', error);
    return (
      <div className="h-[240px] flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Erro ao renderizar o gráfico</p>
      </div>
    );
  }
} 