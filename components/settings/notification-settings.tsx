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
} from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import toast from 'react-hot-toast'
import { trpc as api } from '@/app/_trpc/client'
import { useEffect } from 'react'

const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  showPublicEmail: z.boolean(),
  showPublicPhone: z.boolean(),
  soundAlerts: z.boolean(),
})

export function NotificationSettings({ storeId }: { storeId: string }) {
  const { data: settings } = api.settings.getNotificationSettings.useQuery({ storeId });

  const updateSettings = api.settings.updateNotificationSettings.useMutation({
    onSuccess: () => {
      toast.success('Configurações salvas com sucesso', {
        style: {
          borderRadius: '6px',
          background: '#333',
          color: '#fff',
        },
      })
    },
    onError: (error) => {
      toast.error('Erro ao salvar configurações: ' + error.message, {
        style: {
          borderRadius: '6px',
          background: '#333',
          color: '#fff',
        },
      })
    },
  });

  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      soundAlerts: true,
      showPublicEmail: true,
      showPublicPhone: true,
    },
  })

  useEffect(() => {
    if (settings) {
      notificationForm.reset(settings);
    }
  }, [settings, notificationForm]);

  const handleSaveNotificationSettings = (data: z.infer<typeof notificationFormSchema>) => {    
    updateSettings.mutate({
      storeId,
      ...data
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências de Notificação e Privacidade</CardTitle>
        <CardDescription>
          Gerencie como você deseja receber notificações do sistema e se deseja deixar publico seus dados no perfil da empresa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...notificationForm}>
          <form onSubmit={notificationForm.handleSubmit(handleSaveNotificationSettings)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <FormField
                control={notificationForm.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <div className="flex items-start gap-4 p-4 border rounded-lg">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Notificações por Email</FormLabel>
                        <FormDescription>
                          Receba atualizações importantes por email
                        </FormDescription>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={notificationForm.control}
                name="soundAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <div className="flex items-start gap-4 p-4 border rounded-lg">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Alertas Sonoros</FormLabel>
                        <FormDescription>
                          Toque um som quando novos pedidos chegarem
                        </FormDescription>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={notificationForm.control}
                name="showPublicEmail"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <div className="flex items-start gap-4 p-4 border rounded-lg">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Exibir Email Publico</FormLabel>
                        <FormDescription>
                          Exiba seu email publicamente no perfil
                        </FormDescription>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={notificationForm.control}
                name="showPublicPhone"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <div className="flex items-start gap-4 p-4 border rounded-lg">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Exibir Telefone Publico</FormLabel>
                        <FormDescription>
                          Exiba seu telefone publicamente no perfil
                        </FormDescription>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit">Salvar Preferências</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
