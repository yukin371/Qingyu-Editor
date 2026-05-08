/**
 * Divider 组件类型定义
 */

// Divider 变体
export type DividerVariant = 'solid' | 'dashed' | 'dotted'

// Divider 方向
export type DividerDirection = 'horizontal' | 'vertical'

// Divider Props 接口
export interface DividerProps {
  /**
   * Divider 方向
   * @default 'horizontal'
   */
  direction?: DividerDirection

  /**
   * 标签文字
   * 显示在 Divider 中间的文字
   */
  label?: string

  /**
   * Divider 线型变体
   * @default 'solid'
   */
  variant?: DividerVariant

  /**
   * 自定义类名
   */
  class?: any
}

// Divider 组件默认属性
export const dividerDefaults: Partial<DividerProps> = {
  direction: 'horizontal',
  variant: 'solid',
  label: undefined,
}
