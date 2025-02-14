import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Save } from 'lucide-react'
import { trpc as api } from '@/app/_trpc/client'

const paymentsDefault = [
  {
    id: "money",
    name: "Dinheiro",
    description: "Aceitar pagamento via Dinheiro",
  },
  {
    id: "pix",
    name: "Pix",
    description: "Aceitar pagamento via PIX",
  },
  {
    id: "credit",
    name: "Cartão de Crédito",
    description: "Aceitar pagamento via Cartão de Crédito",
  },
  {
    id: "debit",
    name: "Cartão de Débito",
    description: "Aceitar pagamento via Cartão de Débito",
  },
  {
    id: "vrRefeicao",
    name: "Vale Refeição",
    description: "Aceitar pagamento via Vale Refeição",
  },
  {
    id: "ticketRefeicao",
    name: "Ticket Refeição",
    description: "Aceitar pagamento via Ticket Refeição",
  },
  {
    id: "aleloRefeicao",
    name: "Alelo Refeição",
    description: "Aceitar pagamento via Alelo Refeição",
  },
  {
    id: "sodexoRefeicao",
    name: "Sodexo Refeição",
    description: "Aceitar pagamento via Sodexo Refeição",
  }
]

export function PaymentSettings({ storeId }: { storeId: string }) {
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const { data: paymentData } = api.settings.getPaymentMethods.useQuery({ storeId })
  const updatePaymentMethods = api.settings.updatePaymentMethods.useMutation()

  useEffect(() => {
    if (paymentData) {
      setPaymentMethods(paymentData)
    }
  }, [paymentData])

  const handlePaymentMethodChange = (paymentId: string, checked: boolean) => {
    setPaymentMethods(prev => checked ? [...prev, paymentId] : prev.filter(id => id !== paymentId))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formas de Pagamento</CardTitle>
        <CardDescription>
          Configure as formas de pagamento aceitas pelo seu estabelecimento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {paymentsDefault.map((payment) => (
            <div key={payment.id} className="flex flex-col">
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <Switch 
                  checked={paymentMethods.includes(payment.id)} 
                  onCheckedChange={(checked) => handlePaymentMethodChange(payment.id, checked)} 
                />
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
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => {
            updatePaymentMethods.mutate({ paymentMethods, storeId })
          }}
          disabled={updatePaymentMethods.isLoading || paymentMethods === paymentData}
        >
          <Save className="h-4 w-4 mr-2" />
          {updatePaymentMethods.isLoading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </CardFooter>
    </Card>
  )
}
