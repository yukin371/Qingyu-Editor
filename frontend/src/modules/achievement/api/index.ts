/**
 * 成就系统 API
 */
import { http } from '@/core/http'
import type { Achievement, LevelInfo } from '@/types/achievement'
import type { APIResponse } from '@/types/api'

/**
 * 获取所有成就
 */
export function getAchievements(params?: { type?: string; unlocked?: boolean }): Promise<APIResponse<{
  list: Achievement[]
  total: number
}>> {
  return http.get('/api/v1/achievements', { params })
}

/**
 * 获取我的成就
 */
export function getMyAchievements(): Promise<APIResponse<{
  unlocked: Achievement[]
  locked: Achievement[]
  total: number
  unlockedCount: number
}>> {
  return http.get('/api/v1/achievements/my')
}

/**
 * 获取用户成就
 */
export function getUserAchievements(userId: string): Promise<APIResponse<{
  unlocked: Achievement[]
  total: number
}>> {
  return http.get(`/api/v1/users/${userId}/achievements`)
}

/**
 * 获取成就详情
 */
export function getAchievementDetail(id: string): Promise<APIResponse<Achievement>> {
  return http.get(`/api/v1/achievements/${id}`)
}

/**
 * 获取等级信息
 */
export function getLevelInfo(): Promise<APIResponse<LevelInfo>> {
  return http.get('/api/v1/achievements/level')
}

/**
 * 领取成就奖励
 */
export function claimAchievementReward(achievementId: string): Promise<APIResponse<{
  success: boolean
  reward: any
}>> {
  return http.post(`/api/v1/achievements/${achievementId}/claim`)
}

/**
 * 获取成就排行
 */
export function getAchievementRanking(params?: {
  type?: 'achievement_count' | 'level'
  limit?: number
}): Promise<APIResponse<{
  userId: string
  username: string
  nickname: string
  avatar: string
  level: number
  achievementCount: number
  rank: number
}[]>> {
  return http.get('/api/v1/achievements/ranking', { params })
}

/**
 * 获取经验值变化记录
 */
export function getExpHistory(params?: { page?: number; size?: number }): Promise<APIResponse<{
  list: {
    id: string
    type: string
    amount: number
    reason: string
    createdAt: string
  }[]
  total: number
}>> {
  return http.get('/api/v1/achievements/exp-history', { params })
}
