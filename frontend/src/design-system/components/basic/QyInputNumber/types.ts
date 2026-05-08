/**
 * InputNumber Types
 * Apple style number input with stepper
 */

export type InputNumberSize = 'small' | 'default' | 'large'

export interface InputNumberProps {
  modelValue?: number
  min?: number
  max?: number
  step?: number
  size?: InputNumberSize
  disabled?: boolean
  controls?: boolean
  placeholder?: string
}
