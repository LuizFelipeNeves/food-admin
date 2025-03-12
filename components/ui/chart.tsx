'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Importação dinâmica do componente de gráfico
const DynamicChart = dynamic(
  () => import('./chart-client'),
  { ssr: false, loading: () => <Skeleton className="aspect-video w-full" /> }
);

// Re-exportar os tipos do chart-client
export type { ChartConfig } from './chart-client';

// Componente wrapper que carrega o gráfico dinamicamente
const Chart = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DynamicChart>
>((props, ref) => {
  return <DynamicChart {...props} forwardedRef={ref} />;
});
Chart.displayName = 'Chart';

// Re-exportar os componentes do chart-client
export { ChartTooltip, ChartTooltipContent } from './chart-client';
export { Chart };
