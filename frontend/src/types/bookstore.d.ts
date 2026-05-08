/**
 * 书城相关类型定义
 */

import type { PaginationResponse } from './api'

// ============ 书籍相关 ============

/**
 * 书籍基础信息
 */
export interface Book {
  id: string
  title: string
  author: string
  authorId?: string
  coverUrl: string
  description: string
  categoryId: string
  categoryName?: string
  tags?: string[]
  status: 'ongoing' | 'completed' | 'hiatus'
  wordCount: number
  chapterCount: number
  viewCount: number
  likeCount: number
  collectCount: number
  commentCount: number
  rating: number
  isPaid: boolean
  price?: number
  createdAt: string
  updatedAt: string
  lastChapterTitle?: string
  lastChapterUpdatedAt?: string
}

/**
 * 书籍详情
 */
export interface BookDetail extends Book {
  chapters?: Chapter[]
  relatedBooks?: Book[]
  authorInfo?: {
    id: string
    username: string
    nickname?: string
    avatar?: string
    bio?: string
  }
}

/**
 * 章节信息
 */
export interface Chapter {
  id: string
  bookId: string
  title: string
  chapterNumber: number
  wordCount: number
  isFree: boolean
  price?: number
  publishedAt: string
  updatedAt: string
}

// ============ 分类相关 ============

/**
 * 分类
 */
export interface Category {
  id: string
  name: string
  description?: string
  parentId?: string
  level: number
  icon?: string
  bookCount: number
  sortOrder: number
  children?: Category[]
  createdAt: string
  updatedAt: string
}

// ============ Banner相关 ============

/**
 * Banner
 */
export interface Banner {
  id: string
  title: string
  imageUrl: string
  linkUrl?: string
  linkType: 'book' | 'category' | 'external' | 'none'
  targetId?: string
  position: number
  startTime: string
  endTime: string
  clickCount: number
  viewCount: number
  isActive: boolean
  createdAt: string
}

// ============ 排行榜相关 ============

/**
 * 排行榜项
 */
export interface RankingItem {
  rank: number
  book: Book
  score: number
  change?: number // 排名变化，正数表示上升，负数表示下降
}

// ============ 首页数据 ============

/**
 * 首页数据
 */
export interface HomepageData {
  banners: Banner[]
  recommendedBooks: Book[]
  featuredBooks: Book[]
  categories: Category[]
  hotRankings?: RankingItem[]
  newBooks?: Book[]
}

// ============ 搜索相关 ============

/**
 * 搜索参数
 */
export interface SearchParams {
  keyword?: string
  categoryId?: string
  tags?: string[]
  status?: 'ongoing' | 'completed' | 'hiatus'
  isPaid?: boolean
  minWordCount?: number
  maxWordCount?: number
  sortBy?: 'viewCount' | 'likeCount' | 'rating' | 'updatedAt' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export { PaginationResponse }

