/**
 * Qingyu 全局服务导出
 *
 * canonical owner：对外提供 `message / messageBox / notification`。
 * 历史别名已从 canonical 出口移除。
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
export type { FormInstance, FormRules, FormItemProps as FormItemProp } from '../form/Form/types'
