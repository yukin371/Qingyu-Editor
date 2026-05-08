import { vi } from 'vitest'

/**
 * Vitest 全局 Mock 配置
 *
 * 用于测试环境中的全局 Mock 设置
 */

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  get length() {
    return 0
  },
  key: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  get length() {
    return 0
  },
  key: vi.fn(),
}

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: MediaQueryList | string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
class IntersectionObserverMock implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds = []

  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
}

// @ts-ignore - Vitest global mock
global.IntersectionObserver = vi.fn(function MockIntersectionObserver() {
  return new IntersectionObserverMock()
})

// Mock ResizeObserver
class ResizeObserverMock implements ResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

// @ts-ignore - Vitest global mock
global.ResizeObserver = vi.fn(function MockResizeObserver() {
  return new ResizeObserverMock()
})

// Mock requestAnimationFrame
// @ts-ignore - Vitest global mock
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 16) as unknown as number
}

// Mock cancelAnimationFrame
// @ts-ignore - Vitest global mock
global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id)
}
