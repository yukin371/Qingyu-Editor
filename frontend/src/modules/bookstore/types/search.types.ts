// ==========================================
// 搜索相关类型定义
// ==========================================

import type { BookBrief } from './bookstore.types'

/**
 * 作者卡片信息
 */
export interface AuthorCard {
  id: string
  name: string
  avatar: string
  bio: string
  book_count: number
  total_words: number
  follower_count: number
}

/**
 * 搜索结果项类型
 */
export type SearchResultItem = AuthorCard

/**
 * 搜索类型
 */
export type SearchType = 'book' | 'author'

/**
 * 搜索状态
 */
export type SearchStatus = 'idle' | 'loading' | 'success' | 'error'

// ==========================================
// 流式搜索类型定义
// ==========================================

/**
 * 流式消息类型
 */
export type StreamMessageType = 'meta' | 'data' | 'progress' | 'error' | 'done'

/**
 * 流式消息基础接口
 */
export interface StreamMessageBase {
  type: StreamMessageType
}

/**
 * Meta消息 - 包含元数据
 */
export interface StreamMetaMessage extends StreamMessageBase {
  type: 'meta'
  cursor: string
  total: number | null
  hasMore: boolean
}

/**
 * Data消息 - 包含数据
 */
export interface StreamDataMessage extends StreamMessageBase {
  type: 'data'
  books: BookBrief[]
}

/**
 * Progress消息 - 包含进度信息
 */
export interface StreamProgressMessage extends StreamMessageBase {
  type: 'progress'
  loaded: number
  total: number
}

/**
 * Error消息 - 包含错误信息
 */
export interface StreamErrorMessage extends StreamMessageBase {
  type: 'error'
  error: string
}

/**
 * Done消息 - 流结束
 */
export interface StreamDoneMessage extends StreamMessageBase {
  type: 'done'
  cursor: string
  total: number
  hasMore: boolean
}

/**
 * 流式消息联合类型
 */
export type StreamMessage =
  | StreamMetaMessage
  | StreamDataMessage
  | StreamProgressMessage
  | StreamErrorMessage
  | StreamDoneMessage

/**
 * 流式搜索选项
 */
export interface StreamOptions {
  limit?: number
  initialCursor?: string
  onUpdate?: (data: StreamUpdate) => void
  onComplete?: (result: StreamResult) => void
  onError?: (error: Error) => void
}

/**
 * 流式更新数据
 */
export interface StreamUpdate {
  type: 'meta' | 'data' | 'progress' | 'error'
  cursor?: string
  books?: BookBrief[]
  loaded?: number
  total?: number
  hasMore?: boolean
  error?: string
}

/**
 * 流式搜索结果
 */
export interface StreamResult {
  cursor: string
  total: number
  hasMore: boolean
  items: BookBrief[] | AuthorCard[]
}

/**
 * 分类简略信息（用于搜索过滤）
 */
export interface CategorySimple {
  id: string
  name: string
}
