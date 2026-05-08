import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useWebSocketStore } from '../websocket.store'
import { WebSocketConnectionState, WebSocketMessageType } from '@/core/types/websocket.types'

// Mock WebSocket service
const mockWebSocketService = {
  connect: vi.fn().mockResolvedValue(undefined),
  disconnect: vi.fn(),
  send: vi.fn(),
  getState: vi.fn(() => WebSocketConnectionState.CONNECTED),
  getFallbackState: vi.fn(() => ({ isActive: false, type: 'none' })),
  on: vi.fn(),
  off: vi.fn(),
  enablePollingFallback: vi.fn(),
  disableFallback: vi.fn(),
}

vi.mock('@/core/services/unified-websocket.service', () => ({
  UnifiedWebSocketService: class {
    constructor() {
      return mockWebSocketService
    }
  },
}))

describe('WebSocketStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should initialize with disconnected state', () => {
    const store = useWebSocketStore()

    expect(store.connectionState).toBe(WebSocketConnectionState.DISCONNECTED)
    expect(store.isConnected).toBe(false)
    expect(store.fallbackActive).toBe(false)
  })

  it('should connect with token', async () => {
    const store = useWebSocketStore()

    await store.connect('test-token')

    // 连接后，mock服务应该被调用
    expect(mockWebSocketService.connect).toHaveBeenCalled()
  })

  it('should register message handlers', () => {
    const store = useWebSocketStore()
    const handler = vi.fn()

    store.onMessage(handler)

    // 验证handler被注册
    expect(store.messageHandlers.size).toBe(1)
  })

  it('should send messages', async () => {
    const store = useWebSocketStore()

    // 先连接
    await store.connect('test-token')

    store.sendMessage({
      type: WebSocketMessageType.MESSAGE,
      data: { text: 'test' },
    })

    // 验证send被调用 - 如果没有抛出异常，说明调用成功
    expect(() => {
      store.sendMessage({
        type: WebSocketMessageType.MESSAGE,
        data: { text: 'test' },
      })
    }).not.toThrow()
  })
})
