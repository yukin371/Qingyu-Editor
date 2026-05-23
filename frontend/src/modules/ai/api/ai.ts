/**
 * AI Writing Assistant API
 * 提供对话、续写、润色、扩写、改写等AI功能
 */

import {
  hasSessionApiKey,
  hasUsableUserProviderConfig,
  isUserProviderModeEnabled,
  loadAIProviderSettings,
  type AIProviderSettings,
} from '../config/provider'
import {
  formatAIOrchestrationPrompt,
  type AIExecutablePlan,
  type AIPlanEvidence,
} from '../types/agent'
import { aiDirectApi, isDirectModeEnabled } from './ai-direct'
import { userAIProviderApi } from './ai-user-provider'
import { getAIRequest, postAIRequest, putAIRequest } from './request'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: number
}

export interface AIGenerateRequest {
  projectId?: string
  currentText?: string
  prompt?: string
  continueLength?: number
  type?: 'continue' | 'rewrite' | 'polish' | 'expand'
}

export interface AIGenerateResponse {
  generated_text?: string
  rewritten_text?: string
  polished_text?: string
  expanded_text?: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface AISummaryResponse {
  summary: string
  keyPoints: string[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface AIProofreadIssue {
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

export interface AIProofreadResponse {
  score?: number
  issues: AIProofreadIssue[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface AIRewriteRequest {
  projectId?: string
  originalText: string
  rewriteMode: 'polish' | 'expand' | 'simplify' | 'formal'
  instructions?: string
}

export interface AIPolishRequest {
  projectId?: string
  originalText: string
  instructions?: string
}

export interface AIExpandRequest {
  projectId?: string
  originalText: string
  instructions?: string
  targetLength?: number
}

export interface AIProviderHealth {
  mode: AIProviderSettings['mode'] | 'legacy_direct'
  ok: boolean
  configured: boolean
  hasRuntimeSecret: boolean
  message: string
  checkedAt: number
}

interface AIAnalysisContextOptions {
  contextPrompt?: string
}

export interface WriterAIResult {
  route: AIExecutablePlan['route']
  mutationMode: AIExecutablePlan['mutationMode']
  message: string
  generatedText?: string
  analysis?: {
    summary?: string
    keyPoints?: string[]
    issues?: AIProofreadIssue[]
    score?: number
  }
  usage?: unknown
  requiresConfirmation: boolean
  evidence?: AIPlanEvidence[]
}

function asFiniteNumber(value: unknown): number | undefined {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : undefined
}

function codePointOffsetToStringIndex(value: string, offset: number): number | undefined {
  if (!Number.isInteger(offset) || offset < 0) {
    return undefined
  }

  const codePoints = Array.from(value)
  if (offset > codePoints.length) {
    return undefined
  }

  return codePoints.slice(0, offset).join('').length
}

function findClosestOriginalTextPosition(
  content: string,
  originalText: string,
  preferredStart?: number,
): number | undefined {
  if (!originalText) {
    return undefined
  }

  const positions: number[] = []
  let cursor = content.indexOf(originalText)
  while (cursor >= 0) {
    positions.push(cursor)
    cursor = content.indexOf(originalText, cursor + Math.max(originalText.length, 1))
  }
  if (positions.length === 0) {
    return undefined
  }
  if (typeof preferredStart !== 'number') {
    return positions[0]
  }

  return positions.reduce((best, current) =>
    Math.abs(current - preferredStart) < Math.abs(best - preferredStart) ? current : best,
  )
}

function normalizeProofreadPosition(
  content: string,
  record: Record<string, any>,
  originalText: string,
): AIProofreadIssue['position'] | undefined {
  const position = record.position && typeof record.position === 'object' ? record.position : record
  const rawStart = asFiniteNumber(position.start ?? position.from)
  const rawEnd = asFiniteNumber(position.end ?? position.to)
  if (rawStart === undefined || rawEnd === undefined || rawStart < 0 || rawEnd <= rawStart) {
    return undefined
  }

  const toPosition = (start: number, end: number) => ({
    start,
    end,
    line: asFiniteNumber(position.line),
    column: asFiniteNumber(position.column),
    length: end - start,
  })
  const isValidStringRange = (start: number, end: number) =>
    Number.isInteger(start) &&
    Number.isInteger(end) &&
    start >= 0 &&
    end > start &&
    end <= content.length

  if (isValidStringRange(rawStart, rawEnd)) {
    const currentText = content.slice(rawStart, rawEnd)
    if (!originalText || currentText === originalText) {
      return toPosition(rawStart, rawEnd)
    }
  }

  const codePointStart = codePointOffsetToStringIndex(content, rawStart)
  const codePointEnd = codePointOffsetToStringIndex(content, rawEnd)
  if (
    codePointStart !== undefined &&
    codePointEnd !== undefined &&
    isValidStringRange(codePointStart, codePointEnd)
  ) {
    const currentText = content.slice(codePointStart, codePointEnd)
    if (!originalText || currentText === originalText) {
      return toPosition(codePointStart, codePointEnd)
    }
  }

  const matchedStart = findClosestOriginalTextPosition(content, originalText, codePointStart ?? rawStart)
  if (matchedStart !== undefined) {
    return toPosition(matchedStart, matchedStart + originalText.length)
  }

  return undefined
}

function normalizeProofreadIssueType(value: unknown) {
  const raw = String(value || '').trim().toLowerCase()
  const typeMap: Record<string, string> = {
    spelling: 'typo',
    typo: 'typo',
    grammar: 'grammar',
    punctuation: 'punctuation',
    style: 'style',
    readability: 'readability',
    continuity: 'continuity',
    logic: 'logic',
    coherence: 'coherence',
  }
  return typeMap[raw] || String(value || 'style').trim() || 'style'
}

function normalizeProofreadSeverity(value: unknown) {
  const raw = String(value || '').trim().toLowerCase()
  if (['error', 'high', 'critical', '严重'].includes(raw)) return 'error'
  if (['warning', 'medium', 'warn', '中等'].includes(raw)) return 'warning'
  return 'suggestion'
}

function normalizeProofreadSuggestionDetails(rawSuggestions: unknown) {
  if (!Array.isArray(rawSuggestions)) {
    return []
  }

  return rawSuggestions
    .map((suggestion) => {
      if (suggestion && typeof suggestion === 'object') {
        const record = suggestion as Record<string, unknown>
        const textValue = String(record.text || record.value || record.suggestion || '').trim()
        if (!textValue) return null
        return {
          text: textValue,
          reason: String(record.reason || record.explanation || '').trim() || undefined,
          confidence: Number.isFinite(Number(record.confidence)) ? Number(record.confidence) : undefined,
        }
      }

      const textValue = String(suggestion || '').trim()
      return textValue ? { text: textValue } : null
    })
    .filter((item): item is { text: string; reason?: string; confidence?: number } => !!item)
}

/**
 * AI对话接口
 * @description 与AI进行对话交互
 * @endpoint POST /api/v1/ai/chat
 * @category ai
 * @tags AI辅助
 * @param {string} message - 用户消息
 * @param {ChatMessage[]} history - 对话历史（可选）
 * @response {Object} 200 - 成功返回AI回复
 * @response {string} reply - AI回复内容
 * @response {Object} usage - Token使用情况
 * @security BearerAuth
 */
export const chatWithAI = async (
  message: string,
  history?: ChatMessage[],
): Promise<{ reply: string; usage?: any }> => {
  if (isUserProviderModeEnabled()) {
    return userAIProviderApi.chat(message, history)
  }

  if (isDirectModeEnabled()) {
    return aiDirectApi.chat(message, history)
  }

  const response = await postAIRequest<{ reply?: string; message?: string; usage?: any }>(
    '/api/v1/ai/chat',
    {
      message,
      history: history || [],
    },
  )

  const data = response as unknown as { reply?: string; message?: string; usage?: any }
  return {
    reply: data?.reply || data?.message || '',
    usage: data?.usage,
  }
}

/**
 * 续写接口
 * @description 基于当前文本续写内容
 * @endpoint POST /api/v1/ai/generate
 * @category ai
 * @tags AI辅助
 * @param {string} projectId - 项目ID
 * @param {string} currentText - 当前文本
 * @param {number} length - 续写长度（默认200）
 * @response {AIGenerateResponse} 200 - 成功返回生成文本
 * @security BearerAuth
 */
export const continueWriting = async (
  projectId: string,
  currentText: string,
  length: number = 200,
  instructions?: string,
): Promise<AIGenerateResponse> => {
  if (isUserProviderModeEnabled()) {
    return userAIProviderApi.writing.continue(projectId, currentText, length, instructions)
  }

  if (isDirectModeEnabled()) {
    return aiDirectApi.writing.continue(projectId, currentText, length, instructions)
  }

  const trimmedInstructions = (instructions || '').trim()
  const prompt = trimmedInstructions
    ? `${currentText}\n\n续写要求：${trimmedInstructions}`
    : currentText

  const response = await postAIRequest<AIGenerateResponse>('/api/v1/ai/generate', {
    projectId,
    currentText,
    prompt,
    continueLength: length,
    type: 'continue',
  })

  return (response as unknown as AIGenerateResponse) || {}
}

/**
 * 润色接口
 * @description 对文本进行润色优化
 * @endpoint POST /api/v1/ai/polish
 * @category ai
 * @tags AI辅助
 * @param {string} projectId - 项目ID
 * @param {string} text - 原始文本
 * @param {string} instructions - 润色指示（可选）
 * @response {AIGenerateResponse} 200 - 成功返回润色后的文本
 * @security BearerAuth
 */
export const polishText = async (
  projectId: string,
  text: string,
  instructions?: string,
): Promise<AIGenerateResponse> => {
  if (isUserProviderModeEnabled()) {
    return userAIProviderApi.writing.polish(text, instructions)
  }

  if (isDirectModeEnabled()) {
    return aiDirectApi.writing.polish(text, instructions)
  }

  const response = await postAIRequest<AIGenerateResponse>('/api/v1/ai/polish', {
    projectId,
    originalText: text,
    rewriteMode: 'polish',
    instructions: instructions || '提升文学性和表达力',
  })

  return (response as unknown as AIGenerateResponse) || {}
}

/**
 * 扩写接口
 * @description 对文本进行扩写丰富
 * @endpoint POST /api/v1/ai/expand
 * @category ai
 * @tags AI辅助
 * @param {string} projectId - 项目ID
 * @param {string} text - 原始文本
 * @param {string} instructions - 扩写指示（可选）
 * @param {number} targetLength - 目标长度（可选）
 * @response {AIGenerateResponse} 200 - 成功返回扩写后的文本
 * @security BearerAuth
 */
export const expandText = async (
  projectId: string,
  text: string,
  instructions?: string,
  targetLength?: number,
): Promise<AIGenerateResponse> => {
  if (isUserProviderModeEnabled()) {
    return userAIProviderApi.writing.expand(text, instructions, targetLength)
  }

  if (isDirectModeEnabled()) {
    return aiDirectApi.writing.expand(text, instructions, targetLength)
  }

  const response = await postAIRequest<AIGenerateResponse>('/api/v1/ai/expand', {
    projectId,
    originalText: text,
    rewriteMode: 'expand',
    instructions: instructions || '扩展为更详细的描述',
    targetLength,
  })

  return (response as unknown as AIGenerateResponse) || {}
}

/**
 * 改写接口
 * @description 对文本进行改写
 * @endpoint POST /api/v1/ai/rewrite
 * @category ai
 * @tags AI辅助
 * @param {string} projectId - 项目ID
 * @param {string} text - 原始文本
 * @param {string} mode - 改写模式（polish/simplify/formal/casual）
 * @param {string} instructions - 改写指示（可选）
 * @response {AIGenerateResponse} 200 - 成功返回改写后的文本
 * @security BearerAuth
 */
export const rewriteText = async (
  projectId: string,
  text: string,
  mode: 'polish' | 'simplify' | 'formal' | 'casual',
  instructions?: string,
): Promise<AIGenerateResponse> => {
  if (isUserProviderModeEnabled()) {
    return userAIProviderApi.writing.rewrite(text, instructions || mode)
  }

  if (isDirectModeEnabled()) {
    return aiDirectApi.writing.rewrite(text, instructions || mode)
  }

  const response = await postAIRequest<AIGenerateResponse>('/api/v1/ai/rewrite', {
    projectId,
    originalText: text,
    rewriteMode: mode,
    instructions,
  })

  return (response as unknown as AIGenerateResponse) || {}
}

export const summarizeText = async (
  text: string,
  options?: {
    projectId?: string
    chapterId?: string
    maxLength?: number
    summaryType?: 'brief' | 'detailed' | 'keypoints'
    includeQuotes?: boolean
  } & AIAnalysisContextOptions,
): Promise<AISummaryResponse> => {
  if (isUserProviderModeEnabled()) {
    return userAIProviderApi.writing.summarize(text, {
      maxLength: options?.maxLength,
      summaryType: options?.summaryType,
      includeQuotes: options?.includeQuotes,
      contextPrompt: options?.contextPrompt,
    })
  }

  if (isDirectModeEnabled()) {
    return aiDirectApi.writing.summarize(text, {
      maxLength: options?.maxLength,
      summaryType: options?.summaryType,
      includeQuotes: options?.includeQuotes,
      contextPrompt: options?.contextPrompt,
    })
  }

  const response = await postAIRequest<{
    summary?: string
    keyPoints?: unknown[]
    key_points?: unknown[]
    data?: {
      summary?: string
      keyPoints?: unknown[]
      key_points?: unknown[]
    }
    usage?: any
  }>('/api/v1/ai/writing/summarize', {
    content: text,
    text,
    projectId: options?.projectId,
    chapterId: options?.chapterId,
    project_id: options?.projectId,
    chapter_id: options?.chapterId,
    maxLength: options?.maxLength,
    summaryType: options?.summaryType || 'detailed',
    includeQuotes: options?.includeQuotes ?? false,
    ...(options?.contextPrompt
      ? {
          contextPrompt: options.contextPrompt,
          context_prompt: options.contextPrompt,
        }
      : {}),
  })

  const data = response as unknown as Record<string, any>
  const keyPointsSource =
    data?.keyPoints || data?.key_points || data?.data?.keyPoints || data?.data?.key_points
  return {
    summary: String(data?.summary || data?.data?.summary || '').trim(),
    keyPoints: Array.isArray(keyPointsSource)
      ? keyPointsSource.map((item) => String(item).trim()).filter(Boolean)
      : [],
    usage: data?.usage,
  }
}

export const proofreadText = async (
  text: string,
  options?: {
    projectId?: string
    chapterId?: string
  } & AIAnalysisContextOptions,
): Promise<AIProofreadResponse> => {
  if (isUserProviderModeEnabled()) {
    return userAIProviderApi.writing.proofread(text, {
      contextPrompt: options?.contextPrompt,
    })
  }

  if (isDirectModeEnabled()) {
    return aiDirectApi.writing.proofread(text, {
      contextPrompt: options?.contextPrompt,
    })
  }

  const response = await postAIRequest<{
    score?: number
    issues?: unknown[]
    proofread_result?: string
    rewritten_text?: string
    data?: {
      score?: number
      issues?: unknown[]
      proofread_result?: string
      rewritten_text?: string
    }
    usage?: any
  }>('/api/v1/ai/writing/proofread', {
    content: text,
    text,
    projectId: options?.projectId,
    chapterId: options?.chapterId,
    project_id: options?.projectId,
    chapter_id: options?.chapterId,
    checkTypes: ['spelling', 'grammar', 'punctuation'],
    language: 'zh-CN',
    suggestions: true,
    ...(options?.contextPrompt
      ? {
          contextPrompt: options.contextPrompt,
          context_prompt: options.contextPrompt,
        }
      : {}),
  })

  const data = response as unknown as Record<string, any>
  const issuesSource = data?.issues || data?.data?.issues
  const fallbackMessage = String(
    data?.proofread_result ||
      data?.data?.proofread_result ||
      data?.rewritten_text ||
      data?.data?.rewritten_text ||
      '',
  ).trim()
  const normalizedIssues: AIProofreadIssue[] = Array.isArray(issuesSource)
    ? issuesSource.reduce<AIProofreadIssue[]>((acc, item, index) => {
        if (!item || typeof item !== 'object') {
          return acc
        }
        const record = item as Record<string, any>
        const message = String(record.message || record.description || record.issue || '').trim()
        if (!message) {
          return acc
        }
        const suggestionDetails = normalizeProofreadSuggestionDetails(
          record.suggestionDetails || record.suggestion_details || record.suggestions,
        )
        const originalText = String(record.originalText || record.original_text || record.original || '').trim()
        const position = normalizeProofreadPosition(text, record, originalText)
        const positionedOriginalText = position ? text.slice(position.start, position.end) : ''
        acc.push({
          id: String(record.id || `proofread-${index + 1}`),
          type: normalizeProofreadIssueType(record.type || record.category),
          severity: normalizeProofreadSeverity(record.severity || record.level),
          message,
          suggestions: suggestionDetails.map((suggestion) => suggestion.text),
          suggestionDetails,
          position,
          originalText: originalText || positionedOriginalText || undefined,
          category: String(record.category || '').trim() || undefined,
          rule: String(record.rule || '').trim() || undefined,
        })
        return acc
      }, [])
    : []
  return {
    score:
      typeof data?.score === 'number'
        ? data.score
        : typeof data?.data?.score === 'number'
          ? data.data.score
          : undefined,
    issues:
      normalizedIssues.length > 0
        ? normalizedIssues
        : fallbackMessage
          ? [
              {
                id: 'proofread-fallback',
                type: '审校',
                severity: 'info',
                message: fallbackMessage,
                suggestions: [],
              },
            ]
          : [],
    usage: data?.usage,
  }
}

// ============ 故事上下文写作 ============

/** 故事上下文生成 */
export function storyGenerate(data: {
  projectId: string
  documentId: string
  mode: 'continue' | 'rewrite' | 'suggest'
  instruction?: string
  selectedText?: string
}) {
  if (isUserProviderModeEnabled()) {
    return userAIProviderApi.story.generate(data)
  }

  return postAIRequest('/ai/story/generate', data)
}

/** 更新场景状态 */
export function updateSceneState(
  documentId: string,
  data: {
    sceneGoal?: string
    activeConflict?: string
  },
) {
  return putAIRequest(`/ai/story/documents/${documentId}/scene-state`, data)
}

function formatWriterPlanPrompt(plan: AIExecutablePlan): string {
  const lines = [
    formatAIOrchestrationPrompt(plan.orchestration),
    plan.userVisibleSummary,
  ]
  if (plan.intent?.action) {
    const actionLabelMap: Record<string, string> = {
      summarize: '总结',
      rewrite: '改写',
      continue: '续写',
      proofread: '审校',
      expand: '扩写',
    }
    lines.push(`任务：${actionLabelMap[plan.intent.action] || plan.intent.action}`)
  }
  if (plan.context.currentDocument?.documentTitle) {
    lines.push(`当前章节：${plan.context.currentDocument.documentTitle}`)
  }
  if (plan.context.target?.label || plan.context.target?.documentTitle) {
    lines.push(`目标：${plan.context.target.label || plan.context.target.documentTitle}`)
  }
  const chapterTask = plan.context.chapterTask
  if (chapterTask && Object.values(chapterTask).some((value) => String(value || '').trim())) {
    lines.push('本章任务卡：')
    const taskFields: Array<[keyof typeof chapterTask, string]> = [
      ['goal', '目标'],
      ['emotionalFunction', '情绪功能'],
      ['readerPayoff', '读者收益'],
      ['protagonistAction', '主角行动'],
      ['conflict', '冲突'],
      ['hook', '章末钩子'],
      ['assetChanges', '资产变更'],
    ]
    lines.push(
      ...taskFields
        .map(([key, label]) => {
          const text = String(chapterTask[key] || '').trim()
          return text ? `- ${label}：${text}` : ''
        })
        .filter(Boolean),
    )
  }
  if ((plan.context.workflowSummary || []).length > 0) {
    lines.push('上下文摘要：')
    lines.push(...(plan.context.workflowSummary || []).slice(0, 8).map((line) => `- ${line}`))
  }
  const sceneStage = plan.context.sceneStage
  if (
    sceneStage &&
    Object.values(sceneStage).some((value) =>
      Array.isArray(value) ? value.length > 0 : String(value || '').trim().length > 0,
    )
  ) {
    lines.push('当前场景舞台：')
    lines.push(
      ...[
        sceneStage.sceneTitle ? `- 场景：${sceneStage.sceneTitle}` : '',
        sceneStage.beatTitle ? `- 当前拍：${sceneStage.beatTitle}` : '',
        sceneStage.goal ? `- 目标：${sceneStage.goal}` : '',
        sceneStage.conflict ? `- 冲突：${sceneStage.conflict}` : '',
        sceneStage.doneCondition ? `- 完成条件：${sceneStage.doneCondition}` : '',
        sceneStage.nextBeatTitle ? `- 下一拍：${sceneStage.nextBeatTitle}` : '',
        sceneStage.assetNames?.length
          ? `- 在场资产：${sceneStage.assetNames.slice(0, 8).join(' / ')}`
          : '',
      ].filter(Boolean),
    )
  }
  if ((plan.context.assets || []).length > 0) {
    lines.push('资产简表：')
    lines.push(
      ...(plan.context.assets || []).slice(0, 12).map((asset) => {
        const scope = asset.scope === 'chapter' ? '章节' : asset.scope === 'volume' ? '卷' : '全局'
        return `- [${scope}] ${asset.assetName}（${asset.assetType || 'asset'}，引用 ${asset.referenceCount || 0}）`
      }),
    )
  }
  return lines.filter(Boolean).join('\n')
}

function formatProofreadIssues(issues: AIProofreadIssue[]): string {
  if (issues.length === 0) {
    return '未发现明显错别字、语病或标点问题。'
  }
  return issues
    .map((issue, index) => {
      const suggestions =
        Array.isArray(issue.suggestions) && issue.suggestions.length > 0
          ? ` 建议：${issue.suggestions.join('；')}`
          : ''
      return `${index + 1}. ${issue.message || '检测到可优化项。'}${suggestions}`
    })
    .join('\n')
}

function formatSummaryResponse(response: AISummaryResponse): string {
  const lines = [response.summary, ...(response.keyPoints || []).map((item) => `- ${item}`)]
  return lines
    .map((item) => item.trim())
    .filter(Boolean)
    .join('\n')
}

export async function requestWriterAI(plan: AIExecutablePlan): Promise<WriterAIResult> {
  if (plan.mutationMode === 'multi_document_plan' || plan.mutationMode === 'chapter_create_plan') {
    return {
      route: plan.route,
      mutationMode: plan.mutationMode,
      message: plan.userVisibleSummary,
      requiresConfirmation: true,
      evidence: plan.context.evidence,
    }
  }

  if (plan.mutationMode === 'single_document_diff') {
    const sourceText = plan.context.currentDocument?.sourceText?.trim() || ''
    if (!sourceText) {
      return {
        route: plan.route,
        mutationMode: plan.mutationMode,
        message: '缺少可改写的章节正文，已停止生成正文 diff。',
        requiresConfirmation: true,
        evidence: plan.context.evidence,
      }
    }

    const prompt = formatWriterPlanPrompt(plan)
    const action = plan.intent?.action
    const response =
      action === 'continue'
        ? await continueWriting(
            plan.context.projectId,
            sourceText,
            plan.intent?.targetLength ?? 200,
            prompt,
          )
        : action === 'expand'
          ? await expandText(plan.context.projectId, sourceText, prompt, plan.intent?.targetLength)
          : await rewriteText(plan.context.projectId, sourceText, 'polish', prompt)
    const generatedText =
      response.generated_text ||
      response.expanded_text ||
      response.rewritten_text ||
      response.polished_text ||
      ''
    return {
      route: plan.route,
      mutationMode: plan.mutationMode,
      message: generatedText
        ? '已生成单章候选正文，请交由编辑器 diff 确认。'
        : 'AI 未返回可用正文。',
      generatedText,
      usage: response.usage,
      requiresConfirmation: true,
      evidence: plan.context.evidence,
    }
  }

  if (plan.route === 'analysis') {
    const sourceText = plan.context.currentDocument?.sourceText?.trim() || ''
    if (!sourceText) {
      return {
        route: plan.route,
        mutationMode: plan.mutationMode,
        message: '缺少可分析的章节正文。',
        requiresConfirmation: plan.requiresConfirmation,
        evidence: plan.context.evidence,
      }
    }

    if (plan.intent?.action === 'proofread') {
      const response = await proofreadText(sourceText, {
        projectId: plan.context.projectId,
        chapterId: plan.context.currentDocument?.documentId || undefined,
        contextPrompt: formatWriterPlanPrompt(plan),
      })
      return {
        route: plan.route,
        mutationMode: plan.mutationMode,
        message: formatProofreadIssues(response.issues || []),
        analysis: {
          issues: response.issues || [],
          score: response.score,
        },
        usage: response.usage,
        requiresConfirmation: plan.requiresConfirmation,
        evidence: plan.context.evidence,
      }
    }

    const response = await summarizeText(sourceText, {
      projectId: plan.context.projectId,
      chapterId: plan.context.currentDocument?.documentId || undefined,
      summaryType: 'detailed',
      contextPrompt: formatWriterPlanPrompt(plan),
    })
    return {
      route: plan.route,
      mutationMode: plan.mutationMode,
      message: formatSummaryResponse(response),
      analysis: {
        summary: response.summary,
        keyPoints: response.keyPoints,
      },
      usage: response.usage,
      requiresConfirmation: plan.requiresConfirmation,
      evidence: plan.context.evidence,
    }
  }

  const response = await chatWithAI(formatWriterPlanPrompt(plan), plan.history)
  return {
    route: plan.route,
    mutationMode: plan.mutationMode,
    message: response.reply,
    usage: response.usage,
    requiresConfirmation: plan.requiresConfirmation,
    evidence: plan.context.evidence,
  }
}

export async function checkAIProviderHealth(
  settings: AIProviderSettings = loadAIProviderSettings(),
): Promise<AIProviderHealth> {
  const checkedAt = Date.now()

  if (settings.mode === 'user_api') {
    const configured = hasUsableUserProviderConfig(settings.userProvider)
    const hasRuntimeSecret = hasSessionApiKey()
    if (!configured) {
      return {
        mode: 'user_api',
        ok: false,
        configured,
        hasRuntimeSecret,
        message: '请先补全服务地址、接口路径和模型。',
        checkedAt,
      }
    }
    try {
      await userAIProviderApi.chat('请只回复 OK，用于连接测试。', [])
      return {
        mode: 'user_api',
        ok: true,
        configured,
        hasRuntimeSecret,
        message: hasRuntimeSecret
          ? '用户 API provider 可用，已使用运行时密钥。'
          : '用户 API provider 可用，当前未使用 API Key。',
        checkedAt,
      }
    } catch (error) {
      return {
        mode: 'user_api',
        ok: false,
        configured,
        hasRuntimeSecret,
        message: error instanceof Error ? error.message : '用户 API provider 连接失败。',
        checkedAt,
      }
    }
  }

  if (isDirectModeEnabled()) {
    try {
      await aiDirectApi.health()
      return {
        mode: 'legacy_direct',
        ok: true,
        configured: true,
        hasRuntimeSecret: false,
        message: '直连 AI 服务可用。',
        checkedAt,
      }
    } catch (error) {
      return {
        mode: 'legacy_direct',
        ok: false,
        configured: true,
        hasRuntimeSecret: false,
        message: error instanceof Error ? error.message : '直连 AI 服务不可用。',
        checkedAt,
      }
    }
  }

  try {
    await getAIRequest('/api/v1/ai/health')
    return {
      mode: 'system_remote',
      ok: true,
      configured: true,
      hasRuntimeSecret: false,
      message: '系统远程 AI 服务可用。',
      checkedAt,
    }
  } catch (error) {
    return {
      mode: 'system_remote',
      ok: false,
      configured: true,
      hasRuntimeSecret: false,
      message: error instanceof Error ? error.message : '系统远程 AI 服务暂不可用。',
      checkedAt,
    }
  }
}

export default {
  // 写作辅助
  chatWithAI,
  continueWriting,
  polishText,
  expandText,
  rewriteText,
  summarizeText,
  proofreadText,
  checkAIProviderHealth,
  requestWriterAI,
  // 故事上下文写作
  storyGenerate,
  updateSceneState,
}
