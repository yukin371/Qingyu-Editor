/**
 * QyAlert - Alert 警告组件
 *
 * 基于 Tailwind v4 和 CVA 的警告组件
 * 支持多种类型、可关闭、图标显示/隐藏、居中显示、暗色模式
 */

import QyAlert from './QyAlert.vue'

export { QyAlert }
export { alertVariants, alertIconVariants, alertCloseVariants } from './variants'
export type {
  QyAlertProps,
  QyAlertEmits,
  QyAlertInstance,
  QyAlertType
} from './types'

export default QyAlert
