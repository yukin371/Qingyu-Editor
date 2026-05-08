/**
 * API适配服务单元测试
 * @module core/services/__tests__/api-adapter.service.test
 */

import { describe, it, expect } from 'vitest'
import apiAdapterService from '../api-adapter.service'

describe('ApiAdapterService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 清除降级事件记录
    apiAdapterService.clearFallbackEvents()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('wrapApi', () => {
    it('应该成功调用新API', async () => {
      const newApi = vi.fn().mockResolvedValue({ data: 'new' })
      const oldApi = vi.fn()

      const wrapped = apiAdapterService.wrapApi(newApi, oldApi)
      const result = await wrapped({ test: 'param' })

      expect(newApi).toHaveBeenCalledWith({ test: 'param' })
      expect(oldApi).not.toHaveBeenCalled()
      expect(result.data).toEqual({ data: 'new' })
      expect(result.usedFallback).toBe(false)
      expect(result.apiType).toBe('new')
    })

    it('应该在新API失败时降级到旧API', async () => {
      const mockError = new Error('New API failed')
      const newApi = vi.fn().mockRejectedValue(mockError)
      const oldApi = vi.fn().mockResolvedValue({ data: 'old' })

      const wrapped = apiAdapterService.wrapApi(newApi, oldApi)
      const result = await wrapped({ test: 'param' })

      expect(newApi).toHaveBeenCalledWith({ test: 'param' })
      expect(oldApi).toHaveBeenCalledWith({ test: 'param' })
      expect(result.data).toEqual({ data: 'old' })
      expect(result.usedFallback).toBe(true)
      expect(result.apiType).toBe('old')
    })

    it('应该在没有旧API时抛出错误', async () => {
      const mockError = new Error('New API failed')
      const newApi = vi.fn().mockRejectedValue(mockError)

      const wrapped = apiAdapterService.wrapApi(newApi)

      await expect(wrapped({ test: 'param' })).rejects.toThrow('New API failed')
    })

    it('应该支持禁用降级', async () => {
      const mockError = new Error('New API failed')
      const newApi = vi.fn().mockRejectedValue(mockError)
      const oldApi = vi.fn().mockResolvedValue({ data: 'old' })

      const wrapped = apiAdapterService.wrapApi(newApi, oldApi, {
        fallbackToOld: false,
      })

      await expect(wrapped({ test: 'param' })).rejects.toThrow('New API failed')
      expect(oldApi).not.toHaveBeenCalled()
    })

    it('应该支持禁用新API', async () => {
      const newApi = vi.fn()
      const oldApi = vi.fn().mockResolvedValue({ data: 'old' })

      const wrapped = apiAdapterService.wrapApi(newApi, oldApi, {
        useNewApi: false,
      })
      const result = await wrapped({ test: 'param' })

      expect(newApi).not.toHaveBeenCalled()
      expect(oldApi).toHaveBeenCalledWith({ test: 'param' })
      expect(result.usedFallback).toBe(true)
      expect(result.apiType).toBe('old')
    })

    it('应该调用降级回调', async () => {
      const mockError = new Error('New API failed')
      const newApi = vi.fn().mockRejectedValue(mockError)
      const oldApi = vi.fn().mockResolvedValue({ data: 'old' })
      const onFallback = vi.fn()

      const wrapped = apiAdapterService.wrapApi(newApi, oldApi, {
        onFallback,
      })
      await wrapped({ test: 'param' })

      expect(onFallback).toHaveBeenCalledWith(mockError, true)
    })
  })

  describe('降级事件记录', () => {
    it('应该记录降级事件', async () => {
      const mockError = new Error('Test error')
      const newApi = vi.fn().mockRejectedValue(mockError)
      const oldApi = vi.fn().mockResolvedValue({ data: 'old' })

      const wrapped = apiAdapterService.wrapApi(newApi, oldApi, {
        logFallback: true,
      })
      await wrapped({ test: 'param' })

      const events = apiAdapterService.getFallbackEvents()
      expect(events).toHaveLength(1)
      expect(events[0]).toMatchObject({
        error: 'Test error',
        usedFallback: true,
      })
    })

    it('应该提供降级统计信息', async () => {
      const newApi1 = vi.fn().mockResolvedValue({ data: 'new1' })
      const oldApi1 = vi.fn().mockResolvedValue({ data: 'old1' })
      const newApi2 = vi.fn().mockRejectedValue(new Error('Error 2'))
      const oldApi2 = vi.fn().mockResolvedValue({ data: 'old2' })

      const wrapped1 = apiAdapterService.wrapApi(newApi1, oldApi1)
      const wrapped2 = apiAdapterService.wrapApi(newApi2, oldApi2)

      await wrapped1({})
      await wrapped2({})

      const stats = apiAdapterService.getFallbackStats()
      expect(stats.total).toBe(1)
      expect(stats.fallbackCount).toBe(1)
      expect(stats.fallbackRate).toBe(1)
    })

    it('应该清除降级事件', async () => {
      const newApi = vi.fn().mockRejectedValue(new Error('Error'))
      const oldApi = vi.fn().mockResolvedValue({ data: 'old' })

      const wrapped = apiAdapterService.wrapApi(newApi, oldApi)
      await wrapped({})

      expect(apiAdapterService.getFallbackEvents()).toHaveLength(1)

      apiAdapterService.clearFallbackEvents()
      expect(apiAdapterService.getFallbackEvents()).toHaveLength(0)
    })
  })
})
