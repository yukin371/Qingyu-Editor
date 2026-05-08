/**
 * Button Group Types
 */

export type ButtonGroupSize = 'sm' | 'md' | 'lg'
export type ButtonGroupVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

export interface ButtonGroupProps {
  size?: ButtonGroupSize
  variant?: ButtonGroupVariant
  disabled?: boolean
  label?: string
}
