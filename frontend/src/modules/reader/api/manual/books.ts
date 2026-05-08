/**
 * 书架管理 API
 * 对接后端 /api/v1/reader/books 路由
 * 后端路由文档: Qingyu_backend/router/reader/reader_router.go
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse, PaginatedResponse } from '@/types/api'

type HttpClientLike = {
  get<T>(url: string, config?: Record<string, unknown>): Promise<T>
  post<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T>
  put<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T>
  delete<T>(url: string, config?: Record<string, unknown>): Promise<T>
}

const httpClient = httpService as unknown as HttpClientLike

/**
 * 书架书籍信息
 */
export interface BookshelfBook {
  id: string
  title: string
  author: string
  cover?: string
  description?: string
  category: string
  status: 'serializing' | 'completed' | 'paused'
  totalChapters: number
  wordCount?: number
  lastReadTime?: string
  lastReadChapter?: string
  progress?: number
  updatedAt: string
}

/**
 * 书架查询参数
 */
export interface BookshelfParams {
  page?: number
  pageSize?: number
  status?: 'reading' | 'finished' | 'all'
  sortBy?: 'lastReadTime' | 'addTime' | 'updateTime'
}

/**
 * 书架API接口 (v1.0)
 * @description 对接后端 /api/v1/reader/books 路由
 * @endpoint /api/v1/reader/books
 * @category reader
 * @tags 书架管理
 */
export const bookshelfAPI = {
  /**
   * 获取书架列表
   * @description 获取用户的书架列表，支持按状态和排序方式筛选
   * @endpoint GET /api/v1/reader/books
   * @category reader
   * @tags 书架管理
   * @param {BookshelfParams} params - 查询参数（页码、每页数量、状态、排序方式）
   * @response {PaginatedResponse<BookshelfBook>} 200 - 成功返回书架列表
   * @security BearerAuth
   */
  async getBookshelf(params?: BookshelfParams): Promise<PaginatedResponse<BookshelfBook>> {
    return httpClient.get<PaginatedResponse<BookshelfBook>>('/reader/books', { params })
  },

  /**
   * 获取最近阅读
   * @description 获取用户最近阅读的书籍列表
   * @endpoint GET /api/v1/reader/books/recent
   * @category reader
   * @tags 书架管理
   * @param {number} limit - 返回数量限制（默认10）
   * @response {APIResponse<BookshelfBook[]>} 200 - 成功返回最近阅读列表
   * @security BearerAuth
   */
  async getRecentReading(limit: number = 10): Promise<APIResponse<BookshelfBook[]>> {
    return httpClient.get<APIResponse<BookshelfBook[]>>('/reader/books/recent', {
      params: { limit }
    })
  },

  /**
   * 获取未读完的书籍
   * @description 获取用户未读完的书籍列表，支持分页
   * @endpoint GET /api/v1/reader/books/unfinished
   * @category reader
   * @tags 书架管理
   * @param {Object} params - 分页参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @response {PaginatedResponse<BookshelfBook>} 200 - 成功返回未读完的书籍列表
   * @security BearerAuth
   */
  async getUnfinishedBooks(params?: {
    page?: number
    pageSize?: number
  }): Promise<PaginatedResponse<BookshelfBook>> {
    return httpClient.get<PaginatedResponse<BookshelfBook>>('/reader/books/unfinished', {
      params
    })
  },

  /**
   * 获取已读完的书籍
   * @description 获取用户已读完的书籍列表，支持分页
   * @endpoint GET /api/v1/reader/books/finished
   * @category reader
   * @tags 书架管理
   * @param {Object} params - 分页参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @response {PaginatedResponse<BookshelfBook>} 200 - 成功返回已读完的书籍列表
   * @security BearerAuth
   */
  async getFinishedBooks(params?: {
    page?: number
    pageSize?: number
  }): Promise<PaginatedResponse<BookshelfBook>> {
    return httpClient.get<PaginatedResponse<BookshelfBook>>('/reader/books/finished', {
      params
    })
  },

  /**
   * 添加书籍到书架
   * @description 将指定书籍添加到用户的书架
   * @endpoint POST /api/v1/reader/books/:bookId
   * @category reader
   * @tags 书架管理
   * @param {string} bookId - 书籍ID
   * @response {APIResponse<void>} 201 - 成功添加到书架
   * @security BearerAuth
   */
  async addToBookshelf(bookId: string): Promise<APIResponse<void>> {
    return httpClient.post<APIResponse<void>>(`/reader/books/${bookId}`)
  },

  /**
   * 从书架移除书籍
   * @description 将指定书籍从用户的书架中移除
   * @endpoint DELETE /api/v1/reader/books/:bookId
   * @category reader
   * @tags 书架管理
   * @param {string} bookId - 书籍ID
   * @response {APIResponse<void>} 204 - 成功从书架移除
   * @security BearerAuth
   */
  async removeFromBookshelf(bookId: string): Promise<APIResponse<void>> {
    return httpClient.delete<APIResponse<void>>(`/reader/books/${bookId}`)
  },

  /**
   * 更新书籍状态
   * @description 更新书架中书籍的阅读状态
   * @endpoint PUT /api/v1/reader/books/:bookId/status
   * @category reader
   * @tags 书架管理
   * @param {string} bookId - 书籍ID
   * @param {string} status - 阅读状态（reading: 阅读中, want_read: 想读, finished: 已读完）
   * @response {APIResponse<void>} 200 - 成功更新书籍状态
   * @security BearerAuth
   */
  async updateBookStatus(bookId: string, status: 'reading' | 'want_read' | 'finished'): Promise<APIResponse<void>> {
    return httpClient.put<APIResponse<void>>(`/reader/books/${bookId}/status`, { status })
  },

  /**
   * 批量更新书籍状态
   * @description 批量更新多本书籍的阅读状态
   * @endpoint PUT /api/v1/reader/books/batch/status
   * @category reader
   * @tags 书架管理
   * @param {string[]} bookIds - 书籍ID数组
   * @param {string} status - 阅读状态（reading: 阅读中, want_read: 想读, finished: 已读完）
   * @response {APIResponse<{count: number}>} 200 - 成功更新，返回更新的书籍数量
   * @security BearerAuth
   */
  async batchUpdateBookStatus(
    bookIds: string[],
    status: 'reading' | 'want_read' | 'finished'
  ): Promise<APIResponse<{ count: number }>> {
    return httpClient.put<APIResponse<{ count: number }>>('/reader/books/batch/status', {
      bookIds,
      status
    })
  },

  /**
   * 检查书籍是否在书架中
   * @description 检查指定书籍是否在用户的书架中
   * @endpoint GET /api/v1/reader/books/:bookId/status
   * @category reader
   * @tags 书架管理
   * @param {string} bookId - 书籍ID
   * @response {APIResponse<{isInShelf: boolean, status?: string}>} 200 - 成功返回书籍状态信息
   * @security BearerAuth
   */
  async checkBookStatus(bookId: string): Promise<APIResponse<{ isInShelf: boolean; status?: string }>> {
    return httpClient.get<APIResponse<{ isInShelf: boolean; status?: string }>>(`/reader/books/${bookId}/status`)
  }
}

// 向后兼容：导出旧的函数名
export const getBookshelf = (params?: BookshelfParams) => bookshelfAPI.getBookshelf(params)
export const getRecentReading = (limit?: number) => bookshelfAPI.getRecentReading(limit)
export const getUnfinishedBooks = (params?: any) => bookshelfAPI.getUnfinishedBooks(params)
export const getFinishedBooks = (params?: any) => bookshelfAPI.getFinishedBooks(params)
export const addToBookshelf = (bookId: string) => bookshelfAPI.addToBookshelf(bookId)
export const removeFromBookshelf = (bookId: string) => bookshelfAPI.removeFromBookshelf(bookId)
export const updateBookStatus = (bookId: string, status: 'reading' | 'want_read' | 'finished') => bookshelfAPI.updateBookStatus(bookId, status)
export const batchUpdateBookStatus = (bookIds: string[], status: 'reading' | 'want_read' | 'finished') => bookshelfAPI.batchUpdateBookStatus(bookIds, status)
export const checkBookStatus = (bookId: string) => bookshelfAPI.checkBookStatus(bookId)

// 别名导出：booksAPI 等同于 bookshelfAPI
export const booksAPI = bookshelfAPI

export default bookshelfAPI
