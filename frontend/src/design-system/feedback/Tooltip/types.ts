/**
 * Tooltip 组件类型定义
 */

// Tooltip 触发方式
export type TooltipTrigger = 'hover' | 'click' | 'focus' | 'manual'

// Tooltip 位置
export type TooltipPlacement =
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

// Tooltip 主题
export type TooltipEffect = 'dark' | 'light'

// Tooltip Props 接口
export interface TooltipProps {
  /**
   * 触发方式
   * @default 'hover'
   */
  trigger?: TooltipTrigger

  /**
   * 显示位置
   * @default 'bottom'
   */
  placement?: TooltipPlacement

  /**
   * 提示内容
   */
  content?: string

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 主题
   * @default 'dark'
   */
  effect?: TooltipEffect

  /**
   * 是否显示箭头
   * @default true
   */
  showArrow?: boolean

  /**
   * 偏移距离
   * @default 12
   */
  offset?: number

   /**
   * 自定义 Popper 类名
   */
  popperClass?: string

  /**
   * 过渡动画名称
   * @default 'tooltip-fade'
   */
  transition?: string

  /**
   * 显示延迟（毫秒）
   * @default 0
   */
  openDelay?: number

  /**
   * 隐藏延迟（毫秒）
   * @default 200
   */
  closeDelay?: number

  /**
   * 是否在关闭后销毁 DOM
   * @default false
   */
  destroyOnClose?: boolean

  /**
   * 自定义类名
   */
  class?: any

  /**
   * 显示状态（仅 trigger="manual" 时有效）
   */
  modelValue?: boolean

  /**
   * 显示/隐藏事件
   */
  'onUpdate:modelValue'?: (value: boolean) => void

  /**
   * 显示前回调
   */
  onBeforeShow?: () => boolean | Promise<boolean>

  /**
   * 显示后回调
   */
  onAfterShow?: () => void

  /**
   * 隐藏前回调
   */
  onBeforeHide?: () => boolean | Promise<boolean>

  /**
   * 隐藏后回调
   */
  onAfterHide?: () => void
}

// Tooltip 组件默认属性
export const tooltipDefaults: Partial<TooltipProps> = {
  trigger: 'hover',
  placement: 'bottom',
  disabled: false,
  effect: 'dark',
  showArrow: true,
  offset: 12,
  transition: 'tooltip-fade',
  openDelay: 0,
  closeDelay: 200,
  destroyOnClose: false,
}
