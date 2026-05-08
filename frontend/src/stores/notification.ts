/**
 * 通知状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { NotificationMessage, NotificationQuery, NotificationStats } from '@/types/notification'
import { getNotificationService } from '@/modules/notification/services/notification.service'

export const useNotificationStore = defineStore('notification', () => {
  // 状态
  const notifications = ref<NotificationMessage[]>([])
  const stats = ref<NotificationStats>({
    total: 0,
    unread: 0,
    byType: {
      system: 0,
      comment: 0,
      like: 0,
      follow: 0,
      reward: 0,
      vip: 0,
      achievement: 0,
      book_update: 0,
      mention: 0
    },
    byPriority: {
      low: 0,
      normal: 0,
      high: 0,
      urgent: 0
    }
  })

  const isLoading = ref(false)
  const isConnected = ref(false)
  const connectionMode = ref<'websocket' | 'polling'>('websocket')
  const currentType = ref<string>('all')

  // 服务实例
  let service: ReturnType<typeof getNotificationService> | null = null
  let unsubscribeHandler: (() => void) | null = null
  let isInitializing = false

  // Getters
  const unreadCount = computed(() => stats.value.unread)

  const unreadNotifications = computed(() => {
    return notifications.value.filter(n => !n.isRead)
  })

  const highPriorityNotifications = computed(() => {
    return notifications.value.filter(
      n => !n.isRead && (n.priority === 'high' || n.priority === 'urgent')
    )
  })

  const notificationsByType = computed(() => {
    return (type: string) => {
      if (type === 'all') {
        return notifications.value
      }
      return notifications.value.filter(n => n.type === type)
    }
  })

  // Actions
  async function initialize() {
    if (service) return
    if (isInitializing) return

    isInitializing = true

    try {
      service = getNotificationService()
      await service.initialize()

      // 订阅消息
      unsubscribeHandler = service.onMessage((message) => {
        // 新消息添加到列表顶部
        notifications.value.unshift(message)

        // 更新统计
        updateStatsWithNewMessage(message)

        // 播放提示音（可选）
        playNotificationSound()
      })

      isConnected.value = true
      connectionMode.value = service.getConnectionMode()

      // 加载初始数据
      await fetchNotifications()
      await fetchStats()
    } catch (error) {
      console.error('[NotificationStore] 初始化失败:', error)
      isConnected.value = false
    } finally {
      isInitializing = false
    }
  }

  async function fetchNotifications(params?: NotificationQuery) {
    if (!service) {
      await initialize()
    }

    isLoading.value = true
    try {
      if (service) {
        const result = await service.getNotifications({
          type: currentType.value !== 'all' ? currentType.value as any : undefined,
          ...params
        })
        notifications.value = result.list
      }
    } catch (error: any) {
      console.error('[NotificationStore] 加载通知失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchStats() {
    try {
      if (service) {
        const result = await service.getNotificationStats()
        stats.value = result
      }
    } catch (error) {
      console.error('[NotificationStore] 加载统计失败:', error)
    }
  }

  async function markAsRead(notificationId: string) {
    if (!service) return

    try {
      const success = await service.markAsRead(notificationId)

      if (success) {
        const notification = notifications.value.find(n => n.id === notificationId)
        if (notification && !notification.isRead) {
          notification.isRead = true
          stats.value.unread--
          stats.value.byType[notification.type]--
          stats.value.byPriority[notification.priority]--
        }
      }
    } catch (error) {
      console.error('[NotificationStore] 标记已读失败:', error)
    }
  }

  async function markAllAsRead(type?: string) {
    if (!service) return

    try {
      const result = await service.markAllAsRead(type)

      if (result.success) {
        // 更新本地状态
        notifications.value.forEach(n => {
          if (!type || n.type === type) {
            if (!n.isRead) {
              stats.value.unread--
              stats.value.byType[n.type]--
              stats.value.byPriority[n.priority]--
            }
            n.isRead = true
          }
        })
      }
    } catch (error) {
      console.error('[NotificationStore] 全部标记已读失败:', error)
    }
  }

  async function deleteNotification(notificationId: string) {
    if (!service) return

    try {
      const success = await service.deleteNotification(notificationId)

      if (success) {
        const index = notifications.value.findIndex(n => n.id === notificationId)
        if (index !== -1) {
          const notification = notifications.value[index]
          if (!notification.isRead) {
            stats.value.unread--
            stats.value.byType[notification.type]--
            stats.value.byPriority[notification.priority]--
          }
          notifications.value.splice(index, 1)
        }
      }
    } catch (error) {
      console.error('[NotificationStore] 删除通知失败:', error)
    }
  }

  function setType(type: string) {
    currentType.value = type
    fetchNotifications()
  }

  function updateStatsWithNewMessage(message: NotificationMessage) {
    stats.value.total++
    if (!message.isRead) {
      stats.value.unread++
      stats.value.byType[message.type]++
      stats.value.byPriority[message.priority]++
    }
  }

  function playNotificationSound() {
    // 可以在这里播放提示音
    // const audio = new Audio('/sounds/notification.mp3')
    // audio.play().catch(() => {})
  }

  function disconnect() {
    if (unsubscribeHandler) {
      unsubscribeHandler()
      unsubscribeHandler = null
    }

    if (service) {
      service.disconnect()
      service = null
    }

    isConnected.value = false
    notifications.value = []
  }

  return {
    // State
    notifications,
    stats,
    isLoading,
    isConnected,
    connectionMode,
    currentType,

    // Getters
    unreadCount,
    unreadNotifications,
    highPriorityNotifications,
    notificationsByType,

    // Actions
    initialize,
    fetchNotifications,
    fetchStats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setType,
    disconnect
  }
})
