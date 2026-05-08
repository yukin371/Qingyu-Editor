/**
 * TimePicker 时间工具函数
 */

import type { TimeParts, DisabledTimeRange, TimePickerStep } from './types'

/**
 * 格式化时间为指定格式
 */
export function formatTime(
  hour: number,
  minute: number,
  second: number,
  format: string = 'HH:mm:ss'
): string {
  const pad = (n: number) => String(n).padStart(2, '0')

  if (format === 'HH:mm:ss') {
    return `${pad(hour)}:${pad(minute)}:${pad(second)}`
  } else if (format === 'HH:mm') {
    return `${pad(hour)}:${pad(minute)}`
  } else if (format === 'HHmmss') {
    return `${pad(hour)}${pad(minute)}${pad(second)}`
  } else if (format === 'HHmm') {
    return `${pad(hour)}${pad(minute)}`
  }

  return `${pad(hour)}:${pad(minute)}:${pad(second)}`
}

/**
 * 解析时间字符串为时间部分
 */
export function parseTime(time: string, format: string = 'HH:mm:ss'): TimeParts | null {
  if (!time) {
    return null
  }

  // 处理不同格式
  if (format === 'HH:mm:ss' || format.includes(':')) {
    const parts = time.split(':')
    if (parts.length >= 2) {
      const hour = parseInt(parts[0], 10)
      const minute = parseInt(parts[1], 10)
      const second = parts.length >= 3 ? parseInt(parts[2], 10) : 0

      if (
        !isNaN(hour) &&
        !isNaN(minute) &&
        !isNaN(second) &&
        hour >= 0 &&
        hour <= 23 &&
        minute >= 0 &&
        minute <= 59 &&
        second >= 0 &&
        second <= 59
      ) {
        return { hour, minute, second }
      }
    }
  } else if (format === 'HHmmss' || format === 'HHmm') {
    const hourStr = time.substring(0, 2)
    const minuteStr = time.substring(2, 4)
    const secondStr = format === 'HHmmss' ? time.substring(4, 6) : '00'

    const hour = parseInt(hourStr, 10)
    const minute = parseInt(minuteStr, 10)
    const second = parseInt(secondStr, 10)

    if (
      !isNaN(hour) &&
      !isNaN(minute) &&
      !isNaN(second) &&
      hour >= 0 &&
      hour <= 23 &&
      minute >= 0 &&
      minute <= 59 &&
      second >= 0 &&
      second <= 59
    ) {
      return { hour, minute, second }
    }
  }

  return null
}

/**
 * 验证时间是否有效
 */
export function isValidTime(time: string, format: string = 'HH:mm:ss'): boolean {
  return parseTime(time, format) !== null
}

/**
 * 比较两个时间
 * @returns -1 if time1 < time2, 0 if time1 == time2, 1 if time1 > time2
 */
export function compareTimes(time1: string, time2: string, format: string = 'HH:mm:ss'): number {
  const parsed1 = parseTime(time1, format)
  const parsed2 = parseTime(time2, format)

  if (!parsed1 || !parsed2) {
    return 0
  }

  if (parsed1.hour !== parsed2.hour) {
    return parsed1.hour > parsed2.hour ? 1 : -1
  }

  if (parsed1.minute !== parsed2.minute) {
    return parsed1.minute > parsed2.minute ? 1 : -1
  }

  if (parsed1.second !== parsed2.second) {
    return parsed1.second > parsed2.second ? 1 : -1
  }

  return 0
}

/**
 * 检查时间是否在指定范围内
 */
export function isTimeInRange(
  time: string,
  start: string,
  end: string,
  format: string = 'HH:mm:ss'
): boolean {
  return (
    compareTimes(time, start, format) >= 0 &&
    compareTimes(time, end, format) <= 0
  )
}

/**
 * 检查时间是否在禁用时间段内
 */
export function isTimeInDisabledRanges(
  time: string,
  disabledRanges: DisabledTimeRange[],
  format: string = 'HH:mm:ss'
): boolean {
  return disabledRanges.some(range => {
    return isTimeInRange(time, range.start, range.end, format)
  })
}

/**
 * 检查小时是否禁用
 */
export function isHourDisabled(
  hour: number,
  disabledHours?: number[] | ((hour: number) => boolean)
): boolean {
  if (Array.isArray(disabledHours)) {
    return disabledHours.includes(hour)
  }

  if (typeof disabledHours === 'function') {
    return disabledHours(hour)
  }

  return false
}

/**
 * 检查分钟是否禁用
 */
export function isMinuteDisabled(
  hour: number,
  minute: number,
  disabledMinutes?: number[] | ((hour: number, minute: number) => boolean)
): boolean {
  if (Array.isArray(disabledMinutes)) {
    return disabledMinutes.includes(minute)
  }

  if (typeof disabledMinutes === 'function') {
    return disabledMinutes(hour, minute)
  }

  return false
}

/**
 * 检查秒是否禁用
 */
export function isSecondDisabled(
  hour: number,
  minute: number,
  second: number,
  disabledSeconds?: number[] | ((hour: number, minute: number, second: number) => boolean)
): boolean {
  if (Array.isArray(disabledSeconds)) {
    return disabledSeconds.includes(second)
  }

  if (typeof disabledSeconds === 'function') {
    return disabledSeconds(hour, minute, second)
  }

  return false
}

/**
 * 根据步长生成可选的小时列表
 */
export function generateHours(step: number = 1): number[] {
  const hours: number[] = []
  for (let h = 0; h < 24; h += step) {
    hours.push(h)
  }
  return hours
}

/**
 * 根据步长生成可选的分钟列表
 */
export function generateMinutes(step: number = 1): number[] {
  const minutes: number[] = []
  for (let m = 0; m < 60; m += step) {
    minutes.push(m)
  }
  return minutes
}

/**
 * 根据步长生成可选的秒列表
 */
export function generateSeconds(step: number = 1): number[] {
  const seconds: number[] = []
  for (let s = 0; s < 60; s += step) {
    seconds.push(s)
  }
  return seconds
}

/**
 * 获取下一个可用时间
 */
export function getNextAvailableTime(
  currentTime: string,
  step: TimePickerStep,
  format: string = 'HH:mm:ss'
): string {
  const parsed = parseTime(currentTime, format)
  if (!parsed) {
    return '00:00:00'
  }

  let { hour, minute, second } = parsed

  // 增加秒
  second += step.second || 1
  if (second >= 60) {
    second = 0
    minute += step.minute || 1
    if (minute >= 60) {
      minute = 0
      hour += step.hour || 1
      if (hour >= 24) {
        hour = 0
      }
    }
  }

  return formatTime(hour, minute, second, format)
}

/**
 * 获取上一个可用时间
 */
export function getPreviousAvailableTime(
  currentTime: string,
  step: TimePickerStep,
  format: string = 'HH:mm:ss'
): string {
  const parsed = parseTime(currentTime, format)
  if (!parsed) {
    return '23:59:59'
  }

  let { hour, minute, second } = parsed

  // 减少秒
  second -= step.second || 1
  if (second < 0) {
    second = 59
    minute -= step.minute || 1
    if (minute < 0) {
      minute = 59
      hour -= step.hour || 1
      if (hour < 0) {
        hour = 23
      }
    }
  }

  return formatTime(hour, minute, second, format)
}

/**
 * 获取当前时间字符串
 */
export function getCurrentTime(format: string = 'HH:mm:ss'): string {
  const now = new Date()
  return formatTime(now.getHours(), now.getMinutes(), now.getSeconds(), format)
}

/**
 * 转换时间格式
 */
export function convertTimeFormat(
  time: string,
  fromFormat: string,
  toFormat: string
): string | null {
  const parsed = parseTime(time, fromFormat)
  if (!parsed) {
    return null
  }

  return formatTime(parsed.hour, parsed.minute, parsed.second, toFormat)
}

/**
 * 检查时间范围是否有效
 */
export function isValidTimeRange(startTime: string, endTime: string, format: string = 'HH:mm:ss'): boolean {
  return compareTimes(startTime, endTime, format) <= 0
}

/**
 * 格式化时间范围
 */
export function formatTimeRange(
  startTime: string,
  endTime: string,
  separator: string = '-',
  _format: string = 'HH:mm:ss'
): string {
  return `${startTime} ${separator} ${endTime}`
}

/**
 * 解析时间范围
 */
export function parseTimeRange(
  timeRange: string,
  separator: string = '-',
  format: string = 'HH:mm:ss'
): [string, string] | null {
  if (!timeRange) {
    return null
  }

  const parts = timeRange.split(separator)
  if (parts.length === 2) {
    const startTime = parts[0].trim()
    const endTime = parts[1].trim()

    if (isValidTime(startTime, format) && isValidTime(endTime, format)) {
      return [startTime, endTime]
    }
  }

  return null
}

/**
 * 计算两个时间之间的差值（秒）
 */
export function getTimeDifferenceInSeconds(
  time1: string,
  time2: string,
  format: string = 'HH:mm:ss'
): number {
  const parsed1 = parseTime(time1, format)
  const parsed2 = parseTime(time2, format)

  if (!parsed1 || !parsed2) {
    return 0
  }

  const seconds1 = parsed1.hour * 3600 + parsed1.minute * 60 + parsed1.second
  const seconds2 = parsed2.hour * 3600 + parsed2.minute * 60 + parsed2.second

  return Math.abs(seconds2 - seconds1)
}

/**
 * 添加时间
 */
export function addTime(
  time: string,
  hours: number = 0,
  minutes: number = 0,
  seconds: number = 0,
  format: string = 'HH:mm:ss'
): string | null {
  const parsed = parseTime(time, format)
  if (!parsed) {
    return null
  }

  let totalSeconds =
    parsed.hour * 3600 +
    parsed.minute * 60 +
    parsed.second +
    hours * 3600 +
    minutes * 60 +
    seconds

  // 处理跨天
  totalSeconds = totalSeconds % (24 * 3600)
  if (totalSeconds < 0) {
    totalSeconds += 24 * 3600
  }

  const newHour = Math.floor(totalSeconds / 3600)
  const newMinute = Math.floor((totalSeconds % 3600) / 60)
  const newSecond = totalSeconds % 60

  return formatTime(newHour, newMinute, newSecond, format)
}
