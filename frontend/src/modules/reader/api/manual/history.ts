/**
 * 阅读历史相关 API
 * 对接后端 /api/v1/reader/reading-history 路由
 * 后端路由文档: Qingyu_backend/router/reader/reader_router.go
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse, PaginatedResponse } from '@/types/api'

/**
 * 阅读历史记录
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
 * 阅读历史 API 接口 (v1.0)
 * @description 对接后端 /api/v1/reader/reading-history 路由
 * @endpoint /api/v1/reader/reading-history
 * @category reader
 * @tags 阅读历史
 */
export const historyAPI = {
  /**
   * 获取阅读历史列表
   * @description 获取用户的阅读历史记录，支持多种筛选和排序方式
   * @endpoint GET /api/v1/reader/reading-history
   * @category reader
   * @tags 阅读历史
   * @param {Object} params - 查询参数
   * @param {number} [params.page] - 页码
   * @param {number} [params.pageSize] - 每页数量
   * @param {string} [params.sortBy] - 排序方式
   * @param {string} [params.period] - 时间周期
   * @param {string} [params.keyword] - 搜索关键词
   * @param {string} [params.startDate] - 开始日期
   * @param {string} [params.endDate] - 结束日期
   * @param {string} [params.bookId] - 按书籍筛选
   * @response {PaginatedResponse<ReadingHistory>} 200 - 成功返回阅读历史列表
   * @security BearerAuth
   */
  async getReadingHistories(params?: {
    page?: number
    pageSize?: number
    sortBy?: string
    period?: string
    keyword?: string
    startDate?: string
    endDate?: string
    bookId?: string
  }): Promise<PaginatedResponse<ReadingHistory>> {
    return httpService.get<PaginatedResponse<ReadingHistory>>(
      '/reader/reading-history',
      { params }
    )
  },

  /**
   * 记录阅读历史
   * @description 记录用户的阅读行为，包括位置和时长
   * @endpoint POST /api/v1/reader/reading-history
   * @category reader
   * @tags 阅读历史
   * @param {Object} data - 阅读历史数据
   * @param {string} data.bookId - 书籍ID
   * @param {string} data.chapterId - 章节ID
   * @param {number} data.position - 阅读位置
   * @param {number} [data.duration] - 阅读时长（秒）
   * @response {APIResponse<void>} 201 - 成功记录阅读历史
   * @security BearerAuth
   */
  async recordReadingHistory(data: {
    bookId: string
    chapterId: string
    position: number
    duration?: number
  }): Promise<APIResponse<void>> {
    return httpService.post<APIResponse<void>>('/reader/reading-history', data)
  },

  /**
   * 删除阅读历史
   * @description 删除指定的一条阅读历史记录
   * @endpoint DELETE /api/v1/reader/reading-history/:id
   * @category reader
   * @tags 阅读历史
   * @param {string} historyId - 历史记录ID
   * @response {APIResponse<void>} 204 - 成功删除阅读历史
   * @security BearerAuth
   */
  async deleteHistory(historyId: string): Promise<APIResponse<void>> {
    return httpService.delete<APIResponse<void>>(`/reader/reading-history/${historyId}`)
  },

  /**
   * 批量删除历史记录
   * @description 批量删除多条阅读历史记录
   * @endpoint DELETE /api/v1/reader/reading-history (批量)
   * @category reader
   * @tags 阅读历史
   * @param {string[]} historyIds - 历史记录ID数组
   * @response {APIResponse<void>} 204 - 成功批量删除
   * @security BearerAuth
   */
  async batchDeleteHistory(historyIds: string[]): Promise<APIResponse<void>> {
    return httpService.delete<APIResponse<void>>('/reader/reading-history', {
      data: { ids: historyIds }
    })
  },

  /**
   * 清空所有阅读历史
   * @description 清空用户的所有阅读历史记录
   * @endpoint DELETE /api/v1/reader/reading-history
   * @category reader
   * @tags 阅读历史
   * @response {APIResponse<void>} 204 - 成功清空所有历史
   * @security BearerAuth
   */
  async clearHistories(): Promise<APIResponse<void>> {
    return httpService.delete<APIResponse<void>>('/reader/reading-history')
  },

  /**
   * 获取阅读统计
   * @description 获取用户的阅读统计数据
   * @endpoint GET /api/v1/reader/reading-history/stats
   * @category reader
   * @tags 阅读历史
   * @response {APIResponse<{totalBooks: number, finishedBooks: number, unfinishedBooks: number, totalReadingTime: number, todayReadingTime: number}>} 200 - 成功返回阅读统计
   * @security BearerAuth
   */
  async getReadingStats(): Promise<APIResponse<{
    totalBooks: number
    finishedBooks: number
    unfinishedBooks: number
    totalReadingTime: number
    todayReadingTime: number
  }>> {
    return httpService.get<APIResponse<any>>('/reader/reading-history/stats')
  }
}

// 向后兼容：导出旧的函数名
export const getReadingHistories = (params?: any) => historyAPI.getReadingHistories(params)
export const recordReadingHistory = (data: any) => historyAPI.recordReadingHistory(data)
export const deleteHistory = (id: string) => historyAPI.deleteHistory(id)
export const batchDeleteHistory = (ids: string[]) => historyAPI.batchDeleteHistory(ids)
export const clearAllHistory = () => historyAPI.clearHistories()
export const clearHistory = () => historyAPI.clearHistories()
export const getBookProgress = (bookId: string) => historyAPI.getReadingHistories({ bookId })
export const updateReadingProgress = (data: any) => historyAPI.recordReadingHistory(data)

export default historyAPI
