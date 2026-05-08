import { describe, it, expect } from 'vitest'
import { useDebounce } from './useDebounce'

describe('useDebounce - P0 Fix: this上下文保存', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应该正确保存this上下文', async () => {
    const context = { value: 'test' }

    const mockFn = vi.fn(function (this: any) {
      return this.value
    })

    const { debouncedFn } = useDebounce(mockFn, 100)

    // 使用call/apply绑定上下文
    debouncedFn.call(context)
    vi.advanceTimersByTime(150)

    expect(mockFn).toHaveBeenCalled()
    expect(mockFn.mock.results[0].value).toBe('test')
  })

  it('flush方法应该保留正确的this上下文', () => {
    const context = { value: 'flush-test' }

    const mockFn = vi.fn(function (this: any) {
      return this.value
    })

    const { debouncedFn, flush } = useDebounce(mockFn, 1000)

    debouncedFn.call(context)
    flush.call(context) // 立即执行

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn.mock.results[0].value).toBe('flush-test')
  })

  it('flush时应该使用lastThis作为fallback', () => {
    const context1 = { value: 'original' }

    const mockFn = vi.fn(function (this: any) {
      return this.value
    })

    const { debouncedFn, flush } = useDebounce(mockFn, 1000)

    // 记录lastThis
    debouncedFn.call(context1)

    // 用undefined调用flush，应该fallback到lastThis
    flush.call(undefined as any)

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn.mock.results[0].value).toBe('original')
  })

  it('应该正确传递参数', () => {
    const mockFn = vi.fn()
    const { debouncedFn } = useDebounce(mockFn, 100)

    debouncedFn('arg1', 'arg2', { key: 'value' })
    vi.advanceTimersByTime(150)

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', { key: 'value' })
  })

  it('应该正确处理多次调用（只执行最后一次）', () => {
    const mockFn = vi.fn()
    const { debouncedFn } = useDebounce(mockFn, 100)

    debouncedFn('first')
    debouncedFn('second')
    debouncedFn('third')
    vi.advanceTimersByTime(150)

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('third')
  })
})
