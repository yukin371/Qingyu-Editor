import type { WriterResolvedDocumentTarget } from '@/modules/writer/services/writerDocumentAgent.service'
import { describe, expect, it, vi } from 'vitest'
import { runWriterResolvedAnalysis } from '../writerAIAnalysisRunner'

const target: WriterResolvedDocumentTarget = {
  status: 'ready',
  targetDocumentId: 'chapter-2',
  targetDocumentTitle: '第二章',
  requestLabel: '第二章',
  sourceText: '正文',
}

describe('writerAIAnalysisRunner', () => {
  it('emits proofread success flow for cross-document analysis', async () => {
    const onUserMessage = vi.fn()
    const onSuccess = vi.fn()

    await runWriterResolvedAnalysis({
      instruction: '检查本章问题',
      intent: {
        action: 'proofread',
        scope: 'document',
        label: '审校',
      },
      resolvedTarget: target,
      currentDocumentId: 'chapter-1',
      projectId: 'project-1',
      requestProofread: async () => ({
        issues: [{ message: '建议调整语序', suggestions: ['主语前置'] }],
      }),
      requestSummary: async () => ({ summary: '不会走到这里' }),
      onMissingSource: async () => {},
      onUserMessage,
      onEmptyResult: async () => {},
      onSuccess,
    })

    expect(onUserMessage).toHaveBeenCalledWith('检查本章问题')
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        generatedText: expect.stringContaining('建议调整语序'),
        isCrossDocument: true,
      }),
    )
  })

  it('routes empty source to missing-source handler', async () => {
    const onMissingSource = vi.fn()

    await runWriterResolvedAnalysis({
      instruction: '总结这章',
      intent: {
        action: 'summarize',
        scope: 'document',
        label: '总结',
      },
      resolvedTarget: {
        ...target,
        sourceText: '   ',
      },
      currentDocumentId: 'chapter-2',
      projectId: 'project-1',
      requestProofread: async () => ({ issues: [] }),
      requestSummary: async () => ({ summary: '' }),
      onMissingSource,
      onUserMessage: async () => {},
      onEmptyResult: async () => {},
      onSuccess: async () => {},
    })

    expect(onMissingSource).toHaveBeenCalledTimes(1)
  })
})
