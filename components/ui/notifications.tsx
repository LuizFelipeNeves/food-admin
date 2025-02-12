import { Bell, ShoppingCart, User, Package, CheckCircle2, X, LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'
import { Separator } from '@/components/ui/separator'

type NotificationType = 'new_order' | 'status_update' | 'delivery' | 'user'

type Notification = {
  id: string
  type: NotificationType
  title: string
  description: string
  time: string
}

const notificationIcons: Record<NotificationType, LucideIcon> = {
  new_order: ShoppingCart,
  status_update: Package,
  delivery: CheckCircle2,
  user: User,
}

export function NotificationsPopover() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'new_order',
      title: 'Novo Pedido',
      description: 'Pedido #123 foi realizado',
      time: '2 min atrás'
    },
    {
      id: '2',
      type: 'status_update',
      title: 'Pedido Atualizado',
      description: 'Pedido #120 foi atualizado para "Em Preparo"',
      time: '5 min atrás'
    },
    {
      id: '3',
      type: 'delivery',
      title: 'Pedido Entregue',
      description: 'Pedido #119 foi entregue com sucesso',
      time: '10 min atrás'
    },
    {
      id: '4',
      type: 'user',
      title: 'Novo Cliente',
      description: 'João Silva acabou de se cadastrar',
      time: '15 min atrás'
    }
  ])

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const getIconColor = (type: NotificationType): string => {
    switch (type) {
      case 'new_order':
        return 'text-blue-500'
      case 'status_update':
        return 'text-yellow-500'
      case 'delivery':
        return 'text-green-500'
      case 'user':
        return 'text-purple-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">Notificações</h4>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllNotifications}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Limpar todas
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px] pr-4">
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Nenhuma notificação
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => {
                const NotificationIcon = notificationIcons[notification.type]
                return (
                  <div key={notification.id} className="relative">
                    <div className="mb-4">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${getIconColor(notification.type)}`}>
                          <NotificationIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-medium">{notification.title}</h5>
                              <p className="text-sm text-muted-foreground">
                                {notification.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.time}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeNotification(notification.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
