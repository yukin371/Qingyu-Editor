/**
 * 阅读器系统类型定义 (v1.3)
 * 基于 doc/api/frontend/阅读器API参考.md
 */

import type { BookBrief } from './bookstore'

// ==================== 章节相关 ====================

/**
 * 章节信息
 */
export interface Chapter {
  id: string
  bookId: string
  title: string
  chapterNum: number
  wordCount: number
  isFree: boolean
  price: number
  canAccess?: boolean
  accessReason?: string
  publishTime?: string
  publishedAt?: string
  updateTime?: string
  updatedAt?: string
  locked?: boolean
  prevChapterId: string | null
  nextChapterId: string | null
  content?: string
  paragraphs?: ChapterParagraph[]
}

/**
 * 章节内容
 */
export interface ChapterParagraph {
  id: string
  paragraphOrder: number
  content: string
  format?: string
  wordCount?: number
}

/**
 * 章节内容
 */
export interface ChapterContent {
  id: string
  bookId: string
  title: string
  content: string
  chapterNum: number
  wordCount: number
  publishTime?: string
  publishedAt?: string
  prevChapterId: string | null
  nextChapterId: string | null
  paragraphs?: ChapterParagraph[]
}

/**
 * 章节列表项
 */
export interface ChapterListItem {
  id: string
  title: string
  chapterNum: number
  wordCount: number
  isFree: boolean
  price: number
  canAccess?: boolean
  accessReason?: string
  isRead?: boolean
  publishTime?: string
  publishedAt?: string
}

/**
 * 章节导航
 */
export interface ChapterNavigation {
  current: Chapter
  prev: Chapter | null
  next: Chapter | null
}

// ==================== 评论相关 ⭐️v1.3新增 ====================

/**
 * 用户简要信息
 */
export interface UserBrief {
  id: string
  username: string
  nickname: string
  avatar: string
  level?: number
}

/**
 * 评论信息
 */
export interface Comment {
  id: string
  bookId: string
  chapterId?: string
  userId: string
  user: UserBrief
  content: string
  rating?: number
  likeCount: number
  isLiked: boolean // 当前用户是否点赞
  replyCount: number
  parentId?: string
  replies?: Comment[]
  createdAt: string
  updatedAt?: string
  createTime?: string // 兼容旧字段
}

/**
 * 获取评论列表参数
 */
export interface GetCommentListParams {
  book_id: string
  chapter_id?: string
  sortBy?: 'time' | 'likes' | 'hot'
  page?: number
  page_size?: number
}

/**
 * 评论列表响应
 */
export interface CommentListResponse {
  comments: Comment[]
  total: number
  page: number
  page_size: number
  has_next: boolean
}

/**
 * 发表评论参数
 */
export interface CreateCommentParams {
  book_id: string
  chapter_id?: string
  content: string
  rating?: number
  parent_id?: string
}

/**
 * 更新评论参数
 */
export interface UpdateCommentParams {
  content: string
}

/**
 * 回复评论参数
 */
export interface ReplyCommentParams {
  content: string
}

// ==================== 阅读进度相关 ====================

/**
 * 阅读进度
 */
export interface ReadingProgress {
  id: string
  userId: string
  bookId: string
  chapterId: string
  chapterTitle: string
  progress: number // 0-100
  scrollPosition: number
  updateTime?: string
  updatedAt?: string
}

/**
 * 进度保存数据
 */
export interface ProgressSaveData {
  bookId: string
  chapterId: string
  progress: number // 0-100
  scrollPosition?: number
}

/**
 * 阅读历史
 */
export interface ReadingHistory {
  id: string
  bookId: string
  book: BookBrief
  chapterId: string
  chapterTitle: string
  readTime: string
  duration: number
}

/**
 * 阅读时长数据
 */
export interface ReadingTimeData {
  bookId: string
  duration: number // 秒
}

/**
 * 阅读统计
 */
export interface ReadingStats {
  totalReadingTime: number
  totalBooks: number
  totalChapters: number
  averageReadingTime: number
  favoriteCategory: string
  recentBooks: BookBrief[]
}

// ==================== 书签/注记相关 ====================

/**
 * 注记类型
 */
export type AnnotationType = 'bookmark' | 'highlight' | 'note'

/**
 * 注记/书签数据
 */
export interface Annotation {
  id?: string
  bookId: string
  chapterId: string
  type: AnnotationType
  text: string
  note?: string
  range?: string
  color?: string
  createTime?: string
  updateTime?: string
  updatedAt?: string
}

/**
 * 书签（简化版）
 */
export interface Bookmark {
  id: string
  bookId: string
  chapterId: string
  chapterTitle: string
  position: number
  note?: string
  createdAt: string
}

/**
 * 注记统计
 */
export interface AnnotationStats {
  totalCount: number
  bookmarkCount: number
  highlightCount: number
  noteCount: number
}

// ==================== 阅读设置相关 ====================

/**
 * 阅读主题
 */
export type ReadingTheme = 'light' | 'dark' | 'sepia' | 'night' | 'eye-care' | 'parchment'

/**
 * 阅读设置
 */
export interface ReadingSettings {
  theme: ReadingTheme
  fontFamily: string
  fontSize: number // 12-32
  lineHeight: number // 1.2-2.5
  pageWidth: number // 60-100 (percent)
  pageMode: 'scroll' | 'click' | 'slide'
  autoRead: boolean
  autoReadSpeed: number // 1-10
  enableConvert: boolean
  eyeCare: boolean
  keepScreenOn: boolean
}

// ==================== 书架相关 ====================

/**
 * 书架书籍
 */
export interface ShelfBook {
  id: string
  userId: string
  bookId: string
  book: BookBrief
  lastReadChapterId?: string
  lastReadChapterTitle?: string
  progress: number
  addTime: string
  updateTime?: string
  updatedAt?: string
}

// ==================== 评分相关 ====================

/**
 * 评分
 */
export interface Rating {
  id: string
  userId: string
  user: UserBrief
  bookId: string
  score: number // 1-5
  content?: string
  createTime: string
  updateTime?: string
  updatedAt?: string
  likeCount: number
  isLiked?: boolean
}

// ==================== 段落评论相关 ⭐️新增 ====================

/**
 * 段落评论
 */
export interface ParagraphComment {
  id: string
  paragraphId: string
  chapterId: string
  paragraphIndex: number
  userId: string
  username: string
  avatar: string
  content?: string
  emoji?: string
  likes: number
  likedByMe: boolean
  replyToCommentId?: string
  replyToUsername?: string
  createdAt: string
  updatedAt: string
}

/**
 * 段落评论摘要
 */
export interface ParagraphCommentSummary {
  paragraphId: string
  commentCount: number
  latestComment?: {
    content: string
    username: string
    time: string
  }
}
