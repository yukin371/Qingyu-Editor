/**
 * useMockData Composable
 * 
 * 统一处理 Mock 数据的逻辑工具
 * 
 * 功能：
 * 1. 检测 URL 中的 ?test=true 参数
 * 2. 根据参数决定是否使用 Mock 数据
 * 3. 提供统一的 Mock 数据获取接口
 * 4. 支持不同模块的 Mock 数据切换
 * 
 * @example
 * ```ts
 * const { isTestMode, getMockData, shouldUseMock } = useMockData()
 * 
 * if (shouldUseMock()) {
 *   const data = getMockData('comments')
 *   // 使用 mock 数据
 * } else {
 *   // 调用真实 API
 * }
 * ```
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// Mock 数据导入（按需导入）
// 注意：这里使用动态导入以避免循环依赖
type MockDataKey = 
  | 'comments' 
  | 'bookshelf' 
  | 'pendingReviews' 
  | 'transactions' 
  | 'wallet' 
  | 'projects' 
  | 'characters' 
  | 'outlineNodes'
  | 'paragraphComments'
  | 'paragraphCommentSummaries'

interface MockDataOptions {
  /** 是否启用 Mock 模式（默认自动检测 URL 参数） */
  enabled?: boolean
  /** Mock 数据的键名 */
  key?: MockDataKey
  /** 当 Mock 模式启用时的回调 */
  onMockEnabled?: () => void
  /** 当 Mock 模式禁用时的回调 */
  onMockDisabled?: () => void
}

const globalTestMode = ref(false)

/**
 * useMockData Composable
 */
export function useMockData(options: MockDataOptions = {}) {
  const router = useRouter()
  const route = useRoute()

  // 检测 URL 中的 test 参数
  const checkTestMode = (): boolean => {
    // 检查 URL 参数
    const urlParams = new URLSearchParams(window.location.search)
    const hasTestParam = urlParams.has('test') && urlParams.get('test') === 'true'
    
    // 检查路由 query 参数
    const routeQuery = route.query.test as string | undefined
    const hasRouteTest = routeQuery === 'true'
    
    return hasTestParam || hasRouteTest || globalTestMode.value
  }

  // 当前是否处于测试模式
  const isTestMode = ref(checkTestMode())

  // 是否应该使用 Mock 数据
  const shouldUseMock = computed(() => {
    if (options.enabled !== undefined) {
      return options.enabled && isTestMode.value
    }
    return isTestMode.value
  })

  // 获取 Mock 数据
  const getMockData = async (key: MockDataKey) => {
    if (!shouldUseMock.value) {
      console.warn(`[useMockData] Test mode is not enabled. Call to getMockData('${key}') will return null.`)
      return null
    }

    try {
      // 动态导入 mock 数据
      const mockDataModule = await import('@/views/demo/mock-data.ts')
      return mockDataModule[key] || mockDataModule.default[key]
    } catch (error) {
      console.error(`[useMockData] Failed to load mock data for key '${key}':`, error)
      return null
    }
  }

  // 切换测试模式（用于开发调试）
  const toggleTestMode = (enabled?: boolean) => {
    const newMode = enabled !== undefined ? enabled : !isTestMode.value
    globalTestMode.value = newMode
    isTestMode.value = newMode

    // 更新 URL（不刷新页面）
    if (newMode) {
      const url = new URL(window.location.href)
      url.searchParams.set('test', 'true')
      window.history.replaceState({}, '', url.toString())
      options.onMockEnabled?.()
    } else {
      const url = new URL(window.location.href)
      url.searchParams.delete('test')
      window.history.replaceState({}, '', url.toString())
      options.onMockDisabled?.()
    }
  }

  // 获取带有 test 参数的 URL
  const getTestUrl = (path: string): string => {
    const url = new URL(path, window.location.origin)
    url.searchParams.set('test', 'true')
    return url.toString()
  }

  // 导航到指定页面并自动添加 test 参数
  const navigateWithTest = (path: string) => {
    router.push({ path, query: { test: 'true' } })
  }

  // 监听 URL 变化
  const handleRouteChange = () => {
    isTestMode.value = checkTestMode()
  }

  // 生命周期
  onMounted(() => {
    // 监听路由变化
    router.afterEach(() => {
      handleRouteChange()
    })

    // 初始检查
    if (isTestMode.value) {
      console.log('[useMockData] Test mode is enabled via ?test=true parameter')
      options.onMockEnabled?.()
    }
  })

  onUnmounted(() => {
    // 清理工作（如果需要）
  })

  return {
    // 状态
    isTestMode,
    shouldUseMock,

    // 方法
    getMockData,
    toggleTestMode,
    getTestUrl,
    navigateWithTest,
    checkTestMode
  }
}

/**
 * 全局设置测试模式（用于跨组件通信）
 */
export function setGlobalTestMode(enabled: boolean) {
  globalTestMode.value = enabled
}

/**
 * 获取全局测试模式状态
 */
export function getGlobalTestMode(): boolean {
  return globalTestMode.value
}

/**
 * 为指定 URL 添加 test 参数
 */
export function addTestParamToUrl(url: string): string {
  try {
    const urlObj = new URL(url, window.location.origin)
    urlObj.searchParams.set('test', 'true')
    return urlObj.toString()
  } catch {
    // 如果 URL 无效，尝试作为路径处理
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}test=true`
  }
}

/**
 * 从 URL 中移除 test 参数
 */
export function removeTestParamFromUrl(url: string): string {
  try {
    const urlObj = new URL(url, window.location.origin)
    urlObj.searchParams.delete('test')
    return urlObj.toString()
  } catch {
    // 如果 URL 无效，使用正则处理
    return url.replace(/[?&]test=true/, '').replace(/^&/, '?')
  }
}

/**
 * 检查当前是否在 Demo 页面
 */
export function isInDemoPage(): boolean {
  return window.location.pathname.startsWith('/demo')
}

/**
 * 批量获取多个 Mock 数据
 */
export async function getMultipleMockData(keys: MockDataKey[]): Promise<Record<string, any>> {
  const result: Record<string, any> = {}
  
  for (const key of keys) {
    result[key] = await (async () => {
      try {
        const mockDataModule = await import('@/views/demo/mock-data.ts')
        return mockDataModule[key] || mockDataModule.default[key]
      } catch {
        return null
      }
    })()
  }
  
  return result
}
