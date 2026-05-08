/**
 * QyTextarea CVA variants configuration
 *
 * 使用 class-variance-authority 管理文本域变体
 * 提供类型安全的 variant 定义
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 文本域变体配置
 *
 * 包含以下维度：
 * - size: 尺寸变体
 * - resize: 调整大小方式
 * - state: 状态变体（默认/错误/成功/警告）
 */
export const textareaVariants = cva(
  // 基础样式
  [
    'w-full rounded-2xl border backdrop-blur-md text-slate-800',
    'placeholder:text-slate-400 transition-all duration-300',
    'focus:outline-none shadow-[0_12px_28px_-18px_rgba(15,23,42,0.45)]',
    'disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-100/85 disabled:border-slate-200'
  ],
  {
    variants: {
      /**
       * 尺寸变体
       */
      size: {
        sm: 'px-3 py-2.5 text-sm min-h-[84px]',
        md: 'px-4 py-3 text-base min-h-[108px]',
        lg: 'px-5 py-4 text-lg min-h-[132px]'
      },

      /**
       * 调整大小方式
       */
      resize: {
        none: 'resize-none',
        both: 'resize',
        horizontal: 'resize-x',
        vertical: 'resize-y'
      },

      /**
       * 状态变体
       */
      state: {
        default: [
          'border-white/85 bg-white/74 hover:border-blue-100',
          'focus:border-blue-300 focus:ring-4 focus:ring-blue-500/15'
        ],
        error: [
          'border-red-300 bg-red-50/85 hover:border-red-400',
          'focus:border-red-400 focus:ring-4 focus:ring-red-500/15'
        ],
        success: [
          'border-emerald-300 bg-emerald-50/85 hover:border-emerald-400',
          'focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/15'
        ],
        warning: [
          'border-amber-300 bg-amber-50/85 hover:border-amber-400',
          'focus:border-amber-400 focus:ring-4 focus:ring-amber-500/15'
        ]
      }
    },

    // 默认变体
    defaultVariants: {
      size: 'md',
      resize: 'vertical',
      state: 'default'
    }
  }
)

/**
 * 文本域变体类型
 * 从 CVA 配置中自动推导
 */
export type TextareaVariants = VariantProps<typeof textareaVariants>
