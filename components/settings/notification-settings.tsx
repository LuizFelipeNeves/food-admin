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

const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  soundAlerts: z.boolean(),
  orderReminders: z.boolean(),
})

export function NotificationSettings() {
  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      soundAlerts: true,
      orderReminders: true,
    },
  })

  const handleSaveNotificationSettings = () => {
    toast.success('Configurações de notificações salvas com sucesso', {
      style: {
        borderRadius: '6px',
        background: '#333',
        color: '#fff',
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências de Notificação</CardTitle>
        <CardDescription>
          Gerencie como você deseja receber notificações do sistema
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
            </div>

            <Button type="submit">Salvar Preferências</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
