/**
 * Drawer 抽屉组件类型定义
 */

// Drawer 方向类型
export type DrawerDirection = 'left' | 'right' | 'top' | 'bottom'

// Drawer 尺寸类型
export type DrawerSize = number | string

// Drawer 关闭前回调类型
export type BeforeCloseCallback = () => boolean | Promise<boolean>

// Drawer Props 接口
export interface DrawerProps {
  /**
   * 抽屉显示状态 (v-model)
   * @default false
   */
  modelValue?: boolean

  /**
   * 抽屉标题
   */
  title?: string

  /**
   * 抽屉打开的方向
   * @default 'right'
   */
  direction?: DrawerDirection

  /**
   * 抽屉的大小，可以是数字（像素）或百分比字符串
   * @default '30%'
   */
  size?: DrawerSize

  /**
   * 是否显示关闭按钮
   * @default true
   */
  closable?: boolean

  /**
   * 是否显示右上角的关闭按钮
   * @default true
   */
  showClose?: boolean

  /**
   * 关闭前的回调，返回 false 或 reject 可阻止关闭
   */
  beforeClose?: BeforeCloseCallback

  /**
   * 关闭时是否销毁抽屉内容
   * @default false
   */
  destroyOnClose?: boolean

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
   * 抽屉的自定义类名
   */
  class?: any

  /**
   * 是否为从右到左（RTL）布局
   * @default false
   */
  rtl?: boolean
}

// Drawer 组件默认属性
export const drawerDefaults: Partial<DrawerProps> = {
  modelValue: false,
  direction: 'right',
  size: '30%',
  closable: true,
  showClose: true,
  destroyOnClose: false,
  modal: true,
  closeOnClickModal: true,
  closeOnPressEscape: true,
  lockScroll: true,
  rtl: false,
}

// Drawer 默认尺寸配置
export const drawerSizes: Record<DrawerDirection, string> = {
  left: '30%',
  right: '30%',
  top: '30%',
  bottom: '30%',
}

// Drawer 事件定义
export interface DrawerEmits {
  'update:modelValue': [value: boolean]
  open: []
  close: []
  opened: []
  closed: []
}

// Drawer 插槽定义
export interface DrawerSlots {
  default?: () => any
  header?: () => any
  footer?: () => any
  title?: () => any
}
