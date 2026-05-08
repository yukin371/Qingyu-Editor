/**
 * QyTooltip component type definitions
 *
 * 与 Element Plus El-Tooltip API 兼容
 */

import type { TooltipVariants } from './variants'

/**
 * Tooltip 位置类型（从 CVA 推导）
 */
export type TooltipPlacement = TooltipVariants['placement']

/**
 * Tooltip 效果类型（从 CVA 推导）
 */
export type TooltipEffect = TooltipVariants['effect']

/**
 * QyTooltip Props 接口
 */
export interface QyTooltipProps {
  /**
   * 提示内容
   */
  content?: string

  /**
   * 提示位置
   * @default 'top'
   */
  placement?: TooltipPlacement

  /**
   * 禁用状态
   * @default false
   */
  disabled?: boolean

  /**
   * 主题效果
   * @default 'dark'
   */
  effect?: TooltipEffect

  /**
   * 显示延迟（毫秒）
   * @default 0
   */
  openDelay?: number

  /**
   * 关闭延迟（毫秒）
   * @default 200
   */
  closeDelay?: number

  /**
   * 自定义弹出层类名
   */
  popperClass?: string

  /**
   * 是否支持 HTML 内容
   * @default false
   */
  rawContent?: boolean

  /**
   * 是否在鼠标离开时隐藏
   * @default true
   */
  hideAfter?: number | boolean

  /**
   * 是否自动关闭
   * @default false
   */
  autoClose?: number | boolean

  /**
   * 触发方式
   * @default 'hover'
   */
  trigger?: 'hover' | 'click' | 'focus' | 'contextmenu'

  /**
   * 自定义类名
   */
  class?: string
}

/**
 * QyTooltip Events 接口
 */
export interface QyTooltipEmits {
  /**
   * 显示时触发
   */
  (e: 'show'): void

  /**
   * 隐藏时触发
   */
  (e: 'hide'): void

  /**
   * 显示前触发
   */
  (e: 'before-show'): void

  /**
   * 隐藏前触发
   */
  (e: 'before-hide'): void
}

/**
 * Tooltip 组件实例暴露的方法
 */
export interface QyTooltipInstance {
  /**
   * 手动显示 tooltip
   */
  show: () => void

  /**
   * 手动隐藏 tooltip
   */
  hide: () => void

  /**
   * 更新 tooltip 位置
   */
  update: () => void
}
