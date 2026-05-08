/**
 * 财务模块 API 统一导出
 */

// 导出 membership.ts 的类型（优先）
export type {
  MembershipPlan,
  MembershipBenefit,
  MembershipUsage,
  MembershipCard,
  UserMembership
} from './membership'

// 导出 author-revenue.ts 的类型
export type {
  WithdrawalRequest,
  AuthorEarning,
  Settlement,
  RevenueOverview,
  RevenueStatistics,
  RevenueDetail,
  TaxInfo
} from './author-revenue'

// 导出 wallet.ts 的类型
export type {
  WalletInfo,
  WalletTransaction,
  WalletWithdrawal,
  WalletListResult,
  WalletRechargePayload,
  WalletConsumePayload,
  WalletTransferPayload,
  WalletWithdrawPayload,
  WalletPaymentMethod
} from './wallet'

// 导出 wrapper 中的函数（但不导出冲突的类型）
export {
  getWallet,
  getWalletBalance,
  getWalletTransactions,
  rechargeWallet,
  consumeWallet,
  transferWallet,
  withdrawWallet,
  getWalletWithdrawals,
  getMembershipStatus,
  subscribeMembership as subscribeMembershipFromWrapper,
  renewMembership as renewMembershipFromWrapper,
  cancelMembership as cancelMembershipFromWrapper,
  getMembershipBenefits as getMembershipBenefitsFromWrapper,
  getMembershipUsage,
  getMembershipCards as getMembershipCardsFromWrapper,
  activateMembershipCard as activateMembershipCardFromWrapper,
  getAuthorEarnings as getAuthorEarningsFromWrapper,
  getAuthorBookEarnings,
  getAuthorRevenueDetails,
  getAuthorRevenueStatistics,
  getAuthorSettlements,
  getAuthorSettlementDetail,
  getAuthorTaxInfo,
  updateAuthorTaxInfo,
  getAuthorWithdrawals,
  authorWithdraw,
  getBalance,
  getTransactionHistory,
  isMembershipActive
} from './wrapper'

// 导出 membership.ts 的函数（优先）
export {
  getMembershipPlans,
  getUserMembership,
  subscribeMembership,
  cancelMembership,
  renewMembership,
  getMembershipBenefits,
  getMembershipBenefitsUsage,
  activateMembershipCard
} from './membership'

// 导出 author-revenue.ts 的函数（优先）
export {
  getRevenueOverview,
  getAuthorEarnings,
  getRevenueStatistics,
  getRevenueDetails,
  getTaxInfo,
  updateTaxInfo,
  getDailyEarnings,
  getMonthlyEarnings,
  withdrawEarnings,
  getWithdrawalHistory,
  getWithdrawalRequests,
  createWithdrawal,
  getSettlements,
  getSettlementDetail
} from './author-revenue'

// 导出 wallet.ts 的函数
export { walletAPI } from './wallet'
