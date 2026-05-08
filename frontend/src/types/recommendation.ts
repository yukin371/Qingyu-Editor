/**
 * 推荐系统类型定义 (v1.3)
 * 基于 doc/api/frontend/推荐系统API参考.md
 */

import type { BookBrief } from './bookstore'

// ==================== 推荐结果相关 ====================

/**
 * 推荐结果
 */
export interface RecommendationResult {
  books: BookBrief[]
  reason?: string
  algorithm?: string // 推荐算法
  confidence?: number // 置信度
}

/**
 * 推荐项
 */
export interface RecommendationItem {
  bookId: string
  book?: BookBrief
  title: string
  author: string
  cover?: string
  rating?: number
  reason?: string
  score?: number // 推荐分数
  tags?: string[]
}

/**
 * 相似物品
 */
export interface SimilarItem {
  book: BookBrief
  similarity: number // 相似度 0-1
  reason: string
  commonTags?: string[]
}

// ==================== 用户行为相关 ====================

/**
 * 行为类型
 */
export type BehaviorType = 'view' | 'click' | 'like' | 'collect' | 'read' | 'search' | 'finish' | 'share' | 'purchase'

/**
 * 物品类型
 */
export type ItemType = 'book' | 'chapter' | 'category' | 'tag'

/**
 * 用户行为
 */
export interface UserBehavior {
  itemId: string
  itemType: ItemType
  behaviorType: BehaviorType
  duration?: number // 持续时间（秒）
  timestamp?: string
  context?: Record<string, unknown> // 额外上下文信息
}

/**
 * 行为记录参数
 */
export interface BehaviorRecordParams {
  itemId: string
  itemType: ItemType
  behaviorType: BehaviorType
  duration?: number
  context?: Record<string, unknown>
}

// ==================== 推荐策略相关 ====================

/**
 * 推荐策略
 */
export type RecommendationStrategy =
  | 'collaborative' // 协同过滤
  | 'content_based' // 基于内容
  | 'hot' // 热门推荐
  | 'hybrid' // 混合策略

/**
 * 推荐参数
 */
export interface RecommendationParams {
  limit?: number
  strategy?: RecommendationStrategy
  excludeIds?: string[] // 排除的书籍ID
  categoryId?: string
}

/**
 * 个性化推荐参数
 */
export interface PersonalizedRecommendationParams {
  limit?: number
  strategy?: RecommendationStrategy
  context?: {
    recentReadBooks?: string[]
    preferredCategories?: string[]
    preferredTags?: string[]
  }
}

/**
 * 相似推荐参数
 */
export interface SimilarRecommendationParams {
  itemId: string
  itemType?: ItemType
  limit?: number
  threshold?: number // 相似度阈值
}

/**
 * 分类推荐参数
 */
export interface CategoryRecommendationParams {
  category: string
  limit?: number
  sortBy?: 'score' | 'hot' | 'latest'
}

/**
 * 热门推荐参数
 */
export interface HotRecommendationParams {
  limit?: number
  days?: number // 统计天数
  categoryId?: string
}

// ==================== 推荐统计相关 ====================

/**
 * 推荐效果统计
 */
export interface RecommendationStats {
  totalRecommendations: number
  clickRate: number
  conversionRate: number
  averageScore: number
}

/**
 * 用户偏好
 */
export interface UserPreference {
  userId: string
  preferredCategories: string[]
  preferredTags: string[]
  preferredAuthors: string[]
  readingHabits: {
    favoriteTime?: string[] // 常用阅读时间段
    averageReadingDuration?: number
    preferredWordCount?: {
      min: number
      max: number
    }
  }
}

