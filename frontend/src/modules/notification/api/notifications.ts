/**
 * 通知系统 API
 */
import request from '../request'

// 通知类型
export type NotificationType = 'system' | 'comment' | 'like' | 'follow' | 'message' | 'achievement'

// 通知状态
export type NotificationStatus = 'unread' | 'read' | 'deleted'

// 通知优先级
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

// 通知渠道
export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push'

// 通知
export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  content: string
  data?: Record<string, any>
  priority: NotificationPriority
  channels: NotificationChannel[]
  status: NotificationStatus
  read_at?: string
  created_at: string
  expires_at?: string
}

// 通知偏好
export interface NotificationPreference {
  user_id: string
  channel_enabled: Record<NotificationChannel, boolean>
  type_enabled: Record<NotificationType, boolean>
  quiet_hours_start?: string
  quiet_hours_end?: string
}

// 通知统计
export interface NotificationStats {
  total: number
  unread: number
  by_type: Record<NotificationType, number>
}

/**
 * 获取通知列表
 * @description 获取当前用户的通知列表，支持按类型和状态筛选，支持分页
 * @endpoint GET /api/v1/notifications
 * @category notification
 * @tags 通知相关
 * @param {number} params.page - 页码（默认1）
 * @param {number} params.page_size - 每页数量（默认10）
 * @param {NotificationType} params.type - 通知类型（system/comment/like/follow/message/achievement）
 * @param {NotificationStatus} params.status - 通知状态（unread/read/deleted）
 * @response {NotificationListResponse} 200 - 成功返回通知列表
 * @security BearerAuth
 */
export function getNotifications(params: {
  page?: number
  page_size?: number
  type?: NotificationType
  status?: NotificationStatus
}) {
  return request<{
    items: Notification[]
    total: number
    page: number
    page_size: number
  }>({
    url: '/api/v1/notifications',
    method: 'get',
    params
  })
}

/**
 * 获取未读通知数量
 * @description 获取当前用户的未读通知总数，用于显示红点提示
 * @endpoint GET /api/v1/notifications/unread-count
 * @category notification
 * @tags 通知相关
 * @response {UnreadCountResponse} 200 - 成功返回未读通知数量
 * @security BearerAuth
 */
export function getUnreadCount() {
  return request<{ count: number }>({
    url: '/api/v1/notifications/unread-count',
    method: 'get'
  })
}

/**
 * 获取通知统计
 * @description 获取当前用户的通知统计数据，包括总数、未读数和各类型分布
 * @endpoint GET /api/v1/notifications/stats
 * @category notification
 * @tags 通知相关
 * @response {NotificationStats} 200 - 成功返回通知统计信息
 * @security BearerAuth
 */
export function getNotificationStats() {
  return request<NotificationStats>({
    url: '/api/v1/notifications/stats',
    method: 'get'
  })
}

/**
 * 标记通知为已读
 * @description 将指定的单个通知标记为已读状态
 * @endpoint POST /api/v1/notifications/:notificationId/read
 * @category notification
 * @tags 通知相关
 * @param {string} notificationId - 通知ID
 * @response {SuccessResponse} 200 - 成功返回操作结果
 * @security BearerAuth
 */
export function markAsRead(notificationId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/notifications/${notificationId}/read`,
    method: 'post'
  })
}

/**
 * 批量标记为已读
 * @description 将多个通知批量标记为已读状态
 * @endpoint POST /api/v1/notifications/batch-read
 * @category notification
 * @tags 通知相关
 * @param {string[]} notificationIds - 通知ID数组
 * @response {BatchSuccessResponse} 200 - 成功返回操作结果和影响数量
 * @security BearerAuth
 */
export function markMultipleAsRead(notificationIds: string[]) {
  return request<{ success: boolean; count: number }>({
    url: '/api/v1/notifications/batch-read',
    method: 'post',
    data: { notification_ids: notificationIds }
  })
}

/**
 * 标记所有通知为已读
 * @description 将当前用户的所有未读通知标记为已读状态
 * @endpoint POST /api/v1/notifications/read-all
 * @category notification
 * @tags 通知相关
 * @response {BatchSuccessResponse} 200 - 成功返回操作结果和影响数量
 * @security BearerAuth
 */
export function markAllAsRead() {
  return request<{ success: boolean; count: number }>({
    url: '/api/v1/notifications/read-all',
    method: 'post'
  })
}

/**
 * 删除通知
 * @description 删除指定的单个通知
 * @endpoint DELETE /api/v1/notifications/:notificationId
 * @category notification
 * @tags 通知相关
 * @param {string} notificationId - 通知ID
 * @response {SuccessResponse} 200 - 成功返回操作结果
 * @security BearerAuth
 */
export function deleteNotification(notificationId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/notifications/${notificationId}`,
    method: 'delete'
  })
}

/**
 * 批量删除通知
 * @description 批量删除多个通知
 * @endpoint POST /api/v1/notifications/batch-delete
 * @category notification
 * @tags 通知相关
 * @param {string[]} notificationIds - 通知ID数组
 * @response {BatchSuccessResponse} 200 - 成功返回操作结果和影响数量
 * @security BearerAuth
 */
export function deleteMultipleNotifications(notificationIds: string[]) {
  return request<{ success: boolean; count: number }>({
    url: '/api/v1/notifications/batch-delete',
    method: 'post',
    data: { notification_ids: notificationIds }
  })
}

/**
 * 清空所有已读通知
 * @description 清空当前用户的所有已读通知
 * @endpoint POST /api/v1/notifications/clear-read
 * @category notification
 * @tags 通知相关
 * @response {BatchSuccessResponse} 200 - 成功返回操作结果和影响数量
 * @security BearerAuth
 */
export function clearReadNotifications() {
  return request<{ success: boolean; count: number }>({
    url: '/api/v1/notifications/clear-read',
    method: 'post'
  })
}

/**
 * 获取通知偏好设置
 * @description 获取当前用户的通知偏好设置，包括渠道开关和类型开关
 * @endpoint GET /api/v1/notifications/preferences
 * @category notification
 * @tags 通知相关
 * @response {NotificationPreference} 200 - 成功返回通知偏好设置
 * @security BearerAuth
 */
export function getNotificationPreference() {
  return request<NotificationPreference>({
    url: '/api/v1/notifications/preferences',
    method: 'get'
  })
}

/**
 * 更新通知偏好设置
 * @description 更新当前用户的通知偏好设置，包括渠道开关和类型开关
 * @endpoint PUT /api/v1/notifications/preferences
 * @category notification
 * @tags 通知相关
 * @param {Partial<NotificationPreference>} data - 通知偏好设置数据
 * @param {Record<NotificationChannel, boolean>} data.channel_enabled - 渠道开关设置
 * @param {Record<NotificationType, boolean>} data.type_enabled - 类型开关设置
 * @param {string} data.quiet_hours_start - 免打扰开始时间（可选）
 * @param {string} data.quiet_hours_end - 免打扰结束时间（可选）
 * @response {NotificationPreference} 200 - 成功返回更新后的通知偏好设置
 * @security BearerAuth
 */
export function updateNotificationPreference(data: Partial<NotificationPreference>) {
  return request<NotificationPreference>({
    url: '/api/v1/notifications/preferences',
    method: 'put',
    data
  })
}

/**
 * 重新发送通知
 * @description 通过指定渠道重新发送已存在的通知
 * @endpoint POST /api/v1/notifications/:notificationId/resend
 * @category notification
 * @tags 通知相关
 * @param {string} notificationId - 通知ID
 * @param {NotificationChannel[]} channels - 发送渠道数组（in_app/email/sms/push）
 * @response {SuccessResponse} 200 - 成功返回操作结果
 * @security BearerAuth
 */
export function resendNotification(notificationId: string, channels: NotificationChannel[]) {
  return request<{ success: boolean }>({
    url: `/api/v1/notifications/${notificationId}/resend`,
    method: 'post',
    data: { channels }
  })
}

/**
 * 获取WebSocket端点
 * @description 获取实时通知推送的 WebSocket 连接端点地址
 * @endpoint GET /api/v1/notifications/ws-endpoint
 * @category notification
 * @tags 通知相关
 * @response {WebSocketEndpointResponse} 200 - 成功返回 WebSocket 端点地址
 * @security BearerAuth
 */
export function getWebSocketEndpoint() {
  return request<{ url: string }>({
    url: '/api/v1/notifications/ws-endpoint',
    method: 'get'
  })
}
