'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Importar os tipos do chart-client
import type { ChartConfig } from './chart-client';

// Importação dinâmica do componente de gráfico com noSSR
const DynamicChartContainer = dynamic(
  () => import('./chart-client'),
  { 
    ssr: false, 
    loading: () => <Skeleton className="aspect-video w-full" /> 
  }
);

// Importação dinâmica dos componentes de tooltip
const DynamicChartTooltip = dynamic(
  () => import('./chart-client').then(mod => ({ default: mod.ChartTooltip })),
  { ssr: false }
);

const DynamicChartTooltipContent = dynamic(
  () => import('./chart-client').then(mod => ({ default: mod.ChartTooltipContent })),
  { ssr: false }
);

// Componente wrapper que carrega o gráfico dinamicamente
const Chart = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: ChartConfig;
    children: React.ReactNode;
  }
>((props, ref) => {
  const [isMounted, setIsMounted] = React.useState(false);
  
  React.useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  if (!isMounted) {
    return <Skeleton className="aspect-video w-full" />;
  }
  
  return <DynamicChartContainer {...props} forwardedRef={ref} />;
});
Chart.displayName = 'Chart';

// Re-exportar os componentes do chart-client
export const ChartTooltip = DynamicChartTooltip;
export const ChartTooltipContent = DynamicChartTooltipContent;
export { Chart };
export type { ChartConfig };
