/**
 * 章节相关 API
 * 对接后端 /api/v1/reader/chapters 路由
 * 后端路由文档: Qingyu_backend/router/reader/reader_router.go
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse } from '@/types/api'

/**
 * 章节信息
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
 * 章节导航信息
 */
export interface ChapterNavigation {
  previous: Chapter | null
  current: Chapter
  next: Chapter | null
}

/**
 * 章节 API 接口 (v1.0)
 * 对接后端: /api/v1/reader/books/:bookId/chapters
 */
/**
 * 章节相关 API
 * @description 对接后端 /api/v1/reader/chapters 路由
 * @endpoint /api/v1/reader
 * @category reader
 * @tags 章节相关
 */
export const chaptersAPI = {
  /**
   * 获取书籍章节列表
   * @description 获取指定书籍的章节列表，支持分页
   * @endpoint GET /api/v1/reader/books/:bookId/chapters
   * @category reader
   * @tags 章节相关
   * @param {string} bookId - 书籍ID
   * @param {number} page - 页码（默认1）
   * @param {number} size - 每页数量（默认50）
   * @response {APIResponse<Chapter[]>} 200 - 成功返回章节列表
   */
  async getBookChapters(bookId: string, page = 1, size = 50): Promise<APIResponse<Chapter[]>> {
    return httpService.get<APIResponse<Chapter[]>>(`/reader/books/${bookId}/chapters?page=${page}&size=${size}`)
  },

  /**
   * 获取章节内容
   * @description 获取指定章节的详细内容和元数据
   * @endpoint GET /api/v1/reader/books/:bookId/chapters/:chapterId
   * @category reader
   * @tags 章节相关
   * @param {string} bookId - 书籍ID
   * @param {string} chapterId - 章节ID
   * @response {APIResponse<{chapter: Chapter; content: string}>} 200 - 成功返回章节内容和元数据
   */
  async getChapterContent(bookId: string, chapterId: string): Promise<APIResponse<{ chapter: Chapter; content: string }>> {
    return httpService.get<APIResponse<{ chapter: Chapter; content: string }>>(
      `/reader/books/${bookId}/chapters/${chapterId}`
    )
  },

  /**
   * 获取章节信息（不含内容）
   * @description 获取章节的元数据信息，不包含正文内容
   * @endpoint GET /api/v1/reader/chapters/:chapterId/info
   * @category reader
   * @tags 章节相关
   * @param {string} chapterId - 章节ID
   * @response {APIResponse<Chapter>} 200 - 成功返回章节信息
   */
  async getChapterById(chapterId: string): Promise<APIResponse<Chapter>> {
    return httpService.get<APIResponse<Chapter>>(`/reader/chapters/${chapterId}/info`)
  },

  /**
   * 获取下一章
   * @description 获取指定章节的下一章信息
   * @endpoint GET /api/v1/reader/books/:bookId/chapters/:chapterId/next
   * @category reader
   * @tags 章节相关
   * @param {string} bookId - 书籍ID
   * @param {string} chapterId - 当前章节ID
   * @response {APIResponse<Chapter>} 200 - 成功返回下一章信息，如果已是最后一章则返回null
   */
  async getNextChapter(bookId: string, chapterId: string): Promise<APIResponse<Chapter>> {
    return httpService.get<APIResponse<Chapter>>(
      `/reader/books/${bookId}/chapters/${chapterId}/next`
    )
  },

  /**
   * 获取上一章
   * @description 获取指定章节的上一章信息
   * @endpoint GET /api/v1/reader/books/:bookId/chapters/:chapterId/previous
   * @category reader
   * @tags 章节相关
   * @param {string} bookId - 书籍ID
   * @param {string} chapterId - 当前章节ID
   * @response {APIResponse<Chapter>} 200 - 成功返回上一章信息，如果已是第一章则返回null
   */
  async getPreviousChapter(bookId: string, chapterId: string): Promise<APIResponse<Chapter>> {
    return httpService.get<APIResponse<Chapter>>(
      `/reader/books/${bookId}/chapters/${chapterId}/previous`
    )
  },

  /**
   * 根据章节号获取章节
   * @description 根据章节序号直接获取章节信息
   * @endpoint GET /api/v1/reader/books/:bookId/chapters/by-number/:chapterNum
   * @category reader
   * @tags 章节相关
   * @param {string} bookId - 书籍ID
   * @param {number} chapterNum - 章节序号
   * @response {APIResponse<Chapter>} 200 - 成功返回章节信息
   */
  async getChapterByNumber(bookId: string, chapterNum: number): Promise<APIResponse<Chapter>> {
    return httpService.get<APIResponse<Chapter>>(
      `/reader/books/${bookId}/chapters/by-number/${chapterNum}`
    )
  }
}

// 向后兼容：导出旧的函数名（注意：参数已变化以匹配后端API）
export const getBookChapters = (bookId: string, page?: number, size?: number) => chaptersAPI.getBookChapters(bookId, page, size)
export const getChapterById = (chapterId: string) => chaptersAPI.getChapterById(chapterId)
export const getChapterContent = (bookId: string, chapterId: string) => chaptersAPI.getChapterContent(bookId, chapterId)
export const getNextChapter = (bookId: string, chapterId: string) => chaptersAPI.getNextChapter(bookId, chapterId)
export const getPreviousChapter = (bookId: string, chapterId: string) => chaptersAPI.getPreviousChapter(bookId, chapterId)
export const getChapterByNumber = (bookId: string, chapterNum: number) => chaptersAPI.getChapterByNumber(bookId, chapterNum)

// 导出导航相关函数
export const getNavigationChapters = (bookId: string, chapterId: string) => Promise.all([
  chaptersAPI.getPreviousChapter(bookId, chapterId),
  chaptersAPI.getChapterById(chapterId),
  chaptersAPI.getNextChapter(bookId, chapterId)
]).then(([prev, current, next]) => ({
  previous: prev.data,
  current: current.data,
  next: next.data
}))

export const getFirstChapter = (bookId: string) => chaptersAPI.getChapterByNumber(bookId, 1)
export const getLastChapter = (bookId: string) => getBookChapters(bookId, 1, 1)
  .then(res => {
    const chapters = res.data as any
    const lastChapter = Array.isArray(chapters) ? chapters[chapters.length - 1] : null
    return lastChapter
  })

export default chaptersAPI
