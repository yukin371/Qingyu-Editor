// src/composables/useErrorHandler.ts

import { ref, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { ErrorResponse } from '@/types/error.types'

/**
 * 错误处理状态
 */
interface ErrorState {
  error: ErrorResponse | null
  visible: boolean
}

/**
 * 错误处理 Composable
 */
export function useErrorHandler() {
  const state = ref<ErrorState>({
    error: null,
    visible: false
  })

  let hideTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * 显示错误信息
   */
  const showError = (error: ErrorResponse, duration = 3000) => {
    state.value.error = error
    state.value.visible = true

    ElMessage.error(error.message)

    // 清除之前的定时器，避免竞态条件
    if (hideTimer) {
      clearTimeout(hideTimer)
    }

    // 自动隐藏
    if (duration > 0) {
      hideTimer = setTimeout(() => {
        state.value.visible = false
        hideTimer = null
      }, duration)
    }
  }

  // 组件卸载时清理定时器，避免内存泄漏
  onUnmounted(() => {
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
  })

  /**
   * 处理 API 错误响应
   */
  const handleApiError = (error: unknown): ErrorResponse | null => {
    if (!error) return null

    // Axios 错误
    const axiosError = error as { response?: { data?: ErrorResponse } }
    if (axiosError.response?.data) {
      const errorResponse = axiosError.response.data
      showError(errorResponse)
      return errorResponse
    }

    // 标准错误对象
    if (error instanceof Error) {
      const errorResponse: ErrorResponse = {
        code: 5000,
        message: error.message,
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      }
      showError(errorResponse)
      return errorResponse
    }

    // 字符串错误
    if (typeof error === 'string') {
      const errorResponse: ErrorResponse = {
        code: 5000,
        message: error,
        error: 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString()
      }
      showError(errorResponse)
      return errorResponse
    }

    return null
  }

  /**
   * 清除错误状态
   */
  const clearError = () => {
    state.value.error = null
    state.value.visible = false
  }

  /**
   * 创建错误处理器
   */
  const createErrorHandler = (fallbackMessage = '操作失败') => {
    return (error: unknown) => {
      const handled = handleApiError(error)
      if (!handled) {
        ElMessage.error(fallbackMessage)
      }
    }
  }

  return {
    state,
    showError,
    handleApiError,
    clearError,
    createErrorHandler
  }
}
