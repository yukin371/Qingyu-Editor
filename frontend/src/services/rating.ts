import request from '@/modules/social/request'
import { API_PATHS } from '@/config/apiPaths'

export type TargetType = 'comment' | 'review' | 'book' | 'chapter'

export interface RatingStats {
  targetType: TargetType
  targetId: string
  averageRating: number
  totalRatings: number
  distribution: Record<number, number>
}

export interface UserRating {
  targetType: TargetType
  targetId: string
  rating: number
  createdAt: string
}

/**
 * 获取评分统计
 */
export function getRatingStats(targetType: TargetType, targetId: string) {
  return request<RatingStats>({
    url: API_PATHS.RATINGS.STATS(targetType, targetId),
    method: 'get'
  })
}

/**
 * 获取用户评分
 */
export function getUserRating(targetType: TargetType, targetId: string) {
  return request<UserRating | null>({
    url: API_PATHS.RATINGS.USER_RATING(targetType, targetId),
    method: 'get'
  })
}

/**
 * 提交评分
 */
export function submitRating(
  targetType: TargetType,
  targetId: string,
  rating: number
) {
  return request<void>({
    url: API_PATHS.RATINGS.CREATE(targetType, targetId),
    method: 'post',
    data: { rating }
  })
}

/**
 * 修改评分
 */
export function updateRating(
  targetType: TargetType,
  targetId: string,
  rating: number
) {
  return request<void>({
    url: API_PATHS.RATINGS.UPDATE(targetType, targetId),
    method: 'put',
    data: { rating }
  })
}

/**
 * 删除评分
 */
export function deleteRating(targetType: TargetType, targetId: string) {
  return request<void>({
    url: API_PATHS.RATINGS.DELETE(targetType, targetId),
    method: 'delete'
  })
}
