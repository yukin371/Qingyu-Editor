/**
 * 格式化工具函数
 */

/**
 * 格式化数字（万为单位）
 */
export function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

/**
 * 格式化时间为相对时间
 */
export function formatRelativeTime(time: string | Date): string {
  const date = time instanceof Date ? time : new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  if (days < 365) return `${Math.floor(days / 30)}个月前`

  return `${Math.floor(days / 365)}年前`
}

/**
 * 格式化日期
 */
export function formatDate(date: string | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return '-'

  const d = date instanceof Date ? date : new Date(date)

  if (isNaN(d.getTime())) return '-'

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

/**
 * 格式化阅读时长
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) return '不到1分钟'
  if (minutes < 60) return `${Math.round(minutes)}分钟`

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = Math.round(minutes % 60)

  if (remainingMinutes === 0) return `${hours}小时`
  return `${hours}小时${remainingMinutes}分钟`
}

/**
 * 格式化价格
 * 注意：price 参数应该是分（后端返回的单位）
 * 使用 formatCurrency 替代，此函数保留用于向后兼容
 * @deprecated 使用 formatCurrency 替代
 */
export function formatPrice(price: number, currency: string = '¥'): string {
  // 如果传入的 price 是分（后端单位），需要转换
  // 为了向后兼容，假设传入的是元（旧代码），不转换
  // 新代码应该使用 formatCurrency
  return `${currency}${price.toFixed(2)}`
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength: number, ellipsis: string = '...'): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + ellipsis
}

/**
 * 格式化百分比
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`
}

