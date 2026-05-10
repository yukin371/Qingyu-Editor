/**
 * 表单验证辅助工具
 * 提供统一的验证规则、错误提示和验证状态管理
 */

import { message } from '@/design-system/services'
import { log, LogCategory } from './logger'
import type {
  ValidationValue,
  ValidatorFunction,
  FormValidationRules,
  FormValidationErrors,
  ElFormRule
} from '@/types/validation'

export type ValidationRule =
  | 'required'
  | 'email'
  | 'phone'
  | 'username'
  | 'password'
  | 'url'
  | 'number'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'custom'

export interface ValidationRuleConfig {
  type: ValidationRule
  message?: string
  value?: number | RegExp
  validator?: ValidatorFunction
  trigger?: 'blur' | 'change'
}

export interface ValidationResult {
  valid: boolean
  message?: string
  field?: string
}

/**
 * 常用正则表达式
 */
export const RegexPatterns = {
  // 用户名：3-20个字符，只能包含字母、数字和下划线
  username: /^[a-zA-Z0-9_]{3,20}$/,

  // 邮箱
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // 手机号（中国大陆）
  phone: /^1[3-9]\d{9}$/,

  // 密码：至少6位，包含字母和数字
  password: /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/,

  // 强密码：至少8位，包含大小写字母、数字和特殊字符
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

  // URL
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,

  // 身份证号（中国大陆）
  idCard: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,

  // 数字（包括小数）
  number: /^-?\d+(\.\d+)?$/,

  // 正整数
  positiveInteger: /^[1-9]\d*$/,

  // 中文
  chinese: /^[\u4e00-\u9fa5]+$/
}

/**
 * 默认错误提示消息
 */
export const DefaultMessages = {
  required: '此字段为必填项',
  email: '请输入有效的邮箱地址',
  phone: '请输入有效的手机号码',
  username: '用户名长度在3-20个字符，只能包含字母、数字和下划线',
  password: '密码至少6位，且必须包含字母和数字',
  strongPassword: '密码至少8位，且必须包含大小写字母、数字和特殊字符',
  url: '请输入有效的URL地址',
  number: '请输入有效的数字',
  min: '不能小于最小值',
  max: '不能大于最大值',
  minLength: '长度不能少于最小值',
  maxLength: '长度不能超过最大值',
  pattern: '格式不正确',
  custom: '验证失败'
}

/**
 * 验证器类
 */
export class FormValidator {
  /**
   * 验证单个值
   */
  static validate(value: ValidationValue, rules: ValidationRuleConfig[]): ValidationResult {
    for (const rule of rules) {
      const result = this.validateByRule(value, rule)
      if (!result.valid) {
        return result
      }
    }
    return { valid: true }
  }

  /**
   * 根据规则验证
   */
  private static validateByRule(value: ValidationValue, rule: ValidationRuleConfig): ValidationResult {
    const { type, message, value: ruleValue } = rule

    try {
      switch (type) {
        case 'required':
          return this.validateRequired(value, message)

        case 'email':
          return this.validateEmail(value, message)

        case 'phone':
          return this.validatePhone(value, message)

        case 'username':
          return this.validateUsername(value, message)

        case 'password':
          return this.validatePassword(value, message)

        case 'url':
          return this.validateUrl(value, message)

        case 'number':
          return this.validateNumber(value, message)

        case 'min':
          return this.validateMin(value, ruleValue as number, message)

        case 'max':
          return this.validateMax(value, ruleValue as number, message)

        case 'minLength':
          return this.validateMinLength(value, ruleValue as number, message)

        case 'maxLength':
          return this.validateMaxLength(value, ruleValue as number, message)

        case 'pattern':
          return this.validatePattern(value, ruleValue as RegExp, message)

        case 'custom':
          return { valid: true } // custom validation should be handled separately with async validateCustom

        default:
          return { valid: true }
      }
    } catch (error) {
      log.error(LogCategory.COMPONENT, 'Validation error', error)
      return {
        valid: false,
        message: message || DefaultMessages.custom
      }
    }
  }

  /**
   * 验证必填
   */
  static validateRequired(value: ValidationValue, message?: string): ValidationResult {
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      return {
        valid: false,
        message: message || DefaultMessages.required
      }
    }
    return { valid: true }
  }

  /**
   * 验证邮箱
   */
  static validateEmail(value: ValidationValue, message?: string): ValidationResult {
    if (!value) return { valid: true }
    if (typeof value !== 'string' || !RegexPatterns.email.test(value)) {
      return {
        valid: false,
        message: message || DefaultMessages.email
      }
    }
    return { valid: true }
  }

  /**
   * 验证手机号
   */
  static validatePhone(value: ValidationValue, message?: string): ValidationResult {
    if (!value) return { valid: true }
    if (typeof value !== 'string' || !RegexPatterns.phone.test(value)) {
      return {
        valid: false,
        message: message || DefaultMessages.phone
      }
    }
    return { valid: true }
  }

  /**
   * 验证用户名
   */
  static validateUsername(value: ValidationValue, message?: string): ValidationResult {
    if (!value) return { valid: true }
    if (typeof value !== 'string' || !RegexPatterns.username.test(value)) {
      return {
        valid: false,
        message: message || DefaultMessages.username
      }
    }
    return { valid: true }
  }

  /**
   * 验证密码
   */
  static validatePassword(value: ValidationValue, message?: string): ValidationResult {
    if (!value) return { valid: true }
    if (typeof value !== 'string' || !RegexPatterns.password.test(value)) {
      return {
        valid: false,
        message: message || DefaultMessages.password
      }
    }
    return { valid: true }
  }

  /**
   * 验证URL
   */
  static validateUrl(value: ValidationValue, message?: string): ValidationResult {
    if (!value) return { valid: true }
    if (typeof value !== 'string' || !RegexPatterns.url.test(value)) {
      return {
        valid: false,
        message: message || DefaultMessages.url
      }
    }
    return { valid: true }
  }

  /**
   * 验证数字
   */
  static validateNumber(value: ValidationValue, message?: string): ValidationResult {
    if (!value) return { valid: true }
    if (!RegexPatterns.number.test(String(value))) {
      return {
        valid: false,
        message: message || DefaultMessages.number
      }
    }
    return { valid: true }
  }

  /**
   * 验证最小值
   */
  static validateMin(value: ValidationValue, min: number, message?: string): ValidationResult {
    if (!value) return { valid: true }
    const numValue = Number(value)
    if (isNaN(numValue) || numValue < min) {
      return {
        valid: false,
        message: message || `${DefaultMessages.min}：${min}`
      }
    }
    return { valid: true }
  }

  /**
   * 验证最大值
   */
  static validateMax(value: ValidationValue, max: number, message?: string): ValidationResult {
    if (!value) return { valid: true }
    const numValue = Number(value)
    if (isNaN(numValue) || numValue > max) {
      return {
        valid: false,
        message: message || `${DefaultMessages.max}：${max}`
      }
    }
    return { valid: true }
  }

  /**
   * 验证最小长度
   */
  static validateMinLength(value: ValidationValue, minLength: number, message?: string): ValidationResult {
    if (!value) return { valid: true }
    const strValue = String(value)
    if (strValue.length < minLength) {
      return {
        valid: false,
        message: message || `${DefaultMessages.minLength}：${minLength}个字符`
      }
    }
    return { valid: true }
  }

  /**
   * 验证最大长度
   */
  static validateMaxLength(value: ValidationValue, maxLength: number, message?: string): ValidationResult {
    if (!value) return { valid: true }
    const strValue = String(value)
    if (strValue.length > maxLength) {
      return {
        valid: false,
        message: message || `${DefaultMessages.maxLength}：${maxLength}个字符`
      }
    }
    return { valid: true }
  }

  /**
   * 验证正则表达式
   */
  static validatePattern(value: ValidationValue, pattern: RegExp, message?: string): ValidationResult {
    if (!value) return { valid: true }
    if (!pattern.test(String(value))) {
      return {
        valid: false,
        message: message || DefaultMessages.pattern
      }
    }
    return { valid: true }
  }

  /**
   * 自定义验证
   */
  static async validateCustom(
    value: ValidationValue,
    validator: ValidatorFunction | undefined,
    message?: string
  ): Promise<ValidationResult> {
    if (!validator) return { valid: true }

    try {
      const result = await validator(value)
      if (result === true) {
        return { valid: true }
      }
      return {
        valid: false,
        message: typeof result === 'string' ? result : (message || DefaultMessages.custom)
      }
    } catch (error) {
      log.error(LogCategory.COMPONENT, 'Custom validation error', error)
      return {
        valid: false,
        message: message || DefaultMessages.custom
      }
    }
  }

  /**
   * 验证整个表单
   */
  static async validateForm(
    formData: Record<string, ValidationValue>,
    rules: FormValidationRules
  ): Promise<{ valid: boolean; errors: FormValidationErrors }> {
    const errors: FormValidationErrors = {}

    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = formData[field]
      const result = this.validate(value, fieldRules)

      if (!result.valid) {
        errors[field] = result.message || '验证失败'
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    }
  }
}

/**
 * 表单规则构建器
 */
export class ElFormRuleBuilder {
  private rules: ValidationRuleConfig[] = []

  /**
   * 添加必填规则
   */
  required(message?: string, trigger: 'blur' | 'change' = 'blur'): this {
    this.rules.push({
      type: 'required',
      message,
      trigger
    })
    return this
  }

  /**
   * 添加邮箱规则
   */
  email(message?: string, trigger: 'blur' | 'change' = 'blur'): this {
    this.rules.push({
      type: 'email',
      message,
      trigger
    })
    return this
  }

  /**
   * 添加手机号规则
   */
  phone(message?: string, trigger: 'blur' | 'change' = 'blur'): this {
    this.rules.push({
      type: 'phone',
      message,
      trigger
    })
    return this
  }

  /**
   * 添加用户名规则
   */
  username(message?: string, trigger: 'blur' | 'change' = 'blur'): this {
    this.rules.push({
      type: 'username',
      message,
      trigger
    })
    return this
  }

  /**
   * 添加密码规则
   */
  password(message?: string, trigger: 'blur' | 'change' = 'blur'): this {
    this.rules.push({
      type: 'password',
      message,
      trigger
    })
    return this
  }

  /**
   * 添加最小长度规则
   */
  minLength(min: number, message?: string, trigger: 'blur' | 'change' = 'blur'): this {
    this.rules.push({
      type: 'minLength',
      value: min,
      message,
      trigger
    })
    return this
  }

  /**
   * 添加最大长度规则
   */
  maxLength(max: number, message?: string, trigger: 'blur' | 'change' = 'blur'): this {
    this.rules.push({
      type: 'maxLength',
      value: max,
      message,
      trigger
    })
    return this
  }

  /**
   * 添加自定义规则
   */
  custom(
    validator: ValidatorFunction,
    message?: string,
    trigger: 'blur' | 'change' = 'blur'
  ): this {
    this.rules.push({
      type: 'custom',
      validator,
      message,
      trigger
    })
    return this
  }

  /**
   * 构建表单规则
   */
  build(): ElFormRule[] {
    return this.rules.map(rule => ({
      required: rule.type === 'required',
      validator: rule.validator ? async (_rule: ElFormRule, value: ValidationValue, callback: (error?: Error) => void) => {
        if (rule.type === 'custom' && rule.validator) {
          const result = await FormValidator.validateCustom(value, rule.validator, rule.message)
          if (!result.valid) {
            callback(new Error(result.message || DefaultMessages.custom))
          } else {
            callback()
          }
        } else {
          callback()
        }
      } : undefined,
      message: rule.message || DefaultMessages[rule.type],
      trigger: rule.trigger || 'blur'
    }))
  }

  /**
   * 构建自定义规则数组
   */
  buildRaw(): ValidationRuleConfig[] {
    return [...this.rules]
  }
}

/**
 * 表单错误提示工具
 */
export class FormErrorHelper {
  /**
   * 显示表单错误
   */
  static showErrors(errors: Record<string, string>, options?: { showToast?: boolean; scrollToError?: boolean }) {
    const { showToast = true, scrollToError = true } = options || {}

    // 记录日志
    log.warn(LogCategory.COMPONENT, 'Form validation errors', errors)

    // 显示提示
    if (showToast && Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0]
      message.error(firstError)
    }

    // 滚动到第一个错误字段
    if (scrollToError) {
      this.scrollToFirstError(errors)
    }
  }

  /**
   * 滚动到第一个错误字段
   */
  private static scrollToFirstError(errors: Record<string, string>) {
    const firstField = Object.keys(errors)[0]
    const errorElement = document.querySelector(`[prop="${firstField}"]`)
    if (errorElement) {
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  /**
   * 清除表单错误
   */
  static clearErrors(formRef: { clearValidate?: () => void } | null | undefined): void {
    if (formRef && typeof formRef.clearValidate === 'function') {
      formRef.clearValidate()
    }
  }

  /**
   * 高亮错误字段
   */
  static highlightError(fieldName: string) {
    const element = document.querySelector(`[prop="${fieldName}"]`)
    if (element) {
      element.classList.add('error-highlight')
      setTimeout(() => {
        element.classList.remove('error-highlight')
      }, 3000)
    }
  }
}

/**
 * 快捷方法
 */
export const createRuleBuilder = () => new ElFormRuleBuilder()

export const validate = {
  required: (message?: string) => createRuleBuilder().required(message),
  email: (message?: string) => createRuleBuilder().email(message),
  phone: (message?: string) => createRuleBuilder().phone(message),
  username: (message?: string) => createRuleBuilder().username(message),
  password: (message?: string) => createRuleBuilder().password(message),
  minLength: (min: number, message?: string) => createRuleBuilder().minLength(min, message),
  maxLength: (max: number, message?: string) => createRuleBuilder().maxLength(max, message)
}

export default FormValidator
