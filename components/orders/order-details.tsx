'use client'

import { Order, PAYMENT_METHODS, PAYMENT_STATUS } from "@/data/orders"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Timeline } from "@/components/ui/timeline"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CreditCard, MapPin, Phone, Mail, Clock } from "lucide-react"

interface OrderDetailsProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetails({ order, open, onOpenChange }: OrderDetailsProps) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-3xl max-h-[calc(100vh-2rem)] overflow-y-auto p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>Pedido {order.orderNumber}</span>
            <Badge
              variant={
                order.payment.status === 'approved'
                  ? 'success'
                  : order.payment.status === 'rejected'
                  ? 'destructive'
                  : 'warning'
              }
            >
              {PAYMENT_STATUS[order.payment.status].label}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-sm">
            Realizado em {format(new Date(order.orderDate), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 mt-4">
          {/* Dados do Cliente */}
          <Card className="p-4 md:p-6">
            <h3 className="font-semibold mb-4">Dados do Cliente</h3>
            <div className="grid gap-4">
              <div>
                <div className="text-sm font-medium">Nome</div>
                <div>{order.customer.name}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </div>
                  <div>{order.customer.phone}</div>
                </div>

                <div>
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <div className="break-all">{order.customer.email}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Endereço de Entrega
                </div>
                <div className="text-sm">
                  {order.customer.address.street}, {order.customer.address.number}
                  {order.customer.address.complement && ` - ${order.customer.address.complement}`}
                </div>
                <div className="text-sm">
                  {order.customer.address.neighborhood} - {order.customer.address.city}/{order.customer.address.state}
                </div>
                <div className="text-sm">{order.customer.address.zipCode}</div>
              </div>
            </div>
          </Card>

          {/* Dados do Pedido */}
          <Card className="p-4 md:p-6">
            <h3 className="font-semibold mb-4">Dados do Pedido</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium">Itens</div>
                <div className="space-y-2 mt-2">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-start justify-between gap-4 text-sm">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        {item.additionals && item.additionals.length > 0 && (
                          <div className="text-muted-foreground text-xs mt-0.5">
                            {item.additionals.map((additional) => additional.name).join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div>{item.quantity}x</div>
                        <div>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(item.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <div>Subtotal</div>
                  <div>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(order.subtotal)}
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <div>Taxa de entrega</div>
                  <div>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(order.deliveryFee)}
                  </div>
                </div>
                <div className="flex justify-between font-medium">
                  <div>Total</div>
                  <div>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(order.total)}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Forma de Pagamento
                  </div>
                  <div className="text-sm">{PAYMENT_METHODS[order.payment.method].label}</div>
                </div>

                <div>
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Tempo de Preparo
                  </div>
                  <div className="text-sm">30-45 minutos</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Status do Pedido */}
          <Card className="p-4 md:p-6">
            <h3 className="font-semibold mb-4">Status do Pedido</h3>
            <Timeline events={order.events} />
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
