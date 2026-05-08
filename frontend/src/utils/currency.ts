/**
 * Currency utility functions
 * 后端金额单位为分(int64)，前端显示单位为元
 * 所有与后端交互时需要将元转为分，显示时需要将分转为元
 */

/**
 * 将分转换为元（用于显示）
 * @param cents 金额（分）
 * @param decimals 保留小数位数，默认2位
 * @returns 金额（元）
 * @example
 * centsToYuan(100) // 1.00
 * centsToYuan(150) // 1.50
 * centsToYuan(99) // 0.99
 */
export function centsToYuan(cents: number, decimals: number = 2): number {
  if (!isFinite(cents)) return 0
  return Number((cents / 100).toFixed(decimals))
}

/**
 * 将元转换为分（用于提交到后端）
 * @param yuan 金额（元）
 * @returns 金额（分）
 * @example
 * yuanToCents(1.00) // 100
 * yuanToCents(1.5) // 150
 * yuanToCents(0.99) // 99
 */
export function yuanToCents(yuan: number): number {
  if (!isFinite(yuan)) return 0
  return Math.round(yuan * 100)
}

/**
 * 格式化金额显示（带货币符号）
 * @param cents 金额（分）
 * @param currency 货币符号，默认为 '¥'
 * @param decimals 保留小数位数，默认2位
 * @returns 格式化后的金额字符串
 * @example
 * formatCurrency(100) // '¥1.00'
 * formatCurrency(150) // '¥1.50'
 * formatCurrency(0) // '¥0.00'
 */
export function formatCurrency(cents: number, currency: string = '¥', decimals: number = 2): string {
  const yuan = centsToYuan(cents, decimals)
  return `${currency}${yuan.toFixed(decimals)}`
}

/**
 * 格式化金额显示（用于交易列表，带正负号）
 * @param cents 金额（分）
 * @param type 交易类型
 * @returns 格式化后的金额字符串
 * @example
 * formatTransactionAmount(100, 'recharge') // '+¥1.00'
 * formatTransactionAmount(100, 'purchase') // '-¥1.00'
 */
export function formatTransactionAmount(cents: number, type: string): string {
  const isIncome = type === 'recharge' || type === 'income' || type === 'reward'
  const prefix = isIncome ? '+' : '-'
  return `${prefix}${formatCurrency(Math.abs(cents))}`
}

/**
 * 验证金额是否有效
 * @param yuan 金额（元）
 * @param min 最小值（元），默认0
 * @param max 最大值（元），默认1000000
 * @returns 是否有效
 */
export function isValidAmount(yuan: number, min: number = 0, max: number = 1000000): boolean {
  return isFinite(yuan) && yuan >= min && yuan <= max && yuan >= 0.01
}

/**
 * 从输入字符串解析金额（分）
 * 支持用户输入 "1.99" 或直接数字 199
 * @param input 用户输入
 * @returns 金额（分）
 */
export function parseAmountInput(input: string | number): number {
  if (typeof input === 'number') {
    return yuanToCents(input)
  }
  const num = parseFloat(input)
  if (isNaN(num)) return 0
  return yuanToCents(num)
}
