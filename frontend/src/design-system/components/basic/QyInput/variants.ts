/**
 * QyInput CVA variants configuration
 *
 * 使用 class-variance-authority 管理输入框变体
 * 提供类型安全的 variant 定义
 */

import { cva, type VariantProps } from 'class-variance-authority'

export const inputVariants = cva(
  [
    'w-full rounded-[1.5rem] bg-white/90 border border-slate-200 text-slate-900 placeholder:text-slate-400',
    'transition duration-200 ease-out transform-gpu',
    'shadow-[0_8px_30px_-20px_rgba(15,23,42,0.5)]',
    'focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/20 focus-visible:border-primary-500',
    'disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none',
  ],
  {
    variants: {
      size: {
        sm: 'px-3 py-2 text-sm min-h-[38px]',
        md: 'px-4 py-3 text-base min-h-[46px]',
        lg: 'px-5 py-4 text-lg min-h-[54px]',
      },
      state: {
        default: [
          'border-slate-200 hover:border-slate-300 focus:border-primary-400 focus:ring-primary-500/30',
          'bg-white',
        ],
        error: [
          'border-red-300 bg-red-50 text-red-900',
          'hover:border-red-400 focus:border-red-400 focus:ring-red-500/25 focus:bg-red-50',
        ],
        success: [
          'border-emerald-300 bg-emerald-50 text-emerald-900',
          'hover:border-emerald-400 focus:border-emerald-400 focus:ring-emerald-500/25 focus:bg-emerald-50',
        ],
        warning: [
          'border-amber-300 bg-amber-50 text-amber-900',
          'hover:border-amber-400 focus:border-amber-400 focus:ring-amber-500/25 focus:bg-amber-50',
        ],
        disabled: ['border-slate-200 bg-slate-100 text-slate-500', 'pointer-events-none'],
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'default',
    },
  },
)

export type InputVariants = VariantProps<typeof inputVariants>
