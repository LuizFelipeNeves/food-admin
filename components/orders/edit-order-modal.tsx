'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/app/_trpc/client";
import { PAYMENTS as PAYMENT_METHODS } from "@/constants/payments";
import { toast } from 'react-hot-toast'

interface EditOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: {
    _id: string;
    paymentStatus: string;
    paymentMethod: string;
    observation?: string;
  } | null;
  onOrderUpdated?: () => void;
}

export function EditOrderModal({ open, onOpenChange, order, onOrderUpdated }: EditOrderModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || '');
  const [paymentMethod, setPaymentMethod] = useState(order?.paymentMethod || '');
  const [observation, setObservation] = useState(order?.observation || '');

  useEffect(() => {
    if (order) {
      setPaymentStatus(order.paymentStatus);
      setPaymentMethod(order.paymentMethod);
      setObservation(order.observation || '');
    }
  }, [order]);

  const { mutate: editOrder } = trpc.orders.editOrder.useMutation({
    onSuccess: () => {
      toast.success("Pedido atualizado com sucesso")
      onOrderUpdated?.()
      onOpenChange(false)
    },
    onError: () => {
      toast.error("Não foi possível atualizar o pedido")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order?._id) return;

    setIsLoading(true);
    editOrder({
      orderId: order._id,
      paymentStatus,
      paymentMethod,
      observation,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Pedido #{order?._id.slice(-8).toUpperCase()}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentStatus">Status do Pagamento</Label>
            <Select
              value={paymentStatus}
              onValueChange={setPaymentStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="canceled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Método de Pagamento</Label>
            <Select
              value={paymentMethod}
              onValueChange={setPaymentMethod}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((payment) => (
                  <SelectItem key={payment.id} value={payment.id}>
                    {payment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observation">Observação</Label>
            <Textarea
              id="observation"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Adicione uma observação..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}