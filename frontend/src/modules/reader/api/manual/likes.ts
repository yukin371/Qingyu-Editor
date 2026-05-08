/**
 * 点赞相关 API
 * 对接后端 /api/v1/social/ 路由
 * 后端路由文档: Qingyu_backend/router/social/social_router.go
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse, PaginatedResponse } from '@/types/api'

/**
 * 点赞信息
 */
export interface LikeInfo {
  isLiked: boolean
  likeCount: number
}

/**
 * 用户点赞统计
 */
export interface UserLikeStats {
  totalLikes: number
  bookLikes: number
  commentLikes: number
}

/**
 * 点赞 API 接口 (v2.0)
 * @description 对接后端 /api/v1/social/
 * @endpoint /api/v1/social
 * @category reader
 * @tags 点赞管理
 */
export const likesAPI = {
  /**
   * 点赞书籍
   * @description 为指定书籍点赞
   * @endpoint POST /api/v1/social/books/:bookId/like
   * @category reader
   * @tags 点赞管理
   * @param {string} bookId - 书籍ID
   * @response {APIResponse<void>} 201 - 成功点赞
   * @security BearerAuth
   */
  async likeBook(bookId: string): Promise<APIResponse<void>> {
    return httpService.post<APIResponse<void>>(`/social/books/${bookId}/like`)
  },

  /**
   * 取消点赞书籍
   * @description 取消对指定书籍的点赞
   * @endpoint DELETE /api/v1/social/books/:bookId/like
   * @category reader
   * @tags 点赞管理
   * @param {string} bookId - 书籍ID
   * @response {APIResponse<void>} 204 - 成功取消点赞
   * @security BearerAuth
   */
  async unlikeBook(bookId: string): Promise<APIResponse<void>> {
    return httpService.delete<APIResponse<void>>(`/social/books/${bookId}/like`)
  },

  /**
   * 获取书籍点赞信息
   * @description 获取指定书籍的点赞信息（点赞数和当前用户是否已点赞）
   * @endpoint GET /api/v1/social/books/:bookId/like
   * @category reader
   * @tags 点赞管理
   * @param {string} bookId - 书籍ID
   * @response {APIResponse<LikeInfo>} 200 - 成功返回点赞信息
   * @security BearerAuth
   */
  async getBookLikeInfo(bookId: string): Promise<APIResponse<LikeInfo>> {
    return httpService.get<APIResponse<LikeInfo>>(`/social/books/${bookId}/like`)
  },

  /**
   * 获取用户点赞的书籍列表
   * @description 获取当前用户点赞的所有书籍，支持分页
   * @endpoint GET /api/v1/social/likes/books
   * @category reader
   * @tags 点赞管理
   * @param {Object} [params] - 查询参数（可选）
   * @param {number} [params.page] - 页码（默认1）
   * @param {number} [params.pageSize] - 每页数量（默认20）
   * @response {PaginatedResponse<any>} 200 - 成功返回点赞的书籍列表
   * @security BearerAuth
   */
  async getUserLikedBooks(params?: {
    page?: number
    pageSize?: number
  }): Promise<PaginatedResponse<any>> {
    return httpService.get<PaginatedResponse<any>>('/social/likes/books', { params })
  },

  /**
   * 获取用户点赞统计
   * @description 获取当前用户的点赞统计信息
   * @endpoint GET /api/v1/social/likes/stats
   * @category reader
   * @tags 点赞管理
   * @response {APIResponse<UserLikeStats>} 200 - 成功返回点赞统计数据
   * @security BearerAuth
   */
  async getUserLikeStats(): Promise<APIResponse<UserLikeStats>> {
    return httpService.get<APIResponse<UserLikeStats>>('/social/likes/stats')
  }
}

// 向后兼容：导出旧的函数名
export const likeBook = (bookId: string) => likesAPI.likeBook(bookId)
export const unlikeBook = (bookId: string) => likesAPI.unlikeBook(bookId)
export const getBookLikeInfo = (bookId: string) => likesAPI.getBookLikeInfo(bookId)
export const getUserLikedBooks = (params?: any) => likesAPI.getUserLikedBooks(params)
export const getUserLikeStats = () => likesAPI.getUserLikeStats()

export default likesAPI
