/**
 * 用户相关类型定义
 */

// ============ 认证相关 ============

/**
 * 注册请求
 */
export interface RegisterRequest {
  username: string
  password: string
  email: string
  nickname?: string
}

/**
 * 登录请求
 */
export interface LoginRequest {
  username: string
  password: string
}

/**
 * 登录响应
 */
export interface LoginResponse {
  token: string
  user: UserInfo
  expiresIn?: number
}

// ============ 用户信息 ============

/**
 * 用户信息
 */
export interface UserInfo {
  id: string
  username: string
  email: string
  nickname?: string
  avatar?: string
  bio?: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
  location?: string
  role: 'user' | 'writer' | 'admin'
  status: 'active' | 'banned' | 'pending'
  createdAt: string
  updatedAt: string

  // 统计信息
  stats?: {
    booksCount?: number
    wordsCount?: number
    followersCount?: number
    followingCount?: number
    collectCount?: number
  }
}

/**
 * 更新个人信息请求
 */
export interface UpdateProfileRequest {
  nickname?: string
  avatar?: string
  bio?: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
  location?: string
}

