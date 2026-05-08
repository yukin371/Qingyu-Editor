/**
 * Popover 组件类型定义
 */

// Popover 触发方式
export type PopoverTrigger = 'click' | 'hover' | 'focus' | 'manual'

// Popover 位置
export type PopoverPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'

// Popover Props 接口
export interface PopoverProps {
  /**
   * 触发方式
   * @default 'click'
   */
  trigger?: PopoverTrigger

  /**
   * 出现位置
   * @default 'bottom'
   */
  placement?: PopoverPlacement

  /**
   * 宽度
   */
  width?: string | number

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 内容
   */
  content?: string

  /**
   * 偏移量
   * @default 0
   */
  offset?: number

  /**
   * 是否显示箭头
   * @default true
   */
  showArrow?: boolean

  /**
   * 弹出框自定义类名
   */
  popperClass?: string

  /**
   * 弹出框自定义样式
   */
  popperStyle?: Record<string, any>

  /**
   * 是否可见（仅在 trigger 为 manual 时有效）
   */
  visible?: boolean

  /**
   * 延迟显示时间（毫秒），仅在 hover 时有效
   * @default 0
   */
  openDelay?: number

  /**
   * 延迟关闭时间（毫秒），仅在 hover 时有效
   * @default 200
   */
  closeDelay?: number

  /**
   * 是否在点击外部时关闭
   * @default true
   */
  closeOnClickOutside?: boolean

  /**
   * 自定义类名
   */
  class?: any
}

// Popover Emits 接口
export interface PopoverEmits {
  /**
   * 显示前触发
   */
  (e: 'beforeEnter'): void

  /**
   * 显示后触发
   */
  (e: 'afterEnter'): void

  /**
   * 隐藏前触发
   */
  (e: 'beforeLeave'): void

  /**
   * 隐藏后触发
   */
  (e: 'afterLeave'): void

  /**
   * 显示状态变化时触发
   */
  (e: 'update:visible', visible: boolean): void
}

// Popover 组件默认属性
export const popoverDefaults: Partial<PopoverProps> = {
  trigger: 'click',
  placement: 'bottom',
  disabled: false,
  offset: 0,
  showArrow: true,
  openDelay: 0,
  closeDelay: 200,
  closeOnClickOutside: true,
}
