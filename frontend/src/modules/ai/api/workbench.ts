import { chatWithAI, requestWriterAI } from './ai'
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
  beatStatus?: 'planned' | 'active' | 'done'
  goal?: string
  conflict?: string
  doneCondition?: string
  nextBeatTitle?: string
  assetNames?: string[]
}

interface WorkbenchContextEvidence {
  id: string
  label: string
  source: string
  detail?: string
}

export type WorkbenchExtractedAssetType =
  | 'character'
  | 'location'
  | 'item'
  | 'organization'
  | 'concept'

export interface WorkbenchExtractedAssetCandidate {
  name: string
  category: WorkbenchExtractedAssetType
  summary?: string
  evidence?: string
  alias?: string[]
}

export interface AssetExtractionRequest {
  content: string
  projectId?: string
  chapterId?: string
  chapterTitle?: string
  maxItems?: number
  workflowContextPrompt?: string
  existingAssets?: WorkbenchAssetSummary[]
}

export interface AssetExtractionResult {
  summary: string
  candidates: WorkbenchExtractedAssetCandidate[]
  raw: Record<string, unknown>
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
  suggestionDetails?: Array<{
    text: string
    reason?: string
    confidence?: number
  }>
  position?: {
    start: number
    end: number
    line?: number
    column?: number
    length?: number
  }
  originalText?: string
  category?: string
  rule?: string
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

function normalizeExtractedAssetCategory(value: unknown): WorkbenchExtractedAssetType | null {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()

  if (!normalized) return null
  if (normalized === 'character' || normalized === 'characters' || normalized === '角色') {
    return 'character'
  }
  if (
    normalized === 'location' ||
    normalized === 'locations' ||
    normalized === '地点' ||
    normalized === '场景'
  ) {
    return 'location'
  }
  if (
    normalized === 'item' ||
    normalized === 'items' ||
    normalized === '物件' ||
    normalized === '物品' ||
    normalized === '道具'
  ) {
    return 'item'
  }
  if (
    normalized === 'organization' ||
    normalized === 'organizations' ||
    normalized === '组织' ||
    normalized === '势力'
  ) {
    return 'organization'
  }
  if (normalized === 'concept' || normalized === 'concepts' || normalized === '概念' || normalized === '设定') {
    return 'concept'
  }
  return null
}

function normalizeExtractedAssetCandidates(raw: unknown): WorkbenchExtractedAssetCandidate[] {
  if (!Array.isArray(raw)) {
    return []
  }

  const seen = new Set<string>()

  return raw.reduce<WorkbenchExtractedAssetCandidate[]>((acc, item) => {
    if (!item || typeof item !== 'object') {
      return acc
    }

    const record = item as Record<string, unknown>
    const name = String(record.name || record.assetName || '').trim()
    const category = normalizeExtractedAssetCategory(record.category || record.type || record.assetType)

    if (!name || !category) {
      return acc
    }

    const key = `${category}:${name.toLocaleLowerCase()}`
    if (seen.has(key)) {
      return acc
    }
    seen.add(key)

    acc.push({
      name,
      category,
      summary: String(record.summary || record.description || '').trim() || undefined,
      evidence: String(record.evidence || record.quote || record.reason || '').trim() || undefined,
      alias: Array.isArray(record.alias)
        ? record.alias
            .map((alias) => String(alias || '').trim())
            .filter(Boolean)
            .slice(0, 5)
        : undefined,
    })
    return acc
  }, [])
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

export async function extractAssetsWithWorkbench(
  payload: AssetExtractionRequest,
): Promise<AssetExtractionResult> {
  const maxItems = Math.min(Math.max(payload.maxItems || 12, 1), 20)
  const existingAssetsSummary = (payload.existingAssets || [])
    .slice(0, 40)
    .map((asset) => `${asset.assetName}${asset.assetType ? `（${asset.assetType}）` : ''}`)
    .join('、')

  const prompt = [
    '你是中文小说编辑器里的资产提取助手。',
    '请从当前章节正文中提取值得长期建档的资产候选，只保留对后续创作有持续价值的角色、地点、物件、组织、概念。',
    '忽略路人、泛称、一次性普通名词，以及没有独立意义的修饰词。',
    '请只输出 JSON，不要输出 Markdown 代码块或额外解释。',
    'JSON schema:',
    '{',
    '  "summary": "一句话说明本次识别结果",',
    '  "candidates": [',
    '    {',
    '      "name": "资产名称",',
    '      "category": "character|location|item|organization|concept",',
    '      "summary": "一句话概括为什么值得建档",',
    '      "evidence": "正文中的极短证据片段",',
    '      "alias": ["可选别名"]',
    '    }',
    '  ]',
    '}',
    `约束：candidates 数量 0-${maxItems}；name 要简短准确；summary/evidence 尽量简短；不要返回已经存在的资产。`,
    payload.projectId ? `项目ID：${payload.projectId}` : '',
    payload.chapterId ? `章节ID：${payload.chapterId}` : '',
    payload.chapterTitle?.trim() ? `章节标题：${payload.chapterTitle.trim()}` : '',
    payload.workflowContextPrompt?.trim()
      ? `补充上下文：\n${payload.workflowContextPrompt.trim()}`
      : '',
    existingAssetsSummary ? `已存在资产：${existingAssetsSummary}` : '',
    '当前章节正文：',
    payload.content.trim(),
  ]
    .filter(Boolean)
    .join('\n\n')

  const response = await chatWithAI(prompt, [])
  const rawReply = String(response.reply || '').trim()
  const parsed = extractJsonObject(rawReply)
  const candidates = normalizeExtractedAssetCandidates(parsed?.candidates).slice(0, maxItems)

  return {
    summary:
      String(parsed?.summary || '').trim() ||
      (candidates.length > 0 ? `已识别 ${candidates.length} 个候选资产。` : '未识别到新的可建档资产。'),
    candidates,
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
