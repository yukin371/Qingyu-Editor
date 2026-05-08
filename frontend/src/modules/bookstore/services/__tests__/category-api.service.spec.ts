// Qingyu_fronted/src/modules/bookstore/services/__tests__/category-api.service.spec.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { categoryApiService } from '../category-api.service'

describe('CategoryApiService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    categoryApiService.clearCache()
  })

  describe('fetchCategories', () => {
    it('应该成功获取分类列表', async () => {
      const mockCategories = [
        { id: '1', name: '玄幻' },
        { id: '2', name: '都市' }
      ]

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { categories: mockCategories } })
      })

      const result = await categoryApiService.fetchCategories()

      expect(result).toEqual(mockCategories)
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/bookstore/categories')
    })

    it('应该使用缓存', async () => {
      const mockCategories = [{ id: '1', name: '玄幻' }]

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { categories: mockCategories } })
      })

      // 第一次调用
      await categoryApiService.fetchCategories()
      // 第二次调用应该使用缓存
      await categoryApiService.fetchCategories()

      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('应该处理HTTP错误', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500
      })

      await expect(categoryApiService.fetchCategories()).rejects.toThrow('HTTP error! status: 500')
    })

    it('应该处理空响应', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: {} })
      })

      const result = await categoryApiService.fetchCategories()

      expect(result).toEqual([])
    })

    it('应该设置loading状态', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { categories: [] } })
      })

      const promise = categoryApiService.fetchCategories()

      expect(categoryApiService.isLoading).toBe(true)

      await promise

      expect(categoryApiService.isLoading).toBe(false)
    })

    it('应该设置错误信息', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      })

      try {
        await categoryApiService.fetchCategories()
      } catch (err) {
        // 忽略错误
      }

      expect(categoryApiService.getError).toBe('HTTP error! status: 404')
    })
  })

  describe('clearCache', () => {
    it('应该清除缓存', async () => {
      const mockCategories = [{ id: '1', name: '玄幻' }]

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { categories: mockCategories } })
      })

      await categoryApiService.fetchCategories()

      categoryApiService.clearCache()

      // 清除缓存后应该重新请求
      await categoryApiService.fetchCategories()

      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })
})
