/**
 * 输入验证工具
 * 提供输入验证和清理功能
 */

// @ts-ignore - DOMPurify使用CommonJS导出
import DOMPurify from 'dompurify'

// 常量定义
const MAX_COMMENT_LENGTH = 500
const MAX_MESSAGE_LENGTH = 1000
const MAX_AI_INPUT_LENGTH = 10000
const MIN_AMOUNT = 0.01
const MAX_AMOUNT = 999999.99

export interface ValidationResult {
  valid: boolean
  sanitized?: string
  error?: string
}

/**
 * 基础长度验证
 * @param input 输入字符串
 * @param maxLength 最大长度
 * @returns 是否有效
 */
export function validateInputLength(input: string, maxLength: number): boolean {
  // 空字符串是有效的（长度为0 <= maxLength）
  if (input === '') return true
  if (!input || typeof input !== 'string') return false
  return input.length <= maxLength
}

/**
 * 清理和验证输入
 * - 移除控制字符（保留换行符和制表符）
 * - 限制长度
 * - 修剪首尾空格
 * @param input 输入字符串
 * @param maxLength 最大长度
 * @returns 清理后的字符串
 */
export function validateAndSanitize(input: string, maxLength: number): string {
  if (!input || typeof input !== 'string') return ''

  // 移除控制字符（保留换行符 \n、制表符 \t、回车符 \r）
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  // 限制长度
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  return sanitized.trim()
}

/**
 * 评论验证
 * @param input 评论输入
 * @returns 验证结果
 */
export function validateComment(input: string): ValidationResult {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: '评论不能为空' }
  }

  // 先移除HTML标签（XSS防护）
  const textOnly = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
  const sanitized = validateAndSanitize(textOnly, MAX_COMMENT_LENGTH)

  if (sanitized.length === 0) {
    return { valid: false, error: '评论不能为空' }
  }

  if (input.length > MAX_COMMENT_LENGTH) {
    return { valid: false, error: `评论长度不能超过${MAX_COMMENT_LENGTH}字符` }
  }

  return { valid: true, sanitized }
}

/**
 * 消息验证
 * @param input 消息输入
 * @returns 验证结果
 */
export function validateMessage(input: string): ValidationResult {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: '消息不能为空' }
  }

  const sanitized = validateAndSanitize(input, MAX_MESSAGE_LENGTH)

  if (sanitized.length === 0) {
    return { valid: false, error: '消息不能为空' }
  }

  if (input.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `消息长度不能超过${MAX_MESSAGE_LENGTH}字符` }
  }

  return { valid: true, sanitized }
}

/**
 * AI输入验证
 * @param input AI输入
 * @returns 验证结果
 */
export function validateAIInput(input: string): ValidationResult {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: '输入不能为空' }
  }

  const sanitized = validateAndSanitize(input, MAX_AI_INPUT_LENGTH)

  if (sanitized.length === 0) {
    return { valid: false, error: '输入不能为空' }
  }

  if (input.length > MAX_AI_INPUT_LENGTH) {
    return { valid: false, error: `输入长度不能超过${MAX_AI_INPUT_LENGTH}字符` }
  }

  return { valid: true, sanitized }
}

/**
 * 金额验证
 * @param amount 金额（字符串或数字）
 * @returns 是否有效
 */
export function validateAmount(amount: string | number): boolean {
  let numAmount: number

  if (typeof amount === 'string') {
    // 验证字符串格式：数字，最多两位小数
    if (!/^\d+(\.\d{1,2})?$/.test(amount)) return false
    numAmount = parseFloat(amount)
  } else if (typeof amount === 'number') {
    numAmount = amount
  } else {
    return false
  }

  // 验证数值范围
  return numAmount >= MIN_AMOUNT && numAmount <= MAX_AMOUNT && !isNaN(numAmount)
}

/**
 * 格式化金额显示
 * @param amount 金额
 * @returns 格式化后的字符串（两位小数）
 */
export function formatAmount(amount: number): string {
  return amount.toFixed(2)
}
