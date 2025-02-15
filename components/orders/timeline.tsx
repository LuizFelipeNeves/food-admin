import { OrderEvent } from "@/data/orders"
import { cn } from "@/lib/utils"
import { CheckCircle2, Circle } from "lucide-react"

interface TimelineProps {
  events: OrderEvent[]
}

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={event._id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5">
              {index === events.length - 1 ? (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            {index !== events.length - 1 && (
              <div className="w-px h-full bg-border" />
            )}
          </div>
          <div className="pb-4">
            <div className="text-sm text-muted-foreground">
              {new Date(event.date).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div className="font-medium">{event.description}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
