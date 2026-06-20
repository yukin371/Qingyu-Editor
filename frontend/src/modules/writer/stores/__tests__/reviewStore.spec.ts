import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { AIAgentConfig } from '../../types/agent'

// Mock the reviewStream API. streamReviewChapter/streamReviewProject 接收 handlers，
// 在测试中通过 vi.fn 捕获，再用 queueMicrotask 触发 onToken/onToolStart/onDone/onError。
const mockStreamReviewChapter = vi.fn()
const mockStreamReviewProject = vi.fn()

vi.mock('../../api/reviewStream', () => ({
  streamReviewChapter: (...args: any[]) => mockStreamReviewChapter(...args),
  streamReviewProject: (...args: any[]) => mockStreamReviewProject(...args),
}))

// Import after mock
import { useReviewStore } from '../reviewStore'

const testConfig: AIAgentConfig = {
  provider: 'openai',
  apiKey: 'test-key',
  baseUrl: 'https://api.example.com/v1',
  model: 'gpt-4',
}

/**
 * 让 streamReviewChapter/Project 捕获 handlers 但不触发任何回调。
 * 测试通过 capturedHandlers 手动控制 onToken/onDone/onError 时机。
 */
const mockUnsubscribe = vi.fn()

function makeHandle(sessionID = 'sess_review') {
  return { sessionID, unsubscribe: mockUnsubscribe }
}

function captureHandlers(mockFn: ReturnType<typeof vi.fn>) {
  let capturedHandlers: any
  mockFn.mockImplementation((_cv, _p, _a3, _a4, _cfg, handlers: any) => {
    capturedHandlers = handlers
    return Promise.resolve(makeHandle())
  })
  return () => capturedHandlers
}

describe('reviewStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('startChapterReview', () => {
    it('opens drawer, sets status=streaming and target, calls streamReviewChapter with correct args', async () => {
      mockStreamReviewChapter.mockResolvedValue(makeHandle('sess_ch'))

      const store = useReviewStore()
      await store.startChapterReview('proj_001', 'ch_001', '第一章', testConfig)

      expect(store.isOpen).toBe(true)
      expect(store.activeReview).not.toBeNull()
      expect(store.activeReview!.kind).toBe('chapter')
      expect(store.activeReview!.status).toBe('streaming')
      expect(store.activeReview!.target).toEqual({ chapterId: 'ch_001', chapterTitle: '第一章' })
      expect(store.activeReview!.content).toBe('')
      expect(mockStreamReviewChapter).toHaveBeenCalledTimes(1)
      const args = mockStreamReviewChapter.mock.calls[0]
      // streamReviewChapter(conversationId, projectId, chapterId, chapterTitle, config, handlers)
      expect(args[0]).toBe('')
      expect(args[1]).toBe('proj_001')
      expect(args[2]).toBe('ch_001')
      expect(args[3]).toBe('第一章')
      expect(args[4]).toBe(testConfig)
    })
  })

  describe('startProjectReview', () => {
    it('opens drawer, calls streamReviewProject with project args', async () => {
      mockStreamReviewProject.mockResolvedValue(makeHandle('sess_proj'))

      const store = useReviewStore()
      await store.startProjectReview('proj_001', testConfig)

      expect(store.isOpen).toBe(true)
      expect(store.activeReview!.kind).toBe('project')
      expect(store.activeReview!.target).toBeNull()
      expect(mockStreamReviewProject).toHaveBeenCalledTimes(1)
      const args = mockStreamReviewProject.mock.calls[0]
      // streamReviewProject(conversationId, projectId, config, handlers)
      expect(args[0]).toBe('')
      expect(args[1]).toBe('proj_001')
      expect(args[2]).toBe(testConfig)
    })
  })

  describe('event handlers', () => {
    it('onToken accumulates deltas into content', async () => {
      const getHandlers = captureHandlers(mockStreamReviewChapter)
      const store = useReviewStore()
      const p = store.startChapterReview('proj_001', 'ch_001', '第一章', testConfig)
      await vi.waitFor(() => expect(getHandlers()).toBeDefined())

      getHandlers().onToken('a')
      getHandlers().onToken('b')
      expect(store.activeReview!.content).toBe('ab')

      getHandlers().onDone({ content: 'ab done', status: 'ok' })
      await p
    })

    it('onToolStart/onToolEnd lifecycle on activeToolCall', async () => {
      const getHandlers = captureHandlers(mockStreamReviewChapter)
      const store = useReviewStore()
      const p = store.startChapterReview('proj_001', 'ch_001', '第一章', testConfig)
      await vi.waitFor(() => expect(getHandlers()).toBeDefined())

      expect(store.activeToolCall).toBeNull()
      getHandlers().onToolStart('read_chapter')
      expect(store.activeToolCall).toEqual({ name: 'read_chapter', status: 'running' })
      getHandlers().onToolEnd('read_chapter', true)
      expect(store.activeToolCall).toBeNull()

      getHandlers().onDone({ content: 'ok', status: 'ok' })
      await p
    })

    it('onDone replaces content with result.content and sets status=done', async () => {
      const getHandlers = captureHandlers(mockStreamReviewChapter)
      const store = useReviewStore()
      const p = store.startChapterReview('proj_001', 'ch_001', '第一章', testConfig)
      await vi.waitFor(() => expect(getHandlers()).toBeDefined())

      getHandlers().onToken('partial')
      expect(store.activeReview!.content).toBe('partial')

      getHandlers().onDone({ content: '完整审阅报告', status: 'ok' })
      await p

      expect(store.activeReview!.content).toBe('完整审阅报告')
      expect(store.activeReview!.status).toBe('done')
    })

    it('onError sets status=error with errorMessage', async () => {
      const getHandlers = captureHandlers(mockStreamReviewChapter)
      const store = useReviewStore()
      const p = store.startChapterReview('proj_001', 'ch_001', '第一章', testConfig)
      await vi.waitFor(() => expect(getHandlers()).toBeDefined())

      getHandlers().onError('审阅服务不可用')
      await p

      expect(store.activeReview!.status).toBe('error')
      expect(store.activeReview!.errorMessage).toBe('审阅服务不可用')
    })
  })

  describe('close', () => {
    it('resets all state', async () => {
      mockStreamReviewChapter.mockResolvedValue(makeHandle('sess_ch'))
      const store = useReviewStore()
      await store.startChapterReview('proj_001', 'ch_001', '第一章', testConfig)
      expect(store.isOpen).toBe(true)
      expect(store.activeReview).not.toBeNull()

      store.close()
      expect(store.isOpen).toBe(false)
      expect(store.activeReview).toBeNull()
      expect(store.activeToolCall).toBeNull()
    })
  })

  describe('concurrency', () => {
    it('starting a new review while one streams unsubscribes previous handlers', async () => {
      // 第一次：捕获 handlers 但不触发 onDone，模拟流式进行中
      const getHandlers1 = captureHandlers(mockStreamReviewChapter)
      const store = useReviewStore()
      const p1 = store.startChapterReview('proj_001', 'ch_001', '第一章', testConfig)
      await vi.waitFor(() => expect(getHandlers1()).toBeDefined())

      // 第二次：新的 review 触发，应先清理上一次订阅
      // 为模拟 store 内部 cleanup，第二次 mock 改为立即 resolve
      mockStreamReviewChapter.mockResolvedValueOnce(makeHandle('sess_ch2'))
      const p2 = store.startChapterReview('proj_001', 'ch_002', '第二章', testConfig)

      await p1
      await p2

      // 第二次成功打开且 target 切换
      expect(store.activeReview!.target).toEqual({ chapterId: 'ch_002', chapterTitle: '第二章' })
      // 第一次的 unsubscribe 在第二次 start 时被调用
      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    it('rapid double-start before first resolves does not orphan subscriptions', async () => {
      // 两次 start 都未 resolve 时连续触发：第一个 resolve 后应自清理，
      // 第二个成为当前 review，target 切到第二章。
      let resolveFirst!: (h: any) => void
      let resolveSecond!: (h: any) => void
      mockStreamReviewChapter
        .mockImplementationOnce(() => new Promise((res) => { resolveFirst = res }))
        .mockImplementationOnce(() => new Promise((res) => { resolveSecond = res }))

      const store = useReviewStore()
      const p1 = store.startChapterReview('proj_001', 'ch_001', '第一章', testConfig)
      const p2 = store.startChapterReview('proj_001', 'ch_002', '第二章', testConfig)

      // 注意：p2 start 时 p1 的 await 尚未 resolve，p1 的 holder.fn 仍为 null，
      // runCleanup 调用 myCleanup 是 no-op；p1 必须在 resolve 后自清理。
      const unsub1 = vi.fn()
      const unsub2 = vi.fn()
      resolveFirst({ sessionID: 'sess_first', unsubscribe: unsub1 })
      resolveSecond({ sessionID: 'sess_second', unsubscribe: unsub2 })

      await p1
      await p2

      // 第二次胜出：sessionID 来自第二次，target 切到第二章
      expect(store.activeReview!.sessionID).toBe('sess_second')
      expect(store.activeReview!.target).toEqual({ chapterId: 'ch_002', chapterTitle: '第二章' })
      // 第一次 handle.unsubscribe 被立即调用（自清理）
      expect(unsub1).toHaveBeenCalledTimes(1)
      // 第二次的 unsubscribe 仍登记在 currentCleanup，未触发
      expect(unsub2).not.toHaveBeenCalled()
    })
  })
})
