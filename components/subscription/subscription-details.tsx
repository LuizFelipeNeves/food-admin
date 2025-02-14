import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'

interface SubscriptionDetailsProps {
  onCancelClick: () => void
  onPaymentClick: () => void
}

export function SubscriptionDetails({ onCancelClick, onPaymentClick }: SubscriptionDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes da Assinatura</CardTitle>
        <CardDescription>
          Informações sobre seu plano atual
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Plano Atual</span>
            <Badge variant="outline">Profissional</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Próxima Cobrança</span>
            <span className="font-medium">15/03/2024</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Valor</span>
            <span className="font-medium">R$ 99,00</span>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant="success">Ativo</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Desde</span>
            <span className="font-medium">Janeiro 2024</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Uso do Plano</span>
            <span className="text-sm font-medium">75/100 pedidos</span>
          </div>
          <Progress value={75} className="h-2" />
        </div>

        <div className="space-y-2">
          <Button variant="outline" className="w-full" onClick={onPaymentClick}>
            Fazer Pagamento
          </Button>
          <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={onCancelClick}>
            Cancelar Assinatura
          </Button>
        </div>
      </CardContent>
      <CardFooter>
      </CardFooter>
    </Card>
  )
}
