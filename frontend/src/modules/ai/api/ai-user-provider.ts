import axios, { type AxiosInstance } from 'axios'
import { getUserProviderRuntimeConfig } from '../config/provider'
import { AI_REQUEST_TIMEOUT_MS } from './request'
import type {
  AIGenerateResponse,
  AIProofreadIssue,
  AIProofreadResponse,
  AISummaryResponse,
  ChatMessage,
} from './ai'

interface ProviderMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ProviderUsage {
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
}

interface ProviderCompletionResponse {
  choices?: Array<{
    text?: unknown
    message?: {
      content?: unknown
    }
  }>
  usage?: ProviderUsage
}

function createProviderClient(): AxiosInstance {
  const config = getUserProviderRuntimeConfig()
  return axios.create({
    baseURL: config.baseURL,
    timeout: AI_REQUEST_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
      ...(config.apiKey.trim()
        ? {
            Authorization: `Bearer ${config.apiKey.trim()}`,
          }
        : {}),
    },
  })
}

function normalizeMessageContent(content: unknown): string {
  if (typeof content === 'string') {
    return content.trim()
  }
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object' && 'text' in item) {
          return String((item as { text?: unknown }).text || '')
        }
        return ''
      })
      .join('\n')
      .trim()
  }
  return ''
}

function normalizeUsage(usage?: ProviderUsage) {
  if (!usage) {
    return undefined
  }
  return {
    prompt_tokens: Number(usage.prompt_tokens || 0),
    completion_tokens: Number(usage.completion_tokens || 0),
    total_tokens: Number(usage.total_tokens || 0),
  }
}

async function completeChat(
  messages: ProviderMessage[],
  overrides?: {
    temperature?: number
    maxTokens?: number
  },
): Promise<{ content: string; usage?: ReturnType<typeof normalizeUsage> }> {
  const config = getUserProviderRuntimeConfig()
  const client = createProviderClient()
  const response = await client.post<ProviderCompletionResponse>(config.endpointPath, {
    model: config.model,
    messages,
    temperature: overrides?.temperature ?? config.temperature,
    ...(typeof overrides?.maxTokens === 'number' ? { max_tokens: overrides.maxTokens } : {}),
  })

  const choice = response.data?.choices?.[0]
  const content = normalizeMessageContent(choice?.message?.content ?? choice?.text)

  return {
    content,
    usage: normalizeUsage(response.data?.usage),
  }
}

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

  return value.reduce<AIProofreadIssue[]>((acc, item, index) => {
    if (!item || typeof item !== 'object') {
      return acc
    }
    const record = item as Record<string, unknown>
    const message = String(record.message || record.description || record.issue || '').trim()
    if (!message) {
      return acc
    }
    const rawSuggestions = record.suggestionDetails || record.suggestion_details || record.suggestions
    const suggestionDetails = Array.isArray(rawSuggestions)
      ? rawSuggestions
          .map((suggestion: unknown) => {
            if (suggestion && typeof suggestion === 'object') {
              const suggestionRecord = suggestion as Record<string, unknown>
              const text = String(
                suggestionRecord.text || suggestionRecord.value || suggestionRecord.suggestion || '',
              ).trim()
              if (!text) return null
              return {
                text,
                reason: String(suggestionRecord.reason || suggestionRecord.explanation || '').trim() || undefined,
                confidence: Number.isFinite(Number(suggestionRecord.confidence))
                  ? Number(suggestionRecord.confidence)
                  : undefined,
              }
            }
            const text = String(suggestion || '').trim()
            return text ? { text } : null
          })
          .filter((suggestion): suggestion is { text: string; reason?: string; confidence?: number } =>
            Boolean(suggestion),
          )
      : []
    acc.push({
      id: String(record.id || `proofread-${index + 1}`),
      type: String(record.type || record.category || '表达'),
      severity: String(record.severity || record.level || 'medium'),
      message,
      suggestions: suggestionDetails.map((suggestion) => suggestion.text),
      suggestionDetails,
      position: record.position && typeof record.position === 'object' ? (record.position as any) : undefined,
      originalText: String(record.originalText || record.original_text || record.original || '').trim() || undefined,
      category: String(record.category || '').trim() || undefined,
      rule: String(record.rule || '').trim() || undefined,
    })
    return acc
  }, [])
}

async function promptForText(
  systemPrompt: string,
  userPrompt: string,
  overrides?: {
    temperature?: number
    maxTokens?: number
  },
): Promise<{ text: string; usage?: ReturnType<typeof normalizeUsage> }> {
  const response = await completeChat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    overrides,
  )

  return {
    text: response.content,
    usage: response.usage,
  }
}

export const userAIProviderApi = {
  chat: async (
    message: string,
    history?: ChatMessage[],
  ): Promise<{ reply: string; usage?: ReturnType<typeof normalizeUsage> }> => {
    const messages: ProviderMessage[] = (history || [])
      .filter((item) => item && typeof item.content === 'string')
      .map((item) => ({
        role: item.role,
        content: item.content,
      }))

    messages.push({
      role: 'user',
      content: message,
    })

    const response = await completeChat(messages)
    return {
      reply: response.content,
      usage: response.usage,
    }
  },

  writing: {
    continue: async (
      _projectId: string,
      text: string,
      length: number = 200,
      instructions?: string,
    ): Promise<AIGenerateResponse> => {
      const response = await promptForText(
        '你是中文长篇小说续写助手。保持人物设定、叙事视角和语气稳定，只输出可直接接在原文后的正文。',
        [
          `目标长度：约 ${length} 字。`,
          instructions?.trim() ? `额外要求：${instructions.trim()}` : '',
          '原文：',
          text,
        ]
          .filter(Boolean)
          .join('\n\n'),
        { maxTokens: Math.max(256, Math.round(length * 2.5)) },
      )

      return {
        generated_text: response.text,
        usage: response.usage,
      }
    },

    polish: async (text: string, instructions?: string): Promise<AIGenerateResponse> => {
      const response = await promptForText(
        '你是中文小说润色助手。保留原有事实与情节，只优化语言流畅度、节奏和画面感，只输出润色后的正文。',
        [instructions?.trim() ? `润色要求：${instructions.trim()}` : '', '原文：', text]
          .filter(Boolean)
          .join('\n\n'),
      )

      return {
        polished_text: response.text,
        usage: response.usage,
      }
    },

    expand: async (
      text: string,
      instructions?: string,
      targetLength?: number,
    ): Promise<AIGenerateResponse> => {
      const response = await promptForText(
        '你是中文小说扩写助手。保留情节方向，在不跑题的前提下补足动作、环境、情绪与细节，只输出扩写后的正文。',
        [
          typeof targetLength === 'number' ? `目标长度：约 ${targetLength} 字。` : '',
          instructions?.trim() ? `扩写方向：${instructions.trim()}` : '',
          '原文：',
          text,
        ]
          .filter(Boolean)
          .join('\n\n'),
        typeof targetLength === 'number'
          ? { maxTokens: Math.max(256, Math.round(targetLength * 2.5)) }
          : undefined,
      )

      return {
        expanded_text: response.text,
        usage: response.usage,
      }
    },

    rewrite: async (text: string, instructions?: string): Promise<AIGenerateResponse> => {
      const response = await promptForText(
        '你是中文小说改写助手。根据要求重写文本，但要保持事实、角色关系和情节方向不变，只输出改写后的正文。',
        [instructions?.trim() ? `改写要求：${instructions.trim()}` : '', '原文：', text]
          .filter(Boolean)
          .join('\n\n'),
      )

      return {
        rewritten_text: response.text,
        usage: response.usage,
      }
    },

    summarize: async (
      text: string,
      options?: {
        maxLength?: number
        summaryType?: 'brief' | 'detailed' | 'keypoints'
        includeQuotes?: boolean
        contextPrompt?: string
      },
    ): Promise<AISummaryResponse> => {
      const response = await promptForText(
        '你是中文小说摘要助手。请只输出 JSON，不要输出其他解释。',
        [
          options?.summaryType === 'brief'
            ? '摘要尽量简短，只保留主线信息。'
            : options?.summaryType === 'keypoints'
              ? '摘要偏向要点提炼。'
              : '摘要兼顾情节、人物状态和变化。',
          typeof options?.maxLength === 'number'
            ? `摘要正文尽量控制在 ${options.maxLength} 字以内。`
            : '',
          options?.includeQuotes ? '允许极短引用原文。' : '不要直接引用原文句子。',
          options?.contextPrompt?.trim()
            ? `以下上下文只用于判断剧情、人物状态和当前创作目标，不要把它当作原文摘要对象：\n${options.contextPrompt.trim()}`
            : '',
          'JSON schema:',
          '{"summary":"摘要正文","keyPoints":["要点1","要点2"]}',
          '原文：',
          text,
        ]
          .filter(Boolean)
          .join('\n\n'),
      )

      const parsed = extractJsonPayload<{
        summary?: unknown
        keyPoints?: unknown
        key_points?: unknown
      }>(response.text)

      if (!parsed) {
        return {
          summary: response.text.trim(),
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

    proofread: async (
      text: string,
      options?: {
        contextPrompt?: string
      },
    ): Promise<AIProofreadResponse> => {
      const response = await promptForText(
        '你是中文小说审校助手。请只输出 JSON，不要输出其他解释。',
        [
          '检查错别字、语病、标点和表达问题，没有问题时 issues 返回空数组。',
          options?.contextPrompt?.trim()
            ? `以下上下文只用于判断措辞是否符合当前场景、人物和节拍，不要审校上下文本身：\n${options.contextPrompt.trim()}`
            : '',
          'JSON schema:',
          '{"score":8.5,"issues":[{"type":"grammar","severity":"warning","message":"问题描述","originalText":"原文片段","position":{"start":0,"end":2},"suggestions":["修改建议"]}]}',
          '原文：',
          text,
        ].join('\n\n'),
      )

      const parsed = extractJsonPayload<{ score?: unknown; issues?: unknown }>(response.text)
      return {
        score: typeof parsed?.score === 'number' ? parsed.score : undefined,
        issues: normalizeIssues(parsed?.issues),
        usage: response.usage,
      }
    },
  },

  story: {
    generate: async (payload: {
      projectId: string
      documentId: string
      mode: 'continue' | 'rewrite' | 'suggest'
      instruction?: string
      selectedText?: string
    }): Promise<{ content: string; data: { content: string } }> => {
      const modeLabel =
        payload.mode === 'continue' ? '续写' : payload.mode === 'rewrite' ? '改写' : '情节建议'
      const response = await promptForText(
        '你是中文小说写作助手。请基于给定上下文提供可直接使用的结果，只输出正文内容，不要解释。',
        [
          `任务类型：${modeLabel}`,
          payload.instruction?.trim() ? `用户要求：${payload.instruction.trim()}` : '',
          payload.selectedText?.trim() ? `选中文本：\n${payload.selectedText.trim()}` : '',
        ]
          .filter(Boolean)
          .join('\n\n'),
      )

      return {
        content: response.text,
        data: {
          content: response.text,
        },
      }
    },
  },

  workbench: {
    rewrite: async (payload: {
      originalText: string
      mode: 'polish' | 'expand' | 'shorten'
      instructions?: string
    }): Promise<{ rewritten_text: string; usage?: ReturnType<typeof normalizeUsage> }> => {
      const modeLabel =
        payload.mode === 'polish' ? '润色优化' : payload.mode === 'expand' ? '扩写增强' : '压缩精简'
      const response = await promptForText(
        '你是中文小说工作台改写助手。按要求改写文本，只输出改写后的正文。',
        [
          `任务模式：${modeLabel}`,
          payload.instructions?.trim() ? `补充要求：${payload.instructions.trim()}` : '',
          '原文：',
          payload.originalText,
        ]
          .filter(Boolean)
          .join('\n\n'),
      )

      return {
        rewritten_text: response.text,
        usage: response.usage,
      }
    },

    auditSensitiveWords: async (payload: {
      content: string
      projectId?: string
      chapterId?: string
      workflowContextPrompt?: string
      contextPrompt?: string
    }): Promise<{
      totalMatches?: number
      isSafe?: boolean
      sensitiveWords: Array<Record<string, unknown>>
      usage?: ReturnType<typeof normalizeUsage>
    }> => {
      const response = await promptForText(
        '你是中文内容风控助手。请检测文本中的敏感词和明显风险表达，只输出 JSON，不要输出其他解释。',
        [
          'JSON schema:',
          '{"totalMatches":1,"isSafe":false,"sensitiveWords":[{"word":"示例","reason":"涉政/暴力/违规"}]}',
          payload.projectId ? `项目ID：${payload.projectId}` : '',
          payload.chapterId ? `章节ID：${payload.chapterId}` : '',
          (payload.contextPrompt || payload.workflowContextPrompt)?.trim()
            ? `以下上下文只用于判断表达风险和叙事语境，不要检测上下文本身：\n${(payload.contextPrompt || payload.workflowContextPrompt)?.trim()}`
            : '',
          '待检测内容：',
          payload.content,
        ]
          .filter(Boolean)
          .join('\n\n'),
      )

      const parsed = extractJsonPayload<{
        totalMatches?: unknown
        isSafe?: unknown
        sensitiveWords?: unknown
      }>(response.text)

      return {
        totalMatches: typeof parsed?.totalMatches === 'number' ? parsed.totalMatches : undefined,
        isSafe: typeof parsed?.isSafe === 'boolean' ? parsed.isSafe : undefined,
        sensitiveWords: Array.isArray(parsed?.sensitiveWords)
          ? (parsed.sensitiveWords as Array<Record<string, unknown>>)
          : [],
        usage: response.usage,
      }
    },
  },
}
