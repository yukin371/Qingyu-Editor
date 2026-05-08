/**
 * Skeleton 组件类型定义
 */

// Skeleton 类型
export type SkeletonType = 'text' | 'circle' | 'rect' | 'avatar' | 'image'

// Skeleton 尺寸
export type SkeletonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// Skeleton Props 接口
export interface SkeletonProps {
  /**
   * Skeleton 类型
   * @default 'text'
   */
  type?: SkeletonType

  /**
   * Skeleton 尺寸
   * @default 'md'
   */
  size?: SkeletonSize

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
   * 是否显示动画
   * @default true
   */
  animated?: boolean

  /**
   * 自定义类名
   */
  class?: any
}

// Skeleton 组件默认属性
export const skeletonDefaults: Partial<SkeletonProps> = {
  type: 'text',
  size: 'md',
  animated: true,
}

// Skeleton 类型到尺寸映射
export const skeletonSizeMap: Record<SkeletonType, Record<SkeletonSize, { width: string; height: string }>> = {
  text: {
    xs: { width: 'w-12', height: 'h-3' },
    sm: { width: 'w-16', height: 'h-4' },
    md: { width: 'w-24', height: 'h-5' },
    lg: { width: 'w-32', height: 'h-6' },
    xl: { width: 'w-48', height: 'h-7' },
  },
  circle: {
    xs: { width: 'w-6', height: 'h-6' },
    sm: { width: 'w-8', height: 'h-8' },
    md: { width: 'w-10', height: 'h-10' },
    lg: { width: 'w-12', height: 'h-12' },
    xl: { width: 'w-16', height: 'h-16' },
  },
  rect: {
    xs: { width: 'w-full', height: 'h-16' },
    sm: { width: 'w-full', height: 'h-24' },
    md: { width: 'w-full', height: 'h-32' },
    lg: { width: 'w-full', height: 'h-40' },
    xl: { width: 'w-full', height: 'h-48' },
  },
  avatar: {
    xs: { width: 'w-6', height: 'h-6' },
    sm: { width: 'w-8', height: 'h-8' },
    md: { width: 'w-10', height: 'h-10' },
    lg: { width: 'w-12', height: 'h-12' },
    xl: { width: 'w-16', height: 'h-16' },
  },
  image: {
    xs: { width: 'w-full', height: 'h-16' },
    sm: { width: 'w-full', height: 'h-24' },
    md: { width: 'w-full', height: 'h-32' },
    lg: { width: 'w-full', height: 'h-40' },
    xl: { width: 'w-full', height: 'h-48' },
  },
}
