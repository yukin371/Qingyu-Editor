/**
 * QyProgress CVA variants configuration
 *
 * 使用 class-variance-authority 管理进度条变体
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 进度条容器变体配置
 */
export const progressVariants = cva(
  [
    'relative',
    'inline-block'
  ],
  {
    variants: {
      type: {
        line: 'w-full',
        circle: 'inline-flex items-center justify-center',
        dashboard: 'inline-flex items-center justify-center'
      }
    },
    defaultVariants: {
      type: 'line'
    }
  }
)

/**
 * 线性进度条轨道变体配置
 */
export const progressTrackVariants = cva(
  [
    'w-full',
    'h-full',
    'bg-slate-100',
    'dark:bg-slate-800',
    'rounded-full',
    'overflow-hidden'
  ]
)

/**
 * 线性进度条填充变体配置
 */
export const progressFillVariants = cva(
  [
    'h-full',
    'rounded-full',
    'transition-all',
    'duration-300',
    'ease-out'
  ],
  {
    variants: {
      status: {
        success: 'bg-success-500',
        exception: 'bg-danger-500',
        warning: 'bg-warning-500',
        active: 'bg-primary-500'
      },
      customColor: {
        true: ''
      }
    },
    defaultVariants: {
      status: 'active',
      customColor: false
    }
  }
)

/**
 * 环形进度条 SVG 变体配置
 */
export const progressCircleVariants = cva(
  [
    'relative',
    'inline-block'
  ],
  {
    variants: {
      size: {
        small: 'w-16 h-16',
        medium: 'w-20 h-20',
        large: 'w-32 h-32'
      }
    },
    defaultVariants: {
      size: 'medium'
    }
  }
)

/**
 * 进度条文字变体配置
 */
export const progressTextVariants = cva(
  [
    'text-sm',
    'font-medium',
    'transition-colors'
  ],
  {
    variants: {
      status: {
        success: 'text-success-500',
        exception: 'text-danger-500',
        warning: 'text-warning-500',
        active: 'text-slate-700 dark:text-slate-300'
      }
    },
    defaultVariants: {
      status: 'active'
    }
  }
)

/**
 * 进度条变体类型
 */
export type ProgressVariants = VariantProps<typeof progressVariants>
export type ProgressTrackVariants = VariantProps<typeof progressTrackVariants>
export type ProgressFillVariants = VariantProps<typeof progressFillVariants>
export type ProgressCircleVariants = VariantProps<typeof progressCircleVariants>
export type ProgressTextVariants = VariantProps<typeof progressTextVariants>
