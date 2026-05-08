/**
 * Input 组件类型定义
 */

// Input 输入类型
export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url'

// Input 尺寸
export type InputSize = 'sm' | 'md' | 'lg'

// Input Props 接口
export interface InputProps {
  /**
   * v-model 绑定值
   */
  modelValue?: string | number

  /**
   * 输入类型
   * @default 'text'
   */
  type?: InputType

  /**
   * 输入框尺寸
   * @default 'md'
   */
  size?: InputSize

  /**
   * 占位符文本
   */
  placeholder?: string

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 是否只读
   * @default false
   */
  readonly?: boolean

  /**
   * 是否为错误状态
   * @default false
   */
  error?: boolean

  /**
   * 最大输入长度
   */
  maxlength?: number

  /**
   * 是否显示字数统计
   * @default false
   */
  showCount?: boolean

  /**
   * 前缀图标名称
   */
  prefix?: string

  /**
   * 后缀图标名称
   */
  suffix?: string

  /**
   * 是否可清空
   * @default false
   */
  clearable?: boolean

  /**
   * 自定义类名
   */
  class?: any

  /**
   * 值更新事件
   */
  onUpdate?: (value: string | number) => void

  /**
   * 获得焦点事件
   */
  onFocus?: (event: FocusEvent) => void

  /**
   * 失去焦点事件
   */
  onBlur?: (event: FocusEvent) => void

  /**
   * 值改变事件
   */
  onChange?: (value: string | number) => void

  /**
   * 清空事件
   */
  onClear?: () => void
}

// Input 组件默认属性
export const inputDefaults: Partial<InputProps> = {
  type: 'text',
  size: 'md',
  disabled: false,
  readonly: false,
  error: false,
  showCount: false,
  clearable: false,
}

// Input Events 接口
export interface InputEmits {
  'update:modelValue': [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  change: [value: string | number]
  clear: []
}
