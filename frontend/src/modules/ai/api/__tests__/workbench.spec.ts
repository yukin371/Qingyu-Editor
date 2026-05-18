import { beforeEach, describe, expect, it, vi } from 'vitest'

const { requestWriterAI, chatWithAI, postAIRequest, isUserProviderModeEnabled, userAIProviderApi } =
  vi.hoisted(() => ({
    requestWriterAI: vi.fn(),
    chatWithAI: vi.fn(),
    postAIRequest: vi.fn(),
    isUserProviderModeEnabled: vi.fn(() => false),
    userAIProviderApi: {
      workbench: {
        rewrite: vi.fn(),
        auditSensitiveWords: vi.fn(),
      },
    },
  }))

vi.mock('../../config/provider', () => ({
  isUserProviderModeEnabled,
}))

vi.mock('../ai', () => ({
  chatWithAI: (...args: unknown[]) => chatWithAI(...args),
  requestWriterAI: (...args: unknown[]) => requestWriterAI(...args),
}))

vi.mock('../ai-user-provider', () => ({
  userAIProviderApi,
}))

vi.mock('../request', () => ({
  AI_REQUEST_TIMEOUT_MS: 65_000,
  postAIRequest: (...args: unknown[]) => postAIRequest(...args),
}))

import {
  auditSensitiveWords,
  generateStructurePlan,
  proofreadContent,
  rewriteWithWorkbench,
  summarizeChapter,
  summarizeSelection,
} from '../workbench'

describe('ai workbench api', () => {
  beforeEach(() => {
    isUserProviderModeEnabled.mockReset()
    isUserProviderModeEnabled.mockReturnValue(false)
    requestWriterAI.mockReset()
    chatWithAI.mockReset()
    postAIRequest.mockReset()
    userAIProviderApi.workbench.rewrite.mockReset()
    userAIProviderApi.workbench.auditSensitiveWords.mockReset()
  })

  it('routes rewrite workbench requests through the shared ai request helper', async () => {
    requestWriterAI.mockResolvedValue({
      generatedText: '改写后的文本',
    })

    const result = await rewriteWithWorkbench({
      projectId: 'project-1',
      chapterId: 'chapter-1',
      originalText: '原文',
      mode: 'expand',
      instructions: '增加细节',
    })

    expect(requestWriterAI).toHaveBeenCalledWith(
      expect.objectContaining({
        route: 'single_document_edit',
        mutationMode: 'single_document_diff',
        intent: { action: 'expand' },
        userVisibleSummary: '增加细节',
      }),
    )
    expect(result.rewrittenText).toBe('改写后的文本')
  })

  it('routes chapter summaries through the shared ai request helper', async () => {
    postAIRequest.mockResolvedValue({
      summary: '章节总结',
      keyPoints: ['要点一'],
    })

    const result = await summarizeChapter({
      projectId: 'project-1',
      chapterId: 'chapter-1',
    })

    expect(postAIRequest).toHaveBeenCalledWith('/api/v1/ai/writing/summarize-chapter', {
      projectId: 'project-1',
      chapterId: 'chapter-1',
      outlineLevel: 3,
    })
    expect(result.summary).toBe('章节总结')
    expect(result.keyPoints).toEqual(['要点一'])
  })

  it('routes sensitive-word audits through the shared ai request helper', async () => {
    postAIRequest.mockResolvedValue({
      totalMatches: 1,
      isSafe: false,
      sensitiveWords: [{ word: '禁词' }],
    })

    const result = await auditSensitiveWords({
      content: '包含禁词的内容',
      projectId: 'project-1',
      chapterId: 'chapter-1',
    })

    expect(postAIRequest).toHaveBeenCalledWith('/api/v1/ai/audit/sensitive-words', {
      content: '包含禁词的内容',
      projectId: 'project-1',
      chapterId: 'chapter-1',
      category: 'all',
    })
    expect(result.isSafe).toBe(false)
    expect(result.sensitiveWords).toEqual([{ word: '禁词' }])
  })

  it('keeps sensitive audit on user provider when user api mode is enabled', async () => {
    isUserProviderModeEnabled.mockReturnValue(true)
    userAIProviderApi.workbench.auditSensitiveWords.mockResolvedValue({
      totalMatches: 0,
      isSafe: true,
      sensitiveWords: [],
    })

    const auditResult = await auditSensitiveWords({
      content: '正常内容',
    })

    expect(userAIProviderApi.workbench.auditSensitiveWords).toHaveBeenCalledWith({
      content: '正常内容',
    })
    expect(postAIRequest).not.toHaveBeenCalled()
    expect(auditResult.isSafe).toBe(true)
  })

  it('keeps selection summary and proofread on the shared ai api facade', async () => {
    requestWriterAI
      .mockResolvedValueOnce({
        message: '摘要结果',
        analysis: {
          summary: '摘要结果',
          keyPoints: ['要点'],
        },
      })
      .mockResolvedValueOnce({
        message: '1. 建议调整节奏',
        analysis: {
          score: 9,
          issues: [{ message: '建议调整节奏' }],
        },
      })

    const summary = await summarizeSelection({
      content: '正文内容',
      projectId: 'project-1',
      chapterId: 'chapter-1',
    })
    const review = await proofreadContent({
      content: '正文内容',
      projectId: 'project-1',
      chapterId: 'chapter-1',
      workflowContextPrompt: '当前工作流上下文：雨夜冲突升级',
      sceneStage: {
        sceneTitle: '雨夜追杀',
        beatTitle: '旧友现身',
        beatStatus: 'active',
        goal: '逼主角做选择',
        conflict: '救人与守秘冲突',
      },
    })

    expect(requestWriterAI).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        route: 'analysis',
        mutationMode: 'none',
        intent: { action: 'summarize' },
      }),
    )
    expect(requestWriterAI).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        route: 'analysis',
        mutationMode: 'none',
        intent: { action: 'proofread' },
      }),
    )
    expect(requestWriterAI.mock.calls[1]?.[0]?.context.workflowSummary).toContain(
      '当前工作流上下文：雨夜冲突升级',
    )
    expect(requestWriterAI.mock.calls[1]?.[0]?.context.sceneStage?.beatTitle).toBe('旧友现身')
    expect(summary.summary).toBe('摘要结果')
    expect(review.score).toBe(9)
  })

  it('generates structure plans through the shared writer ai facade and parses json reply', async () => {
    requestWriterAI.mockResolvedValue({
      message: JSON.stringify({
        summary: '围绕当前冲突新增两章推进。',
        items: [
          {
            title: '夜探旧仓库',
            summary: '主角第一次确认线索方向。',
            reason: '补足冲突升级节点。',
          },
          {
            title: '街口对峙',
            summary: '反派提前亮相。',
            reason: '把压力前置到下一段。',
          },
        ],
      }),
    })

    const result = await generateStructurePlan({
      projectId: 'project-1',
      chapterId: 'chapter-1',
      chapterTitle: '第一章',
      mode: 'chapter',
      count: 2,
      prompt: '补两个后续章节',
      seedText: '张三刚发现账本有问题。',
      workflowContextPrompt: '当前工作流上下文：章节：第一章',
    })

    expect(requestWriterAI).toHaveBeenCalledTimes(1)
    expect(requestWriterAI).toHaveBeenCalledWith(
      expect.objectContaining({
        route: 'plan_only',
        mutationMode: 'none',
        userVisibleSummary: expect.stringContaining('补两个后续章节'),
      }),
    )
    expect(requestWriterAI.mock.calls[0]?.[0]?.userVisibleSummary).toContain('当前工作流上下文')
    expect(result.summary).toBe('围绕当前冲突新增两章推进。')
    expect(result.items).toEqual([
      {
        title: '夜探旧仓库',
        summary: '主角第一次确认线索方向。',
        reason: '补足冲突升级节点。',
      },
      {
        title: '街口对峙',
        summary: '反派提前亮相。',
        reason: '把压力前置到下一段。',
      },
    ])
  })

  it('throws a clear error for chapter summary in user api mode', async () => {
    isUserProviderModeEnabled.mockReturnValue(true)

    await expect(
      summarizeChapter({
        projectId: 'project-1',
        chapterId: 'chapter-1',
      }),
    ).rejects.toThrow('章节摘要需要正文上下文')
  })
})
