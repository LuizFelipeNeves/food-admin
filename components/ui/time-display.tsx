'use client';

import { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

interface TimeDisplayProps {
  className?: string;
  /**
   * Data fixa para exibir. Se não fornecida, mostra o horário atual atualizado a cada segundo
   */
  fixedDate?: Date | string;
}

export function TimeDisplay({ className, fixedDate }: TimeDisplayProps) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    };

    if (fixedDate) {
      const date = typeof fixedDate === 'string' ? new Date(fixedDate) : fixedDate;
      setTime(formatTime(date));
      return;
    }

    const updateTime = () => {
      setTime(formatTime(new Date()));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [fixedDate]);

  // Não renderiza nada até o componente estar montado no cliente
  if (!mounted) {
    return null;
  }

  // Não inclui o atributo dateTime para evitar erros de hidratação
  return (
    <time className={cn("text-muted-foreground", className)}>
      {time}
    </time>
  );
} 