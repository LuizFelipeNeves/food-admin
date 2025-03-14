'use client';

import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Database, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DataTimestamp {
  time: Date;
  fromCache: boolean;
}

interface CacheIndicatorProps {
  dataTimestamps: Record<string, DataTimestamp | undefined>;
  refreshing: boolean;
  onRefresh: () => void;
  ttl?: number; // TTL em minutos
}

export function CacheIndicator({ 
  dataTimestamps, 
  refreshing, 
  onRefresh,
  ttl = 20 // Valor padrão de 20 minutos
}: CacheIndicatorProps) {
  // Obter o timestamp mais recente
  const getLatestTimestamp = () => {
    const timestamps = Object.values(dataTimestamps).filter(Boolean) as DataTimestamp[];
    if (timestamps.length === 0) return new Date();
    
    return timestamps.sort((a, b) => b.time.getTime() - a.time.getTime())[0].time;
  };

  // Verificar se algum dado veio do cache
  const hasCache = Object.values(dataTimestamps).some(data => data?.fromCache);

  return (
    <div className="flex items-center gap-2">
      {/* Indicador de cache */}
      <div className="text-xs text-muted-foreground flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" />
        <span>
          Atualizado: {format(getLatestTimestamp(), 'HH:mm:ss', { locale: ptBR })}
        </span>
        <span className="mx-1">•</span>
        <Database className="h-3.5 w-3.5" />
        <span>TTL: {ttl} min</span>
        {hasCache && (
          <>
            <span className="mx-1">•</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-[10px] h-5">
                    Cache
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Dados carregados do cache para melhor performance</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
      </div>
      
      {/* Botão de atualização */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh} 
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Atualizar todos os dados</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
} 