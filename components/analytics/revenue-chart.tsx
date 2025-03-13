'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface RevenueData {
  name: string;
  total: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
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
        typeof item.total === 'number'
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
      <div className="h-[240px] flex items-center justify-center">
        <Skeleton className="h-[240px] w-full" />
      </div>
    );
  }

  // Renderizar um fallback em caso de erro
  if (hasError) {
    return (
      <div className="h-[240px] flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Erro ao carregar o gráfico</p>
      </div>
    );
  }

  // Renderizar um fallback se os dados forem inválidos
  if (!isDataValid || validData.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

  // Renderizar um fallback enquanto o Recharts não está carregado
  if (!isRechartsLoaded || !RechartsComponents) {
    return (
      <div className="h-[240px] flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Carregando gráfico...</p>
      </div>
    );
  }

  // Extrair os componentes do Recharts
  const { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } = RechartsComponents;

  // Renderizar o gráfico com Recharts
  try {
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
    
    // Renderizar uma tabela simples como fallback
    return (
      <div className="h-[240px] w-full overflow-auto border rounded-lg p-4">
        <h3 className="text-center mb-4 font-medium">Receita Mensal</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Mês</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {validData.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">{item.name}</td>
                <td className="p-2 text-right">R$ {item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
} 