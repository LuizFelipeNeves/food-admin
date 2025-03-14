'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Chart } from "@/components/ui/chart";
import { useTheme } from 'next-themes';
import { ApexOptions } from 'apexcharts';

export interface PieChartItem {
  name: string;
  value: number;
  color?: string;
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
  colorMap = {}
}: PieChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Verificar se os dados são válidos
  const isDataValid = data && Array.isArray(data) && data.length > 0;

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

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
    return (
      <div className="h-[300px] flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

  // Cores padrão para o gráfico
  const defaultColors = [
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

  // Preparar os dados para o gráfico
  const series = data.map(item => item.value);
  const labels = data.map(item => item.name);
  
  // Mapear cores para os itens
  const colors = data.map((item, index) => {
    // Prioridade: 1. Cor definida no item, 2. Cor do mapa, 3. Cor padrão
    return item.color || colorMap[item.name] || defaultColors[index % defaultColors.length];
  });

  // Configuração do gráfico
  const chartConfig = data.reduce((config, item, index) => {
    return {
      ...config,
      [item.name]: {
        label: item.name,
        color: colors[index],
        darkColor: colors[index], // Mesma cor para modo escuro
      }
    };
  }, {});

  // Calcular o total
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Opções adicionais para o gráfico
  const chartOptions: ApexOptions = {
    labels: labels,
    title: title ? {
      text: title,
      align: 'center',
      style: {
        fontSize: '16px',
        fontWeight: 600,
        color: isDarkMode ? '#e5e7eb' : '#374151'
      }
    } : undefined,
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '14px',
      markers: {
        size: 12,
        strokeWidth: 0,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    },
    plotOptions: {
      pie: {
        donut: type === 'donut' ? {
          size: '50%',
          labels: {
            show: showTotal,
            total: {
              show: showTotal,
              label: totalLabel,
              formatter: function() {
                return total.toString();
              }
            }
          }
        } : undefined
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val) {
        if (typeof val === 'number') {
          return valueFormatter(val);
        }
        return '';
      },
      style: {
        fontSize: '12px',
        colors: [isDarkMode ? '#fff' : '#000']
      },
      dropShadow: {
        enabled: false
      }
    },
    tooltip: {
      y: {
        formatter: function(val, { seriesIndex }) {
          if (tooltipFormatter && typeof val === 'number') {
            return tooltipFormatter(val, labels[seriesIndex]);
          }
          return val.toString();
        }
      }
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: height
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    ]
  };

  return (
    <Chart
      type={type}
      series={series}
      options={chartOptions}
      config={chartConfig}
      height={height}
    />
  );
} 