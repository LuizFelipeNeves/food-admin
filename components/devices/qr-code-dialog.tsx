'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { trpc } from '@/app/_trpc/client'
import { useQueryClient } from '@tanstack/react-query'
import useCurrentStore from '@/hooks/useCurrentStore'
import { useWhatsAppWebSocket } from '@/hooks/useWhatsAppWebSocket'
import { Progress } from '@/components/ui/progress'
import { Timer, Wifi } from 'lucide-react'
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
  const queryClient = useQueryClient()
  const [qrCode, setQrCode] = useState<string | null>(device.qrCode || null)
  const [countdown, setCountdown] = useState<number>(0)
  const [qrDuration, setQrDuration] = useState<number>(30)
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const isRequestingRef = useRef<boolean>(false)
  
  // WebSocket callbacks
  const handleLoginSuccess = useCallback(() => {
    console.log('Dispositivo conectado com sucesso!')
    setIsConnected(true)
    setIsTimerActive(false)
    
    // Fechar dialog após 2 segundos para mostrar o feedback
    setTimeout(() => {
      onOpenChange(false)
    }, 2000)
  }, [onOpenChange])

  const handleDeviceUpdate = useCallback((deviceHash: string, updates: any) => {
    // Atualização otimista no React Query
    queryClient.setQueryData(
      [['devices', 'list'], { storeId }],
      (oldData: any) => {
        if (!oldData?.devices) return oldData
        
        return {
          ...oldData,
          devices: oldData.devices.map((dev: any) => 
            dev.deviceHash === deviceHash 
              ? { ...dev, ...updates, lastSeen: new Date().toISOString() }
              : dev
          )
        }
      }
    )
  }, [queryClient, storeId])

  // WebSocket para detectar LOGIN_SUCCESS
  useWhatsAppWebSocket({
    deviceHash: device.deviceHash,
    enabled: open, // Only enable when dialog is open
    onLoginSuccess: handleLoginSuccess,
    onDeviceUpdate: handleDeviceUpdate
  })

  const getQRCodeMutation = trpc.devices.getQRCode.useMutation({
    onSuccess: (data) => {
      isRequestingRef.current = false
      
      // Verificar se o dispositivo já está logado
      if (data.isAlreadyLoggedIn) {
        console.log('Device is already logged in, showing connected state')
        setIsConnected(true)
        setIsTimerActive(false)
        
        // Invalidar queries para atualizar a UI
        queryClient.invalidateQueries({ queryKey: [['devices', 'list']] })
        
        // Fechar dialog após 2 segundos
        setTimeout(() => {
          onOpenChange(false)
        }, 2000)
        return
      }
      
      if (data.qrCode) {
        setQrCode(data.qrCode)
        setQrDuration(data.qr_duration || 30)
        startTimer()
      }
    },
    onError: (error) => {
      isRequestingRef.current = false
      console.error('Erro ao obter QR Code:', error)
      setIsTimerActive(false)
    }
  })

  const startTimer = useCallback(() => {
    setCountdown(qrDuration)
    setIsTimerActive(true)
  }, [qrDuration])

  const handleRefreshQRCode = useCallback(() => {
    if (!storeId || isRequestingRef.current) return
    
    isRequestingRef.current = true
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
      return
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setIsTimerActive(false)
          // Agendar refresh para o próximo tick para evitar loop
          setTimeout(() => {
            if (qrCode && storeId) {
              handleRefreshQRCode()
            }
          }, 100)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown, isTimerActive])

  // Initial QR code fetch
  useEffect(() => {
    if (open && !qrCode && storeId && !isRequestingRef.current) {
      isRequestingRef.current = true
      const input: DeviceControlInput = {
        id: device._id,
        storeId
      }
      
      getQRCodeMutation.mutate(input)
    }
  }, [open, device._id, storeId]) // Removido qrCode e getQRCodeMutation das dependências

  // Reset timer when dialog closes
  useEffect(() => {
    if (!open) {
      setIsTimerActive(false)
      setCountdown(0)
      setIsConnected(false)
      isRequestingRef.current = false
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
          {isConnected ? (
            <div className="flex flex-col items-center justify-center w-64 h-64 border border-green-200 rounded-lg bg-green-50 gap-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <Wifi className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-700">Conectado!</div>
                <div className="text-sm text-green-600">Dispositivo conectado com sucesso</div>
              </div>
            </div>
          ) : qrCode ? (
            <>
              <img 
                src={qrCode}
                alt="QR Code do WhatsApp"
                className="w-64 h-64 border border-gray-200 rounded-lg object-contain bg-white"
                onError={(e) => {
                  console.error('Erro ao carregar QR Code:', e)
                }}
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
                    value={(countdown / qrDuration) * 100} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    O QR Code será renovado automaticamente para garantir a segurança
                  </p>
                </div>
              )}
            </>
          ) : getQRCodeMutation.isLoading ? (
            <div className="flex flex-col items-center justify-center w-64 h-64 border border-gray-200 rounded-lg bg-gray-50 gap-4">
              <div className="w-32 h-32 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="text-sm text-muted-foreground">Gerando QR Code...</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-64 h-64 border border-gray-200 rounded-lg gap-2">
              <div className="text-sm text-muted-foreground text-center">
                QR Code não disponível
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
