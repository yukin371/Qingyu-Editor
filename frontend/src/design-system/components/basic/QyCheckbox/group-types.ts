/**
 * QyCheckboxGroup 类型定义
 */

/**
 * QyCheckboxGroup 组件 Props
 */
export interface QyCheckboxGroupProps {
  /**
   * v-model 绑定值
   */
  modelValue: string[]
  /**
   * 是否禁用所有复选框
   * @default false
   */
  disabled?: boolean
  /**
   * 所有复选框的尺寸
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * 排列方向
   * @default 'horizontal'
   */
  direction?: 'horizontal' | 'vertical'
  /**
   * 自定义类名
   */
  class?: any
}

/**
 * QyCheckboxGroup 组件 Emits
 */
export interface QyCheckboxGroupEmits {
  /**
   * 值变化时触发
   */
  'update:modelValue': [value: string[]]
  /**
   * 状态变化时触发
   */
  change: [value: string[]]
}
