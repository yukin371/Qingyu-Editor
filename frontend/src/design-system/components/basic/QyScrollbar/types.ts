/**
 * QyScrollbar 类型定义
 */

import type { CSSProperties } from 'vue'

/**
 * QyScrollbar 组件属性
 */
export interface QyScrollbarProps {
  /**
   * 是否使用原生滚动条样式
   * @default false
   */
  native?: boolean

  /**
   * 容器的自定义样式
   */
  wrapStyle?: CSSProperties

  /**
   * 容器的自定义类名
   */
  wrapClass?: string

  /**
   * 视图的自定义样式
   */
  viewStyle?: CSSProperties

  /**
   * 视图的自定义类名
   */
  viewClass?: string

  /**
   * 不监听容器大小变化
   * @default false
   */
  noresize?: boolean

  /**
   * 容器标签
   * @default 'div'
   */
  tag?: string
}

/**
 * QyScrollbar 组件事件
 */
export interface QyScrollbarEmits {
  /**
   * 滚动时触发
   */
  scroll: (event: Event) => void
}

/**
 * QyScrollbar 组件实例
 */
export interface ScrollbarInstance {
  /**
   * 滚动到指定位置
   */
  scrollTo: (x: number, y: number) => void

  /**
   * 设置滚动距离
   */
  setScrollTop: (top: number) => void

  /**
   * 设置左侧滚动距离
   */
  setScrollLeft: (left: number) => void

  /**
   * 更新滚动条
   */
  update: () => void
}
