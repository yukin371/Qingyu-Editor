import { defineStore } from 'pinia'
import { ref } from 'vue'
import { streamReviewChapter, streamReviewProject } from '../api/reviewStream'
import type { AIAgentConfig } from '../types/agent'

interface ActiveReview {
  kind: 'chapter' | 'project'
  target: { chapterId?: string; chapterTitle?: string } | null
  sessionID: string | null
  content: string
  status: 'streaming' | 'done' | 'error'
  errorMessage?: string
}

interface ActiveToolCall {
  name: string
  status: 'running' | 'done' | 'failed'
}

// 模块级 cleanup：每次 start* 都会替换它；close() / 新 start* 会先调用旧 cleanup。
// 让并发触发时上一次的 EventsOn 订阅被释放，避免旧 session 的 token 写入新 review。
let currentCleanup: (() => void) | null = null

export const useReviewStore = defineStore('review', () => {
  const isOpen = ref(false)
  const activeReview = ref<ActiveReview | null>(null)
  const activeToolCall = ref<ActiveToolCall | null>(null)

  function runCleanup() {
    if (currentCleanup) {
      currentCleanup()
      currentCleanup = null
    }
  }

  /**
   * 开启章节审阅流。订阅新事件之前先清理上一次的订阅，保证并发触发安全。
   *
   * 竞态防护：await streamReviewChapter 期间若另一个 start* 覆盖了 currentCleanup，
   * 当前调用的 handle.unsubscribe 会被立即调用，避免订阅孤儿。
   */
  async function startChapterReview(
    projectId: string,
    chapterId: string,
    chapterTitle: string,
    config: AIAgentConfig | null,
  ): Promise<void> {
    runCleanup()

    // 先同步注册占位 cleanup，防止 await 期间并发 start* 把 currentCleanup 留空。
    const holder: { fn: (() => void) | null } = { fn: null }
    const myCleanup = () => { holder.fn?.() }
    currentCleanup = myCleanup

    isOpen.value = true
    activeReview.value = {
      kind: 'chapter',
      target: { chapterId, chapterTitle },
      sessionID: null,
      content: '',
      status: 'streaming',
    }
    activeToolCall.value = null

    const handle = await streamReviewChapter('', projectId, chapterId, chapterTitle, config, {
      onToken: (delta) => {
        if (activeReview.value) activeReview.value.content += delta
      },
      onToolStart: (name) => {
        activeToolCall.value = { name, status: 'running' }
      },
      onToolEnd: (_name, _ok) => {
        activeToolCall.value = null
      },
      onDone: (result) => {
        if (activeReview.value) {
          activeReview.value.content = result.content
          activeReview.value.status = 'done'
        }
      },
      onError: (message) => {
        if (activeReview.value) {
          activeReview.value.status = 'error'
          activeReview.value.errorMessage = message
        }
      },
    })

    if (currentCleanup === myCleanup) {
      // 仍是当前 review：登记真实 unsubscribe 并写入 sessionID
      if (activeReview.value) activeReview.value.sessionID = handle.sessionID
      holder.fn = handle.unsubscribe
    } else {
      // await 期间被新 start* 覆盖：自清理，避免订阅孤儿
      handle.unsubscribe()
    }
  }

  /**
   * 开启整书审阅流。并发触发安全语义同 startChapterReview。
   */
  async function startProjectReview(
    projectId: string,
    config: AIAgentConfig | null,
  ): Promise<void> {
    runCleanup()

    const holder: { fn: (() => void) | null } = { fn: null }
    const myCleanup = () => { holder.fn?.() }
    currentCleanup = myCleanup

    isOpen.value = true
    activeReview.value = {
      kind: 'project',
      target: null,
      sessionID: null,
      content: '',
      status: 'streaming',
    }
    activeToolCall.value = null

    const handle = await streamReviewProject('', projectId, config, {
      onToken: (delta) => {
        if (activeReview.value) activeReview.value.content += delta
      },
      onToolStart: (name) => {
        activeToolCall.value = { name, status: 'running' }
      },
      onToolEnd: (_name, _ok) => {
        activeToolCall.value = null
      },
      onDone: (result) => {
        if (activeReview.value) {
          activeReview.value.content = result.content
          activeReview.value.status = 'done'
        }
      },
      onError: (message) => {
        if (activeReview.value) {
          activeReview.value.status = 'error'
          activeReview.value.errorMessage = message
        }
      },
    })

    if (currentCleanup === myCleanup) {
      if (activeReview.value) activeReview.value.sessionID = handle.sessionID
      holder.fn = handle.unsubscribe
    } else {
      handle.unsubscribe()
    }
  }

  /**
   * 关闭抽屉并清理所有状态，同时释放底层 EventsOn 订阅。
   */
  function close() {
    runCleanup()
    isOpen.value = false
    activeReview.value = null
    activeToolCall.value = null
  }

  return {
    isOpen,
    activeReview,
    activeToolCall,
    startChapterReview,
    startProjectReview,
    close,
  }
})
