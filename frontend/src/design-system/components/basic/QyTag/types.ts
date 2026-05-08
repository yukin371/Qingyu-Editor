/**
 * QyTag Component Types
 */

import type { TagVariants } from './variants'

/**
 * 标签颜色类型（从 CVA 推导）
 */
export type QyTagType = TagVariants['type']

/**
 * 标签尺寸类型（从 CVA 推导）
 */
export type QyTagSize = TagVariants['size']

/**
 * 标签效果类型（从 CVA 推导）
 */
export type QyTagEffect = TagVariants['effect']

/**
 * QyTag 组件 Props
 */
export interface QyTagProps {
  /**
   * 标签类型/颜色
   * @default 'primary'
   */
  type?: QyTagType

  /**
   * 标签尺寸
   * @default 'md'
   */
  size?: QyTagSize

  /**
   * 标签视觉效果
   * @default 'light'
   */
  effect?: QyTagEffect

  /**
   * 是否为圆形
   * @default true
   */
  round?: boolean

  /**
   * 是否带边框效果
   * @default false
   */
  hit?: boolean

  /**
   * 是否可关闭
   * @default false
   */
  closable?: boolean

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 自定义类名
   */
  class?: string
}

/**
 * QyTag 组件 Emits
 */
export interface QyTagEmits {
  /**
   * 关闭标签时触发
   */
  close: []
}

/**
 * 标签组件实例暴露的方法
 */
export interface QyTagInstance {
  /**
   * 聚焦标签
   */
  focus: () => void
  /**
   * 失焦标签
   */
  blur: () => void
}
