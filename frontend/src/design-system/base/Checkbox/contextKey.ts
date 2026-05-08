/**
 * Checkbox 组件共享的上下文 Key
 *
 * 用于 Checkbox 和 CheckboxGroup 之间的通信
 */

import { type InjectionKey } from 'vue'
import type { CheckboxProps } from './types'

export interface CheckboxGroupContext {
  modelValue: { value: string[] }
  disabled: { value: boolean }
  size: { value: CheckboxProps['size'] }
  toggle: (value: string | number | boolean) => void
  isChecked: (value: string | number | boolean) => boolean
}

export const CHECKBOX_GROUP_KEY: InjectionKey<CheckboxGroupContext> = Symbol('checkboxGroup')
