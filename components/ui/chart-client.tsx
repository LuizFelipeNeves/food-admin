'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { useTheme } from 'next-themes';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Importação dinâmica do ApexCharts
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: '', dark: '.dark' } as const;

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

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }

  return context;
}

// Componente que usa ApexCharts
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: ChartConfig;
    children?: React.ReactNode;
    forwardedRef?: React.ForwardedRef<HTMLDivElement>;
    type?: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap';
    series?: any[];
    options?: ApexOptions;
    height?: number | string;
    width?: number | string;
    dateFormat?: string; // Formato para datas
    categories?: string[]; // Categorias (eixo X)
  }
>(({ id, className, children, config, forwardedRef, type = 'line', series = [], options = {}, height = 350, width = '100%', dateFormat = 'dd/MM/yyyy', categories, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;
  const finalRef = forwardedRef || ref;
  
  // Usar um estado para controlar se o componente está montado no cliente
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
    return (
      <div
        ref={finalRef}
        className={cn(
          "flex aspect-video justify-center items-center text-xs",
          className
        )}
        {...props}
      >
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  // Obter cores do config
  const colors = Object.entries(config).map(([_, itemConfig]) => {
    if (itemConfig.theme) {
      // Se tiver theme, usar a cor do tema atual
      const themeKey = isDarkMode ? 'dark' : 'light';
      return itemConfig.theme[themeKey as keyof typeof itemConfig.theme];
    }
    return itemConfig.color || 'hsl(var(--primary))';
  });

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
    colors,
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
      <ChartContext.Provider value={{ config }}>
        <div
          ref={finalRef}
          id={chartId}
          data-chart={chartId}
          className={cn("w-full border rounded-lg p-4 dark:border-gray-700", className)}
          {...props}
        >
          {typeof window !== 'undefined' && series.length > 0 ? (
            <ApexChart
              options={defaultOptions}
              series={series}
              type={type}
              height={height}
              width={width}
            />
          ) : children || (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Dados não disponíveis para visualização
              </p>
            </div>
          )}
        </div>
        <ChartStyle id={chartId} config={config} />
      </ChartContext.Provider>
    );
  } catch (error) {
    console.error('Erro ao renderizar o gráfico:', error);
    
    // Renderizar um fallback em caso de erro
    return (
      <div
        ref={finalRef}
        className={cn(
          "flex aspect-video justify-center items-center text-xs border rounded-lg p-4 dark:border-gray-700",
          className
        )}
        {...props}
      >
        <p className="text-muted-foreground">Erro ao carregar o gráfico</p>
      </div>
    );
  }
});
ChartContainer.displayName = 'Chart';

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .filter(Boolean)
  .join('\n')}
}
`
          )
          .join('\n'),
      }}
    />
  );
};

// Componente de tooltip simplificado
const ChartTooltipComponent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>((props, ref) => {
  return <div ref={ref} {...props} />;
});
ChartTooltipComponent.displayName = 'ChartTooltip';

// Exportar o ChartContainer como default
export default ChartContainer;

// Exportar componentes de forma segura
export const ChartTooltip = ChartTooltipComponent;
export const ChartTooltipContent = ChartTooltipComponent; 