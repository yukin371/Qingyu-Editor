/**
 * Audit API 测试
 * 测试审核管理相关 API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock generated API
const mockGetApiV1AdminAuditPending = vi.fn()
const mockGetApiV1AdminAuditHighRisk = vi.fn()
const mockGetApiV1AdminAuditStatistics = vi.fn()
const mockPostApiV1AdminAuditIdReview = vi.fn()
const mockPostApiV1AdminAuditIdAppealReview = vi.fn()

vi.mock('../generated/admin', () => ({
  getApi: vi.fn(() => ({
    getApiV1AdminAuditPending: mockGetApiV1AdminAuditPending,
    getApiV1AdminAuditHighRisk: mockGetApiV1AdminAuditHighRisk,
    getApiV1AdminAuditStatistics: mockGetApiV1AdminAuditStatistics,
    postApiV1AdminAuditIdReview: mockPostApiV1AdminAuditIdReview,
    postApiV1AdminAuditIdAppealReview: mockPostApiV1AdminAuditIdAppealReview,
  })),
}))

describe('Audit API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPendingAudits', () => {
    it('应该成功获取待审核列表', async () => {
      const mockResponse = {
        data: {
          items: [
            { id: '1', contentType: 'book', status: 'pending' },
            { id: '2', contentType: 'chapter', status: 'pending' },
          ],
          total: 2,
        },
      }
      mockGetApiV1AdminAuditPending.mockResolvedValueOnce(mockResponse)

      const { getPendingAudits } = await import('../audit.api')
      const result = await getPendingAudits({ page: 1, pageSize: 20 })

      expect(mockGetApiV1AdminAuditPending).toHaveBeenCalledWith({ page: 1, pageSize: 20 })
      expect(result).toEqual(mockResponse)
    })

    it('应该支持按内容类型筛选', async () => {
      mockGetApiV1AdminAuditPending.mockResolvedValueOnce({ data: { items: [], total: 0 } })

      const { getPendingAudits } = await import('../audit.api')
      await getPendingAudits({ contentType: 'book' })

      expect(mockGetApiV1AdminAuditPending).toHaveBeenCalledWith({ contentType: 'book' })
    })

    it('应该支持按风险等级筛选', async () => {
      mockGetApiV1AdminAuditPending.mockResolvedValueOnce({ data: { items: [], total: 0 } })

      const { getPendingAudits } = await import('../audit.api')
      await getPendingAudits({ riskLevel: 'high' })

      expect(mockGetApiV1AdminAuditPending).toHaveBeenCalledWith({ riskLevel: 'high' })
    })

    it('应该支持无参数调用', async () => {
      mockGetApiV1AdminAuditPending.mockResolvedValueOnce({ data: { items: [], total: 0 } })

      const { getPendingAudits } = await import('../audit.api')
      await getPendingAudits()

      expect(mockGetApiV1AdminAuditPending).toHaveBeenCalledWith(undefined)
    })
  })

  describe('getHighRiskAudits', () => {
    it('应该成功获取高风险审核列表', async () => {
      const mockResponse = {
        data: {
          items: [{ id: '1', contentType: 'book', riskLevel: 'high' }],
          total: 1,
        },
      }
      mockGetApiV1AdminAuditHighRisk.mockResolvedValueOnce(mockResponse)

      const { getHighRiskAudits } = await import('../audit.api')
      const result = await getHighRiskAudits({ page: 1, pageSize: 10 })

      expect(mockGetApiV1AdminAuditHighRisk).toHaveBeenCalledWith({ page: 1, pageSize: 10 })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getAuditStatistics', () => {
    it('应该成功获取审核统计', async () => {
      const mockStats = {
        data: {
          pending: 50,
          approved: 200,
          rejected: 30,
          highRisk: 5,
        },
      }
      mockGetApiV1AdminAuditStatistics.mockResolvedValueOnce(mockStats)

      const { getAuditStatistics } = await import('../audit.api')
      const result = await getAuditStatistics()

      expect(mockGetApiV1AdminAuditStatistics).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockStats)
    })

    it('应该正确处理空统计', async () => {
      mockGetApiV1AdminAuditStatistics.mockResolvedValueOnce({
        data: { pending: 0, approved: 0, rejected: 0, highRisk: 0 },
      })

      const { getAuditStatistics } = await import('../audit.api')
      const result = await getAuditStatistics()

      expect(result.data?.pending).toBe(0)
      expect(result.data?.approved).toBe(0)
    })
  })

  describe('reviewAudit', () => {
    it('应该成功通过审核', async () => {
      mockPostApiV1AdminAuditIdReview.mockResolvedValueOnce({})

      const { reviewAudit } = await import('../audit.api')
      await reviewAudit('audit-123', { approved: true })

      expect(mockPostApiV1AdminAuditIdReview).toHaveBeenCalledWith('audit-123', {
        approved: true,
      })
    })

    it('应该成功拒绝审核并附带原因', async () => {
      mockPostApiV1AdminAuditIdReview.mockResolvedValueOnce({})

      const { reviewAudit } = await import('../audit.api')
      await reviewAudit('audit-123', { approved: false, reason: '内容违规' })

      expect(mockPostApiV1AdminAuditIdReview).toHaveBeenCalledWith('audit-123', {
        approved: false,
        reason: '内容违规',
      })
    })

    it('应该正确处理审核错误', async () => {
      mockPostApiV1AdminAuditIdReview.mockRejectedValueOnce(new Error('审核失败'))

      const { reviewAudit } = await import('../audit.api')

      await expect(reviewAudit('audit-123', { approved: true })).rejects.toThrow('审核失败')
    })
  })

  describe('reviewAppeal', () => {
    it('应该导出 reviewAppeal 函数', async () => {
      const { reviewAppeal } = await import('../audit.api')

      expect(reviewAppeal).toBeDefined()
      expect(typeof reviewAppeal).toBe('function')
    })
  })

  describe('错误处理', () => {
    it('应该正确处理网络错误', async () => {
      mockGetApiV1AdminAuditPending.mockRejectedValueOnce(new Error('Network Error'))

      const { getPendingAudits } = await import('../audit.api')

      await expect(getPendingAudits()).rejects.toThrow('Network Error')
    })

    it('应该正确处理服务端错误', async () => {
      mockGetApiV1AdminAuditStatistics.mockRejectedValueOnce(new Error('Internal Server Error'))

      const { getAuditStatistics } = await import('../audit.api')

      await expect(getAuditStatistics()).rejects.toThrow('Internal Server Error')
    })
  })
})
