/**
 * QyAvatar CVA variants configuration
 *
 * 使用 class-variance-authority 管理头像变体
 * 提供类型安全的 variant 定义
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 头像容器变体配置
 *
 * 包含以下维度：
 * - size: 尺寸变体
 * - shape: 形状变体
 */
export const avatarVariants = cva(
  // 基础样式
  [
    'group relative inline-flex shrink-0 items-center justify-center overflow-hidden p-[2px]',
    'bg-white/85 backdrop-blur-xl ring-1 ring-slate-900/[0.06]',
    'shadow-[0_18px_30px_-22px_rgba(15,23,42,0.45)]',
  ],
  {
    variants: {
      /**
       * 尺寸变体
       */
      size: {
        xs: 'w-6 h-6',
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-20 h-20',
      },
      /**
       * 形状变体
       */
      shape: {
        circle: 'rounded-full',
        square: 'rounded-[1.35rem]',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle',
    },
  },
)

/**
 * 头像图片变体配置
 */
export const avatarImageVariants = cva(
  // 基础样式
  [
    'h-full w-full',
    'object-center saturate-[1.08] contrast-[1.02]',
    'transition-transform duration-500 ease-out',
  ],
  {
    variants: {
      /**
       * 图片适配方式
       */
      fit: {
        cover: 'object-cover',
        contain: 'object-contain',
        fill: 'object-fill',
        none: 'object-none',
        'scale-down': 'object-scale-down',
      },
    },
    defaultVariants: {
      fit: 'cover',
    },
  },
)

/**
 * 头像占位符变体配置
 */
export const avatarPlaceholderVariants = cva(
  // 基础样式
  [
    'relative flex h-full w-full items-center justify-center overflow-hidden rounded-[inherit]',
    'border border-white/45 bg-[linear-gradient(145deg,rgba(248,250,252,0.98),rgba(226,232,240,0.92))]',
    'text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]',
  ],
  {
    variants: {
      /**
       * 尺寸变体（用于图标大小）
       */
      size: {
        xs: 'text-[10px]',
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

/**
 * 文本头像背景色变体配置
 */
export const avatarTextBgVariants = cva(
  // 基础样式
  ['shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'],
  {
    variants: {
      /**
       * 颜色变体
       */
      color: {
        cyan: 'bg-[linear-gradient(145deg,#38bdf8,#0ea5e9_42%,#2563eb)]',
        blue: 'bg-[linear-gradient(145deg,#60a5fa,#3b82f6_42%,#1d4ed8)]',
        green: 'bg-[linear-gradient(145deg,#34d399,#10b981_42%,#047857)]',
        red: 'bg-[linear-gradient(145deg,#fb7185,#f43f5e_42%,#be123c)]',
        yellow: 'bg-[linear-gradient(145deg,#fbbf24,#f59e0b_42%,#b45309)]',
        purple: 'bg-[linear-gradient(145deg,#a78bfa,#8b5cf6_42%,#6d28d9)]',
        pink: 'bg-[linear-gradient(145deg,#f9a8d4,#ec4899_42%,#be185d)]',
      },
    },
    defaultVariants: {
      color: 'cyan',
    },
  },
)

/**
 * 头像文本变体配置
 */
export const avatarTextVariants = cva(
  // 基础样式
  ['font-semibold text-white tracking-[0.04em] drop-shadow-[0_1px_1px_rgba(15,23,42,0.2)]'],
  {
    variants: {
      /**
       * 尺寸变体
       */
      size: {
        xs: 'text-[10px]',
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

/**
 * 头像组容器变体配置
 */
export const avatarGroupVariants = cva(
  // 基础样式
  ['isolate flex items-center pl-1'],
  {
    variants: {},
  },
)

/**
 * 头像组中单个头像变体配置
 */
export const avatarGroupItemVariants = cva(
  // 基础样式
  [
    'group relative inline-flex shrink-0 items-center justify-center overflow-hidden p-[2px]',
    'bg-white/88 backdrop-blur-xl ring-1 ring-slate-900/[0.06]',
    'shadow-[0_16px_24px_-20px_rgba(15,23,42,0.42)]',
    'transition-transform duration-300 ease-out hover:-translate-y-0.5',
  ],
  {
    variants: {
      /**
       * 尺寸变体
       */
      size: {
        xs: 'w-6 h-6',
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-20 h-20',
      },
      /**
       * 形状变体
       */
      shape: {
        circle: 'rounded-full',
        square: 'rounded-[1.35rem]',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle',
    },
  },
)

/**
 * 头像变体类型
 * 从 CVA 配置中自动推导
 */
export type AvatarVariants = VariantProps<typeof avatarVariants>
export type AvatarImageVariants = VariantProps<typeof avatarImageVariants>
export type AvatarPlaceholderVariants = VariantProps<typeof avatarPlaceholderVariants>
export type AvatarTextBgVariants = VariantProps<typeof avatarTextBgVariants>
export type AvatarTextVariants = VariantProps<typeof avatarTextVariants>
export type AvatarGroupItemVariants = VariantProps<typeof avatarGroupItemVariants>
