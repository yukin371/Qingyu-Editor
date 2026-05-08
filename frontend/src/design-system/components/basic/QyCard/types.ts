/**
 * QyCard component type definitions
 *
 * 与 Element Plus El-Card API 兼容
 */

import type { CardVariants } from './variants'

/**
 * 卡片阴影类型（从 CVA 推导）
 */
export type QyCardShadow = CardVariants['shadow']

/**
 * 卡片变体类型（从 CVA 推导）
 */
export type QyCardVariant = CardVariants['variant']

/**
 * 卡片内边距类型（从 CVA 推导）
 */
export type QyCardPadding = CardVariants['padding']

/**
 * QyCard Props 接口
 */
export interface QyCardProps {
  /**
   * 卡片阴影
   * @default 'hover'
   */
  shadow?: QyCardShadow

  /**
   * 卡片变体样式
   * @default 'default'
   */
  variant?: QyCardVariant

  /**
   * 卡片内边距
   * @default 'md'
   */
  padding?: QyCardPadding

  /**
   * 是否悬停时显示阴影
   * @default false
   */
  hoverable?: boolean

  /**
   * 自定义类名
   */
  class?: string
}

/**
 * QyCard Events 接口
 */
export interface QyCardEmits {
  /**
   * 点击卡片时触发
   */
  (e: 'click', event: MouseEvent): void
}

/**
 * QyCard Slots 接口
 */
export interface QyCardSlots {
  /**
   * 默认插槽 - 卡片主体内容
   */
  default?: () => any

  /**
   * 头部插槽 - 卡片标题
   */
  header?: () => any

  /**
   * 底部插槽 - 卡片底部
   */
  footer?: () => any
}

/**
 * QyCard 组件实例暴露的方法
 */
export interface QyCardInstance {
  /**
   * 聚焦卡片
   */
  focus: () => void
  /**
   * 失焦卡片
   */
  blur: () => void
}
