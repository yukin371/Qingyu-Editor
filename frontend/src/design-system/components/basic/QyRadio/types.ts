/**
 * QyRadio 类型定义
 */

/**
 * 单选框颜色类型
 */
export type RadioColor = 'primary' | 'success' | 'warning' | 'danger'

/**
 * 单选框尺寸类型
 */
export type RadioSize = 'sm' | 'md' | 'lg'

/**
 * 单选框变体类型
 */
export type RadioVariant = 'default' | 'button' | 'border'

/**
 * QyRadio 组件 Props
 */
export interface QyRadioProps {
  /**
   * v-model 绑定值
   */
  modelValue?: string | number | boolean
  /**
   * 单选框的值
   */
  value: string | number | boolean
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
   * 尺寸
   * @default 'md'
   */
  size?: RadioSize
  /**
   * 颜色
   * @default 'primary'
   */
  color?: RadioColor
  /**
   * 变体样式
   * @default 'default'
   */
  variant?: RadioVariant
  /**
   * 原生 name 属性
   */
  name?: string
  /**
   * 自定义类名
   */
  class?: any
}

/**
 * QyRadio 组件 Emits
 */
export interface QyRadioEmits {
  /**
   * 值变化时触发
   */
  'update:modelValue': [value: string | number | boolean]
  /**
   * 状态变化时触发
   */
  change: [value: string | number | boolean]
}
