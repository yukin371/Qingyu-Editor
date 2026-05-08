/**
 * QyTag CVA variants configuration
 *
 * 使用 class-variance-authority 管理标签变体
 * 提供类型安全的 variant 定义
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 标签变体配置
 *
 * 包含以下维度：
 * - type: 颜色类型
 * - size: 尺寸变体
 * - effect: 视觉效果（light/dark/plain）
 * - round: 圆角样式
 * - hit: 带边框效果
 */
export const tagVariants = cva(
  // 基础样式
  [
    'relative isolate inline-flex items-center gap-1.5 overflow-hidden',
    'border font-medium select-none',
    'backdrop-blur-md transition-all duration-300 ease-out',
    'before:absolute before:inset-[1px] before:rounded-[inherit] before:bg-white/45 before:content-[""]',
    'after:absolute after:inset-x-[16%] after:top-0 after:h-1/2 after:rounded-full after:bg-white/70 after:opacity-80 after:blur-[12px] after:content-[""]',
  ],
  {
    variants: {
      /**
       * 颜色类型
       */
      type: {
        primary: '',
        success: '',
        warning: '',
        danger: '',
        info: '',
      },

      /**
       * 尺寸变体
       */
      size: {
        sm: 'px-2.5 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-3.5 py-2 text-[15px]',
      },

      /**
       * 视觉效果
       * - light: 浅色背景（默认）
       * - dark: 深色背景
       * - plain: 朴素样式（仅边框）
       */
      effect: {
        light: '',
        dark: '',
        plain: '',
      },

      /**
       * 圆角样式
       */
      round: {
        true: 'rounded-full',
        false: 'rounded-2xl',
      },

      /**
       * 带边框效果
       */
      hit: {
        true: 'border-2',
        false: 'border',
      },
    },

    // 组合变体（type + effect 的样式组合）
    compoundVariants: [
      // primary type
      {
        type: 'primary',
        effect: 'light',
        class:
          'border-sky-200/75 bg-[linear-gradient(135deg,rgba(240,249,255,0.96),rgba(224,242,254,0.92))] text-sky-700 shadow-[0_18px_28px_-24px_rgba(14,165,233,0.82)]',
      },
      {
        type: 'primary',
        effect: 'dark',
        class:
          'border-white/15 bg-[linear-gradient(135deg,#0ea5e9,#2563eb)] text-white before:bg-white/14 after:bg-white/42 shadow-[0_22px_36px_-24px_rgba(37,99,235,0.95)]',
      },
      {
        type: 'primary',
        effect: 'plain',
        class:
          'border-sky-200/80 bg-white/72 text-sky-700 shadow-[0_16px_28px_-26px_rgba(37,99,235,0.78)]',
      },

      // success type
      {
        type: 'success',
        effect: 'light',
        class:
          'border-emerald-200/75 bg-[linear-gradient(135deg,rgba(236,253,245,0.96),rgba(220,252,231,0.92))] text-emerald-700 shadow-[0_18px_28px_-24px_rgba(5,150,105,0.8)]',
      },
      {
        type: 'success',
        effect: 'dark',
        class:
          'border-white/15 bg-[linear-gradient(135deg,#10b981,#059669)] text-white before:bg-white/14 after:bg-white/42 shadow-[0_22px_36px_-24px_rgba(5,150,105,0.92)]',
      },
      {
        type: 'success',
        effect: 'plain',
        class:
          'border-emerald-200/80 bg-white/72 text-emerald-700 shadow-[0_16px_28px_-26px_rgba(5,150,105,0.72)]',
      },

      // warning type
      {
        type: 'warning',
        effect: 'light',
        class:
          'border-amber-200/80 bg-[linear-gradient(135deg,rgba(255,251,235,0.96),rgba(254,243,199,0.94))] text-amber-800 shadow-[0_18px_28px_-24px_rgba(217,119,6,0.8)]',
      },
      {
        type: 'warning',
        effect: 'dark',
        class:
          'border-white/15 bg-[linear-gradient(135deg,#f59e0b,#d97706)] text-white before:bg-white/12 after:bg-white/36 shadow-[0_22px_36px_-24px_rgba(217,119,6,0.9)]',
      },
      {
        type: 'warning',
        effect: 'plain',
        class:
          'border-amber-200/85 bg-white/74 text-amber-800 shadow-[0_16px_28px_-26px_rgba(217,119,6,0.72)]',
      },

      // danger type
      {
        type: 'danger',
        effect: 'light',
        class:
          'border-rose-200/80 bg-[linear-gradient(135deg,rgba(255,241,242,0.96),rgba(255,228,230,0.92))] text-rose-700 shadow-[0_18px_28px_-24px_rgba(225,29,72,0.8)]',
      },
      {
        type: 'danger',
        effect: 'dark',
        class:
          'border-white/15 bg-[linear-gradient(135deg,#f43f5e,#e11d48)] text-white before:bg-white/12 after:bg-white/36 shadow-[0_22px_36px_-24px_rgba(225,29,72,0.9)]',
      },
      {
        type: 'danger',
        effect: 'plain',
        class:
          'border-rose-200/80 bg-white/74 text-rose-700 shadow-[0_16px_28px_-26px_rgba(225,29,72,0.7)]',
      },

      // info type
      {
        type: 'info',
        effect: 'light',
        class:
          'border-slate-200/85 bg-[linear-gradient(135deg,rgba(248,250,252,0.96),rgba(241,245,249,0.94))] text-slate-700 shadow-[0_18px_28px_-24px_rgba(71,85,105,0.72)]',
      },
      {
        type: 'info',
        effect: 'dark',
        class:
          'border-white/15 bg-[linear-gradient(135deg,#64748b,#334155)] text-white before:bg-white/12 after:bg-white/34 shadow-[0_22px_36px_-24px_rgba(51,65,85,0.92)]',
      },
      {
        type: 'info',
        effect: 'plain',
        class:
          'border-slate-200/85 bg-white/74 text-slate-700 shadow-[0_16px_28px_-26px_rgba(71,85,105,0.62)]',
      },
    ],

    // 默认变体
    defaultVariants: {
      type: 'primary',
      size: 'md',
      effect: 'light',
      round: true,
      hit: false,
    },
  },
)

/**
 * 标签变体类型
 * 从 CVA 配置中自动推导
 */
export type TagVariants = VariantProps<typeof tagVariants>
