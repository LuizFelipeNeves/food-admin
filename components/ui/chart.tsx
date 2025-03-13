'use client';

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Importar os tipos do chart-client
import type { ChartConfig } from './chart-client';

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
    return () => {
      setIsMounted(false);
    };
  }, []);
  
  if (!isMounted) {
    return <Skeleton className="aspect-video w-full" />;
  }
  
  // Renderizar um contêiner simples
  return (
    <div 
      ref={ref} 
      className="aspect-video w-full border rounded-lg p-4 flex items-center justify-center"
      {...props}
    >
      {props.children || (
        <p className="text-muted-foreground">
          Dados não disponíveis para visualização
        </p>
      )}
    </div>
  );
});
Chart.displayName = 'Chart';

// Componentes de tooltip simplificados
const ChartTooltip = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  (props, ref) => <div ref={ref} {...props} />
);
ChartTooltip.displayName = 'ChartTooltip';

const ChartTooltipContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  (props, ref) => <div ref={ref} {...props} />
);
ChartTooltipContent.displayName = 'ChartTooltipContent';

// Exportar os componentes
export { Chart, ChartTooltip, ChartTooltipContent };
export type { ChartConfig };
