/**
 * VIP会员系统 API
 */
import { http } from '@/core/http'
import type { VIPPlan, VIPStatus, Subscription } from '@/types/vip'

/**
 * 获取VIP套餐列表
 */
export function getVIPPlans() {
  return http.get<{
    code: number
    message: string
    data: VIPPlan[]
  }>('/api/v1/vip/plans')
}

/**
 * 获取VIP状态
 */
export function getVIPStatus() {
  return http.get<{
    code: number
    message: string
    data: VIPStatus
  }>('/api/v1/vip/status')
}

/**
 * 购买VIP会员
 */
export function purchaseVIP(data: {
  planLevel: string
  paymentMethod: string
}) {
  return http.post<{
    code: number
    message: string
    data: {
      orderId: string
      paymentUrl?: string
      qrCode?: string
    }
  }>('/api/v1/vip/purchase', data)
}

/**
 * 续费VIP会员
 */
export function renewVIP(data: {
  planLevel: string
  autoRenew: boolean
}) {
  return http.post<{
    code: number
    message: string
    data: Subscription
  }>('/api/v1/vip/renew', data)
}

/**
 * 取消自动续费
 */
export function cancelAutoRenew() {
  return http.post<{
    code: number
    message: string
    data: { success: boolean }
  }>('/api/v1/vip/cancel-renew')
}

/**
 * 获取VIP特权列表
 */
export function getVIPPrivileges() {
  return http.get<{
    code: number
    message: string
    data: {
      privileges: {
        id: string
        name: string
        description: string
        icon: string
        level: string
      }[]
    }
  }>('/api/v1/vip/privileges')
}

/**
 * 获取订阅记录
 */
export function getSubscriptions(params?: { page?: number; size?: number }) {
  return http.get<{
    code: number
    message: string
    data: {
      list: Subscription[]
      total: number
    }
  }>('/api/v1/vip/subscriptions', { params })
}

/**
 * 验证VIP特权
 */
export function checkVIPPrivilege(privilege: string) {
  return http.get<{
    code: number
    message: string
    data: {
      hasPrivilege: boolean
      expireAt?: string
    }
  }>('/api/v1/vip/check-privilege', {
    params: { privilege }
  })
}
