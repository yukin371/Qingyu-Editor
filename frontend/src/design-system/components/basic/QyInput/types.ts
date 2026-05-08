/**
 * QyInput component type definitions
 *
 * 与 Element Plus El-Input API 兼容
 */

import type { InputVariants } from './variants'

/**
 * 输入框尺寸类型（从 CVA 推导）
 */
export type QyInputSize = InputVariants['size']
/**
 * 输入框状态类型（从 CVA 推导）
 */
export type QyInputState = InputVariants['state']

/**
 * QyInput Props 接口
 */
export interface QyInputProps {
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
  size?: QyInputSize

  /**
   * 输入框状态
   * @default 'default'
   */
  state?: QyInputState

  /**
   * v-model 绑定值
   */
  modelValue?: string | number

  /**
   * 最大长度
   */
  maxlength?: number

  /**
   * 最小长度
   */
  minlength?: number

  /**
   * 是否可清空
   * @default false
   */
  clearable?: boolean

  /**
   * 显示密码切换按钮（仅 type="password" 时有效）
   * @default true
   */
  showPassword?: boolean

  /**
   * 前置图标
   */
  prefixIcon?: string

  /**
   * 后置图标
   */
  suffixIcon?: string

  /**
   * 输入框头部插槽
   */
  prepend?: string

  /**
   * 输入框尾部插槽
   */
  append?: string

  /**
   * 原生 name 属性
   */
  name?: string

  /**
   * 原生 id 属性
   */
  id?: string

  /**
   * 自动完成
   */
  autocomplete?: string

  /**
   * 是否必填
   * @default false
   */
  required?: boolean

  /**
   * 自定义类名
   */
  class?: string
}

/**
 * QyInput Events 接口
 */
export interface QyInputEmits {
  /**
   * 值更新事件（v-model）
   */
  (e: 'update:modelValue', value: string | number): void

  /**
   * 输入事件
   */
  (e: 'input', value: string | number): void

  /**
   * 变更事件
   */
  (e: 'change', value: string | number): void

  /**
   * 获得焦点事件
   */
  (e: 'focus', event: FocusEvent): void

  /**
   * 失去焦点事件
   */
  (e: 'blur', event: FocusEvent): void

  /**
   * 清空事件
   */
  (e: 'clear'): void

  /**
   * 键盘事件
   */
  (e: 'keydown', event: KeyboardEvent): void

  /**
   * 回车事件
   */
  (e: 'keyup', event: KeyboardEvent): void
}

/**
 * 输入框组件实例暴露的方法
 */
export interface QyInputInstance {
  /**
   * 聚焦输入框
   */
  focus: () => void
  /**
   * 失焦输入框
   */
  blur: () => void
  /**
   * 选中输入框文本
   */
  select: () => void
  /**
   * 获取输入框文本
   */
  getText: () => string
}
