/**
 * Button 组件类型定义
 */

// Button 变体
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'gradient' | 'text' | 'outline' | 'default'

// Button 尺寸
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// Button Props 接口
export interface ButtonProps {
  /**
   * Button 变体
   * @default 'primary'
   */
  variant?: ButtonVariant

  /**
   * Button 尺寸
   * @default 'md'
   */
  size?: ButtonSize

  /**
   * 禁用状态
   * @default false
   */
  disabled?: boolean

  /**
   * 加载状态
   * @default false
   */
  loading?: boolean

  /**
   * 是否为块级按钮（占满容器宽度）
   * @default false
   */
  block?: boolean

  /**
   * 按钮类型
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset'

  /**
   * 自定义类名
   */
  class?: any

  /**
   * 点击事件
   */
  onClick?: (event: MouseEvent) => void
}

// Button 组件默认属性
export const buttonDefaults: Partial<ButtonProps> = {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  block: false,
  type: 'button',
}
