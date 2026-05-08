/**
 * Admin Dashboard API - 仪表盘统计相关
 */

import { api } from './shared'
import type { DashboardStats } from '@/modules/admin/types/admin.types'

/**
 * 获取仪表盘统计数据
 * 兼容旧API: getDashboardStats()
 * 使用生成的 getApiV1AdminStats
 *
 * 注意：httpService 响应拦截器已自动解包 APIResponse
 * 后端返回: { totalUsers: number, activeUsers: number, authorsCount: number, newUsersToday: number, ... }
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  return api.getApiV1AdminStats() as any
}

/**
 * 获取统计数据（别名）
 */
export const getStats = getDashboardStats
