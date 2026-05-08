/**
 * 推荐 API 模块
 * 对接后端 /api/v1/recommendation 路由
 * 后端路由文档: Qingyu_backend/router/reader/reader_router.go
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse } from '@/types/api'

type HttpClientLike = {
  get<T>(url: string, config?: Record<string, unknown>): Promise<T>
  post<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T>
}

const httpClient = httpService as unknown as HttpClientLike

/**
 * 推荐书籍信息
 */
export interface RecommendedBook {
  id: string
  title: string
  author: string
  cover?: string
  description?: string
  category: string
  categoryId?: string
  status: 'serializing' | 'completed' | 'paused'
  totalChapters: number
  wordCount?: number
  rating?: number
  ratingCount?: number
  viewCount?: number
  recommendationReason?: string
  score?: number
  tags?: string[]
  updatedAt: string
}

/**
 * 用户行为类型
 */
export type BehaviorType =
  | 'view'
  | 'read'
  | 'like'
  | 'collect'
  | 'share'
  | 'purchase'
  | 'rating'
  | 'comment'
  | 'search'

/**
 * 用户行为数据
 */
export interface UserBehavior {
  bookId: string
  chapterId?: string
  behaviorType: BehaviorType
  duration?: number
  rating?: number
  searchQuery?: string
  metadata?: Record<string, unknown>
}

/**
 * 个性化推荐参数
 */
export interface PersonalizedRecommendationParams {
  limit?: number
  offset?: number
  refresh?: boolean
}

/**
 * 热门推荐参数
 */
export interface HotRecommendationParams {
  limit?: number
  offset?: number
  period?: 'daily' | 'weekly' | 'monthly' | 'all'
}

/**
 * 相似书籍推荐参数
 */
export interface SimilarRecommendationParams {
  bookId: string
  limit?: number
  offset?: number
}

/**
 * 分类推荐参数
 */
export interface CategoryRecommendationParams {
  categoryId: string
  limit?: number
  offset?: number
  sortBy?: 'popularity' | 'rating' | 'latest'
}

/**
 * 首页推荐参数
 */
export interface HomepageRecommendationParams {
  limit?: number
  includePersonalized?: boolean
  includeHot?: boolean
  includeCategory?: boolean
}

/**
 * 推荐响应
 */
export interface RecommendationResponse {
  books: RecommendedBook[]
  total: number
  refreshedAt?: string
  algorithm?: string
}

/**
 * 首页推荐响应
 */
export interface HomepageRecommendationResponse {
  personalized?: RecommendationResponse
  hot?: RecommendationResponse
  categories?: CategoryRecommendationItem[]
}

/**
 * 分类推荐项
 */
export interface CategoryRecommendationItem {
  categoryId: string
  categoryName: string
  books: RecommendedBook[]
}

/**
 * 推荐 API 接口 (v1.0)
 * @description 对接后端 /api/v1/recommendation 路由
 * @endpoint /api/v1/recommendation
 * @category reader
 * @tags 推荐系统
 */
export const recommendationAPI = {
  /**
   * 获取个性化推荐
   * @description 基于用户阅读历史和偏好，返回个性化推荐的书籍列表
   * @endpoint GET /api/v1/recommendation/personalized
   * @category reader
   * @tags 推荐系统
   * @param {PersonalizedRecommendationParams} params - 查询参数（数量限制、偏移量、是否刷新）
   * @response {APIResponse<RecommendationResponse>} 200 - 成功返回个性化推荐列表
   * @security BearerAuth
   */
  async getPersonalized(
    params?: PersonalizedRecommendationParams
  ): Promise<APIResponse<RecommendationResponse>> {
    return httpClient.get<APIResponse<RecommendationResponse>>(
      '/recommendation/personalized',
      { params }
    )
  },

  /**
   * 获取热门推荐
   * @description 返回当前热门的书籍列表，支持按时间周期筛选
   * @endpoint GET /api/v1/recommendation/hot
   * @category reader
   * @tags 推荐系统
   * @param {HotRecommendationParams} params - 查询参数（数量限制、时间周期）
   * @response {APIResponse<RecommendationResponse>} 200 - 成功返回热门推荐列表
   */
  async getHot(
    params?: HotRecommendationParams
  ): Promise<APIResponse<RecommendationResponse>> {
    return httpClient.get<APIResponse<RecommendationResponse>>('/recommendation/hot', {
      params
    })
  },

  /**
   * 获取相似书籍推荐
   * @description 基于指定书籍，返回相似的其他书籍推荐
   * @endpoint GET /api/v1/recommendation/similar
   * @category reader
   * @tags 推荐系统
   * @param {SimilarRecommendationParams} params - 查询参数（书籍ID、数量限制）
   * @response {APIResponse<RecommendationResponse>} 200 - 成功返回相似书籍列表
   */
  async getSimilar(
    params: SimilarRecommendationParams
  ): Promise<APIResponse<RecommendationResponse>> {
    return httpClient.get<APIResponse<RecommendationResponse>>('/recommendation/similar', {
      params
    })
  },

  /**
   * 获取分类推荐
   * @description 返回指定分类下的推荐书籍
   * @endpoint GET /api/v1/recommendation/category
   * @category reader
   * @tags 推荐系统
   * @param {CategoryRecommendationParams} params - 查询参数（分类ID、数量限制、排序方式）
   * @response {APIResponse<RecommendationResponse>} 200 - 成功返回分类推荐列表
   */
  async getByCategory(
    params: CategoryRecommendationParams
  ): Promise<APIResponse<RecommendationResponse>> {
    return httpClient.get<APIResponse<RecommendationResponse>>('/recommendation/category', {
      params
    })
  },

  /**
   * 记录用户行为
   * @description 记录用户的阅读行为，用于优化推荐算法
   * @endpoint POST /api/v1/recommendation/behavior
   * @category reader
   * @tags 推荐系统
   * @param {UserBehavior} behavior - 用户行为数据（书籍ID、行为类型、时长等）
   * @response {APIResponse<void>} 200 - 成功记录用户行为
   * @security BearerAuth
   */
  async recordBehavior(behavior: UserBehavior): Promise<APIResponse<void>> {
    return httpClient.post<APIResponse<void>>('/recommendation/behavior', behavior)
  },

  /**
   * 获取首页推荐
   * @description 获取首页混合推荐（包含个性化推荐、热门推荐、分类推荐）
   * @endpoint GET /api/v1/recommendation/homepage
   * @category reader
   * @tags 推荐系统
   * @param {HomepageRecommendationParams} params - 查询参数（数量限制、包含类型）
   * @response {APIResponse<HomepageRecommendationResponse>} 200 - 成功返回首页推荐
   */
  async getHomepage(
    params?: HomepageRecommendationParams
  ): Promise<APIResponse<HomepageRecommendationResponse>> {
    return httpClient.get<APIResponse<HomepageRecommendationResponse>>(
      '/recommendation/homepage',
      { params }
    )
  }
}

// 向后兼容：导出函数式API
export const getPersonalizedRecommendation = (params?: PersonalizedRecommendationParams) =>
  recommendationAPI.getPersonalized(params)

export const getHotRecommendation = (params?: HotRecommendationParams) =>
  recommendationAPI.getHot(params)

export const getSimilarRecommendation = (params: SimilarRecommendationParams) =>
  recommendationAPI.getSimilar(params)

export const getCategoryRecommendation = (params: CategoryRecommendationParams) =>
  recommendationAPI.getByCategory(params)

export const recordUserBehavior = (behavior: UserBehavior) =>
  recommendationAPI.recordBehavior(behavior)

export const getHomepageRecommendation = (params?: HomepageRecommendationParams) =>
  recommendationAPI.getHomepage(params)

export default recommendationAPI
