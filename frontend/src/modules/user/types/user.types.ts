/**
 * User Types
 */

/**
 * User Profile
 */
export interface UserProfile {
  id: string
  username: string
  email?: string
  phone?: string
  avatar?: string
  nickname?: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
  bio?: string
  roles: string[]
  registerTime: number
  lastLoginTime?: number
}

/**
 * Update Profile Parameters
 */
export interface UpdateProfileParams {
  nickname?: string
  email?: string
  phone?: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
  bio?: string
}

/**
 * Change Password Parameters
 */
export interface ChangePasswordParams {
  old_password: string
  new_password: string
}

/**
 * Wallet Balance
 * 金额字段单位：分 (需要除以100转换为元显示)
 */
export interface WalletBalance {
  userId: string
  balance: number // 单位：分
  frozenBalance: number // 单位：分
  totalIncome?: number // 单位：分
  totalExpense?: number // 单位：分
}

/**
 * Transaction
 * 金额字段单位：分 (需要除以100转换为元显示)
 */
export interface Transaction {
  id: string
  userId: string
  type: 'recharge' | 'purchase' | 'reward' | 'withdraw' | 'refund' | 'income'
  amount: number // 单位：分
  balance: number // 单位：分
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  description?: string
  relatedId?: string
  createTime: number
  completeTime?: number
}

/**
 * Recharge Parameters
 * amount 单位：分 (需要将用户输入的元乘以100)
 */
export interface RechargeParams {
  amount: number // 单位：分
  payment_method: 'alipay' | 'wechat' | 'card'
}

/**
 * Withdraw Parameters
 * amount 单位：分 (需要将用户输入的元乘以100)
 */
export interface WithdrawParams {
  amount: number // 单位：分
  account: string
  account_type: 'alipay' | 'bank'
}

/**
 * Auth Types
 */
export interface LoginParams {
  username: string
  password: string
  remember?: boolean
}

export interface RegisterParams {
  username: string
  password: string
  email?: string
  phone?: string
  code?: string
}

export interface AuthResponse {
  token: string
  user: UserProfile
  expiresIn?: number
}

