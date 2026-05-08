/**
 * Affix 固钉组件类型定义
 */

// Affix 固定位置类型
export type AffixPosition = 'top' | 'bottom'

// Affix Props 接口
export interface AffixProps {
  /**
   * 距离窗口顶部或底部的偏移量
   * @default 0
   */
  offset?: number

  /**
   * 固定位置
   * @default 'top'
   */
  position?: AffixPosition

  /**
   * 元素的 z-index
   * @default 10
   */
  zIndex?: number

  /**
   * 设置 Affix 需要监听滚动事件的容器
   * 可以是选择器字符串或返回元素的函数
   * @default () => window
   */
  target?: string | (() => HTMLElement | Window)

  /**
   * 自定义类名
   */
  class?: any

  /**
   * 自定义样式
   */
  style?: any
}

// Affix 组件默认属性
export const affixDefaults: Partial<AffixProps> = {
  offset: 0,
  position: 'top',
  zIndex: 10,
}

// Affix 事件定义
export interface AffixEmits {
  /**
   * 固定状态改变时触发
   * @param fixed - 是否固定
   */
  change: [fixed: boolean]

  /**
   * 滚动时触发
   * @param event - 滚动事件
   */
  scroll: [event: Event]
}

// Affix 插槽定义
export interface AffixSlots {
  /**
   * 默认插槽，内容需要被固定的部分
   */
  default?: () => any
}

// 内部状态接口
export interface AffixState {
  isFixed: boolean
  containerHeight: number
  containerWidth: number
  originalPosition: {
    top: number
    left: number
    width: number
    height: number
  }
}
