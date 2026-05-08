/**
 * Spinner 加载中组件类型定义
 */

// Spinner 类型 - 动画类型
export type SpinnerType = 'default' | 'dots' | 'bars' | 'wave'

// Spinner 尺寸
export type SpinnerSize = 'sm' | 'md' | 'lg'

// Spinner Props 接口
export interface SpinnerProps {
  /**
   * 动画类型
   * @default 'default'
   */
  type?: SpinnerType

  /**
   * 尺寸
   * @default 'md'
   */
  size?: SpinnerSize

  /**
   * 自定义颜色
   * @example '#3b82f6' 或 'blue'
   */
  color?: string

  /**
   * 线条粗细（仅 default 类型有效）
   * @default 3
   */
  strokeWidth?: number

  /**
   * 加载文字说明
   */
  label?: string

  /**
   * 自定义类名
   */
  class?: any
}

// Spinner 组件默认属性
export const spinnerDefaults: Partial<SpinnerProps> = {
  type: 'default',
  size: 'md',
  strokeWidth: 3,
}
