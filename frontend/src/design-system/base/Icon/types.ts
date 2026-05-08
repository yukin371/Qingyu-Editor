/**
 * Icon 组件类型定义
 */

// Icon 尺寸
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// Icon 变体
export type IconVariant = 'solid' | 'outline'

// Icon 名称 - Heroicons 24px
export type IconName =
  // 导航类
  | 'home'
  | 'apps'
  // 用户相关
  | 'user'
  | 'user-circle'
  // 文件/文档
  | 'document'
  | 'book'
  | 'book-open'
  | 'folder'
  | 'photo'
  // 操作类
  | 'plus'
  | 'minus'
  | 'check'
  | 'x-mark'
  | 'pencil'
  | 'trash'
  | 'sparkles'
  // 箭头类
  | 'arrow-down'
  | 'arrow-up'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-trending-up'
  | 'arrow-trending-down'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'chevron-right'
  // 搜索和设置
  | 'magnifying-glass'
  | 'search'
  | 'cog-6-tooth'
  // 通信
  | 'bell'
  // 安全
  | 'lock-closed'
  // 状态
  | 'information-circle'
  | 'question-circle'
  | 'check-circle'
  | 'clock'
  // 其他
  | 'heart'
  | 'star'
  | 'lightbulb'
  | 'code'
  // 图表
  | 'chart'
  // 堆叠
  | 'rectangle-stack'
  | 'circle-stack'
  // 位置
  | 'map-pin'
  // 全球
  | 'globe-alt'
  // 警告
  | 'exclamation-triangle'

// Icon Props 接口
export interface IconProps {
  /**
   * 图标名称
   */
  name: IconName

  /**
   * 图标尺寸
   * @default 'md'
   */
  size?: IconSize

  /**
   * 图标变体（实心或轮廓）
   * @default 'outline'
   */
  variant?: IconVariant

  /**
   * 自定义类名
   */
  class?: any

  /**
   * ARIA 标签（可访问性）
   */
  ariaLabel?: string

  /**
   * 点击事件
   */
  onClick?: (event: MouseEvent) => void
}

// Icon 尺寸对应的像素值
export const iconSizes: Record<IconSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
}

// Icon 组件默认属性
export const iconDefaults: Partial<IconProps> = {
  size: 'md',
  variant: 'outline',
}
