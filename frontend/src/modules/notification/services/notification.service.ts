/**
 * 通知服务
 * 使用统一的 WebSocket Store 和轮询降级方案
 */
import type { PollingService } from '@/core/services/polling.service'
import { createPollingService } from '@/core/services/polling.service'
import { httpService } from '@/core/services/http.service'
import type { AxiosInstance } from 'axios'
import { getWebSocketEndpoint } from '../api'
import type {
  NotificationMessage,
  NotificationQuery,
  NotificationStats,
} from '@/types/notification'
import { API_PATHS } from '@/config/apiPaths'
import { useWebSocketStore } from '@/stores/websocket.store'
import { WebSocketMessageType } from '@/core/types/websocket.types'

export type ConnectionMode = 'websocket' | 'polling'

export class NotificationService {
  private pollingService: PollingService | null = null
  private currentMode: ConnectionMode = 'websocket'

  private messageHandlers: Set<(message: NotificationMessage) => void> = new Set()
  private unsubscribeHandler: (() => void) | null = null

  /**
   * 初始化通知系统
   */
  async initialize(): Promise<void> {
    // 尝试使用 WebSocket
    try {
      await this.initializeWebSocket()
      console.log('[NotificationService] WebSocket 模式初始化成功')
    } catch {
      console.warn('[NotificationService] WebSocket 初始化失败，切换到轮询模式')
      this.initializePolling()
    }
  }

  /**
   * 初始化 WebSocket
   * 使用统一的 WebSocket Store 进行连接管理
   */
  private async initializeWebSocket(): Promise<void> {
    const websocketStore = useWebSocketStore()

    let url = ''

    try {
      // 尝试从后端获取WebSocket端点
      const response = (await getWebSocketEndpoint()) as unknown
      // 处理可能的响应格式
      if (typeof response === 'string') {
        url = response
      } else if (response && typeof response === 'object') {
        // 检查是否是axios响应格式
        if ('data' in response && response.data) {
          const responseData = response.data as { url?: string }
          url = responseData.url || ''
        } else if ('url' in response) {
          url = (response as { url: string }).url || ''
        }
      }

      // 如果没有获取到端点，使用环境变量中的默认配置
      if (!url) {
        const wsBaseUrl = import.meta.env.VITE_WS_URL || '/ws'
        url = `${wsBaseUrl}${API_PATHS.WEBSOCKET.NOTIFICATIONS}`
        console.warn('[NotificationService] 未获取到WebSocket端点，使用默认配置:', url)
      }
    } catch (error) {
      // 如果获取端点失败，抛出错误以触发降级到轮询
      console.error('[NotificationService] 获取WebSocket端点失败:', error)
      throw new Error('WebSocket endpoint unavailable')
    }

    // 使用统一的 WebSocket Store 连接
    await websocketStore.connect(undefined, { url })

    // 注册通知消息处理器
    const messageHandler = (wsMessage: { type: string; data: unknown }) => {
      if (wsMessage.type === WebSocketMessageType.NOTIFICATION) {
        this.handleMessage(wsMessage.data)
      }
    }

    websocketStore.onMessage(messageHandler)

    // 保存取消订阅函数
    this.unsubscribeHandler = () => {
      websocketStore.offMessage(messageHandler)
    }

    this.currentMode = 'websocket'
    console.log('[NotificationService] WebSocket 模式初始化成功')
  }

  /**
   * 初始化轮询
   *
   * @todo 与后端团队确认轮询端点是否支持
   * - 当前使用: /api/v1/notifications/polling
   * - 需要确认后端是否实现了此端点
   * - 如果不支持,需要实现或者使用其他降级方案
   */
  private initializePolling(): void {
    this.pollingService = createPollingService({
      axios: httpService as unknown as AxiosInstance,
      endpoint: '/api/v1/notifications/polling',
      interval: 30000,
      minInterval: 10000,
      maxInterval: 120000,
      adaptive: true,
      onMessage: (messages: NotificationMessage[]) => {
        messages.forEach((msg) => this.notifyHandlers(msg))
      },
      onError: () => {
        console.error('[NotificationService] 轮询错误')
      },
    })

    this.pollingService.start()
    this.currentMode = 'polling'
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(data: unknown): void {
    if (typeof data === 'object' && data !== null && 'type' in data && 'data' in data) {
      const messageData = data as { type: string; data: NotificationMessage }
      if (messageData.type === 'notification' && messageData.data) {
        this.notifyHandlers(messageData.data)
      }
    }
  }

  /**
   * 通知所有消息处理器
   */
  private notifyHandlers(message: NotificationMessage): void {
    this.messageHandlers.forEach((handler) => {
      try {
        handler(message)
      } catch (error) {
        console.error('[NotificationService] 消息处理错误:', error)
      }
    })
  }

  /**
   * 订阅消息
   */

  onMessage(handler: (msg: NotificationMessage) => void): () => void {
    this.messageHandlers.add(handler)

    // 返回取消订阅函数
    return () => {
      this.messageHandlers.delete(handler)
    }
  }

  /**
   * 获取通知列表
   */
  async getNotifications(params?: NotificationQuery): Promise<{
    list: NotificationMessage[]
    total: number
    page: number
    size: number
  }> {
    const { data } = await httpService.get<{
      code: number
      message: string
      data: {
        list: NotificationMessage[]
        total: number
        page: number
        size: number
      }
    }>('/api/v1/notifications', { params })

    return data
  }

  /**
   * 获取通知统计
   */
  async getNotificationStats(): Promise<NotificationStats> {
    const { data } = await httpService.get<{
      code: number
      message: string
      data: NotificationStats
    }>('/api/v1/notifications/stats')

    return data
  }

  /**
   * 标记已读
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    const { data } = await httpService.put<{
      code: number
      message: string
      data: { success: boolean }
    }>(`/api/v1/notifications/${notificationId}/read`)

    return data.success
  }

  /**
   * 全部标记为已读
   */
  async markAllAsRead(type?: string): Promise<{ success: boolean; affected: number }> {
    const { data } = await httpService.put<{
      code: number
      message: string
      data: { success: boolean; affected: number }
    }>('/api/v1/notifications/read-all', { type })

    return data
  }

  /**
   * 删除通知
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    const { data } = await httpService.delete<{
      code: number
      message: string
      data: { success: boolean }
    }>(`/api/v1/notifications/${notificationId}`)

    return data.success
  }

  /**
   * 获取当前连接模式
   */
  getConnectionMode(): ConnectionMode {
    return this.currentMode
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    if (this.currentMode === 'websocket') {
      const websocketStore = useWebSocketStore()
      return websocketStore.isConnected
    }
    return this.pollingService?.isRunning() ?? false
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    // 取消 WebSocket 消息订阅
    if (this.unsubscribeHandler) {
      this.unsubscribeHandler()
      this.unsubscribeHandler = null
    }

    // 停止轮询服务
    if (this.pollingService) {
      this.pollingService.stop()
    }

    // 清理消息处理器
    this.messageHandlers.clear()
    this.currentMode = 'websocket'
  }
}

// 单例实例
let notificationServiceInstance: NotificationService | null = null

/**
 * 获取通知服务实例
 */
export function getNotificationService(): NotificationService {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new NotificationService()
  }
  return notificationServiceInstance
}

/**
 * 初始化通知服务
 */
export async function initNotificationService(): Promise<NotificationService> {
  const service = getNotificationService()
  await service.initialize()
  return service
}
