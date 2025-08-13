'use client'

import { useState } from 'react'
import { Layout } from '@/components/layout/layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, QrCode, History, Star, Play, Square, RotateCcw, LogOut } from 'lucide-react'
import { QRCodeDialog } from '@/components/devices/qr-code-dialog'
import { ConnectionHistoryDialog } from '@/components/devices/connection-history-dialog'
import { NewDeviceDialog } from '@/components/devices/new-device-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useToast } from '@/components/ui/use-toast'
import { trpc } from '@/app/_trpc/client'
import { useQueryClient } from '@tanstack/react-query'
import useCurrentStore from '@/hooks/useCurrentStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import type { Device, DeviceListInput, DeviceControlInput, DeviceDeleteInput, DeviceCreateInput } from '@/types/devices'


export default function DevicesPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { storeId } = useCurrentStore()
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [qrCodeDialog, setQrCodeDialog] = useState(false)
  const [historyDialog, setHistoryDialog] = useState(false)
  const [newDeviceDialog, setNewDeviceDialog] = useState(false)

  const listInput: DeviceListInput = { storeId }
  
  const { data: devicesData, isLoading } = trpc.devices.list.useQuery(
    listInput,
    { enabled: !!storeId }
  )

  const devices = devicesData?.devices || []
  const hasMainDevice = devices.some((device) => device.isMain)

  const createDeviceMutation = trpc.devices.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['devices', 'list']] })
      toast({
        title: 'Dispositivo criado com sucesso!',
        description: 'O novo dispositivo foi adicionado à sua lista.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar dispositivo',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const startDeviceMutation = trpc.devices.start.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['devices', 'list']] })
      toast({
        title: 'Dispositivo iniciado',
        description: 'O dispositivo foi iniciado com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao iniciar dispositivo',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const stopDeviceMutation = trpc.devices.stop.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['devices', 'list']] })
      toast({
        title: 'Dispositivo parado',
        description: 'O dispositivo foi parado com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao parar dispositivo',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const restartDeviceMutation = trpc.devices.restart.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['devices', 'list']] })
      toast({
        title: 'Dispositivo reiniciado',
        description: 'O dispositivo foi reiniciado com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao reiniciar dispositivo',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const deleteDeviceMutation = trpc.devices.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['devices', 'list']] })
      toast({
        title: 'Dispositivo removido',
        description: 'O dispositivo foi removido com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover dispositivo',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const getStatusColor = (status: Device['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'registered':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      case 'stopped':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: Device['status']) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'registered':
        return 'Registrado'
      case 'error':
        return 'Erro'
      case 'stopped':
        return 'Parado'
      default:
        return status
    }
  }

  const handleShowQRCode = (device: Device) => {
    setSelectedDevice(device)
    setQrCodeDialog(true)
  }

  const handleShowHistory = (device: Device) => {
    setSelectedDevice(device)
    setHistoryDialog(true)
  }


  const handleNewDevice = (data: { name: string; isMain: boolean; autoStart: boolean }) => {
    const input: DeviceCreateInput = { ...data, storeId }
    createDeviceMutation.mutate(input)
  }

  const handleStartDevice = (deviceId: string) => {
    const input: DeviceControlInput = { id: deviceId, storeId }
    startDeviceMutation.mutate(input)
  }

  const handleStopDevice = (deviceId: string) => {
    const input: DeviceControlInput = { id: deviceId, storeId }
    stopDeviceMutation.mutate(input)
  }

  const handleRestartDevice = (deviceId: string) => {
    const input: DeviceControlInput = { id: deviceId, storeId }
    restartDeviceMutation.mutate(input)
  }

  const handleDeleteDevice = (deviceId: string) => {
    if (confirm('Tem certeza que deseja remover este dispositivo?')) {
      const input: DeviceDeleteInput = { id: deviceId, storeId }
      deleteDeviceMutation.mutate(input)
    }
  }

  // Função para determinar quais ações estão disponíveis baseadas no status
  const getAvailableActions = (status: Device['status']) => {
    const actions = {
      canStart: false,
      canStop: false,
      canRestart: false,
      canDelete: true, // Sempre pode deletar
      canQR: false,
    }

    switch (status) {
      case 'active':
        actions.canStop = true
        actions.canRestart = true
        actions.canQR = true // Quando ativo, não precisa de QR
        break
      case 'registered':
        actions.canStart = true
        actions.canQR = true // Quando registrado, pode precisar de QR
        break
      case 'stopped':
        actions.canStart = true
        actions.canQR = false
        break
      case 'error':
        actions.canStart = true
        actions.canRestart = true // Em caso de erro, pode tentar reiniciar
        actions.canQR = true // Em caso de erro, pode precisar de novo QR
        break
    }

    return actions
  }

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dispositivos</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie seus dispositivos conectados
            </p>
          </div>

          <Button onClick={() => setNewDeviceDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Dispositivo
          </Button>
        </div>

        <Card>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-sm text-muted-foreground">Carregando dispositivos...</div>
              </div>
            ) : !storeId ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-sm text-muted-foreground">
                  Selecione uma loja para ver os dispositivos
                </div>
              </div>
            ) : devices.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-sm text-muted-foreground">
                  Nenhum dispositivo encontrado. Crie seu primeiro dispositivo!
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Nome</TableHead>
                    <TableHead>Device Hash</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última Conexão</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {device.name}
                          {device.isMain && (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {device.deviceHash}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${getStatusColor(
                              device.status
                            )}`}
                          />
                          {getStatusText(device.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {device.lastSeen 
                          ? format(new Date(device.lastSeen), 'PPp', { locale: ptBR })
                          : 'Nunca conectado'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {(() => {
                            const actions = getAvailableActions(device.status)
                            return (
                              <>
                                {actions.canQR && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleShowQRCode(device)}
                                    title="Mostrar QR Code"
                                  >
                                    <QrCode className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleShowHistory(device)}
                                  title="Histórico de conexões"
                                >
                                  <History className="h-4 w-4" />
                                </Button>
                              </>
                            )
                          })()}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon" title="Ações do dispositivo">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {(() => {
                                const actions = getAvailableActions(device.status)
                                return (
                                  <>
                                    {actions.canStart && (
                                      <DropdownMenuItem onClick={() => handleStartDevice(device._id)}>
                                        <Play className="mr-2 h-4 w-4" />
                                        Iniciar
                                      </DropdownMenuItem>
                                    )}
                                    {actions.canStop && (
                                      <DropdownMenuItem onClick={() => handleStopDevice(device._id)}>
                                        <Square className="mr-2 h-4 w-4" />
                                        Parar
                                      </DropdownMenuItem>
                                    )}
                                    {actions.canRestart && (
                                      <DropdownMenuItem onClick={() => handleRestartDevice(device._id)}>
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        Reiniciar
                                      </DropdownMenuItem>
                                    )}
                                    {actions.canDelete && (
                                      <DropdownMenuItem 
                                        onClick={() => handleDeleteDevice(device._id)}
                                        className="text-red-600"
                                      >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Remover
                                      </DropdownMenuItem>
                                    )}
                                  </>
                                )
                              })()}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedDevice && (
        <>
          <QRCodeDialog
            open={qrCodeDialog}
            onOpenChange={setQrCodeDialog}
            device={selectedDevice}
          />
          <ConnectionHistoryDialog
            open={historyDialog}
            onOpenChange={setHistoryDialog}
            device={selectedDevice}
          />
        </>
      )}

      <NewDeviceDialog
        open={newDeviceDialog}
        onOpenChange={setNewDeviceDialog}
        onSave={handleNewDevice}
        hasMainDevice={hasMainDevice}
      />
    </Layout>
  )
}
