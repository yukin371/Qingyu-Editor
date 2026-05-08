/**
 * Message 组件类型定义
 */

import type { VNode } from 'vue'

// Message 类型
export type MessageType = 'success' | 'info' | 'warning' | 'error'

// Message 实例接口
export interface MessageInstance {
  id: string
  message: string | VNode
  type: MessageType
  duration: number
  showClose: boolean
  center: boolean
  dangerouslyUseHTMLString: boolean
  offset: number
  onClose?: () => void
}

// Message Props 接口
export interface MessageProps {
  /**
   * 消息内容（支持 VNode）
   */
  message: string | VNode

  /**
   * 消息类型
   * @default 'info'
   */
  type?: MessageType

  /**
   * 显示时长（毫秒），0 表示不自动关闭
   * @default 3000
   */
  duration?: number

  /**
   * 是否显示关闭按钮
   * @default false
   */
  showClose?: boolean

  /**
   * 文字是否居中
   * @default false
   */
  center?: boolean

  /**
   * 是否将 message 属性作为 HTML 片段处理（谨慎使用）
   * @default false
   */
  dangerouslyUseHTMLString?: boolean

  /**
   * 距离顶部的偏移量（像素）
   * @default 20
   */
  offset?: number

  /**
   * 自定义类名
   */
  class?: any

  /**
   * 关闭时的回调函数
   */
  onClose?: () => void
}

// Message 组件默认属性
export const messageDefaults: Partial<MessageProps> = {
  type: 'info',
  duration: 3000,
  showClose: false,
  center: false,
  dangerouslyUseHTMLString: false,
  offset: 20,
}

// Message Handler 接口
export interface MessageHandler {
  /**
   * 关闭当前消息
   */
  close: () => void
}

// Message Options 接口（用于全局调用）
export interface MessageOptions extends Omit<MessageProps, 'message'> {
  /**
   * 消息内容
   */
  message?: string | VNode
}
