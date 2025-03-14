'use client';

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { useTheme } from 'next-themes';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Importação dinâmica do ApexCharts
const ApexChart = dynamic(() => import('react-apexcharts'), { 
  ssr: false,
  loading: () => <Skeleton className="aspect-video w-full" />
});

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
    const [hasError, setHasError] = React.useState(false);
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    
    React.useEffect(() => {
      setIsMounted(true);
      console.log('Chart montado com tipo:', type);
      console.log('Chart series:', series);
      console.log('Chart options:', options);
      return () => {
        setIsMounted(false);
      };
    }, [type, series, options]);
    
    if (!isMounted) {
      return <Skeleton className="aspect-video w-full" />;
    }
    
    // Verificar se os dados são válidos
    if (!series || (Array.isArray(series) && series.length === 0)) {
      console.log('Chart: Dados inválidos ou vazios');
      return (
        <div
          ref={ref}
          className="aspect-video w-full border rounded-lg p-4 flex items-center justify-center dark:border-gray-700"
          {...props}
        >
          <p className="text-muted-foreground">
            Nenhum dado disponível para o gráfico
          </p>
        </div>
      );
    }
    
    // Verificações adicionais para gráficos de pizza/donut
    if ((type === 'pie' || type === 'donut')) {
      console.log('Chart: Verificando dados para gráfico de pizza/donut', series);
      
      // Para gráficos de pizza/donut, o ApexCharts espera um array simples de números
      if (!Array.isArray(series)) {
        console.error('Chart: Dados inválidos para gráfico de pizza/donut. Esperado array de números.');
        return (
          <div
            ref={ref}
            className="aspect-video w-full border rounded-lg p-4 flex items-center justify-center dark:border-gray-700"
            {...props}
          >
            <p className="text-muted-foreground">
              Formato de dados inválido para o gráfico
            </p>
          </div>
        );
      }
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
        background: 'transparent',
        animations: {
          enabled: true,
          speed: 800,
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        }
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
      console.log('Chart: Renderizando com opções:', defaultOptions);
      console.log('Chart: Renderizando com series:', series);
      
      if (hasError) {
        return (
          <div
            ref={ref}
            className="aspect-video w-full border rounded-lg p-4 flex items-center justify-center dark:border-gray-700"
            {...props}
          >
            <p className="text-muted-foreground">
              Erro ao carregar o gráfico. Tente novamente mais tarde.
            </p>
          </div>
        );
      }
      
      // Garantir que o tipo de gráfico seja compatível com o formato dos dados
      let chartType = type;
      let chartSeries = series;
      let chartOptions = { ...defaultOptions };
      
      // Para gráficos de pizza/donut, garantir que os dados estejam no formato correto
      if ((chartType === 'pie' || chartType === 'donut') && Array.isArray(chartSeries)) {
        // Verificar se todos os valores são números
        const allNumbers = chartSeries.every(val => typeof val === 'number');
        if (!allNumbers) {
          console.warn('Chart: Convertendo dados para formato compatível com gráfico de pizza/donut');
          // Se não forem todos números, tentar extrair valores numéricos
          chartSeries = chartSeries.map(item => {
            if (typeof item === 'number') return item;
            if (typeof item === 'object' && item !== null && 'value' in item) {
              return (item as any).value;
            }
            return 0;
          }).filter(val => val > 0);
        }
        
        // Verificar se há dados após a filtragem
        if (chartSeries.length === 0) {
          console.error('Chart: Nenhum dado válido para o gráfico de pizza/donut após filtragem');
          return (
            <div
              ref={ref}
              className="aspect-video w-full border rounded-lg p-4 flex items-center justify-center dark:border-gray-700"
              {...props}
            >
              <p className="text-muted-foreground">
                Nenhum dado disponível para o gráfico
              </p>
            </div>
          );
        }
        
        // Garantir que as opções tenham labels definidos
        if (!chartOptions.labels || chartOptions.labels.length === 0) {
          console.warn('Chart: Labels não definidos para gráfico de pizza/donut');
          
          // Tentar extrair labels dos dados
          if (Array.isArray(series) && series.length > 0 && typeof series[0] === 'object' && series[0] !== null) {
            const firstItem = series[0] as any;
            if ('name' in firstItem) {
              chartOptions.labels = (series as any[]).map(item => item.name || 'Sem nome');
            }
          }
          
          // Se ainda não tiver labels, criar labels genéricos
          if (!chartOptions.labels || chartOptions.labels.length === 0) {
            chartOptions.labels = chartSeries.map((_, i) => `Item ${i + 1}`);
          }
        }
        
        // Garantir que as cores estejam definidas
        if (!chartOptions.colors || chartOptions.colors.length === 0) {
          chartOptions.colors = [
            '#4f46e5', // Indigo
            '#0ea5e9', // Sky
            '#10b981', // Emerald
            '#f59e0b', // Amber
            '#ec4899', // Pink
            '#8b5cf6', // Violet
            '#06b6d4', // Cyan
            '#f43f5e', // Rose
            '#84cc16', // Lime
            '#6b7280', // Gray
          ];
        }
      }
      
      console.log('Chart: Renderizando com opções finais:', chartOptions);
      console.log('Chart: Renderizando com series finais:', chartSeries);
      
      return (
        <div
          ref={ref}
          className="w-full border rounded-lg p-4 dark:border-gray-700"
          {...props}
        >
          {typeof window !== 'undefined' && (
            <React.Suspense fallback={<Skeleton className="aspect-video w-full" />}>
              <ApexChart
                options={chartOptions}
                series={chartSeries}
                type={chartType}
                height={height}
                width={width}
                onError={(e: Error) => {
                  console.error('Chart: Erro ao renderizar o gráfico:', e);
                  setHasError(true);
                }}
              />
            </React.Suspense>
          )}
        </div>
      );
    } catch (error) {
      console.error('Erro ao renderizar o gráfico:', error);
      setHasError(true);
      
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
