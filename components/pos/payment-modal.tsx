"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { OrderItem } from "./order-summary";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreditCard, Banknote, QrCode, Receipt, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: string) => void;
  items: OrderItem[];
}

export function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  items,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Calcular o subtotal incluindo os adicionais
  const subtotal = items.reduce(
    (acc, item) => {
      const itemPrice = item.price * item.quantity;
      const additionalsPrice = item.additionals?.reduce(
        (sum, additional) => sum + additional.price * item.quantity,
        0
      ) || 0;
      return acc + itemPrice + additionalsPrice;
    },
    0
  );

  const changeAmount =
    paymentMethod === "cash" && receivedAmount
      ? parseFloat(receivedAmount) - subtotal
      : 0;

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onConfirm(paymentMethod);
      setIsProcessing(false);
      resetForm();
    }, 1000);
  };

  const resetForm = () => {
    setPaymentMethod("credit");
    setReceivedAmount("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isConfirmDisabled =
    paymentMethod === "cash" &&
    (receivedAmount === "" ||
      parseFloat(receivedAmount) < subtotal ||
      isNaN(parseFloat(receivedAmount)));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Finalizar Pedido
          </DialogTitle>
          <DialogDescription>
            Escolha o método de pagamento para concluir o pedido
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <ScrollArea className="max-h-[200px] pr-3 -mr-3">
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item._id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <div className="flex gap-2">
                      <span className="font-medium">{item.quantity}x</span>
                      <span>{item.name}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                  
                  {/* Exibir adicionais */}
                  {item.additionals && item.additionals.length > 0 && (
                    <div className="pl-6 space-y-0.5">
                      {item.additionals.map((additional) => (
                        <div key={additional._id} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">+ {additional.name}</span>
                          <span className="text-muted-foreground">
                            {formatCurrency(additional.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Exibir observações */}
                  {item.notes && (
                    <div className="pl-6">
                      <p className="text-xs italic text-muted-foreground">
                        Obs: {item.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <Separator />

          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span className="text-lg text-primary">{formatCurrency(subtotal)}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method">Método de Pagamento</Label>
            <RadioGroup
              id="payment-method"
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              <div className={cn(
                "border rounded-md p-3 cursor-pointer transition-all",
                paymentMethod === "credit" 
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                  : "hover:border-border"
              )}>
                <RadioGroupItem
                  value="credit"
                  id="credit"
                  className="sr-only"
                />
                <Label
                  htmlFor="credit"
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <CreditCard className={cn("h-5 w-5", paymentMethod === "credit" ? "text-primary" : "text-muted-foreground")} />
                  <span>Cartão de Crédito</span>
                </Label>
              </div>

              <div className={cn(
                "border rounded-md p-3 cursor-pointer transition-all",
                paymentMethod === "debit" 
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                  : "hover:border-border"
              )}>
                <RadioGroupItem
                  value="debit"
                  id="debit"
                  className="sr-only"
                />
                <Label
                  htmlFor="debit"
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <CreditCard className={cn("h-5 w-5", paymentMethod === "debit" ? "text-primary" : "text-muted-foreground")} />
                  <span>Cartão de Débito</span>
                </Label>
              </div>

              <div className={cn(
                "border rounded-md p-3 cursor-pointer transition-all",
                paymentMethod === "pix" 
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                  : "hover:border-border"
              )}>
                <RadioGroupItem
                  value="pix"
                  id="pix"
                  className="sr-only"
                />
                <Label
                  htmlFor="pix"
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <QrCode className={cn("h-5 w-5", paymentMethod === "pix" ? "text-primary" : "text-muted-foreground")} />
                  <span>PIX</span>
                </Label>
              </div>

              <div className={cn(
                "border rounded-md p-3 cursor-pointer transition-all",
                paymentMethod === "cash" 
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                  : "hover:border-border"
              )}>
                <RadioGroupItem
                  value="cash"
                  id="cash"
                  className="sr-only"
                />
                <Label
                  htmlFor="cash"
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <Banknote className={cn("h-5 w-5", paymentMethod === "cash" ? "text-primary" : "text-muted-foreground")} />
                  <span>Dinheiro</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {paymentMethod === "cash" && (
            <div className="space-y-2">
              <Label htmlFor="received-amount">Valor Recebido</Label>
              <Input
                id="received-amount"
                type="number"
                min={subtotal}
                step="0.01"
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(e.target.value)}
                placeholder={`Mínimo ${formatCurrency(subtotal)}`}
              />

              {receivedAmount && !isNaN(parseFloat(receivedAmount)) && (
                <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md mt-2">
                  <span className="text-sm">Troco:</span>
                  <span className={`font-medium ${changeAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(changeAmount)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="sm:flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirmDisabled || isProcessing}
            className="sm:flex-1"
          >
            {isProcessing ? (
              "Processando..."
            ) : (
              <span className="flex items-center gap-1">
                Confirmar Pagamento
                <ArrowRight className="h-4 w-4 ml-1" />
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 