/**
 * HTTP Request Alias
 * 导出 httpService 作为 http，提供简洁的API调用方式
 */

import { httpService } from './services/http.service'

/**
 * HTTP请求方法别名
 * 提供与httpService相同的功能，但使用更简洁的命名
 */
export type HttpOptions = Record<string, unknown>

export interface HttpClient {
  get<T>(url: string, config?: HttpOptions): Promise<T>
  post<T>(url: string, data?: unknown, config?: HttpOptions): Promise<T>
  put<T>(url: string, data?: unknown, config?: HttpOptions): Promise<T>
  delete<T>(url: string, config?: HttpOptions): Promise<T>
}

export const http: HttpClient = {
  get: (_url, _config) => httpService.get(_url, _config) as any,
  post: (_url, _data, _config) => httpService.post(_url, _data, _config) as any,
  put: (_url, _data, _config) => httpService.put(_url, _data, _config) as any,
  delete: (_url, _config) => httpService.delete(_url, _config) as any
}

export default http
