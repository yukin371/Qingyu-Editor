/**
 * 打字机效果组合式函数
 *
 * 实现逐字显示的打字机效果，支持速度配置和中断操作。
 * 用于AI助手面板的回复显示。
 *
 * @param text - 要显示的文本
 * @param speed - 打字速度（毫秒/字符），默认30ms
 * @returns 打字机效果控制对象
 *
 * @example
 * ```typescript
 * const { displayText, start, stop, isTyping } = useTypewriter('Hello, World!', 50)
 * start() // 开始打字
 * stop()  // 停止打字
 * ```
 *
 * @author 猫娘Kore
 * @date 2026-02-08
 */

import { ref, watch } from 'vue'

export interface UseTypewriterReturn {
  /** 当前显示的文本 */
  displayText: ReturnType<typeof ref<string>>
  /** 开始打字效果 */
  start: () => void
  /** 停止打字效果 */
  stop: () => void
  /** 是否正在打字 */
  isTyping: ReturnType<typeof ref<boolean>>
  /** 打字进度（0-1） */
  progress: ReturnType<typeof ref<number>>
}

export function useTypewriter(text: string, speed: number = 30): UseTypewriterReturn {
  const displayText = ref('')
  const isTyping = ref(false)
  const progress = ref(0)
  let timer: ReturnType<typeof setTimeout> | null = null
  let currentIndex = 0

  /**
   * 开始打字效果
   */
  function start() {
    stop() // 停止之前的打字

    if (!text) {
      displayText.value = ''
      progress.value = 0
      return
    }

    isTyping.value = true
    currentIndex = 0
    displayText.value = ''

    const typeNext = () => {
      if (currentIndex < text.length) {
        displayText.value += text[currentIndex]
        currentIndex++
        progress.value = currentIndex / text.length
        timer = setTimeout(typeNext, speed)
      } else {
        isTyping.value = false
        progress.value = 1
      }
    }

    typeNext()
  }

  /**
   * 停止打字效果
   */
  function stop() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    isTyping.value = false
  }

  // 监听text变化，自动重新开始打字
  watch(() => text, () => {
    start()
  })

  return {
    displayText,
    start,
    stop,
    isTyping,
    progress
  }
}

/**
 * 打字机效果钩子，支持配置选项
 *
 * @param options - 配置选项
 * @returns 打字机效果控制对象
 *
 * @example
 * ```typescript
 * const { displayText, start, stop, complete } = useTypewriterAdvanced({
 *   text: 'Hello',
 *   speed: 50,
 *   autoStart: true
 * })
 * ```
 */
export interface UseTypewriterOptions {
  /** 要显示的文本 */
  text: string
  /** 打字速度（毫秒/字符） */
  speed?: number
  /** 是否自动开始 */
  autoStart?: boolean
  /** 打字完成后的回调 */
  onComplete?: () => void
  /** 字符之间的随机延迟范围（ms） */
  randomDelay?: [number, number]
}

export interface UseTypewriterAdvancedReturn {
  /** 当前显示的文本 */
  displayText: ReturnType<typeof ref<string>>
  /** 开始打字效果 */
  start: () => void
  /** 停止打字效果 */
  stop: () => void
  /** 立即完成打字效果 */
  complete: () => void
  /** 是否正在打字 */
  isTyping: ReturnType<typeof ref<boolean>>
  /** 打字进度（0-1） */
  progress: ReturnType<typeof ref<number>>
  /** 设置新的文本并重新开始 */
  setText: (text: string) => void
}

export function useTypewriterAdvanced(options: UseTypewriterOptions): UseTypewriterAdvancedReturn {
  const {
    text: initialText,
    speed = 30,
    autoStart = false,
    onComplete,
    randomDelay
  } = options

  const displayText = ref('')
  const isTyping = ref(false)
  const progress = ref(0)
  const currentText = ref(initialText)

  let timer: ReturnType<typeof setTimeout> | null = null
  let currentIndex = 0

  /**
   * 获取下一个字符的延迟时间
   */
  function getNextDelay(): number {
    if (randomDelay) {
      const [min, max] = randomDelay
      return speed + Math.random() * (max - min)
    }
    return speed
  }

  /**
   * 开始打字效果
   */
  function start() {
    stop()

    if (!currentText.value) {
      displayText.value = ''
      progress.value = 0
      return
    }

    isTyping.value = true
    currentIndex = 0
    displayText.value = ''

    const typeNext = () => {
      if (currentIndex < currentText.value.length) {
        displayText.value += currentText.value[currentIndex]
        currentIndex++
        progress.value = currentIndex / currentText.value.length
        timer = setTimeout(typeNext, getNextDelay())
      } else {
        isTyping.value = false
        progress.value = 1
        onComplete?.()
      }
    }

    typeNext()
  }

  /**
   * 停止打字效果
   */
  function stop() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    isTyping.value = false
  }

  /**
   * 立即完成打字效果
   */
  function complete() {
    stop()
    displayText.value = currentText.value
    currentIndex = currentText.value.length
    progress.value = 1
    isTyping.value = false
  }

  /**
   * 设置新的文本并重新开始
   */
  function setText(newText: string) {
    currentText.value = newText
    if (autoStart) {
      start()
    }
  }

  // 自动开始
  if (autoStart) {
    start()
  }

  return {
    displayText,
    start,
    stop,
    complete,
    isTyping,
    progress,
    setText
  }
}
