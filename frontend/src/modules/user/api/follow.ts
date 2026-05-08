/**
 * 关注功能 API
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse, PaginatedResponse } from '@/types/api'

/**
 * 关注信息
 */
export interface FollowInfo {
  id: string
  followerId: string
  followingId: string
  followType: 'user' | 'author'
  isMutual: boolean
  createdAt: string
}

/**
 * 关注统计
 */
export interface FollowStats {
  followerCount: number
  followingCount: number
  mutualCount: number
}

/**
 * 作者关注信息
 */
export interface AuthorFollow {
  id: string
  userId: string
  authorId: string
  authorName: string
  authorAvatar?: string
  notifyNewBook: boolean
  createdAt: string
}

/**
 * 关注API
 */
export const followAPI = {
  /**
   * 关注用户
   * POST /api/v1/social/users/:userId/follow
   */
  async followUser(userId: string): Promise<APIResponse<void>> {
    return httpService.post<APIResponse<void>>(`/social/users/${userId}/follow`)
  },

  /**
   * 取消关注用户
   * DELETE /api/v1/social/users/:userId/unfollow
   */
  async unfollowUser(userId: string): Promise<APIResponse<void>> {
    return httpService.delete<APIResponse<void>>(`/social/users/${userId}/unfollow`)
  },

  /**
   * 检查关注状态
   * GET /api/v1/social/users/:userId/follow-status
   */
  async checkFollowStatus(userId: string): Promise<APIResponse<{ is_following: boolean }>> {
    return httpService.get<APIResponse<{ is_following: boolean }>>(`/social/users/${userId}/follow-status`)
  },

  /**
   * 获取粉丝列表
   * GET /api/v1/social/users/:userId/followers
   */
  async getFollowers(userId: string, page: number = 1, size: number = 20): Promise<PaginatedResponse<FollowInfo>> {
    return httpService.get<PaginatedResponse<FollowInfo>>(`/social/users/${userId}/followers`, {
      params: { page, size }
    })
  },

  /**
   * 获取关注列表
   * GET /api/v1/social/users/:userId/following
   */
  async getFollowing(userId: string, page: number = 1, size: number = 20): Promise<PaginatedResponse<FollowInfo>> {
    return httpService.get<PaginatedResponse<FollowInfo>>(`/social/users/${userId}/following`, {
      params: { page, size }
    })
  },

  /**
   * 获取关注的作者列表
   * GET /api/v1/social/following/authors
   */
  async getFollowingAuthors(page: number = 1, size: number = 20): Promise<PaginatedResponse<AuthorFollow>> {
    return httpService.get<PaginatedResponse<AuthorFollow>>('/social/following/authors', {
      params: { page, size }
    })
  }
}

// 便捷导出函数
export const followUser = (userId: string) => followAPI.followUser(userId)
export const unfollowUser = (userId: string) => followAPI.unfollowUser(userId)
export const checkFollowStatus = (userId: string) => followAPI.checkFollowStatus(userId)
export const getFollowers = (userId: string, page?: number, size?: number) => followAPI.getFollowers(userId, page, size)
export const getFollowing = (userId: string, page?: number, size?: number) => followAPI.getFollowing(userId, page, size)
export const getFollowingAuthors = (page?: number, size?: number) => followAPI.getFollowingAuthors(page, size)

export default followAPI
