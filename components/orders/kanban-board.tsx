'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { OrderCard } from './order-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Order } from '@/app/types/order';

const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: '#12345',
    customerName: 'João Silva',
    orderTime: new Date(),
    items: [
      { id: '1', name: 'X-Burger', quantity: 2, price: 18.90 },
      { id: '2', name: 'Batata Frita', quantity: 1, price: 12.90 }
    ],
    totalValue: 50.70,
    status: 'pending',
    waitTime: 15
  },
  {
    id: '2',
    orderNumber: '#12346',
    customerName: 'João Silva s',
    orderTime: new Date(),
    items: [
      { id: '1', name: 'X-Burger', quantity: 2, price: 18.90 },
      { id: '2', name: 'Batata Frita', quantity: 1, price: 12.90 }
    ],
    totalValue: 50.70,
    status: 'pending',
    waitTime: 15
  }
];

const COLUMNS = [
  { id: 'pending', title: 'Pendente', color: 'bg-yellow-100 dark:bg-yellow-900' },
  { id: 'accepted', title: 'Aceito', color: 'bg-blue-100 dark:bg-blue-900' },
  { id: 'preparing', title: 'Em Preparação', color: 'bg-orange-100 dark:bg-orange-900' },
  { id: 'ready', title: 'Pronto para Entrega', color: 'bg-green-100 dark:bg-green-900' },
  { id: 'delivering', title: 'Em Rota', color: 'bg-purple-100 dark:bg-purple-900' },
  { id: 'delivered', title: 'Finalizado', color: 'bg-gray-100 dark:bg-gray-900' }
];

export function KanbanBoard() {
  const [orders, setOrders] = useState(MOCK_ORDERS);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Não faça nada se a posição de origem e destino for a mesma
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const reorderedOrders = Array.from(orders);

    // Remover o item da posição original
    const [movedOrder] = reorderedOrders.splice(source.index, 1);
    
    // Atualizar o status do pedido para a nova coluna
    movedOrder.status = destination.droppableId;

    // Inserir o item na nova posição
    reorderedOrders.splice(destination.index, 0, movedOrder);

    setOrders(reorderedOrders);
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-12rem)] overflow-x-auto pb-4">
      <DragDropContext onDragEnd={onDragEnd}>
        {COLUMNS.map((column) => (
          <div key={column.id} className="flex flex-col min-w-[320px] w-[320px] rounded-lg">
            <div className={`p-3 rounded-t-lg ${column.color}`}>
              <h3 className="font-semibold">{column.title}</h3>
              <div className="text-sm text-muted-foreground">
                {orders.filter((order) => order.status === column.id).length} pedidos
              </div>
            </div>

            <Droppable droppableId={column.id}>
              {(provided) => (
                <ScrollArea className="flex-1 bg-muted/20 rounded-b-lg">
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="p-2 space-y-2"
                  >
                    {orders
                      .filter((order) => order.status === column.id)
                      .map((order, index) => (
                        <Draggable
                          key={order.id}
                          draggableId={order.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <OrderCard order={order} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                </ScrollArea>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>
    </div>
  );
}
