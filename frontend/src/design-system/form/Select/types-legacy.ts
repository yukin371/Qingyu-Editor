/**
 * Select 组件类型定义
 */

// Select 尺寸
export type SelectSize = 'sm' | 'md' | 'lg'

// Select 选项接口
export interface SelectOption {
  /**
   * 选项标签
   */
  label: string
  
  /**
   * 选项值
   */
  value: string | number
  
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

// Select Props 接口
export interface SelectProps {
  /**
   * v-model 绑定值
   */
  modelValue?: string | number | (string | number)[]
  
  /**
   * 选项数组
   */
  options?: SelectOption[]
  
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
  size?: SelectSize
  
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
  remoteMethod?: (query: string) => void
  
  /**
   * 下拉菜单的最大高度
   * @default 200
   */
  popperMaxHeight?: number
  
  /**
   * 自定义类名
   */
  class?: any
}

// Select Events 接口
export interface SelectEmits {
  /**
   * 值更新事件
   */
  'update:modelValue': [value: string | number | (string | number)[] | undefined]
  
  /**
   * 选项改变事件
   */
  change: [value: string | number | (string | number)[] | undefined]
  
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

// Select Slots 类型
export interface SelectSlots {
  /**
   * 默认插槽 - 自定义选项
   */
  default?: (props: { option: SelectOption; index: number }) => any
  
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
  tag?: (props: { option: SelectOption; index: number; handleClose: () => void }) => any
}

// Select 组件默认属性
export const selectDefaults: Partial<SelectProps> = {
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
