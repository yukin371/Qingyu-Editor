/**
 * 会员系统 API
 */
import request from '../request'

// 会员套餐类型
export interface MembershipPlan {
  id: string
  name: string
  type: string
  price: number
  duration: number
  duration_unit: string
  is_enabled: boolean
  sort_order: number
  description?: string
  benefits?: string[]
  created_at: string
  updated_at: string
}

// 用户会员信息
export interface UserMembership {
  id: string
  user_id: string
  plan_id: string
  plan_name: string
  status: 'active' | 'expired' | 'cancelled'
  start_date: string
  end_date: string
  auto_renew: boolean
  created_at: string
  updated_at: string
}

// 会员卡
export interface MembershipCard {
  id: string
  code: string
  type: string
  value: number
  duration: number
  status: 'unused' | 'used' | 'expired'
  valid_until?: string
  used_by?: string
  used_at?: string
  created_at: string
}

// 会员权益
export interface MembershipBenefit {
  id: string
  code: string
  name: string
  level: string
  description: string
  type: string
  value?: number
  unit?: string
  is_enabled: boolean
}

// 权益使用情况
export interface MembershipUsage {
  id: string
  user_id: string
  benefit_code: string
  used_count: number
  limit_count: number
  reset_period: string
  last_reset_at: string
}

/**
 * 获取会员套餐列表
 */
export function getMembershipPlans(enabledOnly = true) {
  return request<MembershipPlan[]>({
    url: '/api/v1/finance/membership/plans',
    method: 'get',
    params: { enabled_only: enabledOnly }
  })
}

/**
 * 获取会员套餐详情
 */
export function getMembershipPlanDetail(planId: string) {
  return request<MembershipPlan>({
    url: `/api/v1/finance/membership/plans/${planId}`,
    method: 'get'
  })
}

/**
 * 获取用户会员状态
 */
export function getUserMembership() {
  return request<UserMembership>({
    url: '/api/v1/finance/membership/status',
    method: 'get'
  })
}

/**
 * 订阅会员
 */
export function subscribeMembership(data: {
  plan_id: string
  payment_method: string
  card_code?: string
}) {
  return request<UserMembership>({
    url: '/api/v1/finance/membership/subscribe',
    method: 'post',
    data
  })
}

/**
 * 取消会员
 */
export function cancelMembership() {
  return request<{ message: string }>({
    url: '/api/v1/finance/membership/cancel',
    method: 'post'
  })
}

/**
 * 续费会员
 */
export function renewMembership(data: {
  payment_method: string
  card_code?: string
}) {
  return request<UserMembership>({
    url: '/api/v1/finance/membership/renew',
    method: 'post',
    data
  })
}

/**
 * 获取会员权益列表
 */
export function getMembershipBenefits() {
  return request<MembershipBenefit[]>({
    url: '/api/v1/finance/membership/benefits',
    method: 'get'
  })
}

/**
 * 获取权益使用情况
 */
export function getMembershipBenefitsUsage() {
  return request<MembershipUsage[]>({
    url: '/api/v1/finance/membership/benefits/usage',
    method: 'get'
  })
}

/**
 * 激活会员卡
 */
export function activateMembershipCard(data: { code: string }) {
  return request<UserMembership>({
    url: '/api/v1/finance/membership/cards/activate',
    method: 'post',
    data
  })
}

/**
 * 验证会员卡
 */
export function validateMembershipCard(code: string) {
  return request<{
    valid: boolean
    card?: MembershipCard
    message?: string
  }>({
    url: '/api/v1/finance/membership/cards/validate',
    method: 'post',
    data: { code }
  })
}
