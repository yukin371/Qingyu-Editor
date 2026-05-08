import axios, { 
  type AxiosInstance, 
  type AxiosError, 
  type InternalAxiosRequestConfig, 
  type AxiosResponse 
} from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { ErrorHandler } from './errorHandler'

// --- 类型定义 ---

// 定义后端统一返回的信封结构
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp?: number
  request_id?: string
}

// 请求配置
export interface RequestConfig extends InternalAxiosRequestConfig {
  skipErrorHandler?: boolean // 跳过默认错误提示
  silent?: boolean           // 静默模式（不弹窗）
  deduplicate?: boolean      // 开启请求去重
  keepCache?: boolean        // 开启缓存（不加_t时间戳）
}

// --- 取消请求控制器 Map ---
const abortControllerMap = new Map<string, AbortController>()

// 生成请求唯一 Key
const getPendingUrl = (config: InternalAxiosRequestConfig) => {
  return [config.method, config.url, JSON.stringify(config.params), JSON.stringify(config.data)].join('&')
}

// --- 实例化 ---
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1', // 建议在 env.d.ts 中定义类型，避免 as any
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// --- 请求拦截器 ---
service.interceptors.request.use(
  (config: RequestConfig) => {
    // 处理请求去重
    if (config.deduplicate) {
      const key = getPendingUrl(config)
      if (abortControllerMap.has(key)) {
        abortControllerMap.get(key)?.abort()
        abortControllerMap.delete(key)
      }
      const controller = new AbortController()
      config.signal = controller.signal
      abortControllerMap.set(key, controller)
    }

    // 获取 Token
    const authStore = useAuthStore()
    if (authStore.token && config.headers) {
      config.headers.set('Authorization', `Bearer ${authStore.token}`)
    }

    // 3. 缓存控制 (默认加时间戳，除非显式 keepCache: true)
    if (config.method?.toLowerCase() === 'get' && !config.keepCache) {
      config.params = { ...config.params, _t: Date.now() }
    }

    return config
  },
  (error) => Promise.reject(error)
)

// --- 响应拦截器 ---
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const config = response.config as RequestConfig
    
    // 请求完成，移除取消控制器
    if (config.deduplicate) {
      const key = getPendingUrl(config)
      abortControllerMap.delete(key)
    }

    const { data } = response
    // 这里的 data 是 ApiResponse 结构
    const { code, message, request_id, timestamp } = data

    // 开发环境日志
    if (import.meta.env.DEV && request_id) {
      const timeStr = timestamp ? new Date(timestamp * 1000).toLocaleTimeString() : ''
      console.debug(`[API OK] ${request_id} | ${timeStr} | ${response.config.url}`)
    }

    // 业务成功判定 (2xx)
    // 注意：这里假设后端业务成功也是 200/201。如果后端 HTTP 200 但 body code 是 500，需要调整逻辑
    if (code === 200 || code === 201) {
      // 通常 UI 只需要 data.data，不需要信封。
      // 但为了兼容你的逻辑，这里返回 data (整个信封)。
      // 建议：如果是业务数据，可以直接 return data.data，减少组件层解构
      return data as any 
    } 
    
    // 业务逻辑错误 (如：余额不足，code 4002)
    handleBusinessError(code, message, config, request_id)
    return Promise.reject(new Error(message || 'Error'))
  },
  (error: AxiosError) => {
    // 处理被取消的请求 (不报错)
    if (axios.isCancel(error)) {
      return Promise.reject(new Error('Request canceled')) // 或者直接 swallow
    }

    const config = error.config as RequestConfig
    // 移除 Map
    if (config && config.deduplicate) {
      const key = getPendingUrl(config)
      abortControllerMap.delete(key)
    }

    // 错误分流
    if (!config?.skipErrorHandler) {
        ErrorHandler.handle(error, {
            silent: config?.silent,
            onError: () => {
                 // 401 特殊处理
                 if (error.response?.status === 401) {
                     const authStore = useAuthStore()
                     // 这里可以扩展 Refresh Token 逻辑
                     authStore.logout() 
                     // 建议加上: location.reload() 或 router.push('/login') 
                 }
            }
        })
    }
    
    return Promise.reject(error)
  }
)

// 辅助：处理业务错误
function handleBusinessError(code: number, msg: string, config: RequestConfig, reqId?: string) {
   if (!config.silent && !config.skipErrorHandler) {
     ElMessage.error(msg || `请求失败 (${code})`)
   }
   // 可以选择抛出一个自定义错误对象包含 code 和 reqId
   const err = new Error(msg) as any
   err.code = code
   err.request_id = reqId
   throw err
}

// --- ★ 核心改进：导出带有泛型的请求方法 ---
// 这样组件调用时： api.get<UserList>('/users') 返回值类型就是 Promise<ApiResponse<UserList>>
// 甚至可以进一步封装，让返回值直接是 Promise<UserList>

const request = {
  get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return service.get(url, config)
  },
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return service.post(url, data, config)
  },
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return service.put(url, data, config)
  },
  delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return service.delete(url, config)
  }
}

export default request