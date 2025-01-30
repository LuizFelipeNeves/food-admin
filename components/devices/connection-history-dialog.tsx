'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Badge } from '@/components/ui/badge'

interface ConnectionHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  device: {
    id: string
    name: string
    connectionHistory: Array<{
      id: string
      status: 'connected' | 'disconnected'
      timestamp: string
      duration?: string
    }>
  }
}

export function ConnectionHistoryDialog({
  open,
  onOpenChange,
  device,
}: ConnectionHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Histórico de Conexões</DialogTitle>
          <DialogDescription>
            Histórico de conexões do dispositivo {device.name}
          </DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Duração</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {device.connectionHistory.map((connection) => (
              <TableRow key={connection.id}>
                <TableCell>
                  <Badge
                    variant={
                      connection.status === 'connected'
                        ? 'success'
                        : 'destructive'
                    }
                  >
                    {connection.status === 'connected'
                      ? 'Conectado'
                      : 'Desconectado'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(connection.timestamp), 'PPp', {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell>{connection.duration || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}
