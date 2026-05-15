import type { WriterAIApplyPayload } from '@/modules/writer/types/workflow'
import { describe, expect, it, vi } from 'vitest'
import { runWriterDocumentCommand } from '../writerAIDocumentCommandRunner'

describe('writerAIDocumentCommandRunner', () => {
  it('emits handled command messages and patch payload', async () => {
    const onUserMessage = vi.fn()
    const onAssistantMessage = vi.fn()
    const onPatchPayload = vi.fn()
    const patchPayload = {
      action: 'rewrite',
      sourceText: '旧正文',
      generatedText: '新正文',
      applyMode: 'replace_document',
    } satisfies WriterAIApplyPayload

    const handled = await runWriterDocumentCommand({
      content: ' /doc patch replace 1 => 新正文 ',
      context: {
        projectId: 'project-1',
      },
      executeCommand: async () => ({
        handled: true,
        userEcho: '/doc patch replace 1 => 新正文',
        assistantMessage: '已生成 diff',
        patchPayload,
      }),
      onUserMessage,
      onAssistantMessage,
      onPatchPayload,
    })

    expect(handled).toBe(true)
    expect(onUserMessage).toHaveBeenCalledWith('/doc patch replace 1 => 新正文')
    expect(onAssistantMessage).toHaveBeenCalledWith('已生成 diff', undefined)
    expect(onPatchPayload).toHaveBeenCalledWith(patchPayload)
  })

  it('returns false for unhandled command input', async () => {
    const handled = await runWriterDocumentCommand({
      content: '普通聊天',
      context: {},
      executeCommand: async () => ({ handled: false }),
      onUserMessage: async () => {},
    })

    expect(handled).toBe(false)
  })
})
