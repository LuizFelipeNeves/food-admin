import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { TimeInput } from '@/components/ui/time-input'
import { trpc as api } from '@/app/_trpc/client'
import toast from 'react-hot-toast'

const daysOfWeek = [
  { _id: 'monday', label: 'Segunda-feira' },
  { _id: 'tuesday', label: 'Terça-feira' },
  { _id: 'wednesday', label: 'Quarta-feira' },
  { _id: 'thursday', label: 'Quinta-feira' },
  { _id: 'friday', label: 'Sexta-feira' },
  { _id: 'saturday', label: 'Sábado' },
  { _id: 'sunday', label: 'Domingo' }
]

interface BusinessHour {
  day: string
  enabled: boolean
  hours: {
    from: { hour: number; minute: number }
    to: { hour: number; minute: number }
  }
}

export function BusinessHours({ storeId }: { storeId: string }) {
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([
    { day: 'monday', enabled: true, hours: { from: { hour: 8, minute: 0 }, to: { hour: 22, minute: 0 } } },
    { day: 'tuesday', enabled: true, hours: { from: { hour: 8, minute: 0 }, to: { hour: 22, minute: 0 } } },
    { day: 'wednesday', enabled: true, hours: { from: { hour: 8, minute: 0 }, to: { hour: 22, minute: 0 } } },
    { day: 'thursday', enabled: true, hours: { from: { hour: 8, minute: 0 }, to: { hour: 22, minute: 0 } } },
    { day: 'friday', enabled: true, hours: { from: { hour: 8, minute: 0 }, to: { hour: 22, minute: 0 } } },
    { day: 'saturday', enabled: true, hours: { from: { hour: 8, minute: 0 }, to: { hour: 22, minute: 0 } } },
    { day: 'sunday', enabled: true, hours: { from: { hour: 8, minute: 0 }, to: { hour: 22, minute: 0 } } }
  ])

  const { data: hoursData } = api.settings.getBusinessHours.useQuery({ storeId })
  const updateBusinessHours = api.settings.updateBusinessHours.useMutation({
    onSuccess: () => {
      toast.success('Horários atualizados com sucesso', {
        style: {
          borderRadius: '6px',
          background: '#333',
          color: '#fff',
        },
      })
    },
    onError: (error) => {
      toast.error(error.message, {
        style: {
          borderRadius: '6px',
          background: '#333',
          color: '#fff',
        },
      })
    }
  })

  useEffect(() => {
    if (hoursData) {
      setBusinessHours(hoursData)
    }
  }, [hoursData])

  const handleHourChange = (day: string, field: 'enabled' | 'from' | 'to', value: any) => {
    setBusinessHours(prev => prev.map(hour => {
      if (hour.day === day) {
        if (field === 'enabled') {
          return { ...hour, enabled: value }
        }
        return {
          ...hour,
          hours: {
            ...hour.hours,
            [field]: {
              hour: parseInt(value.hours),
              minute: parseInt(value.minutes)
            }
          }
        }
      }
      return hour
    }))
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-4">
        <div className="grid gap-6 pt-4">
          {daysOfWeek.map((day) => {
            const dayHours = businessHours.find(h => h.day === day._id)
            if (!dayHours) return null

            return (
              <div key={day._id} className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-[180px_1fr] sm:items-center sm:gap-4">
                <div className="flex items-center justify-center sm:justify-start">
                  <Label className="font-medium">{day.label}</Label>
                </div>
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4">
                  <div className="flex items-center justify-center gap-4">
                    <Switch
                      checked={dayHours.enabled}
                      onCheckedChange={(checked) => handleHourChange(day._id, 'enabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <TimeInput
                      value={{
                        hours: dayHours.hours.from.hour.toString().padStart(2, '0'),
                        minutes: dayHours.hours.from.minute.toString().padStart(2, '0')
                      }}
                      onChange={(value) => handleHourChange(day._id, 'from', value)}
                      disabled={!dayHours.enabled}
                    />
                    <span className="text-sm text-muted-foreground">às</span>
                    <TimeInput
                      value={{
                        hours: dayHours.hours.to.hour.toString().padStart(2, '0'),
                        minutes: dayHours.hours.to.minute.toString().padStart(2, '0')
                      }}
                      onChange={(value) => handleHourChange(day._id, 'to', value)}
                      disabled={!dayHours.enabled}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <Button
          className="w-full sm:w-auto mt-6"
          onClick={() => {
            updateBusinessHours.mutate({ businessHours, storeId })
          }}
          disabled={updateBusinessHours.isLoading}
        >
          {updateBusinessHours.isLoading ? "Salvando..." : "Salvar Horários"}
        </Button>
      </div>
    </Card>
  )
}
