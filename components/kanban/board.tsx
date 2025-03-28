"use client";

import { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Clock, MoreVertical, CreditCard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { COLUMNS, PAYMENT_METHODS, type Order } from "@/types/order";
import { OrderDetails } from "../orders/order-details";
import { trpc as api } from "@/app/_trpc/client";
import { useToast } from "../ui/use-toast";
import { Skeleton } from "../ui/skeleton";
import { EditOrderModal } from "../orders/edit-order-modal";
import { useStoreId } from "@/hooks/useStoreId";

export function KanbanBoard() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const { toast } = useToast();
  const utils = api.useUtils();
  const storeId = useStoreId();

  const { data: orders = [], isLoading } = api.orders.getKanbanOrders.useQuery(
    { storeId },
    {
      refetchInterval: 15000,
      onError: () => {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar os pedidos",
        });
      },
    }
  );

  const { mutate: updateStatus } = api.orders.updateStatus.useMutation({
    onMutate: async ({ orderId, status }) => {
      // Cancelar queries em andamento
      await utils.orders.getKanbanOrders.cancel();

      // Snapshot do estado anterior
      const previousOrders = utils.orders.getKanbanOrders.getData({ storeId });

      // Atualizar a ordem otimisticamente
      utils.orders.getKanbanOrders.setData({ storeId }, (old) => {
        if (!old) return previousOrders;
        return old.map((order) =>
          order._id === orderId ? { ...order, status } : order
        );
      });

      return { previousOrders };
    },
    onError: (_err, _variables, context: any) => {
      // Reverter para o estado anterior em caso de erro
      if (context?.previousOrders) {
        utils.orders.getKanbanOrders.setData({ storeId }, context.previousOrders);
      }
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o status do pedido",
      });
    },
    onSuccess: (data: { order: any }) => {
      // Atualizar o cache com o pedido retornado do servidor
      utils.orders.getKanbanOrders.setData({ storeId }, (old) => {
        if (!old) return [];
        return old.map((oldOrder: any) => 
          oldOrder._id === data.order._id ? data.order : oldOrder
        );
      });
    }
  });

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      return;
    }

    updateStatus({
      orderId: result.draggableId,
      status: destination.droppableId,
    });
  };

  if (isLoading) {
    return <KanbanSkeleton />;
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="h-full overflow-x-auto">
          <div className="inline-flex gap-3 h-full pb-4">
            {Object.entries(COLUMNS).map(([status, column]) => (
              <div key={status} className="flex flex-col w-[250px]">
                <div className={`p-2 rounded-t-lg ${column.color}`}>
                  <h3 className="font-medium flex items-center justify-between text-foreground dark:text-zinc-900 text-sm">
                    {column.title}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {orders.filter((order) => order.status === status).length}
                    </Badge>
                  </h3>
                </div>
                <div className="p-1.5 bg-muted/50 rounded-b-lg flex-1">
                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`h-full overflow-y-auto space-y-1.5 pr-1.5 -mr-1.5 ${
                          snapshot.isDraggingOver ? "bg-muted/10" : ""
                        }`}
                      >
                        {orders
                          .filter((order) => order.status === status)
                          .map((order, index) => (
                            <Draggable
                              key={order._id}
                              draggableId={order._id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-2 bg-background border shadow-sm hover:shadow-md transition-all ${
                                    snapshot.isDragging
                                      ? "rotate-2 shadow-lg"
                                      : ""
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-[11px] text-muted-foreground">
                                        {order.createdAt.substring(11, 16)}
                                      </span>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button className="p-0.5 hover:bg-muted rounded-md">
                                          <MoreVertical className="h-3 w-3" />
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={() =>
                                            setSelectedOrder(
                                              order as unknown as Order
                                            )
                                          }
                                        >
                                          Ver detalhes
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setEditingOrder(order as unknown as Order);
                                          }}
                                        >
                                          Editar pedido
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>

                                  <div className="mt-1">
                                    <div className="text-xs font-medium">
                                      #{order._id.slice(-8).toUpperCase()}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground truncate">
                                      {order.user?.name || 'Cliente não identificado'}
                                    </div>
                                  </div>

                                  <div className="mt-1 flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-1">
                                      <CreditCard className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-muted-foreground">
                                        {
                                          PAYMENT_METHODS[
                                            order.paymentMethod as keyof typeof PAYMENT_METHODS
                                          ]?.label
                                        }
                                      </span>
                                    </div>
                                    <div className="font-medium">
                                      {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                      }).format(order.total)}
                                    </div>
                                  </div>

                                  <div className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                                    {order.items
                                      .map(
                                        (item: {
                                          quantity: number;
                                          name: string;
                                        }) => `${item.quantity}x ${item.name}`
                                      )
                                      .join(", ")}
                                  </div>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>

      <OrderDetails
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      />

      <EditOrderModal
        order={editingOrder}
        open={!!editingOrder}
        onOpenChange={(open) => !open && setEditingOrder(null)}
        onOrderUpdated={() => {
          utils.orders.getKanbanOrders.invalidate();
        }}
      />
    </>
  );
}

function KanbanSkeleton() {
  return (
    <div className="flex gap-3 h-full">
      {Object.values(COLUMNS).map((column) => (
        <div key={column.id} className="w-[250px]">
          <div className={`p-2 rounded-t-lg ${column.color}`}>
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="p-1.5 bg-muted/50 rounded-b-lg">
            <div className="space-y-2">
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} className="h-24 w-full" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
