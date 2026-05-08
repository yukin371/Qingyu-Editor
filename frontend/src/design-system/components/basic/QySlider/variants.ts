/**
 * QySlider CVA variants configuration
 *
 * 使用 class-variance-authority 管理滑块变体
 * 提供类型安全的 variant 定义
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 滑块容器变体配置
 */
export const sliderVariants = cva(
  [
    'relative inline-flex',
    'select-none'
  ],
  {
    variants: {
      size: {
        sm: '',
        md: '',
        lg: ''
      },
      vertical: {
        true: 'flex-col items-center h-full',
        false: 'w-full'
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed',
        false: ''
      }
    },
    defaultVariants: {
      size: 'md',
      vertical: false,
      disabled: false
    }
  }
)

/**
 * 轨道样式变体
 */
export const trackVariants = cva(
  [
    'relative w-full rounded-full',
    'transition-colors duration-200'
  ],
  {
    variants: {
      size: {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3'
      },
      vertical: {
        true: 'h-full',
        false: ''
      },
      color: {
        primary: 'bg-slate-200 dark:bg-slate-700',
        success: 'bg-slate-200 dark:bg-slate-700',
        warning: 'bg-slate-200 dark:bg-slate-700',
        danger: 'bg-slate-200 dark:bg-slate-700'
      }
    },
    defaultVariants: {
      size: 'md',
      vertical: false,
      color: 'primary'
    }
  }
)

/**
 * 填充样式变体
 */
export const fillVariants = cva(
  [
    'absolute rounded-full',
    'transition-colors duration-200'
  ],
  {
    variants: {
      vertical: {
        true: 'w-full',
        false: 'h-full'
      },
      color: {
        primary: 'bg-primary-500',
        success: 'bg-success-500',
        warning: 'bg-warning-500',
        danger: 'bg-danger-500'
      }
    },
    defaultVariants: {
      vertical: false,
      color: 'primary'
    }
  }
)

/**
 * 滑块样式变体
 */
export const thumbVariants = cva(
  [
    'absolute top-1/2 -translate-y-1/2',
    'w-4 h-4 rounded-full',
    'bg-white border-2 shadow-lg',
    'cursor-grab active:cursor-grabbing',
    'transition-transform duration-200',
    'hover:scale-110 active:scale-95',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'z-10'
  ],
  {
    variants: {
      size: {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
      },
      color: {
        primary: 'border-primary-500 focus-visible:ring-primary-500',
        success: 'border-success-500 focus-visible:ring-success-500',
        warning: 'border-warning-500 focus-visible:ring-warning-500',
        danger: 'border-danger-500 focus-visible:ring-danger-500'
      },
      vertical: {
        true: 'left-1/2 -translate-x-1/2',
        false: ''
      }
    },
    defaultVariants: {
      size: 'md',
      color: 'primary',
      vertical: false
    }
  }
)

/**
 * Tooltip 样式变体
 */
export const tooltipVariants = cva(
  [
    'absolute px-2 py-1',
    'text-xs font-medium text-white',
    'bg-slate-800 rounded-md',
    'whitespace-nowrap',
    'pointer-events-none',
    'transition-opacity duration-200'
  ],
  {
    variants: {
      vertical: {
        true: 'left-full ml-2 top-1/2 -translate-y-1/2',
        false: 'bottom-full mb-2 left-1/2 -translate-x-1/2'
      }
    },
    defaultVariants: {
      vertical: false
    }
  }
)

/**
 * 滑块变体类型
 * 从 CVA 配置中自动推导
 */
export type SliderVariants = VariantProps<typeof sliderVariants>
export type TrackVariants = VariantProps<typeof trackVariants>
export type FillVariants = VariantProps<typeof fillVariants>
export type ThumbVariants = VariantProps<typeof thumbVariants>
export type TooltipVariants = VariantProps<typeof tooltipVariants>
