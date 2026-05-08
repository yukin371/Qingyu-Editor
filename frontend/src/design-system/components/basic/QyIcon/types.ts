/**
 * Qingyu Design System - QyIcon Component Types
 */

/**
 * Available icon names
 * This is a union type of all available icons
 */
export type IconName =
  // Navigation
  | 'Search' | 'ArrowRight' | 'ArrowLeft' | 'ArrowUp' | 'ArrowDown' | 'Back'
  
  // Actions
  | 'Plus' | 'Minus' | 'Close' | 'Edit' | 'Delete' | 'Check' | 'Refresh' | 'Share' | 'Copy'
  
  // Rating
  | 'Star' | 'StarFilled'
  
  // User & Account
  | 'User' | 'UserFilled' | 'Lock' | 'Unlock'
  
  // Files & Documents
  | 'Document' | 'Folder' | 'FolderOpened' | 'Files'
  
  // Communication
  | 'ChatDotRound' | 'ChatLineSquare'
  
  // Settings & Tools
  | 'Setting' | 'Filter'
  
  // Status & Feedback
  | 'Warning' | 'WarningFilled' | 'InfoFilled' | 'SuccessFilled'
  | 'CircleCheck' | 'CircleClose'
  
  // Media & View
  | 'View' | 'Picture'
  
  // Utility
  | 'Clock' | 'Timer' | 'Calendar' | 'Trophy'
  
  // Loading & Progress
  | 'Loading'
  
  // Upload & Download
  | 'Upload' | 'Download'
  
  // Special Purpose
  | 'Collection' | 'Crown' | 'Present' | 'ShoppingCart'
  | 'DataAnalysis' | 'TrendCharts' | 'Bell' | 'FullScreen'
  | 'Sort' | 'Memo' | 'MagicStick'
  
  // Navigation & Layout
  | 'Grid' | 'HomeFilled' | 'Menu'
  
  // Additional
  | 'Location' | 'Reading' | 'MoreFilled' | 'Wallet'
  
  // Additional Status
  | 'QuestionFilled' | 'CircleCloseFilled' | 'CircleCheckFilled'
  
  // Editor
  | 'EditPen' | 'DocumentCopy'

  // Layout
  | 'Expand' | 'Fold'

  // Auth
  | 'SwitchButton'

  // Book & Library
  | 'BookOpen' | 'BookClosed' | 'Bookmark' | 'BookmarkFilled'
  | 'Library' | 'Bookshelf'

  // Empty State
  | 'BookNotFound' | 'Empty' | 'EmptyFolder' | 'NoData'
  | 'FileSearch' | 'IllustrationPlaceholder'

  // AI Feature
  | 'Sparkles' | 'Robot' | 'Bot' | 'Microphone' | 'VoiceInput'
  | 'Lightbulb' | 'Idea' | 'Brain' | 'NeuralNetwork'

  // Interaction
  | 'cursor-click' | 'hand-pointer' | 'heart'

  // 小写别名 (向后兼容)
  | 'arrow-right' | 'arrow-left' | 'book-open' | 'photo'

/**
 * QyIcon component props
 */
export interface QyIconProps {
  /**
   * Icon name
   * @required
   */
  name: IconName | string
  
  /**
   * Icon size in pixels
   * @default 16
   */
  size?: number | string
  
  /**
   * Icon color
   * Can be any valid CSS color value
   * @default 'currentColor'
   */
  color?: string
  
  /**
   * Additional CSS classes
   */
  class?: string
  
  /**
   * Rotate icon
   * @default 0
   */
  rotate?: number
  
  /**
   * Flip icon horizontally or vertically
   * @default 'none'
   */
  flip?: 'horizontal' | 'vertical' | 'both' | 'none'
}

/**
 * Icon variant for different use cases
 */
export type IconVariant = 'outline' | 'filled' | 'duotone'

/**
 * Icon size presets
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

/**
 * Icon size presets in pixels
 */
export const iconSizePresets: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
}

/**
 * Common icon colors
 */
export const iconColors = {
  current: 'currentColor',
  primary: 'rgb(8 145 178)', // cyan-600
  secondary: 'rgb(71 85 105)', // slate-600
  success: 'rgb(22 163 74)', // green-600
  warning: 'rgb(234 179 8)', // yellow-600
  danger: 'rgb(220 38 38)', // red-600
  info: 'rgb(37 99 235)', // blue-600
  muted: 'rgb(148 163 184)', // slate-400
} as const

/**
 * Export type for icon color
 */
export type IconColor = keyof typeof iconColors | string
