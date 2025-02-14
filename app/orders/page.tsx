'use client';

import { Layout } from '@/components/layout/layout';
import { KanbanBoard } from '@/components/kanban/board';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function OrdersPage() {
  return (
    <Layout>
      <div className="h-full flex flex-col">
        <div className="shrink-0 space-y-4 p-4 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Gestão de Pedidos (Kanban)</h1>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-2">
              <Label>Cliente</Label>
              <Input
                type="search"
                placeholder="Buscar por nome..."
              />
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0 px-4 md:px-8 pb-4 md:pb-8">
          <KanbanBoard />
        </div>
      </div>
    </Layout>
  );
}