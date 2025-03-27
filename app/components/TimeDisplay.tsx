'use client';

import { useEffect, useState } from 'react';

interface TimeDisplayProps {
  className?: string;
}

export function TimeDisplay({ className }: TimeDisplayProps) {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setTime(timeString);
    };

    // Atualiza imediatamente
    updateTime();

    // Atualiza a cada segundo
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <time className={className} dateTime={new Date().toISOString()}>
      {time}
    </time>
  );
} 