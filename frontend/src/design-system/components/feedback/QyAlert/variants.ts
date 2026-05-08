/**
 * QyAlert CVA variants configuration
 *
 * 使用 class-variance-authority 管理警告变体
 * 提供类型安全的 variant 定义
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 警告变体配置
 *
 * 包含以下维度：
 * - type: 颜色类型（success/warning/error/info）
 */
export const alertVariants = cva(
  // 基础样式
  [
    'relative w-full p-4 rounded-xl border',
    'transition-all duration-300',
    'backdrop-blur-sm'
  ],
  {
    variants: {
      /**
       * 颜色类型
       * 使用 Tailwind v4 @theme 令牌
       */
      type: {
        success: [
          'bg-success-50/95 border-success-200/70',
          'text-success-800',
          'dark:bg-success-950/80 dark:border-success-800/50 dark:text-success-200'
        ],
        warning: [
          'bg-warning-50/95 border-warning-200/70',
          'text-warning-800',
          'dark:bg-warning-950/80 dark:border-warning-800/50 dark:text-warning-200'
        ],
        error: [
          'bg-danger-50/95 border-danger-200/70',
          'text-danger-800',
          'dark:bg-danger-950/80 dark:border-danger-800/50 dark:text-danger-200'
        ],
        info: [
          'bg-info-50/95 border-info-200/70',
          'text-info-800',
          'dark:bg-info-950/80 dark:border-info-800/50 dark:text-info-200'
        ]
      }
    },

    // 默认变体
    defaultVariants: {
      type: 'info'
    }
  }
)

/**
 * 图标样式变体
 */
export const alertIconVariants = cva(
  // 基础样式
  [
    'flex-shrink-0 w-5 h-5',
    'transition-all duration-300'
  ],
  {
    variants: {
      type: {
        success: 'text-success-500 dark:text-success-400',
        warning: 'text-warning-500 dark:text-warning-400',
        error: 'text-danger-500 dark:text-danger-400',
        info: 'text-info-500 dark:text-info-400'
      }
    },
    defaultVariants: {
      type: 'info'
    }
  }
)

/**
 * 关闭按钮样式变体
 */
export const alertCloseVariants = cva(
  // 基础样式
  [
    'absolute top-4 right-4',
    'flex-shrink-0 w-4 h-4',
    'rounded-full',
    'flex items-center justify-center',
    'transition-all duration-200',
    'hover:scale-110',
    'cursor-pointer'
  ],
  {
    variants: {
      type: {
        success: 'text-success-500 hover:bg-success-200/50',
        warning: 'text-warning-500 hover:bg-warning-200/50',
        error: 'text-danger-500 hover:bg-danger-200/50',
        info: 'text-info-500 hover:bg-info-200/50'
      }
    },
    defaultVariants: {
      type: 'info'
    }
  }
)

/**
 * 警告变体类型
 * 从 CVA 配置中自动推导
 */
export type AlertVariants = VariantProps<typeof alertVariants>
