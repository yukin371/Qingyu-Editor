/**
 * QyConfirmDialog component type definitions
 */

export interface ConfirmDetail {
  label: string
  value: string | number
}

export type ConfirmDialogType = 'warning' | 'danger' | 'info' | 'success'

export type ButtonSize = 'large' | 'default' | 'small'

export interface QyConfirmDialogProps {
  /**
   * Dialog visibility (v-model supported)
   * @default false
   */
  visible?: boolean

  /**
   * Dialog title
   * @default '确认'
   */
  title?: string

  /**
   * Confirmation message
   * @default ''
   */
  message?: string

  /**
   * Dialog type, affects icon and button style
   * @default 'warning'
   */
  type?: ConfirmDialogType

  /**
   * Show icon
   * @default true
   */
  showIcon?: boolean

  /**
   * Confirm button text
   * @default '确认'
   */
  confirmText?: string

  /**
   * Cancel button text
   * @default '取消'
   */
  cancelText?: string

  /**
   * Dialog width
   * @default '450px'
   */
  width?: string

  /**
   * Button size
   * @default 'default'
   */
  size?: ButtonSize

  /**
   * Show loading state on confirm button
   * @default false
   */
  loading?: boolean

  /**
   * Optional details to display
   * @default []
   */
  details?: ConfirmDetail[]
}

export interface QyConfirmDialogEmits {
  /**
   * Emitted when dialog visibility changes (v-model)
   */
  (e: 'update:visible', value: boolean): void

  /**
   * Emitted when confirm button is clicked
   */
  (e: 'confirm'): void

  /**
   * Emitted when cancel button is clicked
   */
  (e: 'cancel'): void
}
