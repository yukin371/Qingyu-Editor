/**
 * Stream Bookstore Service Tests
 * 测试流式搜索服务
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { streamBookstoreService } from '../stream-bookstore.service'

describe('StreamBookstoreService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    streamBookstoreService.cleanup()
  })

  describe('NDJSON解析', () => {
    it('应该正确解析完整的NDJSON流', async () => {
      const mockNDJSON = `{"type":"meta","cursor":"abc123","total":100,"hasMore":true}
{"type":"data","books":[{"id":"1","title":"Book 1","author":"Author 1"}]}
{"type":"done","cursor":"xyz789","total":1,"hasMore":false}`

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(mockNDJSON),
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      })

      const result = await streamBookstoreService.streamSearchBooks('test')

      expect(result.items).toHaveLength(1)
      expect(result.cursor).toBe('xyz789')
      expect(result.total).toBe(1)
      expect(result.hasMore).toBe(false)
    })

    it('应该处理跨chunk分割的不完整NDJSON行', async () => {
      // 模拟chunk被分割的情况
      const chunk1 = '{"type":"data","books":[{"id":"'
      const chunk2 =
        '1","title":"Book 1"}]}\n{"type":"done","cursor":"end","total":1,"hasMore":false}'

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(chunk1),
              })
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(chunk2),
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      })

      const result = await streamBookstoreService.streamSearchBooks('test')

      expect(result.items).toHaveLength(1)
      expect(result.items[0]).toEqual({
        id: '1',
        title: 'Book 1',
      })
    })

    it('应该处理多个data消息', async () => {
      const mockNDJSON = `{"type":"meta","cursor":"abc","total":2,"hasMore":true}
{"type":"data","books":[{"id":"1","title":"Book 1"}]}
{"type":"data","books":[{"id":"2","title":"Book 2"}]}
{"type":"done","cursor":"def","total":2,"hasMore":false}`

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(mockNDJSON),
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      })

      const result = await streamBookstoreService.streamSearchBooks('test')

      expect(result.items).toHaveLength(2)
      expect(result.items[0].id).toBe('1')
      expect(result.items[1].id).toBe('2')
    })

    it('应该跳过空行', async () => {
      const mockNDJSON = `{"type":"meta","cursor":"abc","total":0,"hasMore":false}

{"type":"done","cursor":"def","total":0,"hasMore":false}`

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(mockNDJSON),
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      })

      const result = await streamBookstoreService.streamSearchBooks('test')

      expect(result.items).toHaveLength(0)
    })
  })

  describe('错误处理', () => {
    it('应该处理HTTP错误', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      })

      await expect(streamBookstoreService.streamSearchBooks('test')).rejects.toThrow(
        'HTTP error! status: 500',
      )
    })

    it('应该处理404错误', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      })

      await expect(streamBookstoreService.streamSearchBooks('test')).rejects.toThrow(
        'HTTP error! status: 404',
      )
    })

    it('应该处理流式error类型消息', async () => {
      const errorNDJSON = `{"type":"error","error":"Invalid keyword"}`

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(errorNDJSON),
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      })

      await expect(streamBookstoreService.streamSearchBooks('')).rejects.toThrow('Invalid keyword')
    })

    it('应该跳过无效的JSON行并继续处理', async () => {
      const invalidNDJSON = `{"type":"meta","cursor":"abc","total":1,"hasMore":true}
invalid json line
{"type":"data","books":[{"id":"1","title":"Book 1"}]}
{"type":"done","cursor":"def","total":1,"hasMore":false}`

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(invalidNDJSON),
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      })

      // 应该跳过无效行，继续处理有效数据
      const result = await streamBookstoreService.streamSearchBooks('test')

      expect(result.items).toHaveLength(1)
      expect(result.items[0].id).toBe('1')
    })

    it('应该处理只有无效JSON的响应', async () => {
      const invalidNDJSON = `completely invalid json
another invalid line`

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(invalidNDJSON),
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      })

      // 应该不抛出错误，返回空结果
      const result = await streamBookstoreService.streamSearchBooks('test')

      expect(result.items).toHaveLength(0)
    })

    it('应该正确设置错误消息', async () => {
      const errorNDJSON = `{"type":"error","error":"搜索关键词太短"}`

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(errorNDJSON),
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      })

      await expect(streamBookstoreService.streamSearchBooks('a')).rejects.toThrow('搜索关键词太短')
    })
  })

  describe('请求取消', () => {
    it('cleanup应该取消当前请求', () => {
      const abortSpy = vi.spyOn(AbortController.prototype, 'abort')

      // 先发起一个请求（使用不阻塞的mock）
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(
                  '{"type":"done","cursor":"","total":0,"hasMore":false}',
                ),
              })
              .mockResolvedValueOnce({ done: true }),
            releaseLock: vi.fn(),
          }),
        },
      })

      streamBookstoreService.streamSearchBooks('test')

      // 调用cleanup
      streamBookstoreService.cleanup()

      expect(abortSpy).toHaveBeenCalled()
    })

    it('应该正确处理AbortError', async () => {
      const abortError = new Error('Request was aborted')
      abortError.name = 'AbortError'

      global.fetch = vi.fn().mockRejectedValue(abortError)

      await expect(streamBookstoreService.streamSearchBooks('test')).rejects.toThrow(
        'Request was aborted',
      )
    })
  })

  describe('流式回调', () => {
    it('应该调用onUpdate回调', async () => {
      const onUpdate = vi.fn()
      const onComplete = vi.fn()

      const mockNDJSON = `{"type":"meta","cursor":"abc","total":1,"hasMore":true}
{"type":"data","books":[{"id":"1","title":"Book 1"}]}
{"type":"done","cursor":"def","total":1,"hasMore":false}`

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(mockNDJSON),
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      })

      await streamBookstoreService.streamSearchBooks('test', {}, { onUpdate, onComplete })

      expect(onUpdate).toHaveBeenCalledWith({
        type: 'meta',
        cursor: 'abc',
        total: 1,
        hasMore: true,
      })

      expect(onUpdate).toHaveBeenCalledWith({
        type: 'data',
        books: [{ id: '1', title: 'Book 1' }],
      })

      expect(onComplete).toHaveBeenCalledWith({
        cursor: 'def',
        total: 1,
        hasMore: false,
        items: [{ id: '1', title: 'Book 1' }],
      })
    })

    it('应该调用onError回调', async () => {
      const onError = vi.fn()

      const errorNDJSON = `{"type":"error","error":"Test error"}`

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(errorNDJSON),
              })
              .mockResolvedValueOnce({ done: true }),
            releaseLock: vi.fn(),
          }),
        },
      })

      try {
        await streamBookstoreService.streamSearchBooks('test', {}, { onError })
      } catch (e) {
        // Expected error to be thrown
      }

      // onError should be called before error is re-thrown
      expect(onError).toHaveBeenCalled()
    })
  })

  describe('查询参数', () => {
    it('应该正确构建查询参数', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(
                  '{"type":"done","cursor":"","total":0,"hasMore":false}',
                ),
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      })

      await streamBookstoreService.streamSearchBooks('test keyword', {
        category: 'fantasy',
        status: 'completed',
        sort_by: 'rating',
        order: 'desc',
      })

      expect(global.fetch as any).toHaveBeenCalledWith(
        (expect as any).stringContaining('keyword=test+keyword'),
        (expect as any).any(Object),
      )

      expect(global.fetch as any).toHaveBeenCalledWith(
        (expect as any).stringContaining('category=fantasy'),
        (expect as any).any(Object),
      )

      expect(global.fetch as any).toHaveBeenCalledWith(
        (expect as any).stringContaining('status=completed'),
        (expect as any).any(Object),
      )

      expect(global.fetch as any).toHaveBeenCalledWith(
        (expect as any).stringContaining('sort_by=rating'),
        (expect as any).any(Object),
      )

      expect(global.fetch as any).toHaveBeenCalledWith(
        (expect as any).stringContaining('order=desc'),
        (expect as any).any(Object),
      )
    })

    it('应该支持cursor分页', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(
                  '{"type":"done","cursor":"next","total":0,"hasMore":false}',
                ),
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      })

      await streamBookstoreService.streamSearchBooks(
        'test',
        {},
        {
          initialCursor: 'abc123',
        },
      )

      expect(global.fetch as any).toHaveBeenCalledWith(
        (expect as any).stringContaining('cursor=abc123'),
        (expect as any).any(Object),
      )
    })

    it('应该支持limit参数', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(
                  '{"type":"done","cursor":"","total":0,"hasMore":false}',
                ),
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      })

      await streamBookstoreService.streamSearchBooks(
        'test',
        {},
        {
          limit: 50,
        },
      )

      expect(global.fetch as any).toHaveBeenCalledWith(
        (expect as any).stringContaining('limit=50'),
        (expect as any).any(Object),
      )
    })
  })
})
