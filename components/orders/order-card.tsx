'use client';

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Order } from '@/app/types/order';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const timeAgo = formatDistanceToNow(new Date(order.orderTime), {
    addSuffix: true,
    locale: ptBR,
  });

  const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{order.orderNumber}</span>
            <Badge variant="outline">{timeAgo}</Badge>
          </div>
          <h4 className="font-medium mt-1">{order.customerName}</h4>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 space-y-2">
        {order.items.map((item) => (
          <div key={item._id} className="flex justify-between text-sm">
            <span>
              {item.quantity}x {item.name}
            </span>
            <span className="text-muted-foreground">
              R$ {item.price.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {totalItems} {totalItems === 1 ? 'item' : 'itens'}
        </div>
        <div className="font-semibold">
          R$ {order.totalValue.toFixed(2)}
        </div>
      </div>
    </Card>
  );
}