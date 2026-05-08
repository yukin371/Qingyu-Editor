import { beforeEach, describe, expect, it, vi } from 'vitest'

const summarizeText = vi.fn()
const proofreadText = vi.fn()
const chatWithAI = vi.fn()
const postAIRequest = vi.fn()

vi.mock('../ai', () => ({
  chatWithAI: (...args: unknown[]) => chatWithAI(...args),
  summarizeText: (...args: unknown[]) => summarizeText(...args),
  proofreadText: (...args: unknown[]) => proofreadText(...args),
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
    summarizeText.mockReset()
    proofreadText.mockReset()
    chatWithAI.mockReset()
    postAIRequest.mockReset()
  })

  it('routes rewrite workbench requests through the shared ai request helper', async () => {
    postAIRequest.mockResolvedValue({
      rewritten_text: '改写后的文本',
    })

    const result = await rewriteWithWorkbench({
      projectId: 'project-1',
      chapterId: 'chapter-1',
      originalText: '原文',
      mode: 'expand',
      instructions: '增加细节',
    })

    expect(postAIRequest).toHaveBeenCalledWith('/api/v1/ai/writing/rewrite', {
      projectId: 'project-1',
      chapterId: 'chapter-1',
      originalText: '原文',
      rewriteMode: 'expand',
      instructions: '增加细节',
    })
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

  it('keeps selection summary and proofread on the shared ai api facade', async () => {
    summarizeText.mockResolvedValue({
      summary: '摘要结果',
      keyPoints: ['要点'],
    })
    proofreadText.mockResolvedValue({
      score: 9,
      issues: [{ message: '建议调整节奏' }],
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
    })

    expect(summarizeText).toHaveBeenCalledWith('正文内容', {
      projectId: 'project-1',
      chapterId: 'chapter-1',
      maxLength: undefined,
      summaryType: 'detailed',
      includeQuotes: false,
    })
    expect(proofreadText).toHaveBeenCalledWith('正文内容', {
      projectId: 'project-1',
      chapterId: 'chapter-1',
    })
    expect(summary.summary).toBe('摘要结果')
    expect(review.score).toBe(9)
  })

  it('generates structure plans through chat facade and parses json reply', async () => {
    chatWithAI.mockResolvedValue({
      reply: JSON.stringify({
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

    expect(chatWithAI).toHaveBeenCalledTimes(1)
    expect(chatWithAI.mock.calls[0]?.[0]).toContain('补两个后续章节')
    expect(chatWithAI.mock.calls[0]?.[0]).toContain('当前工作流上下文')
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
})
