/**
 * Tag 组件类型定义
 */

import type { IconName } from '../Icon/types'

// Tag 变体（颜色类型）
export type TagVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

// Tag 尺寸
export type TagSize = 'sm' | 'md' | 'lg'

// Tag 效果（视觉样式）
export type TagEffect = 'light' | 'dark' | 'plain'

// Tag Props 接口
export interface TagProps {
  /**
   * Tag 变体（颜色）
   * @default 'default'
   */
  variant?: TagVariant

  /**
   * Tag 尺寸
   * @default 'md'
   */
  size?: TagSize

  /**
   * 视觉效果
   * - light: 浅色背景（默认）
   * - dark: 深色背景
   * - plain: 朴素样式（仅边框）
   * @default 'light'
   */
  effect?: TagEffect

  /**
   * 是否为圆形
   * @default true
   */
  round?: boolean

  /**
   * 是否带边框加粗效果
   * @default false
   */
  hit?: boolean

  /**
   * 是否可关闭
   * @default false
   */
  removable?: boolean

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 前缀图标名称
   */
  icon?: IconName

  /**
   * 自定义类名
   */
  class?: any

  /**
   * 关闭事件
   */
  onClose?: () => void

  /**
   * 点击事件
   */
  onClick?: (event: MouseEvent) => void
}

// Tag 组件默认属性
export const tagDefaults: Partial<TagProps> = {
  variant: 'default',
  size: 'md',
  effect: 'light',
  round: true,
  hit: false,
  removable: false,
  disabled: false,
}
