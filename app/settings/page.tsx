'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Layout } from '@/components/layout/layout'
import { TimeInput } from '@/components/ui/time-input'
import { Label } from "@/components/ui/label"


const businessFormSchema = z.object({
  businessName: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  address: z.string().min(5, 'Endereço muito curto'),
})

const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  soundAlerts: z.boolean(),
  orderReminders: z.boolean(),
})

const paymentFormSchema = z.object({
  paymentMethod: z.string(),
  paymentDetails: z.string(),
  paymentGateway: z.string(),
})

export default function SettingsPage() {
  const businessForm = useForm<z.infer<typeof businessFormSchema>>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      businessName: '',
      email: '',
      phone: '',
      address: '',
    },
  })

  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      soundAlerts: true,
      orderReminders: true,
    },
  })

  const paymentForm = useForm({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentMethod: '',
      paymentDetails: '',
      paymentGateway: '',
    },
  })

  function onBusinessSubmit(values: z.infer<typeof businessFormSchema>) {
    console.log(values)
  }

  function onNotificationSubmit(values: z.infer<typeof notificationFormSchema>) {
    console.log(values)
  }

  const [isOpen, setIsOpen] = useState(true)
  const [startTime, setStartTime] = useState({ hours: "08", minutes: "00" })
  const [endTime, setEndTime] = useState({ hours: "22", minutes: "00" })

  const daysOfWeek = [
    { id: 'monday', label: 'Segunda-feira' },
    { id: 'tuesday', label: 'Terça-feira' },
    { id: 'wednesday', label: 'Quarta-feira' },
    { id: 'thursday', label: 'Quinta-feira' },
    { id: 'friday', label: 'Sexta-feira' },
    { id: 'saturday', label: 'Sábado' },
    { id: 'sunday', label: 'Domingo' }
  ]

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Configurações</h1>

        <Tabs defaultValue="business" className="space-y-4">
          <TabsList>
            <TabsTrigger value="business">Empresa</TabsTrigger>
            <TabsTrigger value="hours">Horários</TabsTrigger>
            <TabsTrigger value="payment">Pagamento</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
          </TabsList>

          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Dados da Empresa</CardTitle>
                <CardDescription>
                  Configure as informações básicas do seu estabelecimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...businessForm}>
                  <form onSubmit={businessForm.handleSubmit(onBusinessSubmit)} className="space-y-4">
                    <FormField
                      control={businessForm.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Empresa</FormLabel>
                          <FormControl>
                            <Input placeholder="Sua empresa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={businessForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="email@exemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={businessForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(00) 00000-0000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={businessForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua, número, bairro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit">Salvar Alterações</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>
                  Gerencie como você deseja receber notificações do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Notificações por Email</FormLabel>
                            <FormDescription>
                              Receba atualizações importantes por email
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="soundAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Alertas Sonoros</FormLabel>
                            <FormDescription>
                              Toque um som quando novos pedidos chegarem
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="orderReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Lembretes de Pedidos</FormLabel>
                            <FormDescription>
                              Receba lembretes sobre pedidos pendentes
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button type="submit">Salvar Preferências</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours" className="space-y-4">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Estabelecimento Aberto</Label>
                    <div className="text-sm text-muted-foreground">
                      Ative ou desative o recebimento de pedidos
                    </div>
                  </div>
                  <Switch
                    checked={isOpen}
                    onCheckedChange={setIsOpen}
                  />
                </div>

                <div className="grid gap-6 pt-4">
                  {daysOfWeek.map((day) => (
                    <div key={day.id} className="flex items-center gap-4">
                      <div className="w-40">
                        <Label>{day.label}</Label>
                      </div>

                      <div className="flex items-center gap-4">
                        <Switch defaultChecked />

                        <div className="flex items-center gap-2">
                          <TimeInput
                            value={startTime}
                            onChange={setStartTime}
                          />
                          <span>às</span>
                          <TimeInput
                            value={endTime}
                            onChange={setEndTime}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Pagamento</CardTitle>
                <CardDescription>
                  Configure os métodos de pagamento disponíveis para seu estabelecimento.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...paymentForm}>
                  <form className="space-y-4">
                    {/* Método de Pagamento */}
                    <FormItem>
                      <FormLabel>Escolha o Método de Pagamento</FormLabel>
                      <FormControl>
                        <select className="w-full p-2 border rounded-md">
                          <option value="credit_card">Cartão de Crédito</option>
                          <option value="bank_transfer">Transferência Bancária</option>
                          <option value="pix">Pix</option>
                          <option value="boleto">Boleto Bancário</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>

                    {/* Detalhes do Método de Pagamento */}
                    <FormField
                      name="paymentDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Detalhes do Método de Pagamento</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Número da conta bancária ou chave Pix"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Configurações de gateway de pagamento */}
                    <FormField
                      name="paymentGateway"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gateway de Pagamento</FormLabel>
                          <FormControl>
                            <select className="w-full p-2 border rounded-md" {...field}>
                              <option value="stripe">Stripe</option>
                              <option value="paypal">PayPal</option>
                              <option value="mercadopago">MercadoPago</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit">Salvar Configurações</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

    </Layout>
  )
}
