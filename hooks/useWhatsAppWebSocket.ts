'use client'

import { useEffect, useRef } from 'react'

// Singleton WebSocket para evitar múltiplas conexões
let globalWs: WebSocket | null = null
let globalWsListeners: Set<(message: WhatsAppWebSocketMessage) => void> = new Set()
let globalWsUrl: string | null = null

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
  onDeviceUpdate?: (deviceHash: string, updates: { isLoggedIn: boolean; status: string }) => void
  enabled?: boolean
}

// Função para conectar o WebSocket global
const connectGlobalWebSocket = (wsUrl: string) => {
  if (globalWs?.readyState === WebSocket.OPEN && globalWsUrl === wsUrl) {
    return globalWs
  }

  // Fechar conexão anterior se existir
  if (globalWs) {
    globalWs.close()
  }

  globalWsUrl = wsUrl
  globalWs = new WebSocket(wsUrl)

  globalWs.onopen = () => {
    console.log('WebSocket conectado')
  }

  globalWs.onmessage = (event) => {
    try {
      const data: WhatsAppWebSocketMessage = JSON.parse(event.data)
      console.log('Mensagem WebSocket recebida:', data)
      
      // Notificar todos os listeners
      globalWsListeners.forEach(listener => listener(data))
    } catch (error) {
      console.error('Erro ao processar mensagem WebSocket:', error)
    }
  }

  globalWs.onclose = (event) => {
    console.log('WebSocket desconectado:', event.code, event.reason)
    globalWs = null
    globalWsUrl = null
    
    // Tentar reconectar após 5 segundos se não foi fechado intencionalmente
    if (event.code !== 1000 && globalWsListeners.size > 0) {
      setTimeout(() => {
        if (globalWsListeners.size > 0) {
          connectGlobalWebSocket(wsUrl)
        }
      }, 5000)
    }
  }

  globalWs.onerror = (error) => {
    console.error('Erro no WebSocket:', error)
  }

  return globalWs
}

export function useWhatsAppWebSocket({
  deviceHash,
  onLoginSuccess,
  onMessage,
  onDeviceUpdate,
  enabled = true
}: UseWhatsAppWebSocketProps) {
  const listenerRef = useRef<((message: WhatsAppWebSocketMessage) => void) | null>(null)

  // Criar listener para este hook
  useEffect(() => {
    if (!enabled) return

    const messageListener = (data: WhatsAppWebSocketMessage) => {
      // Chamar callback genérico
      onMessage?.(data)

      // Verificar se é para o dispositivo correto
      if (deviceHash && data.deviceHash === deviceHash) {
        // Verificar se é LOGIN_SUCCESS
        if (data.message?.code === 'LOGIN_SUCCESS') {
          console.log('LOGIN_SUCCESS detectado para device:', deviceHash)
          
          // Atualizar dispositivo como logado e ativo
          onDeviceUpdate?.(deviceHash, {
            isLoggedIn: true,
            status: 'active'
          })
          
          onLoginSuccess?.()
        }
      } else if (!deviceHash) {
        // Se não há deviceHash específico, processar todas as mensagens
        if (data.message?.code === 'LOGIN_SUCCESS') {
          console.log('LOGIN_SUCCESS detectado para device:', data.deviceHash)
          
          // Atualizar dispositivo como logado e ativo
          onDeviceUpdate?.(data.deviceHash, {
            isLoggedIn: true,
            status: 'active'
          })
        }
      }
    }

    // Adicionar listener
    listenerRef.current = messageListener
    globalWsListeners.add(messageListener)

    // Conectar se necessário
    const baseUrl = process.env.NEXT_PUBLIC_WHATSAPP_API_BASE_URL || 'http://localhost:3000'
    const wsUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws'
    connectGlobalWebSocket(wsUrl)

    // Cleanup
    return () => {
      if (listenerRef.current) {
        globalWsListeners.delete(listenerRef.current)
        listenerRef.current = null
      }
      
      // Se não há mais listeners, fechar conexão
      if (globalWsListeners.size === 0 && globalWs) {
        globalWs.close(1000, 'Desconectado pelo usuário')
        globalWs = null
        globalWsUrl = null
      }
    }
  }, [enabled, deviceHash, onLoginSuccess, onMessage, onDeviceUpdate])

  return {
    connect: () => {
      const baseUrl = process.env.NEXT_PUBLIC_WHATSAPP_API_BASE_URL || 'http://localhost:3000'
      const wsUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws'
      connectGlobalWebSocket(wsUrl)
    },
    disconnect: () => {
      if (listenerRef.current) {
        globalWsListeners.delete(listenerRef.current)
        listenerRef.current = null
      }
    },
    isConnected: globalWs?.readyState === WebSocket.OPEN
  }
}