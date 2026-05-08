/**
 * Textarea 组件类型定义
 */

// Textarea 尺寸
export type TextareaSize = 'sm' | 'md' | 'lg'

// Textarea 调整大小选项
export type TextareaResize = 'none' | 'both' | 'horizontal' | 'vertical'

// Textarea 状态
export type TextareaState = 'default' | 'error' | 'success' | 'warning'

// Textarea Props 接口
export interface TextareaProps {
  /**
   * v-model 绑定值
   */
  modelValue?: string

  /**
   * 显示行数
   * @default 3
   */
  rows?: number

  /**
   * 最小行数
   * @default 1
   */
  rowsMin?: number

  /**
   * 最大行数
   */
  rowsMax?: number

  /**
   * 最大长度
   */
  maxlength?: number

  /**
   * 最小长度
   */
  minlength?: number

  /**
   * 显示字数统计
   * @default false
   */
  showCount?: boolean

  /**
   * 调整大小
   * @default 'vertical'
   */
  resize?: TextareaResize

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
   * 错误状态
   * @default false
   */
  error?: boolean

  /**
   * 状态
   * @default 'default'
   */
  state?: TextareaState

  /**
   * 占位符
   */
  placeholder?: string

  /**
   * 自动聚焦
   * @default false
   */
  autofocus?: boolean

  /**
   * 自动完成
   */
  autocomplete?: string

  /**
   * 名称
   */
  name?: string

  /**
   * 表单 ID
   */
  id?: string

  /**
   * 是否必填
   * @default false
   */
  required?: boolean

  /**
   * 尺寸
   * @default 'md'
   */
  size?: TextareaSize

  /**
   * 自定义类名
   */
  class?: any

  /**
   * 输入事件
   */
  onInput?: (event: Event) => void

  /**
   * 变更事件
   */
  onChange?: (event: Event) => void

  /**
   * 获得焦点事件
   */
  onFocus?: (event: FocusEvent) => void

  /**
   * 失去焦点事件
   */
  onBlur?: (event: FocusEvent) => void
}

// Textarea 组件默认属性
export const textareaDefaults: Partial<TextareaProps> = {
  rows: 3,
  rowsMin: 1,
  showCount: false,
  resize: 'vertical',
  disabled: false,
  readonly: false,
  error: false,
  state: 'default',
  autofocus: false,
  required: false,
  size: 'md',
}
