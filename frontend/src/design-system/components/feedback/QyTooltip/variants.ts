/**
 * QyTooltip CVA variants configuration
 *
 * 使用 class-variance-authority 管理 Tooltip 变体
 * 提供类型安全的 variant 定义
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Tooltip placement 类型
 */
export type TooltipPlacementType =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'

/**
 * Tooltip 变体配置
 *
 * 包含以下维度：
 * - effect: 主题效果（dark/light）
 * - placement: 位置（用于箭头方向）
 */
export const tooltipVariants = cva(
  // 基础样式
  [
    'relative z-50',
    'max-w-[300px]',
    'px-3 py-2',
    'text-xs leading-relaxed',
    'rounded-lg',
    'transition-all duration-200 ease-out',
    'pointer-events-none',
    'whitespace-normal break-words'
  ],
  {
    variants: {
      /**
       * 主题效果
       * - dark: 深色主题（默认）
       * - light: 浅色主题
       */
      effect: {
        dark: [
          'bg-slate-900/95',
          'text-white',
          'shadow-lg',
          'backdrop-blur-sm'
        ],
        light: [
          'bg-white/95',
          'text-slate-800',
          'shadow-md',
          'border border-slate-200/50',
          'backdrop-blur-sm'
        ]
      },

      /**
       * 位置（用于添加箭头样式）
       * 箭头通过伪元素实现
       */
      placement: {
        top: 'data-[arrow=true]:after:bottom-0 data-[arrow=true]:after:left-1/2 data-[arrow=true]:after:-translate-x-1/2 data-[arrow=true]:after:translate-y-full',
        'top-start': 'data-[arrow=true]:after:bottom-0 data-[arrow=true]:after:left-2 data-[arrow=true]:after:translate-y-full',
        'top-end': 'data-[arrow=true]:after:bottom-0 data-[arrow=true]:after:right-2 data-[arrow=true]:after:translate-y-full',
        bottom: 'data-[arrow=true]:after:top-0 data-[arrow=true]:after:left-1/2 data-[arrow=true]:after:-translate-x-1/2 data-[arrow=true]:after:-translate-y-full',
        'bottom-start': 'data-[arrow=true]:after:top-0 data-[arrow=true]:after:left-2 data-[arrow=true]:after:-translate-y-full',
        'bottom-end': 'data-[arrow=true]:after:top-0 data-[arrow=true]:after:right-2 data-[arrow=true]:after:-translate-y-full',
        left: 'data-[arrow=true]:after:right-0 data-[arrow=true]:after:top-1/2 data-[arrow=true]:after:-translate-y-1/2 data-[arrow=true]:after:translate-x-full',
        'left-start': 'data-[arrow=true]:after:right-0 data-[arrow=true]:after:top-2 data-[arrow=true]:after:translate-x-full',
        'left-end': 'data-[arrow=true]:after:right-0 data-[arrow=true]:after:bottom-2 data-[arrow=true]:after:translate-x-full',
        right: 'data-[arrow=true]:after:left-0 data-[arrow=true]:after:top-1/2 data-[arrow=true]:after:-translate-y-1/2 data-[arrow=true]:after:-translate-x-full',
        'right-start': 'data-[arrow=true]:after:left-0 data-[arrow=true]:after:top-2 data-[arrow=true]:after:-translate-x-full',
        'right-end': 'data-[arrow=true]:after:left-0 data-[arrow=true]:after:bottom-2 data-[arrow=true]:after:-translate-x-full'
      }
    },

    // 默认变体
    defaultVariants: {
      effect: 'dark',
      placement: 'top'
    },

    // 组合变体（特殊情况的样式覆盖）
    compoundVariants: [
      // dark 效果下的箭头颜色
      {
        effect: 'dark',
        class: 'data-[arrow=true]:after:border-l-transparent data-[arrow=true]:after:border-r-transparent data-[arrow=true]:after:border-b-transparent data-[arrow=true]:after:border-t-slate-900/95'
      },
      // light 效果下的箭头颜色
      {
        effect: 'light',
        class: 'data-[arrow=true]:after:border-l-transparent data-[arrow=true]:after:border-r-transparent data-[arrow=true]:after:border-b-transparent data-[arrow=true]:after:border-t-white/95'
      }
    ]
  }
)

/**
 * Tooltip 变体类型
 * 从 CVA 配置中自动推导
 */
export type TooltipVariants = VariantProps<typeof tooltipVariants>
