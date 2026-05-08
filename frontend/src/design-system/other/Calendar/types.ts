/**
 * Calendar 组件类型定义
 */

// Calendar 尺寸
export type CalendarSize = 'sm' | 'md' | 'lg'

// Calendar 日期值类型
export type CalendarValue = Date | string | [Date | null, Date | null] | [string | null, string | null] | null

// Calendar 禁用日期函数类型
export type DisabledDateFunction = (date: Date) => boolean

// 星期枚举
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6

// 日期单元格信息
export interface DateCell {
  /** 日期 */
  date: Date
  /** 是否为当前月 */
  isCurrentMonth: boolean
  /** 是否为选中日期 */
  isSelected: boolean
  /** 是否为今天 */
  isToday: boolean
  /** 是否被禁用 */
  isDisabled: boolean
  /** 是否为范围开始 */
  isRangeStart: boolean
  /** 是否为范围结束 */
  isRangeEnd: boolean
  /** 是否在范围内 */
  inRange: boolean
}

// 月视图数据
export interface MonthView {
  /** 年 */
  year: number
  /** 月 */
  month: number
  /** 日期网格 */
  dates: DateCell[][]
  /** 周数 */
  weekNumbers?: number[]
}

// Calendar Props 接口
export interface CalendarProps {
  /**
   * v-model 绑定值
   */
  modelValue?: CalendarValue

  /**
   * 是否为范围选择
   * @default false
   */
  range?: boolean

  /**
   * 组件尺寸
   * @default 'md'
   */
  size?: CalendarSize

  /**
   * 每周的第一天（0-6, 0=周日, 1=周一, ...）
   * @default 0
   */
  firstDayOfWeek?: WeekDay

  /**
   * 是否显示周数
   * @default false
   */
  showWeekNumbers?: boolean

  /**
   * 禁用日期函数
   */
  disabledDate?: DisabledDateFunction

  /**
   * 最小日期
   */
  minDate?: Date | string

  /**
   * 最大日期
   */
  maxDate?: Date | string

  /**
   * 日期格式
   * @default 'YYYY-MM-DD'
   */
  format?: string

  /**
   * 语言环境
   * @default 'zh-CN'
   */
  locale?: string

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 自定义类名
   */
  class?: any

  /**
   * 是否显示今天按钮
   * @default true
   */
  showToday?: boolean

  /**
   * 是否显示月份切换
   * @default true
   */
  showMonthSwitcher?: boolean

  /**
   * 日期选中事件
   */
  onSelect?: (date: Date | [Date, Date]) => void

  /**
   * 面板切换事件
   */
  onPanelChange?: (date: Date) => void

  /**
   * 月份事件
   */
  onMonthChange?: (date: Date) => void

  /**
   * 年份变化事件
   */
  onYearChange?: (date: Date) => void
}

// Calendar 组件默认属性
export const calendarDefaults: Partial<CalendarProps> = {
  range: false,
  size: 'md',
  firstDayOfWeek: 0,
  showWeekNumbers: false,
  disabled: false,
  format: 'YYYY-MM-DD',
  locale: 'zh-CN',
  showToday: true,
  showMonthSwitcher: true,
}

// Calendar Events 接口
export interface CalendarEmits {
  'update:modelValue': [value: CalendarValue]
  select: [date: Date | [Date, Date | null]]
  'panel-change': [date: Date]
  'month-change': [date: Date]
  'year-change': [date: Date]
}

// 语言包接口
export interface Locale {
  /** 月份数组 */
  months: string[]
  /** 星期数组 */
  weekdays: string[]
  /** 星期缩写数组 */
  weekdaysShort: string[]
  /** 今天按钮文本 */
  today: string
  /** 月份格式 */
  monthFormat: string
  /** 年份格式 */
  yearFormat: string
}

// 默认中文语言包
export const zhCN: Locale = {
  months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  weekdays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  weekdaysShort: ['日', '一', '二', '三', '四', '五', '六'],
  today: '今天',
  monthFormat: 'YYYY年MM月',
  yearFormat: 'YYYY年',
}

// 默认英文语言包
export const enUS: Locale = {
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  weekdaysShort: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  today: 'Today',
  monthFormat: 'MMMM YYYY',
  yearFormat: 'YYYY',
}

// 语言包映射
export const locales: Record<string, Locale> = {
  'zh-CN': zhCN,
  'en-US': enUS,
}
