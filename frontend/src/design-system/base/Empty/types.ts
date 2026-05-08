/**
 * Empty 组件类型定义
 */

import type { IconName } from '../Icon/types'

// Empty 尺寸
export type EmptySize = 'sm' | 'md' | 'lg' | 'xl'

// Empty Props 接口
export interface EmptyProps {
  /**
   * 空状态描述文字
   * @default '暂无数据'
   */
  description?: string

  /**
   * 空状态标题
   */
  title?: string

  /**
   * 图标名称（使用 Icon 组件）
   */
  icon?: IconName

  /**
   * 图标尺寸（兼容 QyEmpty 的 icon-size prop）
   * 'small' | 'medium' | 'large' 会映射为 base/Empty 的 size
   * @default 'md'
   */
  iconSize?: 'small' | 'medium' | 'large' | EmptySize

  /**
   * Empty 尺寸
   * @default 'md'
   */
  size?: EmptySize

  /**
   * 自定义类名
   */
  class?: any

  /**
   * 点击事件
   */
  onClick?: (event: MouseEvent) => void
}

// Empty 尺寸对应的图标和文字大小
export const emptySizes: Record<EmptySize, { icon: string; title: string; description: string }> = {
  sm: { icon: 'h-8 w-8', title: 'text-sm', description: 'text-xs' },
  md: { icon: 'h-12 w-12', title: 'text-base', description: 'text-sm' },
  lg: { icon: 'h-16 w-16', title: 'text-lg', description: 'text-base' },
  xl: { icon: 'h-20 w-20', title: 'text-xl', description: 'text-lg' },
}

// Empty 组件默认属性
export const emptyDefaults: Partial<EmptyProps> = {
  description: '暂无数据',
  size: 'md',
}
