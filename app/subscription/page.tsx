'use client'

import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, ArrowUp, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'
import cn from 'classnames'
import { PaymentMethods } from '@/components/subscription/payment-methods'
import { SubscriptionDetails } from '@/components/subscription/subscription-details'
import { InvoicesTable } from '@/components/subscription/invoices-table'
import { PlanChangeDialog } from '@/components/subscription/plan-change-dialog'

const plans = [
  {
    name: 'Básico',
    price: 'R$ 49',
    priceDetails: 'por mês',
    features: [
      'Até 500 pedidos/mês',
      'Painel de controle',
      'Relatórios básicos',
      'Suporte por email',
      '2 dispositivos',
      'Backup diário',
      'Tema personalizável',
      'Exportação básica',
    ],
    current: false,
    usagePercent: 45,
    highlight: false,
    popular: false,
    color: 'bg-blue-50 dark:bg-blue-500/5 hover:bg-blue-100/50 dark:hover:bg-blue-500/10',
    description: 'Ideal para negócios em crescimento',
    buttonVariant: 'secondary' as const
  },
  {
    name: 'Profissional',
    price: 'R$ 99',
    priceDetails: 'por mês',
    features: [
      'Pedidos ilimitados',
      'Painel de controle avançado',
      'Relatórios detalhados',
      'Suporte prioritário',
      'API de integração',
      'Até 5 dispositivos',
      'Backup em tempo real',
      'Personalização de temas',
      'Exportação avançada',
    ],
    current: true,
    usagePercent: 75,
    highlight: true,
    popular: true,
    color: 'bg-primary/10 hover:bg-primary/20',
    description: 'Para empresas que precisam de mais recursos',
    buttonVariant: 'default' as const
  },
  {
    name: 'Empresarial',
    price: 'R$ 199',
    priceDetails: 'por mês',
    features: [
      'Tudo do Profissional',
      'Múltiplas filiais',
      'Suporte 24/7',
      'Treinamento personalizado',
      'Customizações exclusivas',
      'API dedicada',
      'SLA garantido',
      'Gestor de conta',
      'Dispositivos ilimitados',
    ],
    current: false,
    usagePercent: 0,
    highlight: false,
    popular: false,
    color: 'bg-purple-50 dark:bg-purple-500/5 hover:bg-purple-100/50 dark:hover:bg-purple-500/10',
    description: 'Solução completa para grandes empresas',
    buttonVariant: 'secondary' as const
  },
]

const invoices = [
  {
    id: '1',
    date: '14/02/2025',
    dueDate: '14/02/2025',
    amount: 'R$ 29,90',
    status: 'paid' as const,
    plan: 'Basic',
    paymentMethod: '**** 1234',
    downloadUrl: '/invoices/1.pdf'
  },
  {
    id: '2',
    date: '14/01/2025',
    dueDate: '14/01/2025',
    amount: 'R$ 29,90',
    status: 'overdue' as const,
    plan: 'Basic',
    paymentMethod: '**** 1234',
    downloadUrl: '/invoices/2.pdf'
  }
]

export default function SubscriptionPage() {
  const currentPlan = plans.find(plan => plan.current)
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('plans')

  const handlePlanChange = (plan: typeof plans[0]) => {
    setSelectedPlan(plan)
    if (currentPlan) {
      const currentIndex = plans.findIndex(p => p.name === currentPlan.name)
      const newIndex = plans.findIndex(p => p.name === plan.name)
      if (newIndex > currentIndex) {
        setShowUpgradeDialog(true)
      } else {
        setShowDowngradeDialog(true)
      }
    }
  }

  const handleConfirmChange = (paymentMethod: 'credit_card' | 'boleto') => {
    // Implementar lógica de mudança de plano
    console.log('Mudando para o plano:', selectedPlan?.name, 'com pagamento via:', paymentMethod)
    setShowUpgradeDialog(false)
    setShowDowngradeDialog(false)
  }

  const handleCancelSubscription = () => {
    // Implementar lógica de cancelamento
    console.log('Cancelando assinatura')
    setShowCancelDialog(false)
  }

  const handlePayment = () => {
    setActiveTab('payment')
  }

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-2 sm:p-4 md:p-8 pt-6 pb-20 sm:pb-8 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Assinatura</h2>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <div className="flex justify-center sm:justify-start">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="plans" className="flex-1 sm:flex-none">Planos</TabsTrigger>
                  <TabsTrigger value="payment" className="flex-1 sm:flex-none">Pagamento</TabsTrigger>
                  <TabsTrigger value="invoices" className="flex-1 sm:flex-none">Faturas</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="plans" className="space-y-4">
                <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {plans.map((plan) => (
                    <Card 
                      key={plan.name} 
                      className={cn(
                        'relative transition-all duration-200 hover:scale-[1.02]',
                        'min-w-0',
                        plan.highlight ? 'shadow-xl ring-2 ring-primary' : 'shadow-md',
                        plan.current ? 'ring-1 ring-primary' : '',
                        plan.color
                      )}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-0 right-0 mx-auto w-fit">
                          <Badge variant="default" className="bg-green-600 px-4 sm:px-8 py-1 text-xs sm:text-sm whitespace-nowrap">Mais Popular</Badge>
                        </div>
                      )}
                      <CardHeader className="p-4 sm:p-6 space-y-2">
                        <CardTitle className="flex items-center justify-between text-base sm:text-lg gap-2 flex-wrap">
                          <span>{plan.name}</span>
                        </CardTitle>
                        <CardDescription className="min-h-[40px] text-sm">
                          {plan.description}
                        </CardDescription>
                        <div className="mt-2">
                          <div className="flex items-baseline gap-1 flex-wrap">
                            <span className="text-2xl sm:text-4xl font-bold">{plan.price}</span>
                            <span className="text-xs sm:text-sm text-muted-foreground">{plan.priceDetails}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <ul className="space-y-2 sm:space-y-3 text-sm">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start sm:items-center gap-2 sm:gap-3">
                              <div className={cn(
                                "h-4 w-4 sm:h-5 sm:w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0",
                                plan.highlight 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-primary/10 text-primary'
                              )}>
                                <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </div>
                              <span className="text-xs sm:text-sm leading-tight">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter className="p-4 sm:p-6">
                        <Button 
                          className={cn(
                            "w-full font-medium transition-all text-sm sm:text-base",
                            !plan.current && plan.highlight && "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                          )}
                          variant={plan.buttonVariant}
                          disabled={plan.current}
                          onClick={() => !plan.current && handlePlanChange(plan)}
                        >
                          {plan.current ? 'Plano Atual' : plan.name === 'Free' ? 'Começar Grátis' : 'Escolher Plano'}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="payment" className="space-y-4">
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                  <PaymentMethods />
                  <SubscriptionDetails 
                    onCancelClick={() => setShowCancelDialog(true)}
                    onPaymentClick={handlePayment}
                  />
                </div>
              </TabsContent>

              <TabsContent value="invoices" className="space-y-4">
                <InvoicesTable 
                  invoices={invoices} 
                  onPayInvoice={handlePayment}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <PlanChangeDialog 
        isOpen={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        currentPlan={currentPlan || null}
        selectedPlan={selectedPlan}
        isUpgrade={true}
        onConfirm={handleConfirmChange}
      />

      <PlanChangeDialog 
        isOpen={showDowngradeDialog}
        onOpenChange={setShowDowngradeDialog}
        currentPlan={currentPlan || null}
        selectedPlan={selectedPlan}
        isUpgrade={false}
        onConfirm={handleConfirmChange}
      />

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Cancelar Assinatura
            </DialogTitle>
            <DialogDescription>
              Você está prestes a cancelar sua assinatura do plano <strong>{currentPlan?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border p-4 border-destructive/20 bg-destructive/10">
              <h4 className="font-medium mb-2 text-destructive">Atenção:</h4>
              <ul className="space-y-2">
                <li className="text-sm text-destructive/90">
                  • Você perderá acesso a todos os recursos premium imediatamente
                </li>
                <li className="text-sm text-destructive/90">
                  • Seus dados serão mantidos por 30 dias
                </li>
                <li className="text-sm text-destructive/90">
                  • Você pode reativar sua assinatura a qualquer momento
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Voltar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancelSubscription}
            >
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}
