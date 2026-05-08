/**
 * Menu 组件类型定义
 */

/**
 * 菜单模式
 */
export type MenuMode = 'horizontal' | 'vertical'

/**
 * 菜单项接口
 */
export interface MenuItem {
  /**
   * 唯一标识
   */
  index: string
  /**
   * 菜单项标题
   */
  title: string
  /**
   * 图标
   */
  icon?: string
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 子菜单
   */
  children?: MenuItem[]
}

/**
 * Menu 组件 Props
 */
export interface MenuProps {
  /**
   * 菜单模式
   * @default 'vertical'
   */
  mode?: MenuMode
  /**
   * 默认激活的菜单项
   */
  defaultActive?: string
  /**
   * 默认展开的子菜单
   */
  defaultOpeneds?: string[]
  /**
   * 是否折叠
   * @default false
   */
  collapse?: boolean
  /**
   * 是否只保持一个子菜单展开
   * @default false
   */
  uniqueOpened?: boolean
  /**
   * 背景色
   */
  backgroundColor?: string
  /**
   * 文字颜色
   */
  textColor?: string
  /**
   * 激活文字颜色
   */
  activeTextColor?: string
  /**
   * 自定义类名
   */
  class?: any
}

/**
 * MenuItem 组件 Props
 */
export interface MenuItemProps {
  /**
   * 唯一标识
   */
  index: string
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean
  /**
   * 自定义类名
   */
  class?: any
}

/**
 * MenuSub 组件 Props
 */
export interface MenuSubProps {
  /**
   * 唯一标识
   */
  index: string
  /**
   * 弹出框类名
   */
  popperClass?: string
  /**
   * 展开延迟（毫秒）
   * @default 300
   */
  showTimeout?: number
  /**
   * 收起延迟（毫秒）
   * @default 300
   */
  hideTimeout?: number
  /**
   * 自定义类名
   */
  class?: any
}

/**
 * MenuItemGroup 组件 Props
 */
export interface MenuItemGroupProps {
  /**
   * 分组标题
   */
  title: string
  /**
   * 自定义类名
   */
  class?: any
}

/**
 * Menu 事件
 */
export interface MenuEmits {
  /**
   * 菜单激活时触发
   */
  select: [index: string, indexPath: string[]]
  /**
   * 子菜单展开时触发
   */
  open: [index: string]
  /**
   * 子菜单收起时触发
   */
  close: [index: string]
}

/**
 * MenuItem 事件
 */
export interface MenuItemEmits {
  /**
   * 点击菜单项时触发
   */
  click: [index: string]
}
