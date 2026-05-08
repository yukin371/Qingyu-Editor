/**
 * Bookstore API Response Types
 * API响应类型定义
 */

import type { APIResponse } from '@/types/api'

// ==================== 分页响应类型 ====================

/**
 * 后端分页响应格式
 */
export interface BackendPaginatedResponse<T> {
  code: number
  message: string
  data: T[]
  total: number
  page: number
  size: number
}

/**
 * 前端统一的分页响应格式
 */
export interface PaginationResponse<T> {
  code: number
  message: string
  data: T[]
  timestamp: number
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

/**
 * 带分页的API响应（简化版）
 */
export interface PaginatedAPIResponse extends APIResponse<{
  list: any[]
  total: number
  page: number
  size: number
}> {}

// ==================== 重新导出API类型 ====================

export type { APIResponse } from '@/types/api'
