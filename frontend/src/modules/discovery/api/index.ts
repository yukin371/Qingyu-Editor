/**
 * 发现/推荐系统 API
 */
import { http } from '@/core/http'
import type { RecommendationItem, RecommendationConfig, PersonalizedRecommendations, RecommendationSlot } from '@/types/discovery'

/**
 * 获取推荐内容
 */
export function getRecommendations(slot?: RecommendationSlot) {
  return http.get<RecommendationItem[]>('/api/v1/discovery/recommendations', {
    params: slot ? { slot } : {}
  })
}

/**
 * 获取个性化推荐
 */
export function getPersonalizedRecommendations() {
  return http.get<PersonalizedRecommendations>('/api/v1/discovery/personalized')
}

/**
 * 获取新书推荐
 */
export function getNewReleases(params?: { page?: number; size?: number; categoryId?: string }) {
  return http.get<{
    list: any[]
    total: number
  }>('/api/v1/discovery/new-releases', { params })
}

/**
 * 获取编辑推荐
 */
export function getEditorsPick(params?: { page?: number; size?: number; tag?: string }) {
  return http.get<{
    list: any[]
    total: number
  }>('/api/v1/discovery/editors-pick', { params })
}

/**
 * 获取热门榜单
 */
export function getTrending(params?: { type?: 'daily' | 'weekly' | 'monthly'; limit?: number }) {
  return http.get<any[]>('/api/v1/discovery/trending', { params })
}

/**
 * 获取话题列表
 */
export function getTopics(params?: { page?: number; size?: number }) {
  return http.get<{
    list: any[]
    total: number
  }>('/api/v1/discovery/topics', { params })
}

/**
 * 更新推荐偏好
 */
export function updateRecommendationConfig(config: Partial<RecommendationConfig>) {
  return http.put<RecommendationConfig>('/api/v1/discovery/preferences', config)
}

/**
 * 记录推荐行为（用于优化推荐）
 */
export function trackRecommendationAction(data: {
  itemId: string
  itemType: 'book' | 'booklist' | 'author'
  action: 'view' | 'click' | 'like' | 'dislike'
}) {
  return http.post<void>('/api/v1/discovery/track', data)
}
