export class PollingService {
  private timer: ReturnType<typeof setInterval> | null = null
  private isPolling = false

  /**
   * 开始轮询
   * @param callback 轮询回调函数
   * @param interval 轮询间隔（毫秒）
   */
  start(callback: () => void, interval: number = 5000) {
    if (this.isPolling) {
      if (import.meta.env.DEV) console.warn('[Polling] 已经在轮询中')
      return
    }

    this.isPolling = true
    this.timer = setInterval(callback, interval)
  }

  /**
   * 停止轮询
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.isPolling = false
  }

  /**
   * 获取轮询状态
   */
  isRunning() {
    return this.isPolling
  }
}

export const pollingService = new PollingService()
