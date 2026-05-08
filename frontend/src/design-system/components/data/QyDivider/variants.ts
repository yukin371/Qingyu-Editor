/**
 * QyDivider CVA variants configuration
 *
 * 使用 class-variance-authority 管理分割线变体
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 分割线容器变体配置
 */
export const dividerVariants = cva(
  [
    'w-full'
  ],
  {
    variants: {
      direction: {
        horizontal: 'border-t border-slate-200 dark:border-slate-700',
        vertical: 'border-l border-slate-200 dark:border-slate-700 h-full'
      },
      dashed: {
        true: 'border-dashed',
        false: 'border-solid'
      }
    },
    defaultVariants: {
      direction: 'horizontal',
      dashed: false
    }
  }
)

/**
 * 分割线内容容器变体配置
 */
export const dividerContentVariants = cva(
  [
    'px-4',
    'bg-slate-50 dark:bg-slate-900',
    'text-sm',
    'text-slate-500 dark:text-slate-400',
    'whitespace-nowrap'
  ],
  {
    variants: {
      position: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
      }
    },
    defaultVariants: {
      position: 'center'
    }
  }
)

/**
 * 分割线变体类型
 */
export type DividerVariants = VariantProps<typeof dividerVariants>
export type DividerContentVariants = VariantProps<typeof dividerContentVariants>
