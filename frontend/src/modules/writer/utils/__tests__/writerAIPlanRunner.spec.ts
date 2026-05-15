import type { WriterEditorPlan } from '@/modules/writer/services/writerDocumentAgent.service'
import { describe, expect, it, vi } from 'vitest'
import { runWriterPlanOnly } from '../writerAIPlanRunner'

const plan: WriterEditorPlan = {
  route: 'plan_only',
  mutationMode: 'multi_document_plan',
  intent: null,
  target: {
    status: 'ready',
    requestLabel: '第一卷',
  },
  retrievals: [],
  requiresConfirmation: true,
  userVisibleSummary: '请先确认多章节修改计划。',
}

describe('writerAIPlanRunner', () => {
  it('emits inline plan-only messages when plan can be handled inline', async () => {
    const onUserMessage = vi.fn()
    const onAssistantMessage = vi.fn()

    const handled = await runWriterPlanOnly({
      content: '帮我一起调整前三章',
      plan,
      onUserMessage,
      onAssistantMessage,
    })

    expect(handled).toBe(true)
    expect(onUserMessage).toHaveBeenCalledWith('帮我一起调整前三章')
    expect(onAssistantMessage).toHaveBeenCalledWith(
      '请先确认多章节修改计划。',
      expect.objectContaining({ kind: 'writer_plan_preview' }),
    )
  })

  it('skips candidate-selection plan-only payloads', async () => {
    const handled = await runWriterPlanOnly({
      content: '修改上一章',
      plan: {
        ...plan,
        target: {
          status: 'unresolved',
          assistantMessage: '命中了多个章节，请选择。',
          candidates: [{ documentId: 'a', documentTitle: '第一章' }],
        },
      },
      onUserMessage: async () => {},
      onAssistantMessage: async () => {},
    })

    expect(handled).toBe(false)
  })
})
