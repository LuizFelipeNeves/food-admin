'use client';

import { Layout } from '@/components/layout/layout';
import { KanbanBoard } from '@/components/kanban/board';
import { OrderFilters } from '@/components/orders/order-filters';
import { Button } from '@/components/ui/button';
import { Maximize2 } from 'lucide-react';
import { useState } from 'react';

export default function OrdersPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <Layout>
      <div className="h-full space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Pedidos (Kanban)</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullscreen}
            className="ml-auto"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        
        <OrderFilters />
        <KanbanBoard />
      </div>
    </Layout>
  );
}