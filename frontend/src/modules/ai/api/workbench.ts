import { chatWithAI, summarizeText, proofreadText } from './ai'
import { isUserProviderModeEnabled } from '../config/provider'
import { postAIRequest } from './request'
import { userAIProviderApi } from './ai-user-provider'

export interface RewriteToolRequest {
  projectId: string
  chapterId?: string
  originalText: string
  mode: 'polish' | 'expand' | 'shorten'
  instructions?: string
}

export interface RewriteToolResult {
  rewrittenText: string
  raw: Record<string, unknown>
}

export interface SummaryToolRequest {
  content: string
  projectId?: string
  chapterId?: string
  maxLength?: number
  summaryType?: 'brief' | 'detailed' | 'keypoints'
  includeQuotes?: boolean
}

export interface ChapterSummaryRequest {
  projectId: string
  chapterId: string
  outlineLevel?: number
}

export interface SummaryToolResult {
  summary: string
  keyPoints: string[]
  raw: Record<string, unknown>
}

export type StructurePlanMode = 'volume' | 'chapter'

export interface StructurePlanItem {
  title: string
  summary?: string
  reason?: string
}

export interface StructurePlanRequest {
  projectId: string
  chapterId?: string
  chapterTitle?: string
  seedText?: string
  mode: StructurePlanMode
  count?: number
  prompt: string
  workflowContextPrompt?: string
}

export interface StructurePlanResult {
  summary: string
  items: StructurePlanItem[]
  raw: Record<string, unknown>
}

export interface ReviewToolRequest {
  content: string
  projectId?: string
  chapterId?: string
}

export interface ReviewIssue {
  id?: string
  type?: string
  severity?: string
  message?: string
  suggestions?: string[]
}

export interface ReviewToolResult {
  score?: number
  issues: ReviewIssue[]
  raw: Record<string, unknown>
}

export interface SensitiveAuditResult {
  totalMatches?: number
  isSafe?: boolean
  sensitiveWords: Array<Record<string, unknown>>
  raw: Record<string, unknown>
}

export async function rewriteWithWorkbench(
  payload: RewriteToolRequest,
): Promise<RewriteToolResult> {
  if (isUserProviderModeEnabled()) {
    const response = await userAIProviderApi.workbench.rewrite(payload)
    return {
      rewrittenText: String(response.rewritten_text || '').trim(),
      raw: response as unknown as Record<string, unknown>,
    }
  }

  const response = await postAIRequest<Record<string, unknown>>('/api/v1/ai/writing/rewrite', {
    projectId: payload.projectId,
    chapterId: payload.chapterId,
    originalText: payload.originalText,
    rewriteMode: payload.mode,
    instructions: payload.instructions,
  })

  return {
    rewrittenText:
      String(
        response.rewritten_text ||
          response.polished_text ||
          response.expanded_text ||
          response.generated_text ||
          '',
      ) || '',
    raw: response,
  }
}

export async function summarizeSelection(payload: SummaryToolRequest): Promise<SummaryToolResult> {
  const response = await summarizeText(payload.content, {
    projectId: payload.projectId,
    chapterId: payload.chapterId,
    maxLength: payload.maxLength,
    summaryType: payload.summaryType || 'detailed',
    includeQuotes: payload.includeQuotes ?? false,
  })

  return {
    summary: response.summary,
    keyPoints: response.keyPoints,
    raw: response as unknown as Record<string, unknown>,
  }
}

export async function summarizeChapter(payload: ChapterSummaryRequest): Promise<SummaryToolResult> {
  if (isUserProviderModeEnabled()) {
    throw new Error('用户 API 模式下章节摘要需要正文上下文，请改用片段摘要。')
  }

  const response = await postAIRequest<Record<string, unknown>>(
    '/api/v1/ai/writing/summarize-chapter',
    {
      projectId: payload.projectId,
      chapterId: payload.chapterId,
      outlineLevel: payload.outlineLevel ?? 3,
    },
  )

  return {
    summary: String(response.summary || ''),
    keyPoints: Array.isArray(response.keyPoints)
      ? response.keyPoints.map((item) => String(item))
      : [],
    raw: response,
  }
}

function extractJsonObject(rawReply: string): Record<string, unknown> | null {
  const trimmed = rawReply.trim()
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  const jsonCandidate = fencedMatch?.[1]?.trim() || trimmed
  const startIndex = jsonCandidate.indexOf('{')
  const endIndex = jsonCandidate.lastIndexOf('}')

  if (startIndex < 0 || endIndex <= startIndex) {
    return null
  }

  try {
    return JSON.parse(jsonCandidate.slice(startIndex, endIndex + 1)) as Record<string, unknown>
  } catch {
    return null
  }
}

function normalizeStructurePlanItems(raw: unknown): StructurePlanItem[] {
  if (!Array.isArray(raw)) {
    return []
  }

  return raw.reduce<StructurePlanItem[]>((acc, item) => {
    if (!item || typeof item !== 'object') {
      return acc
    }

    const record = item as Record<string, unknown>
    const title = String(record.title || record.name || '').trim()
    if (!title) {
      return acc
    }

    acc.push({
      title,
      summary: String(record.summary || record.description || '').trim() || undefined,
      reason: String(record.reason || record.intent || '').trim() || undefined,
    })
    return acc
  }, [])
}

function fallbackStructureItemsFromReply(rawReply: string): StructurePlanItem[] {
  return rawReply
    .split('\n')
    .map((line) => line.replace(/^[-*\d.\s]+/, '').trim())
    .filter(Boolean)
    .slice(0, 5)
    .map((title) => ({ title }))
}

export async function generateStructurePlan(
  payload: StructurePlanRequest,
): Promise<StructurePlanResult> {
  const count = Math.min(Math.max(payload.count || 3, 1), 5)
  const modeLabel = payload.mode === 'volume' ? '卷' : '章节'
  const chapterContext = payload.chapterTitle?.trim()
    ? `当前章节：${payload.chapterTitle.trim()}`
    : payload.chapterId
      ? `当前章节ID：${payload.chapterId}`
      : ''
  const seedText = payload.seedText?.trim()
    ? `当前正文参考：\n${payload.seedText.trim().slice(0, 1600)}`
    : ''
  const workflowContext = payload.workflowContextPrompt?.trim()
    ? payload.workflowContextPrompt.trim()
    : ''

  const prompt = [
    `你是小说编辑器里的结构规划助手。请为用户生成 ${count} 个可直接创建到项目中的${modeLabel}草案。`,
    '请只返回 JSON，不要使用 Markdown 代码块，不要添加额外解释。',
    'JSON schema:',
    '{',
    '  "summary": "一句话概括整体规划意图",',
    '  "items": [',
    '    {',
    '      "title": "标题",',
    '      "summary": "一句话摘要",',
    '      "reason": "创建这个条目的理由"',
    '    }',
    '  ]',
    '}',
    `约束：items 数量为 1-${count}；title 必须简短，适合直接作为${modeLabel}标题；summary/reason 可为空但不要省略 title。`,
    `用户要求：${payload.prompt.trim() || `补充新的${modeLabel}结构`}`,
    chapterContext,
    workflowContext,
    seedText,
  ]
    .filter(Boolean)
    .join('\n\n')

  const response = await chatWithAI(prompt)
  const rawReply = String(response.reply || '').trim()
  const parsed = extractJsonObject(rawReply)
  const parsedItems = normalizeStructurePlanItems(parsed?.items)
  const items = (
    parsedItems.length > 0 ? parsedItems : fallbackStructureItemsFromReply(rawReply)
  ).slice(0, count)

  return {
    summary: String(parsed?.summary || '').trim() || `已生成 ${items.length} 个${modeLabel}草案。`,
    items,
    raw: {
      reply: rawReply,
      usage: response.usage,
      parsed: parsed || null,
    },
  }
}

export async function proofreadContent(payload: ReviewToolRequest): Promise<ReviewToolResult> {
  const response = await proofreadText(payload.content, {
    projectId: payload.projectId,
    chapterId: payload.chapterId,
  })

  return {
    score: response.score,
    issues: response.issues as ReviewIssue[],
    raw: response as unknown as Record<string, unknown>,
  }
}

export async function auditSensitiveWords(
  payload: ReviewToolRequest,
): Promise<SensitiveAuditResult> {
  if (isUserProviderModeEnabled()) {
    const response = await userAIProviderApi.workbench.auditSensitiveWords(payload)
    return {
      totalMatches: response.totalMatches,
      isSafe: response.isSafe,
      sensitiveWords: response.sensitiveWords,
      raw: response as unknown as Record<string, unknown>,
    }
  }

  const response = await postAIRequest<Record<string, unknown>>(
    '/api/v1/ai/audit/sensitive-words',
    {
      content: payload.content,
      projectId: payload.projectId,
      chapterId: payload.chapterId,
      category: 'all',
    },
  )

  return {
    totalMatches: typeof response.totalMatches === 'number' ? response.totalMatches : undefined,
    isSafe: typeof response.isSafe === 'boolean' ? response.isSafe : undefined,
    sensitiveWords: Array.isArray(response.sensitiveWords)
      ? (response.sensitiveWords as Array<Record<string, unknown>>)
      : [],
    raw: response,
  }
}
