import { requestWriterAI } from './ai'
import { isUserProviderModeEnabled } from '../config/provider'
import { postAIRequest } from './request'
import { userAIProviderApi } from './ai-user-provider'

interface WorkbenchAssetSummary {
  scope?: 'global' | 'volume' | 'chapter'
  assetName: string
  assetType?: string
  referenceCount?: number
}

interface WorkbenchSceneStageSummary {
  sceneTitle?: string
  beatTitle?: string
  goal?: string
  conflict?: string
  assetNames?: string[]
}

interface WorkbenchContextEvidence {
  id: string
  label: string
  source: string
  detail?: string
}

export interface RewriteToolRequest {
  projectId: string
  chapterId?: string
  originalText: string
  mode: 'polish' | 'expand' | 'shorten'
  instructions?: string
  skillId?: string
  toolHintIds?: string[]
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
  workflowContextPrompt?: string
  assets?: WorkbenchAssetSummary[]
  sceneStage?: WorkbenchSceneStageSummary
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
  workflowContextPrompt?: string
  assets?: WorkbenchAssetSummary[]
  sceneStage?: WorkbenchSceneStageSummary
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
  const result = await requestWriterAI({
    route: 'single_document_edit',
    mutationMode: 'single_document_diff',
    target: {
      kind: 'current_document',
      documentId: payload.chapterId,
      label: '工作台改写',
    },
    context: {
      projectId: payload.projectId,
      currentDocument: {
        documentId: payload.chapterId,
        sourceText: payload.originalText,
      },
      assets: [],
      workflowSummary: [],
      evidence: [],
      budget: {
        maxChars: payload.originalText.length,
        truncated: false,
      },
    },
    intent: {
      action: payload.mode === 'expand' ? 'expand' : 'rewrite',
    },
    workflow: 'write',
    skillId: payload.skillId,
    toolHintIds: payload.toolHintIds,
    requiresConfirmation: true,
    userVisibleSummary:
      payload.instructions ||
      (payload.mode === 'expand'
        ? '扩写当前文本。'
        : payload.mode === 'shorten'
          ? '压缩精简当前文本。'
          : '润色改写当前文本。'),
  })

  return {
    rewrittenText: String(result.generatedText || '').trim(),
    raw: result as unknown as Record<string, unknown>,
  }
}

export async function summarizeSelection(payload: SummaryToolRequest): Promise<SummaryToolResult> {
  const result = await requestWriterAI({
    route: 'analysis',
    mutationMode: 'none',
    target: {
      kind: 'selection',
      documentId: payload.chapterId,
      label: '工作台片段摘要',
    },
    context: {
      projectId: payload.projectId || 'local-writer-project',
      currentDocument: {
        documentId: payload.chapterId,
        sourceText: payload.content,
      },
      selection: {
        kind: 'selection',
        text: payload.content,
      },
      assets: payload.assets || [],
      workflowSummary: payload.workflowContextPrompt ? [payload.workflowContextPrompt] : [],
      sceneStage: payload.sceneStage,
      evidence: payload.sceneStage
        ? [
            {
              id: `review-scene-stage:${payload.chapterId || 'current'}`,
              label: payload.sceneStage.beatTitle || payload.sceneStage.sceneTitle || '当前场景舞台',
              source: 'scene_stage',
              detail: payload.sceneStage.goal || payload.sceneStage.conflict || '审校场景约束',
            },
          ]
        : [],
      budget: {
        maxChars: Math.min(
          payload.content.length + (payload.workflowContextPrompt?.length || 0),
          4000,
        ),
        truncated: payload.content.length + (payload.workflowContextPrompt?.length || 0) > 4000,
      },
    },
    intent: {
      action: 'summarize',
    },
    workflow: 'review',
    toolHintIds: ['structure_stage', 'scene_stage'],
    requiresConfirmation: false,
    userVisibleSummary: [
      payload.summaryType === 'brief'
        ? '请生成简短摘要。'
        : payload.summaryType === 'keypoints'
          ? '请提炼关键要点。'
          : '请生成详细摘要。',
      typeof payload.maxLength === 'number' ? `摘要控制在 ${payload.maxLength} 字以内。` : '',
      payload.includeQuotes ? '允许极短引用原文。' : '不要直接引用原文句子。',
    ]
      .filter(Boolean)
      .join('\n'),
  })

  return {
    summary: result.analysis?.summary || result.message,
    keyPoints: result.analysis?.keyPoints || [],
    raw: result as unknown as Record<string, unknown>,
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

  const response = await requestWriterAI({
    route: 'plan_only',
    mutationMode: 'none',
    target: {
      kind: 'current_document',
      documentId: payload.chapterId,
      documentTitle: payload.chapterTitle,
      label: `结构规划：${modeLabel}草案`,
    },
    context: {
      projectId: payload.projectId,
      currentDocument: {
        documentId: payload.chapterId,
        documentTitle: payload.chapterTitle,
        sourceText: payload.seedText || payload.workflowContextPrompt || payload.prompt,
      },
      workflowSummary: [workflowContext, seedText].filter(Boolean),
      assets: [],
      evidence: [
        chapterContext
          ? {
              id: `structure-plan:${payload.chapterId || payload.chapterTitle || 'current'}`,
              label: chapterContext,
              source: 'workflow',
            }
          : undefined,
      ].filter(Boolean) as WorkbenchContextEvidence[],
      budget: {
        maxChars: Math.min(prompt.length, 4000),
        truncated: prompt.length > 4000,
      },
    },
    requiresConfirmation: true,
    workflow: 'organize',
    toolHintIds: ['structure_stage'],
    userVisibleSummary: prompt,
  })
  const rawReply = String(response.message || '').trim()
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
  const result = await requestWriterAI({
    route: 'analysis',
    mutationMode: 'none',
    target: {
      kind: 'selection',
      documentId: payload.chapterId,
      label: '工作台审校',
    },
    context: {
      projectId: payload.projectId || 'local-writer-project',
      currentDocument: {
        documentId: payload.chapterId,
        sourceText: payload.content,
      },
      selection: {
        kind: 'selection',
        text: payload.content,
      },
      assets: payload.assets || [],
      workflowSummary: payload.workflowContextPrompt ? [payload.workflowContextPrompt] : [],
      sceneStage: payload.sceneStage,
      evidence: payload.sceneStage
        ? [
            {
              id: `review-scene-stage:${payload.chapterId || 'current'}`,
              label: payload.sceneStage.beatTitle || payload.sceneStage.sceneTitle || '当前场景舞台',
              source: 'scene_stage',
              detail: payload.sceneStage.goal || payload.sceneStage.conflict || '审校场景约束',
            },
          ]
        : [],
      budget: {
        maxChars: Math.min(
          payload.content.length + (payload.workflowContextPrompt?.length || 0),
          4000,
        ),
        truncated: payload.content.length + (payload.workflowContextPrompt?.length || 0) > 4000,
      },
    },
    intent: {
      action: 'proofread',
    },
    workflow: 'review',
    toolHintIds: ['scene_stage', 'assets'],
    requiresConfirmation: false,
    userVisibleSummary: '检查错别字、语病、标点和表达问题。',
  })

  return {
    score: result.analysis?.score,
    issues: (result.analysis?.issues || []) as ReviewIssue[],
    raw: result as unknown as Record<string, unknown>,
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
      ...(payload.workflowContextPrompt
        ? {
            contextPrompt: payload.workflowContextPrompt,
            context_prompt: payload.workflowContextPrompt,
          }
        : {}),
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
