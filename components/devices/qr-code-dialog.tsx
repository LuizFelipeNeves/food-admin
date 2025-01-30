'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import QRCode from 'qrcode.react'

interface QRCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  device: {
    id: string
    name: string
  }
}

export function QRCodeDialog({
  open,
  onOpenChange,
  device,
}: QRCodeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code do Dispositivo</DialogTitle>
          <DialogDescription>
            Escaneie o QR Code para conectar o dispositivo {device.name}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-6">
          <QRCode
            value={`device:${device.id}`}
            size={256}
            level="H"
            includeMargin
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
