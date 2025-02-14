import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { TimeInput } from '@/components/ui/time-input'
import { trpc as api } from '@/app/_trpc/client'
import toast from 'react-hot-toast'
import { Loader2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

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

  const { data: hoursData, isLoading } = api.settings.getBusinessHours.useQuery({ storeId })
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
        <CardTitle>Horário de Funcionamento</CardTitle>
        <CardDescription>
          Configure os horários de funcionamento do seu estabelecimento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-6">
            {daysOfWeek.map((day) => {
              const dayHours = businessHours.find(h => h.day === day._id)
              if (!dayHours) return null

              return (
                <div 
                  key={day._id} 
                  className={cn(
                    "space-y-3 sm:space-y-0 sm:grid sm:grid-cols-[180px_1fr] sm:items-center sm:gap-4 p-4 rounded-lg border transition-colors",
                    dayHours.enabled && "border-primary"
                  )}
                >
                  <div className="flex items-center justify-between sm:justify-start gap-2">
                    <Label className="font-medium">{day.label}</Label>
                    <Clock className="h-4 w-4 text-muted-foreground sm:hidden" />
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Switch
                      checked={dayHours.enabled}
                      onCheckedChange={(checked) => handleHourChange(day._id, 'enabled', checked)}
                    />
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <TimeInput
                        value={{
                          hours: dayHours.hours.from.hour.toString().padStart(2, '0'),
                          minutes: dayHours.hours.from.minute.toString().padStart(2, '0')
                        }}
                        onChange={(value) => handleHourChange(day._id, 'from', value)}
                        disabled={!dayHours.enabled}
                        className="w-full sm:w-auto"
                      />
                      <span className="text-sm text-muted-foreground">às</span>
                      <TimeInput
                        value={{
                          hours: dayHours.hours.to.hour.toString().padStart(2, '0'),
                          minutes: dayHours.hours.to.minute.toString().padStart(2, '0')
                        }}
                        onChange={(value) => handleHourChange(day._id, 'to', value)}
                        disabled={!dayHours.enabled}
                        className="w-full sm:w-auto"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => updateBusinessHours.mutate({ businessHours, storeId })}
              disabled={updateBusinessHours.isLoading}
              className="w-full sm:w-auto"
            >
              {updateBusinessHours.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Horários'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
