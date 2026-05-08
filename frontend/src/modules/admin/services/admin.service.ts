/**
 * Admin Service
 * Business logic for admin operations
 */

import * as adminAPI from '@/modules/admin/api'
import type { DashboardStats, ReviewItem, WithdrawalRequest } from '../types/admin.types'
import type { APIResponse as _APIResponse } from '@/types/api'

class AdminService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return adminAPI.getDashboardStats()
  }

  /**
   * Get pending reviews
   */
  async getPendingReviews(page: number = 1, size: number = 20): Promise<ReviewItem[]> {
    const response = await adminAPI.getReviewList({ page, pageSize: size })
    return (response.data as any)?.items || response.data || []
  }

  /**
   * Approve review
   */
  async approveReview(reviewId: string, feedback?: string): Promise<void> {
    await adminAPI.reviewContent(reviewId, { approved: true, reason: feedback })
  }

  /**
   * Reject review
   */
  async rejectReview(reviewId: string, reason: string): Promise<void> {
    if (!reason || reason.trim().length < 5) {
      throw new Error('拒绝原因至少需要5个字符')
    }
    await adminAPI.reviewContent(reviewId, { approved: false, reason })
  }

  /**
   * Get pending withdrawals
   * @deprecated 请使用 finance 模块的相关方法
   */
  async getPendingWithdrawals(): Promise<WithdrawalRequest[]> {
    // 此方法已废弃，返回空数组
    console.warn('getPendingWithdrawals is deprecated. Use finance module instead.')
    return []
  }

  /**
   * Approve withdrawal
   * @deprecated 请使用 finance 模块的相关方法
   */
  async approveWithdrawal(_withdrawalId: string): Promise<void> {
    throw new Error('approveWithdrawal is deprecated. Use finance module instead.')
  }

  /**
   * Reject withdrawal
   * @deprecated 请使用 finance 模块的相关方法
   */
  async rejectWithdrawal(_withdrawalId: string, _reason: string): Promise<void> {
    throw new Error('rejectWithdrawal is deprecated. Use finance module instead.')
  }

  /**
   * Format review status
   */
  formatReviewStatus(status: string): string {
    const statusMap: Record<string, string> = {
      pending: '待审核',
      approved: '已通过',
      rejected: '已拒绝',
    }
    return statusMap[status] || status
  }

  /**
   * Format withdrawal status
   */
  formatWithdrawalStatus(status: string): string {
    const statusMap: Record<string, string> = {
      pending: '待处理',
      approved: '已批准',
      rejected: '已拒绝',
      completed: '已完成',
    }
    return statusMap[status] || status
  }
}

export const adminService = new AdminService()
export default adminService
