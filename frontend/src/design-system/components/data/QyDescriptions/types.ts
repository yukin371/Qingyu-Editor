/**
 * Descriptions Types
 * Apple/Google settings-style key-value display
 */

export type DescriptionsSize = 'small' | 'default' | 'large'

export interface DescriptionsItemProps {
  label?: string
  value?: string
  span?: number
  align?: 'left' | 'center' | 'right'
  labelPlacement?: 'left' | 'top'
}

export interface DescriptionsProps {
  title?: string
  size?: DescriptionsSize
  border?: boolean
  column?: number
  layout?: 'horizontal' | 'vertical'
  labelPlacement?: 'left' | 'top'
}
