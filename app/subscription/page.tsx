'use client'

import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, Download, CreditCard, AlertCircle, Clock, Calendar, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { useState } from 'react'

const plans = [
  {
    name: 'Free',
    price: 'Grátis',
    features: [
      'Até 30 pedidos/mês',
      'Painel básico',
      'Relatórios simples',
      'Suporte por email',
      '1 dispositivo',
      'Backup semanal',
      'Sem customizações',
    ],
    current: false,
    usagePercent: 0,
    highlight: false,
    popular: false,
  },
  {
    name: 'Básico',
    price: 'R$ 49/mês',
    features: [
      'Até 100 pedidos/mês',
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
    popular: true,
  },
  {
    name: 'Profissional',
    price: 'R$ 99/mês',
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
    popular: false,
  },
  {
    name: 'Empresarial',
    price: 'R$ 199/mês',
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
  },
]

const invoices = [
  {
    date: '01/02/2025',
    dueDate: '05/02/2025',
    amount: 'R$ 99,00',
    status: 'paid',
    plan: 'Profissional',
    paymentMethod: 'Cartão final 1234',
    downloadUrl: '#',
  },
  {
    date: '01/01/2025',
    dueDate: '05/01/2025',
    amount: 'R$ 99,00',
    status: 'paid',
    plan: 'Profissional',
    paymentMethod: 'Cartão final 1234',
    downloadUrl: '#',
  },
  {
    date: '01/12/2024',
    dueDate: '05/12/2024',
    amount: 'R$ 49,00',
    status: 'paid',
    plan: 'Básico',
    paymentMethod: 'Cartão final 5678',
    downloadUrl: '#',
  },
  {
    date: '01/11/2024',
    dueDate: '05/11/2024',
    amount: 'R$ 49,00',
    status: 'overdue',
    plan: 'Básico',
    paymentMethod: 'Cartão final 5678',
    downloadUrl: '#',
  },
]

export default function SubscriptionPage() {
  const currentPlan = plans.find(plan => plan.current)
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false)

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

  const handleConfirmChange = () => {
    // Implementar lógica de mudança de plano
    console.log('Mudando para o plano:', selectedPlan?.name)
    setShowUpgradeDialog(false)
    setShowDowngradeDialog(false)
  }

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Assinatura</h2>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <Tabs defaultValue="plans" className="space-y-4">
              <TabsList>
                <TabsTrigger value="plans">Planos</TabsTrigger>
                <TabsTrigger value="payment">Pagamento</TabsTrigger>
                <TabsTrigger value="invoices">Faturas</TabsTrigger>
              </TabsList>

              <TabsContent value="plans" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {plans.map((plan) => (
                    <Card 
                      key={plan.name} 
                      className={
                        plan.highlight 
                          ? 'border-primary shadow-lg scale-105' 
                          : plan.current 
                            ? 'border-primary' 
                            : ''
                      }
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {plan.name}
                          <div className="flex gap-2">
                            {plan.current && (
                              <Badge variant="secondary">Atual</Badge>
                            )}
                            {plan.popular && (
                              <Badge variant="default">Popular</Badge>
                            )}
                          </div>
                        </CardTitle>
                        <CardDescription>
                          <span className="text-3xl font-bold">{plan.price}</span>
                          {plan.name === 'Free' && (
                            <span className="block text-sm text-muted-foreground mt-1">Sem compromisso</span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 min-h-[320px]">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-center">
                              <Check className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          variant={plan.current ? 'outline' : 'default'}
                          disabled={plan.current}
                          onClick={() => !plan.current && handlePlanChange(plan)}
                        >
                          {plan.current ? 'Plano Atual' : plan.name === 'Free' ? 'Começar Grátis' : 'Alterar Plano'}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="payment" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações de Pagamento</CardTitle>
                    <CardDescription>
                      Gerencie suas informações de pagamento e assinatura
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="rounded-lg border p-4 bg-muted/50">
                      <div className="flex items-center gap-4">
                        <CreditCard className="h-6 w-6" />
                        <div className="flex-1">
                          <p className="font-medium">Cartão atual</p>
                          <p className="text-sm text-muted-foreground">Mastercard terminando em 1234</p>
                        </div>
                        <Badge variant="outline">Principal</Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Adicionar novo cartão</h3>
                      <div className="space-y-2">
                        <Label>Número do Cartão</Label>
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <Input placeholder="•••• •••• •••• ••••" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Validade</Label>
                          <Input placeholder="MM/AA" />
                        </div>
                        <div className="space-y-2">
                          <Label>CVV</Label>
                          <Input placeholder="•••" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Nome no Cartão</Label>
                        <Input placeholder="Nome como está no cartão" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-2">
                    <Button className="w-full">Adicionar Cartão</Button>
                    <Button variant="outline" className="w-full text-red-500 hover:text-red-500">
                      Cancelar Assinatura
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="invoices" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Faturas</CardTitle>
                    <CardDescription>
                      Visualize e baixe suas faturas anteriores
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Vencimento</TableHead>
                          <TableHead>Plano</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Forma de Pagamento</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Download</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((invoice, index) => (
                          <TableRow key={index}>
                            <TableCell>{invoice.date}</TableCell>
                            <TableCell>{invoice.dueDate}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{invoice.plan}</Badge>
                            </TableCell>
                            <TableCell>{invoice.amount}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {invoice.paymentMethod}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {invoice.status === 'paid' ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                )}
                                <Badge variant={invoice.status === 'paid' ? 'success' : 'destructive'}>
                                  {invoice.status === 'paid' ? 'Pago' : 'Em Atraso'}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {currentPlan && (
            <div className="w-80 flex-shrink-0">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Resumo do Plano Atual</CardTitle>
                  <CardDescription>
                    Você está no plano {currentPlan.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">
                          Uso do Plano ({currentPlan.usagePercent}%)
                        </div>
                        <div className="text-sm text-muted-foreground">75/100 pedidos</div>
                      </div>
                      <Progress value={currentPlan.usagePercent} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Próxima cobrança em 5 dias</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Cartão final 1234</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Assinante desde Jan/2024</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Ver Detalhes do Plano
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUp className="h-5 w-5 text-green-500" />
              Upgrade para {selectedPlan?.name}
            </DialogTitle>
            <DialogDescription>
              Você está prestes a fazer um upgrade do plano <strong>{currentPlan?.name}</strong> para o plano <strong>{selectedPlan?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="font-medium mb-2">Benefícios do novo plano:</h4>
              <ul className="space-y-2">
                {selectedPlan?.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border p-4 bg-muted">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Novo valor mensal</p>
                  <p className="text-sm text-muted-foreground">Cobrança imediata proporcional</p>
                </div>
                <p className="text-2xl font-bold">{selectedPlan?.price}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmChange} className="bg-green-600 hover:bg-green-700">
              Confirmar Upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDowngradeDialog} onOpenChange={setShowDowngradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Alterar para {selectedPlan?.name}
            </DialogTitle>
            <DialogDescription>
              Você está prestes a fazer um downgrade do plano <strong>{currentPlan?.name}</strong> para o plano <strong>{selectedPlan?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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

            <div className="rounded-lg border p-4">
              <h4 className="font-medium mb-2">Recursos do novo plano:</h4>
              <ul className="space-y-2">
                {selectedPlan?.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border p-4 bg-muted">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Novo valor mensal</p>
                  <p className="text-sm text-muted-foreground">Válido a partir do próximo ciclo</p>
                </div>
                <p className="text-2xl font-bold">{selectedPlan?.price}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDowngradeDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="default" 
              onClick={handleConfirmChange}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Confirmar Alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}
