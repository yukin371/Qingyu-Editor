/**
 * QySwitch CVA variants configuration
 *
 * 使用 class-variance-authority 管理开关变体
 * 提供类型安全的 variant 定义
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 开关容器变体配置
 */
export const switchVariants = cva(
  [
    'inline-flex items-center',
    'transition-all duration-300',
    'cursor-pointer select-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50'
  ],
  {
    variants: {
      size: {
        sm: 'gap-1.5',
        md: 'gap-2',
        lg: 'gap-2.5'
      },
      checked: {
        true: '',
        false: ''
      }
    },
    defaultVariants: {
      size: 'md',
      checked: false
    }
  }
)

/**
 * 轨道样式变体
 */
export const trackVariants = cva(
  [
    'relative inline-flex flex-shrink-0 rounded-full',
    'transition-colors duration-300',
    'border-2 border-transparent'
  ],
  {
    variants: {
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
        lg: 'h-7 w-13'
      },
      color: {
        primary: 'data-[checked=true]:bg-primary-500',
        success: 'data-[checked=true]:bg-success-500',
        warning: 'data-[checked=true]:bg-warning-500',
        danger: 'data-[checked=true]:bg-danger-500'
      },
      checked: {
        true: '',
        false: ''
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed',
        false: ''
      }
    },
    defaultVariants: {
      size: 'md',
      color: 'primary',
      checked: false,
      disabled: false
    }
  }
)

/**
 * 滑块样式变体
 */
export const thumbVariants = cva(
  [
    'pointer-events-none inline-block rounded-full',
    'shadow-lg transform',
    'transition-transform duration-300',
    'flex items-center justify-center'
  ],
  {
    variants: {
      size: {
        sm: 'h-3.5 w-3.5 data-[checked=true]:translate-x-4',
        md: 'h-4 w-4 data-[checked=true]:translate-x-5',
        lg: 'h-5 w-5 data-[checked=true]:translate-x-6'
      },
      checked: {
        true: '',
        false: ''
      },
      loading: {
        true: '',
        false: ''
      }
    },
    defaultVariants: {
      size: 'md',
      checked: false,
      loading: false
    }
  }
)

/**
 * 激活文本样式变体
 */
export const activeTextVariants = cva(
  [
    'absolute inset-0',
    'flex items-center justify-center',
    'text-white text-xs font-medium',
    'transition-opacity duration-300',
    'pointer-events-none'
  ],
  {
    variants: {
      size: {
        sm: 'text-[10px]',
        md: 'text-xs',
        lg: 'text-sm'
      },
      checked: {
        true: 'opacity-0',
        false: ''
      }
    },
    defaultVariants: {
      size: 'md',
      checked: false
    }
  }
)

/**
 * 非激活文本样式变体
 */
export const inactiveTextVariants = cva(
  [
    'absolute inset-0',
    'flex items-center justify-center',
    'text-slate-600 text-xs font-medium',
    'transition-opacity duration-300',
    'pointer-events-none'
  ],
  {
    variants: {
      size: {
        sm: 'text-[10px]',
        md: 'text-xs',
        lg: 'text-sm'
      },
      checked: {
        true: '',
        false: 'opacity-0'
      }
    },
    defaultVariants: {
      size: 'md',
      checked: false
    }
  }
)

/**
 * 开关变体类型
 * 从 CVA 配置中自动推导
 */
export type SwitchVariants = VariantProps<typeof switchVariants>
export type TrackVariants = VariantProps<typeof trackVariants>
export type ThumbVariants = VariantProps<typeof thumbVariants>
export type ActiveTextVariants = VariantProps<typeof activeTextVariants>
export type InactiveTextVariants = VariantProps<typeof inactiveTextVariants>
