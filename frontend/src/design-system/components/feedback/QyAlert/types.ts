/**
 * QyAlert component type definitions
 *
 * 与 Element Plus El-Alert API 兼容
 */

import type { AlertVariants } from './variants'

/**
 * 警告类型（从 CVA 推导）
 */
export type QyAlertType = AlertVariants['type']

/**
 * QyAlert Props 接口
 */
export interface QyAlertProps {
  /**
   * 警告类型
   * @default 'info'
   */
  type?: QyAlertType

  /**
   * 标题
   */
  title?: string

  /**
   * 描述内容
   */
  description?: string

  /**
   * 是否可关闭
   * @default true
   */
  closable?: boolean

  /**
   * 关闭按钮自定义文本
   */
  closeText?: string

  /**
   * 是否显示图标
   * @default true
   */
  showIcon?: boolean

  /**
   * 内容是否居中
   * @default false
   */
  center?: boolean

  /**
   * 自定义类名
   */
  class?: string

  /**
   * 关闭时的回调函数
   */
  onClose?: () => void
}

/**
 * QyAlert Events 接口
 */
export interface QyAlertEmits {
  /**
   * 关闭事件
   */
  (e: 'close'): void
}

/**
 * 警告组件实例暴露的方法
 */
export interface QyAlertInstance {
  /**
   * 关闭警告
   */
  close: () => void
}
