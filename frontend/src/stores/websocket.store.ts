/**
 * WebSocket连接管理Store
 * 提供WebSocket连接状态管理和消息处理的统一接口
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { UnifiedWebSocketService } from '@/core/services/unified-websocket.service'
import {
  WebSocketConnectionState,
  WebSocketMessage,
  FallbackState,
  WebSocketConfig,
} from '@/core/types/websocket.types'

export const useWebSocketStore = defineStore('websocket', () => {
  // 服务实例
  let wsService: UnifiedWebSocketService | null = null

  // 消息处理器集合（用于测试验证）
  const messageHandlers = ref<Set<Function>>(new Set())

  // 状态
  const connectionState = ref<WebSocketConnectionState>(WebSocketConnectionState.DISCONNECTED)
  const fallbackState = ref<FallbackState>({
    isActive: false,
    type: 'none',
  })

  // 计算属性
  const isConnected = computed(() => connectionState.value === WebSocketConnectionState.CONNECTED)

  const fallbackActive = computed(() => fallbackState.value.isActive)

  /**
   * 连接WebSocket
   */
  async function connect(token?: string, config?: Partial<WebSocketConfig>) {
    // 如果已经连接或正在连接，不再重复连接
    if (
      connectionState.value === WebSocketConnectionState.CONNECTED ||
      connectionState.value === WebSocketConnectionState.CONNECTING
    ) {
      return
    }

    try {
      // 创建服务实例
      const wsConfig: WebSocketConfig = {
        url: import.meta.env.VITE_WS_URL || '/ws',
        token,
        ...config,
      }

      wsService = new UnifiedWebSocketService(wsConfig)

      // 注册事件监听
      setupEventListeners(wsService)

      // 连接
      await wsService.connect()
    } catch (error) {
      console.error('[WebSocketStore] 连接失败:', error)
      connectionState.value = WebSocketConnectionState.ERROR
    }
  }

  /**
   * 断开连接
   */
  function disconnect() {
    if (wsService) {
      wsService.disconnect()
      wsService = null
    }

    connectionState.value = WebSocketConnectionState.DISCONNECTED
    fallbackState.value = {
      isActive: false,
      type: 'none',
    }
    messageHandlers.value.clear()
  }

  /**
   * 发送消息
   */
  function sendMessage(message: Omit<WebSocketMessage, 'timestamp' | 'id'>) {
    if (!wsService) {
      throw new Error('WebSocket服务未初始化')
    }

    wsService.send(message)
  }

  /**
   * 注册消息处理器
   */

  function onMessage(handler: (message: WebSocketMessage) => void) {
    messageHandlers.value.add(handler)

    // 如果服务已存在，立即注册
    if (wsService) {
      wsService.on('message', handler)
    }
  }

  /**
   * 移除消息处理器
   */

  function offMessage(handler: (message: WebSocketMessage) => void) {
    messageHandlers.value.delete(handler)

    if (wsService) {
      wsService.off('message', handler)
    }
  }

  /**
   * 设置事件监听器
   */
  function setupEventListeners(service: UnifiedWebSocketService) {
    // 连接成功
    service.on('connect', () => {
      connectionState.value = WebSocketConnectionState.CONNECTED
    })

    // 断开连接
    service.on('disconnect', () => {
      connectionState.value = WebSocketConnectionState.DISCONNECTED
    })

    // 重连中
    service.on('reconnecting', () => {
      connectionState.value = WebSocketConnectionState.RECONNECTING
    })

    // 错误
    service.on('error', () => {
      connectionState.value = WebSocketConnectionState.ERROR
    })

    // 更新降级状态
    updateFallbackState()
  }

  /**
   * 更新降级状态
   */
  function updateFallbackState() {
    if (wsService) {
      fallbackState.value = wsService.getFallbackState()
    }
  }

  /**
   * 启用轮询降级
   */
  function enablePollingFallback() {
    if (wsService) {
      wsService.enablePollingFallback()
      updateFallbackState()
    }
  }

  /**
   * 禁用降级
   */
  function disableFallback() {
    if (wsService) {
      wsService.disableFallback()
      updateFallbackState()
    }
  }

  return {
    // 状态
    connectionState,
    fallbackState,
    messageHandlers,

    // 计算属性
    isConnected,
    fallbackActive,

    // 方法
    connect,
    disconnect,
    sendMessage,
    onMessage,
    offMessage,
    enablePollingFallback,
    disableFallback,
  }
})
