// ==========================================
// 通用基础类型
// ==========================================

export type ID = string
export type ISODate = string // "2024-11-28T20:00:00Z"

// API 分页请求基础接口
export interface BaseFilter {
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
