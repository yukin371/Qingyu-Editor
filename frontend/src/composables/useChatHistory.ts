/**
 * 对话历史管理组合式函数
 *
 * 管理AI助手面板的消息列表和会话状态，集成LocalStorage持久化。
 * 提供消息添加、历史加载、清空等功能。
 *
 * @param sessionId - 会话ID，用于区分不同的对话会话
 * @returns 对话历史管理对象
 *
 * @example
 * ```typescript
 * const { messages, addMessage, clearHistory, save, load } = useChatHistory('session-1')
 * ```
 *
 * @author 猫娘Kore
 * @date 2026-02-08
 */

import { ref, watch, computed, type ComputedRef, type Ref } from 'vue'

export interface DocumentToolPatchPreviewMeta {
  kind: 'document_tool_patch_preview'
  status: 'ready' | 'switching'
  statusText: string
  documentLabel: string
  operationType: string
  blockCount: number
  totalLines: number
  blocks: Array<{
    header: string
    before: string[]
    after: string[]
  }>
}

export interface DocumentTargetCandidatesMeta {
  kind: 'document_target_candidates'
  status: 'needs_selection'
  statusText: string
  requestLabel: string
  instruction: string
  route: 'edit' | 'analysis'
  candidates: Array<{
    documentId: string
    documentTitle: string
    reason?: string
  }>
}

export interface DocumentTargetStatusMeta {
  kind: 'document_target_status'
  status: 'loading' | 'switching' | 'ready'
  statusText: string
  documentLabel: string
  detail?: string
}

export type ChatMessageMeta =
  | DocumentToolPatchPreviewMeta
  | DocumentTargetCandidatesMeta
  | DocumentTargetStatusMeta

/**
 * 聊天消息接口
 */
export interface ChatMessage {
  /** 扩展元信息，用于结构化消息卡片 */
  meta?: ChatMessageMeta
  /** 消息唯一标识 */
  id: string
  /** 消息角色 */
  role: 'user' | 'assistant' | 'system'
  /** 消息内容 */
  content: string
  /** 时间戳 */
  timestamp: number
  /** 是否正在打字中 */
  typing?: boolean
}

export interface UseChatHistoryReturn {
  /** 消息列表 */
  messages: Ref<ChatMessage[]>
  /** 会话ID */
  sessionId: Ref<string>
  /** 切换会话ID */
  setSessionId: (newSessionId: string) => void
  /** 添加消息 */
  addMessage: (
    role: ChatMessage['role'],
    content: string,
    typing?: boolean,
    meta?: ChatMessage['meta'],
  ) => ChatMessage
  /** 清空历史 */
  clearHistory: () => void
  /** 保存历史 */
  save: () => void
  /** 加载历史 */
  load: () => void
  /** 删除指定消息 */
  deleteMessage: (id: string) => void
  /** 更新消息内容 */
  updateMessage: (id: string, newContent: string) => void
  /** 获取用户消息数量 */
  userMessageCount: ComputedRef<number>
  /** 获取AI消息数量 */
  aiMessageCount: ComputedRef<number>
}

export function useChatHistory(sessionId: string): UseChatHistoryReturn {
  const messages = ref<ChatMessage[]>([])
  const currentSessionId = ref(sessionId)

  function getStorageKey(targetSessionId: string = currentSessionId.value): string {
    return `ai-chat-${targetSessionId}`
  }

  function saveToStorage() {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(messages.value))
    } catch (error) {
      console.error('[useChatHistory] Save error:', error)
    }
  }

  function loadFromStorage(targetSessionId: string = currentSessionId.value): ChatMessage[] {
    try {
      const raw = localStorage.getItem(getStorageKey(targetSessionId))
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error('[useChatHistory] Load error:', error)
      return []
    }
  }

  /**
   * 生成唯一消息ID
   */
  function generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 添加消息
   */
  function addMessage(
    role: ChatMessage['role'],
    content: string,
    typing: boolean = false,
    meta?: ChatMessage['meta'],
  ): ChatMessage {
    const message: ChatMessage = {
      id: generateMessageId(),
      role,
      content,
      timestamp: Date.now(),
      typing,
      meta,
    }

    messages.value.push(message)
    saveToStorage()

    return message
  }

  /**
   * 清空历史
   */
  function clearHistory() {
    messages.value = []
    saveToStorage()
  }

  /**
   * 保存历史（手动触发）
   */
  function save() {
    saveToStorage()
  }

  /**
   * 加载历史（手动触发）
   */
  function load() {
    const storedMessages = loadFromStorage()
    // 同步加载的数据。历史数据中 assistant 可能残留 typing=true，需修正避免正文不可见。
    messages.value = (storedMessages ?? []).map((m) => ({
      ...m,
      typing: m.typing === true && (!m.content || !m.content.trim()) ? true : false,
    }))
  }

  function setSessionId(newSessionId: string) {
    const normalized = (newSessionId || '').trim()
    if (!normalized || normalized === currentSessionId.value) return
    save()
    currentSessionId.value = normalized
    load()
  }

  /**
   * 删除指定消息
   */
  function deleteMessage(messageId: string) {
    const index = messages.value.findIndex((m) => m.id === messageId)
    if (index !== -1) {
      messages.value.splice(index, 1)
      saveToStorage()
    }
  }

  /**
   * 更新消息内容
   */
  function updateMessage(messageId: string, content: string) {
    const message = messages.value.find((m) => m.id === messageId)
    if (message) {
      message.content = content
      message.typing = false
      saveToStorage()
    }
  }

  /**
   * 计算用户消息数量
   */
  const userMessageCount = computed(() => {
    return (messages.value ?? []).filter((m) => m.role === 'user').length
  })

  /**
   * 计算AI消息数量
   */
  const aiMessageCount = computed(() => {
    return (messages.value ?? []).filter((m) => m.role === 'assistant').length
  })

  return {
    messages,
    sessionId: currentSessionId,
    setSessionId,
    addMessage,
    clearHistory,
    save,
    load,
    deleteMessage,
    updateMessage,
    userMessageCount,
    aiMessageCount,
  }
}

/**
 * 对话历史管理钩子（带预设消息）
 *
 * @param sessionId - 会话ID
 * @param presetMessages - 预设消息列表
 * @returns 对话历史管理对象
 */
export interface UseChatHistoryWithPresetReturn extends UseChatHistoryReturn {
  /** 重置到预设消息 */
  resetToPreset: () => void
  /** 是否使用预设消息 */
  isUsingPreset: ReturnType<typeof ref<boolean>>
}

export function useChatHistoryWithPreset(
  sessionId: string,
  presetMessages: ChatMessage[] = [],
): UseChatHistoryWithPresetReturn {
  const history = useChatHistory(sessionId)
  const isUsingPreset = ref(false)

  /**
   * 重置到预设消息
   */
  function resetToPreset() {
    history.messages.value = [...presetMessages]
    history.save()
    isUsingPreset.value = true
  }

  // 监听消息变化，如果与预设不同则标记为非预设状态
  watch(
    () => history.messages.value,
    (newMessages) => {
      if (JSON.stringify(newMessages) !== JSON.stringify(presetMessages)) {
        isUsingPreset.value = false
      }
    },
    { deep: true },
  )

  return {
    ...history,
    resetToPreset,
    isUsingPreset,
  }
}
