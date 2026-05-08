/**
 * Avatar 组件类型定义
 */

// Avatar 尺寸
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// Avatar 形状变体
export type AvatarVariant = 'circle' | 'square' | 'rounded'

// Avatar 状态指示器
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy'

// Avatar Props 接口
export interface AvatarProps {
  /**
   * 头像图片 URL
   */
  src?: string

  /**
   * Fallback 文字（当图片加载失败或未提供时显示）
   * 默认取首字母
   */
  alt?: string

  /**
   * Avatar 尺寸
   * @default 'md'
   */
  size?: AvatarSize

  /**
   * Avatar 形状
   * @default 'circle'
   */
  variant?: AvatarVariant

  /**
   * 在线状态指示器
   */
  status?: AvatarStatus

  /**
   * 是否禁用状态指示器
   * @default false
   */
  disableStatus?: boolean

  /**
   * 自定义类名
   */
  class?: any
}

// Avatar 尺寸对应的像素值
export const avatarSizes: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 80,
}

// Avatar 组件默认属性
export const avatarDefaults: Partial<AvatarProps> = {
  size: 'md',
  variant: 'circle',
  disableStatus: false,
}
