import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Save, Loader2, CreditCard, Banknote, QrCode, CreditCardIcon } from 'lucide-react'
import { trpc as api } from '@/app/_trpc/client'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { PAYMENTS } from '@/constants/payments'

export function PaymentSettings({ storeId }: { storeId: string }) {
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const { data: paymentData, isLoading } = api.settings.getPaymentMethods.useQuery({ storeId })
  const updatePaymentMethods = api.settings.updatePaymentMethods.useMutation({
    onSuccess: () => {
      toast.success('Métodos de pagamento atualizados com sucesso', {
        style: {
          borderRadius: '6px',
          background: '#333',
          color: '#fff',
        },
      })
    },
    onError: (error) => {
      toast.error(error.message, {
        style: {
          borderRadius: '6px',
          background: '#333',
          color: '#fff',
        },
      })
    }
  })

  useEffect(() => {
    if (paymentData) {
      setPaymentMethods(paymentData)
    }
  }, [paymentData])

  const handlePaymentMethodChange = (paymentId: string, checked: boolean) => {
    setPaymentMethods(prev => checked ? [...prev, paymentId] : prev.filter(id => id !== paymentId))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formas de Pagamento</CardTitle>
        <CardDescription>
          Configure as formas de pagamento aceitas pelo seu estabelecimento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium leading-none">Cartões e Dinheiro</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {PAYMENTS.slice(0, 4).map((payment) => (
                <div key={payment.id} className="flex flex-col">
                  <div className={cn(
                    "flex items-start gap-4 p-4 border rounded-lg transition-colors",
                    paymentMethods.includes(payment.id) && "border-primary"
                  )}>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={paymentMethods.includes(payment.id)} 
                        onCheckedChange={(checked) => handlePaymentMethodChange(payment.id, checked)} 
                      />
                      <payment.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-0.5">
                      <Label>{payment.name}</Label>
                      <div className="text-sm text-muted-foreground">
                        {payment.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium leading-none">Vale Refeição</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {PAYMENTS.slice(4).map((payment) => (
                <div key={payment.id} className="flex flex-col">
                  <div className={cn(
                    "flex items-start gap-4 p-4 border rounded-lg transition-colors",
                    paymentMethods.includes(payment.id) && "border-primary"
                  )}>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={paymentMethods.includes(payment.id)} 
                        onCheckedChange={(checked) => handlePaymentMethodChange(payment.id, checked)} 
                      />
                      <payment.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-0.5">
                      <Label>{payment.name}</Label>
                      <div className="text-sm text-muted-foreground">
                        {payment.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => updatePaymentMethods.mutate({ paymentMethods, storeId })}
          disabled={updatePaymentMethods.isLoading || paymentMethods === paymentData}
          className="w-full sm:w-auto"
        >
          {updatePaymentMethods.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
