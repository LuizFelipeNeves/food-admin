'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { QRCodeCanvas } from 'qrcode.react'
import { trpc } from '@/app/_trpc/client'
import { Button } from '@/components/ui/button'
import useCurrentStore from '@/hooks/useCurrentStore'
import { Progress } from '@/components/ui/progress'
import { RotateCcw, Timer } from 'lucide-react'
import type { Device, DeviceControlInput } from '@/types/devices'

interface QRCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  device: Device
}

export function QRCodeDialog({
  open,
  onOpenChange,
  device,
}: QRCodeDialogProps) {
  const { storeId } = useCurrentStore()
  const [qrCode, setQrCode] = useState<string | null>(device.qrCode || null)
  const [countdown, setCountdown] = useState<number>(0)
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false)
  
  const getQRCodeMutation = trpc.devices.getQRCode.useMutation({
    onSuccess: (data) => {
      if (data.qrCode) {
        setQrCode(data.qrCode)
        startTimer()
      }
    },
    onError: (error) => {
      console.error('Erro ao obter QR Code:', error)
      setIsTimerActive(false)
    }
  })

  const startTimer = useCallback(() => {
    setCountdown(25)
    setIsTimerActive(true)
  }, [])

  const handleRefreshQRCode = useCallback(() => {
    if (!storeId) return
    
    setQrCode(null)
    setIsTimerActive(false)
    setCountdown(0)
    
    const input: DeviceControlInput = {
      id: device._id,
      storeId
    }
    
    getQRCodeMutation.mutate(input)
  }, [device._id, storeId, getQRCodeMutation])

  // Timer effect
  useEffect(() => {
    if (!isTimerActive || countdown <= 0) {
      if (countdown === 0 && isTimerActive && qrCode) {
        // Timer terminou, atualizar automaticamente
        handleRefreshQRCode()
      }
      return
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setIsTimerActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown, isTimerActive, qrCode, handleRefreshQRCode])

  // Initial QR code fetch
  useEffect(() => {
    if (open && !qrCode && storeId) {
      const input: DeviceControlInput = {
        id: device._id,
        storeId
      }
      
      getQRCodeMutation.mutate(input)
    }
  }, [open, device._id, qrCode, storeId, getQRCodeMutation])

  // Reset timer when dialog closes
  useEffect(() => {
    if (!open) {
      setIsTimerActive(false)
      setCountdown(0)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code do Dispositivo</DialogTitle>
          <DialogDescription>
            Escaneie o QR Code para conectar o dispositivo {device.name}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 gap-4">
          {qrCode ? (
            <>
              <QRCodeCanvas
                value={qrCode}
                size={256}
                level="H"
              />
              
              {/* Timer e Progress Bar */}
              {isTimerActive && (
                <div className="w-full max-w-sm space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Timer className="w-4 h-4" />
                      <span>Atualizando automaticamente em:</span>
                    </div>
                    <span className="font-mono font-medium">
                      {countdown}s
                    </span>
                  </div>
                  <Progress 
                    value={(countdown / 25) * 100} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    O QR Code será renovado automaticamente para garantir a segurança
                  </p>
                </div>
              )}
            </>
          ) : getQRCodeMutation.isLoading ? (
            <div className="flex items-center justify-center w-64 h-64 border border-gray-200 rounded-lg">
              <div className="text-sm text-muted-foreground">Carregando QR Code...</div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-64 h-64 border border-gray-200 rounded-lg gap-2">
              <div className="text-sm text-muted-foreground text-center">
                QR Code não disponível
              </div>
              <Button variant="outline" size="sm" onClick={handleRefreshQRCode}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          )}
          
          {/* Botão manual de atualização */}
          {qrCode && (
            <Button 
              variant="outline" 
              onClick={handleRefreshQRCode} 
              disabled={getQRCodeMutation.isLoading}
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {getQRCodeMutation.isLoading ? 'Atualizando...' : 'Atualizar Agora'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
