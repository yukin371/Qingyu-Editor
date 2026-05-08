/**
 * Checkbox 组件类型定义
 */

// Checkbox 尺寸
export type CheckboxSize = 'sm' | 'md' | 'lg'

// Checkbox 颜色
export type CheckboxColor = 'primary' | 'success' | 'warning' | 'danger'

// Checkbox Props 接口
export interface CheckboxProps {
  /**
   * v-model 绑定值（布尔模式或数组模式）
   */
  modelValue?: boolean | string[]

  /**
   * 复选框的值（用于数组模式）
   */
  value?: string | number | boolean

  /**
   * 标签文本
   */
  label?: string

  /**
   * 禁用状态
   * @default false
   */
  disabled?: boolean

  /**
   * 半选状态（通常用于全选/取消全选的中间状态）
   * @default false
   */
  indeterminate?: boolean

  /**
   * 复选框尺寸
   * @default 'md'
   */
  size?: CheckboxSize

  /**
   * 复选框颜色
   * @default 'primary'
   */
  color?: CheckboxColor

  /**
   * 自定义类名
   */
  class?: any
}

// CheckboxGroup Props 接口
export interface CheckboxGroupProps {
  /**
   * v-model 绑定值数组
   */
  modelValue?: string[]

  /**
   * 全局禁用状态
   * @default false
   */
  disabled?: boolean

  /**
   * 统一尺寸
   * @default 'md'
   */
  size?: CheckboxSize

  /**
   * 垂直排列
   * @default false
   */
  vertical?: boolean

  /**
   * 自定义类名
   */
  class?: any
}

// Checkbox 组件默认属性
export const checkboxDefaults: Partial<CheckboxProps> = {
  disabled: false,
  indeterminate: false,
  size: 'md',
  color: 'primary',
}

// CheckboxGroup 组件默认属性
export const checkboxGroupDefaults: Partial<CheckboxGroupProps> = {
  disabled: false,
  size: 'md',
  vertical: false,
}

// Checkbox Events
export interface CheckboxEmits {
  'update:modelValue': [value: boolean | string[]]
  'change': [value: boolean | string[]]
}

// CheckboxGroup Events
export interface CheckboxGroupEmits {
  'update:modelValue': [value: string[]]
  'change': [value: string[]]
}
