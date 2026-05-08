// Qingyu_fronted/src/core/services/unified-websocket.service.ts

import {
  WebSocketConfig,
  WebSocketConnectionState,
  WebSocketMessage,
  WebSocketMessageType,
  FallbackState,
} from '../types/websocket.types'

/**
 * 统一WebSocket服务
 * 负责管理WebSocket连接、消息收发、重连机制和降级策略
 */
export class UnifiedWebSocketService {
  private ws: WebSocket | null = null
  private config: Required<WebSocketConfig>
  private state: WebSocketConnectionState = WebSocketConnectionState.DISCONNECTED
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private eventCallbacks: Map<string, Set<Function>> = new Map()
  private fallbackState: FallbackState = {
    isActive: false,
    type: 'none',
  }

  constructor(config: WebSocketConfig) {
    this.config = {
      url: config.url,
      token: config.token || '',
      reconnectInterval: config.reconnectInterval || 3000,
      maxReconnectAttempts: config.maxReconnectAttempts || 5,
      heartbeatInterval: config.heartbeatInterval || 30000,
      enablePollingFallback: config.enablePollingFallback ?? true,
      pollingInterval: config.pollingInterval || 5000,
    }
  }

  /**
   * 获取当前连接状态
   */
  getState(): WebSocketConnectionState {
    return this.state
  }

  /**
   * 连接WebSocket
   */
  async connect(): Promise<void> {
    if (this.state === WebSocketConnectionState.CONNECTED ||
        this.state === WebSocketConnectionState.CONNECTING) {
      return
    }

    this.state = WebSocketConnectionState.CONNECTING

    // Only reset reconnectAttempts if this is a fresh connection (not a retry)
    if (this.reconnectAttempts === 0) {
      this.reconnectAttempts = 0
    }

    try {
      const url = this.config.token
        ? `${this.config.url}?token=${this.config.token}`
        : this.config.url

      this.ws = new WebSocket(url)
      this.setupEventHandlers()
    } catch (error) {
      this.handleError(error as Error)
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.clearReconnectTimer()
    this.clearHeartbeatTimer()

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.state = WebSocketConnectionState.DISCONNECTED
    this.emit('disconnect')
  }

  /**
   * 发送消息
   */
  send(message: Omit<WebSocketMessage, 'timestamp' | 'id'>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected')
    }

    const messageWithMeta: WebSocketMessage = {
      ...message,
      timestamp: Date.now(),
      id: this.generateMessageId(),
    }

    this.ws.send(JSON.stringify(messageWithMeta))
  }

  /**
   * 注册事件监听器
   */
  on(event: string, callback: Function): void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, new Set())
    }
    this.eventCallbacks.get(event)!.add(callback)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, callback: Function): void {
    const callbacks = this.eventCallbacks.get(event)
    if (callbacks) {
      callbacks.delete(callback)
    }
  }

  /**
   * 获取降级状态
   */
  getFallbackState(): FallbackState {
    return { ...this.fallbackState }
  }

  /**
   * 启用轮询降级
   */
  enablePollingFallback(): void {
    this.fallbackState = {
      isActive: true,
      type: 'polling',
      pollingInterval: this.config.pollingInterval,
    }
  }

  /**
   * 禁用降级
   */
  disableFallback(): void {
    this.fallbackState = {
      isActive: false,
      type: 'none',
    }
  }

  /**
   * 设置WebSocket事件处理器
   */
  private setupEventHandlers(): void {
    if (!this.ws) return

    this.ws.addEventListener('open', this.handleOpen)
    this.ws.addEventListener('message', this.handleMessage)
    this.ws.addEventListener('error', this.handleError)
    this.ws.addEventListener('close', this.handleClose)
  }

  /**
   * 处理连接打开事件
   */
  private handleOpen = (): void => {
    this.state = WebSocketConnectionState.CONNECTED
    this.reconnectAttempts = 0
    this.startHeartbeat()
    this.emit('connect')
  }

  /**
   * 处理消息事件
   */
  private handleMessage = (event: MessageEvent): void => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)
      this.emit('message', message)
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  /**
   * 处理错误事件
   */
  private handleError = (error: Event | Error): void => {
    console.error('WebSocket error:', error)
    this.reconnectAttempts++

    // 检查是否达到最大重连次数
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.state = WebSocketConnectionState.ERROR
      this.emit('error', error instanceof Error ? error : new Error('WebSocket error'))
      this.emit('maxReconnectReached')
      this.checkFallback()
    } else {
      this.state = WebSocketConnectionState.RECONNECTING
      this.emit('error', error instanceof Error ? error : new Error('WebSocket error'))
      this.scheduleReconnect()
    }
  }

  /**
   * 处理连接关闭事件
   */
  private handleClose = (event: CloseEvent): void => {
    this.clearHeartbeatTimer()

    if (event.code !== 1000) {
      // 非正常关闭，尝试重连
      if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
        this.state = WebSocketConnectionState.RECONNECTING
        this.scheduleReconnect()
      } else {
        this.state = WebSocketConnectionState.ERROR
        this.emit('maxReconnectReached')
        this.checkFallback()
      }
    } else {
      this.state = WebSocketConnectionState.DISCONNECTED
      this.emit('disconnect')
    }
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    this.clearReconnectTimer()

    this.reconnectAttempts++
    this.state = WebSocketConnectionState.RECONNECTING
    this.emit('reconnecting', this.reconnectAttempts)

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, this.config.reconnectInterval)
  }

  /**
   * 开始心跳
   */
  private startHeartbeat(): void {
    this.clearHeartbeatTimer()

    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({
          type: WebSocketMessageType.SYSTEM,
          data: { type: 'heartbeat' },
        })
      }
    }, this.config.heartbeatInterval)
  }

  /**
   * 清除重连定时器
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  /**
   * 清除心跳定时器
   */
  private clearHeartbeatTimer(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * 检查是否需要降级
   */
  private checkFallback(): void {
    if (this.config.enablePollingFallback) {
      this.fallbackState = {
        isActive: true,
        type: 'polling',
        pollingInterval: this.config.pollingInterval,
      }
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, data?: unknown): void {
    const callbacks = this.eventCallbacks.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  /**
   * 生成消息ID
   */
  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
