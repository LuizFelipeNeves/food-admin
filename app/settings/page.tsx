'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Layout } from '@/components/layout/layout'
import { BusinessSettings } from '@/components/settings/business-settings'
import { NotificationSettings } from '@/components/settings/notification-settings'
import { PaymentSettings } from '@/components/settings/payment-settings'
import { BusinessHours } from '@/components/settings/business-hours'
import { useMediaQuery } from '@/hooks/use-media-query'
import { Building2, Bell, CreditCard, Clock } from 'lucide-react'

export default function SettingsPage() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const storeId = '67a05b53927e38337439322f';

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-4 md:p-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie as configurações do seu negócio
          </p>
        </div>

        <Tabs defaultValue="business" className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="h-auto w-full justify-start inline-flex p-0 bg-transparent">
              <TabsTrigger 
                value="business" 
                className="flex-1 sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {isMobile ? (
                  <Building2 className="h-4 w-4" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>Negócio</span>
                  </div>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="flex-1 sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {isMobile ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span>Notificações</span>
                  </div>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="payment" 
                className="flex-1 sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {isMobile ? (
                  <CreditCard className="h-4 w-4" />
                ) : (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Pagamento</span>
                  </div>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="hours" 
                className="flex-1 sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {isMobile ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Horários</span>
                  </div>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="overflow-auto max-h-[calc(100vh-200px)]">
            <TabsContent value="business" className="space-y-4 m-0">
              <BusinessSettings storeId={storeId} />
            </TabsContent>

            <TabsContent value="notifications" className="m-0">
              <NotificationSettings storeId={storeId}/>
            </TabsContent>

            <TabsContent value="payment" className="space-y-4 m-0">
              <PaymentSettings storeId={storeId} />
            </TabsContent>

            <TabsContent value="hours" className="space-y-4 m-0">
              <BusinessHours storeId={storeId} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  )
}
