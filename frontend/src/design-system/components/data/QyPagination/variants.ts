/**
 * QyPagination CVA variants configuration
 *
 * 使用 class-variance-authority 管理分页器变体
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 分页器容器变体配置
 */
export const paginationVariants = cva(['flex', 'items-center', 'flex-wrap', 'gap-3'], {
  variants: {
    size: {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
    },
    background: {
      true: 'rounded-[1.5rem] border border-slate-200/75 bg-white/88 px-3 py-2 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.45)] backdrop-blur-md dark:border-slate-700/70 dark:bg-slate-900/82',
      false: 'rounded-[1.25rem]',
    },
  },
  defaultVariants: {
    size: 'medium',
    background: false,
  },
})

/**
 * 分页按钮变体配置
 */
export const paginationButtonVariants = cva(
  [
    'min-w-[2.25rem]',
    'h-9',
    'px-3',
    'flex',
    'items-center',
    'justify-center',
    'rounded-full',
    'border',
    'transition-all',
    'duration-200',
    'cursor-pointer',
    'select-none',
    'font-medium',
    'shadow-[0_8px_18px_-16px_rgba(15,23,42,0.45)]',
  ],
  {
    variants: {
      active: {
        true: 'border-slate-900 bg-slate-900 text-white shadow-[0_16px_30px_-18px_rgba(15,23,42,0.7)] dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900',
        false:
          'border-slate-200/80 bg-white/92 text-slate-600 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700/80 dark:bg-slate-900/88 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-100',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed pointer-events-none',
        false: '',
      },
      size: {
        small: 'min-w-[2rem] h-8 px-2.5 text-xs',
        medium: 'min-w-[2.25rem] h-9 px-3 text-sm',
        large: 'min-w-[2.5rem] h-10 px-3.5 text-base',
      },
    },
    defaultVariants: {
      active: false,
      disabled: false,
      size: 'medium',
    },
  },
)

/**
 * 分页器文字变体配置
 */
export const paginationTextVariants = cva(['text-slate-500', 'dark:text-slate-400'], {
  variants: {
    size: {
      small: 'text-xs',
      medium: 'text-sm',
      large: 'text-base',
    },
  },
  defaultVariants: {
    size: 'medium',
  },
})

/**
 * 每页数量选择器变体配置
 */
export const paginationSelectVariants = cva(
  [
    'px-3',
    'py-1.5',
    'rounded-full',
    'border',
    'border-slate-200/80',
    'dark:border-slate-700/80',
    'bg-white/92',
    'dark:bg-slate-900/88',
    'text-slate-700',
    'dark:text-slate-300',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-slate-300',
    'dark:focus:ring-slate-600',
  ],
  {
    variants: {
      size: {
        small: 'h-8 text-xs',
        medium: 'h-9 text-sm',
        large: 'h-10 text-base',
      },
    },
    defaultVariants: {
      size: 'medium',
    },
  },
)

/**
 * 分页器变体类型
 */
export type PaginationVariants = VariantProps<typeof paginationVariants>
export type PaginationButtonVariants = VariantProps<typeof paginationButtonVariants>
export type PaginationTextVariants = VariantProps<typeof paginationTextVariants>
export type PaginationSelectVariants = VariantProps<typeof paginationSelectVariants>
