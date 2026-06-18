<script setup lang="ts">
import { ref, nextTick, watch, computed } from 'vue'
import { useAgentStore } from '../../stores/agentStore'
import EntityPreviewCard from './ai/EntityPreviewCard.vue'

const props = defineProps<{
  projectId: string
  aiConfig: {
    provider: string
    apiKey: string
    baseUrl: string
    model: string
  }
}>()

const store = useAgentStore()
const inputText = ref('')
const messagesContainer = ref<HTMLDivElement>()

// 建议（按类型分组）
const entityPreviews = computed(() => store.entityPreviewSuggestions)

// 是否已有流式内容：用于切换 "AI 正在思考..." 与流式消息显示
const hasStreamingContent = computed(() => {
  if (!store.streamingMessageId) return false
  const msg = store.messages.find(m => m.id === store.streamingMessageId)
  return !!msg && msg.content.length > 0
})

// 自动滚动到底部
watch(() => store.messages.length, async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
})

async function handleSend() {
  const text = inputText.value.trim()
  if (!text || store.isLoading) return

  inputText.value = ''
  await store.sendMessage(props.projectId, text, props.aiConfig)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function handleAcceptSuggestion(id: string) {
  store.acceptSuggestion(id)
}

function handleRejectSuggestion(id: string) {
  store.rejectSuggestion(id)
}

function handleEditSuggestion(id: string) {
  store.editSuggestion(id)
  // TODO: Phase 4 - 打开对应编辑器
}
</script>

<template>
  <div class="agent-panel flex flex-col h-full">
    <!-- 对话历史 -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
      <div v-if="store.messages.length === 0" class="text-center text-gray-400 pt-8">
        <p class="text-sm">向AI助手描述你的创作需求</p>
      </div>

      <div
        v-for="msg in store.messages"
        :key="msg.id"
        :class="[
          'rounded-lg px-3 py-2 text-sm max-w-[90%]',
          msg.role === 'user'
            ? 'bg-blue-500 text-white ml-auto'
            : 'bg-gray-100 text-gray-800',
        ]"
      >
        <div class="whitespace-pre-wrap">{{ msg.content }}</div>
      </div>

      <!-- 工具调用状态条：仅在工具运行期间显示 -->
      <div v-if="store.activeToolCall" class="text-xs text-gray-500 italic px-3 py-1">
        <span class="animate-pulse">正在调用工具 {{ store.activeToolCall.name }}...</span>
      </div>

      <!-- 加载状态：仅在等待首个 token 时显示（streamingMessageId 已设但消息内容仍空） -->
      <div
        v-if="store.isLoading && !hasStreamingContent"
        class="text-center text-gray-400 text-sm py-2"
      >
        <span class="animate-pulse">AI 正在思考...</span>
      </div>
    </div>

    <!-- 待处理的实体建议 -->
    <div v-if="entityPreviews.length > 0" class="border-t p-3 space-y-2 max-h-[40%] overflow-y-auto">
      <div class="text-xs text-gray-400 mb-1">待处理建议</div>
      <EntityPreviewCard
        v-for="sug in entityPreviews"
        :key="sug.id"
        :suggestion="sug"
        @accept="handleAcceptSuggestion"
        @reject="handleRejectSuggestion"
        @edit="handleEditSuggestion"
      />
    </div>

    <!-- 输入区 -->
    <div class="border-t p-3">
      <div class="flex gap-2">
        <textarea
          v-model="inputText"
          class="flex-1 border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="描述你的创作需求..."
          rows="2"
          :disabled="store.isLoading"
          @keydown="handleKeydown"
        />
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm disabled:opacity-50 self-end"
          :disabled="!inputText.trim() || store.isLoading"
          @click="handleSend"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>
