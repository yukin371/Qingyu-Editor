/**
 * QyModal component type definitions
 */

export interface QyModalProps {
  /**
   * Modal visibility (v-model supported)
   * @default false
   */
  visible?: boolean

  /**
   * Modal title
   */
  title?: string

  /**
   * Modal width
   * @default '500px'
   */
  width?: string

  /**
   * Show close button
   * @default true
   */
  closable?: boolean

  /**
   * Close modal when clicking overlay
   * @default true
   */
  maskClosable?: boolean
}

export interface QyModalEmits {
  /**
   * Emitted when modal visibility changes (v-model)
   */
  (e: 'update:visible', value: boolean): void

  /**
   * Emitted when modal is closed
   */
  (e: 'close'): void

  /**
   * Emitted when modal is opened
   */
  (e: 'open'): void
}
