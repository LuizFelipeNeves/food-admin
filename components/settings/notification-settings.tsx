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
import { Loader2 } from 'lucide-react'

const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  showPublicEmail: z.boolean(),
  showPublicPhone: z.boolean(),
  soundAlerts: z.boolean(),
})

export function NotificationSettings({ storeId }: { storeId: string }) {
  const { data: settings, isLoading } = api.settings.getNotificationSettings.useQuery({ storeId });

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
        <CardTitle>Preferências de Notificação</CardTitle>
        <CardDescription>
          Gerencie suas notificações e preferências de privacidade
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...notificationForm}>
          <form onSubmit={notificationForm.handleSubmit(handleSaveNotificationSettings)} className="space-y-6">
            <div className="grid gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium leading-none">Notificações</h3>
                <div className="grid gap-4">
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
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium leading-none">Privacidade</h3>
                <div className="grid gap-4">
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
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={updateSettings.isLoading || !notificationForm.formState.isDirty}
                className="w-full sm:w-auto"
              >
                {updateSettings.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Preferências'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
