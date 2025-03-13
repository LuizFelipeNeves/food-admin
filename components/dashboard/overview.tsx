'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";

// Importação dinâmica do Recharts para evitar problemas de SSR
const DynamicChart = dynamic(
  () => import('@/components/dashboard/chart-component'),
  { 
    ssr: false, 
    loading: () => <Skeleton className="h-[350px] w-full" /> 
  }
);

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

interface OverviewProps {
  data: SaleData[];
}

export function Overview({ data }: OverviewProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Limpar o estado ao desmontar o componente
    return () => {
      setIsMounted(false);
    };
  }, []);

  if (!isMounted) {
    return <Skeleton className="h-[350px] w-full" />;
  }

  if (!data?.length) {
    return (
      <div className="flex h-[350px] w-full items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full">
      <DynamicChart data={data} />
    </div>
  );
}