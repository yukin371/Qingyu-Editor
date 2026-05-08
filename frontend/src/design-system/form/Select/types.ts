/**
 * QySelect 组件类型定义
 *
 * Apple 风格下拉选择器
 */

/** 选项数据结构 */
export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

/** 组件 Props */
export interface SelectProps {
  /** v-model 绑定值 */
  modelValue?: string | number
  /** 选项列表 */
  options?: SelectOption[]
  /** 占位文本 */
  placeholder?: string
  /** 禁用状态 */
  disabled?: boolean
  /** 可清空 */
  clearable?: boolean
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 自定义类名 */
  class?: any
}

/** 组件事件 */
export interface SelectEmits {
  (e: 'update:modelValue', value: string | number): void
  (e: 'change', value: string | number): void
}
