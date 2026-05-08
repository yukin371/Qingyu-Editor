import { httpService } from '@/core/services/http.service'

export const AI_REQUEST_TIMEOUT_MS = 65_000

type AIRequestConfig = Record<string, unknown>

function withAIRequestTimeout(config?: AIRequestConfig): AIRequestConfig {
  return {
    timeout: AI_REQUEST_TIMEOUT_MS,
    ...(config || {}),
  }
}

export function getAIRequest<T = unknown>(url: string, config?: AIRequestConfig): Promise<T> {
  return httpService.get<T>(url, withAIRequestTimeout(config))
}

export function postAIRequest<T = unknown>(
  url: string,
  data?: unknown,
  config?: AIRequestConfig,
): Promise<T> {
  return httpService.post<T>(url, data, withAIRequestTimeout(config))
}

export function putAIRequest<T = unknown>(
  url: string,
  data?: unknown,
  config?: AIRequestConfig,
): Promise<T> {
  return httpService.put<T>(url, data, withAIRequestTimeout(config))
}
