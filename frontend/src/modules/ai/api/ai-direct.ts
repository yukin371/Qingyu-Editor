/**
 * AI Direct API Client
 * 直接连接AI服务（演示模式）
 */

import axios, { AxiosInstance } from 'axios'
import type {
  ChatMessage,
  AIGenerateResponse,
  AISummaryResponse,
  AIProofreadResponse,
  AIProofreadIssue,
} from './ai'
import { AI_REQUEST_TIMEOUT_MS } from './request'

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL
const AI_DIRECT_MODE = import.meta.env.VITE_AI_DIRECT_MODE === 'true'

const createDirectClient = (): AxiosInstance => {
  return axios.create({
    baseURL: AI_SERVICE_URL,
    timeout: AI_REQUEST_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

const directClient = createDirectClient()

function extractJsonPayload<T>(value: string): T | null {
  const normalized = value.trim()
  const fencedMatch = normalized.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = (fencedMatch?.[1] || normalized).trim()
  const startIndex = candidate.indexOf('{')
  const endIndex = candidate.lastIndexOf('}')
  if (startIndex < 0 || endIndex <= startIndex) {
    return null
  }

  try {
    return JSON.parse(candidate.slice(startIndex, endIndex + 1)) as T
  } catch {
    return null
  }
}

function normalizeKeyPoints(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.map((item) => String(item).trim()).filter(Boolean)
}

function normalizeIssues(value: unknown): AIProofreadIssue[] {
  if (!Array.isArray(value)) {
    return []
  }

  const issues: Array<AIProofreadIssue | null> = value
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null
      }

      const record = item as Record<string, unknown>
      const message = String(record.message || record.description || record.issue || '').trim()
      if (!message) {
        return null
      }

      return {
        id: String(record.id || `direct-issue-${index + 1}`),
        type: String(record.type || record.category || '表达'),
        severity: String(record.severity || record.level || 'medium'),
        message,
        suggestions: Array.isArray(record.suggestions)
          ? record.suggestions.map((suggestion) => String(suggestion).trim()).filter(Boolean)
          : [],
      } satisfies AIProofreadIssue
    })
  return issues.filter((item): item is AIProofreadIssue => item !== null)
}

async function sendDirectChat(
  message: string,
  history?: ChatMessage[],
): Promise<{ reply: string; usage?: any }> {
  const messages = [...(history || []), { role: 'user' as const, content: message }]
  const response = await directClient.post('/api/v1/ai/chat', {
    messages,
    model: 'gpt-4',
  })
  return {
    reply: response.data?.message || response.data?.reply || '',
    usage: response.data?.usage,
  }
}

export const isDirectModeEnabled = (): boolean => {
  return AI_DIRECT_MODE && typeof AI_SERVICE_URL === 'string' && AI_SERVICE_URL.trim().length > 0
}

export const aiDirectApi = {
  health: async (): Promise<{ status: string; [key: string]: any }> => {
    const response = await directClient.get('/api/v1/health')
    return response.data
  },

  chat: async (
    message: string,
    history?: ChatMessage[],
  ): Promise<{ reply: string; usage?: any }> => {
    return sendDirectChat(message, history)
  },

  writing: {
    // 续写: POST /api/v1/ai/writing/continue
    continue: async (
      projectId: string,
      text: string,
      length: number = 200,
      instructions?: string,
    ): Promise<AIGenerateResponse> => {
      const trimmedInstructions = (instructions || '').trim()
      const response = await directClient.post('/api/v1/ai/writing/continue', {
        project_id: projectId || 'demo-project',
        current_text: text,
        continue_length: length,
        ...(trimmedInstructions
          ? {
              context: {
                plot_summary: trimmedInstructions,
              },
            }
          : {}),
      })
      return {
        generated_text: response.data?.generated_text,
        usage: response.data?.usage,
      }
    },

    // 润色: POST /api/v1/ai/writing/polish
    polish: async (text: string, instructions?: string): Promise<AIGenerateResponse> => {
      const trimmedInstructions = (instructions || '').trim()
      const response = await directClient.post('/api/v1/ai/writing/polish', {
        text,
        ...(trimmedInstructions
          ? {
              style: trimmedInstructions.slice(0, 80),
              focus_areas: ['flow', 'tone'],
            }
          : {}),
      })
      return {
        polished_text: response.data?.generated_text,
        usage: response.data?.usage,
      }
    },

    // 扩写: POST /api/v1/ai/writing/expand
    expand: async (
      text: string,
      instructions?: string,
      targetLength?: number,
    ): Promise<AIGenerateResponse> => {
      const textLength = Math.max(text.length, 1)
      const ratioFromTarget = targetLength ? targetLength / textLength : 1.5
      const expandRatio = Math.min(3, Math.max(1, ratioFromTarget))
      const response = await directClient.post('/api/v1/ai/writing/expand', {
        text,
        expand_ratio: expandRatio,
        ...(instructions?.trim()
          ? {
              direction: instructions.trim(),
            }
          : {}),
      })
      return {
        expanded_text: response.data?.generated_text,
        usage: response.data?.usage,
      }
    },

    // 改写: 暂无对应API，使用润色代替
    rewrite: async (text: string, instructions?: string): Promise<AIGenerateResponse> => {
      const response = await directClient.post('/api/v1/ai/writing/polish', {
        text,
        ...(instructions?.trim()
          ? {
              style: instructions.trim().slice(0, 80),
              focus_areas: ['flow', 'tone'],
            }
          : {}),
      })
      return {
        rewritten_text: response.data?.generated_text,
        usage: response.data?.usage,
      }
    },

    summarize: async (
      text: string,
      options?: {
        maxLength?: number
        summaryType?: 'brief' | 'detailed' | 'keypoints'
        includeQuotes?: boolean
      },
    ): Promise<AISummaryResponse> => {
      const prompt = [
        '你是小说写作助手。请对下面内容生成中文摘要。',
        options?.summaryType === 'brief'
          ? '摘要要尽量简洁，只保留主线信息。'
          : options?.summaryType === 'keypoints'
            ? '摘要请偏向要点提炼。'
            : '摘要请兼顾情节与人物状态。',
        typeof options?.maxLength === 'number'
          ? `摘要正文尽量控制在 ${options.maxLength} 字以内。`
          : '',
        options?.includeQuotes ? '允许引用极短原文短句。' : '不要直接引用原文句子。',
        '请严格只输出 JSON，不要输出其他解释。',
        '{"summary":"摘要正文","keyPoints":["要点1","要点2"]}',
        '待处理内容：',
        text,
      ]
        .filter(Boolean)
        .join('\n\n')

      const response = await sendDirectChat(prompt)
      const parsed = extractJsonPayload<{ summary?: unknown; keyPoints?: unknown; key_points?: unknown }>(
        response.reply,
      )

      if (!parsed) {
        return {
          summary: response.reply.trim(),
          keyPoints: [],
          usage: response.usage,
        }
      }

      return {
        summary: String(parsed.summary || '').trim(),
        keyPoints: normalizeKeyPoints(parsed.keyPoints ?? parsed.key_points),
        usage: response.usage,
      }
    },

    proofread: async (text: string): Promise<AIProofreadResponse> => {
      const prompt = [
        '你是中文小说审校助手。请检查下面内容中的错别字、语病、标点和表达问题。',
        '请严格只输出 JSON，不要输出其他解释。',
        '{"score":8.5,"issues":[{"type":"语法","severity":"medium","message":"问题描述","suggestions":["修改建议"]}]}',
        '如果没有明显问题，issues 返回空数组。',
        '待审校内容：',
        text,
      ].join('\n\n')

      const response = await sendDirectChat(prompt)
      const parsed = extractJsonPayload<{ score?: unknown; issues?: unknown }>(response.reply)

      if (!parsed) {
        return {
          score: undefined,
          issues: response.reply.trim()
            ? [
                {
                  id: 'direct-proofread-fallback',
                  type: '审校',
                  severity: 'info',
                  message: response.reply.trim(),
                  suggestions: [],
                },
              ]
            : [],
          usage: response.usage,
        }
      }

      return {
        score: typeof parsed.score === 'number' ? parsed.score : undefined,
        issues: normalizeIssues(parsed.issues),
        usage: response.usage,
      }
    },
  },
}

export default aiDirectApi
