/**
 * 认证系统类型定义 (v1.3)
 * 基于 doc/api/frontend/认证API参考.md
 */

// ==================== 登录注册 ====================

/**
 * 登录凭证
 */
export interface LoginCredentials {
  username: string
  password: string
}

/**
 * 注册数据
 */
export interface RegisterData {
  username: string
  email: string
  password: string
  nickname?: string
}

/**
 * 登录响应
 */
export interface LoginResponse {
  token: string
  refreshToken?: string
  user: {
    id: string
    username: string
    email: string
    nickname?: string
    avatar?: string
    role?: string
  }
  permissions?: string[]
  roles?: string[]
  expiresAt?: string
  // Legacy fields for backward compatibility
  userID?: string
  username?: string
  role?: string
}

/**
 * Token刷新响应
 */
export interface TokenRefreshResponse {
  token: string
  expiresAt: string
}

// ==================== 权限角色 ====================

/**
 * 用户权限
 */
export interface UserPermission {
  id: string
  name: string
  code: string
  description?: string
  resource?: string
  action?: string
}

/**
 * 用户角色
 */
export interface UserRole {
  id: string
  name: string
  code: string
  description?: string
  permissions: string[] // 权限代码列表
}

/**
 * 权限列表响应
 */
export interface PermissionsResponse {
  permissions: UserPermission[]
}

/**
 * 角色列表响应
 */
export interface RolesResponse {
  roles: UserRole[]
}

// ==================== 用户信息 ====================

/**
 * 用户信息
 */
export interface UserInfo {
  id: string
  username: string
  email: string
  nickname?: string
  avatar?: string
  role?: string
  bio?: string
  phone?: string
  gender?: 'male' | 'female' | 'unknown'
  birthday?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * 用户更新数据
 */
export interface UserUpdateData {
  nickname?: string
  avatar?: string
  bio?: string
  phone?: string
  gender?: 'male' | 'female' | 'unknown'
  birthday?: string
}

/**
 * 密码修改数据
 */
export interface PasswordChangeData {
  oldPassword: string
  newPassword: string
}

/**
 * 可用性检查响应
 */
export interface AvailabilityResponse {
  available: boolean
  message?: string
}


