// Qingyu_fronted/src/modules/bookstore/services/__tests__/tag-api.service.spec.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { tagApiService } from '../tag-api.service'

describe('TagApiService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    tagApiService.clearCache()
  })

  describe('fetchPopularTags', () => {
    it('应该成功获取热门标签', async () => {
      const mockTags = ['玄幻', '修仙', '都市', '重生']

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { tags: mockTags } })
      })

      const result = await tagApiService.fetchPopularTags()

      expect(result).toEqual(mockTags)
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/bookstore/tags/popular')
    })

    it('应该使用缓存', async () => {
      const mockTags = ['玄幻', '修仙']

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { tags: mockTags } })
      })

      // 第一次调用
      await tagApiService.fetchPopularTags()
      // 第二次调用应该使用缓存
      await tagApiService.fetchPopularTags()

      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('应该在错误时返回默认标签（降级方案）', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500
      })

      const result = await tagApiService.fetchPopularTags()

      // 应该返回默认标签而不是抛出错误
      expect(result).toEqual(['玄幻', '修仙', '都市', '重生', '穿越', '系统', '历史', '武侠'])
    })

    it('应该在网络错误时返回默认标签', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const result = await tagApiService.fetchPopularTags()

      // 应该返回默认标签而不是抛出错误
      expect(result).toEqual(['玄幻', '修仙', '都市', '重生', '穿越', '系统', '历史', '武侠'])
    })

    it('应该处理空响应', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: {} })
      })

      const result = await tagApiService.fetchPopularTags()

      expect(result).toEqual([])
    })

    it('应该设置loading状态', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { tags: [] } })
      })

      const promise = tagApiService.fetchPopularTags()

      expect(tagApiService.isLoading).toBe(true)

      await promise

      expect(tagApiService.isLoading).toBe(false)
    })

    it('应该在降级时也正确设置loading状态', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const promise = tagApiService.fetchPopularTags()

      expect(tagApiService.isLoading).toBe(true)

      await promise

      expect(tagApiService.isLoading).toBe(false)
    })
  })

  describe('clearCache', () => {
    it('应该清除缓存', async () => {
      const mockTags = ['玄幻', '修仙']

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { tags: mockTags } })
      })

      await tagApiService.fetchPopularTags()

      tagApiService.clearCache()

      // 清除缓存后应该重新请求
      await tagApiService.fetchPopularTags()

      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })
})
