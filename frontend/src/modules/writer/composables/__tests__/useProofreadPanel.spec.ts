import { effectScope, nextTick, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProofreadPanel } from '../useProofreadPanel'

const proofreadContent = vi.fn()

vi.mock('@/modules/ai/api/workbench', () => ({
  proofreadContent: (...args: unknown[]) => proofreadContent(...args),
}))

describe('useProofreadPanel', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    proofreadContent.mockReset()
  })

  it('runs system rules by default without calling ai proofread', async () => {
    const scope = effectScope()
    const result = scope.run(() => useProofreadPanel(ref('既使他来了。。')))

    if (!result) {
      throw new Error('composable result missing')
    }

    await result.runProofread()

    expect(proofreadContent).not.toHaveBeenCalled()
    expect(result.runMode.value).toBe('system')
    expect(result.issues.value).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: 'local',
          title: '重复标点',
          severity: 'error',
        }),
        expect.objectContaining({
          source: 'local',
          title: '常见错词',
          originalText: '既使',
          replacementText: '即使',
        }),
      ]),
    )
    scope.stop()
  })

  it('includes external MIT idiom lexicon matches in system proofread', async () => {
    const scope = effectScope()
    const result = scope.run(() => useProofreadPanel(ref('他迫不急待地冲了出去。')))

    if (!result) {
      throw new Error('composable result missing')
    }

    await result.runProofread()

    expect(result.issues.value).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: 'local',
          title: '成语错写',
          originalText: '迫不急待',
          suggestion: '建议改为“迫不及待”。',
          replacementText: '迫不及待',
        }),
      ]),
    )
    scope.stop()
  })

  it('filters system proofread lexicon issues with project ignored terms', async () => {
    const scope = effectScope()
    const result = scope.run(() =>
      useProofreadPanel(ref('青羽城里，众人迫不急待地赶来。'), {
        ignoredTerms: ref(['迫不急待']),
      }),
    )

    if (!result) {
      throw new Error('composable result missing')
    }

    await result.runProofread()

    expect(result.issues.value).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          originalText: '迫不急待',
        }),
      ]),
    )
    scope.stop()
  })

  it('normalizes ai proofread issues with structured position and source info on explicit ai run', async () => {
    proofreadContent.mockResolvedValue({
      score: 88,
      issues: [
        {
          id: 'ai-1',
          type: 'grammar',
          severity: 'error',
          message: '疑似病句',
          originalText: '张三在见李四',
          position: {
            start: 0,
            end: 6,
          },
          suggestionDetails: [
            {
              text: '张三再见李四',
              reason: '表达更自然',
              confidence: 0.92,
            },
          ],
        },
      ],
    })

    const scope = effectScope()
    const result = scope.run(() =>
      useProofreadPanel(ref('张三在见李四。'), {
        projectId: ref('project-1'),
        chapterId: ref('chapter-1'),
      }),
    )

    if (!result) {
      throw new Error('composable result missing')
    }

    await result.runAIProofread()

    expect(proofreadContent).toHaveBeenCalledWith({
      content: '张三在见李四。',
      projectId: 'project-1',
      chapterId: 'chapter-1',
    })
    expect(result.runMode.value).toBe('ai')
    expect(result.issues.value.find((issue) => issue.id === 'ai-1')).toMatchObject({
      id: 'ai-1',
      type: 'grammar',
      severity: 'error',
      status: 'open',
      title: '病句',
      description: '疑似病句',
      suggestion: '张三再见李四',
      replacementText: '张三再见李四',
      originalText: '张三在见李四',
      position: {
        start: 0,
        end: 6,
      },
      source: 'ai',
    })
    expect(result.hasRun.value).toBe(true)
    scope.stop()
  })

  it('keeps system rule results when explicit ai proofread fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    proofreadContent.mockRejectedValue(new Error('offline'))

    const scope = effectScope()
    const result = scope.run(() => useProofreadPanel(ref('张三。  李四。')))

    if (!result) {
      throw new Error('composable result missing')
    }

    await result.runAIProofread()

    expect(result.runMode.value).toBe('ai_unavailable')
    expect(result.notice.value).toContain('AI 深度审校不可用')
    expect(result.issues.value.length).toBeGreaterThan(0)
    expect(result.issues.value[0]).toMatchObject({
      source: 'local',
      status: 'open',
    })
    scope.stop()
  })

  it('marks existing open issues stale when source text changes after a run', async () => {
    proofreadContent.mockResolvedValue({
      score: 90,
      issues: [
        {
          id: 'ai-stale',
          type: 'typo',
          severity: 'warning',
          message: '疑似错别字',
          originalText: '在见',
          position: {
            start: 2,
            end: 4,
          },
          suggestions: ['再见'],
        },
      ],
    })

    const sourceText = ref('张三在见李四。')
    const scope = effectScope()
    const result = scope.run(() => useProofreadPanel(sourceText))

    if (!result) {
      throw new Error('composable result missing')
    }

    await result.runAIProofread()
    sourceText.value = '张三再见李四。'
    await nextTick()

    expect(result.issues.value[0].status).toBe('stale')
    expect(result.notice.value).toContain('正文已变化')
    scope.stop()
  })
})
