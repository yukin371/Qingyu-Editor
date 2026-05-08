/**
 * QyForm 表单组件类型定义
 * 与 Element Plus Form API 兼容
 */

// QyForm 标签位置
export type QyFormLabelPosition = 'left' | 'top' | 'right'

// QyForm 验证触发时机
export type QyValidateTrigger = 'blur' | 'change' | 'submit'

// QyForm Props 接口
export interface QyFormProps {
  /**
   * 表单数据对象 (v-model)
   */
  modelValue: Record<string, any>

  /**
   * 验证规则
   */
  rules?: Record<string, QyValidationRule[]>

  /**
   * 标签宽度
   * @default '100px'
   */
  labelWidth?: string

  /**
   * 标签位置
   * @default 'top'
   */
  labelPosition?: QyFormLabelPosition
}

// QyForm Events 接口
export interface QyFormEmits {
  /**
   * 表单数据更新事件 (v-model)
   */
  (e: 'update:modelValue', value: Record<string, any>): void

  /**
   * 表单验证事件
   */
  (e: 'validate', valid: boolean): void

  /**
   * 表单提交事件
   */
  (e: 'submit', event: Event): void
}

// QyFormItem Props 接口
export interface QyFormItemProps {
  /**
   * 表单域模型字段（用于验证）
   */
  prop?: string

  /**
   * 标签文本
   */
  label?: string

  /**
   * 标签宽度（覆盖表单级别）
   */
  labelWidth?: string

  /**
   * 是否必填
   */
  required?: boolean

  /**
   * 错误信息（外部控制）
   */
  error?: string
}

// QyFormItem 实例接口
export interface QyFormItemInstance {
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
}

// QyForm 实例接口（暴露给父组件）
export interface QyFormInstance {
  /**
   * 验证整个表单
   */
  validate: () => Promise<boolean>

  /**
   * 验证指定字段
   */
  validateFields: (props: string | string[]) => Promise<boolean>

  /**
   * 重置表单
   */
  resetFields: () => void

  /**
   * 清除验证
   */
  clearValidation: (props?: string | string[]) => void
}

// QyValidationRule 验证规则接口
export interface QyValidationRule {
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
  trigger?: QyValidateTrigger | QyValidateTrigger[]

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
  validator?: (rule: QyValidationRule, value: any) => boolean | Promise<boolean> | string | Promise<string>
}

// QyForm 表单上下文（通过 provide/inject 传递）
export interface QyFormContext {
  model: Record<string, any>
  rules?: Record<string, QyValidationRule[]>
  labelWidth: string
  labelPosition: QyFormLabelPosition

  /**
   * 注册表单项
   */
  registerItem: (prop: string, item: QyFormItemInstance) => void

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
