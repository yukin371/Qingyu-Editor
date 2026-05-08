/**
 * useAIStream - AI流式响应组合函数
 *
 * 处理AI API的流式响应，实现打字机效果
 * 支持SSE (Server-Sent Events) 和普通流式响应
 */

import { ref, Ref } from 'vue'
import { message } from '@/design-system/services'
export interface AIStreamOptions {
  endpoint: string
  method?: 'POST' | 'GET'
  headers?: Record<string, string>
  onChunk?: (chunk: string) => void
  onComplete?: (fullContent: string) => void
  onError?: (error: Error) => void
  typewriterSpeed?: number // 打字机速度（毫秒/字符）
}

export interface UseAIStreamReturn {
  content: Ref<string>
  streaming: Ref<boolean>
  error: Ref<string | null>
  send: (data: any) => Promise<void>
  cancel: () => void
  clear: () => void
}

export function useAIStream(options: AIStreamOptions): UseAIStreamReturn {
  const {
    endpoint,
    method = 'POST',
    headers = {},
    onChunk,
    onComplete,
    onError,
    typewriterSpeed = 30
  } = options

  const content = ref('')
  const streaming = ref(false)
  const error = ref<string | null>(null)

  let abortController: AbortController | null = null
  let typewriterQueue: string[] = []
  let typewriterTimer: NodeJS.Timeout | null = null

  /**
   * 打字机效果：逐字显示
   */
  const startTypewriter = (text: string) => {
    typewriterQueue.push(...text.split(''))

    if (typewriterTimer) return

    const processQueue = () => {
      if (typewriterQueue.length === 0) {
        typewriterTimer = null
        return
      }

      const char = typewriterQueue.shift()
      if (char) {
        content.value += char
      }

      typewriterTimer = setTimeout(processQueue, typewriterSpeed)
    }

    processQueue()
  }

  /**
   * 立即显示所有内容（跳过打字机效果）
   */
  const flushTypewriter = () => {
    if (typewriterTimer) {
      clearTimeout(typewriterTimer)
      typewriterTimer = null
    }
    if (typewriterQueue.length > 0) {
      content.value += typewriterQueue.join('')
      typewriterQueue = []
    }
  }

  /**
   * 发送请求并处理流式响应
   */
  const send = async (data: any) => {
    // 重置状态
    content.value = ''
    error.value = null
    streaming.value = true
    typewriterQueue = []

    if (typewriterTimer) {
      clearTimeout(typewriterTimer)
      typewriterTimer = null
    }

    // 创建新的 AbortController
    abortController = new AbortController()

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: method === 'POST' ? JSON.stringify(data) : undefined,
        signal: abortController.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Response body is not readable')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        // 解码数据块
        buffer += decoder.decode(value, { stream: true })

        // 处理完整的行
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 保留不完整的行

        for (const line of lines) {
          if (!line.trim()) continue

          try {
            // 处理 SSE 格式
            if (line.startsWith('data: ')) {
              const jsonStr = line.substring(6)

              if (jsonStr === '[DONE]') {
                continue
              }

              const parsed = JSON.parse(jsonStr)
              const chunk = parsed.content || parsed.delta || parsed.text || ''

              if (chunk) {
                startTypewriter(chunk)
                onChunk?.(chunk)
              }
            } else {
              // 普通JSON格式
              const parsed = JSON.parse(line)
              const chunk = parsed.content || parsed.delta || parsed.text || ''

              if (chunk) {
                startTypewriter(chunk)
                onChunk?.(chunk)
              }
            }
          } catch (e) {
            // 忽略解析错误，可能是不完整的数据
            console.warn('解析数据块失败:', e)
          }
        }
      }

      // 确保所有内容都已显示
      flushTypewriter()

      // 调用完成回调
      onComplete?.(content.value)
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('请求已取消')
        return
      }

      error.value = err.message || '请求失败'
      onError?.(err)
      if (error.value) {
        message.error(error.value)
      }
      throw err
    } finally {
      streaming.value = false
      abortController = null
    }
  }

  /**
   * 取消当前请求
   */
  const cancel = () => {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    streaming.value = false
    flushTypewriter()
  }

  /**
   * 清除内容
   */
  const clear = () => {
    content.value = ''
    error.value = null
    typewriterQueue = []
    if (typewriterTimer) {
      clearTimeout(typewriterTimer)
      typewriterTimer = null
    }
  }

  return {
    content,
    streaming,
    error,
    send,
    cancel,
    clear
  }
}

