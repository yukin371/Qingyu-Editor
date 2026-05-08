/**
 * MessageBox 组件类型定义
 */

// MessageBox 类型
export type MessageBoxType = 'alert' | 'confirm' | 'prompt'
// MessageBox 图标类型（用于显示不同样式的图标）
export type MessageBoxIconType = 'success' | 'warning' | 'info' | 'error'

// MessageBox type 属性可以是 MessageBoxType 或 MessageBoxIconType（向后兼容）
export type MessageBoxTypeOrIcon = MessageBoxType | MessageBoxIconType
// MessageBox 动作
export type MessageBoxAction = 'confirm' | 'cancel'

// MessageBox 状态
export interface MessageBoxState {
  uid: number
  visible: boolean
  type: MessageBoxType
  title: string
  message: string
  showIcon: boolean
  showClose: boolean
  center: boolean
  closeOnClickModal: boolean
  closeOnPressEscape: boolean
  confirmButtonText: string
  cancelButtonText: string
  showCancelButton: boolean
  modelValue: string
  inputPlaceholder: string
  beforeClose?: (inputValue: string, action: MessageBoxAction) => boolean | Promise<boolean>
}

// MessageBox 选项
export interface MessageBoxOptions {
  /** 对话框标题 */
  title?: string
  /** 对话框内容 */
  message: string
  /** 对话框类型或图标类型（向后兼容 Element Plus） */
  type?: MessageBoxTypeOrIcon
  /** 图标类型（用于显示不同样式的图标） */
  iconType?: MessageBoxIconType
  /** 是否显示图标 */
  showIcon?: boolean
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 是否居中显示 */
  center?: boolean
  /** 点击遮罩层是否关闭 */
  closeOnClickModal?: boolean
  /** 按 ESC 键是否关闭 */
  closeOnPressEscape?: boolean
  /** 确认按钮文本 */
  confirmButtonText?: string
  /** 取消按钮文本 */
  cancelButtonText?: string
  /** 是否显示取消按钮 */
  showCancelButton?: boolean
  /** 输入框的值 */
  modelValue?: string
  /** 输入框占位符 */
  inputPlaceholder?: string
  /** 关闭前的回调 */
  beforeClose?: (inputValue: string, action: MessageBoxAction) => boolean | Promise<boolean>
}

// MessageBox Props 接口
export interface MessageBoxProps extends MessageBoxOptions {
  type: MessageBoxType
  showIcon: boolean
  showClose: boolean
  center: boolean
  closeOnClickModal: boolean
  closeOnPressEscape: boolean
  confirmButtonText?: string
  cancelButtonText?: string
  showCancelButton?: boolean
  modelValue?: string
  inputPlaceholder?: string
}

// MessageBox 结果
export interface MessageBoxResult {
  action: MessageBoxAction
  value?: string
}

// MessageBox 处理器
export interface MessageBoxHandler {
  close: () => void
}
