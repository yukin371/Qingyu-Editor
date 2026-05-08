/**
 * 阅读统计 API
 */
import { http } from '@/core/http'
import type { ReadingStats, ReadingReport, StatsPeriod } from '@/types/reading-stats'

/**
 * 获取阅读统计
 */
export function getReadingStats(period: StatsPeriod) {
  return http.get<ReadingStats>('/api/v1/reading/stats', {
    params: { period }
  })
}

/**
 * 获取阅读报告
 */
export function getReadingReport(period: StatsPeriod) {
  return http.get<ReadingReport>('/api/v1/reading/report', {
    params: { period }
  })
}

/**
 * 获取周报
 */
export function getWeeklyReport() {
  return getReadingReport('weekly')
}

/**
 * 获取月报
 */
export function getMonthlyReport() {
  return getReadingReport('monthly')
}

/**
 * 获取年报
 */
export function getYearlyReport() {
  return getReadingReport('yearly')
}

/**
 * 获取阅读时长排行
 */
export function getReadingRanking(params?: {
  type?: 'daily' | 'weekly' | 'monthly'
  limit?: number
}) {
  return http.get<{
    userId: string
    username: string
    nickname: string
    avatar: string
    readingTime: number
    rank: number
  }[]>('/api/v1/reading/ranking', { params })
}

/**
 * 获取阅读历史记录
 */
export function getReadingHistory(params?: {
  startDate?: string
  endDate?: string
  page?: number
  size?: number
}) {
  return http.get<{
    list: {
      date: string
      bookId: string
      bookTitle: string
      bookCover: string
      chapterTitle: string
      readingTime: number
    }[]
    total: number
  }>('/api/v1/reading/history', { params })
}

/**
 * 同步阅读进度（用于统计）
 */
export function syncReadingProgress(data: {
  bookId: string
  chapterId: string
  progress: number
  readingTime: number
}) {
  return http.post<void>('/api/v1/reading/sync', data)
}
