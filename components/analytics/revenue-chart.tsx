'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

// Importação dinâmica do ApexCharts
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface RevenueData {
  name: string;
  total: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Verificar se os dados são válidos
  const isDataValid = data && Array.isArray(data) && data.length > 0;

  // Verificar se os dados têm a estrutura esperada
  const validData = isDataValid
    ? data.filter(item => 
        item && 
        typeof item === 'object' && 
        'name' in item && 
        'total' in item && 
        typeof item.total === 'number'
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
      <div className="h-[240px] flex items-center justify-center">
        <Skeleton className="h-[240px] w-full" />
      </div>
    );
  }

  // Renderizar um fallback se os dados forem inválidos
  if (!isDataValid || validData.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center border rounded-lg">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

  // Preparar os dados para o ApexCharts
  const series = [
    {
      name: 'Receita',
      data: validData.map(item => item.total)
    }
  ];

  // Configuração do gráfico
  const options: ApexOptions = {
    chart: {
      type: 'bar' as const,
      toolbar: {
        show: false
      },
      fontFamily: 'inherit'
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%',
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: validData.map(item => item.name),
      labels: {
        style: {
          colors: '#888888',
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
    yaxis: {
      labels: {
        formatter: function(val: number) {
          return `R$ ${val.toFixed(0)}`;
        },
        style: {
          colors: '#888888',
          fontSize: '12px'
        }
      }
    },
    grid: {
      borderColor: '#f1f1f1',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false
        }
      }
    },
    fill: {
      type: 'solid',
      opacity: 1
    },
    colors: ['hsl(var(--primary))'],
    tooltip: {
      y: {
        formatter: function(val: number) {
          return `R$ ${val.toFixed(2)}`;
        }
      }
    }
  };

  // Renderizar o gráfico com ApexCharts
  try {
    return (
      <div className="h-[240px]">
        {typeof window !== 'undefined' && (
          <ApexChart
            options={options}
            series={series}
            type="bar"
            height={240}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error('Erro ao renderizar o gráfico:', error);
    
    // Renderizar uma tabela simples como fallback
    return (
      <div className="h-[240px] w-full overflow-auto border rounded-lg p-4">
        <h3 className="text-center mb-4 font-medium">Receita Mensal</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Mês</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {validData.map((item, index) => (
              <tr key={index} className="border-b hover:bg-muted/50">
                <td className="p-2">{item.name}</td>
                <td className="p-2 text-right">R$ {item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
} 