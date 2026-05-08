/**
 * src/types/api.d.ts
 * 通用API类型定义
 */

import 'axios'

// --- 响应结构定义 ---

/**
 * 统一响应体格式 (Envelope)
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp?: number
  request_id?: string
}

/**
 * 分页数据结构 (Standard Pagination)
 * 注意：字段名需与后端保持一致，如后端用 'rows' 需改为 'rows'
 */
export interface PaginationData<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages?: number // 可选，因为可以通过 total/pageSize 计算
}

/**
 * 分页响应快捷类型
 * 使用示例: Promise<PageResult<User>>
 */
export type PageResult<T> = ApiResponse<PaginationData<T>>

// --- 请求参数定义 ---

/**
 * 基础分页请求参数
 */
export interface PaginationParams {
  page?: number // 当前页码
  pageSize?: number // 每页条数
}

/**
 * 排序方向
 */
export type SortOrder = 'asc' | 'desc' | null

/**
 * 排序参数
 */
export interface SortParams {
  sortBy?: string
  sortOrder?: SortOrder
}

/**
 * 组合查询参数 (分页 + 排序 + 搜索)
 * 泛型 F 用于扩展额外的过滤字段
 */
export type SearchParams<F = Record<string, any>> = PaginationParams & SortParams & F

// --- 错误定义 ---

/**
 * 业务错误对象
 */
export interface ApiError {
  code: number
  message: string
  details?: Record<string, any> // 具体的字段验证错误信息
}

// --- Axios 模块扩展 ---

declare module 'axios' {
  // 扩展 AxiosRequestConfig 以支持自定义配置
  export interface AxiosRequestConfig {
    /** 是否跳过默认错误提示 (默认: false) */
    skipErrorHandler?: boolean
    /** 是否静默模式（不显示任何 UI 反馈，如 Loading/Message）(默认: false) */
    silent?: boolean
    /** 是否开启请求去重 (默认: false) */
    deduplicate?: boolean
    /** 失败重试次数 (默认: 0) */
    retry?: number
    /** 重试延迟 (ms) (默认: 1000) */
    retryDelay?: number
    /** GET 请求是否开启缓存 (默认: false, 会加 _t) */
    keepCache?: boolean
    /** 是否为文件上传 (自动设置 multipart/form-data) */
    isUpload?: boolean
    /** 是否返回完整 ApiResponse 结构 (默认: false, 仅返回 data.data) */
    returnFullResponse?: boolean

    /** 内部使用的重试计数器 (用户无需传递) */
    __retryCount?: number
  }
}
