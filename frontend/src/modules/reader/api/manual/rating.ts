/**
 * 评分相关 API
 * 对接后端 /api/v1/bookstore/ratings 路由
 * 后端路由文档: Qingyu_backend/router/bookstore/bookstore_router.go
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse } from '@/types/api'

/**
 * 书籍评分信息
 */
export interface BookRating {
  bookId: string
  averageRating?: number
  averageScore: number
  totalRatings: number
  totalCount?: number
  distribution?: Record<string, number>
  scoreDistribution?: {
    score: number
    count: number
  }[]
}

/**
 * 用户评分信息
 */
export interface UserRating {
  id: string
  bookId: string
  userId: string
  score: number
  review?: string
  createdAt: string
  updatedAt: string
}

/**
 * 评分 API 接口 (v1.0)
 * 对接后端: /api/v1/bookstore/ratings
 */
export const ratingAPI = {
  /**
   * 获取书籍评分统计
   * GET /api/v1/bookstore/ratings/book/:bookId
   */
  async getBookRating(bookId: string): Promise<APIResponse<BookRating>> {
    return httpService.get<APIResponse<BookRating>>(`/bookstore/ratings/book/${bookId}`)
  },

  /**
   * 提交书籍评分
   * POST /api/v1/bookstore/ratings
   */
  async rateBook(bookId: string, score: number, review?: string): Promise<APIResponse<UserRating>> {
    return httpService.post<APIResponse<UserRating>>('/bookstore/ratings', {
      bookId,
      score,
      review,
    })
  },

  /**
   * 获取用户对书籍的评分
   * GET /api/v1/bookstore/ratings/user/me/book/:bookId
   */
  async getUserBookRating(bookId: string): Promise<APIResponse<UserRating | null>> {
    return httpService.get<APIResponse<UserRating | null>>(
      `/bookstore/ratings/user/me/book/${bookId}`,
    )
  },

  /**
   * 更新评分
   * PUT /api/v1/bookstore/ratings/:id
   */
  async updateRating(
    ratingId: string,
    score: number,
    review?: string,
  ): Promise<APIResponse<UserRating>> {
    return httpService.put<APIResponse<UserRating>>(`/bookstore/ratings/${ratingId}`, {
      score,
      review,
    })
  },

  /**
   * 删除评分
   * DELETE /api/v1/bookstore/ratings/:id
   */
  async deleteRating(ratingId: string): Promise<APIResponse<void>> {
    return httpService.delete<APIResponse<void>>(`/bookstore/ratings/${ratingId}`)
  },
}

// 向后兼容：导出便捷函数。update/delete 参数为 ratingId，不是 bookId。
export const getBookRating = (bookId: string) => ratingAPI.getBookRating(bookId)
export const rateBook = (bookId: string, score: number, review?: string) =>
  ratingAPI.rateBook(bookId, score, review)
export const getUserBookRating = (bookId: string) => ratingAPI.getUserBookRating(bookId)
export const updateRating = (ratingId: string, score: number, review?: string) =>
  ratingAPI.updateRating(ratingId, score, review)
export const deleteRating = (ratingId: string) => ratingAPI.deleteRating(ratingId)

export default ratingAPI
