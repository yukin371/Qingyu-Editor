/**
 * Admin Types
 */

/**
 * Dashboard Statistics
 */
export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalBooks: number
  totalRevenue: number
  pendingReviews: number
  pendingWithdrawals: number
  todayStats?: {
    newUsers: number
    newBooks: number
    revenue: number
  }
}

/**
 * Review Item
 */
export interface ReviewItem {
  id: string
  type: 'book' | 'chapter' | 'comment'
  contentId: string
  title: string
  authorId: string
  authorName: string
  content?: string
  status: 'pending' | 'approved' | 'rejected'
  submitTime: number
  reviewTime?: number
  reviewerId?: string
  feedback?: string
}

/**
 * Withdrawal Request
 */
export interface WithdrawalRequest {
  id: string
  userId: string
  userName: string
  amount: number
  fee: number
  actualAmount: number
  account: string
  accountType: 'alipay' | 'bank'
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  requestTime: number
  processTime?: number
  processorId?: string
  reason?: string
}

/**
 * User Management Item
 */
export interface UserManagementItem {
  id: string
  username: string
  email?: string
  phone?: string
  roles: string[]
  status: 'active' | 'banned' | 'inactive'
  registerTime: number
  lastLoginTime?: number
  banReason?: string
  banUntil?: number
}

/**
 * Operation Log
 */
export interface OperationLog {
  id: string
  operatorId: string
  operatorName: string
  action: string
  target: string
  targetId: string
  details?: string
  result: 'success' | 'failure'
  timestamp: number
  ip?: string
}

/**
 * Announcement
 */
export interface Announcement {
  id: string
  title: string
  content: string
  type: 'system' | 'event' | 'maintenance'
  priority: 'low' | 'medium' | 'high'
  status: 'active' | 'inactive'
  effectiveStartTime: string
  effectiveEndTime: string
  targetUsers?: string[]
  createdAt: string
  updatedAt?: string

  // 别名属性，兼容不同API版本
  isActive?: boolean // = status === 'active'
  startTime?: string // = effectiveStartTime
  endTime?: string // = effectiveEndTime
  targetRole?: 'all' | 'reader' | 'writer' | 'admin'
  viewCount?: number
}

/**
 * Banner
 */
export interface Banner {
  id: string
  title: string
  imageUrl: string
  link?: string
  position: string
  sortOrder?: number
  status: 'active' | 'inactive'
  startTime?: string
  endTime?: string
  createdAt: string
  updatedAt?: string

  // 别名属性，兼容不同API版本
  isActive?: boolean // = status === 'active'
  description?: string
  image?: string // = imageUrl
  target?: string
  targetType?: string
  clickCount?: number
}

/**
 * Config Group
 */
export interface ConfigGroup {
  key: string
  label: string
  description?: string
  items: ConfigItem[]
  name?: string // 别名，兼容
}

/**
 * Config Item
 */
export interface ConfigItem {
  key: string
  label: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'json'
  description?: string // 别名，兼容
  editable?: boolean // 别名，兼容
  sensitive?: boolean // 别名，兼容
}

/**
 * Update Config Request
 */
export interface UpdateConfigRequest {
  key: string
  value: any
}
