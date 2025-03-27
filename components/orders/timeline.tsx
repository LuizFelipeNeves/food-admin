import { cn } from "@/lib/utils"
import { OrderEvent } from "@/types/order"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  CheckCircle2,
  Clock,
  PackageCheck,
  PackageOpen,
  PackageSearch,
  Truck,
} from "lucide-react"
import { TimeDisplay } from "@/components/ui/time-display"

interface TimelineProps {
  events: OrderEvent[]
}

const statusIcons = {
  new: Clock,
  confirmed: PackageSearch,
  preparing: PackageOpen,
  ready: PackageCheck,
  delivering: Truck,
  completed: CheckCircle2,
  pending: Clock,
}

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="relative pl-8 space-y-6">
      <div className="absolute top-2 bottom-2 left-3 w-px bg-border" />
      {events?.map((event, index) => {
        const Icon = statusIcons[event.status]
        const isFirst = index === 0

        return (
          <div
            key={event._id}
            className="relative min-h-[2rem]"
          >
            <div
              className={cn(
                "absolute -left-5 p-1 rounded-full border bg-background",
                {
                  "ring-2 ring-primary": isFirst,
                }
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex flex-col gap-1 pl-6">
              <p className="text-sm font-medium leading-relaxed">{event.description}</p>
              <time className="text-sm text-muted-foreground">
                {format(new Date(event.date), "dd 'de' MMMM", { locale: ptBR })} às <TimeDisplay fixedDate={event.date} />
              </time>
            </div>
          </div>
        )
      })}
    </div>
  )
}
