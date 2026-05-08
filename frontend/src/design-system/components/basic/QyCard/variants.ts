/**
 * QyCard CVA variants configuration
 *
 * 使用 class-variance-authority 管理卡片变体
 * 提供类型安全的 variant 定义
 */

import { cva, type VariantProps } from 'class-variance-authority'

export const cardVariants = cva(
  [
    'relative overflow-hidden rounded-[1.75rem] text-[var(--color-ink-primary)]',
    'transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out',
  ],
  {
    variants: {
      shadow: {
        always: '[box-shadow:var(--shadow-card)]',
        hover: 'hover:[box-shadow:var(--shadow-floating)]',
        never: 'shadow-none',
      },
      variant: {
        default: [
          'bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.92)_100%)]',
          'border border-[var(--color-line-soft)]',
        ],
        glass: [
          'bg-[var(--color-surface-glass)] border border-[var(--color-line-contrast)]',
          'backdrop-blur-2xl saturate-150',
        ],
        outlined: [
          'bg-white/90 border border-slate-200/90',
          'shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        ],
        elevated: [
          'bg-[var(--color-surface-elevated)] border border-white/60',
          '[box-shadow:var(--shadow-floating)]',
        ],
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      shadow: 'hover',
      variant: 'default',
      padding: 'md',
    },
    compoundVariants: [
      {
        variant: 'glass',
        shadow: 'always',
        class: '[box-shadow:var(--shadow-card)]',
      },
      {
        variant: 'elevated',
        shadow: 'hover',
        class: 'hover:-translate-y-1 hover:[box-shadow:var(--shadow-floating)]',
      },
      {
        variant: 'outlined',
        shadow: 'hover',
        class:
          'hover:border-slate-300 hover:-translate-y-0.5 hover:[box-shadow:var(--shadow-card)]',
      },
    ],
  },
)

export const cardHeaderVariants = cva(
  ['relative z-[1] border-b border-[var(--color-line-soft)]', 'pb-4 mb-4'],
  {
    variants: {
      padding: {
        none: 'px-0 pt-0',
        sm: 'px-4 pt-4',
        md: 'px-6 pt-6',
        lg: 'px-8 pt-8',
      },
    },
    defaultVariants: {
      padding: 'md',
    },
  },
)

export const cardFooterVariants = cva(
  ['relative z-[1] border-t border-[var(--color-line-soft)]', 'pt-4 mt-4'],
  {
    variants: {
      padding: {
        none: 'px-0 pb-0',
        sm: 'px-4 pb-4',
        md: 'px-6 pb-6',
        lg: 'px-8 pb-8',
      },
    },
    defaultVariants: {
      padding: 'md',
    },
  },
)

export type CardVariants = VariantProps<typeof cardVariants>
