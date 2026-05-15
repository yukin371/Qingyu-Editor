import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  executeWriterTextAction,
  extractWriterGeneratedText,
  requestWriterContextualEditIntent,
  requestWriterContextualSelectionAction,
  requestWriterEditIntent,
  resolveWriterActionLabel,
} from '../writerAIGeneration'

const continueWriting = vi.fn()
const polishText = vi.fn()
const expandText = vi.fn()
const rewriteText = vi.fn()

vi.mock('@/modules/ai/api', () => ({
  continueWriting: (...args: unknown[]) => continueWriting(...args),
  polishText: (...args: unknown[]) => polishText(...args),
  expandText: (...args: unknown[]) => expandText(...args),
  rewriteText: (...args: unknown[]) => rewriteText(...args),
}))

describe('writerAIGeneration', () => {
  beforeEach(() => {
    continueWriting.mockReset()
    polishText.mockReset()
    expandText.mockReset()
    rewriteText.mockReset()
  })

  it('resolves action labels and generated text consistently', () => {
    expect(resolveWriterActionLabel('expand')).toBe('扩写')
    expect(extractWriterGeneratedText('rewrite', { rewritten_text: '结果' })).toBe('结果')
  })

  it('dispatches text action to the matching ai api', async () => {
    expandText.mockResolvedValue({ expanded_text: '扩写结果' })

    const result = await executeWriterTextAction({
      projectId: 'project-1',
      action: 'expand',
      sourceText: '原文',
      instructions: '继续扩写',
      targetLength: 400,
    })

    expect(expandText).toHaveBeenCalledWith('project-1', '原文', '继续扩写', 400)
    expect(result).toEqual({ expanded_text: '扩写结果' })
  })

  it('builds direct edit execution result from intent', async () => {
    continueWriting.mockResolvedValue({ generated_text: '续写结果' })

    const result = await requestWriterEditIntent({
      projectId: 'project-1',
      sourceText: '原文',
      intent: { action: 'continue', confidence: 0.9, kind: 'edit', targetLength: 350 },
      applyMode: 'append_paragraph',
      mergedInstructions: '继续写',
    })

    expect(result).toMatchObject({
      emittedAction: 'continue',
      label: '续写',
      generatedText: '续写结果',
      applyMode: 'append_paragraph',
    })
  })

  it('builds contextual rewrite request with merged instructions', async () => {
    rewriteText.mockResolvedValue({ rewritten_text: '改写结果' })

    const result = await requestWriterContextualEditIntent({
      projectId: 'project-1',
      sourceText: '原文',
      instruction: '改得更克制',
      intent: null,
      applyMode: 'replace_document',
      baseInstructions: '保留人物口吻',
      context: {
        workflowContext: {
          signature: 'sig',
          projectId: 'project-1',
          chapterId: 'chapter-1',
          chapterTitle: '第一章',
          activeCharacters: [],
          activeRelations: [],
          pendingChangeRequests: [],
          pendingChangeRequestCount: 0,
        },
        aiSummaryContextText: '前文摘要',
      },
    })

    expect(rewriteText).toHaveBeenCalledWith(
      'project-1',
      '原文',
      'polish',
      expect.stringContaining('请直接输出可替换整章正文的完整版本。'),
    )
    expect(result).toMatchObject({
      emittedAction: 'rewrite',
      generatedText: '改写结果',
      applyMode: 'replace_document',
    })
  })

  it('builds contextual selection action request', async () => {
    expandText.mockResolvedValue({ expanded_text: '扩写结果' })

    const result = await requestWriterContextualSelectionAction({
      projectId: 'project-1',
      action: 'expand',
      selectedText: '原文片段',
      instructions: '增加环境压迫感',
      context: {
        workflowContext: {
          signature: 'sig',
          projectId: 'project-1',
          chapterId: 'chapter-1',
          chapterTitle: '第一章',
          activeCharacters: [],
          activeRelations: [],
          pendingChangeRequests: [],
          pendingChangeRequestCount: 0,
        },
        aiSummaryContextText: '前文摘要',
      },
    })

    expect(expandText).toHaveBeenCalledWith(
      'project-1',
      '原文片段',
      expect.stringContaining('增加环境压迫感'),
      undefined,
    )
    expect(result).toEqual({ expanded_text: '扩写结果' })
  })
})
