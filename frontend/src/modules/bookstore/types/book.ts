// ==========================================
// Book Core (书籍核心)
// ==========================================

import type { ID, ISODate, BaseFilter } from './core'

export enum BookStatus {
  Draft = 'draft',
  Ongoing = 'ongoing',
  Completed = 'completed',
  Paused = 'paused',
}

// 对应 Go 中的 Book 结构体 (列表展示用)
// 注意：此处 JSON tag 为 camelCase
// 价格字段单位：分 (需要除以100转换为元显示)
export interface Book {
  id: ID
  title: string
  author: string
  authorId?: ID
  introduction: string
  cover: string
  categoryId?: ID
  categoryIds: ID[]
  categories: string[]
  tags: string[]
  status: BookStatus
  wordCount: number
  chapterCount: number
  price: number // 单位：分
  isFree: boolean
  isRecommended: boolean
  isFeatured: boolean
  isHot: boolean
  publishedAt?: ISODate
  lastUpdateAt?: ISODate
  createdAt: ISODate
  updatedAt: ISODate
}

// 书籍查询过滤器
export interface BookFilter extends BaseFilter {
  categoryId?: ID
  author?: string
  authorId?: ID
  status?: BookStatus
  isRecommended?: boolean
  isFeatured?: boolean
  isHot?: boolean
  isFree?: boolean
  tags?: string[]
  minPrice?: number
  maxPrice?: number
  keyword?: string
}

// 书籍总览统计
export interface BookStats {
  totalBooks: number
  ongoingBooks: number // 已发布且连载中的书籍
  draftBooks: number
  recommendedBooks: number
  featuredBooks: number
}
