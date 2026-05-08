/**
 * useReadingProgress
 * TDD Phase 3.4: 阅读进度保存功能
 *
 * 功能:
 * - T3.4: 3秒间隔自动保存
 * - T3.5: 页面关闭前flush保存
 * - LocalStorage异常处理
 * - 忽略<1%的进度变化
 */

import { ref, computed, getCurrentInstance, onMounted, onUnmounted } from 'vue'
import { useDebounce } from './useDebounce'
import { useStorage } from './useStorage'

/**
 * 阅读进度数据结构
 */
export interface ReadingProgressData {
  progress: number
  scrollY: number
  timestamp: number
  chapterId: string
}

/**
 * 阅读进度选项
 */
export interface ReadingProgressOptions {
  bookId: string
  chapterId: string
  autoSave?: boolean
  saveInterval?: number
}

/**
 * 阅读进度Composable
 */
export function useReadingProgress(options: ReadingProgressOptions) {
  const {
    bookId,
    chapterId,
    autoSave = true,
    saveInterval = 3000, // 默认3秒
  } = options

  // 响应式状态
  const currentProgressValue = ref(0)
  const currentScrollY = ref(0)
  const normalizeProgress = (value: number) => Math.max(0, Math.min(100, value))

  const currentProgress = computed({
    get: () => currentProgressValue.value,
    set: (value: number) => {
      currentProgressValue.value = normalizeProgress(value)
    },
  })

  // Storage key
  const storageKey = `reading-progress:${bookId}:${chapterId}`

  // 使用useStorage进行持久化
  const storage = useStorage<ReadingProgressData>(storageKey, {
    progress: 0,
    scrollY: 0,
    timestamp: -1,
    chapterId,
  })

  // 加载进度
  const loadProgress = (): ReadingProgressData | null => {
    storage.load()
    const data = storage.data.value
    if (data && data.timestamp >= 0) {
      currentProgress.value = data.progress
      currentScrollY.value = data.scrollY
      return data
    }
    return null
  }

  // T3.4: 使用useDebounce创建防抖保存函数
  const { debouncedFn: saveProgressDebounced, flush } = useDebounce(
    (progress: number, scrollY: number) => {
      if (!autoSave) return

      // P1优化：检查变化是否有意义（<1%忽略）
      const last = loadProgress()
      if (last && Math.abs(last.progress - progress) < 1) {
        return
      }

      // 限制范围
      const normalizedProgress = normalizeProgress(progress)

      // 更新状态
      const data: ReadingProgressData = {
        progress: normalizedProgress,
        scrollY,
        timestamp: Date.now(),
        chapterId,
      }

      // 保存到storage
      storage.data.value = data
      storage.save()

      // 更新响应式状态
      currentProgress.value = normalizedProgress
      currentScrollY.value = scrollY
    },
    saveInterval,
  )

  // 对外暴露的保存进度函数
  const saveProgress = (progress?: number, scrollY?: number) => {
    if (progress !== undefined && scrollY !== undefined) {
      saveProgressDebounced(progress, scrollY)
    } else {
      // 不传参数时使用当前值
      saveProgressDebounced(currentProgress.value, currentScrollY.value)
    }
  }

  // 定时保存
  let saveTimer: number | null = null

  const startAutoSave = () => {
    if (saveTimer) clearInterval(saveTimer)

    // T3.4: 定时保存间隔3秒
    saveTimer = window.setInterval(() => {
      flush()
    }, saveInterval)
  }

  const stopAutoSave = () => {
    if (saveTimer) {
      clearInterval(saveTimer)
      saveTimer = null
    }
  }

  // T3.5: 页面关闭前flush保存
  const handleBeforeUnload = () => {
    flush()
  }

  // 生命周期管理
  if (getCurrentInstance()) {
    onMounted(() => {
      // 加载已保存的进度
      loadProgress()

      // 启动自动保存
      if (autoSave) {
        startAutoSave()
      }

      // 监听页面关闭事件
      window.addEventListener('beforeunload', handleBeforeUnload)
    })

    onUnmounted(() => {
      // 组件卸载前保存进度
      flush()

      // 停止自动保存
      stopAutoSave()

      // 移除事件监听
      window.removeEventListener('beforeunload', handleBeforeUnload)
    })
  }

  return {
    currentProgress,
    currentScrollY,
    saveProgress,
    loadProgress,
    startAutoSave,
    stopAutoSave,
    flush,
  }
}
