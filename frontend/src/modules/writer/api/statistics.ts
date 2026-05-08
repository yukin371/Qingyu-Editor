/**
 * 写作端 - 作品数据统计API
 */

import { httpService } from '@/core/services/http.service'

/**
 * 作品统计概览接口
 */
export interface BookStats {
  totalViews: number // 总阅读量
  subscribers: number // 订阅人数
  favorites: number // 收藏数
  comments: number // 评论数
  todayViews?: number // 今日阅读量
  monthViews?: number // 本月阅读量
  rating?: number // 评分
  wordCount?: number // 总字数
}

/**
 * 每日统计数据接口
 */
export interface DailyStats {
  date: string
  views: number
  newSubscribers?: number
  newFavorites?: number
  comments?: number
}

/**
 * 章节统计接口
 */
export interface ChapterStats {
  chapterId: string
  chapterTitle: string
  chapterNumber: number
  views: number
  comments: number
  avgReadTime?: number // 平均阅读时长（秒）
  retention?: number // 留存率
}

/**
 * 读者活跃度接口
 */
export interface ReaderActivity {
  type: 'daily' | 'weekly' | 'monthly' | 'inactive'
  label: string
  count: number
  percentage: number
}

/**
 * 阅读时段热力图接口
 */
export interface ReadingHeatmap {
  hour: number // 0-23
  day: number // 0-6 (周日到周六)
  value: number // 阅读量
}

/**
 * 获取作品统计概览
 * @description 获取指定作品的统计数据，包括总阅读量、订阅人数、收藏数、评论数等
 * @endpoint GET /api/v1/writer/books/:bookId/stats
 * @category writer
 * @tags 数据统计
 * @param {string} bookId - 作品ID
 * @response {BookStats} 200 - 成功返回作品统计概览
 * @security BearerAuth
 */
export const getBookStats = (bookId: string) => {
  return httpService.get(`/api/v1/writer/books/${bookId}/stats`)
}

/**
 * 获取每日统计数据
 * @description 获取指定作品的每日阅读量统计，支持自定义时间范围
 * @endpoint GET /api/v1/writer/books/:bookId/daily-stats
 * @category writer
 * @tags 数据统计
 * @param {string} bookId - 作品ID
 * @param {number} [days=30] - 统计天数，默认30天
 * @response {DailyStats[]} 200 - 成功返回每日统计数据列表
 * @security BearerAuth
 */
export const getDailyStats = (bookId: string, days: number = 30) => {
  return httpService.get(`/api/v1/writer/books/${bookId}/daily-stats`, {
    params: { days },
  })
}

/**
 * 获取订阅增长数据
 * @description 获取指定作品的订阅增长趋势数据，支持按天数或日期范围查询
 * @endpoint GET /api/v1/writer/books/:bookId/stats/subscribers
 * @category writer
 * @tags 数据统计
 * @param {string} bookId - 作品ID
 * @param {Object} [params] - 查询参数
 * @param {number} [params.days] - 统计天数
 * @param {string} [params.startDate] - 开始日期（ISO8601格式）
 * @param {string} [params.endDate] - 结束日期（ISO8601格式）
 * @response {DailyStats[]} 200 - 成功返回订阅增长趋势数据
 * @security BearerAuth
 */
export function getSubscribersTrend(
  bookId: string,
  params?: {
    days?: number
    startDate?: string
    endDate?: string
  },
) {
  return httpService.get(`/api/v1/writer/books/${bookId}/stats/subscribers`, { params })
}

/**
 * 获取章节统计数据
 * @description 获取指定作品的章节阅读量统计，支持分页查询
 * @endpoint GET /api/v1/writer/books/:bookId/stats/chapters
 * @category writer
 * @tags 数据统计
 * @param {string} bookId - 作品ID
 * @param {number} [page=1] - 页码，默认为1
 * @param {number} [size=20] - 每页数量，默认为20
 * @response {{items: ChapterStats[], total: number}} 200 - 成功返回章节统计数据列表
 * @security BearerAuth
 */
export const getChapterStats = (bookId: string, page: number = 1, size: number = 20) => {
  return httpService.get(`/api/v1/writer/books/${bookId}/stats/chapters`, {
    params: { page, size },
  })
}

/**
 * 获取读者活跃度分布
 * @description 获取指定作品的读者活跃度分布数据，包括日活跃、周活跃、月活跃和非活跃读者
 * @endpoint GET /api/v1/writer/books/:bookId/stats/reader-activity
 * @category writer
 * @tags 数据统计
 * @param {string} bookId - 作品ID
 * @response {ReaderActivity[]} 200 - 成功返回读者活跃度分布数据
 * @security BearerAuth
 */
export const getReaderActivity = (bookId: string) => {
  return httpService.get(`/api/v1/writer/books/${bookId}/stats/reader-activity`)
}

/**
 * 获取阅读时段热力图数据
 * @description 获取指定作品的阅读时段热力图数据，用于分析读者在不同时段的阅读行为
 * @endpoint GET /api/v1/writer/books/:bookId/heatmap
 * @category writer
 * @tags 数据统计
 * @param {string} bookId - 作品ID
 * @response {ReadingHeatmap[]} 200 - 成功返回阅读时段热力图数据
 * @security BearerAuth
 */
export const getReadingHeatmap = (bookId: string) => {
  return httpService.get(`/api/v1/writer/books/${bookId}/heatmap`)
}

/**
 * 获取作品对比数据（多作品对比）
 * @description 对比多个作品在指定时间范围内的统计数据，支持自定义对比指标
 * @endpoint POST /api/v1/writer/stats/compare
 * @category writer
 * @tags 数据统计
 * @param {string[]} bookIds - 要对比的作品ID列表
 * @param {Object} [params] - 查询参数
 * @param {string[]} [params.metrics] - 对比指标，如 ['views', 'subscribers', 'favorites']
 * @param {string} [params.startDate] - 开始日期（ISO8601格式）
 * @param {string} [params.endDate] - 结束日期（ISO8601格式）
 * @response {Object} 200 - 成功返回作品对比数据
 * @security BearerAuth
 */
export function compareBooks(
  bookIds: string[],
  params?: {
    metrics?: string[] // ['views', 'subscribers', 'favorites']
    startDate?: string
    endDate?: string
  },
) {
  return httpService.post('/api/v1/writer/stats/compare', {
    bookIds,
    ...params,
  })
}

export default {
  getBookStats,
  getDailyStats,
  getChapterStats,
  getReaderActivity,
  getReadingHeatmap,
}
