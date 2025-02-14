import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Check, ArrowUp, AlertTriangle, CreditCard, Receipt } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import cn from 'classnames'

interface Plan {
  name: string
  price: string
  features: string[]
  current: boolean
  usagePercent: number
  highlight: boolean
  popular: boolean
  color: string
  description: string
  buttonVariant: 'outline' | 'default' | 'secondary'
}

interface PlanChangeDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  currentPlan: Plan | null
  selectedPlan: Plan | null
  isUpgrade: boolean
  onConfirm: (paymentMethod: 'credit_card' | 'boleto') => void
}

export function PlanChangeDialog({
  isOpen,
  onOpenChange,
  currentPlan,
  selectedPlan,
  isUpgrade,
  onConfirm
}: PlanChangeDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'boleto'>('credit_card')

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isUpgrade ? (
              <>
                <ArrowUp className="h-5 w-5 text-green-500" />
                Upgrade para {selectedPlan?.name}
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-600">Alterar para {selectedPlan?.name}</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Você está prestes a fazer um {isUpgrade ? 'upgrade' : 'downgrade'} do plano <strong>{currentPlan?.name}</strong> para o plano <strong>{selectedPlan?.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isUpgrade && (
            <div className="rounded-lg border p-4 border-yellow-200 bg-yellow-50">
              <h4 className="font-medium mb-2 text-yellow-800">Atenção:</h4>
              <ul className="space-y-2">
                <li className="text-sm text-yellow-800">
                  • Você perderá acesso a recursos exclusivos do plano atual
                </li>
                <li className="text-sm text-yellow-800">
                  • A mudança será efetivada no próximo ciclo de faturamento
                </li>
                <li className="text-sm text-yellow-800">
                  • Dados históricos serão mantidos, mas alguns recursos ficarão indisponíveis
                </li>
              </ul>
            </div>
          )}

          <div className="rounded-lg border p-4">
            <h4 className="font-medium mb-2">
              {isUpgrade ? 'Benefícios do novo plano:' : 'Recursos do novo plano:'}
            </h4>
            <ul className="space-y-2">
              {selectedPlan?.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <Check className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border p-4">
            <h4 className="font-medium mb-4">Forma de Pagamento:</h4>
            <RadioGroup value={paymentMethod} onValueChange={(value: 'credit_card' | 'boleto') => setPaymentMethod(value)} className="space-y-3 grid grid-cols-2">
              <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="credit_card" id="credit_card" />
                <Label htmlFor="credit_card" className="flex items-center gap-2 cursor-pointer">
                  <CreditCard className="h-4 w-4" />
                  <span>Cartão de Crédito</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="boleto" id="boleto" />
                <Label htmlFor="boleto" className="flex items-center gap-2 cursor-pointer">
                  <Receipt className="h-4 w-4" />
                  <span>Boleto Bancário</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="rounded-lg border p-4 bg-muted">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Novo valor mensal</p>
                <p className="text-sm text-muted-foreground">
                  {isUpgrade ? 'Cobrança imediata proporcional' : 'Válido a partir do próximo ciclo'}
                </p>
              </div>
              <p className="text-2xl font-bold">{selectedPlan?.price}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={() => onConfirm(paymentMethod)}
            className={isUpgrade ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}
          >
            {isUpgrade ? 'Confirmar Upgrade' : 'Confirmar Alteração'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
