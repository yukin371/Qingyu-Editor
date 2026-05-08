/**
 * QyRadioGroup 类型定义
 */

/**
 * QyRadioGroup 组件 Props
 */
export interface QyRadioGroupProps {
  /**
   * v-model 绑定值
   */
  modelValue: string | number | boolean
  /**
   * 是否禁用所有单选框
   * @default false
   */
  disabled?: boolean
  /**
   * 所有单选框的尺寸
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * 排列方向
   * @default 'horizontal'
   */
  direction?: 'horizontal' | 'vertical'
  /**
   * 组名称（用于表单提交）
   */
  name?: string
  /**
   * 无障碍标签
   */
  ariaLabel?: string
  /**
   * 标签（用于无障碍）
   */
  label?: string
  /**
   * 自定义类名
   */
  class?: any
}

/**
 * QyRadioGroup 组件 Emits
 */
export interface QyRadioGroupEmits {
  /**
   * 值变化时触发
   */
  'update:modelValue': [value: string | number | boolean]
  /**
   * 状态变化时触发
   */
  change: [value: string | number | boolean]
}
