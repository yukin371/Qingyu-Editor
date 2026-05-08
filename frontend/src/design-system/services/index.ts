/**
 * Qingyu 全局服务导出
 *
 * 提供 Element Plus 兼容的全局 API
 */

// Message 服务
import _message from '../feedback/Message/useMessage'
export const message = _message
export { useMessage } from '../feedback/Message/useMessage'

// MessageBox 服务
import _messageBox from '../feedback/MessageBox/useMessageBox'
export const messageBox = _messageBox
export { useMessageBox } from '../feedback/MessageBox/useMessageBox'

// Notification 服务
import _notification from '../feedback/Notification/useNotification'
export const notification = _notification
export { useNotification } from '../feedback/Notification/useNotification'

// 类型导出
export type { MessageOptions, MessageType, MessageHandler } from '../feedback/Message/types'
export type { MessageBoxOptions, MessageBoxType, MessageBoxIconType, MessageBoxAction, MessageBoxResult } from '../feedback/MessageBox/types'
export type { NotificationOptions, NotificationType, NotificationPosition, NotificationHandler } from '../feedback/Notification/types'

// Form 类型（从 element-plus 重新导出）
export type { FormInstance, FormRules, FormItemProp } from 'element-plus'

// 兼容 Element Plus 的别名导出
export { message as ElMessage, messageBox as ElMessageBox, notification as ElNotification }
