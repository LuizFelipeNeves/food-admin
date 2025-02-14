'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Layout } from '@/components/layout/layout'
import { BusinessSettings } from '@/components/settings/business-settings'
import { NotificationSettings } from '@/components/settings/notification-settings'
import { PaymentSettings } from '@/components/settings/payment-settings'
import { BusinessHours } from '@/components/settings/business-hours'
import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import toast from 'react-hot-toast'
import { trpc as api } from '@/app/_trpc/client'

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
  }]

export default function SettingsPage() {
  const [paymentMethods, setPaymentMethods] = useState([])

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

  const handlePaymentMethodChange = (paymentId: string, checked: boolean) => {
    setPaymentMethods(prev => checked ? [...prev, paymentId] : prev.filter((id: string) => id !== paymentId))
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

  const handleSaveNotificationSettings = () => {
    toast.success('Configurações de notificações salvas com sucesso', {
      style: {
        borderRadius: '6px',
        background: '#333',
        color: '#fff',
      },
    })
  }

  const handleSavePaymentSettings = () => {
    toast.success('Formas de pagamento salvas com sucesso', {
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
          <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        </div>

        <Tabs defaultValue="business" className="space-y-4">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="business" className="text-base">
              Dados do Negócio
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-base">
              Notificações
            </TabsTrigger>
            <TabsTrigger value="payment" className="text-base">
              Formas de Pagamento
            </TabsTrigger>
            <TabsTrigger value="hours" className="text-base">
              Horário de Funcionamento
            </TabsTrigger>
          </TabsList>

          <div className="overflow-auto max-h-[calc(100vh-200px)]">
            <TabsContent value="business" className="space-y-4">
              <BusinessSettings storeId={storeId} />
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationSettings />
            </TabsContent>

            <TabsContent value="payment" className="space-y-4">
              <PaymentSettings storeId={storeId} />
            </TabsContent>

            <TabsContent value="hours" className="space-y-4">
              <BusinessHours storeId={storeId} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

    </Layout>
  )
}
