/**
 * Form 组件导出
 *
 * 导出 Form 和 FormItem 组件及其相关类型
 */

// Form 组件
export { default as Form } from './Form.vue'
export { default as FormItem } from './FormItem.vue'

// 类型定义
export type {
  FormProps,
  FormEmits,
  FormRules,
  FormModel,
  FormRule,
  FormSize,
  LabelPosition,
  ValidateTrigger,
  FormContext,
  FormInstance,
  FormItemProps,
  FormItemEmits,
  FormItemInstance,
  FormValidationErrors,
  FormValidationResult,
} from './types'
