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
    console.log('PieChart tipo:', type);
    console.log('PieChart título:', title);
    
    if (filteredData.length === 0 && data && data.length > 0) {
      console.warn('Todos os dados foram filtrados. Dados originais:', data);
    }
    
    return () => {
      setIsMounted(false);
    };
  }, [data, filteredData, type, title]);

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
    '#818cf8', // Indigo mais brilhante e saturado
    '#38bdf8', // Sky mais brilhante
    '#34d399', // Emerald mais brilhante
    '#fbbf24', // Amber mais brilhante
    '#f472b6', // Pink mais brilhante
    '#a78bfa', // Violet mais brilhante
    '#22d3ee', // Cyan mais brilhante
    '#fb7185', // Rose mais brilhante
    '#a3e635', // Lime mais brilhante
    '#d1d5db', // Gray mais brilhante
  ];

  // Escolher o conjunto de cores com base no tema
  const defaultColors = isDarkMode ? defaultDarkColors : defaultLightColors;

  // Preparar os dados para o gráfico
  const series = filteredData.map(item => item.value);
  const labels = filteredData.map(item => item.name);
  
  // Verificação adicional para garantir que temos dados válidos
  if (!series || series.length === 0 || !labels || labels.length === 0 || series.length !== labels.length) {
    console.error('Dados inválidos para o gráfico:', { series, labels });
    return (
      <div className="h-[300px] flex items-center justify-center border rounded-lg dark:border-gray-800">
        <p className="text-muted-foreground">Dados inconsistentes para renderizar o gráfico</p>
      </div>
    );
  }

  // Verificar se há valores negativos ou zero
  if (series.some(value => value <= 0)) {
    console.warn('Gráfico contém valores zero ou negativos:', series);
  }

  // Verificar se há labels vazias
  if (labels.some(label => !label)) {
    console.warn('Gráfico contém labels vazias:', labels);
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

  // Verificar se há dados válidos para o gráfico
  console.log('PieChart series:', series);
  console.log('PieChart labels:', labels);

  try {
    // Usar um objeto mais simples para o ApexChart
    const chartOptions: ApexOptions = {
      chart: {
        type: type
      },
      colors: colors,
      labels: labels,
      legend: {
        position: 'right' as const
      },
      dataLabels: {
        enabled: false
      },
      tooltip: {
        theme: isDarkMode ? 'dark' : 'light',
        y: {
          formatter: function(val: number, { seriesIndex }: { seriesIndex: number }) {
            if (tooltipFormatter && seriesIndex < labels.length) {
              return tooltipFormatter(val, labels[seriesIndex]);
            }
            return valueFormatter(val);
          }
        }
      }
    };

    // Verificar se as opções estão corretas
    console.log('ChartOptions final:', chartOptions);

    return (
      <div className="w-full rounded-lg p-4">
        {title && (
          <h3 className="text-lg font-medium mb-4 text-center dark:text-gray-100">{title}</h3>
        )}
        {typeof window !== 'undefined' && (
          <div>
            {(() => {
              try {
                return (
                  <ApexChart
                    options={chartOptions}
                    series={series}
                    type={type}
                    height={height}
                    width="100%"
                  />
                );
              } catch (error) {
                console.error('Erro ao renderizar o gráfico de pizza:', error);
                setHasError(true);
                return (
                  <div className="h-[300px] flex items-center justify-center border rounded-lg dark:border-gray-800">
                    <p className="text-muted-foreground">Erro ao renderizar o gráfico</p>
                  </div>
                );
              }
            })()}
          </div>
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