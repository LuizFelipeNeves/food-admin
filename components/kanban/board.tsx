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
    movedOrder.events.push({
      id: String(movedOrder.events.length + 1),
      date: new Date().toISOString(),
      status: movedOrder.status,
      description: getStatusDescription(movedOrder.status)
    })

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
      completed: 'Pedido entregue'
    }
    return statusMap[status]
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="h-[calc(100vh-12rem)] overflow-hidden">
          <div className="grid grid-cols-6 gap-4 h-full">
            {COLUMNS.map((column) => (
              <div key={column.id} className="flex flex-col min-w-[250px]">
                <div className={`${column.color} rounded-lg p-4 flex flex-col h-full`}>
                  <div className="mb-4">
                    <h3 className="font-semibold text-sm dark:text-black">{column.title}</h3>
                    <div className="text-xs text-muted-foreground">
                      {orders.filter((order) => order.status === column.id).length} pedidos
                    </div>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto space-y-3 pr-2 -mr-2 ${
                          snapshot.isDraggingOver ? "bg-muted/10" : ""
                        }`}
                      >
                        {orders
                          .filter((order) => order.status === column.id)
                          .map((order, index) => (
                            <Draggable
                              key={order.id}
                              draggableId={order.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-3 bg-background border shadow-sm hover:shadow-md transition-all ${
                                    snapshot.isDragging ? "rotate-2 shadow-lg" : ""
                                  }`}
                                >
                                  <div className="flex justify-between items-start gap-2">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-sm truncate">
                                          {order.orderNumber}
                                        </h4>
                                        <Badge
                                          variant={
                                            order.payment.status === 'approved'
                                              ? 'success'
                                              : order.payment.status === 'rejected'
                                              ? 'destructive'
                                              : 'warning'
                                          }
                                          className="text-[10px] h-4"
                                        >
                                          {order.payment.status === 'approved' ? 'Pago' : 'Pendente'}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground truncate">
                                        {order.customer.name}
                                      </p>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-muted shrink-0">
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
                                  
                                  <div className="mt-2 space-y-1">
                                    {order.items.slice(0, 2).map((item) => (
                                      <div key={item.id} className="text-xs flex justify-between">
                                        <span className="truncate flex-1">{item.quantity}x {item.name}</span>
                                        <span className="text-muted-foreground ml-2 shrink-0">
                                          {item.price.toLocaleString('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL'
                                          })}
                                        </span>
                                      </div>
                                    ))}
                                    {order.items.length > 2 && (
                                      <div className="text-xs text-muted-foreground">
                                        +{order.items.length - 2} itens
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between mt-2 text-xs">
                                    <div className="flex items-center gap-1">
                                      <CreditCard className="h-3 w-3" />
                                      <span className="font-medium">
                                        {order.total.toLocaleString('pt-BR', {
                                          style: 'currency',
                                          currency: 'BRL'
                                        })}
                                      </span>
                                    </div>
                                    {order.waitTime && order.waitTime > 0 && (
                                      <div className="flex items-center text-muted-foreground">
                                        <Clock className="h-3 w-3 mr-1" />
                                        <span className="font-medium">
                                          {order.waitTime}min
                                        </span>
                                      </div>
                                    )}
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
