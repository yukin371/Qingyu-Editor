/**
 * Admin audit.api - 审核管理相关 API
 */

import { api } from './shared'
import type { APIResponse } from '@/types/api'

/**
 * 获取待审核内容列表
 * 兼容旧API: getPendingAudits(params)
 */
export async function getPendingAudits(params?: {
  page?: number
  pageSize?: number
  contentType?: string
  riskLevel?: string
}): Promise<APIResponse<{ items: any[]; total: number }>> {
  return api.getApiV1AdminAuditPending(params as any) as any
}

/**
 * 获取高风险审核列表
 * 兼容旧API: getHighRiskAudits(params)
 */
export async function getHighRiskAudits(params?: {
  page?: number
  pageSize?: number
}): Promise<APIResponse<{ items: any[]; total: number }>> {
  return api.getApiV1AdminAuditHighRisk(params as any) as any
}
/**
 * 获取审核统计数据
 * 兼容旧API: getAuditStatistics()
 */
export async function getAuditStatistics(): Promise<
  APIResponse<{
    pending: number
    approved: number
    rejected: number
    highRisk: number
  }>
> {
  return api.getApiV1AdminAuditStatistics() as any
}
/**
 * 审核内容
 * 兼容旧API: reviewAudit(auditId, params)
 */
export async function reviewAudit(
  auditId: string,
  params: {
    approved: boolean
    reason?: string
  },
): Promise<APIResponse<void>> {
  return api.postApiV1AdminAuditIdReview(auditId, params as any) as any
}
/**
 * 审核申诉
 */
export const reviewAppeal = api.postApiV1AdminAuditIdAppealReview
