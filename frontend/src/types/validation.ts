/**
 * 表单验证类型定义
 * 用于统一验证规则、错误提示和验证状态管理
 */

/**
 * 验证规则类型
 */
export type ValidationRuleType =
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

/**
 * 验证值类型
 */
export type ValidationValue = string | number | boolean | null | undefined | unknown[]

/**
 * 自定义验证器函数类型
 */
export type ValidatorFunction = (
  value: ValidationValue
) => boolean | string | Promise<boolean | string>

/**
 * 验证规则配置
 */
export interface ValidationRuleConfig {
  type: ValidationRuleType
  message?: string
  value?: number | RegExp
  validator?: ValidatorFunction
  trigger?: 'blur' | 'change'
}

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean
  message?: string
  field?: string
}

/**
 * 表单验证规则映射
 */
export type FormValidationRules = Record<string, ValidationRuleConfig[]>

/**
 * 表单验证错误映射
 */
export type FormValidationErrors = Record<string, string>

/**
 * 表单验证结果
 */
export interface FormValidationResult {
  valid: boolean
  errors: FormValidationErrors
}

/**
 * 通用表单规则类型
 */
export interface FormRule {
  required?: boolean
  message?: string
  trigger?: 'blur' | 'change'
  validator?: (
    rule: FormRule,
    value: ValidationValue,
    callback: (error?: Error) => void
  ) => void | Promise<void>
  min?: number
  max?: number
  pattern?: RegExp
  type?: 'string' | 'number' | 'boolean' | 'array' | 'email' | 'url'
}

/**
 * 表单引用类型
 */
export interface FormRef {
  validate: () => Promise<boolean>
  validateField: (props: string | string[]) => Promise<boolean>
  resetFields: () => void
  clearValidate: (props?: string | string[]) => void
  scrollToField: (prop: string) => void
  fields: unknown[]
  model: Record<string, ValidationValue>
  rules?: Record<string, FormRule[]>
}
