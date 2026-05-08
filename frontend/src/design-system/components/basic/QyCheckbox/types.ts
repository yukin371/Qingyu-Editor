/**
 * QyCheckbox 类型定义
 */

/**
 * 复选框颜色类型
 */
export type CheckboxColor = 'primary' | 'success' | 'warning' | 'danger'

/**
 * 复选框尺寸类型
 */
export type CheckboxSize = 'sm' | 'md' | 'lg'

/**
 * 复选框变体类型
 */
export type CheckboxVariant = 'default' | 'button' | 'border'

/**
 * QyCheckbox 组件 Props
 */
export interface QyCheckboxProps {
  /**
   * v-model 绑定值
   * - 布尔模式：true/false
   * - 数组模式：值数组
   */
  modelValue: boolean | string[]
  /**
   * 复选框的值
   */
  value?: string
  /**
   * 标签文本
   */
  label?: string
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean
  /**
   * 是否半选状态
   * @default false
   */
  indeterminate?: boolean
  /**
   * 尺寸
   * @default 'md'
   */
  size?: CheckboxSize
  /**
   * 颜色
   * @default 'primary'
   */
  color?: CheckboxColor
  /**
   * 变体样式
   * @default 'default'
   */
  variant?: CheckboxVariant
  /**
   * 自定义类名
   */
  class?: any
}

/**
 * QyCheckbox 组件 Emits
 */
export interface QyCheckboxEmits {
  /**
   * 值变化时触发
   */
  'update:modelValue': [value: boolean | string[]]
  /**
   * 状态变化时触发
   */
  change: [value: boolean | string[]]
}
