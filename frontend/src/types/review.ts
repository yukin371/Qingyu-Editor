/**
 * 书评系统类型定义
 */

/**
 * 书评类型
 */
export type ReviewType = 'normal' | 'spoiler' | 'premium'

/**
 * 书评排序
 */
export type ReviewSort = 'latest' | 'hottest' | 'highest'

/**
 * 书评
 */
export interface Review {
  id: string
  bookId: string
  userId: string
  user: {
    id: string
    username: string
    nickname: string
    avatar: string
    level: number
  }
  title: string
  content: string
  rating: number          // 1-5星
  type: ReviewType
  likeCount: number
  commentCount: number
  isLiked: boolean
  isSpoiler: boolean
  createdAt: string
  updatedAt: string
}

/**
 * 书评评论
 */
export interface ReviewComment {
  id: string
  reviewId: string
  userId: string
  user: {
    id: string
    username: string
    nickname: string
    avatar: string
  }
  content: string
  likeCount: number
  isLiked: boolean
  parentId?: string
  replyTo?: {
    id: string
    username: string
  }
  createdAt: string
}

/**
 * 书评查询参数
 */
export interface ReviewQuery {
  bookId: string
  type?: ReviewType
  sort?: ReviewSort
  page?: number
  size?: number
}

/**
 * 书评统计
 */
export interface ReviewStats {
  total: number
  averageRating: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}
