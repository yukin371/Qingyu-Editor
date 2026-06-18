import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  streamIntent,
  createConversation,
  saveMessage,
  listConversations,
  getConversation,
  deleteConversation,
  updateConversationTitle,
} from '../api/agent'
import type {
  AgentMessage,
  AIAgentConfig,
  EditorContext,
  ManagedSuggestion,
  Suggestion,
} from '../types/agent'

let messageIdCounter = 0

function createMessage(role: AgentMessage['role'], content: string, suggestions?: Suggestion[]): AgentMessage {
  return {
    id: `msg_${++messageIdCounter}`,
    role,
    content,
    timestamp: Date.now(),
    suggestions,
  }
}

export const useAgentStore = defineStore('agent', () => {
  const messages = ref<AgentMessage[]>([])
  const pendingSuggestions = ref<ManagedSuggestion[]>([])
  const isLoading = ref(false)
  const currentConversationId = ref<string | null>(null)
  const conversationList = ref<{ id: string; title: string; updatedAt: string }[]>([])
  // 流式渲染状态：当前正在追加 token 的助手消息 ID
  const streamingMessageId = ref<string | null>(null)
  // 工具调用状态条：null 表示无活动工具
  const activeToolCall = ref<{ name: string; status: 'running' | 'done' | 'failed' } | null>(null)

  // 按 type 分类的 computed
  const textDiffSuggestions = computed(() =>
    pendingSuggestions.value.filter(s => s.type === 'text_diff'),
  )

  const entityPreviewSuggestions = computed(() =>
    pendingSuggestions.value.filter(s => s.type === 'entity_preview'),
  )

  async function sendMessage(
    projectId: string,
    intent: string,
    config: AIAgentConfig,
    editorContext?: EditorContext,
  ) {
    // 如果没有当前对话，自动创建
    if (!currentConversationId.value) {
      try {
        const conv = await createConversation(projectId)
        currentConversationId.value = conv.id
      } catch {
        // 对话创建失败不阻塞核心流程
      }
    }

    const userMsg = createMessage('user', intent)
    messages.value.push(userMsg)
    isLoading.value = true

    // 持久化用户消息
    if (currentConversationId.value) {
      saveMessage(currentConversationId.value, {
        role: 'user',
        content: intent,
        timestamp: new Date().toISOString(),
      }).catch(() => {})
    }

    const ctx: EditorContext = editorContext || {
      currentChapterId: '',
      cursorPosition: 0,
      selectedText: '',
      nearbyCharacters: [],
    }

    // 预创建空的助手消息，token 流式追加到它的 content
    const aiMessage = createMessage('assistant', '')
    messages.value.push(aiMessage)
    streamingMessageId.value = aiMessage.id

    try {
      await streamIntent(projectId, intent, ctx, config, {
        onToken: (delta: string) => {
          // 按 ID 找到正在流的消息，追加 delta
          const target = messages.value.find(m => m.id === streamingMessageId.value)
          if (target) {
            target.content += delta
          }
        },
        onToolStart: (toolName: string) => {
          activeToolCall.value = { name: toolName, status: 'running' }
        },
        onToolEnd: (_toolName: string, _ok: boolean) => {
          // 简单处理：工具结束即清空状态条
          activeToolCall.value = null
        },
        onDone: (result) => {
          // 用户可能在流式过程中导航离开（清空 streamingMessageId），守护一下
          if (!streamingMessageId.value) return
          const target = messages.value.find(m => m.id === streamingMessageId.value)
          if (target) {
            // Go 端 onDone 返回的是完整内容，直接替换而非追加，避免重复
            target.content = result.content
            target.suggestions = result.suggestions
          }

          // 持久化最终助手消息
          if (currentConversationId.value) {
            saveMessage(currentConversationId.value, {
              role: 'assistant',
              content: result.content,
              suggestions: result.suggestions,
              timestamp: new Date().toISOString(),
            }).catch(() => {})
          }

          if (result.suggestions?.length) {
            const managed: ManagedSuggestion[] = result.suggestions.map(s => ({
              ...s,
              status: 'pending',
            }))
            pendingSuggestions.value.push(...managed)
          }

          streamingMessageId.value = null
          isLoading.value = false
        },
        onError: (message: string) => {
          if (!streamingMessageId.value) return
          const target = messages.value.find(m => m.id === streamingMessageId.value)
          const errContent = `出错了：${message}`
          if (target) {
            target.content = errContent
          }

          if (currentConversationId.value) {
            saveMessage(currentConversationId.value, {
              role: 'assistant',
              content: errContent,
              timestamp: new Date().toISOString(),
            }).catch(() => {})
          }

          streamingMessageId.value = null
          isLoading.value = false
          activeToolCall.value = null
        },
      })
    } catch (err: any) {
      // streamIntent 同步阶段抛错（如配置缺失、订阅前绑定失败）
      const errContent = `出错了：${err.message || '未知错误'}`
      if (streamingMessageId.value) {
        const target = messages.value.find(m => m.id === streamingMessageId.value)
        if (target) target.content = errContent

        if (currentConversationId.value) {
          saveMessage(currentConversationId.value, {
            role: 'assistant',
            content: errContent,
            timestamp: new Date().toISOString(),
          }).catch(() => {})
        }
      }

      streamingMessageId.value = null
      activeToolCall.value = null
    } finally {
      // 安全网：正常路径在 onDone/onError 中已清空
      isLoading.value = false
    }
  }

  async function loadConversationHistory(projectId: string) {
    try {
      const list = await listConversations(projectId)
      conversationList.value = list.map(c => ({
        id: c.id,
        title: c.title,
        updatedAt: c.updatedAt,
      }))
    } catch {
      // 加载失败不阻塞
    }
  }

  async function loadConversation(id: string) {
    try {
      const conv = await getConversation(id)
      currentConversationId.value = conv.id
      messages.value = (conv.messages || []).map(m => ({
        id: m.id,
        role: m.role as AgentMessage['role'],
        content: m.content,
        timestamp: new Date(m.timestamp).getTime(),
        suggestions: m.suggestions,
      }))
      pendingSuggestions.value = []
    } catch {
      // 加载失败不阻塞
    }
  }

  async function clearConversation() {
    currentConversationId.value = null
    messages.value = []
    pendingSuggestions.value = []
  }

  async function removeConversation(id: string) {
    try {
      await deleteConversation(id)
      conversationList.value = conversationList.value.filter(c => c.id !== id)
      if (currentConversationId.value === id) {
        currentConversationId.value = null
        messages.value = []
        pendingSuggestions.value = []
      }
    } catch {
      // 删除失败不阻塞
    }
  }

  async function renameConversation(id: string, title: string) {
    try {
      await updateConversationTitle(id, title)
      const item = conversationList.value.find(c => c.id === id)
      if (item) item.title = title
    } catch {
      // 重命名失败不阻塞
    }
  }

  function acceptSuggestion(id: string) {
    const idx = pendingSuggestions.value.findIndex(s => s.id === id)
    if (idx !== -1) {
      pendingSuggestions.value[idx].status = 'applied'
      pendingSuggestions.value.splice(idx, 1)
    }
  }

  function rejectSuggestion(id: string) {
    const idx = pendingSuggestions.value.findIndex(s => s.id === id)
    if (idx !== -1) {
      pendingSuggestions.value[idx].status = 'rejected'
      pendingSuggestions.value.splice(idx, 1)
    }
  }

  function editSuggestion(id: string) {
    const sug = pendingSuggestions.value.find(s => s.id === id)
    if (sug) {
      sug.status = 'editing'
    }
  }

  function finishEditing(id: string) {
    const sug = pendingSuggestions.value.find(s => s.id === id)
    if (sug) {
      sug.status = 'previewing'
    }
  }

  function markExpiredIfContentChanged(chapterId: string, currentContent: string) {
    for (const sug of pendingSuggestions.value) {
      if (
        sug.targetEntity === 'chapter' &&
        sug.targetId === chapterId &&
        sug.status === 'pending' &&
        sug.originalContent !== undefined &&
        sug.originalContent !== currentContent
      ) {
        sug.status = 'expired'
      }
    }
  }

  function getSuggestionById(id: string): ManagedSuggestion | undefined {
    return pendingSuggestions.value.find(s => s.id === id)
  }

  return {
    messages,
    pendingSuggestions,
    textDiffSuggestions,
    entityPreviewSuggestions,
    isLoading,
    currentConversationId,
    conversationList,
    streamingMessageId,
    activeToolCall,
    sendMessage,
    loadConversationHistory,
    loadConversation,
    clearConversation,
    removeConversation,
    renameConversation,
    acceptSuggestion,
    rejectSuggestion,
    editSuggestion,
    finishEditing,
    markExpiredIfContentChanged,
    getSuggestionById,
  }
})
