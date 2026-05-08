/**
 * QyBadge CVA variants configuration
 *
 * 使用 class-variance-authority 管理徽章变体
 * 提供类型安全的 variant 定义
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 徽章变体配置
 *
 * 包含以下维度：
 * - type: 徽章类型（dot/text/number）
 * - color: 颜色变体（primary/success/warning/danger/info）
 * - size: 尺寸变体（sm/md/lg）
 */
export const badgeVariants = cva(
  // 基础样式
  [
    'relative isolate inline-flex items-center justify-center overflow-hidden',
    'border select-none font-semibold',
    'transition-all duration-300 ease-out',
    'before:absolute before:inset-[1px] before:rounded-[inherit] before:bg-white/40 before:content-[""]',
    'after:absolute after:inset-x-[18%] after:top-0 after:h-1/2 after:rounded-full after:bg-white/60 after:opacity-80 after:blur-[10px] after:content-[""]',
  ],
  {
    variants: {
      /**
       * 徽章类型
       * - dot: 只显示小圆点
       * - text: 文本徽章
       * - number: 数字徽章（支持max值显示）
       */
      type: {
        dot: ['rounded-full', 'flex-shrink-0', 'before:hidden after:hidden'],
        text: ['rounded-full px-3 py-1', 'text-[11px] leading-none tracking-[0.08em]'],
        number: [
          'rounded-full px-1.5',
          'leading-none text-[11px] text-white',
          'shadow-[0_16px_28px_-18px_rgba(15,23,42,0.95)]',
        ],
      },

      /**
       * 颜色变体
       * - primary: 主要（青蓝渐变）
       * - success: 成功（绿色渐变）
       * - warning: 警告（黄色渐变）
       * - danger: 危险（红色渐变）
       * - info: 信息（蓝色渐变）
       */
      color: {
        primary: 'border-sky-200/70',
        success: 'border-emerald-200/75',
        warning: 'border-amber-200/80',
        danger: 'border-rose-200/80',
        info: 'border-slate-200/85',
      },

      /**
       * 尺寸变体
       */
      size: {
        sm: '',
        md: '',
        lg: '',
      },
    },

    // 默认变体
    defaultVariants: {
      type: 'number',
      color: 'primary',
      size: 'md',
    },

    // 组合变体（特殊情况的样式覆盖）
    compoundVariants: [
      // dot 类型特殊尺寸处理
      {
        type: 'dot',
        size: 'sm',
        class:
          'h-2.5 w-2.5 shadow-[0_0_0_3px_rgba(255,255,255,0.92),0_10px_16px_-10px_rgba(15,23,42,0.45)]',
      },
      {
        type: 'dot',
        size: 'md',
        class:
          'h-3.5 w-3.5 shadow-[0_0_0_4px_rgba(255,255,255,0.92),0_12px_18px_-10px_rgba(15,23,42,0.45)]',
      },
      {
        type: 'dot',
        size: 'lg',
        class:
          'h-[18px] w-[18px] shadow-[0_0_0_4px_rgba(255,255,255,0.92),0_14px_20px_-10px_rgba(15,23,42,0.45)]',
      },
      // text 类型尺寸处理
      {
        type: 'text',
        size: 'sm',
        class: 'px-2.5 py-1 text-[10px]',
      },
      {
        type: 'text',
        size: 'md',
        class: 'px-3 py-1.5 text-[11px]',
      },
      {
        type: 'text',
        size: 'lg',
        class: 'px-3.5 py-1.5 text-xs',
      },
      // number 类型尺寸处理
      {
        type: 'number',
        size: 'sm',
        class: 'h-4 min-w-[16px] text-[10px]',
      },
      {
        type: 'number',
        size: 'md',
        class: 'h-5 min-w-[20px] text-[11px]',
      },
      {
        type: 'number',
        size: 'lg',
        class: 'h-6 min-w-[24px] text-xs',
      },
      {
        type: 'text',
        color: 'primary',
        class:
          'bg-[linear-gradient(135deg,rgba(224,242,254,0.95),rgba(186,230,253,0.88))] text-sky-700 shadow-[0_18px_28px_-24px_rgba(14,165,233,0.85)]',
      },
      {
        type: 'text',
        color: 'success',
        class:
          'bg-[linear-gradient(135deg,rgba(220,252,231,0.95),rgba(187,247,208,0.88))] text-emerald-700 shadow-[0_18px_28px_-24px_rgba(5,150,105,0.8)]',
      },
      {
        type: 'text',
        color: 'warning',
        class:
          'bg-[linear-gradient(135deg,rgba(254,243,199,0.96),rgba(253,230,138,0.88))] text-amber-800 shadow-[0_18px_28px_-24px_rgba(217,119,6,0.8)]',
      },
      {
        type: 'text',
        color: 'danger',
        class:
          'bg-[linear-gradient(135deg,rgba(255,228,230,0.96),rgba(254,205,211,0.9))] text-rose-700 shadow-[0_18px_28px_-24px_rgba(225,29,72,0.82)]',
      },
      {
        type: 'text',
        color: 'info',
        class:
          'bg-[linear-gradient(135deg,rgba(241,245,249,0.96),rgba(226,232,240,0.92))] text-slate-700 shadow-[0_18px_28px_-24px_rgba(71,85,105,0.72)]',
      },
      {
        type: 'number',
        color: 'primary',
        class:
          'border-white/55 bg-[linear-gradient(135deg,#0ea5e9,#2563eb)] before:bg-white/18 after:bg-white/45',
      },
      {
        type: 'number',
        color: 'success',
        class:
          'border-white/55 bg-[linear-gradient(135deg,#10b981,#059669)] before:bg-white/18 after:bg-white/45',
      },
      {
        type: 'number',
        color: 'warning',
        class:
          'border-white/55 bg-[linear-gradient(135deg,#f59e0b,#d97706)] before:bg-white/16 after:bg-white/42',
      },
      {
        type: 'number',
        color: 'danger',
        class:
          'border-white/55 bg-[linear-gradient(135deg,#f43f5e,#e11d48)] before:bg-white/16 after:bg-white/42',
      },
      {
        type: 'number',
        color: 'info',
        class:
          'border-white/55 bg-[linear-gradient(135deg,#64748b,#334155)] before:bg-white/16 after:bg-white/42',
      },
      {
        type: 'dot',
        color: 'primary',
        class: 'bg-[radial-gradient(circle_at_30%_30%,#38bdf8,#0284c7)]',
      },
      {
        type: 'dot',
        color: 'success',
        class: 'bg-[radial-gradient(circle_at_30%_30%,#34d399,#059669)]',
      },
      {
        type: 'dot',
        color: 'warning',
        class: 'bg-[radial-gradient(circle_at_30%_30%,#fbbf24,#d97706)]',
      },
      {
        type: 'dot',
        color: 'danger',
        class: 'bg-[radial-gradient(circle_at_30%_30%,#fb7185,#e11d48)]',
      },
      {
        type: 'dot',
        color: 'info',
        class: 'bg-[radial-gradient(circle_at_30%_30%,#94a3b8,#475569)]',
      },
    ],
  },
)

/**
 * 徽章变体类型
 * 从 CVA 配置中自动推导
 */
export type BadgeVariants = VariantProps<typeof badgeVariants>
