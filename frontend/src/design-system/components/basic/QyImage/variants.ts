/**
 * QyImage CVA variants configuration
 *
 * 使用 class-variance-authority 管理图片变体
 * 提供类型安全的 variant 定义
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 图片变体配置
 *
 * 包含以下维度：
 * - fit: 图片适配方式
 * - rounded: 圆角样式
 * - shadow: 阴影效果
 * - lazy: 懒加载占位样式
 */
export const imageVariants = cva(
  // 基础样式
  [
    'inline-block object-cover transition-all duration-300',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50'
  ],
  {
    variants: {
      /**
       * 图片适配方式
       * - cover: 覆盖容器（默认）
       * - contain: 包含在容器内
       * - fill: 填充容器
       * - none: 原始尺寸
       * - scale-down: 缩小以适应
       */
      fit: {
        cover: 'object-cover',
        contain: 'object-contain',
        fill: 'object-fill',
        none: 'object-none',
        'scale-down': 'object-scale-down'
      },

      /**
       * 圆角样式
       * - none: 无圆角
       * - sm: 小圆角
       * - md: 中圆角
       * - lg: 大圆角
       * - xl: 超大圆角
       * - full: 完全圆形
       */
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        full: 'rounded-full'
      },

      /**
       * 阴影效果
       * - none: 无阴影
       * - sm: 小阴影
       * - md: 中阴影
       * - lg: 大阴影
       * - xl: 超大阴影
       */
      shadow: {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl'
      },

      /**
       * 懒加载状态
       * - loading: 加载中（显示占位符）
       * - loaded: 已加载
       * - error: 加载错误
       */
      loadingState: {
        loading: 'opacity-0',
        loaded: 'opacity-100',
        error: 'hidden'
      }
    },

    // 默认变体
    defaultVariants: {
      fit: 'cover',
      rounded: 'md',
      shadow: 'none',
      loadingState: 'loading'
    }
  }
)

/**
 * 图片容器变体配置
 */
export const imageContainerVariants = cva(
  // 基础样式
  [
    'relative inline-block overflow-hidden',
    'transition-all duration-300'
  ],
  {
    variants: {
      /**
       * 容器圆角样式
       */
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        full: 'rounded-full'
      },

      /**
       * 容器阴影效果
       */
      shadow: {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl'
      }
    },

    defaultVariants: {
      rounded: 'md',
      shadow: 'none'
    }
  }
)

/**
 * 占位符变体配置
 */
export const placeholderVariants = cva(
  // 基础样式
  [
    'absolute inset-0 flex items-center justify-center',
    'bg-slate-100 dark:bg-slate-800',
    'transition-all duration-300'
  ],
  {
    variants: {
      /**
       * 占位符状态
       */
      state: {
        loading: 'opacity-100',
        loaded: 'opacity-0 pointer-events-none',
        error: 'opacity-100'
      }
    },

    defaultVariants: {
      state: 'loading'
    }
  }
)

/**
 * 图片变体类型
 * 从 CVA 配置中自动推导
 */
export type ImageVariants = VariantProps<typeof imageVariants>
export type ImageContainerVariants = VariantProps<typeof imageContainerVariants>
export type PlaceholderVariants = VariantProps<typeof placeholderVariants>
