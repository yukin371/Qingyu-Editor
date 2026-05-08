/**
 * API 请求适配器
 * 为新的 API 模块提供简化的请求封装
 */
import { httpService } from '@/core/services/http.service'
import type { APIResponse } from '@/types/api'
import type { AxiosError } from 'axios'

type HttpClientLike = {
  get<T>(url: string, config?: Record<string, unknown>): Promise<T>
  post<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T>
  put<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T>
  delete<T>(url: string, config?: Record<string, unknown>): Promise<T>
  patch<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T>
}

const httpClient = httpService as unknown as HttpClientLike

// 通用请求方法
interface RequestOption {
  url: string
  method?: 'get' | 'post' | 'put' | 'delete' | 'patch'
  data?: unknown
  params?: unknown
  headers?: Record<string, string>
  timeout?: number
  responseType?: 'json' | 'blob' | 'text' | 'arraybuffer' | 'document' | 'stream'
}

// 请求函数
export function request<T = unknown>(options: RequestOption) {
  const { url, method = 'get', data, params, responseType, ...config } = options

  // 返回处理后的数据
  return new Promise<T>((resolve, reject) => {
    const httpConfig = { ...config, params, responseType }

    // 对于 blob 等特殊响应类型，直接返回原始响应
    if (responseType && responseType !== 'json') {
      let promise: Promise<T>

      switch (method) {
        case 'post':
          promise = httpClient.post<T>(url, data, httpConfig)
          break
        case 'put':
          promise = httpClient.put<T>(url, data, httpConfig)
          break
        case 'delete':
          promise = httpClient.delete<T>(url, httpConfig)
          break
        case 'patch':
          promise = httpClient.patch<T>(url, data, httpConfig)
          break
        case 'get':
        default:
          promise = httpClient.get<T>(url, httpConfig)
          break
      }

      promise.then(resolve).catch(reject)
      return
    }

    // 标准 JSON 响应处理
    let promise: Promise<APIResponse<T>>

    switch (method) {
      case 'post':
        promise = httpClient.post<APIResponse<T>>(url, data, httpConfig)
        break
      case 'put':
        promise = httpClient.put<APIResponse<T>>(url, data, httpConfig)
        break
      case 'delete':
        promise = httpClient.delete<APIResponse<T>>(url, httpConfig)
        break
      case 'patch':
        promise = httpClient.patch<APIResponse<T>>(url, data, httpConfig)
        break
      case 'get':
      default:
        promise = httpClient.get<APIResponse<T>>(url, { ...httpConfig, params: data || params })
        break
    }

    promise
      .then((res: APIResponse<T> | T) => {
        // 检查是否是完整的 APIResponse（有 code 字段）
        if (res && typeof res === 'object' && 'code' in res) {
          const apiRes = res as APIResponse<T>
          // 假设后端返回格式为 { code, message, data }
          if (apiRes.code === 200 || apiRes.code === 0) {
            resolve(apiRes.data as T)
          } else {
            reject(new Error(apiRes.message || '请求失败'))
          }
        } else {
          // 响应已经被拦截器处理过，直接返回 data
          resolve(res as T)
        }
      })
      .catch((error: AxiosError) => {
        reject(error)
      })
  })
}

// 简化的 GET 请求
export function get<T = unknown>(url: string, params?: unknown) {
  return request<T>({ url, method: 'get', params })
}

// 简化的 POST 请求
export function post<T = unknown>(url: string, data?: unknown) {
  return request<T>({ url, method: 'post', data })
}

// 简化的 PUT 请求
export function put<T = unknown>(url: string, data?: unknown) {
  return request<T>({ url, method: 'put', data })
}

// 简化的 DELETE 请求
export function del<T = unknown>(url: string, params?: unknown) {
  return request<T>({ url, method: 'delete', params })
}

export default {
  request,
  get,
  post,
  put,
  delete: del
}
