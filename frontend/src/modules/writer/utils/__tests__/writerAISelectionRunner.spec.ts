import { describe, expect, it, vi } from 'vitest'
import { runWriterSelectionAction } from '../writerAISelectionRunner'

describe('writerAISelectionRunner', () => {
  it('emits user prompt and success payload when generation succeeds', async () => {
    const onUserMessage = vi.fn()
    const onSuccess = vi.fn()
    const onEmptyResult = vi.fn()

    await runWriterSelectionAction({
      action: 'rewrite',
      selectedText: '原文',
      instructions: '保留语气',
      mergedInstructions: '保留语气',
      executeAction: async () => ({ rewritten_text: '新正文' }),
      onUserMessage,
      onEmptyResult,
      onSuccess,
    })

    expect(onUserMessage).toHaveBeenCalledWith('[改写] 原文\n要求：保留语气')
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        generatedText: '新正文',
      }),
    )
    expect(onEmptyResult).not.toHaveBeenCalled()
  })

  it('routes empty result to fallback handler', async () => {
    const onEmptyResult = vi.fn()

    await runWriterSelectionAction({
      action: 'continue',
      selectedText: '原文',
      executeAction: async () => ({ generated_text: '' }),
      onUserMessage: async () => {},
      onEmptyResult,
      onSuccess: async () => {},
    })

    expect(onEmptyResult).toHaveBeenCalledTimes(1)
  })
})
