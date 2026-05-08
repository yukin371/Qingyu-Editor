/**
 * QyImage component type definitions
 *
 * 与 Element Plus El-Image API 兼容
 */

import type { ImageVariants } from './variants'

/**
 * 图片适配类型（从 CVA 推导）
 */
export type QyImageFit = ImageVariants['fit']

/**
 * 圆角类型（从 CVA 推导）
 */
export type QyImageRounded = ImageVariants['rounded']

/**
 * 阴影类型（从 CVA 推导）
 */
export type QyImageShadow = ImageVariants['shadow']

/**
 * 图片预览配置类型
 */
export interface QyImagePreviewConfig {
  /**
   * 预览图片列表
   */
  previewSrcList?: string[]
  /**
   * 初始预览索引
   * @default 0
   */
  initialIndex?: number
  /**
   * 预览层 z-index
   * @default 2000
   */
  zIndex?: number
}

/**
 * QyImage Props 接口
 */
export interface QyImageProps {
  /**
   * 图片源地址
   */
  src: string
  /**
   * 图片适配方式
   * @default 'cover'
   */
  fit?: QyImageFit
  /**
   * 圆角样式
   * @default 'md'
   */
  rounded?: QyImageRounded
  /**
   * 阴影效果
   * @default 'none'
   */
  shadow?: QyImageShadow
  /**
   * 图片宽度
   */
  width?: string | number
  /**
   * 图片高度
   */
  height?: string | number
  /**
   * 图片替代文本
   */
  alt?: string
  /**
   * 是否懒加载
   * @default false
   */
  lazy?: boolean
  /**
   * 是否开启预览
   * @default false
   */
  preview?: boolean
  /**
   * 预览图片列表
   * 如果不提供，则使用当前图片
   */
  previewSrcList?: string[]
  /**
   * 初始预览索引
   * @default 0
   */
  initialIndex?: number
  /**
   * 预览层 z-index
   * @default 2000
   */
  zIndex?: number
  /**
   * 加载失败时的图片源
   */
  errorSrc?: string
  /**
   * 自定义加载中内容
   */
  loadingSlot?: string
  /**
   * 自定义加载失败内容
   */
  errorSlot?: string
  /**
   * 自定义类名
   */
  class?: any
  /**
   * 自定义样式
   */
  style?: any
}

/**
 * QyImage Events 接口
 */
export interface QyImageEmits {
  /**
   * 图片加载成功时触发
   */
  (e: 'load', event: Event): void
  /**
   * 图片加载失败时触发
   */
  (e: 'error', event: Event): void
  /**
   * 点击图片时触发
   */
  (e: 'click', event: MouseEvent): void
}

/**
 * 图片组件实例暴露的方法
 */
export interface QyImageInstance {
  /**
   * 打开预览
   */
  openPreview: () => void
  /**
   * 关闭预览
   */
  closePreview: () => void
  /**
   * 切换预览
   */
  togglePreview: () => void
}
