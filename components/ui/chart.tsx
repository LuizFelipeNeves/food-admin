'use client';

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

// Importação dinâmica do ApexCharts
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Definir tipos
export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
  };
};

export type ChartProps = React.ComponentProps<'div'> & {
  config: ChartConfig;
  type?: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap';
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  options?: ApexOptions;
  height?: number | string;
  width?: number | string;
};

// Componente wrapper que carrega o gráfico dinamicamente
const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  ({ config, type = 'line', series, options, height = 350, width = '100%', ...props }, ref) => {
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
    
    // Configurações padrão do gráfico
    const defaultOptions: ApexOptions = {
      chart: {
        type: type as any,
        toolbar: {
          show: false
        },
        fontFamily: 'inherit'
      },
      colors: Object.values(config).map(item => item.color || 'hsl(var(--primary))'),
      tooltip: {
        theme: 'light'
      },
      grid: {
        borderColor: 'hsl(var(--border))',
        strokeDashArray: 4
      },
      ...options
    };
    
    // Renderizar o gráfico com ApexCharts
    try {
      return (
        <div 
          ref={ref} 
          className="w-full border rounded-lg p-4"
          {...props}
        >
          {typeof window !== 'undefined' && (
            <ApexChart
              options={defaultOptions}
              series={series}
              type={type}
              height={height}
              width={width}
            />
          )}
        </div>
      );
    } catch (error) {
      console.error('Erro ao renderizar o gráfico:', error);
      
      // Renderizar um fallback em caso de erro
      return (
        <div 
          ref={ref} 
          className="aspect-video w-full border rounded-lg p-4 flex items-center justify-center"
          {...props}
        >
          <p className="text-muted-foreground">
            Erro ao carregar o gráfico
          </p>
        </div>
      );
    }
  }
);
Chart.displayName = 'Chart';

// Componentes auxiliares
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
