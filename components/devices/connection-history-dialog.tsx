'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { trpc } from '@/app/_trpc/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import useCurrentStore from '@/hooks/useCurrentStore'
import { Activity, Clock, Wifi, WifiOff, AlertTriangle, CheckCircle, QrCode, MessageCircle } from 'lucide-react'
import type { Device, DeviceHistoryInput, DeviceStatsInput } from '@/types/devices'

interface ConnectionHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  device: Device
}

const eventTypeLabels: Record<string, string> = {
  connected: 'Conectado',
  disconnected: 'Desconectado',
  error: 'Erro',
  qr_generated: 'QR Code Gerado',
  authenticated: 'Autenticado',
  ready: 'Pronto',
  message_received: 'Mensagem Recebida',
  message_sent: 'Mensagem Enviada',
}

const eventTypeIcons: Record<string, any> = {
  connected: Wifi,
  disconnected: WifiOff,
  error: AlertTriangle,
  qr_generated: QrCode,
  authenticated: CheckCircle,
  ready: CheckCircle,
  message_received: MessageCircle,
  message_sent: MessageCircle,
}

const eventTypeColors: Record<string, string> = {
  connected: 'bg-green-500',
  disconnected: 'bg-red-500',
  error: 'bg-red-500',
  qr_generated: 'bg-blue-500',
  authenticated: 'bg-green-500',
  ready: 'bg-green-500',
  message_received: 'bg-blue-500',
  message_sent: 'bg-purple-500',
}

export function ConnectionHistoryDialog({
  open,
  onOpenChange,
  device,
}: ConnectionHistoryDialogProps) {
  const { storeId } = useCurrentStore()
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all')

  const historyInput: DeviceHistoryInput = {
    id: device._id,
    storeId,
    eventType: eventTypeFilter === 'all' ? undefined : eventTypeFilter,
    limit: 100
  }

  const statsInput: DeviceStatsInput = {
    id: device._id,
    storeId,
    days: 7
  }

  const { data: historyData, isLoading: isLoadingHistory } = trpc.devices.getHistory.useQuery(
    historyInput,
    { enabled: open && !!storeId }
  )

  const { data: statsData } = trpc.devices.getStats.useQuery(
    statsInput,
    { enabled: open && !!storeId }
  )

  const events = historyData?.events || []

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const getEventBadgeVariant = (eventType: string) => {
    switch (eventType) {
      case 'connected':
      case 'authenticated':
      case 'ready':
        return 'default'
      case 'disconnected':
      case 'error':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Histórico do Dispositivo</DialogTitle>
          <DialogDescription>
            Histórico completo e estatísticas do dispositivo {device.name} ({device.phoneNumber})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estatísticas */}
          {statsData && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tempo Online
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatUptime(statsData.uptime)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {statsData.uptimePercentage}% uptime (7 dias)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Eventos
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsData.totalEvents}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Últimos 7 dias
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Conexões
                  </CardTitle>
                  <Wifi className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsData.stats.find(s => s._id === 'connected')?.total || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Últimos 7 dias
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Mensagens
                  </CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(statsData.stats.find(s => s._id === 'message_sent')?.total || 0) +
                     (statsData.stats.find(s => s._id === 'message_received')?.total || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enviadas + Recebidas
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filtro de eventos */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Filtrar por tipo:</label>
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="connected">Conectado</SelectItem>
                  <SelectItem value="disconnected">Desconectado</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                  <SelectItem value="qr_generated">QR Code</SelectItem>
                  <SelectItem value="authenticated">Autenticado</SelectItem>
                  <SelectItem value="ready">Pronto</SelectItem>
                  <SelectItem value="message_received">Msg Recebida</SelectItem>
                  <SelectItem value="message_sent">Msg Enviada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lista de eventos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Histórico de Eventos</CardTitle>
              <CardDescription>
                {events.length} evento{events.length !== 1 ? 's' : ''} encontrado{events.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-sm text-muted-foreground">Carregando histórico...</div>
                  </div>
                ) : events.length === 0 ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-sm text-muted-foreground">Nenhum evento encontrado</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {events.map((event: any) => {
                      const Icon = eventTypeIcons[event.eventType] || Activity
                      return (
                        <div key={event._id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className={`p-2 rounded-full ${eventTypeColors[event.eventType] || 'bg-gray-500'}`}>
                            <Icon className="h-3 w-3 text-white" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={getEventBadgeVariant(event.eventType)}>
                                {eventTypeLabels[event.eventType] || event.eventType}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(event.timestamp), 'PPp', { locale: ptBR })}
                              </span>
                            </div>
                            {event.message && (
                              <p className="text-sm">{event.message}</p>
                            )}
                            {event.metadata && Object.keys(event.metadata).length > 0 && (
                              <details className="text-xs text-muted-foreground">
                                <summary className="cursor-pointer">Detalhes técnicos</summary>
                                <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                                  {JSON.stringify(event.metadata, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {event.status}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}