/**
 * 共享服务类型定义 (v1.3)
 * 基于 doc/api/frontend/共享服务API参考.md
 */

// 类型从 ./api 导出，这里不重复导入

// ==================== 钱包相关 ====================

/**
 * 钱包信息
 * 金额字段单位：分 (需要除以100转换为元显示)
 */
export interface WalletInfo {
  userId: string
  balance: number // 单位：分
  frozenBalance?: number // 单位：分
  frozenAmount?: number // 单位：分
  availableAmount?: number // 单位：分
  totalIncome?: number // 单位：分
  totalExpense?: number // 单位：分
  currency?: string
  updatedAt?: string
}

/**
 * 交易类型
 */
export type TransactionType = 'recharge' | 'consume' | 'transfer' | 'withdraw' | 'income' | 'refund'

/**
 * 交易状态
 */
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'cancelled'

/**
 * 交易记录
 * 金额字段单位：分 (需要除以100转换为元显示)
 */
export interface Transaction {
  id: string
  userId: string
  type: TransactionType
  amount: number // 单位：分
  balance: number // 单位：分
  reason: string
  description?: string
  status: TransactionStatus
  relatedId?: string // 关联ID（如订单ID）
  createdAt: string
  updatedAt?: string
}

/**
 * 充值参数
 * amount 单位：分 (需要将用户输入的元乘以100)
 */
export interface RechargeParams {
  amount: number // 单位：分
  method: string // 支付方式
  channel?: string
}

/**
 * 消费参数
 * amount 单位：分 (需要将用户输入的元乘以100)
 */
export interface ConsumeParams {
  amount: number // 单位：分
  reason: string
  relatedId?: string
}

/**
 * 转账参数
 * amount 单位：分 (需要将用户输入的元乘以100)
 */
export interface TransferParams {
  toUserId: string
  targetUserId?: string
  amount: number // 单位：分
  reason?: string
}

/**
 * 转账请求（兼容）
 * amount 单位：分 (需要将用户输入的元乘以100)
 */
export interface TransferRequest {
  targetUserId: string
  amount: number // 单位：分
  reason?: string
}

/**
 * 提现申请
 * amount 单位：分 (需要除以100转换为元显示)
 */
export interface WithdrawRequest {
  id: string
  userId: string
  amount: number // 单位：分
  account: string
  accountType: string // 提现账户类型
  status: 'pending' | 'approved' | 'rejected'
  reason?: string
  createdAt: string
  processedAt?: string
  processedBy?: string

  // 别名属性
  withdrawId?: string // = id
  reviewedAt?: string // = processedAt
}

/**
 * 提现申请参数
 * amount 单位：分 (需要将用户输入的元乘以100)
 */
export interface WithdrawParams {
  amount: number // 单位：分
  account: string
  accountType: string
  verifyCode?: string
}

// ==================== 文件存储相关 ====================

/**
 * 文件分类
 */
export type FileCategory = 'avatar' | 'cover' | 'document' | 'image' | 'other'

/**
 * 文件信息
 */
export interface FileInfo {
  id?: string
  fileId: string
  filename: string
  originalName?: string
  size: number
  mimeType?: string
  contentType: string
  url: string
  path?: string
  category: FileCategory
  userId?: string
  uploadedAt: string
  uploadTime?: string
}

/**
 * 文件上传响应
 */
export interface UploadResponse {
  file: FileInfo
  url: string
}

/**
 * 上传进度
 */
export interface UploadProgress {
  fileId?: string
  loaded: number
  total: number
  percentage: number
  status: 'uploading' | 'done' | 'error'
}


/**
 * 文件上传参数
 */
export interface UploadParams {
  file: File
  path?: string
  category?: FileCategory
}

/**
 * 文件列表查询参数
 */
export interface FileListParams {
  category?: FileCategory
  page?: number
  page_size?: number
}

/**
 * 提现记录（别名）
 */
export type WithdrawRecord = WithdrawRequest

// ==================== 系统设置相关 ====================

/**
 * 系统配置项
 */
export interface SystemConfig {
  key: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'json'
  description?: string
  updatedAt?: string
}

/**
 * 通知消息
 */
export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  content: string
  isRead: boolean
  relatedId?: string
  createdAt: string
}

