/**
 * Badge 组件类型定义
 */

// Badge 变体
export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'ghost'

// Badge 尺寸
export type BadgeSize = 'sm' | 'md' | 'lg'

// Badge Props 接口
export interface BadgeProps {
  /**
   * Badge 内容（数字或字符串）
   * 为空或 null 时显示为红点
   */
  content?: number | string | null

  /**
   * Badge 变体
   * @default 'default'
   */
  variant?: BadgeVariant

  /**
   * Badge 尺寸
   * @default 'md'
   */
  size?: BadgeSize

  /**
   * 最大显示数字
   * 超过此值显示 "max+"
   * @default 99
   */
  max?: number

  /**
   * 是否绝对定位（用于附加到其他元素上）
   * @default false
   */
  absolute?: boolean

  /**
   * 定位偏移
   * @default 'top-0 right-0'
   */
  position?: string

  /**
   * 是否显示为点（隐藏内容）
   * @default false
   */
  dot?: boolean

  /**
   * 是否可关闭
   * @default false
   */
  closable?: boolean

  /**
   * 自定义类名
   */
  class?: any
}

// Badge 组件默认属性
export const badgeDefaults: Partial<BadgeProps> = {
  variant: 'default',
  size: 'md',
  max: 99,
  absolute: false,
  position: 'top-0 right-0 -translate-y-1/2 translate-x-1/2',
  dot: false,
}
