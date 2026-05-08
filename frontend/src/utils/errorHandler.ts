/**
 * 全局错误处理工具
 * 集成错误码映射模块，支持后端6位数字错误码到前端字符串错误码的转换
 */
import { message, notification } from '@/design-system/services'
import type { AxiosError } from 'axios'
import type { APIResponse } from '@/types/api'
import {
  FrontendErrorCode,
  mapBackendCodeToFrontend,
  getErrorMessage,
  getErrorHandlingAdvice,
  type ErrorMessage
} from './errorCode'

// 重新导出错误码枚举，保持向后兼容
export { FrontendErrorCode as ErrorCode }

export interface ErrorOptions {
  showMessage?: boolean // 是否显示错误消息
  messageType?: 'message' | 'notification' // 消息显示类型
  silent?: boolean // 静默模式（不显示任何提示）
  logToConsole?: boolean // 是否打印到控制台
  onError?: (error: AppError) => void // 自定义错误处理
  locale?: string // 语言代码（用于国际化）
}

export interface AppError {
  code: FrontendErrorCode
  message: string
  details?: unknown
  statusCode?: number
  requestId?: string
  timestamp: number
  backendCode?: number
  errorInfo?: ErrorMessage
}

/**
 * 错误处理类
 */
export class ErrorHandler {
  private static defaultOptions: ErrorOptions = {
    showMessage: true,
    messageType: 'message',
    silent: false,
    logToConsole: true,
    locale: 'zh-CN'
  }

  /**
   * 处理错误
   */
  static handle(error: unknown, options: ErrorOptions = {}): AppError {
    const opts = { ...this.defaultOptions, ...options }
    const appError = this.parseError(error, opts.locale)

    // 打印到控制台
    if (opts.logToConsole && !opts.silent) {
      console.error('[Error Handler]', appError)
    }

    // 显示错误消息
    if (opts.showMessage && !opts.silent) {
      this.showError(appError, opts.messageType!)
    }

    // 自定义错误处理
    if (opts.onError) {
      opts.onError(appError)
    }

    return appError
  }

  /**
   * 解析错误
   */
  private static parseError(error: unknown, locale?: string): AppError {
    const timestamp = Date.now()

    // null 或 undefined
    if (error == null) {
      const errorInfo = getErrorMessage(FrontendErrorCode.UNKNOWN_ERROR, locale)
      return {
        code: FrontendErrorCode.UNKNOWN_ERROR,
        message: errorInfo.message,
        details: error,
        timestamp,
        errorInfo
      }
    }

    // Axios 错误
    if (this.isAxiosError(error)) {
      return this.parseAxiosError(error, timestamp, locale)
    }

    // API 响应错误（包含后端错误码）
    if (this.isApiError(error)) {
      return this.parseApiError(error, timestamp, locale)
    }

    // 普通错误对象
    if (error instanceof Error) {
      return {
        code: FrontendErrorCode.UNKNOWN_ERROR,
        message: error.message,
        details: error.stack,
        timestamp
      }
    }

    // 字符串错误
    if (typeof error === 'string') {
      return {
        code: FrontendErrorCode.UNKNOWN_ERROR,
        message: error,
        timestamp
      }
    }

    // 未知错误
    const errorInfo = getErrorMessage(FrontendErrorCode.UNKNOWN_ERROR, locale)
    return {
      code: FrontendErrorCode.UNKNOWN_ERROR,
      message: errorInfo.message,
      details: error,
      timestamp,
      errorInfo
    }
  }

  /**
   * 解析 Axios 错误
   */
  private static parseAxiosError(
    error: AxiosError,
    timestamp: number,
    locale?: string
  ): AppError {
    const statusCode = error.response?.status
    const responseData = error.response?.data as Record<string, unknown> | undefined

    // 网络错误
    if (!error.response) {
      const errorInfo = getErrorMessage(FrontendErrorCode.NETWORK_ERROR, locale)
      return {
        code: FrontendErrorCode.NETWORK_ERROR,
        message: error.message || errorInfo.message,
        timestamp,
        errorInfo
      }
    }

    // 尝试从响应数据中提取后端错误码
    const backendCode = responseData?.code
    if (backendCode && typeof backendCode === 'number' && backendCode !== 0) {
      // 使用新的错误码映射
      const frontendCode = mapBackendCodeToFrontend(backendCode, statusCode)
      const errorInfo = getErrorMessage(frontendCode, locale)

      return {
        code: frontendCode,
        message: (responseData?.message as string) || errorInfo.message,
        statusCode,
        requestId: responseData?.requestId as string | undefined,
        backendCode,
        details: responseData,
        timestamp,
        errorInfo
      }
    }

    // 根据HTTP状态码解析（兜底处理）
    return this.parseByHttpStatus(statusCode, responseData, timestamp, locale)
  }

  /**
   * 根据HTTP状态码解析错误
   */
  private static parseByHttpStatus(
    statusCode: number | undefined,
    responseData: Record<string, unknown> | undefined,
    timestamp: number,
    locale?: string
  ): AppError {
    switch (statusCode) {
      case 400: {
        const errorInfo = getErrorMessage(FrontendErrorCode.BAD_REQUEST, locale)
        return {
          code: FrontendErrorCode.BAD_REQUEST,
          message: (responseData?.message as string) || errorInfo.message,
          statusCode,
          details: responseData,
          requestId: responseData?.requestId as string | undefined,
          timestamp,
          errorInfo
        }
      }
      case 401: {
        const errorInfo = getErrorMessage(FrontendErrorCode.UNAUTHORIZED, locale)
        return {
          code: FrontendErrorCode.UNAUTHORIZED,
          message: (responseData?.message as string) || errorInfo.message,
          statusCode,
          details: responseData,
          requestId: responseData?.requestId as string | undefined,
          timestamp,
          errorInfo
        }
      }
      case 403: {
        const errorInfo = getErrorMessage(FrontendErrorCode.FORBIDDEN, locale)
        return {
          code: FrontendErrorCode.FORBIDDEN,
          message: (responseData?.message as string) || errorInfo.message,
          statusCode,
          details: responseData,
          requestId: responseData?.requestId as string | undefined,
          timestamp,
          errorInfo
        }
      }
      case 404: {
        const errorInfo = getErrorMessage(FrontendErrorCode.NOT_FOUND, locale)
        return {
          code: FrontendErrorCode.NOT_FOUND,
          message: (responseData?.message as string) || errorInfo.message,
          statusCode,
          details: responseData,
          requestId: responseData?.requestId as string | undefined,
          timestamp,
          errorInfo
        }
      }
      case 409: {
        const errorInfo = getErrorMessage(FrontendErrorCode.CONFLICT, locale)
        return {
          code: FrontendErrorCode.CONFLICT,
          message: (responseData?.message as string) || errorInfo.message,
          statusCode,
          details: responseData,
          requestId: responseData?.requestId as string | undefined,
          timestamp,
          errorInfo
        }
      }
      case 422: {
        const errorInfo = getErrorMessage(FrontendErrorCode.VALIDATION_ERROR, locale)
        return {
          code: FrontendErrorCode.VALIDATION_ERROR,
          message: (responseData?.message as string) || errorInfo.message,
          statusCode,
          details: responseData,
          requestId: responseData?.requestId as string | undefined,
          timestamp,
          errorInfo
        }
      }
      case 429: {
        const errorInfo = getErrorMessage(FrontendErrorCode.RATE_LIMITED, locale)
        return {
          code: FrontendErrorCode.RATE_LIMITED,
          message: (responseData?.message as string) || errorInfo.message,
          statusCode,
          details: responseData,
          requestId: responseData?.requestId as string | undefined,
          timestamp,
          errorInfo
        }
      }
      case 500: {
        const errorInfo = getErrorMessage(FrontendErrorCode.SERVER_ERROR, locale)
        return {
          code: FrontendErrorCode.SERVER_ERROR,
          message: (responseData?.message as string) || errorInfo.message,
          statusCode,
          details: responseData,
          requestId: responseData?.requestId as string | undefined,
          timestamp,
          errorInfo
        }
      }
      case 502:
      case 503: {
        const errorInfo = getErrorMessage(FrontendErrorCode.SERVICE_UNAVAILABLE, locale)
        return {
          code: FrontendErrorCode.SERVICE_UNAVAILABLE,
          message: (responseData?.message as string) || errorInfo.message,
          statusCode,
          details: responseData,
          requestId: responseData?.requestId as string | undefined,
          timestamp,
          errorInfo
        }
      }
      case 504: {
        const errorInfo = getErrorMessage(FrontendErrorCode.TIMEOUT, locale)
        return {
          code: FrontendErrorCode.TIMEOUT,
          message: (responseData?.message as string) || errorInfo.message,
          statusCode,
          details: responseData,
          requestId: responseData?.requestId as string | undefined,
          timestamp,
          errorInfo
        }
      }
      default: {
        const errorInfo = getErrorMessage(FrontendErrorCode.UNKNOWN_ERROR, locale)
        return {
          code: FrontendErrorCode.UNKNOWN_ERROR,
          message: (responseData?.message as string) || `请求失败 (${statusCode})`,
          statusCode,
          details: responseData,
          requestId: responseData?.requestId as string | undefined,
          timestamp,
          errorInfo
        }
      }
    }
  }

  /**
   * 解析 API 响应错误
   */
  private static parseApiError(
    error: APIResponse,
    timestamp: number,
    locale?: string
  ): AppError {
    // 检查是否包含后端错误码
    const backendCode = error.code
    if (typeof backendCode === 'number' && backendCode !== 0 && backendCode !== 200) {
      const frontendCode = mapBackendCodeToFrontend(backendCode)
      const errorInfo = getErrorMessage(frontendCode, locale)

      return {
        code: frontendCode,
        message: error.message || errorInfo.message,
        statusCode: backendCode,
        requestId: error.requestId,  // 添加requestId提取
        backendCode,
        details: error,
        timestamp,
        errorInfo
      }
    }

    // 默认处理
    const errorInfo = getErrorMessage(FrontendErrorCode.BAD_REQUEST, locale)
    return {
      code: FrontendErrorCode.BAD_REQUEST,
      message: error.message || errorInfo.message,
      statusCode: error.code,
      requestId: error.requestId,  // 添加requestId提取
      details: error,
      timestamp,
      errorInfo
    }
  }

  /**
   * 显示错误消息
   */
  private static showError(appError: AppError, type: 'message' | 'notification') {
    const errorMessage = this.getErrorMessage(appError)
    const title = appError.errorInfo?.title || '错误'

    if (type === 'notification') {
      notification.error(errorMessage, {
        title,
        duration: 4000
      })
    } else {
      message.error(errorMessage)
    }
  }

  /**
   * 获取用户友好的错误消息
   */
  private static getErrorMessage(appError: AppError): string {
    // 优先使用错误信息中的消息
    if (appError.errorInfo?.message) {
      return appError.errorInfo.message
    }

    // 兜底处理
    switch (appError.code) {
      case FrontendErrorCode.NETWORK_ERROR:
        return '网络连接失败，请检查网络设置'
      case FrontendErrorCode.TIMEOUT:
        return '请求超时，请稍后重试'
      case FrontendErrorCode.UNAUTHORIZED:
        return '登录已过期，请重新登录'
      case FrontendErrorCode.FORBIDDEN:
        return '没有权限执行此操作'
      case FrontendErrorCode.NOT_FOUND:
        return '请求的内容不存在'
      case FrontendErrorCode.SERVER_ERROR:
        return '服务器错误，请稍后重试'
      case FrontendErrorCode.SERVICE_UNAVAILABLE:
        return '服务暂时不可用，请稍后重试'
      default:
        return appError.message || '操作失败，请稍后重试'
    }
  }

  /**
   * 判断是否为 Axios 错误
   */
  private static isAxiosError(error: any): error is AxiosError {
    return error?.isAxiosError === true
  }

  /**
   * 判断是否为 API 错误
   */
  private static isApiError(error: any): error is APIResponse {
    return (
      error != null &&
      typeof error === 'object' &&
      'code' in error &&
      'message' in error &&
      'data' in error
    )
  }

  /**
   * 获取错误处理建议
   */
  static getAdvice(appError: AppError) {
    return getErrorHandlingAdvice(appError.code)
  }

  /**
   * 判断是否应该重试
   */
  static shouldRetry(appError: AppError): boolean {
    const advice = getErrorHandlingAdvice(appError.code)
    return advice.shouldRetry
  }

  /**
   * 判断是否需要登出
   */
  static shouldLogout(appError: AppError): boolean {
    const advice = getErrorHandlingAdvice(appError.code)
    return advice.shouldLogout
  }
}

/**
 * 全局错误处理函数（便捷方法）
 */
export function handleError(error: any, options?: ErrorOptions): AppError {
  return ErrorHandler.handle(error, options)
}

/**
 * 静默处理错误（不显示提示）
 */
export function handleErrorSilently(error: any): AppError {
  return ErrorHandler.handle(error, {
    silent: true,
    logToConsole: true
  })
}

/**
 * 异步错误包装器
 */
export async function catchAsync<T>(
  promise: Promise<T>,
  options?: ErrorOptions
): Promise<[AppError | null, T | null]> {
  try {
    const data = await promise
    return [null, data]
  } catch (error) {
    const appError = ErrorHandler.handle(error, options)
    return [appError, null]
  }
}

/**
 * 重试包装器
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    delay?: number
    shouldRetry?: (error: AppError) => boolean
  } = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000, shouldRetry } = options
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      const appError = handleErrorSilently(error)

      // 自定义重试判断
      if (shouldRetry && !shouldRetry(appError)) {
        throw lastError
      }

      // 使用错误处理建议
      if (!ErrorHandler.shouldRetry(appError)) {
        throw lastError
      }

      if (attempt < maxRetries) {
        const advice = ErrorHandler.getAdvice(appError)
        const retryDelay = advice.retryDelay || delay * attempt
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
      }
    }
  }

  throw lastError
}

/**
 * Vue 错误处理器
 */
export function createVueErrorHandler() {
  return (err: unknown, instance: any, info: string) => {
    console.error('[Vue Error]', {
      error: err,
      component: instance?.$options?.name || 'Unknown',
      info
    })

    // 将 unknown 转换为 Error
    const error = err instanceof Error ? err : new Error(String(err))
    handleError(error, {
      messageType: 'notification',
      showMessage: true
    })
  }
}

/**
 * Promise 拒绝处理器
 */
export function createPromiseRejectionHandler() {
  return (event: PromiseRejectionEvent) => {
    console.error('[Unhandled Promise Rejection]', event.reason)

    handleError(event.reason, {
      messageType: 'notification',
      showMessage: false,
      logToConsole: true
    })
  }
}

/**
 * 判断API响应是否为空数据
 * 用于区分"数据为空"和"加载错误"
 */
export function isEmptyData(response: any): boolean {
  if (!response) return false

  // 检查是否为成功的API响应
  if (response.code === 200 || response.code === 201 || response.code === 0) {
    // data为null或undefined
    if (response.data === null || response.data === undefined) {
      return true
    }

    // data为空数组
    if (Array.isArray(response.data) && response.data.length === 0) {
      return true
    }

    // 包含items字段且为空数组
    if (response.data?.items?.length === 0) {
      return true
    }

    // 包含books字段且为空数组
    if (response.data?.books?.length === 0) {
      return true
    }

    // 包含list字段且为空数组
    if (response.data?.list?.length === 0) {
      return true
    }
  }

  return false
}

/**
 * 判断是否为网络错误（可重试）
 */
export function isNetworkError(error: any): boolean {
  if (!error || error == null) return false

  // 没有响应（网络断开）
  if (!error.response) {
    return true
  }

  // 超时
  if (error.code === 'ECONNABORTED') {
    return true
  }

  // 网络错误代码
  if (
    error.code === 'ERR_NETWORK' ||
    error.code === 'ERR_INTERNET_DISCONNECTED' ||
    error.code === 'ECONNRESET'
  ) {
    return true
  }

  return false
}

/**
 * 判断是否为权限错误（不可重试，需要登录）
 */
export function isPermissionError(error: any): boolean {
  if (!error || error == null) return false

  // 检查是否是AppError
  if (error.code && typeof error.code === 'string') {
    return (
      error.code === FrontendErrorCode.UNAUTHORIZED ||
      error.code === FrontendErrorCode.FORBIDDEN ||
      error.code === FrontendErrorCode.TOKEN_EXPIRED ||
      error.code === FrontendErrorCode.TOKEN_INVALID
    )
  }

  const status = error.response?.status
  return status === 401 || status === 403
}

/**
 * 判断是否为服务器错误（可重试）
 */
export function isServerError(error: any): boolean {
  if (!error || error == null) return false

  // 检查是否是AppError
  if (error.code && typeof error.code === 'string') {
    return (
      error.code === FrontendErrorCode.SERVER_ERROR ||
      error.code === FrontendErrorCode.SERVICE_UNAVAILABLE ||
      error.code === FrontendErrorCode.EXTERNAL_ERROR
    )
  }

  const status = error.response?.status
  return status !== undefined && status >= 500
}

/**
 * 判断是否为客户端错误（不可重试）
 */
export function isClientError(error: any): boolean {
  if (!error || error == null) return false

  // 检查是否是AppError
  if (error.code && typeof error.code === 'string') {
    const clientErrors = [
      FrontendErrorCode.BAD_REQUEST,
      FrontendErrorCode.NOT_FOUND,
      FrontendErrorCode.CONFLICT,
      FrontendErrorCode.VALIDATION_ERROR,
      FrontendErrorCode.RESOURCE_EXISTS,
      FrontendErrorCode.RESOURCE_GONE
    ]
    return clientErrors.includes(error.code as FrontendErrorCode)
  }

  const status = error.response?.status
  return status !== undefined && status >= 400 && status < 500
}

/**
 * 处理后端错误码（便捷方法）
 * 用于直接处理后端返回的错误码
 */
export function handleBackendError(
  backendCode: number,
  message?: string,
  options?: ErrorOptions
): AppError {
  const frontendCode = mapBackendCodeToFrontend(backendCode)
  const errorInfo = getErrorMessage(frontendCode, options?.locale)

  const appError: AppError = {
    code: frontendCode,
    message: message || errorInfo.message,
    backendCode,
    timestamp: Date.now(),
    errorInfo
  }

  if (options?.showMessage !== false && !options?.silent) {
    ErrorHandler.handle(appError, options)
  }

  return appError
}

// 默认导出
export default {
  ErrorHandler,
  handleError,
  handleErrorSilently,
  handleBackendError,
  catchAsync,
  retry,
  createVueErrorHandler,
  createPromiseRejectionHandler,
  isEmptyData,
  isNetworkError,
  isPermissionError,
  isServerError,
  isClientError,
  FrontendErrorCode
}
