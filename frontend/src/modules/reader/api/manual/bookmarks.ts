/**
 * 书签相关 API
 * 对接后端 /api/v1/reader/annotations 路由
 * 后端路由文档: Qingyu_backend/router/reader/reader_router.go
 */

import { httpService } from '@/core/services/http.service'

/**
 * 书签信息
 */
export interface Bookmark {
  id: string
  chapterId: string
  bookId: string
  position: number
  note?: string
  highlightText?: string
  createdAt: string
  updatedAt: string
}

/**
 * 书签 API 接口 (v1.0)
 * @description 对接后端 /api/v1/reader/annotations (type=bookmark)
 * @endpoint /api/v1/reader/annotations
 * @category reader
 * @tags 书签管理
 */
export const bookmarksAPI = {
  /**
   * 获取用户所有书签
   * @description 获取当前登录用户的书签列表，支持分页和按书籍筛选
   * @endpoint GET /api/v1/reader/annotations
   * @category reader
   * @tags 书签管理
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码（默认1）
   * @param {number} params.pageSize - 每页数量（默认20）
   * @param {string} params.bookId - 书籍ID（可选）
   * @response {PaginatedResponse<Bookmark>} 200 - 成功返回书签列表
   * @security BearerAuth
   */
  async getUserBookmarks(params?: {
    page?: number
    pageSize?: number
    bookId?: string
  }): Promise<Bookmark[]> {
    return httpService.get<Bookmark[]>('/reader/annotations', {
      params: { ...params, type: 'bookmark' }
    })
  },

  /**
   * 创建书签
   * @description 在指定章节的指定位置创建书签
   * @endpoint POST /api/v1/reader/annotations
   * @category reader
   * @tags 书签管理
   * @param {Object} data - 书签数据
   * @param {string} data.chapterId - 章节ID
   * @param {number} data.position - 书签位置（字符偏移量）
   * @param {string} [data.note] - 书签备注（可选）
   * @param {string} [data.highlightText] - 高亮文本（可选）
   * @response {APIResponse<Bookmark>} 201 - 成功创建书签
   * @security BearerAuth
   */
  async createBookmark(data: {
    chapterId: string
    position: number
    note?: string
    highlightText?: string
  }): Promise<Bookmark> {
    return httpService.post<Bookmark>('/reader/annotations', {
      ...data,
      type: 'bookmark'
    })
  },

  /**
   * 更新书签
   * @description 更新指定书签的备注或高亮文本
   * @endpoint PUT /api/v1/reader/annotations/:id
   * @category reader
   * @tags 书签管理
   * @param {string} bookmarkId - 书签ID
   * @param {Object} data - 更新数据
   * @param {string} [data.note] - 书签备注（可选）
   * @param {string} [data.highlightText] - 高亮文本（可选）
   * @response {APIResponse<Bookmark>} 200 - 成功更新书签
   * @security BearerAuth
   */
  async updateBookmark(
    bookmarkId: string,
    data: {
      note?: string
      highlightText?: string
    }
  ): Promise<Bookmark> {
    return httpService.put<Bookmark>(`/reader/annotations/${bookmarkId}`, data)
  },

  /**
   * 删除书签
   * @description 删除指定的书签
   * @endpoint DELETE /api/v1/reader/annotations/:id
   * @category reader
   * @tags 书签管理
   * @param {string} bookmarkId - 书签ID
   * @response {APIResponse<void>} 204 - 成功删除书签
   * @security BearerAuth
   */
  async deleteBookmark(bookmarkId: string): Promise<void> {
    return httpService.delete<void>(`/reader/annotations/${bookmarkId}`)
  },

  /**
   * 获取章节书签
   * @description 获取指定章节的所有书签
   * @endpoint GET /api/v1/reader/annotations/chapter/:chapterId
   * @category reader
   * @tags 书签管理
   * @param {string} chapterId - 章节ID
   * @response {APIResponse<Bookmark[]>} 200 - 成功返回章节书签列表
   * @security BearerAuth
   */
  async getChapterBookmarks(chapterId: string): Promise<Bookmark[]> {
    return httpService.get<Bookmark[]>(
      `/reader/annotations/chapter/${chapterId}`,
      { params: { type: 'bookmark' } }
    )
  },

  /**
   * 获取最新书签
   * @description 获取用户最近创建的书签
   * @endpoint GET /api/v1/reader/bookmark/latest
   * @category reader
   * @tags 书签管理
   * @response {APIResponse<Bookmark | null>} 200 - 成功返回最新书签，如果没有则返回null
   * @security BearerAuth
   */
  async getLatestBookmark(): Promise<Bookmark | null> {
    return httpService.get<Bookmark | null>('/reader/bookmark/latest')
  },

  /**
   * 批量删除书签
   * @description 批量删除多个书签
   * @endpoint DELETE /api/v1/reader/annotations/batch
   * @category reader
   * @tags 书签管理
   * @param {string[]} bookmarkIds - 书签ID数组
   * @response {APIResponse<void>} 204 - 成功删除所有指定书签
   * @security BearerAuth
   */
  async batchDeleteBookmarks(bookmarkIds: string[]): Promise<void> {
    return httpService.delete<void>('/reader/annotations/batch', {
      data: { ids: bookmarkIds }
    })
  }
}

// 向后兼容：导出旧的函数名
export const getUserBookmarks = (params?: any) => bookmarksAPI.getUserBookmarks(params)
export const createBookmark = (data: any) => bookmarksAPI.createBookmark(data)
export const updateBookmark = (id: string, data: any) => bookmarksAPI.updateBookmark(id, data)
export const deleteBookmark = (id: string) => bookmarksAPI.deleteBookmark(id)
export const getChapterBookmarks = (id: string) => bookmarksAPI.getChapterBookmarks(id)
export const batchDeleteBookmarks = (ids: string[]) => bookmarksAPI.batchDeleteBookmarks(ids)

export default bookmarksAPI
