import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  sendIntent,
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

    try {
      const ctx: EditorContext = editorContext || {
        currentChapterId: '',
        cursorPosition: 0,
        selectedText: '',
        nearbyCharacters: [],
      }

      const result = await sendIntent(projectId, intent, ctx, config)

      const aiMessage = createMessage('assistant', result.content, result.suggestions)
      messages.value.push(aiMessage)

      // 持久化助手回复
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
    } catch (err: any) {
      const errorMsg = createMessage('assistant', `出错了：${err.message || '未知错误'}`)
      messages.value.push(errorMsg)

      if (currentConversationId.value) {
        saveMessage(currentConversationId.value, {
          role: 'assistant',
          content: `出错了：${err.message || '未知错误'}`,
          timestamp: new Date().toISOString(),
        }).catch(() => {})
      }
    } finally {
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
