/**
 * Core API Types
 * 核心API相关类型定义
 */

import type { AxiosRequestConfig } from 'axios'

// ==================== 基础响应类型 ====================

/**
 * 标准API响应格式
 */
export interface APIResponse<T = any> {
  code: number
  message: string
  data?: T
  timestamp: number
  requestId?: string
}

/**
 * 错误响应格式
 */
export interface ErrorResponse {
  code: number
  message: string
  details?: string
  timestamp: number
  requestId?: string
}

// ==================== 请求配置类型 ====================

/**
 * HTTP请求配置扩展
 * 扩展 AxiosRequestConfig 添加自定义选项
 */
export interface RequestConfig extends AxiosRequestConfig {
  /** 是否跳过错误处理 */
  skipErrorHandler?: boolean
  /** 是否跳过认证 */
  skipAuth?: boolean
  /** 自定义超时时间 */
  customTimeout?: number
  /** 请求重试次数 */
  retryTimes?: number
  /** 请求重试延迟 */
  retryDelay?: number
  /** 是否为上传请求 */
  isUpload?: boolean
  /** 是否静默模式 */
  silent?: boolean
  /** 是否去重 */
  deduplicate?: boolean
  /** 重试配置 */
  retry?: number
  /** 是否返回完整响应 */
  returnFullResponse?: boolean
  /** 是否保持缓存 */
  keepCache?: boolean
  /** 是否跳过大小写转换 */
  skipCaseConversion?: boolean
}

/**
 * HTTP服务配置
 */
export interface HttpConfig {
  /** API基础URL */
  baseURL: string
  /** 请求超时时间（毫秒） */
  timeout?: number
  /** 默认请求头 */
  headers?: Record<string, string>
}

/**
 * 请求拦截器配置
 */
export interface RequestInterceptorConfig {
  /** 请求URL */
  url?: string
  /** 请求方法 */
  method?: string
  /** 请求参数 */
  params?: any
  /** 请求数据 */
  data?: any
}

// ==================== API适配器类型 ====================

/**
 * API调用选项
 */
export interface ApiCallOptions {
  /** 是否使用新API */
  useNewApi?: boolean
  /** 是否启用降级 */
  fallbackToOld?: boolean
  /** 超时时间 */
  timeout?: number
}

// ==================== 网关类型 ====================

/**
 * API模块名
 */
export type ApiModuleName =
  | 'bookstore'
  | 'reader'
  | 'user'
  | 'shared'
  | 'writer'
  | 'recommendation'
  | 'admin'
  | 'finance'
  | 'discovery'
  | 'community'
  | 'booklist'
  | 'readingStats'

/**
 * API调用结果
 */
export interface ApiCallResult<T = any> {
  success: boolean
  data?: T
  error?: Error
  apiType?: 'new' | 'old'
}

// ==================== 认证相关类型 ====================

/**
 * Token信息
 */
export interface TokenInfo {
  /** 访问令牌 */
  token: string
  /** 刷新令牌 */
  refreshToken: string
  /** 过期时间 */
  expiresAt: number
}

// ==================== 重新导出常用类型 ====================

export type { APIResponse as DefaultAPIResponse } from '@/types/api'
