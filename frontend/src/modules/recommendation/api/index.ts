/**
 * 推荐系统 API 统一导出
 *
 * 导出所有推荐系统相关 API 模块
 *
 * @module recommendation/api
 */

// 推荐系统 API
export * from './recommendation'
export {
  getPersonalizedRecommendations,
  getSimilarRecommendations,
  recordBehavior,
  getHomepageRecommendations,
  getTrendingRecommendations,
  getCategoryRecommendations
} from './recommendation'
