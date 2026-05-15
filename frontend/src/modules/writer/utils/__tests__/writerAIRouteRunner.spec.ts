import { describe, expect, it, vi } from 'vitest'
import {
  runWriterAnalysisRoute,
  runWriterDirectEditRoute,
  runWriterGeneralChatRoute,
} from '../writerAIRouteRunner'

describe('writerAIRouteRunner', () => {
  it('routes analysis flow to unresolved handler when target is unavailable', async () => {
    const onUnresolved = vi.fn(async () => {})
    const onResolved = vi.fn(async () => {})

    await runWriterAnalysisRoute({
      instruction: '分析这章',
      intent: { action: 'summarize', confidence: 1, kind: 'analysis' },
      resolveTarget: async () => ({ status: 'unresolved', assistantMessage: '未找到章节' }),
      onUnresolved,
      onResolved,
    })

    expect(onUnresolved).toHaveBeenCalledTimes(1)
    expect(onResolved).not.toHaveBeenCalled()
  })

  it('builds general chat history and resolves fallback reply', async () => {
    const onReply = vi.fn(async () => {})

    await runWriterGeneralChatRoute({
      finalRequestMessage: '你好',
      messages: [
        { id: '1', role: 'system', content: 'sys', timestamp: 1 },
        { id: '2', role: 'user', content: 'old', timestamp: 2 },
        { id: '3', role: 'assistant', content: 'reply', timestamp: 3 },
        { id: '4', role: 'user', content: 'current', timestamp: 4 },
      ],
      requestChat: async (_message, history) => {
        expect(history).toEqual([
          { role: 'user', content: 'old' },
          { role: 'assistant', content: 'reply' },
        ])
        return { reply: '' }
      },
      onReply,
    })

    expect(onReply).toHaveBeenCalledWith('抱歉，我没有理解您的问题。')
  })

  it('routes direct edit flow to unresolved handler when target has no source text', async () => {
    const onUnresolved = vi.fn(async () => {})
    const onResolved = vi.fn(async () => {})

    await runWriterDirectEditRoute({
      instruction: '改写这章',
      resolveTarget: async () => ({ status: 'ready', sourceText: '   ' }),
      onUnresolved,
      onResolved,
    })

    expect(onUnresolved).toHaveBeenCalledTimes(1)
    expect(onResolved).not.toHaveBeenCalled()
  })

  it('uses pre-resolved target for direct edit route', async () => {
    const onResolved = vi.fn(async () => {})

    await runWriterDirectEditRoute({
      instruction: '改写这章',
      target: {
        status: 'ready',
        sourceText: '正文',
        targetDocumentId: 'chapter-1',
      },
      resolveTarget: async () => {
        throw new Error('should not resolve again')
      },
      onUnresolved: async () => {},
      onResolved,
    })

    expect(onResolved).toHaveBeenCalledWith(
      expect.objectContaining({
        targetDocumentId: 'chapter-1',
      }),
    )
  })
})
