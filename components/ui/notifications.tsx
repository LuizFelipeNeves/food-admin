import { Bell } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"
import { Button } from "./button"
import { ScrollArea } from "./scroll-area"

interface Notification {
  id: string
  title: string
  description: string
  time: string
  read: boolean
}

const notifications: Notification[] = [
  {
    id: "1",
    title: "Novo Pedido Recebido",
    description: "Pedido #1234 foi criado por João Silva",
    time: "há 5 minutos",
    read: false,
  },
  {
    id: "2",
    title: "Pedido Atualizado",
    description: "Pedido #1230 mudou para 'Em Produção'",
    time: "há 1 hora",
    read: false,
  },
  {
    id: "3",
    title: "Novo Cliente Cadastrado",
    description: "Maria Santos acabou de se cadastrar",
    time: "há 2 horas",
    read: true,
  },
]

export function NotificationsPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
            2
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 border-b">
          <h4 className="font-semibold">Notificações</h4>
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b last:border-0 ${
                notification.read ? "bg-background" : "bg-muted/50"
              }`}
            >
              <h5 className="font-semibold mb-1">{notification.title}</h5>
              <p className="text-sm text-muted-foreground mb-1">
                {notification.description}
              </p>
              <span className="text-xs text-muted-foreground">
                {notification.time}
              </span>
            </div>
          ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
