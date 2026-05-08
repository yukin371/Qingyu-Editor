/**
 * Notification 组件类型定义
 */

import type { VNode } from 'vue'

// Notification 类型
export type NotificationType = 'success' | 'info' | 'warning' | 'error'

// Notification 位置
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

// Notification 实例接口
export interface NotificationInstance {
  id: string
  title?: string
  message: string | VNode
  type: NotificationType
  duration: number
  position: NotificationPosition
  showClose: boolean
  onClick?: () => void
  onClose?: () => void
}

// Notification Props 接口
export interface NotificationProps {
  /**
   * 通知标题
   */
  title?: string

  /**
   * 通知内容（支持 VNode）
   */
  message: string | VNode

  /**
   * 通知类型
   * @default 'info'
   */
  type?: NotificationType

  /**
   * 显示时长（毫秒），0 表示不自动关闭
   * @default 4500
   */
  duration?: number

  /**
   * 显示位置
   * @default 'top-right'
   */
  position?: NotificationPosition

  /**
   * 是否显示关闭按钮
   * @default true
   */
  showClose?: boolean

  /**
   * 点击通知时的回调函数
   */
  onClick?: () => void

  /**
   * 关闭时的回调函数
   */
  onClose?: () => void

  /**
   * 自定义类名
   */
  class?: string

  /**
   * 是否将 message 属性作为 HTML 片段处理（谨慎使用）
   * @default false
   */
  dangerouslyUseHTMLString?: boolean

  /**
   * 自定义图标
   */
  customIcon?: string | VNode
}

// Notification 组件默认属性
export const notificationDefaults: Partial<NotificationProps> = {
  type: 'info',
  duration: 4500,
  position: 'top-right',
  showClose: true,
  dangerouslyUseHTMLString: false,
}

// Notification Handler 接口
export interface NotificationHandler {
  /**
   * 关闭当前通知
   */
  close: () => void
}

// Notification Options 接口（用于全局调用）
export interface NotificationOptions extends Omit<NotificationProps, 'message'> {
  /**
   * 通知内容
   */
  message?: string | VNode
}

// Notification Config 接口（全局配置）
export interface NotificationConfig {
  /**
   * 默认显示位置
   */
  position?: NotificationPosition

  /**
   * 默认显示时长
   */
  duration?: number

  /**
   * 最大同时显示数量
   */
  maxCount?: number

  /**
   * 偏移量（像素）
   */
  offset?: number
}
