/**
 * 管理员工具函数库 (Admin Utils)
 * 改进版 - v2.0
 */

// --- 格式化类 ---

/**
 * 格式化金额
 * @param amount 金额数值
 * @param currency 货币符号，默认 '¥'
 * @param placeholder 空值占位符，默认 '0.00'
 */
export function formatCurrency(
  amount: number | string | undefined | null, 
  currency: string = '¥',
  placeholder: string = '0.00'
): string {
  const num = Number(amount)
  if (Number.isNaN(num) || amount === null || amount === undefined) {
    return `${currency}${placeholder}`
  }
  return `${currency}${num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

/**
 * 格式化百分比
 * @param value 数值 (例如 0.123)
 * @param decimals 小数位，默认 1
 * @param multiplier 是否需要乘以100，默认 true (输入0.12 -> 12.0%)
 */
export function formatPercent(
  value: number | string | undefined | null, 
  decimals: number = 1, 
  multiplier: boolean = false
): string {
  let num = Number(value)
  if (Number.isNaN(num)) return '-'
  
  if (multiplier) num *= 100
  
  return `${num.toFixed(decimals)}%`
}

/**
 * 格式化大数字（支持负数，增强健壮性）
 */
export function formatLargeNumber(num: number | string): string {
  const n = Number(num)
  if (Number.isNaN(n)) return '0'

  const abs = Math.abs(n)
  if (abs >= 100000000) {
    return (n / 100000000).toFixed(2) + '亿'
  }
  if (abs >= 10000) {
    return (n / 10000).toFixed(2) + '万'
  }
  return n.toString()
}

/**
 * 计算增长率
 * @returns 增长百分比数值 (例如 20.5)，若分母为0返回 0
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (!previous || previous === 0) return 0
  return ((current - previous) / previous) * 100
}

// --- 导出类 ---

/**
 * CSV 列配置接口
 */
export interface CsvColumn {
  key: string // 数据字段名
  label: string // Excel显示的标题
}

/**
 * 导出CSV (增强版：支持中文字段映射)
 * @param data 数据源
 * @param filename 文件名
 * @param columns 列配置数组，如果不传则直接使用数据Key
 */
export function exportToCSV(
  data: any[], 
  filename: string, 
  columns?: CsvColumn[]
): void {
  if (!data || data.length === 0) {
    console.warn('Export CSV: No data available')
    return
  }

  // 1. 确定表头和Key
  const headers = columns ? columns.map(c => c.label) : Object.keys(data[0])
  const keys = columns ? columns.map(c => c.key) : Object.keys(data[0])

  // 2. 构建内容，添加 BOM 防止中文乱码
  let csvContent = '\ufeff' + headers.join(',') + '\n'

  data.forEach((row) => {
    const values = keys.map((key) => {
      let value = row[key]
      
      // 处理 null/undefined
      if (value === null || value === undefined) {
        return ''
      }
      
      value = String(value)
      // 处理 CSV 特殊字符（逗号、换行、双引号）
      if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    })
    csvContent += values.join(',') + '\n'
  })

  // 3. 下载逻辑
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${formatDate(new Date(), 'YYYYMMDDHHmmss')}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportToJSON(data: any, filename: string): void {
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${Date.now()}.json`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// --- 颜色类 ---

export function generateRandomColor(): string {
  // 使用位运算通常更快，但 strict 模式下建议显式转换
  return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')
}

/**
 * 增强版颜色生成：循环使用预设颜色，用完后再随机
 */
export function generateColorArray(count: number): string[] {
  const presetColors = [
    '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',
    '#36cfc9', '#f759ab', '#597ef7', '#9254de', '#ff9c6e'
  ]

  // 如果需要的数量巨大，建议用循环取模，保持颜色主题一致性，而不是纯随机
  const result: string[] = []
  for (let i = 0; i < count; i++) {
    if (i < presetColors.length) {
      result.push(presetColors[i])
    } else {
      // 方案A：随机 (保持你原有的逻辑)
      result.push(generateRandomColor())
      
      // 方案B（可选）：循环复用 (通常图表颜色复用比随机好)
      // result.push(presetColors[i % presetColors.length])
    }
  }
  return result
}

// --- 性能与工具类 ---

/**
 * 防抖函数 (修复 TS 类型)
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
) {
  // 浏览器环境下 setTimeout 返回 number
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const debounced = function (this: any, ...args: Parameters<T>) {
    const context = this
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }

  // 添加取消方法（在组件卸载时很有用）
  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return debounced
}

/**
 * 节流函数 (修复 TS 类型)
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
) {
  let inThrottle: boolean = false
  
  return function (this: any, ...args: Parameters<T>) {
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * 深拷贝 (使用现代 API)
 * 
 * 优先使用 structuredClone (支持 Date, Set, Map, RegExp, Circular Ref)
 * 兼容性：Chrome 98+, Node 17+
 */
export function deepClone<T>(obj: T): T {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(obj)
    } catch (e) {
      console.warn('structuredClone failed, falling back to JSON', e)
    }
  }
  
  // 简单的 JSON fallback (依然无法处理 Date/Set/Map，但比手写递归不容易出错)
  try {
    return JSON.parse(JSON.stringify(obj))
  } catch (e) {
    console.error('Deep clone failed', e)
    return obj // 最后的兜底，返回原对象
  }
}

/**
 * 生成唯一ID (使用 Crypto API)
 */
export function generateUniqueId(): string {
  // 优先使用标准 Crypto API
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback (替换了 deprecated 的 substr)
  return `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

// --- 验证类 ---

export function validateEmail(email: string): boolean {
  // 更严格的邮箱正则
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
  return re.test(email)
}

export function validatePhone(phone: string): boolean {
  // 宽松匹配中国大陆手机号 (1开头，第二位3-9，总11位)
  const re = /^1[3-9]\d{9}$/
  return re.test(phone)
}

// --- 内部辅助 ---

function formatDate(date: Date, format: string): string {
    // 简单的日期格式化辅助，用于文件名生成
    // 实际项目中建议使用 dayjs
    const pad = (n: number) => n.toString().padStart(2, '0')
    const map: any = {
        YYYY: date.getFullYear(),
        MM: pad(date.getMonth() + 1),
        DD: pad(date.getDate()),
        HH: pad(date.getHours()),
        mm: pad(date.getMinutes()),
        ss: pad(date.getSeconds())
    }
    return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (matched) => map[matched])
}