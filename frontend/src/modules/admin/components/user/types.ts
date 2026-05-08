/**
 * 用户管理模块类型定义
 */

/** 用户角色类型 */
export type UserRole = 'admin' | 'author' | 'reader'

/** 用户状态类型 */
export type UserStatus = 'active' | 'inactive' | 'banned'

/** 用户表单状态类型 */
export type UserFormStatus = 'active' | 'inactive' | 'banned'

/** 用户信息接口 */
export interface User {
  /** 用户ID */
  userId: string
  /** 用户名 */
  username: string
  /** 邮箱 */
  email: string
  /** 昵称 */
  nickname: string
  /** 角色 */
  role: UserRole
  /** 状态 */
  status: UserStatus
  /** 邮箱是否验证 */
  emailVerified: boolean
  /** 头像URL */
  avatar: string
  /** 个人简介 */
  bio: string
  /** 注册时间 */
  createdAt: string
  /** 最后登录时间 */
  lastLoginAt: string
}

/** 用户统计信息 */
export interface UserStats {
  /** 总用户数 */
  total: number
  /** 活跃用户数 */
  active: number
  /** 作者数 */
  authors: number
  /** 今日新增 */
  newToday: number
}

/** 筛选条件 */
export interface UserFilters {
  /** 关键词 */
  keyword: string
  /** 角色 */
  role: string
  /** 状态 */
  status: string
}

/** 分页参数 */
export interface UserPagination {
  /** 当前页 */
  page: number
  /** 每页数量 */
  pageSize: number
}

/** 对话框模式 */
export type DialogMode = 'view' | 'edit' | 'add'

/** 用户表单数据 */
export interface UserFormData {
  userId: string
  username: string
  email: string
  nickname: string
  role: UserRole
  status: UserFormStatus
  emailVerified: boolean
  bio: string
  avatar: string
  createdAt: string
  lastLoginAt: string
}

/** 批量添加表单数据 */
export interface BatchAddFormData {
  count: number
  role: UserRole
  status: UserStatus
  prefix: string
}
