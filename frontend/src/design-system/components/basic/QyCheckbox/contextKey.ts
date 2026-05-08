/**
 * QyCheckbox Group Context Key
 */

import { type InjectionKey, type Ref } from 'vue'

/**
 * QyCheckboxGroup 上下文类型
 */
export interface QyCheckboxGroupContext {
  /**
   * v-model 绑定值
   */
  modelValue: Ref<string[]>
  /**
   * 是否禁用
   */
  disabled: Ref<boolean>
  /**
   * 尺寸
   */
  size: Ref<'sm' | 'md' | 'lg'>
  /**
   * 处理变化
   */
  handleChange: (value: string, checked: boolean) => void
}

/**
 * Checkbox Group 注入键
 */
export const CHECKBOX_GROUP_KEY: InjectionKey<QyCheckboxGroupContext> = Symbol('QyCheckboxGroupKey')
