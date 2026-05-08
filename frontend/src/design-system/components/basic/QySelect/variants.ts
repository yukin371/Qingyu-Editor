/**
 * QySelect CVA variants configuration
 *
 * 使用 class-variance-authority 管理选择器变体
 * 提供类型安全的 variant 定义
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 选择器变体配置
 *
 * 包含以下维度：
 * - size: 尺寸变体
 * - state: 状态变体（默认/错误/成功/警告）
 */
export const selectVariants = cva(
  // 基础样式
  [
    'relative flex items-center justify-between w-full rounded-lg border',
    'bg-white text-slate-700 transition-all duration-200',
    'focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20',
    'disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-50'
  ],
  {
    variants: {
      /**
       * 尺寸变体
       */
      size: {
        sm: 'h-8 px-2 py-1 text-xs',
        md: 'h-10 px-3 py-2 text-sm',
        lg: 'h-12 px-4 py-3 text-base'
      },

      /**
       * 状态变体
       */
      state: {
        default: 'border-slate-300 hover:border-primary-400',
        error: 'border-red-300 hover:border-red-400 focus-within:border-red-500 focus-within:ring-red-500/20',
        success: 'border-emerald-300 hover:border-emerald-400 focus-within:border-emerald-500 focus-within:ring-emerald-500/20',
        warning: 'border-amber-300 hover:border-amber-400 focus-within:border-amber-500 focus-within:ring-amber-500/20'
      }
    },

    // 默认变体
    defaultVariants: {
      size: 'md',
      state: 'default'
    }
  }
)

/**
 * 选择器变体类型
 * 从 CVA 配置中自动推导
 */
export type SelectVariants = VariantProps<typeof selectVariants>
