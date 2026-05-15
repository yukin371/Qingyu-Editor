import { describe, expect, it, vi } from 'vitest'
import { runWriterDirectEdit } from '../writerAIDirectEditRunner'
import type { WriterResolvedDocumentTarget } from '@/modules/writer/services/writerDocumentAgent.service'

const target: WriterResolvedDocumentTarget = {
  status: 'ready',
  targetDocumentId: 'chapter-2',
  targetDocumentTitle: '第二章',
  requestLabel: '第二章',
  sourceText: '正文',
}

describe('writerAIDirectEditRunner', () => {
  it('emits user/loading/success flow for cross-document direct edit', async () => {
    const onUserMessage = vi.fn()
    const onCrossDocumentLoading = vi.fn()
    const onSuccess = vi.fn()

    await runWriterDirectEdit({
      instruction: '补强冲突',
      intent: null,
      resolvedTarget: target,
      currentDocumentId: 'chapter-1',
      applyMode: 'replace_document',
      sourceText: '正文',
      requestEdit: async () => ({
        emittedAction: 'rewrite',
        label: '改写',
        generatedText: '新正文',
        applyMode: 'replace_document',
      }),
      onUserMessage,
      onCrossDocumentLoading,
      onEmptyResult: async () => {},
      onSuccess,
    })

    expect(onUserMessage).toHaveBeenCalled()
    expect(onCrossDocumentLoading).toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        generatedText: '新正文',
        isCrossDocument: true,
      }),
    )
  })

  it('routes empty generation result to fallback handler', async () => {
    const onEmptyResult = vi.fn()

    await runWriterDirectEdit({
      instruction: '补强冲突',
      intent: null,
      resolvedTarget: target,
      currentDocumentId: 'chapter-2',
      applyMode: 'replace_document',
      sourceText: '正文',
      requestEdit: async () => ({
        emittedAction: 'rewrite',
        label: '改写',
        generatedText: '',
        applyMode: 'replace_document',
      }),
      onUserMessage: async () => {},
      onEmptyResult,
      onSuccess: async () => {},
    })

    expect(onEmptyResult).toHaveBeenCalledTimes(1)
  })
})
