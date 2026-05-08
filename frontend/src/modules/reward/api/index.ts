/**
 * 打赏系统 API
 */
import { http } from '@/core/http'
import type { Reward, RewardRanking, RewardStats } from '@/types/reward'

/**
 * 打赏作品/章节
 */
export function createReward(data: {
  toUserId: string
  bookId?: string
  chapterId?: string
  amount: number
  message?: string
  isAnonymous?: boolean
}) {
  return http.post<{
    code: number
    message: string
    data: Reward
  }>('/api/v1/rewards', data)
}

/**
 * 获取打赏记录
 */
export function getRewards(params?: {
  userId?: string
  bookId?: string
  type?: 'given' | 'received'
  page?: number
  size?: number
}) {
  return http.get<{
    code: number
    message: string
    data: {
      list: Reward[]
      total: number
    }
  }>('/api/v1/rewards', { params })
}

/**
 * 获取书籍打赏榜
 */
export function getBookRewardRanking(bookId: string, params?: { limit?: number }) {
  return http.get<{
    code: number
    message: string
    data: RewardRanking[]
  }>(`/api/v1/books/${bookId}/rewards/ranking`, { params })
}

/**
 * 获取作者打赏榜
 */
export function getAuthorRewardRanking(authorId: string, params?: { limit?: number }) {
  return http.get<{
    code: number
    message: string
    data: RewardRanking[]
  }>(`/api/v1/users/${authorId}/rewards/ranking`, { params })
}

/**
 * 获取打赏统计
 */
export function getRewardStats() {
  return http.get<{
    code: number
    message: string
    data: RewardStats
  }>('/api/v1/rewards/stats')
}

/**
 * 获取月度收入统计
 */
export function getMonthlyIncome(year?: number, month?: number) {
  return http.get<{
    code: number
    message: string
    data: {
      month: string
      totalAmount: number
      rewardCount: number
      breakdown: {
        date: string
        amount: number
        count: number
      }[]
    }
  }>('/api/v1/rewards/income/monthly', {
    params: year && month ? { year, month } : {}
  })
}
