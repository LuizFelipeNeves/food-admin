'use client'

import { useEffect, useRef, useCallback } from 'react'

interface WhatsAppWebSocketMessage {
  type: 'whatsapp-websocket-message'
  deviceHash: string
  port: number
  message: {
    code: string
    message: string
    result: any
  }
  timestamp: string
}

interface UseWhatsAppWebSocketProps {
  deviceHash?: string
  onLoginSuccess?: () => void
  onMessage?: (message: WhatsAppWebSocketMessage) => void
}

export function useWhatsAppWebSocket({
  deviceHash,
  onLoginSuccess,
  onMessage
}: UseWhatsAppWebSocketProps) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const isConnectedRef = useRef(false)

  const getWebSocketUrl = useCallback(() => {
    // Obter URL base da API do WhatsApp
    const baseUrl = process.env.NEXT_PUBLIC_WHATSAPP_API_BASE_URL || process.env.WHATSAPP_API_BASE_URL || 'http://localhost:3000'
    
    // Converter HTTP para WebSocket
    const wsUrl = baseUrl
      .replace('http://', 'ws://')
      .replace('https://', 'wss://')
    
    // Adicionar endpoint WebSocket
    return `${wsUrl}/ws`
  }, [])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      const wsUrl = getWebSocketUrl()
      console.log('Conectando ao WebSocket:', wsUrl)
      
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log('WebSocket conectado')
        isConnectedRef.current = true
        
        // Limpar timeout de reconexão se houver
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = undefined
        }
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data: WhatsAppWebSocketMessage = JSON.parse(event.data)
          
          // Log para debug
          console.log('Mensagem WebSocket recebida:', data)

          // Chamar callback genérico
          onMessage?.(data)

          // Verificar se é para o dispositivo correto
          if (deviceHash && data.deviceHash === deviceHash) {
            // Verificar se é LOGIN_SUCCESS
            if (data.message?.code === 'LOGIN_SUCCESS') {
              console.log('LOGIN_SUCCESS detectado para device:', deviceHash)
              onLoginSuccess?.()
            }
          }
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error)
        }
      }

      wsRef.current.onclose = (event) => {
        console.log('WebSocket desconectado:', event.code, event.reason)
        isConnectedRef.current = false
        
        // Tentar reconectar após 3 segundos se não foi fechado intencionalmente
        if (event.code !== 1000 && !reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Tentando reconectar WebSocket...')
            connect()
          }, 3000)
        }
      }

      wsRef.current.onerror = (error) => {
        console.error('Erro no WebSocket:', error)
      }

    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error)
    }
  }, [getWebSocketUrl, deviceHash, onLoginSuccess, onMessage])

  const disconnect = useCallback(() => {
    // Limpar timeout de reconexão
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = undefined
    }

    // Fechar conexão WebSocket
    if (wsRef.current) {
      wsRef.current.close(1000, 'Desconectado pelo usuário')
      wsRef.current = null
    }
    
    isConnectedRef.current = false
  }, [])

  // Conectar quando o hook é montado
  useEffect(() => {
    connect()

    // Cleanup na desmontagem
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    connect,
    disconnect,
    isConnected: isConnectedRef.current
  }
}