/**
 * Dialog 组件类型定义 (Apple Style)
 */

// Dialog 尺寸
export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

// Dialog 关闭前回调类型
export type BeforeCloseCallback = () => boolean | Promise<boolean>

// Dialog Props 接口
export interface DialogProps {
  /**
   * 对话框显示状态 (v-model)
   * @default false
   */
  visible?: boolean

  /**
   * 对话框标题
   */
  title?: string

  /**
   * 对话框尺寸
   * @default 'md'
   */
  size?: DialogSize

  /**
   * 是否居中显示
   * @default false
   */
  center?: boolean

  /**
   * 是否显示遮罩层
   * @default true
   */
  modal?: boolean

  /**
   * 是否显示关闭按钮
   * @default true
   */
  showClose?: boolean

  /**
   * 点击遮罩层是否关闭对话框
   * @default true
   */
  closeOnClickModal?: boolean

  /**
   * 按 ESC 键是否关闭对话框
   * @default true
   */
  closeOnPressEscape?: boolean

  /**
   * 关闭前的回调，返回 false 或 reject 可阻止关闭
   */
  beforeClose?: BeforeCloseCallback

  /**
   * 是否在对话框打开时禁用 body 滚动
   * @default true
   */
  lockScroll?: boolean

  /**
   * Teleport 目标，指定对话框传送到哪个元素
   * @default 'body'
   */
  teleportTo?: string | HTMLElement

  /**
   * 遮罩层的自定义类名
   */
  modalClass?: string

  /**
   * 对话框的自定义类名
   */
  class?: any

  /**
   * 对话框打开时触发
   */
  onOpen?: () => void

  /**
   * 对话框关闭时触发
   */
  onClose?: () => void

  /**
   * 对话框打开动画结束时触发
   */
  onOpened?: () => void

  /**
   * 对话框关闭动画结束时触发
   */
  onClosed?: () => void
}

// Dialog 组件默认属性
export const dialogDefaults: Partial<DialogProps> = {
  visible: false,
  size: 'md',
  center: false,
  modal: true,
  showClose: true,
  closeOnClickModal: true,
  closeOnPressEscape: true,
  lockScroll: true,
}

// Dialog 尺寸配置 (Apple Style: 圆角、毛玻璃)
export const dialogSizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full w-full h-full m-0 rounded-none',
} as const

// Dialog 事件定义
export interface DialogEmits {
  'update:visible': [value: boolean]
  open: []
  close: []
  opened: []
  closed: []
}

// Dialog 插槽定义
export interface DialogSlots {
  default?: () => any
  header?: () => any
  footer?: () => any
  title?: () => any
}
