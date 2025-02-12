'use client'

import { useState } from 'react'
import { Layout } from '@/components/layout/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, QrCode, History, Star } from 'lucide-react'
import { QRCodeDialog } from '@/components/devices/qr-code-dialog'
import { ConnectionHistoryDialog } from '@/components/devices/connection-history-dialog'
import { NewDeviceDialog } from '@/components/devices/new-device-dialog'
import { Badge } from '@/components/ui/badge'
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

interface Device {
  _id: string
  name: string
  status: 'online' | 'offline' | 'disconnected'
  lastConnected: string
  battery?: number
  isMain?: boolean
  connectionHistory: Array<{
    _id: string
    status: 'connected' | 'disconnected'
    timestamp: string
    duration?: string
  }>
}

const mockDevices: Device[] = [
  {
    _id: '1',
    name: 'Dispositivo Principal',
    status: 'online',
    lastConnected: '2024-01-30T20:00:00',
    battery: 85,
    isMain: true,
    connectionHistory: [
      {
        _id: '1',
        status: 'connected',
        timestamp: '2024-01-30T20:00:00',
        duration: '2h 30min',
      },
      {
        _id: '2',
        status: 'disconnected',
        timestamp: '2024-01-30T17:30:00',
        duration: '30min',
      },
    ],
  },
  {
    _id: '2',
    name: 'Dispositivo Secundário',
    status: 'offline',
    lastConnected: '2024-01-30T15:00:00',
    battery: 20,
    connectionHistory: [
      {
        _id: '1',
        status: 'disconnected',
        timestamp: '2024-01-30T15:00:00',
        duration: '1h',
      },
    ],
  },
]

export default function DevicesPage() {
  const { toast } = useToast()
  const [devices, setDevices] = useState<Device[]>(mockDevices)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [qrCodeDialog, setQrCodeDialog] = useState(false)
  const [historyDialog, setHistoryDialog] = useState(false)
  const [newDeviceDialog, setNewDeviceDialog] = useState(false)

  const hasMainDevice = devices.some((device) => device.isMain)

  const getStatusColor = (status: Device['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'offline':
        return 'bg-yellow-500'
      case 'disconnected':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: Device['status']) => {
    switch (status) {
      case 'online':
        return 'Online'
      case 'offline':
        return 'Offline'
      case 'disconnected':
        return 'Desconectado'
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

  const handleNewDevice = (data: { name: string; isMain: boolean }) => {
    const newDevice: Device = {
      _id: Math.random().toString(36).substring(2, 9),
      name: data.name,
      status: 'offline',
      lastConnected: new Date().toISOString(),
      isMain: data.isMain,
      connectionHistory: [],
    }

    if (data.isMain) {
      // Remove o status de principal de outros dispositivos
      const updatedDevices = devices.map(device => ({
        ...device,
        isMain: false,
      }))
      setDevices([...updatedDevices, newDevice])
    } else {
      setDevices([...devices, newDevice])
    }

    toast({
      title: 'Dispositivo criado com sucesso!',
      description: 'O novo dispositivo foi adicionado à sua lista.',
    })
  }

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dispositivos</h1>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bateria</TableHead>
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
                      {device.battery ? (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-12 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                device.battery > 20
                                  ? 'bg-green-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${device.battery}%` }}
                            />
                          </div>
                          {device.battery}%
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(device.lastConnected), 'PPp', {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleShowQRCode(device)}
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleShowHistory(device)}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
