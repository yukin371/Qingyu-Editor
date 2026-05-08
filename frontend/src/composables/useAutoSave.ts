/**
 * useAutoSave - 自动保存组合函数
 *
 * 提供自动保存功能，包括防抖、状态管理、失败重试等
 */

import { ref, watch, onUnmounted, Ref } from 'vue'
import { message } from '@/design-system/services'
export interface AutoSaveOptions {
  delay?: number // 防抖延迟（毫秒）
  onSave: (data: any) => Promise<void> // 保存函数
  onSuccess?: () => void
  onError?: (error: Error) => void
  enabled?: boolean // 是否启用自动保存
  maxRetries?: number // 最大重试次数
  retryDelay?: number // 重试延迟（毫秒）
}

export interface UseAutoSaveReturn {
  saving: Ref<boolean>
  lastSaved: Ref<Date | null>
  hasUnsavedChanges: Ref<boolean>
  saveNow: () => Promise<void>
  enable: () => void
  disable: () => void
}

export function useAutoSave<T>(
  data: Ref<T>,
  options: AutoSaveOptions
): UseAutoSaveReturn {
  const {
    delay = 30000, // 默认30秒
    onSave,
    onSuccess,
    onError,
    enabled = true,
    maxRetries = 3,
    retryDelay = 2000
  } = options

  const saving = ref(false)
  const lastSaved = ref<Date | null>(null)
  const hasUnsavedChanges = ref(false)
  const isEnabled = ref(enabled)

  let saveTimer: NodeJS.Timeout | null = null
  let retryCount = 0

  /**
   * 执行保存
   */
  const performSave = async () => {
    if (saving.value || !hasUnsavedChanges.value) return

    saving.value = true
    try {
      await onSave(data.value)

      lastSaved.value = new Date()
      hasUnsavedChanges.value = false
      retryCount = 0

      onSuccess?.()
    } catch (error: any) {
      console.error('自动保存失败:', error)

      // 重试逻辑
      if (retryCount < maxRetries) {
        retryCount++
        console.log(`准备重试保存 (${retryCount}/${maxRetries})...`)

        setTimeout(() => {
          performSave()
        }, retryDelay)
      } else {
        message.error('保存失败，请手动保存')
        onError?.(error)
        retryCount = 0
      }
    } finally {
      saving.value = false
    }
  }

  /**
   * 立即保存
   */
  const saveNow = async () => {
    if (saveTimer) {
      clearTimeout(saveTimer)
      saveTimer = null
    }
    await performSave()
  }

  /**
   * 启用自动保存
   */
  const enable = () => {
    isEnabled.value = true
  }

  /**
   * 禁用自动保存
   */
  const disable = () => {
    isEnabled.value = false
    if (saveTimer) {
      clearTimeout(saveTimer)
      saveTimer = null
    }
  }

  /**
   * 监听数据变化
   */
  const stopWatch = watch(
    data,
    () => {
      if (!isEnabled.value) return

      hasUnsavedChanges.value = true

      // 清除旧的定时器
      if (saveTimer) {
        clearTimeout(saveTimer)
      }

      // 设置新的定时器
      saveTimer = setTimeout(() => {
        performSave()
      }, delay)
    },
    { deep: true }
  )

  // 清理
  onUnmounted(() => {
    if (saveTimer) {
      clearTimeout(saveTimer)
    }
    stopWatch()
  })

  return {
    saving,
    lastSaved,
    hasUnsavedChanges,
    saveNow,
    enable,
    disable
  }
}

