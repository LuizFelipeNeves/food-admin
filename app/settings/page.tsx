'use client'

import { useState, useEffect } from 'react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Layout } from '@/components/layout/layout'
import { TimeInput } from '@/components/ui/time-input'
import { Label } from "@/components/ui/label"
import toast from 'react-hot-toast'
import { trpc as api } from '@/app/_trpc/client'
import { Save } from "lucide-react"
import { Separator } from '@/components/ui/separator'

const businessFormSchema = z.object({
  businessName: z.string().min(2, 'Nome muito curto'),
  description: z.string().min(5, 'Descrição muito curta'),
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
  paymentMethods: z.array(z.object({
    type: z.string(),
    active: z.boolean(),
    pixKey: z.string().optional()
  }))
})

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState([
    { type: 'CASH', active: true },
    { type: 'CREDIT_CARD', active: true },
    { type: 'DEBIT_CARD', active: true },
    { type: 'PIX', active: false, pixKey: '' }
  ])

  const [businessHours, setBusinessHours] = useState([
    { day: 'monday', enabled: true, hours: { from: { hour: 8, minute: 0 }, to: { hour: 22, minute: 0 } } },
    { day: 'tuesday', enabled: true, hours: { from: { hour: 8, minute: 0 }, to: { hour: 22, minute: 0 } } },
    { day: 'wednesday', enabled: true, hours: { from: { hour: 8, minute: 0 }, to: { hour: 22, minute: 0 } } },
    { day: 'thursday', enabled: true, hours: { from: { hour: 8, minute: 0 }, to: { hour: 22, minute: 0 } } },
    { day: 'friday', enabled: true, hours: { from: { hour: 8, minute: 0 }, to: { hour: 22, minute: 0 } } },
    { day: 'saturday', enabled: true, hours: { from: { hour: 8, minute: 0 }, to: { hour: 22, minute: 0 } } },
    { day: 'sunday', enabled: true, hours: { from: { hour: 8, minute: 0 }, to: { hour: 22, minute: 0 } } }
  ])

  const businessForm = useForm<z.infer<typeof businessFormSchema>>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      businessName: '',
      description: '',
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

  // tRPC queries and mutations
  const storeId = '67a05b53927e38337439322f';
  const { data: businessData } = api.settings.getBusiness.useQuery({ storeId })
  const { data: hoursData } = api.settings.getBusinessHours.useQuery({ storeId })
  const { data: paymentData } = api.settings.getPaymentMethods.useQuery({ storeId })
  
  // Load business data when available
  useEffect(() => {
    if (businessData) {
      businessForm.reset(businessData)
    }
  }, [businessData])

  // Load payment methods when available
  useEffect(() => {
    if (paymentData) {
      setPaymentMethods(paymentData)
    }
  }, [paymentData])

  // Load business hours when available
  useEffect(() => {
    if (hoursData) {
      setBusinessHours(hoursData)
    }
  }, [hoursData])

  const updateBusiness = api.settings.updateBusiness.useMutation({
    onSuccess: () => {
      toast.success('Informações da empresa atualizadas com sucesso', {
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

  const updateBusinessHours = api.settings.updateBusinessHours.useMutation({
    onSuccess: () => {
      toast.success('Horários atualizados com sucesso', {
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

  async function onBusinessSubmit(values: z.infer<typeof businessFormSchema>) {
    updateBusiness.mutate({ ...values, storeId })
  }

  async function onHoursSubmit(values: any) {
    updateBusinessHours.mutate({ businessHours: values, storeId })
  }

  async function onPaymentMethodToggle(index: number) {
    const newPaymentMethods = [...paymentMethods]
    newPaymentMethods[index].active = !newPaymentMethods[index].active
    setPaymentMethods(newPaymentMethods)
    updatePaymentMethods.mutate({ paymentMethods: newPaymentMethods, storeId })
  }

  async function onPixKeyChange(pixKey: string) {
    const newPaymentMethods = [...paymentMethods]
    const pixIndex = newPaymentMethods.findIndex(pm => pm.type === 'PIX')
    if (pixIndex !== -1) {
      newPaymentMethods[pixIndex].pixKey = pixKey
      setPaymentMethods(newPaymentMethods)
      updatePaymentMethods.mutate({ paymentMethods: newPaymentMethods, storeId })
    }
  }

  const handleHourChange = (day: string, field: 'enabled' | 'from' | 'to', value: any) => {
    setBusinessHours(prev => prev.map(hour => {
      if (hour.day === day) {
        if (field === 'enabled') {
          return { ...hour, enabled: value }
        }
        return { 
          ...hour, 
          hours: {
            ...hour.hours,
            [field]: {
              hour: parseInt(value.hours),
              minute: parseInt(value.minutes)
            }
          }
        }
      }
      return hour
    }))
  }

  const daysOfWeek = [
    { _id: 'monday', label: 'Segunda-feira' },
    { _id: 'tuesday', label: 'Terça-feira' },
    { _id: 'wednesday', label: 'Quarta-feira' },
    { _id: 'thursday', label: 'Quinta-feira' },
    { _id: 'friday', label: 'Sexta-feira' },
    { _id: 'saturday', label: 'Sábado' },
    { _id: 'sunday', label: 'Domingo' }
  ]

  const handleSaveGeneralSettings = () => {
    toast.success('Configurações gerais salvas com sucesso!', {
      style: {
        borderRadius: '6px',
        background: '#333',
        color: '#fff',
      },
    })
  }

  const handleSavePaymentSettings = () => {
    toast.success('Formas de pagamento salvas com sucesso!', {
      style: {
        borderRadius: '6px',
        background: '#333',
        color: '#fff',
      },
    })
  }

  return (
    <Layout>
      <div className="flex-1 space-y-4 px-4 py-6 md:px-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        </div>

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="payment">Formas de Pagamento</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="hours">Horário de Funcionamento</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-4 py-4">
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
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição da Empresa</FormLabel>
                            <FormControl>
                              <Input placeholder="Descrição da empresa" {...field} />
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

                      <div className="mt-6">
                        <Button type="submit">
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>
                  Configure como você deseja receber as notificações do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por Email</Label>
                    <div className="text-sm text-muted-foreground">
                      Receber notificações por email quando houver novos pedidos
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações Push</Label>
                    <div className="text-sm text-muted-foreground">
                      Receber notificações push no navegador
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Som de Notificação</Label>
                    <div className="text-sm text-muted-foreground">
                      Tocar som quando receber novos pedidos
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>WhatsApp</Label>
                    <div className="text-sm text-muted-foreground">
                      Receber notificações via WhatsApp
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
              <CardFooter className="justify-start pt-6">
                <Button onClick={() => {
                  toast.success('Configurações de notificação salvas com sucesso!', {
                    style: {
                      borderRadius: '6px',
                      background: '#333',
                      color: '#fff',
                    },
                  })
                }}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="hours" className="space-y-4">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="grid gap-6 pt-4">
                  {daysOfWeek.map((day) => {
                    const dayHours = businessHours.find(h => h.day === day._id)
                    if (!dayHours) return null

                    return (
                      <div key={day._id} className="flex items-center gap-4">
                        <div className="w-40">
                          <Label>{day.label}</Label>
                        </div>

                        <div className="flex items-center gap-4">
                          <Switch 
                            checked={dayHours.enabled}
                            onCheckedChange={(checked) => handleHourChange(day._id, 'enabled', checked)}
                          />

                          <div className="flex items-center gap-2">
                            <TimeInput
                              value={{
                                hours: dayHours.hours.from.hour.toString().padStart(2, '0'),
                                minutes: dayHours.hours.from.minute.toString().padStart(2, '0')
                              }}
                              onChange={(value) => handleHourChange(day._id, 'from', value)}
                              disabled={!dayHours.enabled}
                            />
                            <span>às</span>
                            <TimeInput
                              value={{
                                hours: dayHours.hours.to.hour.toString().padStart(2, '0'),
                                minutes: dayHours.hours.to.minute.toString().padStart(2, '0')
                              }}
                              onChange={(value) => handleHourChange(day._id, 'to', value)}
                              disabled={!dayHours.enabled}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-6">
                  <Button 
                    onClick={() => {
                      updateBusinessHours.mutate({ businessHours, storeId })
                    }}
                    disabled={updateBusinessHours.isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateBusinessHours.isLoading ? "Salvando..." : "Salvar Horários"}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Formas de Pagamento</CardTitle>
                <CardDescription>
                  Configure as formas de pagamento aceitas pelo seu estabelecimento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dinheiro</Label>
                    <div className="text-sm text-muted-foreground">
                      Aceitar pagamento em dinheiro
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cartão de Crédito</Label>
                    <div className="text-sm text-muted-foreground">
                      Aceitar pagamento com cartão de crédito
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cartão de Débito</Label>
                    <div className="text-sm text-muted-foreground">
                      Aceitar pagamento com cartão de débito
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>PIX</Label>
                    <div className="text-sm text-muted-foreground">
                      Aceitar pagamento via PIX
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
              <CardFooter className="justify-start pt-6">
                <Button onClick={handleSavePaymentSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

    </Layout>
  )
}
