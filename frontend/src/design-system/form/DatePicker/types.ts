/**
 * DatePicker 组件类型定义
 */

// DatePicker 类型
export type DatePickerType = 'date' | 'daterange' | 'datetime' | 'datetimerange'

// DatePicker 尺寸
export type DatePickerSize = 'sm' | 'md' | 'lg'

// DatePicker 日期值类型
export type DatePickerValue = Date | string | [Date, Date] | [string, string] | null

// DatePicker 快捷选项
export interface DatePickerShortcut {
  /**
   * 快捷选项文本
   */
  text: string
  /**
   * 快捷选项值
   */
  value: Date | (() => Date) | [Date, Date] | (() => [Date, Date])
}

// DatePicker 禁用日期函数类型
export type DisabledDateFunction = (date: Date) => boolean

// DatePicker 格式化函数类型
export type DateFormatterFunction = (date: Date) => string

// DatePicker Props 接口
export interface DatePickerProps {
  /**
   * v-model 绑定值
   */
  modelValue?: DatePickerValue

  /**
   * 选择器类型
   * @default 'date'
   */
  type?: DatePickerType

  /**
   * 输入框尺寸
   * @default 'md'
   */
  size?: DatePickerSize

  /**
   * 占位符文本
   */
  placeholder?: string | string[]

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
   * 是否可清空
   * @default false
   */
  clearable?: boolean

  /**
   * 显示格式
   */
  format?: string

  /**
   * 绑定值格式
   */
  valueFormat?: string

  /**
   * 禁用日期
   */
  disabledDate?: DisabledDateFunction

  /**
   * 快捷选项
   */
  shortcuts?: DatePickerShortcut[]

  /**
   * 前缀图标名称
   */
  prefix?: string

  /**
   * 后缀图标名称
   */
  suffix?: string

  /**
   * 是否显示前缀图标
   * @default true
   */
  showPrefix?: boolean

  /**
   * 是否显示后缀图标
   * @default false
   */
  showSuffix?: boolean

  /**
   * 自定义类名
   */
  class?: any

  /**
   * 最小日期
   */
  minDate?: Date | string

  /**
   * 最大日期
   */
  maxDate?: Date | string

  /**
   * 日期选择器弹出位置
   * @default 'bottom-start'
   */
  placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end'

  /**
   * 是否显示时间选择
   * @default false
   */
  showTime?: boolean

  /**
   * 时间格式
   * @default 'HH:mm:ss'
   */
  timeFormat?: string

  /**
   * 是否显示当前按钮
   * @default false
   */
  showToday?: boolean

  /**
   * 开始日期的占位符（范围选择时）
   */
  startPlaceholder?: string

  /**
   * 结束日期的占位符（范围选择时）
   */
  endPlaceholder?: string

  /**
   * 值更新事件
   */
  onUpdate?: (value: DatePickerValue) => void

  /**
   * 获得焦点事件
   */
  onFocus?: (event: FocusEvent) => void

  /**
   * 失去焦点事件
   */
  onBlur?: (event: FocusEvent) => void

  /**
   * 日期改变事件
   */
  onChange?: (value: DatePickerValue) => void

  /**
   * 清空事件
   */
  onClear?: () => void

  /**
   * 弹出框显示/隐藏事件
   */
  onVisibleChange?: (visible: boolean) => void
}

// DatePicker 组件默认属性
export const datePickerDefaults: Partial<DatePickerProps> = {
  type: 'date',
  size: 'md',
  disabled: false,
  readonly: false,
  error: false,
  clearable: false,
  showPrefix: true,
  suffix: undefined,
  showSuffix: false,
  placement: 'bottom-start',
  showTime: false,
  timeFormat: 'HH:mm:ss',
  showToday: false,
}

// DatePicker Events 接口
export interface DatePickerEmits {
  'update:modelValue': [value: DatePickerValue]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  change: [value: DatePickerValue]
  clear: []
  'visible-change': [visible: boolean]
}
