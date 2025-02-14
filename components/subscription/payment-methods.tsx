import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CreditCard, Pencil, Trash2, Plus, Receipt } from 'lucide-react'
import { useState } from 'react'
import { AddCardModal } from './add-card-modal'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import cn from 'classnames'

interface PaymentMethodsProps {
  onSelectPaymentMethod?: (paymentMethodId: string) => void
  isLoading?: boolean
  hideAddCard?: boolean
  className?: string
}

export function PaymentMethods({ 
  onSelectPaymentMethod, 
  isLoading,
  hideAddCard,
  className 
}: PaymentMethodsProps) {
  const [showAddCard, setShowAddCard] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'boleto'>('credit_card')

  const handleAddCard = (cardData: {
    number: string
    expiry: string
    cvv: string
    name: string
  }) => {
    console.log('Novo cartão:', cardData)
    setShowAddCard(false)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle>Informações de Pagamento</CardTitle>
              <CardDescription>
                Gerencie suas informações de pagamento e assinatura
              </CardDescription>
            </div>
            {paymentMethod === 'credit_card' && (
              <Button variant="outline" size="sm" onClick={() => setShowAddCard(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cartão
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="font-medium mb-4">Forma de Pagamento:</h4>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={(value: 'credit_card' | 'boleto') => setPaymentMethod(value)} 
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="credit_card" id="payment_credit_card" />
                  <Label htmlFor="payment_credit_card" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-4 w-4" />
                    <span>Cartão de Crédito</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="boleto" id="payment_boleto" />
                  <Label htmlFor="payment_boleto" className="flex items-center gap-2 cursor-pointer">
                    <Receipt className="h-4 w-4" />
                    <span>Boleto Bancário</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === 'credit_card' ? (
              <div className="grid gap-4 sm:grid-cols-1">
                <div className="rounded-lg border p-4 bg-muted/50">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">Mastercard final 1234</p>
                      <p className="text-sm text-muted-foreground">Expira em 12/2025</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <Badge variant="outline">Principal</Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4 bg-muted/50">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">Visa final 5678</p>
                      <p className="text-sm text-muted-foreground">Expira em 08/2024</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border p-4 bg-muted/50">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Receipt className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Boleto Bancário</p>
                      <p className="text-sm text-muted-foreground">Vencimento todo dia 10</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Atual</Badge>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Próximo boleto:</p>
                    <p className="text-sm text-muted-foreground">Será gerado em 05/03/2024</p>
                    <Button variant="outline" size="sm" className="mt-3">
                      <Receipt className="h-4 w-4 mr-2" />
                      Gerar Boleto
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <AddCardModal 
          isOpen={showAddCard}
          onOpenChange={setShowAddCard}
          onSubmit={handleAddCard}
        />
      </Card>
    </div>
  )
}
