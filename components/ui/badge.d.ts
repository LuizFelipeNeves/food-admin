import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

declare module '@/components/ui/badge' {
  export const Badge: React.FC<BadgeProps>;
} 