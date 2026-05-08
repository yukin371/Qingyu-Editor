/**
 * Calendar 日期工具函数
 */

import type { DateCell, MonthView, DisabledDateFunction, WeekDay } from './types'

/**
 * 获取日期的年月日
 */
export function getDateParts(date: Date): { year: number; month: number; day: number } {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  return { year, month, day }
}

/**
 * 创建日期
 */
export function createDate(year: number, month: number, day: number): Date {
  return new Date(year, month, day)
}

/**
 * 获取月份的第一天
 */
export function getFirstDayOfMonth(date: Date): Date {
  const { year, month } = getDateParts(date)
  return createDate(year, month, 1)
}

/**
 * 获取月份的最后一天
 */
export function getLastDayOfMonth(date: Date): Date {
  const { year, month } = getDateParts(date)
  return createDate(year, month + 1, 0)
}

/**
 * 获取月份的天数
 */
export function getDaysInMonth(date: Date): number {
  return getLastDayOfMonth(date).getDate()
}

/**
 * 获取日期所在的星期几
 */
export function getDayOfWeek(date: Date): number {
  return date.getDay()
}

/**
 * 判断两个日期是否是同一天
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  const d1 = getDateParts(date1)
  const d2 = getDateParts(date2)
  return d1.year === d2.year && d1.month === d2.month && d1.day === d2.day
}

/**
 * 判断两个日期是否在同一月
 */
export function isSameMonth(date1: Date, date2: Date): boolean {
  const d1 = getDateParts(date1)
  const d2 = getDateParts(date2)
  return d1.year === d2.year && d1.month === d2.month
}

/**
 * 判断两个日期是否在同一年
 */
export function isSameYear(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear()
}

/**
 * 判断日期是否是今天
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

/**
 * 判断日期是否在两个日期之间
 */
export function isBetween(date: Date, startDate: Date, endDate: Date): boolean {
  const timestamp = date.getTime()
  return timestamp >= startDate.getTime() && timestamp <= endDate.getTime()
}

/**
 * 格式化日期
 */
export function formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
  const { year, month, day } = getDateParts(date)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()

  return format
    .replace('YYYY', String(year))
    .replace('MM', String(month + 1).padStart(2, '0'))
    .replace('DD', String(day).padStart(2, '0'))
    .replace('HH', String(hours).padStart(2, '0'))
    .replace('mm', String(minutes).padStart(2, '0'))
    .replace('ss', String(seconds).padStart(2, '0'))
}

/**
 * 解析日期字符串
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString)
}

/**
 * 日期加天数
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * 日期加月
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

/**
 * 日期加年
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

/**
 * 获取日期范围的开始日期
 */
export function getStartDate(date: Date): Date {
  return new Date(date.setHours(0, 0, 0, 0))
}

/**
 * 获取日期范围的结束日期
 */
export function getEndDate(date: Date): Date {
  return new Date(date.setHours(23, 59, 59, 999))
}

/**
 * 克隆日期
 */
export function cloneDate(date: Date): Date {
  return new Date(date.getTime())
}

/**
 * 获取周数（ISO周数）
 */
export function getWeekNumber(date: Date): number {
  const target = new Date(date.valueOf())
  const dayNr = (date.getDay() + 6) % 7
  target.setDate(target.getDate() - dayNr + 3)
  const firstThursday = target.valueOf()
  target.setMonth(0, 1)
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7)
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000)
}

/**
 * 生成月视图数据
 */
export function generateMonthView(
  year: number,
  month: number,
  firstDayOfWeek: WeekDay,
  selectedDate: Date | null,
  startDate: Date | null,
  endDate: Date | null,
  disabledDate?: DisabledDateFunction,
  minDate?: Date | string,
  maxDate?: Date | string,
  showWeekNumbers?: boolean
): MonthView {
  const firstDay = createDate(year, month, 1)
  void getLastDayOfMonth(firstDay)
  const daysInMonth = getDaysInMonth(firstDay)
  
  // 计算需要显示的日期范围
  const firstDayOfWeekNum = getDayOfWeek(firstDay)
  const offset = (firstDayOfWeekNum - firstDayOfWeek + 7) % 7
  
  // 前置填充日期
  const startDateOffset = addDays(firstDay, -offset)
  
  // 计算总共需要多少天（确保填满6行）
  const totalDays = Math.ceil((daysInMonth + offset) / 7) * 7
  
  // 生成日期网格
  const dates: DateCell[][] = []
  const weekNumbers: number[] = []
  
  let currentDate = cloneDate(startDateOffset)
  let week: DateCell[] = []
  
  for (let i = 0; i < totalDays; i++) {
    const isCurrentMonth = isSameMonth(currentDate, firstDay)
    const isSelected = selectedDate ? isSameDay(currentDate, selectedDate) : false
    const isTodayValue = isToday(currentDate)
    
    // 检查是否被禁用
    let isDisabled = false
    if (disabledDate) {
      isDisabled = disabledDate(currentDate)
    }
    
    // 检查最小/最大日期
    const min = minDate instanceof Date ? minDate : (minDate ? new Date(minDate) : undefined)
    const max = maxDate instanceof Date ? maxDate : (maxDate ? new Date(maxDate) : undefined)
    if (min && currentDate < min) isDisabled = true
    if (max && currentDate > max) isDisabled = true
    
    // 检查范围选择状态
    const isRangeStart = startDate ? isSameDay(currentDate, startDate) : false
    const isRangeEnd = endDate ? isSameDay(currentDate, endDate) : false
    const inRange = !!(startDate && endDate && isBetween(currentDate, startDate, endDate))
    
    week.push({
      date: cloneDate(currentDate),
      isCurrentMonth,
      isSelected,
      isToday: isTodayValue,
      isDisabled: !!isDisabled,
      isRangeStart,
      isRangeEnd,
      inRange,
    })
    
    // 每周结束
    if (week.length === 7) {
      dates.push(week)
      if (showWeekNumbers) {
        weekNumbers.push(getWeekNumber(week[0].date))
      }
      week = []
      currentDate = addDays(currentDate, 1)
    } else {
      currentDate = addDays(currentDate, 1)
    }
  }
  
  return {
    year,
    month,
    dates,
    weekNumbers: showWeekNumbers ? weekNumbers : undefined,
  }
}

/**
 * 将字符串转换为日期
 */
export function stringToDate(value: string | Date): Date {
  return typeof value === 'string' ? new Date(value) : value
}

/**
 * 将日期转换为值
 */
export function dateToValue(date: Date, format: string = 'YYYY-MM-DD'): string {
  return formatDate(date, format)
}

/**
 * 获取月份显示文本
 */
export function getMonthText(month: number, locale: any): string {
  return locale.months[month] || ''
}

/**
 * 获取年份显示文本
 */
export function getYearText(year: number, locale: any): string {
  return locale.yearFormat.replace('YYYY', String(year))
}

/**
 * 获取星期文本
 */
export function getWeekdayText(day: number, locale: any, short: boolean = false): string {
  const weekdays = short ? locale.weekdaysShort : locale.weekdays
  return weekdays[day] || ''
}

/**
 * 验证日期是否有效
 */
export function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * 比较两个日期
 * @returns -1: date1 < date2, 0: date1 === date2, 1: date1 > date2
 */
export function compareDates(date1: Date, date2: Date): number {
  const time1 = date1.getTime()
  const time2 = date2.getTime()
  
  if (time1 < time2) return -1
  if (time1 > time2) return 1
  return 0
}

/**
 * 获取月份的最后一天日期
 */
export function getEndOfMonth(date: Date): Date {
  const { year, month } = getDateParts(date)
  return createDate(year, month + 1, 0)
}

/**
 * 获取月份的第一天日期
 */
export function getStartOfMonth(date: Date): Date {
  const { year, month } = getDateParts(date)
  return createDate(year, month, 1)
}

/**
 * 计算两个日期之间的天数差
 */
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.round((date2.getTime() - date1.getTime()) / oneDay)
}

/**
 * 获取上个月
 */
export function getPreviousMonth(date: Date): Date {
  return addMonths(date, -1)
}

/**
 * 获取下个月
 */
export function getNextMonth(date: Date): Date {
  return addMonths(date, 1)
}

/**
 * 获取上一年
 */
export function getPreviousYear(date: Date): Date {
  return addYears(date, -1)
}

/**
 * 获取下一年
 */
export function getNextYear(date: Date): Date {
  return addYears(date, 1)
}
