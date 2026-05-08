/**
 * 书评 API
 */
import request from '../request'

// 书评类型
export type ReviewType = 'book' | 'chapter' | 'list'

// 书评状态
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'deleted'

// 书评
export interface Review {
  id: string
  reviewer_id: string
  reviewer_name: string
  reviewer_avatar: string
  target_id: string
  target_type: ReviewType
  book_id?: string
  book_title?: string
  book_cover?: string
  chapter_id?: string
  chapter_title?: string
  title: string
  content: string
  rating: number
  like_count: number
  comment_count: number
  is_spoiler: boolean
  status: ReviewStatus
  created_at: string
  updated_at: string
}

// 书评评论
export interface ReviewComment {
  id: string
  review_id: string
  commenter_id: string
  commenter_name: string
  commenter_avatar: string
  content: string
  like_count: number
  created_at: string
}

// 书评统计
export interface ReviewStats {
  total_reviews: number
  average_rating: number
  rating_distribution: {
    rating: number
    count: number
  }[]
}

/**
 * 获取书评列表
 */
export function getReviews(params: {
  page?: number
  page_size?: number
  target_id?: string
  target_type?: ReviewType
  user_id?: string
  book_id?: string
  sort?: 'latest' | 'hot' | 'rating'
  rating?: number
}) {
  return request<{
    items: Review[]
    total: number
    page: number
    page_size: number
  }>({
    url: '/api/v1/social/reviews',
    method: 'get',
    params
  })
}

/**
 * 获取书评详情
 */
export function getReviewDetail(id: string) {
  return request<Review & { comments: ReviewComment[] }>({
    url: `/api/v1/social/reviews/${id}`,
    method: 'get'
  })
}

/**
 * 创建书评
 */
export function createReview(data: {
  target_id: string
  target_type: ReviewType
  title: string
  content: string
  rating: number
  is_spoiler?: boolean
}) {
  return request<Review>({
    url: '/api/v1/social/reviews',
    method: 'post',
    data
  })
}

/**
 * 更新书评
 */
export function updateReview(id: string, data: {
  title?: string
  content?: string
  rating?: number
  is_spoiler?: boolean
}) {
  return request<Review>({
    url: `/api/v1/social/reviews/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除书评
 */
export function deleteReview(id: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/social/reviews/${id}`,
    method: 'delete'
  })
}

/**
 * 点赞书评
 */
export function likeReview(id: string) {
  return request<{ success: boolean; like_count: number }>({
    url: `/api/v1/social/reviews/${id}/like`,
    method: 'post'
  })
}

/**
 * 取消点赞书评
 */
export function unlikeReview(id: string) {
  return request<{ success: boolean; like_count: number }>({
    url: `/api/v1/social/reviews/${id}/like`,
    method: 'delete'
  })
}

/**
 * 获取书评评论
 */
export function getReviewComments(reviewId: string, params?: {
  page?: number
  page_size?: number
}) {
  return request<{
    items: ReviewComment[]
    total: number
    page: number
    page_size: number
  }>({
    url: `/api/v1/social/reviews/${reviewId}/comments`,
    method: 'get',
    params
  })
}

/**
 * 添加书评评论
 */
export function addReviewComment(reviewId: string, data: {
  content: string
}) {
  return request<ReviewComment>({
    url: `/api/v1/social/reviews/${reviewId}/comments`,
    method: 'post',
    data
  })
}

/**
 * 删除书评评论
 */
export function deleteReviewComment(reviewId: string, commentId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/social/reviews/${reviewId}/comments/${commentId}`,
    method: 'delete'
  })
}

/**
 * 获取书评统计
 */
export function getReviewStats(params?: {
  target_id?: string
  target_type?: ReviewType
  book_id?: string
}) {
  return request<ReviewStats>({
    url: '/api/v1/social/reviews/stats',
    method: 'get',
    params
  })
}

/**
 * 获取我的书评
 */
export function getMyReviews(params?: {
  page?: number
  page_size?: number
  target_type?: ReviewType
}) {
  return request<{
    items: Review[]
    total: number
    page: number
    page_size: number
  }>({
    url: '/api/v1/social/reviews/my',
    method: 'get',
    params
  })
}

/**
 * 获取热门书评
 */
export function getHotReviews(limit = 10) {
  return request<Review[]>({
    url: '/api/v1/social/reviews/hot',
    method: 'get',
    params: { limit }
  })
}

/**
 * 举报书评
 */
export function reportReview(id: string, data: {
  reason: string
  description?: string
}) {
  return request<{ success: boolean }>({
    url: `/api/v1/social/reviews/${id}/report`,
    method: 'post',
    data
  })
}
