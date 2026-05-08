/**
 * QyDrawer 抽屉组件类型定义
 *
 * 基于 Element Plus Drawer API 设计
 */

/**
 * 抽屉滑出方向类型（Element Plus 命名）
 * - rtl: right to left - 从右侧滑出
 * - ltr: left to right - 从左侧滑出
 * - ttb: top to bottom - 从顶部滑出
 * - btt: bottom to top - 从底部滑出
 */
export type QyDrawerDirection = 'rtl' | 'ltr' | 'ttb' | 'btt'

/**
 * 抽屉尺寸类型
 * - 'small': 30%
 * - 'medium': 50%
 * - 'large': 70%
 * - 自定义值：如 '40%', '500px' 等
 */
export type QyDrawerSize = 'small' | 'medium' | 'large' | string | number

/**
 * 抽屉关闭前回调类型
 * 返回 false 或 reject 可阻止关闭
 */
export type QyDrawerBeforeClose = () => boolean | Promise<boolean>

/**
 * QyDrawer 组件 Props 接口
 */
export interface QyDrawerProps {
  /**
   * 抽屉显示状态 (v-model)
   * @default false
   */
  modelValue: boolean

  /**
   * 抽屉滑出方向（Element Plus 命名）
   * @default 'rtl'
   */
  direction?: QyDrawerDirection

  /**
   * 抽屉尺寸
   * @default '30%'
   */
  size?: QyDrawerSize

  /**
   * 抽屉标题
   */
  title?: string

  /**
   * 是否显示关闭按钮
   * @default true
   */
  showClose?: boolean

  /**
   * 点击遮罩层是否关闭抽屉
   * @default true
   */
  closeOnClickModal?: boolean

  /**
   * 按 ESC 键是否关闭抽屉
   * @default true
   */
  closeOnPressEscape?: boolean

  /**
   * 是否在抽屉打开时锁定背景滚动
   * @default true
   */
  lockScroll?: boolean

  /**
   * 是否显示遮罩层
   * @default true
   */
  modal?: boolean

  /**
   * 遮罩层的自定义类名
   */
  modalClass?: string

  /**
   * 抽屉的自定义类名
   */
  class?: string

  /**
   * 关闭前的回调，返回 false 或 reject 可阻止关闭
   */
  beforeClose?: QyDrawerBeforeClose

  /**
   * 关闭时是否销毁抽屉内容
   * @default false
   */
  destroyOnClose?: boolean

  /**
   * 抽屉内容的 z-index
   * @default 50
   */
  zIndex?: number

  /**
   * 遮罩层的 z-index
   * @default 40
   */
  modalZIndex?: number
}

/**
 * QyDrawer 组件 Emits 接口
 */
export interface QyDrawerEmits {
  /**
   * 更新 modelValue (v-model)
   */
  'update:modelValue': [value: boolean]

  /**
   * 抽屉打开前触发
   */
  open: []

  /**
   * 抽屉打开后触发（动画结束）
   */
  opened: []

  /**
   * 抽屉关闭前触发
   */
  close: []

  /**
   * 抽屉关闭后触发（动画结束）
   */
  closed: []
}

/**
 * QyDrawer 组件 Slots 接口
 */
export interface QyDrawerSlots {
  /**
   * 默认内容插槽
   */
  default?: () => any

  /**
   * 头部插槽（覆盖整个头部）
   */
  header?: () => any

  /**
   * 标题插槽
   */
  title?: () => any

  /**
   * 底部插槽
   */
  footer?: () => any
}

/**
 * 内部方向映射（用于样式计算）
 */
export type InternalDirection = 'left' | 'right' | 'top' | 'bottom'

/**
 * 方向映射表：Element Plus 命名 -> 内部方向
 */
export const DIRECTION_MAP: Record<QyDrawerDirection, InternalDirection> = {
  rtl: 'right',
  ltr: 'left',
  ttb: 'top',
  btt: 'bottom',
}

/**
 * 默认尺寸配置
 */
export const DRAWER_SIZES: Record<'small' | 'medium' | 'large', string> = {
  small: '30%',
  medium: '50%',
  large: '70%',
}

/**
 * 默认属性值
 */
export const drawerDefaults: Partial<QyDrawerProps> = {
  modelValue: false,
  direction: 'rtl',
  size: '30%',
  showClose: true,
  closeOnClickModal: true,
  closeOnPressEscape: true,
  lockScroll: true,
  modal: true,
  destroyOnClose: false,
  zIndex: 50,
  modalZIndex: 40,
}
