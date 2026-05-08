/**
 * QyCheckbox CVA variants configuration
 *
 * 使用 class-variance-authority 管理复选框变体
 * 提供类型安全的 variant 定义
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 复选框容器变体配置
 */
export const checkboxVariants = cva(
  [
    'inline-flex items-center gap-2 cursor-pointer',
    'transition-all duration-200',
    'select-none'
  ],
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed pointer-events-none',
        false: ''
      },
      variant: {
        default: '',
        button: '',
        border: ''
      }
    },
    defaultVariants: {
      size: 'md',
      disabled: false,
      variant: 'default'
    }
  }
)

/**
 * 复选框输入框样式变体
 */
export const checkboxInputVariants = cva(
  [
    'relative flex-shrink-0 rounded-md border-2',
    'transition-all duration-200',
    'appearance-none cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'checked:bg-current'
  ],
  {
    variants: {
      size: {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
      },
      color: {
        primary: 'border-slate-300 focus-visible:ring-primary-500 checked:border-primary-500 checked:bg-primary-500 dark:border-slate-600',
        success: 'border-slate-300 focus-visible:ring-success-500 checked:border-success-500 checked:bg-success-500 dark:border-slate-600',
        warning: 'border-slate-300 focus-visible:ring-warning-500 checked:border-warning-500 checked:bg-warning-500 dark:border-slate-600',
        danger: 'border-slate-300 focus-visible:ring-danger-500 checked:border-danger-500 checked:bg-danger-500 dark:border-slate-600'
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: ''
      },
      variant: {
        default: '',
        button: 'rounded-md',
        border: 'rounded-md'
      }
    },
    defaultVariants: {
      size: 'md',
      color: 'primary',
      disabled: false,
      variant: 'default'
    }
  }
)

/**
 * 图标容器样式变体
 */
export const iconContainerVariants = cva(
  [
    'absolute inset-0',
    'flex items-center justify-center',
    'pointer-events-none',
    'text-white'
  ],
  {
    variants: {
      size: {
        sm: 'text-[10px]',
        md: 'text-xs',
        lg: 'text-sm'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
)

/**
 * 图标样式变体
 */
export const iconVariants = cva(
  'w-full h-full',
  {
    variants: {
      size: {
        sm: 'w-3 h-3',
        md: 'w-3.5 h-3.5',
        lg: 'w-4 h-4'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
)

/**
 * Label 样式变体
 */
export const labelVariants = cva(
  [
    'select-none'
  ],
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
      },
      disabled: {
        true: 'opacity-50',
        false: ''
      }
    },
    defaultVariants: {
      size: 'md',
      disabled: false
    }
  }
)

/**
 * 复选框变体类型
 * 从 CVA 配置中自动推导
 */
export type CheckboxVariants = VariantProps<typeof checkboxVariants>
export type CheckboxInputVariants = VariantProps<typeof checkboxInputVariants>
export type IconContainerVariants = VariantProps<typeof iconContainerVariants>
export type IconVariants = VariantProps<typeof iconVariants>
export type LabelVariants = VariantProps<typeof labelVariants>
