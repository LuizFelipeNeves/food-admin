'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Layout } from '@/components/layout/layout'
import { BusinessSettings } from '@/components/settings/business-settings'
import { NotificationSettings } from '@/components/settings/notification-settings'
import { PaymentSettings } from '@/components/settings/payment-settings'
import { BusinessHours } from '@/components/settings/business-hours'

export default function SettingsPage() {
  // tRPC queries and mutations
  const storeId = '67a05b53927e38337439322f';

  return (
    <Layout>
      <div className="flex-1 space-y-4 px-4 py-6 md:px-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        </div>

        <Tabs defaultValue="business" className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="w-full justify-start inline-flex">
              <TabsTrigger value="business" className="text-base">
                Dados do Negócio
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-base">
                Notificações e Privacidade
              </TabsTrigger>
              <TabsTrigger value="payment" className="text-base">
                Formas de Pagamento
              </TabsTrigger>
              <TabsTrigger value="hours" className="text-base">
                Horário de Funcionamento
              </TabsTrigger>
            </TabsList>
          </div>

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
