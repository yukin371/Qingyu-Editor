/**
 * Rate CVA variants configuration
 *
 * 使用 class-variance-authority 管理评分组件变体
 * 提供类型安全的 variant 定义
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 评分容器变体配置
 */
export const rateVariants = cva(
  // 基础样式
  'inline-flex items-center gap-1',
  {
    variants: {
      size: {
        sm: 'gap-0.5',
        md: 'gap-1',
        lg: 'gap-1.5'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
)

/**
 * 星星尺寸配置
 * 由于需要同时返回 container 和 icon 类名，使用对象配置
 */
export const starSizeVariants: Record<'sm' | 'md' | 'lg', { container: string; icon: string }> = {
  sm: {
    container: 'w-4 h-4',
    icon: 'w-4 h-4'
  },
  md: {
    container: 'w-5 h-5',
    icon: 'w-5 h-5'
  },
  lg: {
    container: 'w-6 h-6',
    icon: 'w-6 h-6'
  }
}

/**
 * 评分变体类型
 * 从 CVA 配置中自动推导
 */
export type RateVariants = VariantProps<typeof rateVariants>
export type StarSize = keyof typeof starSizeVariants
