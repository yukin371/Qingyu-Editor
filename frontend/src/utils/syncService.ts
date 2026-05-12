/**
 * 自动同步服务
 * 检测连接状态，网络恢复时自动刷新数据
 */

import { httpService } from '@/core/services/http.service'
import { isRemoteWriterMode } from '@/modules/writer/data-bridge/wails'

// ==================== 类型定义 ====================

export interface SyncStatus {
  isOnline: boolean
  lastSyncTime: Date | null
  isSyncing: boolean
  error: string | null
}

export type SyncCallback = () => Promise<void>

export type StatusChangeCallback = (status: SyncStatus) => void

// ==================== 同步服务 ====================

class SyncService {
  private readonly usesRemoteBackend = isRemoteWriterMode()
  private status: SyncStatus = {
    isOnline: this.usesRemoteBackend ? navigator.onLine : true,
    lastSyncTime: null,
    isSyncing: false,
    error: null,
  }

  private callbacks: SyncCallback[] = []
  private statusCallbacks: StatusChangeCallback[] = []
  private healthCheckInterval: number | null = null
  private desktopHealthInitialized = false
  private readonly HEALTH_CHECK_INTERVAL = 60000 // 60秒检查一次

  constructor() {
    this.setupNetworkListeners()
  }

  /**
   * 设置网络状态监听器
   */
  private setupNetworkListeners(): void {
    if (!this.usesRemoteBackend) {
      return
    }

    // 监听网络恢复事件
    window.addEventListener('online', () => {
      console.log('[SyncService] 网络已恢复')
      this.updateStatus({ isOnline: true, error: null })
      this.triggerSync()
    })

    // 监听网络断开事件
    window.addEventListener('offline', () => {
      console.log('[SyncService] 网络已断开')
      this.updateStatus({ isOnline: false })
    })
  }

  /**
   * 更新状态并通知监听器
   */
  private updateStatus(updates: Partial<SyncStatus>): void {
    this.status = { ...this.status, ...updates }
    this.statusCallbacks.forEach((callback) => callback(this.status))
  }

  /**
   * 触发同步
   */
  private async triggerSync(): Promise<void> {
    if (this.status.isSyncing || !this.status.isOnline) {
      return
    }

    this.updateStatus({ isSyncing: true, error: null })

    try {
      // 执行所有注册的同步回调
      for (const callback of this.callbacks) {
        await callback()
      }

      this.updateStatus({
        isSyncing: false,
        lastSyncTime: new Date(),
      })

      console.log('[SyncService] 同步完成')
    } catch (error: unknown) {
      console.error('[SyncService] 同步失败:', error)
      this.updateStatus({
        isSyncing: false,
        error: error instanceof Error ? error.message : '同步失败',
      })
    }
  }

  /**
   * 检查后端健康状态
   */
  async checkBackendHealth(): Promise<boolean> {
    if (!this.usesRemoteBackend) {
      return true
    }

    try {
      const response = await httpService.get<{ status: string }>('/health', { timeout: 5000 })
      const status = (response as any)?.status ?? (response as any)?.data?.status
      return status === 'ok'
    } catch (error) {
      console.warn('[SyncService] 后端健康检查失败:', error)
      return false
    }
  }

  /**
   * 启动定期健康检查
   */
  startHealthCheck(): void {
    if (!this.usesRemoteBackend) {
      if (this.desktopHealthInitialized) {
        return
      }

      this.desktopHealthInitialized = true
      this.updateStatus({ isOnline: true, error: null })
      void this.triggerSync()
      return
    }

    if (this.healthCheckInterval) {
      return
    }

    // 立即执行一次检查
    this.checkBackendHealth().then((isHealthy) => {
      this.updateStatus({ isOnline: isHealthy })
      if (isHealthy) {
        this.triggerSync()
      }
    })

    // 定期检查
    this.healthCheckInterval = window.setInterval(async () => {
      const isHealthy = await this.checkBackendHealth()
      const wasOffline = !this.status.isOnline

      this.updateStatus({ isOnline: isHealthy })

      // 如果从离线恢复到在线，触发同步
      if (wasOffline && isHealthy) {
        console.log('[SyncService] 检测到后端恢复，触发同步')
        this.triggerSync()
      }
    }, this.HEALTH_CHECK_INTERVAL)

    console.log('[SyncService] 健康检查已启动')
  }

  /**
   * 停止定期健康检查
   */
  stopHealthCheck(): void {
    if (!this.usesRemoteBackend) {
      this.desktopHealthInitialized = false
      return
    }

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
      console.log('[SyncService] 健康检查已停止')
    }
  }

  /**
   * 注册同步回调
   */
  onSync(callback: SyncCallback): () => void {
    this.callbacks.push(callback)

    // 返回取消注册函数
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index !== -1) {
        this.callbacks.splice(index, 1)
      }
    }
  }

  /**
   * 注册状态变化回调
   */
  onStatusChange(callback: StatusChangeCallback): () => void {
    this.statusCallbacks.push(callback)

    // 立即通知当前状态
    callback(this.status)

    // 返回取消注册函数
    return () => {
      const index = this.statusCallbacks.indexOf(callback)
      if (index !== -1) {
        this.statusCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * 获取当前状态
   */
  getStatus(): SyncStatus {
    return { ...this.status }
  }

  /**
   * 手动触发同步
   */
  async syncNow(): Promise<void> {
    await this.triggerSync()
  }

  /**
   * 强制刷新数据（网络恢复后调用）
   */
  async refreshAfterReconnect(): Promise<void> {
    console.log('[SyncService] 连接恢复后刷新数据')
    await this.triggerSync()
  }
}

// 导出单例
export const syncService = new SyncService()

// ==================== Vue Composable ====================

import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 使用同步服务的 Vue Composable
 */
export function useSyncService() {
  const status = ref<SyncStatus>(syncService.getStatus())
  let unregisterStatus: (() => void) | null = null

  const syncNow = async () => {
    await syncService.syncNow()
  }

  const onSync = (callback: SyncCallback) => {
    return syncService.onSync(callback)
  }

  onMounted(() => {
    unregisterStatus = syncService.onStatusChange((newStatus) => {
      status.value = newStatus
    })
  })

  onUnmounted(() => {
    if (unregisterStatus) {
      unregisterStatus()
    }
  })

  return {
    status,
    syncNow,
    onSync,
    isOnline: () => status.value.isOnline,
    isSyncing: () => status.value.isSyncing,
  }
}
