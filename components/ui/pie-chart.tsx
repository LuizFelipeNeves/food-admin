'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

// Importação dinâmica do ApexCharts
const ApexChart = dynamic(() => import('react-apexcharts'), { 
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full" />
});

export interface PieChartItem {
  name: string;
  value: number;
  color?: string;
  darkColor?: string; // Cor específica para o modo escuro
}

export interface PieChartProps {
  data: PieChartItem[];
  title?: string;
  height?: number;
  type?: 'pie' | 'donut';
  showTotal?: boolean;
  totalLabel?: string;
  valueFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number, name: string) => string;
  colorMap?: Record<string, string>;
  darkColorMap?: Record<string, string>; // Mapa de cores para modo escuro
}

export default function PieChart({ 
  data, 
  title, 
  height = 300, 
  type = 'donut',
  showTotal = true,
  totalLabel = 'Total',
  valueFormatter = (value: number) => `${value.toFixed(1)}%`,
  tooltipFormatter,
  colorMap = {},
  darkColorMap = {}
}: PieChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Filtrar dados inválidos (valores zero ou undefined)
  const filteredData = data?.filter(item => 
    item && typeof item.name === 'string' && 
    typeof item.value === 'number' && 
    item.value > 0
  ) || [];

  // Verificar se os dados são válidos
  const isDataValid = filteredData && filteredData.length > 0;

  useEffect(() => {
    setIsMounted(true);
    console.log('PieChart montado com dados:', data);
    console.log('PieChart dados filtrados:', filteredData);
    return () => {
      setIsMounted(false);
    };
  }, [data, filteredData]);

  // Renderizar um fallback enquanto o componente não está montado
  if (!isMounted) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  // Renderizar um fallback se os dados forem inválidos
  if (!isDataValid) {
    console.log('Dados inválidos para o gráfico:', data);
    return (
      <div className="h-[300px] flex items-center justify-center border rounded-lg dark:border-gray-800">
        <p className="text-muted-foreground">Nenhum dado disponível ou valores zerados</p>
      </div>
    );
  }

  // Renderizar um fallback se houver erro
  if (hasError) {
    return (
      <div className="h-[300px] flex items-center justify-center border rounded-lg dark:border-gray-800">
        <p className="text-muted-foreground">Erro ao carregar o gráfico</p>
      </div>
    );
  }

  // Cores padrão para o gráfico (modo claro)
  const defaultLightColors = [
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

  // Cores padrão para o gráfico (modo escuro) - mais vibrantes para melhor contraste
  const defaultDarkColors = [
    '#6366f1', // Indigo mais brilhante
    '#38bdf8', // Sky mais brilhante
    '#34d399', // Emerald mais brilhante
    '#fbbf24', // Amber mais brilhante
    '#f472b6', // Pink mais brilhante
    '#a78bfa', // Violet mais brilhante
    '#22d3ee', // Cyan mais brilhante
    '#fb7185', // Rose mais brilhante
    '#a3e635', // Lime mais brilhante
    '#9ca3af', // Gray mais brilhante
  ];

  // Escolher o conjunto de cores com base no tema
  const defaultColors = isDarkMode ? defaultDarkColors : defaultLightColors;

  // Preparar os dados para o gráfico
  const series = filteredData.map(item => item.value);
  const labels = filteredData.map(item => item.name);
  
  // Verificação adicional para garantir que temos dados válidos
  if (!series.length || !labels.length) {
    console.log('Séries ou labels vazios:', { series, labels });
    return (
      <div className="h-[300px] flex items-center justify-center border rounded-lg dark:border-gray-800">
        <p className="text-muted-foreground">Dados insuficientes para renderizar o gráfico</p>
      </div>
    );
  }

  // Mapear cores para os itens com suporte a modo escuro
  const colors = filteredData.map((item, index) => {
    if (isDarkMode) {
      // Prioridade para modo escuro: 1. darkColor do item, 2. darkColorMap, 3. color do item, 4. colorMap, 5. cor padrão escura
      return item.darkColor || 
             darkColorMap[item.name] || 
             item.color || 
             colorMap[item.name] || 
             defaultDarkColors[index % defaultDarkColors.length];
    } else {
      // Prioridade para modo claro: 1. color do item, 2. colorMap, 3. cor padrão clara
      return item.color || 
             colorMap[item.name] || 
             defaultLightColors[index % defaultLightColors.length];
    }
  });

  // Calcular o total
  const total = filteredData.reduce((sum, item) => sum + item.value, 0);

  // Configuração básica do gráfico
  const options: ApexOptions = {
    chart: {
      type: type,
      background: 'transparent',
      foreColor: isDarkMode ? '#e5e7eb' : '#374151', // Cor do texto base
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    colors: colors,
    labels: labels,
    legend: {
      position: 'right',
      horizontalAlign: 'center',
      floating: false,
      fontSize: '14px',
      fontFamily: 'inherit',
      offsetX: 0,
      offsetY: 0,
      labels: {
        colors: isDarkMode ? '#e5e7eb' : '#374151' // Cor do texto da legenda
      },
      markers: {
        fillColors: colors,
        strokeWidth: 0,
      },
      itemMargin: {
        horizontal: 12,
        vertical: 5
      }
    },
    stroke: {
      width: isDarkMode ? 2 : 1,
      colors: isDarkMode ? ['#1f2937'] : ['#ffffff'] // Borda entre segmentos
    },
    dataLabels: {
      enabled: false, // Desativando os rótulos de dados para um visual mais limpo
    },
    plotOptions: {
      pie: {
        customScale: 0.9, // Reduzir um pouco o tamanho do gráfico para evitar problemas de renderização
        expandOnClick: false,
        donut: type === 'donut' ? {
          size: '60%',
          background: 'transparent',
          labels: {
            show: showTotal,
            name: {
              show: true,
              fontSize: '14px',
              fontFamily: 'inherit',
              color: isDarkMode ? '#e5e7eb' : '#374151',
              offsetY: -10
            },
            value: {
              show: true,
              fontSize: '22px',
              fontFamily: 'inherit',
              color: isDarkMode ? '#ffffff' : '#000000',
              offsetY: 5,
              formatter: function(val) {
                return total.toString();
              }
            },
            total: {
              show: true,
              label: totalLabel,
              color: isDarkMode ? '#e5e7eb' : '#374151',
              formatter: function() {
                return total.toString();
              }
            }
          }
        } : undefined
      }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: {
          width: '100%'
        },
        legend: {
          position: 'bottom',
          horizontalAlign: 'center',
          offsetY: 10,
          fontSize: '12px'
        },
        dataLabels: {
          style: {
            fontSize: '12px'
          }
        }
      }
    }],
    tooltip: {
      enabled: true,
      theme: isDarkMode ? 'dark' : 'light',
      style: {
        fontSize: '14px',
        fontFamily: 'inherit'
      },
      y: {
        formatter: function(val: number, { seriesIndex }: { seriesIndex: number }) {
          if (tooltipFormatter && seriesIndex < labels.length) {
            return tooltipFormatter(val, labels[seriesIndex]);
          }
          return valueFormatter(val);
        }
      }
    },
    states: {
      hover: {
        filter: {
          type: 'darken',
        }
      },
      active: {
        filter: {
          type: 'darken',
        }
      }
    }
  };

  // Verificar se há dados válidos para o gráfico
  console.log('PieChart series:', series);
  console.log('PieChart labels:', labels);
  console.log('PieChart options:', options);

  // Formato correto para gráficos de pizza/donut no ApexCharts
  try {
    // Verificação final para garantir que temos todos os dados necessários
    if (!series || !series.length || !labels || !labels.length || series.length !== labels.length) {
      console.error('Dados inválidos para o gráfico:', { series, labels });
      return (
        <div className="h-[300px] flex items-center justify-center border rounded-lg dark:border-gray-800">
          <p className="text-muted-foreground">Dados inconsistentes para renderizar o gráfico</p>
        </div>
      );
    }

    // Criar uma cópia simplificada das opções para evitar problemas de referência
    const chartOptions = {
      chart: {
        type: type,
        background: 'transparent'
      },
      colors: colors,
      labels: labels,
      legend: {
        position: 'right' as const,
        horizontalAlign: 'center' as const
      },
      stroke: {
        width: isDarkMode ? 2 : 1
      },
      dataLabels: {
        enabled: false
      },
      tooltip: {
        enabled: true,
        theme: isDarkMode ? 'dark' : 'light',
        y: {
          formatter: function(val: number, { seriesIndex }: { seriesIndex: number }) {
            if (tooltipFormatter && seriesIndex < labels.length) {
              return tooltipFormatter(val, labels[seriesIndex]);
            }
            return valueFormatter(val);
          }
        }
      },
      responsive: [{
        breakpoint: 768,
        options: {
          legend: {
            position: 'bottom' as const
          }
        }
      }]
    };

    return (
      <div className="w-full rounded-lg p-4 bg-transparent">
        {title && (
          <h3 className="text-lg font-medium mb-4 text-center dark:text-gray-100">{title}</h3>
        )}
        {typeof window !== 'undefined' && (
          <ApexChart
            options={chartOptions}
            series={series}
            type={type}
            height={height}
            width="100%"
            onError={(e: Error) => {
              console.error('Erro ao renderizar o gráfico de pizza:', e);
              setHasError(true);
            }}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error('Erro ao renderizar o gráfico de pizza:', error);
    return (
      <div className="h-[300px] flex items-center justify-center border rounded-lg dark:border-gray-800">
        <p className="text-muted-foreground">Erro ao carregar o gráfico</p>
      </div>
    );
  }
} 