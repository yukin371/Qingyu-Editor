/**
 * 关注系统 API
 * @description 对接后端 /api/v1/social/follow 路由，提供用户关注、粉丝管理等功能
 * @endpoint /api/v1/social/follow
 * @category social
 * @tags 关注系统
 */
import request from '../request'

// 用户关系
export interface UserRelation {
  following_id: string
  follower_id: string
  created_at: string
}

// 用户关注信息
export interface UserFollowInfo {
  user_id: string
  username: string
  avatar_url?: string
  bio?: string
  follower_count: number
  following_count: number
  is_following?: boolean
  is_followed_by?: boolean
  created_at?: string
}

// 关注统计
export interface FollowStats {
  follower_count: number
  following_count: number
  mutual_count: number
}

/**
 * 获取用户关注列表
 * @description 获取指定用户的关注列表，支持分页
 * @endpoint GET /api/v1/social/follow/following
 * @category social
 * @tags 关注系统
 * @param {Object} params - 查询参数
 * @param {string} [params.user_id] - 用户ID，不传则获取当前用户的关注列表
 * @param {number} [params.page] - 页码
 * @param {number} [params.page_size] - 每页数量
 * @response {{items: UserFollowInfo[], total: number, page: number, page_size: number}} 200 - 成功返回关注列表
 * @security BearerAuth
 */
export function getFollowingList(params: {
  user_id?: string
  page?: number
  page_size?: number
}) {
  return request<{
    items: UserFollowInfo[]
    total: number
    page: number
    page_size: number
  }>({
    url: '/api/v1/social/follow/following',
    method: 'get',
    params
  })
}

/**
 * 获取用户粉丝列表
 * @description 获取指定用户的粉丝列表，支持分页
 * @endpoint GET /api/v1/social/follow/followers
 * @category social
 * @tags 关注系统
 * @param {Object} params - 查询参数
 * @param {string} [params.user_id] - 用户ID，不传则获取当前用户的粉丝列表
 * @param {number} [params.page] - 页码
 * @param {number} [params.page_size] - 每页数量
 * @response {{items: UserFollowInfo[], total: number, page: number, page_size: number}} 200 - 成功返回粉丝列表
 * @security BearerAuth
 */
export function getFollowersList(params: {
  user_id?: string
  page?: number
  page_size?: number
}) {
  return request<{
    items: UserFollowInfo[]
    total: number
    page: number
    page_size: number
  }>({
    url: '/api/v1/social/follow/followers',
    method: 'get',
    params
  })
}

/**
 * 关注用户
 * @description 关注指定用户
 * @endpoint POST /api/v1/social/follow/:userId
 * @category social
 * @tags 关注系统
 * @param {string} userId - 要关注的用户ID
 * @response {{success: boolean}} 201 - 成功关注
 * @security BearerAuth
 */
export function followUser(userId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/social/follow/${userId}`,
    method: 'post'
  })
}

/**
 * 取消关注用户
 * @description 取消关注指定用户
 * @endpoint DELETE /api/v1/social/follow/:userId
 * @category social
 * @tags 关注系统
 * @param {string} userId - 要取消关注的用户ID
 * @response {{success: boolean}} 204 - 成功取消关注
 * @security BearerAuth
 */
export function unfollowUser(userId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/social/follow/${userId}`,
    method: 'delete'
  })
}

/**
 * 获取关注统计
 * @description 获取用户的关注和粉丝数量统计
 * @endpoint GET /api/v1/social/follow/stats
 * @category social
 * @tags 关注系统
 * @param {string} [userId] - 用户ID，不传则获取当前用户的统计
 * @response {FollowStats} 200 - 成功返回关注统计
 * @security BearerAuth
 */
export function getFollowStats(userId?: string) {
  return request<FollowStats>({
    url: '/api/v1/social/follow/stats',
    method: 'get',
    params: userId ? { user_id: userId } : undefined
  })
}

/**
 * 检查是否关注用户
 * @description 检查当前用户是否关注了指定用户
 * @endpoint GET /api/v1/social/follow/:userId/status
 * @category social
 * @tags 关注系统
 * @param {string} userId - 要检查的用户ID
 * @response {{is_following: boolean}} 200 - 成功返回关注状态
 * @security BearerAuth
 */
export function checkFollowStatus(userId: string) {
  return request<{ is_following: boolean }>({
    url: `/api/v1/social/follow/${userId}/status`,
    method: 'get'
  })
}

/**
 * 获取推荐关注
 * @description 获取系统推荐的关注的用户列表
 * @endpoint GET /api/v1/social/follow/recommended
 * @category social
 * @tags 关注系统
 * @param {number} limit - 返回数量限制（默认10）
 * @response {UserFollowInfo[]} 200 - 成功返回推荐关注列表
 * @security BearerAuth
 */
export function getRecommendedFollows(limit = 10) {
  return request<UserFollowInfo[]>({
    url: '/api/v1/social/follow/recommended',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取互关好友
 * @description 获取与当前用户互相关注的好友列表
 * @endpoint GET /api/v1/social/follow/mutual
 * @category social
 * @tags 关注系统
 * @param {number} limit - 返回数量限制（默认20）
 * @response {UserFollowInfo[]} 200 - 成功返回互关好友列表
 * @security BearerAuth
 */
export function getMutualFollows(limit = 20) {
  return request<UserFollowInfo[]>({
    url: '/api/v1/social/follow/mutual',
    method: 'get',
    params: { limit }
  })
}

/**
 * 关注系统 API 对象
 */
export const followAPI = {
  getFollowingList,
  getFollowersList,
  followUser,
  unfollowUser,
  getFollowStats,
  checkFollowStatus,
  getRecommendedFollows,
  getMutualFollows
}
