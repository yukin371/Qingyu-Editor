/**
 * 书评系统 API
 */
import { http } from '@/core/http'
import type { Review, ReviewComment, ReviewQuery, ReviewStats } from '@/types/review'

/**
 * 获取书籍书评列表
 */
export function getBookReviews(bookId: string, params?: Omit<ReviewQuery, 'bookId'>) {
  return http.get<{
    code: number
    message: string
    data: {
      list: Review[]
      total: number
      page: number
      size: number
    }
  }>(`/api/v1/books/${bookId}/reviews`, { params })
}

/**
 * 获取书评详情
 */
export function getReviewDetail(reviewId: string) {
  return http.get<{
    code: number
    message: string
    data: Review
  }>(`/api/v1/reviews/${reviewId}`)
}

/**
 * 发布书评
 */
export function createReview(data: {
  bookId: string
  title: string
  content: string
  rating: number
  isSpoiler?: boolean
}) {
  return http.post<{
    code: number
    message: string
    data: Review
  }>('/api/v1/reviews', data)
}

/**
 * 更新书评
 */
export function updateReview(reviewId: string, data: {
  title?: string
  content?: string
  rating?: number
}) {
  return http.put<{
    code: number
    message: string
    data: Review
  }>(`/api/v1/reviews/${reviewId}`, data)
}

/**
 * 删除书评
 */
export function deleteReview(reviewId: string) {
  return http.delete<{
    code: number
    message: string
    data: { success: boolean }
  }>(`/api/v1/reviews/${reviewId}`)
}

/**
 * 点赞书评
 */
export function likeReview(reviewId: string) {
  return http.post<{
    code: number
    message: string
    data: { success: boolean; likeCount: number }
  }>(`/api/v1/reviews/${reviewId}/like`)
}

/**
 * 取消点赞书评
 */
export function unlikeReview(reviewId: string) {
  return http.delete<{
    code: number
    message: string
    data: { success: boolean; likeCount: number }
  }>(`/api/v1/reviews/${reviewId}/like`)
}

/**
 * 获取书评统计
 */
export function getReviewStats(bookId: string) {
  return http.get<{
    code: number
    message: string
    data: ReviewStats
  }>(`/api/v1/books/${bookId}/reviews/stats`)
}

/**
 * 获取书评评论列表
 */
export function getReviewComments(reviewId: string, params?: { page?: number; size?: number }) {
  return http.get<{
    code: number
    message: string
    data: {
      list: ReviewComment[]
      total: number
    }
  }>(`/api/v1/reviews/${reviewId}/comments`, { params })
}

/**
 * 发表书评评论
 */
export function createReviewComment(reviewId: string, data: {
  content: string
  parentId?: string
}) {
  return http.post<{
    code: number
    message: string
    data: ReviewComment
  }>(`/api/v1/reviews/${reviewId}/comments`, data)
}
