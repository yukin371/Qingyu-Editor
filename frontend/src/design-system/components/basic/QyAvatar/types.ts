/**
 * QyAvatar component type definitions
 *
 * 与 Element Plus El-Avatar API 兼容
 */

import type { AvatarVariants, AvatarImageVariants } from './variants'

/**
 * 头像类型
 */
export type QyAvatarType = 'image' | 'text' | 'group'

/**
 * 头像尺寸类型（从 CVA 推导）
 */
export type QyAvatarSize = AvatarVariants['size']

/**
 * 头像形状类型（从 CVA 推导）
 */
export type QyAvatarShape = AvatarVariants['shape']

/**
 * 图片适配方式类型（从 CVA 推导）
 */
export type QyAvatarFit = AvatarImageVariants['fit']

/**
 * 头像颜色类型
 */
export type QyAvatarColor = 'cyan' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'pink'

/**
 * 头像组项数据类型
 */
export interface QyAvatarItem {
  /**
   * 图片源 URL
   */
  src?: string
  /**
   * 文本内容
   */
  text?: string
  /**
   * 替代文本
   */
  alt?: string
}

/**
 * QyAvatar Props 接口
 */
export interface QyAvatarProps {
  /**
   * 头像类型
   * @default 'image'
   */
  type?: QyAvatarType

  /**
   * 图片源 URL（用于 image 类型）
   */
  src?: string

  /**
   * 文本内容（用于 text 类型）
   */
  text?: string

  /**
   * 头像尺寸
   * @default 'md'
   */
  size?: QyAvatarSize

  /**
   * 图片替代文本
   * @default 'Avatar'
   */
  alt?: string

  /**
   * 头像形状
   * @default 'circle'
   */
  shape?: QyAvatarShape

  /**
   * 图片适配方式
   * @default 'cover'
   */
  fit?: QyAvatarFit

  /**
   * 头像背景颜色（用于 text 类型）
   * @default 'cyan'
   */
  color?: QyAvatarColor

  /**
   * 头像组数据（用于 group 类型）
   */
  avatars?: QyAvatarItem[]

  /**
   * 头像组最大显示数量（用于 group 类型）
   * @default 3
   */
  maxVisible?: number

  /**
   * 图标组件（无图片时显示的图标）
   */
  icon?: string

  /**
   * 是否可点击
   * @default false
   */
  clickable?: boolean

  /**
   * 自定义类名
   */
  class?: string
}

/**
 * QyAvatar Events 接口
 */
export interface QyAvatarEmits {
  /**
   * 点击事件
   */
  (e: 'click', event: MouseEvent): void
}

/**
 * 头像组件实例暴露的方法
 */
export interface QyAvatarInstance {
  /**
   * 聚焦头像
   */
  focus: () => void
  /**
   * 失焦头像
   */
  blur: () => void
}
