'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: '', dark: '.dark' } as const;

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

// Componente simplificado que não usa Recharts diretamente
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: ChartConfig;
    children: React.ReactNode;
    forwardedRef?: React.ForwardedRef<HTMLDivElement>;
  }
>(({ id, className, children, config, forwardedRef, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;
  const finalRef = forwardedRef || ref;
  
  // Verificar se children é um elemento React válido
  const validChildren = React.isValidElement(children) ? children : null;
  
  // Usar um estado para controlar se o componente está montado no cliente
  const [isMounted, setIsMounted] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [RechartsLoaded, setRechartsLoaded] = React.useState(false);
  
  React.useEffect(() => {
    try {
      setIsMounted(true);
      
      // Carregar Recharts apenas no cliente
      const loadRecharts = async () => {
        try {
          if (typeof window !== 'undefined') {
            // Usar um timeout para garantir que o DOM esteja completamente carregado
            setTimeout(async () => {
              try {
                await import('recharts');
                setRechartsLoaded(true);
              } catch (error) {
                console.error('Erro ao carregar o Recharts:', error);
                setHasError(true);
              }
            }, 500);
          }
        } catch (error) {
          console.error('Erro ao carregar o Recharts:', error);
          setHasError(true);
        }
      };
      
      loadRecharts();
    } catch (error) {
      console.error('Erro ao montar o componente:', error);
      setHasError(true);
    }
    
    return () => {
      try {
        setIsMounted(false);
        setRechartsLoaded(false);
      } catch (error) {
        console.error('Erro ao desmontar o componente:', error);
      }
    };
  }, []);

  if (hasError) {
    return (
      <div
        ref={finalRef}
        className={cn(
          "flex aspect-video justify-center items-center text-xs",
          className
        )}
        {...props}
      >
        <p className="text-muted-foreground">Erro ao carregar o gráfico</p>
      </div>
    );
  }

  if (!isMounted || !RechartsLoaded) {
    return (
      <div
        ref={finalRef}
        className={cn(
          "flex aspect-video justify-center items-center text-xs",
          className
        )}
        {...props}
      >
        <p className="text-muted-foreground">Carregando gráfico...</p>
      </div>
    );
  }

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={finalRef}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        {validChildren}
      </div>
    </ChartContext.Provider>
  );
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