/**
 * 模型类型统一导出
 */

export interface BaseModel {
  id: string
  createdAt?: string
  updatedAt?: string
}

export interface ChapterListItem extends BaseModel {
  title: string
  isFree: boolean
  wordCount: number
  isRead?: boolean
}

export interface BookBrief extends BaseModel {
  title: string
  author: string
  cover: string
  rating?: number
  tags?: string[]
}

// Re-export browse types
export type { BrowseFilters } from './browse'
