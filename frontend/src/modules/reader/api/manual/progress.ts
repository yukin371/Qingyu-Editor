/**
 * 阅读进度相关 API
 * 对接后端 /api/v1/reader/progress 路由
 * 后端路由文档: Qingyu_backend/router/reader/reader_router.go
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse, PaginatedResponse } from '@/types/api'

/**
 * 阅读进度
 */
export interface ReadingProgress {
  bookId: string
  chapterId: string
  chapterNumber: number
  progress: number // 0-100
  lastReadTime: string
}

/**
 * 阅读统计
 */
export interface ReadingStats {
  totalBooks: number
  finishedBooks: number
  unfinishedBooks: number
  totalReadingTime: number // 分钟
  todayReadingTime: number
}

/**
 * 设备阅读进度
 */
export interface DeviceProgress {
  deviceId: string
  deviceName: string
  deviceType: string
  lastSyncAt: string
  currentBook?: string
  progress?: number
}

/**
 * 设备阅读进度响应
 */
export interface DevicesProgressResponse {
  devices: DeviceProgress[]
  count: number
}

/**
 * 阅读进度 API 接口 (v1.0)
 * @description 对接后端 /api/v1/reader/progress 路由
 * @endpoint /api/v1/reader/progress
 * @category reader
 * @tags 阅读进度
 */
export const progressAPI = {
  /**
   * 获取书籍阅读进度
   * @description 获取指定书籍的阅读进度信息
   * @endpoint GET /api/v1/reader/progress/:bookId
   * @category reader
   * @tags 阅读进度
   * @param {string} bookId - 书籍ID
   * @response {APIResponse<ReadingProgress>} 200 - 成功返回阅读进度
   * @security BearerAuth
   */
  async getReadingProgress(bookId: string): Promise<APIResponse<ReadingProgress>> {
    return httpService.get<APIResponse<ReadingProgress>>(`/reader/progress/${bookId}`)
  },

  /**
   * 保存阅读进度
   * @description 保存或更新当前书籍的阅读进度
   * @endpoint POST /api/v1/reader/progress
   * @category reader
   * @tags 阅读进度
   * @param {Object} data - 阅读进度数据
   * @param {string} data.bookId - 书籍ID
   * @param {string} data.chapterId - 章节ID
   * @param {number} data.chapterNumber - 章节序号
   * @param {number} data.progress - 阅读进度（0-100）
   * @response {APIResponse<void>} 201 - 成功保存阅读进度
   * @security BearerAuth
   */
  async saveReadingProgress(data: {
    bookId: string
    chapterId: string
    chapterNumber: number
    progress: number
  }): Promise<APIResponse<void>> {
    return httpService.post<APIResponse<void>>('/reader/progress', data)
  },

  /**
   * 更新阅读时长
   * @description 更新当前章节的阅读时长统计
   * @endpoint POST /api/v1/reader/progress/time
   * @category reader
   * @tags 阅读进度
   * @param {Object} data - 阅读时长数据
   * @param {string} data.bookId - 书籍ID
   * @param {string} data.chapterId - 章节ID
   * @param {number} data.duration - 阅读时长（秒）
   * @response {APIResponse<void>} 200 - 成功更新阅读时长
   * @security BearerAuth
   */
  async updateReadingTime(data: {
    bookId: string
    chapterId: string
    duration: number
  }): Promise<APIResponse<void>> {
    return httpService.post<APIResponse<void>>('/reader/progress/time', data)
  },

  /**
   * 获取最近阅读
   * @description 获取用户最近阅读的书籍列表
   * @endpoint GET /api/v1/reader/progress/recent
   * @category reader
   * @tags 阅读进度
   * @response {APIResponse<ReadingProgress[]>} 200 - 成功返回最近阅读列表
   * @security BearerAuth
   */
  async getRecentReading(): Promise<APIResponse<ReadingProgress[]>> {
    return httpService.get<APIResponse<ReadingProgress[]>>('/reader/progress/recent')
  },

  /**
   * 获取阅读历史
   * @description 获取用户的阅读历史记录，支持分页
   * @endpoint GET /api/v1/reader/progress/history
   * @category reader
   * @tags 阅读进度
   * @param {Object} params - 分页参数
   * @param {number} [params.page] - 页码
   * @param {number} [params.pageSize] - 每页数量
   * @response {PaginatedResponse<ReadingProgress>} 200 - 成功返回阅读历史
   * @security BearerAuth
   */
  async getReadingHistory(params?: {
    page?: number
    pageSize?: number
  }): Promise<PaginatedResponse<ReadingProgress>> {
    return httpService.get<PaginatedResponse<ReadingProgress>>('/reader/progress/history', {
      params,
    })
  },

  /**
   * 获取阅读统计
   * @description 获取用户的阅读统计数据
   * @endpoint GET /api/v1/reader/progress/stats
   * @category reader
   * @tags 阅读进度
   * @response {APIResponse<ReadingStats>} 200 - 成功返回阅读统计
   * @security BearerAuth
   */
  async getReadingStats(): Promise<APIResponse<ReadingStats>> {
    return httpService.get<APIResponse<ReadingStats>>('/reader/progress/stats')
  },

  /**
   * 获取未读完的书籍
   * @description 获取用户未读完的书籍列表
   * @endpoint GET /api/v1/reader/progress/unfinished
   * @category reader
   * @tags 阅读进度
   * @response {APIResponse<ReadingProgress[]>} 200 - 成功返回未读完的书籍列表
   * @security BearerAuth
   */
  async getUnfinishedBooks(): Promise<APIResponse<ReadingProgress[]>> {
    return httpService.get<APIResponse<ReadingProgress[]>>('/reader/progress/unfinished')
  },

  /**
   * 获取已读完的书籍
   * @description 获取用户已读完的书籍列表
   * @endpoint GET /api/v1/reader/progress/finished
   * @category reader
   * @tags 阅读进度
   * @response {APIResponse<ReadingProgress[]>} 200 - 成功返回已读完的书籍列表
   * @security BearerAuth
   */
  async getFinishedBooks(): Promise<APIResponse<ReadingProgress[]>> {
    return httpService.get<APIResponse<ReadingProgress[]>>('/reader/progress/finished')
  },

  /**
   * 获取跨设备阅读记录
   * @description 获取用户在多个设备上的阅读进度记录
   * @endpoint GET /api/v1/reader/progress/devices
   * @category reader
   * @tags 阅读进度
   * @response {APIResponse<DevicesProgressResponse>} 200 - 成功返回设备列表
   * @security BearerAuth
   */
  async getDevicesProgress(): Promise<APIResponse<DevicesProgressResponse>> {
    return httpService.get<APIResponse<DevicesProgressResponse>>('/reader/progress/devices')
  },
}

// 向后兼容：导出旧的函数名
export const getReadingProgress = (bookId: string) => progressAPI.getReadingProgress(bookId)
export const saveReadingProgress = (data: any) => progressAPI.saveReadingProgress(data)
export const updateReadingTime = (data: any) => progressAPI.updateReadingTime(data)
export const getRecentReading = () => progressAPI.getRecentReading()
export const getReadingHistory = (params?: any) => progressAPI.getReadingHistory(params)
export const getReadingStats = () => progressAPI.getReadingStats()
export const getUnfinishedBooks = () => progressAPI.getUnfinishedBooks()
export const getFinishedBooks = () => progressAPI.getFinishedBooks()
export const getDevicesProgress = () => progressAPI.getDevicesProgress()

export default progressAPI
