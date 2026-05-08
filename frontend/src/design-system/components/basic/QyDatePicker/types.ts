/**
 * DatePicker Types
 * Clean, minimal date picker
 */

export type DatePickerSize = 'small' | 'default' | 'large'
export type DatePickerType = 'date' | 'datetime'

export interface DatePickerProps {
  modelValue?: string | Date | null
  type?: DatePickerType
  size?: DatePickerSize
  disabled?: boolean
  placeholder?: string
  format?: string
  minDate?: Date
  maxDate?: Date
}
