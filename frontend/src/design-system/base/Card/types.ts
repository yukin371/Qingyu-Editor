/**
 * Card 组件类型定义
 */

// Card 变体
export type CardVariant = 'default' | 'bordered' | 'elevated' | 'outlined' | 'glass'

// Card 阴影
export type CardShadow = 'always' | 'hover' | 'never'

// Card 内边距
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

// Card Props 接口
export interface CardProps {
  /**
   * Card 变体
   * - default: 默认样式，带边框和渐变背景
   * - bordered: 带边框样式
   * - elevated: 带阴影样式
   * - outlined: 简洁边框样式
   * - glass: 玻璃态样式
   * @default 'default'
   */
  variant?: CardVariant

  /**
   * 阴影模式
   * - always: 始终显示阴影
   * - hover: 悬停时显示阴影
   * - never: 不显示阴影
   * @default 'never'
   */
  shadow?: CardShadow

  /**
   * 内边距大小
   * @default 'md'
   */
  padding?: CardPadding

  /**
   * 是否支持 hover 效果
   * @default false
   */
  hoverable?: boolean

  /**
   * 自定义类名
   */
  class?: any
}

// Card 组件默认属性
export const cardDefaults: Partial<CardProps> = {
  variant: 'default',
  shadow: 'never',
  padding: 'md',
  hoverable: false,
}
