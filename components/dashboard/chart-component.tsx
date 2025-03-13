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
    // Marcar o componente como montado
    setIsMounted(true);
    
    return () => {
      setIsMounted(false);
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

  // Renderizar um fallback se os dados forem inválidos
  if (!isDataValid || validData.length === 0) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

  // Renderizar uma tabela simples
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
            <tr key={index} className="border-b hover:bg-muted/50">
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