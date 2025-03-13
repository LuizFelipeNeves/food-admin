'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { useTheme } from 'next-themes';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Importação dinâmica do ApexCharts
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface RevenueData {
  name: string;
  date?: string; // Campo opcional para data em formato ISO
  total: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

// Função para formatar data
function formatDateLabel(item: RevenueData): string {
  // Se tiver um campo date em formato ISO, formata corretamente
  if (item.date && isValidISODate(item.date)) {
    try {
      const date = parseISO(item.date);
      return format(date, 'MMM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return item.name;
    }
  }
  
  // Tenta interpretar o name como data se parecer com um timestamp ou mês
  if (item.name && !isNaN(Date.parse(item.name))) {
    try {
      const date = new Date(item.name);
      return format(date, 'MMM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar name como data:', error);
    }
  }
  
  // Retorna o name original se não conseguir formatar
  return item.name;
}

// Verifica se uma string é uma data ISO válida
function isValidISODate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;
  return regex.test(dateString) && !isNaN(Date.parse(dateString));
}

export default function RevenueChart({ data }: RevenueChartProps) {
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
        typeof item.total === 'number'
      )
    : [];

  // Ordenar os dados por data se possível
  const sortedData = [...validData].sort((a, b) => {
    // Se ambos têm campo date, ordenar por ele
    if (a.date && b.date && isValidISODate(a.date) && isValidISODate(b.date)) {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    
    // Se ambos os nomes parecem ser datas, ordenar por eles
    if (!isNaN(Date.parse(a.name)) && !isNaN(Date.parse(b.name))) {
      return new Date(a.name).getTime() - new Date(b.name).getTime();
    }
    
    // Caso contrário, manter a ordem original
    return 0;
  });

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
      data: sortedData.map(item => item.total)
    }
  ];

  // Formatar as categorias (labels do eixo X)
  const categories = sortedData.map(item => formatDateLabel(item));

  // Cores para modo claro e escuro
  const barColor = isDarkMode ? '#60a5fa' : '#3b82f6'; // Azul mais claro para modo escuro

  // Configuração do gráfico
  const options: ApexOptions = {
    chart: {
      type: 'bar' as const,
      toolbar: {
        show: false
      },
      fontFamily: 'inherit',
      background: 'transparent'
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '60%',
        distributed: false,
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: categories,
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
      },
      tooltip: {
        enabled: true
      }
    },
    yaxis: {
      title: {
        text: 'Receita (R$)',
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
    grid: {
      borderColor: isDarkMode ? '#374151' : '#e5e7eb',
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
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.2,
        gradientToColors: undefined,
        inverseColors: false,
        opacityFrom: 0.85,
        opacityTo: 0.85
      }
    },
    colors: [barColor],
    tooltip: {
      theme: isDarkMode ? 'dark' : 'light',
      x: {
        formatter: function(val: number, { dataPointIndex }: { dataPointIndex: number }) {
          return categories[dataPointIndex];
        }
      },
      y: {
        formatter: function(val: number) {
          return `R$ ${val.toFixed(2)}`;
        }
      },
      marker: {
        show: true
      }
    },
    states: {
      hover: {
        filter: {
          type: 'darken'
        }
      },
      active: {
        filter: {
          type: 'darken'
        }
      }
    },
    theme: {
      mode: isDarkMode ? 'dark' : 'light'
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '80%'
            }
          }
        }
      }
    ]
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
            {sortedData.map((item, index) => (
              <tr key={index} className="border-b hover:bg-muted/50">
                <td className="p-2">{formatDateLabel(item)}</td>
                <td className="p-2 text-right">R$ {item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
} 