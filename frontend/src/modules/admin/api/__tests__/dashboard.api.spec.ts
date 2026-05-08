/**
 * Dashboard API 测试
 * 测试仪表盘统计相关 API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock generated API
const mockGetApiV1AdminStats = vi.fn()
vi.mock('../generated/admin', () => ({
  getApi: vi.fn(() => ({
    getApiV1AdminStats: mockGetApiV1AdminStats,
  })),
}))

describe('Dashboard API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDashboardStats', () => {
    it('应该成功获取仪表盘统计数据', async () => {
      const mockData = {
        totalUsers: 1000,
        activeUsers: 500,
        authorsCount: 50,
        newUsersToday: 25,
        totalBooks: 2000,
        activeBooks: 1500,
        totalRevenue: 50000,
        pendingWithdrawals: 5,
      }
      mockGetApiV1AdminStats.mockResolvedValueOnce(mockData)

      const { getDashboardStats } = await import('../dashboard.api')
      const result = await getDashboardStats()

      expect(mockGetApiV1AdminStats).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockData)
    })

    it('应该正确处理空数据响应', async () => {
      mockGetApiV1AdminStats.mockResolvedValueOnce({})

      const { getDashboardStats } = await import('../dashboard.api')
      const result = await getDashboardStats()

      expect(result).toBeDefined()
    })

    it('应该正确处理 API 错误', async () => {
      const mockError = new Error('Network Error')
      mockGetApiV1AdminStats.mockRejectedValueOnce(mockError)

      const { getDashboardStats } = await import('../dashboard.api')

      await expect(getDashboardStats()).rejects.toThrow('Network Error')
    })
  })

  describe('getStats 别名', () => {
    it('getStats 应该是 getDashboardStats 的别名', async () => {
      const { getDashboardStats, getStats } = await import('../dashboard.api')

      expect(getStats).toBe(getDashboardStats)
    })
  })
})
