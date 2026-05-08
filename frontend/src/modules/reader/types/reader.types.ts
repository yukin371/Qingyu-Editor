/**
 * Reader Types
 */

import type { BookBrief } from '@/modules/bookstore/types/bookstore.types'

/**
 * Chapter
 */
export interface Chapter {
  id: string
  bookId: string
  title: string
  chapterNumber: number
  wordCount?: number
  isPaid?: boolean
  price?: number
  publishTime?: number
  isLocked?: boolean
}

/**
 * Chapter Content
 */
export interface ChapterContent {
  id: string
  title: string
  content: string
  bookId: string
  chapterNumber: number
  wordCount?: number
  isPaid?: boolean
  isUnlocked?: boolean
  prevChapterId?: string
  nextChapterId?: string
}

/**
 * Reading Progress
 */
export interface ReadingProgress {
  bookId: string
  chapterId: string
  progressPercent: number
  lastReadTime: number
  readDuration: number
}

/**
 * Save Progress Parameters
 */
export interface SaveProgressParams {
  book_id: string
  chapter_id: string
  progress_percent: number
  read_duration: number
}

/**
 * Reading Settings
 */
export interface ReadingSettings {
  fontSize: number
  lineHeight: number
  theme: 'light' | 'dark' | 'sepia'
  fontFamily: string
  pageWidth: number
}

/**
 * Bookshelf Item
 */
export interface BookshelfItem {
  book: BookBrief
  addTime: number
  lastReadTime?: number
  hasUpdate?: boolean
  progress?: ReadingProgress
}

/**
 * Reading History Item
 */
export interface ReadingHistoryItem {
  id: string
  book: BookBrief
  chapter: Chapter
  readTime: number
  duration: number
}

/**
 * Bookmark
 */
export interface Bookmark {
  id: string
  bookId: string
  chapterId: string
  chapterTitle: string
  content: string
  note?: string
  createTime: number
}

/**
 * Comment
 */
export interface Comment {
  id: string
  bookId: string
  chapterId?: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  rating?: number
  likes: number
  createTime: number
  replies?: Comment[]
  isLiked?: boolean
}

/**
 * Rating
 */
export interface Rating {
  bookId: string
  userId: string
  score: number
  comment?: string
  createTime: number
}

