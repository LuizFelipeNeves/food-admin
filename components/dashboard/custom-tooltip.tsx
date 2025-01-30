'use client'

import { Card } from '@/components/ui/card'

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

export function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <Card className="bg-background border-border p-3">
      <p className="text-sm font-medium text-foreground mb-1">{label}</p>
      {payload.map((item, index) => (
        <p key={index} className="text-sm text-muted-foreground">
          {item.name}: R$ {item.value}
        </p>
      ))}
    </Card>
  )
}
