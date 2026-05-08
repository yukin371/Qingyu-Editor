/**
 * QyDropdown 组件类型定义
 */

/** 菜单项 */
export interface DropdownItem {
  /** 唯一标识 */
  key: string
  /** 显示文本 */
  label: string
  /** 图标类名 */
  icon?: string
  /** 快捷键提示 */
  shortcut?: string
  /** 禁用状态 */
  disabled?: boolean
  /** 危险操作样式 */
  danger?: boolean
  /** 是否在此项后显示分隔线 */
  divider?: boolean
}

/** 触发方式 */
export type DropdownTrigger = 'click' | 'hover'

/** 弹出位置 */
export type DropdownPlacement = 'bottom-start' | 'bottom' | 'bottom-end'

/** QyDropdown Props */
export interface QyDropdownProps {
  /** 菜单项列表 */
  items: DropdownItem[]
  /** 触发方式 */
  trigger?: DropdownTrigger
  /** 弹出位置 */
  placement?: DropdownPlacement
  /** 整体禁用 */
  disabled?: boolean
}
