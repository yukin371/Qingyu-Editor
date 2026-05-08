// Qingyu_fronted/src/core/types/websocket.types.ts

/**
 * WebSocket消息类型
 */
export enum WebSocketMessageType {
  MESSAGE = 'message',
  NOTIFICATION = 'notification',
  SYSTEM = 'system',
}

/**
 * WebSocket连接状态
 */
export enum WebSocketConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

/**
 * WebSocket消息结构
 */
export interface WebSocketMessage {
  type: WebSocketMessageType
  data: unknown
  timestamp?: number
  id?: string
}

/**
 * WebSocket配置
 */
export interface WebSocketConfig {
  url: string
  token?: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
  enablePollingFallback?: boolean
  pollingInterval?: number
}

/**
 * WebSocket事件回调
 */
export interface WebSocketEventCallbacks {
  onConnect?: () => void
  onDisconnect?: () => void
  onMessage?: (message: WebSocketMessage) => void
  onError?: (error: Error) => void
  onReconnecting?: (attempt: number) => void
  onMaxReconnectReached?: () => void
}

/**
 * 降级状态
 */
export interface FallbackState {
  isActive: boolean
  type: 'polling' | 'none'
  pollingInterval?: number
}
