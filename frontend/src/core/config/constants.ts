/**
 * Application Constants
 * Shared constants across the application
 */

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'qingyu_auth_token',
  USER_INFO: 'qingyu_user_info',
  SEARCH_HISTORY: 'qingyu_search_history',
  THEME: 'qingyu_theme',
  READING_SETTINGS: 'qingyu_reading_settings'
} as const

// Cache Keys
export const CACHE_KEYS = {
  HOMEPAGE_DATA: 'homepage_data',
  CATEGORIES: 'categories',
  USER_PROFILE: 'user_profile'
} as const

// Cache TTL (Time to Live) in milliseconds
export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000 // 24 hours
} as const

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const

// User Roles
export const USER_ROLES = {
  GUEST: 'guest',
  USER: 'user',
  AUTHOR: 'author',
  ADMIN: 'admin'
} as const

// Ranking Types
export const RANKING_TYPES = {
  REALTIME: 'realtime',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  NEWBIE: 'newbie'
} as const

// Book Status
export const BOOK_STATUS = {
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  PAUSED: 'paused'
} as const

// Transaction Types
export const TRANSACTION_TYPES = {
  RECHARGE: 'recharge',
  PURCHASE: 'purchase',
  REWARD: 'reward',
  WITHDRAW: 'withdraw',
  REFUND: 'refund'
} as const

// Review Status
export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const

// Regular Expressions
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^1[3-9]\d{9}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查您的网络设置',
  UNAUTHORIZED: '您的登录状态已过期，请重新登录',
  FORBIDDEN: '您没有权限执行此操作',
  NOT_FOUND: '请求的资源不存在',
  SERVER_ERROR: '服务器出现错误，请稍后重试',
  VALIDATION_ERROR: '输入的数据格式不正确',
  TIMEOUT: '请求超时，请稍后重试'
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登录成功',
  REGISTER_SUCCESS: '注册成功',
  LOGOUT_SUCCESS: '退出成功',
  UPDATE_SUCCESS: '更新成功',
  DELETE_SUCCESS: '删除成功',
  SAVE_SUCCESS: '保存成功'
} as const

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_SIZE: 20,
  MAX_SIZE: 100
} as const

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'text/plain']
} as const

export default {
  STORAGE_KEYS,
  CACHE_KEYS,
  CACHE_TTL,
  HTTP_STATUS,
  USER_ROLES,
  RANKING_TYPES,
  BOOK_STATUS,
  TRANSACTION_TYPES,
  REVIEW_STATUS,
  REGEX,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PAGINATION,
  FILE_UPLOAD
}
