/**
 * Form 和 FormItem 组件类型定义
 */

// Form 尺寸
export type FormSize = 'sm' | 'md' | 'lg'

// FormItem 标签位置
export type LabelPosition = 'left' | 'right' | 'top'

// 表单验证触发时机
export type ValidateTrigger = 'blur' | 'change' | 'submit'

// 表单验证规则类型
export interface FormRule {
  /**
   * 是否必填
   */
  required?: boolean

  /**
   * 错误提示信息
   */
  message?: string

  /**
   * 触发验证的时机
   */
  trigger?: ValidateTrigger | ValidateTrigger[]

  /**
   * 最小长度/值
   */
  min?: number

  /**
   * 最大长度/值
   */
  max?: number

  /**
   * 精确长度
   */
  len?: number

  /**
   * 正则表达式验证
   */
  pattern?: RegExp

  /**
   * 自定义验证器
   */
  validator?: (rule: FormRule, value: any) => boolean | Promise<boolean> | string | Promise<string>
}

// 表单字段类型
export type FormFieldValue = string | number | boolean | Date | any[] | Record<string, any> | null | undefined

// 表单数据模型
export type FormModel = Record<string, FormFieldValue>

// 表单验证规则集合
export type FormRules = Record<string, FormRule[]>

// 表单项验证状态
export interface FormItemValidationStatus {
  /**
   * 是否正在验证
   */
  validating?: boolean

  /**
   * 错误信息
   */
  error?: string

  /**
   * 是否验证通过
   */
  passed?: boolean
}

// Form 组件 Props 接口
export interface FormProps {
  /**
   * 表单数据对象
   */
  model?: FormModel

  /**
   * 验证规则
   */
  rules?: FormRules

  /**
   * 标签宽度
   * @default 'auto'
   */
  labelWidth?: string

  /**
   * 标签位置
   * @default 'right'
   */
  labelPosition?: LabelPosition

  /**
   * 统一尺寸
   * @default 'md'
   */
  size?: FormSize

  /**
   * 全局禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 规则改变时是否验证
   * @default true
   */
  validateOnRuleChange?: boolean

  /**
   * 是否在标签后显示冒号
   * @default true
   */
  showColon?: boolean

  /**
   * 是否显示必填星号
   * @default true
   */
  requireAsterisk?: boolean

  /**
   * 自定义类名
   */
  class?: any
}

// Form 组件默认属性
export const formDefaults = {
  labelWidth: 'auto',
  labelPosition: 'right' as const,
  size: 'md' as const,
  disabled: false,
  validateOnRuleChange: true,
  showColon: true,
  requireAsterisk: true,
}

// Form 组件 Events 接口
export interface FormEmits {
  /**
   * 表单验证成功
   */
  validate: []

  /**
   * 表单验证失败
   */
  'validate-failed': [errors: Record<string, string[]>]

  /**
   * 表单值改变
   */
  change: [model: FormModel]
}

// FormItem 组件 Props 接口
export interface FormItemProps {
  /**
   * 表单域模型字段
   */
  prop?: string

  /**
   * 标签文本
   */
  label?: string

  /**
   * 标签宽度
   */
  labelWidth?: string

  /**
   * 是否必填
   * @default false
   */
  required?: boolean

  /**
   * 验证规则
   */
  rules?: FormRule[]

  /**
   * 错误信息
   */
  error?: string

  /**
   * 是否显示错误信息
   * @default true
   */
  showMessage?: boolean

  /**
   * 是否显示行内
   * @default false
   */
  inline?: boolean

  /**
   * 表单项尺寸
   */
  size?: FormSize

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 自定义类名
   */
  class?: any
}

// FormItem 组件默认属性
export const formItemDefaults = {
  required: false,
  showMessage: true,
  inline: false,
  disabled: false,
}

// FormItem 组件 Events 接口
export interface FormItemEmits {
  /**
   * 表单项值改变
   */
  change: [value: any]

  /**
   * 表单项验证通过
   */
  validate: []

  /**
   * 表单项验证失败
   */
  'validate-failed': [error: string]
}

// 表单验证错误类型
export interface FormValidationErrors {
  [key: string]: string[]
}

// 表单验证结果
export interface FormValidationResult {
  /**
   * 是否验证通过
   */
  valid: boolean

  /**
   * 错误信息
   */
  errors: FormValidationErrors
}

// 表单上下文类型（通过 provide/inject 传递）
export interface FormContext {
  model: FormModel
  rules?: FormRules
  labelWidth: string
  labelPosition: LabelPosition
  size: FormSize
  disabled: boolean
  showColon: boolean
  requireAsterisk: boolean

  /**
   * 注册表单项
   */
  registerItem: (prop: string, item: FormItemInstance) => void

  /**
   * 注销表单项
   */
  unregisterItem: (prop: string) => void

  /**
   * 验证指定字段
   */
  validateField: (prop: string) => Promise<boolean>

  /**
   * 清除字段验证
   */
  clearFieldValidation: (prop: string) => void
}

// FormItem 实例接口
export interface FormItemInstance {
  /**
   * 验证表单项
   */
  validate: () => Promise<boolean>

  /**
   * 清除验证
   */
  clearValidation: () => void

  /**
   * 重置表单项
   */
  resetField: () => void

  /**
   * 设置错误信息
   */
  setError: (error: string) => void

  /**
   * 获取当前值
   */
  getValue: () => any

  /**
   * 设置值
   */
  setValue: (value: any) => void
}

// Form 暴露的方法
export interface FormInstance {
  /**
   * 验证整个表单
   */
  validate: () => Promise<boolean>

  /**
   * 验证指定字段
   */
  validateField: (props: string | string[]) => Promise<boolean>

  /**
   * 重置表单
   */
  resetFields: () => void

  /**
   * 清除验证
   */
  clearValidation: (props?: string | string[]) => void

  /**
   * 获取表单数据
   */
  getFormData: () => FormModel

  /**
   * 设置表单数据
   */
  setFormData: (data: Partial<FormModel>) => void
}
