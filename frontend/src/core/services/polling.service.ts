/**
 * 轮询降级服务
 * 当 WebSocket 不可用时使用轮询方式获取消息
 */
import type { AxiosInstance } from 'axios'
import { useWebSocketStore } from '@/stores/websocket.store'

export interface PollingConfig {
  axios: AxiosInstance
  endpoint: string  // 轮询的 API 端点
  interval?: number  // 轮询间隔（毫秒）
  maxInterval?: number  // 最大轮询间隔（毫秒）
  minInterval?: number  // 最小轮询间隔（毫秒）
  adaptive?: boolean  // 是否启用自适应间隔
  onMessage?: (messages: any[]) => void
  onError?: (error: any) => void
}

export class PollingService {
  private config: Required<Omit<PollingConfig, 'axios'>> & { axios: AxiosInstance }
  private timer: number | null = null
  private currentInterval: number
  private isActive = false
  private lastMessageCount = 0
  private emptyPollCount = 0
  private websocketStore = useWebSocketStore()

  constructor(config: PollingConfig) {
    this.currentInterval = config.interval ?? 30000

    this.config = {
      axios: config.axios,
      endpoint: config.endpoint,
      interval: config.interval ?? 30000,
      maxInterval: config.maxInterval ?? 120000,
      minInterval: config.minInterval ?? 10000,
      adaptive: config.adaptive ?? true,
      onMessage: config.onMessage ?? (() => {}),
      onError: config.onError ?? (() => {})
    }
  }

  /**
   * 启动轮询
   */
  start(): void {
    // 如果WebSocket已连接或正在连接，跳过轮询启动
    if (this.websocketStore.isConnected || !this.shouldUsePolling()) {
      console.log('[Polling] WebSocket已连接或正在连接，跳过轮询启动')
      return
    }

    if (this.isActive) {
      console.log('[Polling] 轮询已在运行')
      return
    }

    this.isActive = true
    console.log('[Polling] 启动轮询，间隔:', this.currentInterval)

    // 立即执行一次
    this.poll()

    // 启动定时器
    this.scheduleNext()
  }

  /**
   * 停止轮询
   */
  stop(): void {
    this.isActive = false
    this.clearTimer()
    console.log('[Polling] 停止轮询')
  }

  /**
   * 调整轮询间隔
   */
  adjustInterval(interval: number): void {
    const clampedInterval = Math.max(
      this.config.minInterval,
      Math.min(this.config.maxInterval, interval)
    )

    if (this.currentInterval !== clampedInterval) {
      console.log('[Polling] 调整轮询间隔:', this.currentInterval, '->', clampedInterval)
      this.currentInterval = clampedInterval

      // 如果轮询正在运行，重启以应用新间隔
      if (this.isActive) {
        this.stop()
        this.start()
      }
    }
  }

  /**
   * 是否正在运行
   */
  isRunning(): boolean {
    return this.isActive
  }

  /**
   * 是否应该使用轮询
   * 当WebSocket未连接且未正在连接时返回true
   */
  shouldUsePolling(): boolean {
    return !this.websocketStore.isConnected
  }

  /**
   * 执行轮询请求
   */
  private async poll(): Promise<void> {
    if (!this.isActive) {
      return
    }

    try {
      const response = await this.config.axios.get(this.config.endpoint, {
        params: {
          since: this.lastMessageCount > 0 ? Date.now() - this.currentInterval * 2 : undefined
        },
        timeout: 10000  // 10秒超时
      })

      if (response.data?.code === 200) {
        const messages = response.data.data?.messages || []

        if (messages.length > 0) {
          this.lastMessageCount = messages.length
          this.emptyPollCount = 0
          this.config.onMessage(messages)

          // 有新消息时，加快轮询频率
          if (this.config.adaptive) {
            this.adjustInterval(this.config.minInterval)
          }
        } else {
          this.emptyPollCount++

          // 连续多次无新消息，降低轮询频率
          if (this.config.adaptive && this.emptyPollCount >= 3) {
            this.adjustInterval(Math.min(
              this.currentInterval * 1.5,
              this.config.maxInterval
            ))
          }
        }
      }
    } catch (error: any) {
      console.error('[Polling] 轮询请求失败:', error)

      // 网络错误时，降低轮询频率
      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
        if (this.config.adaptive) {
          this.adjustInterval(Math.min(
            this.currentInterval * 2,
            this.config.maxInterval
          ))
        }
      }

      this.config.onError(error)
    }
  }

  /**
   * 安排下一次轮询
   */
  private scheduleNext(): void {
    this.clearTimer()

    this.timer = window.setTimeout(() => {
      this.poll().then(() => {
        if (this.isActive) {
          this.scheduleNext()
        }
      })
    }, this.currentInterval)
  }

  /**
   * 清除定时器
   */
  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
}

/**
 * 创建轮询服务实例
 */
export function createPollingService(config: PollingConfig): PollingService {
  return new PollingService(config)
}
