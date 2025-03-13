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
    // Marcar o componente como montado
    setIsMounted(true);
    
    return () => {
      setIsMounted(false);
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

  // Renderizar um fallback se os dados forem inválidos
  if (!isDataValid || validData.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

  // Renderizar uma tabela simples
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
            <tr key={index} className="border-b hover:bg-muted/50">
              <td className="p-2">{item.name}</td>
              <td className="p-2 text-right">R$ {item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 