/**
 * Radio 组件类型定义
 */

// Radio 尺寸
export type RadioSize = 'sm' | 'md' | 'lg'

// Radio Props 接口
export interface RadioProps {
  /**
   * v-model 绑定值
   */
  modelValue?: string | number | boolean

  /**
   * 单选框的值
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
   * 单选框尺寸
   * @default 'md'
   */
  size?: RadioSize

  /**
   * 按钮模式
   * @default false
   */
  button?: boolean

  /**
   * 自定义类名
   */
  class?: any
}

// RadioGroup Props 接口
export interface RadioGroupProps {
  /**
   * v-model 绑定值
   */
  modelValue?: string | number | boolean

  /**
   * 全局禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 统一尺寸
   * @default 'md'
   */
  size?: RadioSize

  /**
   * 垂直排列
   * @default false
   */
  vertical?: boolean

  /**
   * 按钮模式
   * @default false
   */
  button?: boolean

  /**
   * 自定义类名
   */
  class?: any
}

// Radio Events 接口
export interface RadioEmits {
  'update:modelValue': [value: string | number | boolean]
  change: [value: string | number | boolean]
}

// RadioGroup Events 接口
export interface RadioGroupEmits {
  'update:modelValue': [value: string | number | boolean]
  change: [value: string | number | boolean]
}

// Radio 组件默认属性
export const radioDefaults: Partial<RadioProps> = {
  disabled: false,
  size: 'md',
  button: false,
}

// RadioGroup 组件默认属性
export const radioGroupDefaults: Partial<RadioGroupProps> = {
  disabled: false,
  size: 'md',
  vertical: false,
  button: false,
}
