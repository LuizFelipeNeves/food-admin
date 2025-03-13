'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Importar os tipos do chart-client
import type { ChartConfig } from './chart-client';

// Importação dinâmica do componente de gráfico
const DynamicChartContainer = dynamic(
  () => import('./chart-client'),
  { 
    ssr: false, 
    loading: () => <Skeleton className="aspect-video w-full" /> 
  }
);

// Componente wrapper que carrega o gráfico dinamicamente
const Chart = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: ChartConfig;
    children: React.ReactNode;
  }
>((props, ref) => {
  return <DynamicChartContainer {...props} forwardedRef={ref} />;
});
Chart.displayName = 'Chart';

// Re-exportar os componentes do chart-client
export { ChartTooltip, ChartTooltipContent } from './chart-client';
export { Chart };
export type { ChartConfig };
