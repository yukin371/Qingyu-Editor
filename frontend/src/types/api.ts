/**
 * API v1.3 基础类型定义
 * 统一响应格式，支持 timestamp 和 request_id
 */

// ==================== 基础响应类型 ====================

/**
 * 标准API响应格式 (v1.3)
 */
export interface APIResponse<T = any> {
  code: number
  message: string
  data?: T
  timestamp: number // Unix时间戳
  requestId?: string // 请求追踪ID
}

/**
 * 错误响应格式
 */
export interface ErrorResponse {
  code: number
  message: string
  details?: string // 详细错误信息
  timestamp: number
  requestId?: string
}

/**
 * 分页信息 (v1.3)
 */
export interface Pagination {
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

/**
 * 分页响应格式 (v1.3)
 */
export interface PaginatedResponse<T = any> {
  code: number
  message: string
  data: T[]
  pagination: Pagination
  timestamp: number
  requestId?: string
}

// ==================== 向后兼容类型 ====================

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
  size?: number // 兼容旧参数名
}

// ==================== 推荐系统基础类型 ====================
// 注意：详细类型定义在 recommendation.ts

export interface RecommendationItem {
  bookId: string
  title: string
  author: string
  cover?: string
  rating?: number
  reason?: string
  score?: number
}

export interface RecommendationBehavior {
  itemId: string
  behaviorType: 'view' | 'click' | 'collect' | 'purchase'
  context?: Record<string, unknown>
}
