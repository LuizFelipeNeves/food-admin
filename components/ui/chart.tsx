'use client';

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { useTheme } from 'next-themes';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Importação dinâmica do ApexCharts
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Função para formatar data
function formatDateLabel(dateStr: string, formatStr: string = 'dd/MM/yyyy'): string {
  try {
    // Tenta interpretar como data ISO
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}T/)) {
      const date = parseISO(dateStr);
      if (isValid(date)) {
        return format(date, formatStr, { locale: ptBR });
      }
    }
    
    // Tenta interpretar como timestamp ou outra data
    const date = new Date(dateStr);
    if (isValid(date)) {
      return format(date, formatStr, { locale: ptBR });
    }
  } catch (error) {
    console.error('Erro ao formatar data:', error);
  }
  
  // Retorna o valor original se não conseguir formatar
  return dateStr;
}

// Definir tipos
export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
    darkColor?: string; // Cor para o modo escuro
  };
};

export type ChartProps = React.ComponentProps<'div'> & {
  config: ChartConfig;
  type?: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap';
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  options?: ApexOptions;
  height?: number | string;
  width?: number | string;
  dateFormat?: string; // Formato para datas
  categories?: string[]; // Categorias (eixo X)
};

// Componente wrapper que carrega o gráfico dinamicamente
const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  ({ config, type = 'line', series, options, height = 350, width = '100%', dateFormat = 'dd/MM/yyyy', categories, ...props }, ref) => {
    const [isMounted, setIsMounted] = React.useState(false);
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    
    React.useEffect(() => {
      setIsMounted(true);
      return () => {
        setIsMounted(false);
      };
    }, []);
    
    if (!isMounted) {
      return <Skeleton className="aspect-video w-full" />;
    }
    
    // Obter cores com base no tema
    const colors = Object.values(config).map(item => 
      isDarkMode && item.darkColor ? item.darkColor : (item.color || 'hsl(var(--primary))')
    );
    
    // Formatar categorias se forem datas
    const formattedCategories = categories?.map(cat => {
      // Verifica se parece ser uma data
      if (cat && (cat.includes('-') || cat.includes('/') || !isNaN(Date.parse(cat)))) {
        return formatDateLabel(cat, dateFormat);
      }
      return cat;
    });
    
    // Configurações padrão do gráfico
    const defaultOptions: ApexOptions = {
      chart: {
        type: type as any,
        toolbar: {
          show: false
        },
        fontFamily: 'inherit',
        background: 'transparent'
      },
      colors: colors,
      tooltip: {
        theme: isDarkMode ? 'dark' : 'light',
        marker: {
          show: true
        },
        x: {
          formatter: function(val: number, { dataPointIndex }: { dataPointIndex: number }) {
            // Se temos categorias formatadas, use-as no tooltip
            if (formattedCategories && formattedCategories[dataPointIndex]) {
              return formattedCategories[dataPointIndex];
            }
            return val.toString();
          }
        }
      },
      grid: {
        borderColor: isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.8)',
        strokeDashArray: 4,
        xaxis: {
          lines: {
            show: false
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 10
        }
      },
      xaxis: {
        categories: formattedCategories,
        labels: {
          style: {
            colors: isDarkMode ? '#9ca3af' : '#6b7280',
            fontSize: '12px'
          },
          rotate: -45,
          rotateAlways: false,
          hideOverlappingLabels: true,
          trim: true
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: isDarkMode ? '#9ca3af' : '#6b7280',
            fontSize: '12px'
          }
        }
      },
      legend: {
        labels: {
          colors: isDarkMode ? '#e5e7eb' : '#374151'
        },
        markers: {
          size: 12,
          strokeWidth: 0
        },
        itemMargin: {
          horizontal: 10
        }
      },
      theme: {
        mode: isDarkMode ? 'dark' : 'light'
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            legend: {
              position: 'bottom',
              offsetX: 0
            }
          }
        }
      ],
      ...options
    };
    
    // Renderizar o gráfico com ApexCharts
    try {
      return (
        <div 
          ref={ref} 
          className="w-full border rounded-lg p-4 dark:border-gray-700"
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
          className="aspect-video w-full border rounded-lg p-4 flex items-center justify-center dark:border-gray-700"
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
