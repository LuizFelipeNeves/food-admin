import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { PaymentMethods } from "./payment-methods"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PayInvoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: {
    id: string
    amount: string
    dueDate: string
  }
  onPayInvoice: (invoiceId: string, paymentMethodId: string) => Promise<void>
}

export function PayInvoiceModal({ open, onOpenChange, invoice, onPayInvoice }: PayInvoiceModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async (paymentMethodId: string) => {
    try {
      setIsLoading(true)
      await onPayInvoice(invoice.id, paymentMethodId)
      onOpenChange(false)
    } catch (error) {
      console.error('Error paying invoice:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "sm:max-w-[600px] gap-0",
        "max-h-[90vh] overflow-y-auto"
      )}>
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Pagar Fatura</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-6">
          <Card className="p-4 bg-muted/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Valor da Fatura</p>
                <p className="text-lg font-medium">{invoice.amount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vencimento</p>
                <p className="text-lg font-medium">{invoice.dueDate}</p>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Forma de Pagamento</h3>
            <PaymentMethods 
              onSelectPaymentMethod={handlePayment}
              isLoading={isLoading}
              hideAddCard
              className="max-h-[400px] overflow-y-auto"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
