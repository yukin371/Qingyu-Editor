/**
 * Input 组件类型定义
 */

// Input 尺寸
export type InputSize = 'sm' | 'md' | 'lg'

// Input Props 接口
export interface InputProps {
  /**
   * 输入框类型
   * @default 'text'
   */
  type?: 'text' | 'password' | 'number' | 'email' | 'tel' | 'url' | 'search'

  /**
   * 输入框占位符
   */
  placeholder?: string

  /**
   * 禁用状态
   * @default false
   */
  disabled?: boolean

  /**
   * 只读状态
   * @default false
   */
  readonly?: boolean

  /**
   * 输入框尺寸
   * @default 'md'
   */
  size?: InputSize

  /**
   * v-model 绑定值
   */
  modelValue?: string | number

  /**
   * 最大长度
   */
  maxlength?: number

  /**
   * 是否可清空
   * @default false
   */
  clearable?: boolean

  /**
   * 密码框是否显示切换按钮
   * @default false
   */
  showPassword?: boolean

  /**
   * 自定义类名
   */
  class?: string
}

// Input 组件默认属性
export const inputDefaults: Partial<InputProps> = {
  type: 'text',
  size: 'md',
  disabled: false,
  readonly: false,
  clearable: false,
  showPassword: false,
}
