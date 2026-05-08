import type { AxiosRequestConfig, Method, ResponseType } from 'axios'
import type { RequestConfig } from '@/core/types/api.types'
import { httpService } from '@/core/services/http.service'

type OrvalConfig<TBody = any> = AxiosRequestConfig<TBody> & {
  url: string
  method?: Method
  params?: any
  data?: any
  responseType?: ResponseType
  headers?: Record<string, any>
}

function toRequestConfig(cfg: OrvalConfig): RequestConfig {
  const rc: RequestConfig = {
    headers: cfg.headers,
    responseType: cfg.responseType,
    timeout: cfg.timeout,
    withCredentials: cfg.withCredentials,
    signal: (cfg as any).signal,

    isUpload:
      (cfg as any).isUpload ??
      String(cfg.headers?.['Content-Type'] || cfg.headers?.['content-type'] || '')
        .toLowerCase()
        .includes('multipart/form-data'),
  }

  const passthroughKeys = [
    'skipErrorHandler',
    'silent',
    'deduplicate',
    'retry',
    'retryDelay',
    'returnFullResponse',
    'keepCache',
    'skipCaseConversion',
    'isUpload',
  ] as const

  for (const k of passthroughKeys) {
    if ((cfg as any)[k] !== undefined) (rc as any)[k] = (cfg as any)[k]
  }

  return rc
}

export const defaultMutator = async <TResponse = any, TBody = any>(
  cfg: OrvalConfig<TBody>
): Promise<TResponse> => {
  const method = (cfg.method || 'GET').toUpperCase()
  const url = cfg.url
  const requestConfig = toRequestConfig(cfg)

  switch (method) {
    case 'GET':
      return (await httpService.get<TResponse>(url, {
        params: cfg.params,
        ...requestConfig
      })) as TResponse
    case 'DELETE':
      return (await httpService.delete<TResponse>(url, {
        params: cfg.params,
        ...requestConfig
      })) as TResponse
    case 'POST':
      return (await httpService.post<TResponse>(url, cfg.data, requestConfig)) as TResponse
    case 'PUT':
      return (await httpService.put<TResponse>(url, cfg.data, requestConfig)) as TResponse
    case 'PATCH':
      return (await httpService.patch<TResponse>(url, cfg.data, requestConfig)) as TResponse
    default:
      throw new Error(`[orval-mutator] Unsupported method: ${method}`)
  }
}

// 为 Orval 添加别名（避免使用保留关键字 'default'）
export const orvalMutator = defaultMutator
// 注意：不使用默认导出，因为 'default' 是 TypeScript 保留关键字
// export default defaultMutator
