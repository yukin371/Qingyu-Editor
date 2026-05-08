/**
 * QyTextarea 多行文本框组件类型定义
 */

import type { TextareaVariants } from './variants'

// QyTextarea 尺寸（从 CVA 推导）
export type QyTextareaSize = TextareaVariants['size']

// QyTextarea 状态（从 CVA 推导）
export type QyTextareaState = TextareaVariants['state']

// QyTextarea 调整大小选项（从 CVA 推导）
export type QyTextareaResize = TextareaVariants['resize']

// QyTextarea Props 接口
export interface QyTextareaProps {
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
   * 是否显示字数统计
   * @default false
   */
  showCount?: boolean
  
  /**
   * 调整大小方式
   * @default 'vertical'
   */
  resize?: QyTextareaResize
  
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
   * 表单状态
   * @default 'default'
   */
  state?: QyTextareaState
  
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
   * 表单名称
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
  size?: QyTextareaSize
  
  /**
   * 自定义类名
   */
  class?: any
}

// QyTextarea Events 接口
export interface QyTextareaEmits {
  /**
   * 值更新事件
   */
  'update:modelValue': [value: string]
  
  /**
   * 获得焦点事件
   */
  focus: [event: FocusEvent]
  
  /**
   * 失去焦点事件
   */
  blur: [event: FocusEvent]
  
  /**
   * 输入事件
   */
  input: [event: Event]
  
  /**
   * 变更事件
   */
  change: [event: Event]
}

// QyTextarea 组件默认属性
export const qyTextareaDefaults: Partial<QyTextareaProps> = {
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
