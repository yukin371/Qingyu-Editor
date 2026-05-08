/**
 * Image 组件类型定义
 */

import type { IconName } from '../Icon/types'

// Image 尺寸
export type ImageSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

// Image 形状
export type ImageShape = 'rect' | 'circle' | 'rounded'

// Image 状态
export type ImageStatus = 'loading' | 'loaded' | 'error'

// Image 对象填充方式
export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'

// Image Props 接口
export interface ImageProps {
  /**
   * 图片 URL
   */
  src?: string

  /**
   * 图片替代文本
   */
  alt?: string

  /**
   * Image 尺寸
   * @default 'md'
   */
  size?: ImageSize

  /**
   * Image 形状
   * @default 'rect'
   */
  shape?: ImageShape

  /**
   * 对象填充方式
   * @default 'cover'
   */
  fit?: ImageFit

  /**
   * 自定义宽度
   * @default undefined
   */
  width?: string

  /**
   * 自定义高度
   * @default undefined
   */
  height?: string

  /**
   * 是否懒加载
   * @default true
   */
  lazy?: boolean

  /**
   * 加载中是否显示骨架屏
   * @default true
   */
  showSkeleton?: boolean

  /**
   * 错误状态下显示的 fallback 图标名称
   * @default 'image'
   */
  fallbackIcon?: IconName

  /**
   * 自定义类名
   */
  class?: any

  /**
   * 加载完成事件
   */
  onLoad?: (event: Event) => void

  /**
   * 加载错误事件
   */
  onError?: (event: Event) => void

  /**
   * 点击事件
   */
  onClick?: (event: MouseEvent) => void
}

// Image 组件默认属性
export const imageDefaults: Partial<ImageProps> = {
  size: 'md',
  shape: 'rect',
  fit: 'cover',
  lazy: true,
  showSkeleton: true,
  fallbackIcon: 'document',
}

// Image 尺寸映射
export const imageSizeMap: Record<ImageSize, { width: string; height: string }> = {
  xs: { width: 'w-16', height: 'h-16' },
  sm: { width: 'w-24', height: 'h-24' },
  md: { width: 'w-32', height: 'h-32' },
  lg: { width: 'w-48', height: 'h-48' },
  xl: { width: 'w-64', height: 'h-64' },
  '2xl': { width: 'w-96', height: 'h-96' },
  full: { width: 'w-full', height: 'h-full' },
}

// Image 形状映射
export const imageShapeMap: Record<ImageShape, string> = {
  rect: 'rounded-md',
  circle: 'rounded-full',
  rounded: 'rounded-lg',
}

// Image 对象填充映射
export const imageFitMap: Record<ImageFit, string> = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
  none: 'object-none',
  'scale-down': 'object-scale-down',
}
