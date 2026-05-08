/**
 * LocalStorage管理组合式函数
 *
 * 提供类型安全的LocalStorage操作，包含异常处理和配额检查。
 * 专门用于AI助手面板的对话历史存储。
 *
 * @template T - 存储数据的类型
 * @param key - 存储键名
 * @param defaultValue - 默认值
 * @returns LocalStorage操作对象
 *
 * @example
 * ```typescript
 * const { data, save, load, clear, error } = useLocalStorage('ai-chat-session-1', [])
 * ```
 *
 * @author 猫娘Kore
 * @date 2026-02-08
 */

import { ref, watch, type Ref, type ShallowRef, shallowRef } from 'vue'

export interface UseLocalStorageReturn<T> {
  /** 存储的数据 */
  data: ShallowRef<T>
  /** 保存数据到LocalStorage */
  save: () => void
  /** 从LocalStorage加载数据 */
  load: () => void
  /** 清空数据 */
  clear: () => void
  /** 错误信息 */
  error: Ref<Error | null>
}

export function useLocalStorage<T>(key: string, defaultValue: T): UseLocalStorageReturn<T> {
  const data = shallowRef<T>(defaultValue) as ShallowRef<T>
  const error = ref<Error | null>(null)

  /**
   * 清理最旧的数据（保留最新的70%）
   */
  function cleanupOldData() {
    try {
      const allKeys = Object.keys(localStorage)
      const deleteCount = Math.max(1, Math.floor(allKeys.length * 0.3))

      // 删除最旧的数据（按key排序）
      const sortedKeys = allKeys.filter(k => k.startsWith('ai-chat-')).sort()
      for (let i = 0; i < deleteCount && i < sortedKeys.length; i++) {
        localStorage.removeItem(sortedKeys[i])
      }
    } catch (e) {
      console.warn('[useLocalStorage] Cleanup failed:', e)
    }
  }

  /**
   * 保存数据到LocalStorage
   */
  function save() {
    try {
      error.value = null
      localStorage.setItem(key, JSON.stringify(data.value))
    } catch (e) {
      const err = e as Error
      if (err.name === 'QuotaExceededError') {
        // 清理旧数据后重试
        cleanupOldData()
        try {
          localStorage.setItem(key, JSON.stringify(data.value))
        } catch (retryError) {
          error.value = retryError as Error
          console.warn('[useLocalStorage] Failed after cleanup:', retryError)
        }
      } else {
        error.value = err
        console.error('[useLocalStorage] Save error:', e)
      }
    }
  }

  /**
   * 从LocalStorage加载数据
   */
  function load() {
    try {
      error.value = null
      const item = localStorage.getItem(key)
      if (item !== null) {
        data.value = JSON.parse(item) as T
      }
    } catch (e) {
      error.value = e as Error
      console.error('[useLocalStorage] Load error:', e)
    }
  }

  /**
   * 清空数据
   */
  function clear() {
    try {
      error.value = null
      data.value = defaultValue
      localStorage.removeItem(key)
    } catch (e) {
      error.value = e as Error
      console.error('[useLocalStorage] Clear error:', e)
    }
  }

  // 初始加载
  load()

  // 监听数据变化，自动保存
  watch(data, () => {
    save()
  }, { deep: true })

  return {
    data,
    save,
    load,
    clear,
    error
  }
}
