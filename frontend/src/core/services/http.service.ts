// src/core/services/http.service.ts

import type {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosInstance,
  CancelTokenSource,
} from 'axios'
import axios from 'axios'
import { message as uiMessage } from '@/design-system/services'
import type { ErrorResponse } from '@/types/error.types'
import { errorReporter } from './error-reporter'
import { isInTestMode as checkTestMode, handleMockRequest } from './mock-data-manager'

// ==================== 类型扩展 ====================

/**
 * Promise回调对
 */

interface PromiseCallbacks {
  resolve: (_value?: unknown) => void
  reject: (_reason?: unknown) => void
}

/**
 * 扩展AxiosInstance接口，添加自定义方法
 */

interface ExtendedAxiosInstance extends AxiosInstance {
  /** 设置认证Token */
  setAuthToken(_token: string): void
  /** 清除认证Token */
  clearAuthToken(): void
  /** 取消所有进行中的请求 */
  cancelAllRequests(): void
}

type EnvelopeAwareRequestConfig = InternalAxiosRequestConfig & {
  preserveEnvelope?: boolean
}

// ==================== 配置 ====================

// API基础路径
const API_BASE_PATH = '/api/v1'

// 创建 axios 实例
const baseClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || API_BASE_PATH,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 用于存储取消令牌
const pendingRequests = new Map<string, CancelTokenSource>()

// 扩展实例
const apiClient = baseClient as ExtendedAxiosInstance

// ==================== 智能前缀检测 ====================

/**
 * 检测URL是否已经包含完整路径（包含 /api/v1 前缀）
 * 用于兼容Orval生成的完整路径和旧的相对路径
 */
function hasFullApiPath(url: string | undefined): boolean {
  if (!url) return false
  // 检查URL是否已经以 /api/v1 开头
  return url.startsWith('/api/v1') || url.startsWith('http')
}

function readStoredToken(): string | null {
  const parseToken = (raw: string | null): string | null => {
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw)
      return typeof parsed === 'string' ? parsed : raw
    } catch {
      return raw
    }
  }

  // 优先使用当前主存储键，兼容旧键 token
  return (
    parseToken(localStorage.getItem('qingyu_token')) || parseToken(localStorage.getItem('token'))
  )
}

// ==================== 测试模式支持 ====================
// 旧的 mock 数据函数已被 mock-data-manager.ts 替代
// @deprecated 请使用 mock-data-manager.ts 中的函数
async function _getMockDataForRequest(url: string | undefined): Promise<any> {
  if (import.meta.env.DEV)
    console.warn('[TestMode] _getMockDataForRequest 已废弃，请改用 mock-data-manager:', url)
  return { code: 200, message: 'success', data: {} }
}

/**
 * 模拟网络延迟
 */
function _mockDelay(): Promise<void> {
  const delay = 100 + Math.random() * 200
  return new Promise((resolve) => setTimeout(resolve, delay))
}

void [_getMockDataForRequest, _mockDelay]

// 请求拦截器 - 添加认证令牌 + 智能前缀检测 + 测试模式支持
// 注意：storage工具会自动添加 qingyu_ 前缀，所以需要使用 qingyu_token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 🧪 测试模式检测：如果处于测试模式，直接返回 mock 数据
    if (checkTestMode()) {
      // 使用统一的 Mock 数据管理器
      const mockData = await handleMockRequest(config.url, {
        method: config.method,
        params: config.params as Record<string, any> | undefined,
        data: config.data,
      })

      // 将 mock 数据包装成响应格式，直接 reject
      // 这样会跳过真实的 HTTP 请求
      return Promise.reject({
        _isMock: true, // 标识这是 mock 数据
        data: mockData.data,
        config,
        status: 200,
        statusText: 'OK',
      } as any)
    }

    // 正常模式：继续处理请求

    // 智能前缀检测：如果URL已经包含完整路径，临时覆盖baseURL
    if (hasFullApiPath(config.url)) {
      config.baseURL = '' // 使用空baseURL，避免重复前缀
    }

    const token = readStoredToken()

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 令牌刷新队列
let isRefreshing = false
let failedQueue: PromiseCallbacks[] = []

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => {
    // 统一返回 data 字段
    const res = response.data
    const preserveEnvelope = (response.config as EnvelopeAwareRequestConfig).preserveEnvelope

    // 如果是标准API响应格式，检查是否包含分页信息
    if (res && typeof res === 'object' && 'code' in res && 'data' in res) {
      if (preserveEnvelope) {
        return res
      }
      // 如果包含 pagination 字段，返回完整响应（保留 pagination）
      if ('pagination' in res) {
        return res
      }
      // 否则只返回 data 字段（保持向后兼容）
      return res.data
    }

    return res
  },
  async (error: AxiosError<ErrorResponse>) => {
    const { response, config } = error

    // 🧪 测试模式：如果是 mock 数据，直接返回
    if (error && (error as any)._isMock) {
      const mockData = (error as any).data

      // 模拟标准响应格式
      if (mockData && typeof mockData === 'object' && 'code' in mockData) {
        return mockData as any
      }

      return mockData ?? null
    }

    // 网络错误处理
    if (!response) {
      if (error.code === 'ECONNABORTED') {
        uiMessage.error('请求超时，请检查网络连接')
      } else {
        uiMessage.error('网络连接失败，请检查网络')
      }
      return Promise.reject(error)
    }

    const { code, message: backendMessage } = response.data

    // 上报错误到监控系统
    errorReporter.report(response.data)

    // 处理HTTP 401状态码（认证失败）
    if (response.status === 401) {
      // 对于登录接口，构造带有正确消息的Error对象，由调用方显示错误
      // 使用精确的 URL 路径匹配，避免误匹配其他包含 login 的路径
      const urlPath = config?.url || ''
      const isLoginRequest =
        /^\/(user\/auth\/login|api\/v1\/user\/auth\/login|login)$/.test(urlPath) ||
        urlPath.endsWith('/auth/login')
      if (isLoginRequest) {
        // 登录失败，使用后端返回的错误消息
        const errorMessage = backendMessage || '用户名或密码错误'
        const customError = new Error(errorMessage)
        return Promise.reject(customError)
      }
      handleAuthError()
      return Promise.reject(error)
    }

    if (code === 1102 && config) {
      // TOKEN_EXPIRED (1102)
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return apiClient(config)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      isRefreshing = true

      try {
        // 修复：使用 qingyu_refreshToken 前缀，并解析JSON（storage.set会JSON.stringify）
        const rawRefreshToken = localStorage.getItem('qingyu_refreshToken')
        let refreshToken = rawRefreshToken
        if (rawRefreshToken) {
          try {
            const parsed = JSON.parse(rawRefreshToken)
            refreshToken = typeof parsed === 'string' ? parsed : rawRefreshToken
          } catch {
            refreshToken = rawRefreshToken
          }
        }

        // 修复：使用正确的刷新 API 路径
        const res = await axios.post('/api/v1/shared/auth/refresh', { token: refreshToken })

        const { token: newToken } = res.data.data
        // 修复：使用 qingyu_token 前缀，并使用storage.set()保持一致性（会JSON.stringify）
        localStorage.setItem('qingyu_token', JSON.stringify(newToken))

        processQueue(null, newToken)

        return apiClient(config)
      } catch (err) {
        processQueue(err, null)
        handleAuthError()
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    // 根据错误码分类处理
    switch (code) {
      // 认证错误 - 跳转登录
      case 1002: // UNAUTHORIZED (1002)
      case 1102: // TOKEN_EXPIRED (1102)
      case 1103: // TOKEN_INVALID (1103)
        handleAuthError()
        break

      // 权限错误
      case 1003: // FORBIDDEN (1003)
        uiMessage.error('您没有权限执行此操作')
        break

      // 参数错误
      case 1001: // INVALID_PARAMS (1001)
        uiMessage.warning(backendMessage || '参数错误，请检查输入')
        break

      // 资源不存在
      case 1004: // NOT_FOUND (1004)
        uiMessage.warning(backendMessage || '请求的资源不存在')
        break

      // 业务逻辑错误
      case 1007: // RATE_LIMIT_EXCEEDED (1007)
        uiMessage.error('操作过于频繁，请稍后再试')
        break

      // 系统错误
      case 5000: // INTERNAL_ERROR (5000)
        uiMessage.error('服务器内部错误，请稍后重试')
        break

      default:
        uiMessage.error(backendMessage || '请求失败，请稍后重试')
    }

    return Promise.reject(error)
  },
)

/**
 * 触发认证失效事件
 * 清除本地存储并跳转到登录页
 */
export function buildAuthRedirectPath(pathname: string, search = ''): string {
  if (pathname === '/auth' || pathname === '/' || pathname.startsWith('/writer')) {
    return '/writer'
  }

  const redirectTarget = `${pathname}${search || ''}`
  return `/writer?redirect=${encodeURIComponent(redirectTarget)}`
}

export function resolveSafeAuthRedirectTarget(redirect: unknown, fallback = '/writer'): string {
  const candidate = Array.isArray(redirect) ? redirect[0] : redirect
  if (typeof candidate !== 'string') {
    return fallback
  }

  const normalized = candidate.trim()
  if (!normalized || !normalized.startsWith('/') || normalized.startsWith('//')) {
    return fallback
  }

  if (normalized === '/auth' || normalized.startsWith('/auth?')) {
    return fallback
  }

  return normalized
}

function handleAuthError() {
  // E2E场景下避免自动登出和跳转，防止测试过程被401中断
  if (typeof navigator !== 'undefined' && navigator.webdriver) {
    if (import.meta.env.DEV) console.warn('[Auth] Skip auto logout in E2E mode')
    return
  }

  // 防止重复处理
  if (sessionStorage.getItem('auth_expired_handling')) {
    return
  }
  sessionStorage.setItem('auth_expired_handling', 'true')

  // 清除本地存储中的认证信息
  const authKeys = [
    'qingyu_token',
    'qingyu_refreshToken',
    'qingyu_user',
    'qingyu_roles',
    'token',
    'refreshToken',
    'user',
    'roles',
  ]
  authKeys.forEach((key) => {
    localStorage.removeItem(key)
  })

  // 显示提示
  uiMessage.warning('登录已过期，请重新登录')

  // 跳转到登录页（保留当前路径用于登录后跳回）
  const loginPath = buildAuthRedirectPath(window.location.pathname, window.location.search)

  // 使用 setTimeout 确保消息显示后再跳转
  setTimeout(() => {
    sessionStorage.removeItem('auth_expired_handling')
    window.location.href = loginPath
  }, 500)
}

// ==================== 自定义方法 ====================

/**
 * 设置认证Token
 */
apiClient.setAuthToken = function (_token: string): void {
  this.defaults.headers.common['Authorization'] = `Bearer ${_token}`
}

/**
 * 清除认证Token
 */
apiClient.clearAuthToken = function (): void {
  delete this.defaults.headers.common['Authorization']
}

/**
 * 取消所有进行中的请求
 */
apiClient.cancelAllRequests = function (): void {
  pendingRequests.forEach((source) => {
    source.cancel('Request canceled due to cancelAllRequests')
  })
  pendingRequests.clear()
}

// ==================== 请求取消支持 ====================

// 生成请求唯一标识
const generateRequestKey = (config: InternalAxiosRequestConfig): string => {
  const { method, url } = config
  return `${method}-${url}`
}

// 请求拦截器 - 添加取消令牌支持
// 注意：认证Token已在第一个拦截器中处理，这里只处理取消令牌
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加取消令牌支持
    const key = generateRequestKey(config)
    const source = axios.CancelToken.source()
    config.cancelToken = source.token
    pendingRequests.set(key, source)

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// ==================== 导出 ====================

// 导出实例供模块使用
export default apiClient

// 类型安全的 HTTP 服务接口
// 响应拦截器会自动提取 response.data，所以返回类型应该是 T 而不是 AxiosResponse<T>
interface HttpService {
  get<T = any>(url: string, config?: object): Promise<T>
  post<T = any>(url: string, data?: any, config?: object): Promise<T>
  put<T = any>(url: string, data?: any, config?: object): Promise<T>
  delete<T = any>(url: string, config?: object): Promise<T>
  patch<T = any>(url: string, data?: any, config?: object): Promise<T>
  head<T = any>(url: string, config?: object): Promise<T>
  options<T = any>(url: string, config?: object): Promise<T>
  /** 设置认证Token */
  setAuthToken(token: string): void
  /** 清除认证Token */
  clearAuthToken(): void
  /** 取消所有进行中的请求 */
  cancelAllRequests(): void
}

// 别名导出，保持向后兼容，使用类型断言确保类型安全
export const httpService = apiClient as unknown as HttpService

// 同时导出类型化的实例
export { apiClient }
