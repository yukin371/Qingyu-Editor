/**
 * 测试工具函数集
 *
 * 提供通用的测试辅助函数
 */

import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { ComponentPublicInstance } from 'vue'

/**
 * 创建带有Pinia的测试包装器
 *
 * @param component - Vue组件
 * @param options - mount选项
 * @returns VueWrapper
 *
 * @example
 * ```ts
 * const wrapper = createTestWrapper(MyComponent, {
 *   props: { title: 'Test' }
 * })
 * ```
 */
export function createTestWrapper(
  component: unknown,
  options: Record<string, unknown> = {},
): VueWrapper<ComponentPublicInstance> {
  return mount(component, {
    global: {
      plugins: [createPinia()],
      ...(options.global as Record<string, unknown>),
    },
    ...options,
  })
}

/**
 * 等待异步更新完成
 *
 * @param ms - 等待毫秒数，默认0
 * @returns Promise
 *
 * @example
 * ```ts
 * await waitForTick()
 * await waitForTick(100)
 * ```
 */
export async function waitForTick(ms: number = 0): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 等待下一个Vue更新周期
 *
 * @returns Promise
 */
export async function nextTick(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

/**
 * 创建Mock事件对象
 *
 * @param eventType - 事件类型
 * @param props - 事件属性
 * @returns Mock事件对象
 */
export function createMockEvent(eventType: string, props: Record<string, unknown> = {}): Event {
  const event = new Event(eventType, { bubbles: true, cancelable: true })
  Object.assign(event, props)
  return event
}

/**
 * 创建Mock路由
 *
 * @param route - 路由配置
 * @returns Mock路由对象
 */
export function createMockRouter(route: Record<string, unknown> = {}) {
  return {
    currentRoute: {
      value: {
        path: '/',
        params: {},
        query: {},
        ...route,
      },
    },
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }
}

/**
 * 清除所有Mock
 *
 * 在每个测试用例后调用，确保Mock不会互相影响
 */
export function clearAllMocks(): void {
  vi.clearAllMocks()
}

/**
 * 重置所有Mock
 *
 * 在每个测试套件前调用，重置Mock到初始状态
 */
export function resetAllMocks(): void {
  vi.resetAllMocks()
}
