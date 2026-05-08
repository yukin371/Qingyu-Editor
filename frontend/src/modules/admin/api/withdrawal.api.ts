/**
 * Admin withdrawal.api - 提现管理相关 API
 */

import { api, httpService } from './shared'
import type { APIResponse } from '@/types/api'
import type { AdminWithdrawalItem, AdminWithdrawalStats, AdminListResult } from './shared'

/**
 * 获取提现申请列表
 */
export async function getWithdrawalList(params?: {
  page?: number
  pageSize?: number
  status?: string
  source?: string
  start_date?: string
  end_date?: string
}): Promise<AdminListResult<AdminWithdrawalItem>> {
  const response = await httpService.get<{
    code: number
    data: AdminWithdrawalItem[]
    pagination?: { total?: number }
  }>('/admin/withdrawals', {
    params: {
      page: params?.page,
      page_size: params?.pageSize,
      status: params?.status,
      source: params?.source,
      start_date: params?.start_date,
      end_date: params?.end_date,
    },
  })

  return {
    items: Array.isArray(response?.data) ? response.data : [],
    total: Number(response?.pagination?.total ?? response?.data?.length ?? 0),
  }
}

/**
 * 处理提现申请
 */
export async function handleWithdrawal(params: {
  withdraw_id: string
  approved: boolean
  reason?: string
}): Promise<APIResponse<void>> {
  return api.postApiV1AdminWithdrawReview(params as any) as any
}

/**
 * 审核提现申请（别名）
 */
export const reviewWithdraw = handleWithdrawal

/**
 * 获取提现统计数据
 */
export async function getWithdrawalStats(params?: {
  status?: string
  source?: string
  start_date?: string
  end_date?: string
}): Promise<AdminWithdrawalStats> {
  const response = await httpService.get<AdminWithdrawalStats>('/admin/withdrawals/stats', {
    params: {
      status: params?.status,
      source: params?.source,
      start_date: params?.start_date,
      end_date: params?.end_date,
    },
  })

  return {
    total_count: Number(response?.total_count ?? 0),
    pending_count: Number(response?.pending_count ?? 0),
    approved_count: Number(response?.approved_count ?? 0),
    rejected_count: Number(response?.rejected_count ?? 0),
    approved_today_count: Number(response?.approved_today_count ?? 0),
    pending_amount: Number(response?.pending_amount ?? 0),
    approved_amount: Number(response?.approved_amount ?? 0),
  }
}
