// src/core/services/error-reporter.ts

import type { ErrorResponse } from '@/types/error.types'

/**
 * 错误上报数据
 */
interface ErrorReport {
  errorCode: number
  errorMessage: string
  errorType: string
  url: string
  userAgent: string
  userId?: string
  timestamp: string
  details?: Record<string, unknown>
}

/**
 * 错误上报服务
 */
class ErrorReporter {
  private endpoint = '/api/v1/errors/report'
  private queue: ErrorReport[] = []
  private maxQueueSize = 10
  private flushInterval = 30000 // 30 秒

  /**
   * 上报错误
   */
  report(error: ErrorResponse, context?: { userId?: string; url?: string }) {
    const report: ErrorReport = {
      errorCode: error.code,
      errorMessage: error.message,
      errorType: error.error,
      url: context?.url || window.location.href,
      userAgent: navigator.userAgent,
      userId: context?.userId || this.getUserId(),
      timestamp: error.timestamp || new Date().toISOString(),
      details: error.details
    }

    this.queue.push(report)

    // 达到批量上报阈值
    if (this.queue.length >= this.maxQueueSize) {
      this.flush()
    }
  }

  /**
   * 立即上报队列中的错误
   */
  async flush() {
    if (this.queue.length === 0) return

    const errors = [...this.queue]
    this.queue = []

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ errors }),
        keepalive: true // 使用 keepalive 确保页面关闭时也能上报
      })
    } catch (err) {
      // 上报失败，重新加入队列
      this.queue.unshift(...errors)
      console.error('Failed to report errors:', err)
    }
  }

  /**
   * 获取用户 ID
   */
  private getUserId(): string | undefined {
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        return user.id
      }
    } catch {
      // 忽略错误
    }
    return undefined
  }

  /**
   * 启动定时上报
   */
  start() {
    // 页面卸载时上报
    window.addEventListener('beforeunload', () => {
      this.flush()
    })

    // 定时上报
    setInterval(() => {
      this.flush()
    }, this.flushInterval)
  }
}

// 导出单例
export const errorReporter = new ErrorReporter()

// 自动启动（仅生产环境）
if (import.meta.env.PROD) {
  errorReporter.start()
}
