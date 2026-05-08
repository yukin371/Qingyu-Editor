/**
 * Authors Result Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthorsResultStore } from '../authors-result.store'

describe('AuthorsResultStore', () => {
  beforeEach(() => {
    // 创建新的pinia实例
    setActivePinia(createPinia())
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const store = useAuthorsResultStore()

      expect(store.authors).toEqual([])
      expect(store.cursor).toBe('')
      expect(store.hasMore).toBe(true)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('search方法', () => {
    it('应该在无关键词时返回空结果', async () => {
      const store = useAuthorsResultStore()

      await store.search('')

      expect(store.authors).toEqual([])
      expect(store.hasMore).toBe(false)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('应该能通过作者名称搜索', async () => {
      const store = useAuthorsResultStore()

      await store.search('唐家三少')

      expect(store.authors.length).toBe(1)
      expect(store.authors[0].name).toBe('唐家三少')
      expect(store.isLoading).toBe(false)
    })

    it('应该能通过作者简介搜索', async () => {
      const store = useAuthorsResultStore()

      await store.search('斗罗大陆')

      expect(store.authors.length).toBe(1)
      expect(store.authors[0].name).toBe('唐家三少')
    })

    it('应该能搜索到多个结果', async () => {
      const store = useAuthorsResultStore()

      await store.search('起点白金作家')

      // 所有5个作者的简介都包含"起点白金作家"
      expect(store.authors.length).toBe(5)
    })

    it('应该在无匹配结果时返回空数组', async () => {
      const store = useAuthorsResultStore()

      await store.search('不存在的作者名')

      expect(store.authors).toEqual([])
      expect(store.hasMore).toBe(false)
    })

    it('应该最多返回20条结果', async () => {
      const store = useAuthorsResultStore()

      // 搜索一个能匹配所有作者的关键词
      await store.search('起点')

      expect(store.authors.length).toBeLessThanOrEqual(20)
      expect(store.hasMore).toBe(false)
    })

    it('应该模拟500ms网络延迟', async () => {
      const store = useAuthorsResultStore()

      const startTime = Date.now()
      await store.search('唐家三少')
      const endTime = Date.now()

      const elapsedTime = endTime - startTime
      expect(elapsedTime).toBeGreaterThanOrEqual(500)
    })
  })

  describe('loadNextBatch方法', () => {
    it('应该设置hasMore为false（mock数据不支持分页）', async () => {
      const store = useAuthorsResultStore()

      await store.loadNextBatch()

      expect(store.hasMore).toBe(false)
    })
  })

  describe('clearResults方法', () => {
    it('应该清空搜索结果', async () => {
      const store = useAuthorsResultStore()

      // 先进行搜索
      await store.search('唐家三少')
      expect(store.authors.length).toBeGreaterThan(0)

      // 清空结果
      store.clearResults()

      expect(store.authors).toEqual([])
      expect(store.cursor).toBe('')
      expect(store.hasMore).toBe(true)
      expect(store.error).toBeNull()
    })
  })

  describe('clearError方法', () => {
    it('应该清空错误信息', () => {
      const store = useAuthorsResultStore()

      // 手动设置错误
      store.error = '测试错误'

      store.clearError()

      expect(store.error).toBeNull()
    })
  })

  describe('resetState方法', () => {
    it('应该重置状态到初始值', async () => {
      const store = useAuthorsResultStore()

      // 修改状态
      await store.search('唐家三少')
      expect(store.authors.length).toBeGreaterThan(0)

      // 重置状态
      store.resetState()

      expect(store.authors).toEqual([])
      expect(store.cursor).toBe('')
      expect(store.hasMore).toBe(true)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('getters', () => {
    it('authorsCount应该返回作者数量', async () => {
      const store = useAuthorsResultStore()

      await store.search('唐家三少')

      expect(store.authorsCount).toBe(1)
    })

    it('hasResults应该在有结果时返回true', async () => {
      const store = useAuthorsResultStore()

      await store.search('唐家三少')

      expect(store.hasResults).toBe(true)
    })

    it('hasResults应该在无结果时返回false', async () => {
      const store = useAuthorsResultStore()

      await store.search('')

      expect(store.hasResults).toBe(false)
    })

    it('loading应该反映加载状态', async () => {
      const store = useAuthorsResultStore()

      // 搜索过程中
      const searchPromise = store.search('唐家三少')
      expect(store.isLoading).toBe(true)

      await searchPromise
      expect(store.isLoading).toBe(false)
    })
  })
})
