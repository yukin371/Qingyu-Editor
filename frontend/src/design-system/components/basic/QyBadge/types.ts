/**
 * QyBadge component type definitions
 *
 * 与历史徽标 API 保持兼容
 */

import type { BadgeVariants } from './variants'

/**
 * 徽章类型（从 CVA 推导）
 */
export type QyBadgeType = BadgeVariants['type']
/**
 * 徽章颜色（从 CVA 推导）
 */
export type QyBadgeColor = BadgeVariants['color']
/**
 * 徽章尺寸（从 CVA 推导）
 */
export type QyBadgeSize = BadgeVariants['size']

/**
 * QyBadge Props 接口
 */
export interface QyBadgeProps {
  /**
   * 徽章类型
   * - dot: 只显示小圆点
   * - text: 文本徽章
   * - number: 数字徽章
   * @default 'number'
   */
  type?: QyBadgeType

  /**
   * 徽章颜色
   * @default 'primary'
   */
  color?: QyBadgeColor

  /**
   * 徽章尺寸
   * @default 'md'
   */
  size?: QyBadgeSize

  /**
   * 数字徽章的值
   * 当 type 为 'number' 时使用
   */
  value?: number | string

  /**
   * 文本徽章的兼容别名
   * 旧用法中常以 text 传入文字内容
   */
  text?: string

  /**
   * 最大值，超过时显示为 'max+'
   * 例如 max=99 时，value=100 显示为 '99+'
   * @default 99
   */
  max?: number

  /**
   * 是否显示0值
   * 为 false 时，value 为 0 不显示徽章
   * @default true
   */
  showZero?: boolean

  /**
   * 是否只显示小圆点
   * 设置为 true 时等同于 type='dot'
   * @default false
   */
  isDot?: boolean

  /**
   * 自定义类名
   */
  class?: string
}

/**
 * QyBadge Slots 接口
 */
export interface QyBadgeSlots {
  /**
   * 默认插槽，用于自定义内容
   * 当 type 为 'text' 时可以使用
   */
  default?: () => any
}

/**
 * 徽章组件实例暴露的方法
 */
export interface QyBadgeInstance {
  /**
   * 获取当前显示的值
   */
  getDisplayValue: () => string
}
