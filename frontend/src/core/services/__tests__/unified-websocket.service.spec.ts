import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { UnifiedWebSocketService } from '../unified-websocket.service'
import { WebSocketMessageType, WebSocketConnectionState } from '../../types/websocket.types'

// Create a mock WebSocket class
class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  send = vi.fn()
  close = vi.fn()
  readyState = MockWebSocket.CONNECTING

  private eventHandlers: Map<string, Array<Function>> = new Map()

  constructor(_url: string) {
    // Don't throw error in constructor
  }

  addEventListener(event: string, handler: Function) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)!.push(handler)
  }

  removeEventListener(event: string, handler: Function) {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  // Helper method to trigger events
  triggerEvent(event: string, data?: unknown) {
    const handlers = this.eventHandlers.get(event) || []
    handlers.forEach((handler) => handler(data))
  }
}

describe('UnifiedWebSocketService', () => {
  let service: UnifiedWebSocketService

  beforeEach(() => {
    // Mock global WebSocket with the class directly
    // @ts-ignore - Mocking global WebSocket
    global.WebSocket = MockWebSocket

    service = new UnifiedWebSocketService({
      url: 'ws://localhost:8080/ws',
      token: 'test-token',
      reconnectInterval: 1000,
      maxReconnectAttempts: 3,
    })
  })

  afterEach(() => {
    service.disconnect()
    vi.clearAllMocks()
  })

  it('should initialize with disconnected state', () => {
    expect(service.getState()).toBe(WebSocketConnectionState.DISCONNECTED)
  })

  it('should connect to websocket', async () => {
    await service.connect()

    // WebSocket should be created
    // @ts-ignore - Accessing private property for testing
    expect((service as any).ws).toBeInstanceOf(MockWebSocket)
  })

  it('should handle connection open', () => {
    const onConnect = vi.fn()

    service.on('connect', onConnect)
    service.connect()

    // Get mock instance and trigger open event
    // @ts-ignore - Accessing private property for testing
    const mockWsInstance = (service as any).ws as MockWebSocket
    mockWsInstance.triggerEvent('open')

    expect(service.getState()).toBe(WebSocketConnectionState.CONNECTED)
    expect(onConnect).toHaveBeenCalled()
  })

  it('should handle incoming messages', () => {
    const onMessage = vi.fn()

    service.on('message', onMessage)
    service.connect()

    const testData = {
      type: WebSocketMessageType.MESSAGE,
      data: { text: 'hello' },
      timestamp: Date.now(),
    }

    // Get mock instance and trigger message event
    // @ts-ignore - Accessing private property for testing
    const mockWsInstance = (service as any).ws as MockWebSocket
    mockWsInstance.triggerEvent('message', { data: JSON.stringify(testData) })

    expect(onMessage).toHaveBeenCalledWith(testData)
  })

  it('should not reconnect when max attempts reached', async () => {
    vi.useFakeTimers()

    service.connect()

    // Helper function to get current WebSocket instance and trigger error
    const triggerError = () => {
      // @ts-ignore - Accessing private property for testing
      const mockWsInstance = (service as any).ws as MockWebSocket
      mockWsInstance.triggerEvent('error', new Error('Connection failed'))
    }

    // Simulate 3 connection failures
    triggerError()
    vi.advanceTimersByTime(1000)

    triggerError()
    vi.advanceTimersByTime(1000)

    triggerError()
    vi.advanceTimersByTime(1000)

    // After 3 failed attempts, state should be ERROR
    expect(service.getState()).toBe(WebSocketConnectionState.ERROR)

    vi.useRealTimers()
  })

  it('should send messages', () => {
    service.connect()

    // Get mock instance and simulate connection opened
    // @ts-ignore - Accessing private property for testing
    const mockWsInstance = (service as any).ws as MockWebSocket
    mockWsInstance.readyState = MockWebSocket.OPEN
    mockWsInstance.triggerEvent('open')

    service.send({
      type: WebSocketMessageType.MESSAGE,
      data: { text: 'test' },
    })

    expect(mockWsInstance.send).toHaveBeenCalled()
  })
})
