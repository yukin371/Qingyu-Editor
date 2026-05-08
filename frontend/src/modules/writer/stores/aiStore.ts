import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useWorldStore } from './worldStore'
// 假设有 AI API
// import { aiApi } from '../api/ai'

export const useAIStore = defineStore('writer-ai', () => {
  const worldStore = useWorldStore()

  const chatHistory = ref<any[]>([])
  const isThinking = ref(false)

  async function sendMessage(msg: string) {
    isThinking.value = true
    chatHistory.value.push({ role: 'user', content: msg })

    try {
      // 组装上下文（暂未使用，为将来API调用准备）
      void worldStore.getAIContext()

      // 模拟调用 API
      // const res = await aiApi.chat(msg, context)
      const res = 'AI 回复模拟' // Replace with real API

      chatHistory.value.push({ role: 'assistant', content: res })
    } finally {
      isThinking.value = false
    }
  }

  return {
    chatHistory,
    isThinking,
    sendMessage,
  }
})
