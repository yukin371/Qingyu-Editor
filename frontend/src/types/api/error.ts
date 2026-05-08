/**
 * API 错误类型定义
 * 统一错误处理相关类型
 */

import type { FrontendErrorCode } from '@/utils/errorCode'

/**
 * API 错误详情
 */
export interface ApiErrorDetails {
  code?: string | number
  message?: string
  field?: string
  value?: unknown
  constraint?: string
}

/**
 * API 错误响应结构
 */
export interface ApiErrorResponse {
  code: number
  message: string
  error?: string
  details?: ApiErrorDetails[] | Record<string, unknown>
  timestamp: number | string
  requestId?: string
}

/**
 * 应用错误对象
 */
export interface AppError {
  code: FrontendErrorCode
  message: string
  details?: unknown
  statusCode?: number
  requestId?: string
  timestamp: number
  backendCode?: number
  errorInfo?: {
    title?: string
    message: string
    advice?: string
  }
}

/**
 * 错误处理选项
 */
export interface ErrorOptions {
  showMessage?: boolean
  messageType?: 'message' | 'notification'
  silent?: boolean
  logToConsole?: boolean
  onError?: (error: AppError) => void
  locale?: string
}

/**
 * Axios 错误响应数据
 */
export interface AxiosErrorResponseData {
  code?: number
  message?: string
  error?: string
  details?: unknown
  requestId?: string
  timestamp?: number | string
}

/**
 * 网络错误类型
 */
export type NetworkErrorCode =
  | 'ERR_NETWORK'
  | 'ERR_INTERNET_DISCONNECTED'
  | 'ECONNRESET'
  | 'ECONNABORTED'
  | 'ETIMEDOUT'

/**
 * 错误分类
 */
export enum ErrorCategory {
  NETWORK = 'network',
  AUTH = 'auth',
  VALIDATION = 'validation',
  BUSINESS = 'business',
  SYSTEM = 'system',
  UNKNOWN = 'unknown'
}

/**
 * 错误严重程度
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}
