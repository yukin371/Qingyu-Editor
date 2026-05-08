/**
 * 通知系统类型定义
 */

/**
 * 通知类型
 */
export type NotificationType =
  | 'system'       // 系统通知
  | 'comment'      // 评论回复
  | 'like'         // 点赞
  | 'follow'       // 关注
  | 'reward'       // 打赏
  | 'vip'          // VIP相关
  | 'achievement'  // 成就解锁
  | 'book_update'  // 书籍更新
  | 'mention'      // @提醒

/**
 * 通知优先级
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

/**
 * 通知消息
 */
export interface NotificationMessage {
  id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  content: string
  data?: NotificationData
  userId: string
  isRead: boolean
  createdAt: string
  expireAt?: string
}

/**
 * 通知附加数据
 */
export interface NotificationData {
  // 关联的信息
  relatedId?: string        // 关联的内容ID（书籍、章节等）
  relatedUserId?: string    // 关联的用户ID（操作者）
  relatedType?: string      // 关联类型

  // 书籍相关
  bookId?: string
  bookTitle?: string
  bookCover?: string

  // 章节相关
  chapterId?: string
  chapterTitle?: string

  // 用户相关
  userId?: string
  username?: string
  userAvatar?: string

  // 打赏相关
  amount?: number

  // 成就相关
  achievementId?: string
  achievementName?: string
  achievementIcon?: string

  // 自定义数据
  [key: string]: any
}

/**
 * 通知查询参数
 */
export interface NotificationQuery {
  type?: NotificationType
  isRead?: boolean
  page?: number
  size?: number
  startDate?: string
  endDate?: string
  priority?: NotificationPriority
}

/**
 * 通知统计
 */
export interface NotificationStats {
  total: number           // 总消息数
  unread: number          // 未读消息数
  byType: Record<NotificationType, number>  // 按类型分组统计
  byPriority: Record<NotificationPriority, number>  // 按优先级分组统计
}

/**
 * 通知设置
 */
export interface NotificationSettings {
  // 启用的通知类型
  enabledTypes: NotificationType[]

  // 是否允许桌面通知
  enableDesktop: boolean

  // 是否允许声音提示
  enableSound: boolean

  // 免打扰时段
  doNotDisturb?: {
    enabled: boolean
    startTime: string  // HH:mm 格式
    endTime: string    // HH:mm 格式
  }

  // 按类型的通知设置
  typeSettings: Partial<Record<NotificationType, {
    enable: boolean
    enableDesktop: boolean
    enableSound: boolean
  }>>
}

/**
 * WebSocket 消息格式
 */
export interface WSMessage {
  type: 'notification' | 'ping' | 'pong' | 'system'
  data?: any
  timestamp?: number
}

/**
 * 批量操作结果
 */
export interface BatchNotificationResult {
  success: boolean
  affected: number
  failed: string[]
}
