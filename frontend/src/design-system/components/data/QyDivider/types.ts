/**
 * QyDivider 组件类型定义
 */

import type { HTMLAttributes } from 'vue'

/**
 * 分割线方向
 */
export type DividerDirection = 'horizontal' | 'vertical'

/**
 * 分割线位置
 */
export type DividerContentPosition = 'left' | 'center' | 'right'

/**
 * QyDivider 组件 Props
 */
export interface QyDividerProps extends /* @vue-ignore */ HTMLAttributes {
  /**
   * 方向
   * @default 'horizontal'
   */
  direction?: DividerDirection

  /**
   * 内容文本
   */
  content?: string

  /**
   * 内容位置
   * @default 'center'
   */
  contentPosition?: DividerContentPosition

  /**
   * 是否使用虚线样式
   * @default false
   */
  dashed?: boolean

  /**
   * 边框样式
   * @default 'solid'
   */
  borderStyle?: 'solid' | 'dashed' | 'dotted'
}

/**
 * QyDivider 组件 Emits
 */
export interface QyDividerEmits {}
