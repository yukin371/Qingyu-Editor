/**
 * QySelect 选择器组件类型定义
 */

import type { SelectVariants } from './variants'

// QySelect 尺寸（从 CVA 推导）
export type QySelectSize = SelectVariants['size']

// QySelect 状态（从 CVA 推导）
export type QySelectState = SelectVariants['state']

// QySelect 选项接口
export interface QySelectOption {
  /**
   * 选项标签
   */
  label: string
  
  /**
   * 选项值
   */
  value: string | number | boolean
  
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean
  
  /**
   * 选项的自定义属性
   */
  [key: string]: any
}

// QySelect Props 接口
export interface QySelectProps {
  /**
   * v-model 绑定值
   */
  modelValue?: string | number | boolean | (string | number | boolean)[]
  
  /**
   * 选项数组
   */
  options?: QySelectOption[]
  
  /**
   * 占位符
   * @default '请选择'
   */
  placeholder?: string
  
  /**
   * 禁用状态
   * @default false
   */
  disabled?: boolean
  
  /**
   * 可清空
   * @default false
   */
  clearable?: boolean
  
  /**
   * 多选
   * @default false
   */
  multiple?: boolean
  
  /**
   * 可搜索
   * @default false
   */
  filterable?: boolean
  
  /**
   * 尺寸
   * @default 'md'
   */
  size?: QySelectSize

  /**
   * 状态
   * @default 'default'
   */
  state?: QySelectState
  
  /**
   * 加载状态
   * @default false
   */
  loading?: boolean
  
  /**
   * 远程搜索
   * @default false
   */
  remote?: boolean
  
  /**
   * 远程搜索方法
   */
  remoteMethod?: (_query: string) => void
  
  /**
   * 下拉菜单的最大高度（px）
   * @default 200
   */
  popperMaxHeight?: number
  
  /**
   * 自定义类名
   */
  class?: any
}

// QySelect Events 接口
export interface QySelectEmits {
  /**
   * 值更新事件
   */
  'update:modelValue': [value: string | number | boolean | (string | number | boolean)[] | undefined]
  
  /**
   * 选项改变事件
   */
  change: [value: string | number | boolean | (string | number | boolean)[] | undefined]
  
  /**
   * 获得焦点事件
   */
  focus: [event: FocusEvent]
  
  /**
   * 失去焦点事件
   */
  blur: [event: FocusEvent]
  
  /**
   * 清空事件
   */
  clear: []
  
  /**
   * 下拉显示/隐藏事件
   */
  visibleChange: [visible: boolean]
}

// QySelect Slots 类型
export interface QySelectSlots {
  /**
   * 默认插槽 - 自定义选项
   */
  default?: (_props: { option: QySelectOption; index: number }) => any
  
  /**
   * 前缀插槽
   */
  prefix?: () => any
  
  /**
   * 空状态插槽
   */
  empty?: () => any
  
  /**
   * 加载状态插槽
   */
  loading?: () => any
  
  /**
   * 标签插槽（多选时）
   */
  tag?: (_props: { option: QySelectOption; index: number; handleClose: () => void }) => any
}

// QySelect 组件默认属性
export const qySelectDefaults: Partial<QySelectProps> = {
  placeholder: '请选择',
  disabled: false,
  clearable: false,
  multiple: false,
  filterable: false,
  size: 'md',
  loading: false,
  remote: false,
  popperMaxHeight: 200,
}
