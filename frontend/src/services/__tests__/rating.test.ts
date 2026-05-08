import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getRatingStats, getUserRating, submitRating } from '../rating'

// Mock request模块 - 直接 mock 函数本身
vi.mock('@/modules/social/request', () => ({
  default: vi.fn()
}))

// 导入 mock 后的模块
import request from '@/modules/social/request'

describe('评分服务', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(request as ReturnType<typeof vi.fn>).mockReset()
  })

  it('应该获取评分统计', async () => {
    const mockStats = {
      targetType: 'book',
      targetId: 'book-123',
      averageRating: 4.5,
      totalRatings: 100,
      distribution: {
        1: 5,
        2: 10,
        3: 15,
        4: 30,
        5: 40
      }
    }

    ;(request as ReturnType<typeof vi.fn>).mockResolvedValue(mockStats)

    const stats = await getRatingStats('book', 'book-123')
    expect(stats).toBeDefined()
    expect(stats.averageRating).toBeGreaterThanOrEqual(0)
    expect(stats.totalRatings).toBeGreaterThanOrEqual(0)
  })

  it('应该获取用户评分', async () => {
    const mockUserRating = {
      targetType: 'book',
      targetId: 'book-123',
      rating: 5,
      createdAt: '2026-01-30T00:00:00Z'
    }

    ;(request as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserRating)

    const rating = await getUserRating('book', 'book-123')
    expect(rating).toBeDefined()
  })

  it('应该提交评分', async () => {
    ;(request as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true })

    await submitRating('book', 'book-123', 5)
    expect(request).toHaveBeenCalled()
  })
})
