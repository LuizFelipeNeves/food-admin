'use client'

import { useEffect, useRef } from 'react'

// Singleton WebSocket para evitar múltiplas conexões
let globalWs: WebSocket | null = null
let globalWsListeners: Set<(message: WhatsAppWebSocketMessage) => void> = new Set()
let globalWsUrl: string | null = null
let isConnecting = false
let connectionCloseTimeout: NodeJS.Timeout | null = null

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
  // Verificações básicas para evitar conexões desnecessárias
  if (isConnecting) {
    return null
  }

  // Se já está conectado na mesma URL, reutilizar
  if (globalWs?.readyState === WebSocket.OPEN && globalWsUrl === wsUrl) {
    return globalWs
  }

  // Se está tentando conectar na mesma URL, não duplicar
  if (globalWs?.readyState === WebSocket.CONNECTING && globalWsUrl === wsUrl) {
    return globalWs
  }

  // Fechar conexão anterior se necessário
  if (globalWs && globalWs.readyState !== WebSocket.CLOSED) {
    globalWs.close()
  }

  // Criar nova conexão
  isConnecting = true
  globalWsUrl = wsUrl
  globalWs = new WebSocket(wsUrl)

  globalWs.onopen = () => {
    isConnecting = false
  }

  globalWs.onmessage = (event) => {
    try {
      const data: WhatsAppWebSocketMessage = JSON.parse(event.data)
      // Notificar todos os listeners
      globalWsListeners.forEach(listener => listener(data))
    } catch (error) {
      console.error('Erro ao processar mensagem WebSocket:', error)
    }
  }

  globalWs.onclose = (event) => {
    globalWs = null
    globalWsUrl = null
    isConnecting = false
    
    // Só tentar reconectar se não foi fechado intencionalmente e há listeners ativos
    if (event.code !== 1000 && globalWsListeners.size > 0) {
      setTimeout(() => {
        if (globalWsListeners.size > 0) {
          connectGlobalWebSocket(wsUrl)
        }
      }, 5000)
    }
  }

  globalWs.onerror = (error) => {
    isConnecting = false
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
  const callbacksRef = useRef({ onLoginSuccess, onMessage, onDeviceUpdate })

  // Update callbacks ref whenever they change
  useEffect(() => {
    callbacksRef.current = { onLoginSuccess, onMessage, onDeviceUpdate }
  }, [onLoginSuccess, onMessage, onDeviceUpdate])

  // Criar listener para este hook
  useEffect(() => {
    if (!enabled) {
      return
    }

    const messageListener = (data: WhatsAppWebSocketMessage) => {
      // Chamar callback genérico
      callbacksRef.current.onMessage?.(data)

      // Verificar se é para o dispositivo correto
      if (deviceHash && data.deviceHash === deviceHash) {
        // Verificar se é LOGIN_SUCCESS
        if (data.message?.code === 'LOGIN_SUCCESS') {
          console.log('LOGIN_SUCCESS detectado para device:', deviceHash)
          
          // Atualizar dispositivo como logado e ativo
          callbacksRef.current.onDeviceUpdate?.(deviceHash, {
            isLoggedIn: true,
            status: 'active'
          })
          
          callbacksRef.current.onLoginSuccess?.()
        }
      } else if (!deviceHash) {
        // Se não há deviceHash específico, processar todas as mensagens
        if (data.message?.code === 'LOGIN_SUCCESS') {
          console.log('LOGIN_SUCCESS detectado para device:', data.deviceHash)
          
          // Atualizar dispositivo como logado e ativo
          callbacksRef.current.onDeviceUpdate?.(data.deviceHash, {
            isLoggedIn: true,
            status: 'active'
          })
        }
      }
    }

    // Cancelar timeout de fechamento se um novo listener está sendo adicionado
    if (connectionCloseTimeout) {
      clearTimeout(connectionCloseTimeout)
      connectionCloseTimeout = null
    }

    // Adicionar listener apenas se não existir
    if (listenerRef.current) {
      globalWsListeners.delete(listenerRef.current)
    }
    
    listenerRef.current = messageListener
    globalWsListeners.add(messageListener)

    // Conectar apenas se necessário
    const baseUrl = process.env.NEXT_PUBLIC_WHATSAPP_API_BASE_URL || 'http://localhost:3000'
    const wsUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws'
    
    // Só conectar se não há conexão ativa ou se a conexão foi perdida
    const needsConnection = !globalWs || 
                           globalWs.readyState === WebSocket.CLOSED || 
                           globalWs.readyState === WebSocket.CLOSING
    
    if (needsConnection && !isConnecting) {
      connectGlobalWebSocket(wsUrl)
    }

    // Cleanup
    return () => {
      if (listenerRef.current) {
        globalWsListeners.delete(listenerRef.current)
        listenerRef.current = null
      }
      
      // Aguardar um tempo antes de fechar a conexão para permitir remontagem
      if (globalWsListeners.size === 0 && globalWs && !connectionCloseTimeout) {
        connectionCloseTimeout = setTimeout(() => {
          // Verificar novamente se ainda não há listeners
          if (globalWsListeners.size === 0 && globalWs) {
            globalWs.close(1000, 'Desconectado pelo usuário')
            globalWs = null
            globalWsUrl = null
            isConnecting = false
          }
          connectionCloseTimeout = null
        }, 1000) // Aguarda 1 segundo para permitir remontagem
      }
    }
  }, [enabled, deviceHash])

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