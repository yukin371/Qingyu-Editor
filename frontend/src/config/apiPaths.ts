/**
 * API路径配置（与后端保持一致）
 *
 * 重要说明：
 * - 所有路径都基于 /api/v1 前缀
 * - Messages模块使用 /api/v1/social/messages/*
 * - WebSocket使用 /ws/messages（注意：不是 /ws/messaging）
 *
 * @todo 与后端团队确认统一的API路径规范
 * - 当前Messages模块路径: /api/v1/social/messages/*
 * - 是否需要调整为: /api/v1/messages/*
 * - 确认后需要同步更新所有相关API调用
 */
export const API_PATHS = {
  // Messages模块
  MESSAGES: {
    CONVERSATIONS: '/social/messages/conversations',
    CONVERSATION_DETAIL: (id: string) => `/social/messages/conversations/${id}`,
    MESSAGES: (conversationId: string) => `/social/messages/conversations/${conversationId}/messages`,
    SEND: '/social/messages',
    MARK_READ: (id: string) => `/social/messages/${id}/read`,
    DELETE: (id: string) => `/social/messages/${id}`,
  },

  // 评分系统
  RATINGS: {
    STATS: (targetType: string, targetId: string) => `/ratings/${targetType}/${targetId}/stats`,
    USER_RATING: (targetType: string, targetId: string) => `/ratings/${targetType}/${targetId}/user-rating`,
    CREATE: (targetType: string, targetId: string) => `/ratings/${targetType}/${targetId}`,
    UPDATE: (targetType: string, targetId: string) => `/ratings/${targetType}/${targetId}`,
    DELETE: (targetType: string, targetId: string) => `/ratings/${targetType}/${targetId}`,
  },

  // 通知系统
  NOTIFICATIONS: {
    LIST: '/notifications',
    DETAIL: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id: string) => `/notifications/${id}`,
    UNREAD_COUNT: '/notifications/unread-count',
  },

  // WebSocket
  WEBSOCKET: {
    MESSAGING: '/ws/messages',  // ✅ 注意：不是/ws/messaging
    NOTIFICATIONS: '/ws/notifications',
  },
}
