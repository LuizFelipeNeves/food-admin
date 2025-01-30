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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
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
          <DialogDescription>
            Realizado em {format(new Date(order.orderDate), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 mt-6">
          {/* Dados do Cliente */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Dados do Cliente</h3>
            <div className="space-y-2">
              <div className="text-sm">{order.customer.name}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {order.customer.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {order.customer.email}
              </div>
            </div>
          </Card>

          {/* Endereço de Entrega */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Endereço de Entrega</h3>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5" />
              <div>
                {order.customer.address.street}, {order.customer.address.number}
                {order.customer.address.complement && ` - ${order.customer.address.complement}`}
                <br />
                {order.customer.address.neighborhood}
                <br />
                {order.customer.address.city} - {order.customer.address.state}
                <br />
                CEP: {order.customer.address.zipCode}
              </div>
            </div>
          </Card>

          {/* Itens do Pedido */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Itens do Pedido</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{item.quantity}x {item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.price.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })} cada
                    </div>
                  </div>
                  <div className="font-medium">
                    {(item.price * item.quantity).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </div>
                </div>
              ))}
              <Separator className="my-4" />
              <div className="flex justify-between items-center font-semibold">
                <div>Total</div>
                <div>
                  {order.total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* Pagamento */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Pagamento</h3>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>{PAYMENT_METHODS[order.payment.method].label}</span>
              {order.payment.change && (
                <Badge variant="secondary">
                  Troco para: {order.payment.change.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </Badge>
              )}
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Histórico do Pedido</h3>
            <div className="relative pl-6 space-y-6">
              <div className="absolute top-0 bottom-0 left-2.5 w-px bg-muted-foreground/20" />
              {order.events.map((event, index) => (
                <div key={event.id} className="relative">
                  <div className="absolute -left-6 p-1.5 rounded-full bg-background border">
                    <Clock className="h-3 w-3" />
                  </div>
                  <div>
                    <div className="font-medium">{event.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(event.date), "dd/MM/yyyy 'às' HH:mm")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
