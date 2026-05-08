/**
 * 通用测试工具
 * 提供跨测试文件的通用辅助函数
 */



/**
 * 延迟函数 (用于测试异步操作)
 * @param ms 延迟毫秒数
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 创建一个可解析的Promise
 * @param data Promise解析的数据
 */
export const resolvedPromise = <T>(data: T): Promise<T> => {
  return Promise.resolve(data)
}

/**
 * 创建一个可拒绝的Promise
 * @param error Promise拒绝的错误
 */
export const rejectedPromise = <T>(error: Error): Promise<T> => {
  return Promise.reject(error)
}

/**
 * Mock一个函数并追踪调用
 * @param implementation 可选的函数实现
 */
export const createMockFunction = <T extends (...args: any[]) => any>(
  implementation?: T
): ReturnType<typeof vi.fn> & { _mockImpl: T | undefined } => {
  const mockFn = vi.fn(implementation) as any
  mockFn._mockImpl = implementation
  return mockFn
}

/**
 * Mock一个对象的所有方法
 * @param obj 要mock的对象
 */
export const mockObjectMethods = <T extends Record<string, any>>(obj: T): T => {
  const mocked = {} as T

  for (const key in obj) {
    if (typeof obj[key] === 'function') {
      ;(mocked as any)[key] = vi.fn()
    } else {
      mocked[key] = obj[key]
    }
  }

  return mocked
}

/**
 * 创建一个mock的响应数据
 * @param data 响应数据
 * @param delay 延迟毫秒数 (默认0)
 */
export const createMockResponse = async <T>(
  data: T,
  delayMs: number = 0
): Promise<T> => {
  if (delayMs > 0) {
    await delay(delayMs)
  }
  return data
}

/**
 * 验证函数是否被调用
 * @param mockFn 要验证的mock函数
 * @param times 期望调用次数
 */
export const expectCalledTimes = (mockFn: ReturnType<typeof vi.fn>, times: number) => {
  expect(mockFn).toHaveBeenCalledTimes(times)
}

/**
 * 验证函数是否被使用特定参数调用
 * @param mockFn 要验证的mock函数
 * @param args 期望的调用参数
 */
export const expectCalledWith = (mockFn: ReturnType<typeof vi.fn>, ...args: any[]) => {
  expect(mockFn).toHaveBeenCalledWith(...args)
}

/**
 * 清除所有mock
 */
export const clearAllMocks = () => {
  vi.clearAllMocks()
}

/**
 * 重置所有mock
 */
export const resetAllMocks = () => {
  vi.resetAllMocks()
}

/**
 * 恢复所有mock
 */
export const restoreAllMocks = () => {
  vi.restoreAllMocks()
}
