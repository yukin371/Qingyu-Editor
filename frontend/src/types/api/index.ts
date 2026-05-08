/**
 * API 类型统一导出
 */

export * from './error'

// Re-export from main api.ts for convenience
export type {
  APIResponse,
  ErrorResponse,
  Pagination,
  PaginatedResponse,
  PaginationParams,
  RecommendationItem,
  RecommendationBehavior
} from '../api'
