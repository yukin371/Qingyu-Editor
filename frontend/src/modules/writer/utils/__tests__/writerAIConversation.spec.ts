import { describe, expect, it } from 'vitest'
import {
  buildGeneralChatHistory,
  buildTargetResolutionResult,
  resolveGeneralChatReply,
} from '../writerAIConversation'
import type { ChatMessage } from '@/modules/writer/components/editor/ai/types'
import type { WriterResolvedDocumentTarget } from '@/modules/writer/services/writerDocumentAgent.service'

describe('writerAIConversation', () => {
  it('builds general chat history without current and system messages', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'system', content: 'sys', timestamp: 1 },
      { id: '2', role: 'user', content: 'hello', timestamp: 2 },
      { id: '3', role: 'assistant', content: 'world', timestamp: 3 },
      { id: '4', role: 'user', content: 'current', timestamp: 4 },
    ]

    expect(buildGeneralChatHistory(messages)).toEqual([
      { role: 'user', content: 'hello' },
      { role: 'assistant', content: 'world' },
    ])
  })

  it('builds target resolution result and fallback reply', () => {
    const target: WriterResolvedDocumentTarget = {
      status: 'unresolved',
      requestLabel: '第二章',
      assistantMessage: '命中了多个章节',
      candidates: [{ documentId: 'chapter-2', documentTitle: '第二章' }],
    }

    expect(buildTargetResolutionResult('查第二章', 'analysis', target)).toMatchObject({
      assistantMessage: '命中了多个章节',
    })
    expect(resolveGeneralChatReply('')).toBe('抱歉，我没有理解您的问题。')
  })
})
