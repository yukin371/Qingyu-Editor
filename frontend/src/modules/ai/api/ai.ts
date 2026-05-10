/**
 * AI Writing Assistant API
 * 提供对话、续写、润色、扩写、改写等AI功能
 */

import { aiDirectApi, isDirectModeEnabled } from './ai-direct'
import { postAIRequest, putAIRequest } from './request'

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
  },
): Promise<AISummaryResponse> => {
  if (isDirectModeEnabled()) {
    return aiDirectApi.writing.summarize(text, {
      maxLength: options?.maxLength,
      summaryType: options?.summaryType,
      includeQuotes: options?.includeQuotes,
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
  })

  const data = response as unknown as Record<string, any>
  const keyPointsSource = data?.keyPoints || data?.key_points || data?.data?.keyPoints || data?.data?.key_points
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
  },
): Promise<AIProofreadResponse> => {
  if (isDirectModeEnabled()) {
    return aiDirectApi.writing.proofread(text)
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
  })

  const data = response as unknown as Record<string, any>
  const issuesSource = data?.issues || data?.data?.issues
  const fallbackMessage = String(
    data?.proofread_result || data?.data?.proofread_result || data?.rewritten_text || data?.data?.rewritten_text || '',
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
        acc.push({
          id: String(record.id || `proofread-${index + 1}`),
          type: String(record.type || record.category || '表达'),
          severity: String(record.severity || record.level || 'medium'),
          message,
          suggestions: Array.isArray(record.suggestions)
            ? record.suggestions.map((suggestion: unknown) => String(suggestion).trim()).filter(Boolean)
            : [],
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
    issues: normalizedIssues.length > 0
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

export default {
  // 写作辅助
  chatWithAI,
  continueWriting,
  polishText,
  expandText,
  rewriteText,
  summarizeText,
  proofreadText,
  // 故事上下文写作
  storyGenerate,
  updateSceneState,
}
