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
  const [hasError, setHasError] = React.useState(false);
  const [ChartContainer, setChartContainer] = React.useState<any>(null);
  
  React.useEffect(() => {
    try {
      setIsMounted(true);
      
      // Carregar o componente de gráfico apenas no cliente
      const loadChartContainer = async () => {
        try {
          if (typeof window !== 'undefined') {
            // Usar um timeout para garantir que o DOM esteja completamente carregado
            setTimeout(async () => {
              try {
                const module = await import('./chart-client');
                setChartContainer(() => module.default);
              } catch (error) {
                console.error('Erro ao carregar o componente de gráfico:', error);
                setHasError(true);
              }
            }, 500);
          }
        } catch (error) {
          console.error('Erro ao carregar o componente de gráfico:', error);
          setHasError(true);
        }
      };
      
      loadChartContainer();
    } catch (error) {
      console.error('Erro ao montar o componente:', error);
      setHasError(true);
    }
    
    return () => {
      try {
        setIsMounted(false);
        setChartContainer(null);
      } catch (error) {
        console.error('Erro ao desmontar o componente:', error);
      }
    };
  }, []);
  
  if (hasError) {
    return (
      <div className="flex aspect-video justify-center items-center text-xs">
        <p className="text-muted-foreground">Erro ao carregar o gráfico</p>
      </div>
    );
  }
  
  if (!isMounted || !ChartContainer) {
    return <Skeleton className="aspect-video w-full" />;
  }
  
  return <ChartContainer {...props} forwardedRef={ref} />;
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
