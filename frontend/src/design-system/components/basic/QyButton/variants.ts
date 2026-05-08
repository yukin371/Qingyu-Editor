/**
 * QyButton CVA variants configuration
 *
 * 使用 class-variance-authority 管理按钮变体
 * 提供类型安全的 variant 定义
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 按钮变体配置
 *
 * 包含以下维度：
 * - variant: 视觉样式变体
 * - size: 尺寸变体
 * - stateLayer: Apple/Material 混合状态描边
 */
export const buttonVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-[1.25rem] border font-semibold tracking-[0.01em]',
    'transition-[transform,box-shadow,background-color,border-color,color,opacity] duration-200 ease-out',
    'transform-gpu will-change-transform',
    'focus-visible:outline-none focus-visible:z-10 focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    'disabled:pointer-events-none disabled:opacity-60 disabled:shadow-none',
    'select-none overflow-hidden',
  ],
  {
    variants: {
      variant: {
        primary: [
          'text-white rounded-[1.25rem]',
          'bg-[linear-gradient(135deg,var(--gradient-to)_0%,var(--gradient-from)_100%)]',
          'border border-transparent',
          'shadow-[var(--shadow-control),0_18px_36px_-22px_rgba(37,99,235,0.78)]',
          'focus-visible:ring-primary-500/24',
          'hover:-translate-y-0.5 hover:shadow-[var(--shadow-card),0_18px_36px_-20px_rgba(37,99,235,0.72)]',
          'active:translate-y-0 active:scale-95',
        ],
        secondary: [
          'text-slate-900 rounded-[1.25rem]',
          'bg-[var(--color-surface-elevated)] backdrop-blur-xl border-[var(--color-line-soft)]',
          'shadow-[var(--shadow-inset-soft),var(--shadow-control)]',
          'focus-visible:ring-primary-500/14',
          'hover:-translate-y-0.25 hover:bg-white/90 hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-card)]',
          'active:scale-[0.985]',
        ],
        danger: [
          'text-white rounded-[1.25rem]',
          'bg-[linear-gradient(135deg,var(--color-danger-600)_0%,var(--color-danger-500)_100%)] border-transparent',
          'shadow-[0_20px_45px_-16px_rgba(220,38,38,0.65)]',
          'focus-visible:ring-danger-500/24',
          'hover:-translate-y-0.5 hover:shadow-[0_24px_45px_-20px_rgba(220,38,38,0.55)]',
          'active:translate-y-0 active:scale-95',
        ],
        ghost: [
          'text-slate-700 rounded-[1.25rem]',
          'bg-transparent border-slate-200/60',
          'focus-visible:ring-primary-500/14',
          'hover:bg-slate-50/90 hover:border-slate-300 hover:text-slate-900',
          'active:scale-95',
        ],
        outline: [
          'text-primary-600 rounded-[1.25rem]',
          'border-2 border-slate-200 bg-white/72',
          'focus-visible:ring-primary-500/16',
          'shadow-[0_8px_30px_-24px_rgba(15,23,42,0.42)]',
          'hover:bg-primary-50/80 hover:text-primary-700',
          'hover:border-primary-500/80',
          'active:scale-95',
        ],
        text: [
          'text-primary-600 rounded-lg',
          'border-transparent bg-transparent shadow-none',
          'focus-visible:ring-primary-500/14',
          'hover:bg-primary-50/60',
          'active:scale-95',
        ],
        gradient: [
          'text-white rounded-[1.25rem]',
          'bg-[linear-gradient(120deg,#0f172a_0%,var(--gradient-to)_45%,var(--gradient-from)_100%)]',
          'border border-white/10',
          'shadow-[var(--shadow-control),0_18px_40px_-24px_rgba(6,182,212,0.8)]',
          'focus-visible:ring-primary-500/24',
          'hover:-translate-y-0.5 hover:saturate-[1.06] hover:shadow-[var(--shadow-card),0_18px_40px_-22px_rgba(6,182,212,0.72)]',
          'active:scale-95',
        ],
      },
      size: {
        xs: 'min-h-[30px] px-3 text-xs',
        sm: 'min-h-[36px] px-4 text-sm',
        md: 'min-h-[42px] px-5 text-[15px]',
        lg: 'min-h-[48px] px-6 text-base',
        xl: 'min-h-[56px] px-7 text-lg',
      },
      stateLayer: {
        none: '',
        hover: 'hover:shadow-[0_18px_35px_-16px_rgba(15,23,42,0.5)]',
        focus: 'focus-visible:ring-primary-500/40',
      },
      block: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      stateLayer: 'none',
      block: false,
    },
    compoundVariants: [
      {
        variant: 'primary',
        size: 'lg',
        class: 'shadow-[var(--shadow-control),0_20px_40px_-20px_rgba(37,99,235,0.78)]',
      },
      {
        variant: 'danger',
        size: 'lg',
        class: 'shadow-[0_25px_45px_-20px_rgba(220,38,38,0.55)]',
      },
    ],
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
