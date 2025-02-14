'use client'

import { useState } from "react"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import { Card } from "../ui/card"
import { Badge } from "../ui/badge"
import { Clock, MoreVertical, CreditCard } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { mockOrders, COLUMNS, PAYMENT_METHODS, type Order } from "@/data/orders"
import { OrderDetails } from "../orders/order-details"

export function KanbanBoard() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination } = result

    const reorderedOrders = Array.from(orders)
    const [movedOrder] = reorderedOrders.splice(source.index, 1)
    
    // Atualizar o status do pedido para a nova coluna
    movedOrder.status = destination.droppableId as Order['status']
    
    // Adicionar evento de mudança de status
    const event = {
      _id: String(movedOrder.events.length + 1),
      date: new Date().toString(),
      description: getStatusDescription(movedOrder.status),
      status: destination.droppableId,
    }
    movedOrder.events.push(event)

    // Inserir o item na nova posição
    reorderedOrders.splice(destination.index, 0, movedOrder)

    setOrders(reorderedOrders)
  }

  const getStatusDescription = (status: Order['status']) => {
    const statusMap = {
      new: 'Pedido recebido',
      confirmed: 'Pedido confirmado',
      preparing: 'Pedido em preparo',
      ready: 'Pedido pronto',
      delivering: 'Pedido em entrega',
      completed: 'Pedido concluído',
    }

    return statusMap[status]
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
                                    snapshot.isDragging ? "rotate-2 shadow-lg" : ""
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-[11px] text-muted-foreground">
                                        {order.orderDate.substring(11, 16)}
                                      </span>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button className="p-0.5 hover:bg-muted rounded-md">
                                          <MoreVertical className="h-3 w-3" />
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                                          Ver detalhes
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>

                                  <div className="mt-1">
                                    <div className="text-xs font-medium">#{order.orderNumber}</div>
                                    <div className="text-[11px] text-muted-foreground truncate">
                                      {order.customer.name}
                                    </div>
                                  </div>

                                  <div className="mt-1 flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-1">
                                      <CreditCard className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-muted-foreground">
                                        {PAYMENT_METHODS[order.payment.method].label}
                                      </span>
                                    </div>
                                    <div className="font-medium">
                                      {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                      }).format(order.total)}
                                    </div>
                                  </div>

                                  <div className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                                    {order.items.map((item) => `${item.quantity}x ${item.name}`).join(', ')}
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
    </>
  )
}
