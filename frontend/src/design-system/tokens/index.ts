/**
 * 设计令牌统一导出
 *
 * 集中导出所有设计系统令牌，包括颜色、间距、字体、主题等。
 * 提供类型安全的令牌访问和 Tailwind CSS 集成。
 */

// 颜色令牌
export * from './colors'
export * from './theme'
export * from './tailwind'

// 间距令牌
export * from './spacing'

// 字体令牌
export * from './typography'

// 统一的设计令牌对象
import { colors } from './colors'
import { spacing } from './spacing'
import { typography } from './typography'
import { currentTheme } from './theme'

export const designTokens = {
  colors,
  spacing,
  typography,
  theme: currentTheme,
} as const

export type DesignTokens = typeof designTokens
