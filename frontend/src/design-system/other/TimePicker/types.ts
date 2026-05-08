/**
 * TimePicker 组件类型定义
 */

// TimePicker 尺寸
export type TimePickerSize = 'sm' | 'md' | 'lg'

// TimePicker 时间值类型
export type TimePickerValue = string | [string, string] | null

// TimePicker 时间间隔配置
export interface TimePickerStep {
  /**
   * 小时间隔
   * @default 1
   */
  hour?: number
  /**
   * 分钟间隔
   * @default 1
   */
  minute?: number
  /**
   * 秒间隔
   * @default 1
   */
  second?: number
}

// 禁用时间段
export interface DisabledTimeRange {
  /**
   * 开始时间 (HH:mm:ss)
   */
  start: string
  /**
   * 结束时间 (HH:mm:ss)
   */
  end: string
}

// 禁用时间函数类型
export type DisabledHoursFunction = (hour: number) => boolean
export type DisabledMinutesFunction = (hour: number, minute: number) => boolean
export type DisabledSecondsFunction = (hour: number, minute: number, second: number) => boolean

// TimePicker 格式化函数类型
export type TimeFormatterFunction = (time: string) => string

// TimePicker Props 接口
export interface TimePickerProps {
  /**
   * v-model 绑定值
   * 格式: HH:mm:ss 或 HH:mm
   */
  modelValue?: TimePickerValue

  /**
   * 输入框尺寸
   * @default 'md'
   */
  size?: TimePickerSize

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
   * 是否可编辑
   * @default true
   */
  editable?: boolean

  /**
   * 是否可清空
   * @default false
   */
  clearable?: boolean

  /**
   * 是否范围选择
   * @default false
   */
  isRange?: boolean

  /**
   * 范围分隔符
   * @default '-'
   */
  rangeSeparator?: string

  /**
   * 时间格式
   * @default 'HH:mm:ss'
   */
  format?: string

  /**
   * 起始时间
   * 格式: HH:mm:ss
   */
  start?: string

  /**
   * 结束时间
   * 格式: HH:mm:ss
   */
  end?: string

  /**
   * 时间间隔
   */
  step?: TimePickerStep

  /**
   * 禁用的小时
   * 可以是数组或函数
   */
  disabledHours?: number[] | DisabledHoursFunction

  /**
   * 禁用的分钟
   * 可以是数组或函数
   */
  disabledMinutes?: number[] | DisabledMinutesFunction

  /**
   * 禁用的秒
   * 可以是数组或函数
   */
  disabledSeconds?: number[] | DisabledSecondsFunction

  /**
   * 禁用的时间段
   */
  disabledTimeRanges?: DisabledTimeRange[]

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
   * 自定义类名
   */
  class?: any

  /**
   * 值更新事件
   */
  onUpdate?: (value: TimePickerValue) => void

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
  onChange?: (value: TimePickerValue) => void

  /**
   * 清空事件
   */
  onClear?: () => void
}

// TimePicker 组件默认属性
export const timePickerDefaults: Partial<TimePickerProps> = {
  size: 'md',
  disabled: false,
  readonly: false,
  editable: true,
  clearable: false,
  isRange: false,
  rangeSeparator: '-',
  format: 'HH:mm:ss',
  step: {
    hour: 1,
    minute: 1,
    second: 1,
  },
  showPrefix: true,
}

// TimePicker Events 接口
export interface TimePickerEmits {
  'update:modelValue': [value: TimePickerValue]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  change: [value: TimePickerValue]
  clear: []
}

// 时间格式类型
export type TimeFormatType = 'HH:mm:ss' | 'HH:mm' | 'HHmmss' | 'HHmm'

// 时间部分
export interface TimeParts {
  hour: number
  minute: number
  second: number
}
