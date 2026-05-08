/**
 * QyRadio Group Context Key
 */

import { type InjectionKey, type Ref } from 'vue'

/**
 * QyRadioGroup 上下文类型
 */
export interface QyRadioGroupContext {
  /**
   * v-model 绑定值
   */
  modelValue: Ref<string | number | boolean>
  /**
   * 是否禁用
   */
  disabled: Ref<boolean>
  /**
   * 尺寸
   */
  size: Ref<'sm' | 'md' | 'lg'>
  /**
   * 组名称
   */
  name: Ref<string | undefined>
  /**
   * 处理变化
   */
  handleChange: (_value: string | number | boolean) => void
}

/**
 * Radio Group 注入键
 */
export const RADIO_GROUP_KEY: InjectionKey<QyRadioGroupContext> = Symbol('QyRadioGroupKey')
