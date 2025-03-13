'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { useTheme } from 'next-themes';

// Importação dinâmica do ApexCharts
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Definir interfaces
interface SaleStatus {
  completed: number;
  preparing: number;
  ready: number;
  pending: number;
}

interface SaleData {
  name: string;
  total: number;
  subtotal: number;
  deliveryFees: number;
  orders: number;
  average: number;
  status: SaleStatus;
}

interface ChartComponentProps {
  data: SaleData[];
}

// Componente principal que será exportado
export default function ChartComponent({ data }: ChartComponentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Verificar se os dados são válidos
  const isDataValid = data && Array.isArray(data) && data.length > 0;

  // Verificar se os dados têm a estrutura esperada
  const validData = isDataValid
    ? data.filter(item => 
        item && 
        typeof item === 'object' && 
        'name' in item && 
        'total' in item && 
        'subtotal' in item && 
        'deliveryFees' in item && 
        'orders' in item
      )
    : [];

  useEffect(() => {
    // Marcar o componente como montado
    setIsMounted(true);
    
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Renderizar um fallback enquanto o componente não está montado
  if (!isMounted) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center">
        <Skeleton className="h-[350px] w-full" />
      </div>
    );
  }

  // Renderizar um fallback se os dados forem inválidos
  if (!isDataValid || validData.length === 0) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

  // Preparar os dados para o ApexCharts
  const series = [
    {
      name: 'Total',
      data: validData.map(item => item.total)
    },
    {
      name: 'Subtotal',
      data: validData.map(item => item.subtotal)
    },
    {
      name: 'Taxa de Entrega',
      data: validData.map(item => item.deliveryFees)
    }
  ];

  const orderSeries = [
    {
      name: 'Pedidos',
      data: validData.map(item => item.orders)
    }
  ];

  // Cores para modo claro e escuro
  const colors = isDarkMode 
    ? ['#60a5fa', '#a78bfa', '#fbbf24', '#34d399'] // Cores para modo escuro
    : ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981']; // Cores para modo claro

  // Configuração do gráfico
  const options: ApexOptions = {
    chart: {
      type: 'bar' as const,
      stacked: false,
      toolbar: {
        show: false
      },
      fontFamily: 'inherit',
      background: 'transparent'
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
        dataLabels: {
          position: 'top'
        }
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: validData.map(item => item.name),
      labels: {
        style: {
          colors: isDarkMode ? '#9ca3af' : '#6b7280',
          fontSize: '12px'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: [
      {
        title: {
          text: 'Valores (R$)',
          style: {
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            fontWeight: 500
          }
        },
        labels: {
          formatter: function(val: number) {
            return `R$ ${val.toFixed(0)}`;
          },
          style: {
            colors: isDarkMode ? '#9ca3af' : '#6b7280',
            fontSize: '12px'
          }
        }
      },
      {
        opposite: true,
        title: {
          text: 'Pedidos',
          style: {
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            fontWeight: 500
          }
        },
        labels: {
          formatter: function(val: number) {
            return val.toFixed(0);
          },
          style: {
            colors: isDarkMode ? '#9ca3af' : '#6b7280',
            fontSize: '12px'
          }
        }
      }
    ],
    tooltip: {
      shared: true,
      intersect: false,
      theme: isDarkMode ? 'dark' : 'light',
      y: {
        formatter: function(val: number, { seriesIndex }: { seriesIndex: number }) {
          return seriesIndex < 3 ? `R$ ${val.toFixed(2)}` : val.toString();
        }
      },
      marker: {
        show: true
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      offsetX: 40,
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
    fill: {
      opacity: 1
    },
    grid: {
      borderColor: isDarkMode ? '#374151' : '#e5e7eb',
      strokeDashArray: 4,
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
    colors: colors,
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
    ]
  };

  // Renderizar o gráfico com ApexCharts
  try {
    return (
      <div className="h-[350px] w-full">
        {typeof window !== 'undefined' && (
          <ApexChart
            options={options}
            series={[...series, ...orderSeries]}
            type="bar"
            height={350}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error('Erro ao renderizar o gráfico:', error);
    
    // Renderizar uma tabela simples como fallback
    return (
      <div className="h-[350px] w-full overflow-auto border rounded-lg p-4">
        <h3 className="text-center mb-4 font-medium">Dados de Vendas por Hora</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Horário</th>
              <th className="p-2 text-right">Total</th>
              <th className="p-2 text-right">Subtotal</th>
              <th className="p-2 text-right">Taxa de Entrega</th>
              <th className="p-2 text-right">Pedidos</th>
            </tr>
          </thead>
          <tbody>
            {validData.map((item, index) => (
              <tr key={index} className="border-b hover:bg-muted/50">
                <td className="p-2">{item.name}</td>
                <td className="p-2 text-right">R$ {item.total.toFixed(2)}</td>
                <td className="p-2 text-right">R$ {item.subtotal.toFixed(2)}</td>
                <td className="p-2 text-right">R$ {item.deliveryFees.toFixed(2)}</td>
                <td className="p-2 text-right">{item.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
} 