/**
 * Reader API Wrapper
 * 将orval生成的工厂模式API转换为更易使用的格式
 *
 * 使用方式：
 * import * as readerAPI from '@/modules/reader/api'
 * const books = await readerAPI.getBooks({ page: 1, size: 20 })
 */

import { getApi } from './generated/reader'
import type { APIResponse, PaginatedResponse } from '@/types/api'
import { httpService } from '@/core/services/http.service'

// 获取生成的API对象
const api = getApi()

// ==================== 类型定义 ====================

/**
 * 章节
 */
export interface Chapter {
  id: string
  bookId: string
  chapterNumber: number
  title: string
  content?: string
  wordCount?: number
  publishedAt?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * 章节内容
 */
export interface ChapterContent {
  chapter: Chapter
  content: string
  nextChapter?: Chapter
  prevChapter?: Chapter
}

/**
 * 章节列表项
 */
export interface ChapterListItem {
  id: string
  chapterNumber: number
  title: string
  wordCount?: number
  publishedAt?: string
}

/**
 * 阅读进度
 */
export interface ReadingProgress {
  bookId: string
  chapterId: string
  chapterNumber: number
  progress: number
  lastReadTime: string
}

/**
 * 阅读历史
 */
export interface ReadingHistory {
  id: string
  bookId: string
  chapterId: string
  position: number
  duration?: number
  timestamp: string
}

/**
 * 阅读设置
 */
export interface ReadingSettings {
  fontSize: number
  lineHeight: number
  theme: 'light' | 'dark' | 'sepia'
  fontFamily: string
  autoScroll?: boolean
  scrollSpeed?: number
}

/**
 * 注记类型
 */
export type AnnotationType = 'bookmark' | 'highlight' | 'note'

/**
 * 注记
 */
export interface Annotation {
  id: string
  bookId: string
  chapterId: string
  type: AnnotationType
  position: number
  length?: number
  content?: string
  note?: string
  color?: string
  createTime: string
  updateTime: string
}

/**
 * 注记统计
 */
export interface AnnotationStats {
  total: number
  bookmarks: number
  highlights: number
  notes: number
}

// ==================== 书籍相关 API ====================

export const getBooks = api.getApiV1ReaderBooks
export const getBookInfo = api.getApiV1ReaderBooksBookIdLikeInfo
export const addBookToShelf = api.postApiV1ReaderBooksBookId
export const removeBookFromShelf = api.deleteApiV1ReaderBooksBookId
export const likeBook = api.postApiV1ReaderBooksBookIdLike
export const unlikeBook = api.deleteApiV1ReaderBooksBookIdLike
export const updateBookStatus = api.putApiV1ReaderBooksBookIdStatus
export const getFinishedBooks = api.getApiV1ReaderBooksFinished
export const getRecentBooks = api.getApiV1ReaderBooksRecent
export const getUnfinishedBooks = api.getApiV1ReaderBooksUnfinished

// ==================== 章节相关 API ====================

export const getBookChapters = api.getApiV1ReaderBooksBookIdChapters
export const getChapterInfo = api.getApiV1ReaderChaptersChapterIdInfo
export const getNextChapter = api.getApiV1ReaderBooksBookIdChaptersChapterIdNext
export const getPreviousChapter = api.getApiV1ReaderBooksBookIdChaptersChapterIdPrevious
export const purchaseChapter = api.postApiV1ReaderChaptersIdPurchase

/**
 * 获取章节内容（阅读器权限控制接口）
 * 兼容旧API: getChapterContent(bookId, chapterId)
 */
export async function getChapterContent(
  bookId: string,
  chapterId: string
): Promise<APIResponse<ChapterContent>> {
  return httpService.get<APIResponse<ChapterContent>>(
    `/api/v1/reader/books/${bookId}/chapters/${chapterId}`
  ) as any
}

/**
 * 根据章节号获取章节
 * 兼容旧API: getChapterByNumber(bookId, chapterNum)
 */
export async function getChapterByNumber(
  bookId: string,
  chapterNum: number
): Promise<APIResponse<Chapter>> {
  return api.getApiV1ReaderBooksBookIdChaptersByNumberChapterNum(
    bookId,
    chapterNum
  ) as any
}

// ==================== 书签相关 API ====================

export const getBookmarks = api.getApiV1ReaderBookmarks

/**
 * 获取用户书签（别名）
 */
export const getUserBookmarks = getBookmarks
export const getBookmark = api.getApiV1ReaderBookmarksId
export const addBookToBookmarks = api.postApiV1ReaderBooksBookIdBookmarks
export const updateBookmark = api.putApiV1ReaderBookmarksId
export const deleteBookmark = api.deleteApiV1ReaderBookmarksId

// ==================== 阅读进度相关 API ====================

export const saveReadingProgress = api.postApiV1ReaderProgress

/**
 * 获取阅读进度
 * 兼容旧API: getProgress(bookId)
 */
export async function getProgress(bookId: string): Promise<APIResponse<ReadingProgress>> {
  return api.getApiV1ReaderProgressBookId(bookId) as any
}

// 别名，保持兼容性
export const getReadingProgress = getProgress

export const mergeProgress = api.postApiV1ReaderProgressMerge
export const syncProgress = api.postApiV1ReaderProgressSync

/**
 * 保存阅读进度（别名，兼容旧API）
 */
export async function saveProgress(progressData: {
  bookId: string
  chapterId: string
  chapterNumber: number
  progress: number
}): Promise<APIResponse<ReadingProgress>> {
  return saveReadingProgress(progressData as any) as any
}

/**
 * 更新阅读时长
 * 兼容旧API: updateReadingTime(timeData)
 */
export async function updateReadingTime(timeData: {
  bookId: string
  chapterId: string
  duration: number
}): Promise<APIResponse<void>> {
  return api.putApiV1ReaderProgressReadingTime({
    bookId: timeData.bookId,
    duration: timeData.duration,
  } as any) as any
}

/**
 * 获取阅读历史
 * 兼容旧API: getReadingHistory(page, size)
 */
export async function getReadingHistory(
  page: number = 1,
  size: number = 20
): Promise<PaginatedResponse<ReadingHistory>> {
  return api.getApiV1ReaderReadingHistory({ page, size } as any) as any
}

/**
 * 清除阅读历史
 * 兼容旧API: clearReadingHistory()
 */
export async function clearReadingHistory(): Promise<APIResponse<void>> {
  return api.deleteApiV1ReaderReadingHistory() as any
}

/**
 * 清除阅读历史（别名，兼容旧API: clearHistory）
 */
export const clearHistory = clearReadingHistory

/**
 * 删除单条阅读历史
 * 兼容旧API: deleteHistory(id)
 */
export async function deleteHistory(id: string): Promise<APIResponse<void>> {
  return api.deleteApiV1ReaderReadingHistoryId(id) as any
}

/**
 * 获取总阅读时长统计
 * 兼容旧API: getTotalReadingTime()
 */
export async function getTotalReadingTime(): Promise<APIResponse<{
  totalTime: number
  todayTime: number
  weekTime: number
}>> {
  return api.getApiV1ReaderReadingHistoryStats({} as any) as any
}

// ==================== 阅读行为/历史 API ====================

export const recordReadingBehavior = api.postApiV1ReaderBehavior

// ==================== 标注相关 API ====================

export const getAnnotations = api.getApiV1ReaderAnnotationsBook
export const getChapterAnnotations = api.getApiV1ReaderAnnotationsChapter
export const createAnnotation = api.postApiV1ReaderAnnotations
export const updateAnnotation = api.putApiV1ReaderAnnotationsId
export const deleteAnnotation = api.deleteApiV1ReaderAnnotationsId
export const getRecentAnnotations = api.getApiV1ReaderAnnotationsRecent

/**
 * 获取书籍注记列表
 * 兼容旧API: getBookAnnotations(bookId, type, page, size)
 */
export async function getBookAnnotations(
  bookId: string,
  type: AnnotationType | '' = '',
  page: number = 1,
  size: number = 20
): Promise<PaginatedResponse<Annotation>> {
  return api.getApiV1ReaderAnnotationsBook({
    bookId,
    type: type || undefined,
    page,
    size,
  } as any) as any
}

/**
 * 获取注记统计
 * 兼容旧API: getAnnotationStats()
 */
export async function getAnnotationStats(): Promise<APIResponse<AnnotationStats>> {
  return api.getApiV1ReaderAnnotationsStats({} as any) as any
}

/**
 * 批量创建注记
 * 兼容旧API: batchCreateAnnotations(annotations)
 */
export async function batchCreateAnnotations(
  annotations: Omit<Annotation, 'id' | 'createTime' | 'updateTime'>[]
): Promise<APIResponse<{
  successCount: number
  failedCount: number
}>> {
  return api.postApiV1ReaderAnnotationsBatch({ annotations } as any) as any
}

// ==================== 收藏相关 API ====================

export const getCollections = api.getApiV1ReaderCollections

// ==================== 评论相关 API ====================

/**
 * 获取书籍评论列表
 */
export async function getBookComments(params: {
  bookId: string
  page?: number
  size?: number
  sort?: 'latest' | 'hot'
}): Promise<any> {
  return api.getApiV1ReaderComments({
    book_id: params.bookId,
    page: params.page || 1,
    size: params.size || 20,
    sortBy: params.sort || 'latest',
  } as any)
}

/**
 * 创建评论
 */
export async function createComment(data: {
  bookId: string
  chapterId?: string
  content: string
  rating?: number
}): Promise<any> {
  return api.postApiV1ReaderComments({
    book_id: data.bookId,
    chapter_id: data.chapterId,
    content: data.content,
    rating: data.rating,
  } as any)
}

/**
 * 删除评论
 */
export async function deleteComment(commentId: string): Promise<any> {
  return api.deleteApiV1ReaderCommentsId(commentId)
}

// ==================== 其他便捷方法 ====================

/**
 * 添加到书架（别名）
 */
export const addToBookshelf = addBookToShelf

/**
 * 获取第一章
 */
export async function getFirstChapter(bookId: string): Promise<any> {
  return api.getApiV1BookstoreBooksIdChaptersFirst(bookId) as any
}

// ==================== 阅读设置相关 API ====================

/**
 * 获取阅读设置
 * 兼容旧API: getSettings()
 */
export async function getSettings(): Promise<APIResponse<ReadingSettings>> {
  return api.getApiV1ReaderSettings() as any
}

/**
 * 保存阅读设置
 * 兼容旧API: saveSettings(settings)
 */
export async function saveSettings(
  settings: ReadingSettings
): Promise<APIResponse<ReadingSettings>> {
  return api.postApiV1ReaderSettings(settings as any) as any
}

/**
 * 更新阅读设置
 * 兼容旧API: updateSettings(settings)
 */
export async function updateSettings(
  settings: Partial<ReadingSettings>
): Promise<APIResponse<ReadingSettings>> {
  return api.putApiV1ReaderSettings(settings as any) as any
}

/**
 * 批量更新书籍状态
 */
export const batchUpdateBookStatus = api.putApiV1ReaderBooksBatchStatus

/**
 * 获取书架（别名）
 */
export const getBookshelf = getBooks

/**
 * 从书架移除（别名）
 */
export const removeFromBookshelf = removeBookFromShelf

/**
 * 导出原始getApi函数（高级用法）
 * 可以传入自定义axios实例
 */
export { getApi }

// ==================== 主题和字体设置 ====================

export * from './manual/themes'
export * from './manual/fonts'
export * from './manual/progress'
export * from './manual/books'

// 解决命名冲突：books的getRecentReading优先（用于ProfileView）
// progress的版本重命名为getRecentReadingProgress
export { getRecentReading } from './manual/books'
export { getRecentReading as getRecentReadingProgress } from './manual/progress'

/**
 * 默认导出
 */
export default {
  // 书架相关
  getBooks,
  getBookInfo,
  addBookToShelf,
  removeBookFromShelf,
  likeBook,
  unlikeBook,
  updateBookStatus,
  batchUpdateBookStatus,
  getFinishedBooks,
  getRecentBooks,
  getUnfinishedBooks,
  // 章节相关
  getBookChapters,
  getChapterInfo,
  getChapterContent,
  getChapterByNumber,
  getNextChapter,
  getPreviousChapter,
  purchaseChapter,
  // 书签相关
  getBookmarks,
  getBookmark,
  addBookToBookmarks,
  updateBookmark,
  deleteBookmark,
  // 阅读进度相关
  getReadingProgress,
  saveReadingProgress,
  // 阅读历史相关
  getReadingHistory,
  clearReadingHistory,
  // 笔记相关
  getAnnotations,
  getBookAnnotations,
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
  getAnnotationStats,
  // 阅读设置相关
  getSettings,
  saveSettings,
  updateSettings,
  // 书架便捷方法（别名）
  getBookshelf: getBooks,
  addToBookshelf: addBookToShelf,
  removeFromBookshelf: removeBookFromShelf,
  // 工具函数
  getApi,
}
