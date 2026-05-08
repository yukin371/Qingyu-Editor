/**
 * Finance API Wrapper
 * 将orval生成的工厂模式API转换为更易使用的格式
 *
 * 使用方式：
 * import * as financeAPI from '@/modules/finance/api'
 * const balance = await financeAPI.getWalletBalance()
 */

import { getApi } from './generated/finance'

// 获取生成的API对象
const api = getApi()

// ==================== 类型定义 ====================

/**
 * 钱包信息
 */
export interface Wallet {
  userId: string
  balance: number
  frozenBalance: number
  totalIncome: number
  totalExpense: number
  totalRecharge: number
  totalWithdraw: number
  membershipLevel: string
  membershipExpireAt: string
}

/**
 * 余额信息
 */
export interface Balance {
  balance: number
  frozenBalance: number
  availableBalance: number
}

/**
 * 交易记录
 */
export interface Transaction {
  id: string
  userId: string
  type: 'recharge' | 'consume' | 'transfer' | 'withdraw' | 'income' | 'refund'
  amount: number
  balanceBefore: number
  balanceAfter: number
  description?: string
  relatedOrderId?: string
  createdAt: string
}

/**
 * 提现记录
 */
export interface Withdrawal {
  id: string
  userId: string
  amount: number
  fee: number
  actualAmount: number
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'failed'
  bankName: string
  bankAccount: string
  accountName: string
  rejectReason?: string
  createdAt: string
  completedAt?: string
}

/**
 * 会员套餐
 */
export interface MembershipPlan {
  id: string
  name: string
  description: string
  price: number
  duration: number
  durationUnit: 'day' | 'month' | 'year'
  benefits: string[]
  isPopular: boolean
}

/**
 * 会员状态
 */
export interface MembershipStatus {
  isActive: boolean
  level: string
  expireAt: string
  remainingDays: number
  autoRenew: boolean
}

/**
 * 会员权益
 */
export interface MembershipBenefit {
  type: string
  value: number
  description: string
}

/**
 * 会员卡
 */
export interface MembershipCard {
  id: string
  cardNumber: string
  type: string
  status: 'unused' | 'activated' | 'expired' | 'used'
  value: number
  duration: number
  expireAt?: string
  activatedAt?: string
  usedAt?: string
}

/**
 * 作者收益
 */
export interface AuthorEarning {
  id: string
  authorId: string
  bookId?: string
  bookTitle?: string
  amount: number
  type: 'chapter' | 'subscription' | 'reward' | 'other'
  description?: string
  createdAt: string
}

/**
 * 作者结算
 */
export interface AuthorSettlement {
  id: string
  authorId: string
  period: string
  totalEarnings: number
  taxAmount: number
  feeAmount: number
  actualAmount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  bankName: string
  bankAccount: string
  accountName: string
  createdAt: string
  completedAt?: string
}

/**
 * 作者税务信息
 */
export interface AuthorTaxInfo {
  id: string
  authorId: string
  idNumber: string
  idType: string
  realName: string
  bankName: string
  bankAccount: string
  bankBranch: string
  phoneNumber: string
  email: string
  address?: string
  verified: boolean
  verifiedAt?: string
  createdAt: string
  updatedAt: string
}

// ==================== 钱包相关 API ====================

/**
 * 获取钱包信息
 */
export const getWallet = api.getApiV1FinanceWallet

/**
 * 获取余额信息
 */
export const getWalletBalance = api.getApiV1FinanceWalletBalance

/**
 * 获取交易记录
 */
export const getWalletTransactions = api.getApiV1FinanceWalletTransactions

/**
 * 充值
 */
export const rechargeWallet = api.postApiV1FinanceWalletRecharge

/**
 * 消费
 */
export const consumeWallet = api.postApiV1FinanceWalletConsume

/**
 * 转账
 */
export const transferWallet = api.postApiV1FinanceWalletTransfer

/**
 * 提现
 */
export const withdrawWallet = api.postApiV1FinanceWalletWithdraw

/**
 * 获取提现记录
 */
export const getWalletWithdrawals = api.getApiV1FinanceWalletWithdrawals

// ==================== 会员相关 API ====================

/**
 * 获取会员状态
 */
export const getMembershipStatus = api.getApiV1FinanceMembershipStatus

/**
 * 获取会员套餐列表
 */
export const getMembershipPlans = api.getApiV1FinanceMembershipPlans

/**
 * 订阅会员
 */
export const subscribeMembership = api.postApiV1FinanceMembershipSubscribe

/**
 * 续费会员
 */
export const renewMembership = api.putApiV1FinanceMembershipRenew

/**
 * 取消会员
 */
export const cancelMembership = api.postApiV1FinanceMembershipCancel

/**
 * 获取会员权益
 */
export const getMembershipBenefits = api.getApiV1FinanceMembershipBenefits

/**
 * 获取会员使用情况
 */
export const getMembershipUsage = api.getApiV1FinanceMembershipUsage

/**
 * 获取会员卡列表
 */
export const getMembershipCards = api.getApiV1FinanceMembershipCards

/**
 * 激活会员卡
 */
export const activateMembershipCard = api.postApiV1FinanceMembershipCardsActivate

// ==================== 作者财务相关 API ====================

/**
 * 获取作者收益列表
 */
export const getAuthorEarnings = api.getApiV1FinanceAuthorEarnings

/**
 * 获取指定书籍的收益
 */
export const getAuthorBookEarnings = api.getApiV1FinanceAuthorEarningsBookId

/**
 * 获取作者收益详情
 */
export const getAuthorRevenueDetails = api.getApiV1FinanceAuthorRevenueDetails

/**
 * 获取作者收益统计
 */
export const getAuthorRevenueStatistics = api.getApiV1FinanceAuthorRevenueStatistics

/**
 * 获取作者结算记录
 */
export const getAuthorSettlements = api.getApiV1FinanceAuthorSettlements

/**
 * 获取结算详情
 */
export const getAuthorSettlementDetail = api.getApiV1FinanceAuthorSettlementsId

/**
 * 获取作者税务信息
 */
export const getAuthorTaxInfo = api.getApiV1FinanceAuthorTaxInfo

/**
 * 更新作者税务信息
 */
export const updateAuthorTaxInfo = api.putApiV1FinanceAuthorTaxInfo

/**
 * 获取作者提现记录
 */
export const getAuthorWithdrawals = api.getApiV1FinanceAuthorWithdrawals

/**
 * 作者提现申请
 */
export const authorWithdraw = api.postApiV1FinanceAuthorWithdraw

// ==================== 其他便捷方法 ====================

/**
 * 获取当前余额（别名）
 */
export const getBalance = getWalletBalance

/**
 * 获取交易历史（别名）
 */
export const getTransactionHistory = getWalletTransactions

/**
 * 检查会员是否有效
 */
export async function isMembershipActive(): Promise<boolean> {
  const result = await getMembershipStatus() as any
  return result?.data?.isActive || false
}

/**
 * 导出原始getApi函数（高级用法）
 * 可以传入自定义axios实例
 */
export { getApi }

/**
 * 默认导出
 */
export default {
  // 钱包相关
  getWallet,
  getWalletBalance,
  getWalletTransactions,
  rechargeWallet,
  consumeWallet,
  transferWallet,
  withdrawWallet,
  getWalletWithdrawals,
  // 会员相关
  getMembershipStatus,
  getMembershipPlans,
  subscribeMembership,
  renewMembership,
  cancelMembership,
  getMembershipBenefits,
  getMembershipUsage,
  getMembershipCards,
  activateMembershipCard,
  // 作者财务相关
  getAuthorEarnings,
  getAuthorBookEarnings,
  getAuthorRevenueDetails,
  getAuthorRevenueStatistics,
  getAuthorSettlements,
  getAuthorSettlementDetail,
  getAuthorTaxInfo,
  updateAuthorTaxInfo,
  getAuthorWithdrawals,
  authorWithdraw,
  // 其他便捷方法
  getBalance,
  getTransactionHistory,
  isMembershipActive,
  // 工具函数
  getApi,
}
