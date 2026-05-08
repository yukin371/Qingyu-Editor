/**
 * VIP会员系统类型定义
 */

/**
 * VIP等级
 */
export type VIPLevel = 'monthly' | 'quarterly' | 'yearly' | 'lifetime'

/**
 * VIP特权
 */
export type VIPPrivilege =
  | 'ad_free'              // 免广告
  | 'exclusive_books'      // 专属书籍
  | 'early_access'         // 提前看
  | 'discount'             // 购书折扣
  | 'monthly_coins'        // 月度币
  | 'custom_badge'         // 专属徽章
  | 'priority_support'     // 优先客服
  | 'free_chapters'        // 免费章节
  | 'download_offline'     // 离线下载

/**
 * VIP套餐
 */
export interface VIPPlan {
  level: VIPLevel
  name: string
  price: number
  originalPrice: number
  duration: number           // 天数
  privileges: VIPPrivilege[]
  isRecommended: boolean
}

/**
 * VIP状态
 */
export interface VIPStatus {
  isVip: boolean
  level: VIPLevel
  expireAt: string
  remainingDays: number
  privileges: VIPPrivilege[]
}

/**
 * 订阅记录
 */
export interface Subscription {
  id: string
  userId: string
  planLevel: VIPLevel
  amount: number
  startTime: string
  endTime: string
  status: 'active' | 'expired' | 'cancelled'
  autoRenew: boolean
}
