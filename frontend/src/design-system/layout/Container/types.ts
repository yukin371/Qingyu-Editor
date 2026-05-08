/**
 * Container 组件类型定义
 */

export type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

// Container Props 接口
export interface ContainerProps {
  /**
   * 最大宽度尺寸
   * @default 'full'
   */
  size?: ContainerSize

  /**
   * 是否流体宽度（100%）
   * @default false
   */
  fluid?: boolean

  /**
   * 是否添加内边距
   * @default true
   */
  padding?: boolean

  /**
   * 是否水平居中
   * @default true
   */
  centered?: boolean

  /**
   * 自定义类名
   */
  class?: any
}

// Container 组件默认属性
export const containerDefaults: Partial<ContainerProps> = {
  size: 'full',
  fluid: false,
  padding: true,
  centered: true,
}
