/**
 * 推荐系统API
 */

import { httpService } from '@/core/services/http.service'
import type { Book } from '@/types/bookstore'

/**
 * 获取个性化推荐
 * GET /api/v1/recommendation/personalized
 * 需要认证
 */
export function getPersonalizedRecommendations(limit = 10) {
  return httpService.get<Book[]>('/recommendation/personalized', {
    params: { limit },
  })
}

/**
 * 获取相似推荐
 * GET /api/v1/recommendation/similar
 */
export function getSimilarRecommendations(params: {
  itemId: string
  itemType?: string
  limit?: number
}) {
  return httpService.get<Book[]>('/recommendation/similar', { params })
}

/**
 * 记录用户行为
 * POST /api/v1/recommendation/behavior
 * 需要认证
 */
export function recordBehavior(data: {
  itemId: string
  itemType?: string
  behaviorType: 'view' | 'click' | 'collect' | 'read' | 'finish'
  duration?: number
  metadata?: Record<string, any>
}) {
  return httpService.post<void>('/recommendation/behavior', data)
}

/**
 * 获取首页推荐
 * GET /api/v1/recommendation/homepage
 */
export function getHomepageRecommendations(limit = 20) {
  return httpService.get<Book[]>('/recommendation/homepage', {
    params: { limit },
  })
}

/**
 * 获取热门推荐
 * GET /api/v1/recommendation/trending
 */
export function getTrendingRecommendations(limit = 20) {
  return httpService.get<Book[]>('/recommendation/trending', {
    params: { limit },
  })
}

/**
 * 获取分类推荐
 * GET /api/v1/recommendation/category
 */
export function getCategoryRecommendations(params: {
  category: string
  limit?: number
}) {
  return httpService.get<Book[]>('/recommendation/category', { params })
}
