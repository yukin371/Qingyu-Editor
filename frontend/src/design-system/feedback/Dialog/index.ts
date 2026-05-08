/**
 * Dialog 组件导出
 */

export { default as DialogFooter } from './DialogFooter.vue'

// 导出类型
export type { DialogProps, DialogSize, BeforeCloseCallback } from './types'

// 默认导出 Dialog 组件（QyDialog 是 Apple 风格弹窗）
export { default as QyDialog } from './Dialog.vue'
export { default as Dialog } from './Dialog.vue'
