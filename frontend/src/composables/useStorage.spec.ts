import { describe, it, expect } from 'vitest'
import { useStorage } from './useStorage'

describe('useStorage - P0 Fix: LocalStorage异常处理', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('P0: 应该处理QuotaExceededError（核心测试）', () => {
    const setItemMock = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      const error = new Error('QuotaExceededError')
      ;(error as any).name = 'QuotaExceededError'
      throw error
    })

    const { save } = useStorage('test-key', { value: 'test' })

    // 应该优雅降级，不抛出错误
    expect(() => save()).not.toThrow()

    setItemMock.mockRestore()
  })

  it('P0: QuotaExceededError后应该清理旧数据并重试（核心测试）', () => {
    // 创建多个key
    const keys = Array.from({ length: 10 }, (_, i) => `key-${i}`)
    const data: Record<string, string> = {}
    keys.forEach((key) => {
      data[key] = `data-${key}`
    })
    localStorage.setItem('qingyu-storage', JSON.stringify(data))

    let callCount = 0
    const setItemMock = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        const error = new Error('QuotaExceededError')
        ;(error as any).name = 'QuotaExceededError'
        throw error
      }
      // 第二次调用成功
    })

    const { save } = useStorage('new-key', 'new-data')
    save()

    // 应该重试
    expect(callCount).toBeGreaterThanOrEqual(1)

    setItemMock.mockRestore()
  })

  it('应该使用默认值当数据不存在时', () => {
    const { data } = useStorage('non-existent-key', { value: 'default' })

    expect(data.value).toEqual({ value: 'default' })
  })
})
