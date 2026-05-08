/**
 * BackTop 返回顶部组件类型定义
 */

// BackTop 样式变体类型
export type BackTopShape = 'circle' | 'square'
export type BackTopSize = 'small' | 'medium' | 'large'
export type BackTopPosition = 
  | 'top-right' 
  | 'top-left' 
  | 'bottom-right' 
  | 'bottom-left'

// 缓动函数类型
export type EasingFunction = (t: number) => number

// BackTop Props 接口
export interface BackTopProps {
  /**
   * 滚动高度达到该值时显示返回顶部按钮
   * @default 400
   */
  visibilityHeight?: number

  /**
   * 返回顶部的目标位置
   * @default 0
   */
  backPosition?: number

  /**
   * 滚动动画的持续时间（毫秒）
   * @default 300
   */
  duration?: number

  /**
   * 滚动动画的缓动函数
   * @default 'ease-in-out'
   */
  easing?: string | EasingFunction

  /**
   * 按钮的形状
   * @default 'circle'
   */
  shape?: BackTopShape

  /**
   * 按钮的大小
   * @default 'medium'
   */
  size?: BackTopSize

  /**
   * 按钮的位置
   * @default 'bottom-right'
   */
  position?: BackTopPosition

  /**
   * 是否显示滚动进度百分比
   * @default false
   */
  showProgress?: boolean

  /**
   * 是否启用平滑滚动
   * @default true
   */
  smooth?: boolean

  /**
   * 滚动容器的选择器，默认为 window
   */
  target?: string | (() => HTMLElement | Window)

  /**
   * 是否在返回顶部后自动隐藏
   * @default false
   */
  autoHide?: boolean

  /**
   * 自定义类名
   */
  class?: any

  /**
   * 自定义样式
   */
  style?: any

  /**
   * 滚动到目标元素的 ID
   */
  targetElement?: string
}

// BackTop 组件默认属性
export const backtopDefaults: Partial<BackTopProps> = {
  visibilityHeight: 400,
  backPosition: 0,
  duration: 300,
  easing: 'ease-in-out',
  shape: 'circle',
  size: 'medium',
  position: 'bottom-right',
  showProgress: false,
  smooth: true,
  autoHide: false,
}

// BackTop 事件定义
export interface BackTopEmits {
  click: [event: MouseEvent]
  show: []
  hide: []
}

// BackTop 插槽定义
export interface BackTopSlots {
  default?: () => any
  icon?: () => any
}

// 内置缓动函数
export const easings: Record<string, EasingFunction> = {
  linear: (t: number) => t,
  'ease-in': (t: number) => t * t,
  'ease-out': (t: number) => t * (2 - t),
  'ease-in-out': (t: number) =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
}
