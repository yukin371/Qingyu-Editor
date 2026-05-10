/**
 * QyButton component type definitions
 *
 * 与历史按钮 API 保持兼容
 */

import type { ButtonVariants } from './variants'

/**
 * 按钮变体类型（从 CVA 推导）
 */
export type QyButtonVariant = ButtonVariants['variant']
/**
 * 按钮尺寸类型（从 CVA 推导）
 */
export type QyButtonSize = ButtonVariants['size']
/**
 * 状态层类型（从 CVA 推导）
 */
export type QyButtonStateLayer = ButtonVariants['stateLayer']
/**
 * 是否块级宽度
 */
export type QyButtonBlock = ButtonVariants['block']

/**
 * QyButton Props 接口
 */
export interface QyButtonProps {
  /**
   * 按钮变体样式
   * @default 'primary'
   */
  variant?: QyButtonVariant

  /**
   * 按钮尺寸
   * @default 'md'
   */
  size?: QyButtonSize

  /**
   * Fluent Design 状态层
   * @default 'none'
   */
  stateLayer?: QyButtonStateLayer

  /**
   * 禁用状态
   * @default false
   */
  disabled?: boolean

  /**
   * 加载状态（显示加载动画并禁用按钮）
   * @default false
   */
  loading?: boolean

  /**
   * 图标 SVG 字符串或图标名称
   */
  icon?: string

  /**
   * 图标位置
   * @default 'left'
   */
  iconPosition?: 'left' | 'right'

  /**
   * 原生 button type 属性
   * @default 'button'
   */
  nativeType?: 'button' | 'submit' | 'reset'

  /**
   * 是否占满父容器宽度
   * @default false
   */
  block?: QyButtonBlock

  /**
   * 自定义类名
   */
  class?: string
}

/**
 * QyButton Events 接口
 */
export interface QyButtonEmits {
  /**
   * 点击事件
   */
  (e: 'click', event: MouseEvent): void
}

/**
 * 按钮组件实例暴露的方法
 */
export interface QyButtonInstance {
  /**
   * 聚焦按钮
   */
  focus: () => void
  /**
   * 失焦按钮
   */
  blur: () => void
}
