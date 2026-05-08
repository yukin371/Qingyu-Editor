/**
 * QyDrawer 抽屉组件变体配置
 *
 * 使用 CVA (Class Variance Authority) 管理组件变体
 */

import { cva } from 'class-variance-authority'
import type { InternalDirection } from './types'

/**
 * 抽屉主体变体
 */
export const drawerVariants = cva(
  // 基础样式
  [
    'fixed bg-white dark:bg-slate-800 shadow-2xl',
    'flex flex-col',
    'transition-all duration-300 ease-ios',
    'backdrop-blur-xl',
  ],
  {
    variants: {
      /**
       * 方向变体
       */
      direction: {
        left: [
          'top-0 left-0 h-full',
          'border-r border-slate-200 dark:border-slate-700',
          'rounded-r-3xl',
        ],
        right: [
          'top-0 right-0 h-full',
          'border-l border-slate-200 dark:border-slate-700',
          'rounded-l-3xl',
        ],
        top: [
          'top-0 left-0 w-full',
          'border-b border-slate-200 dark:border-slate-700',
          'rounded-b-3xl',
        ],
        bottom: [
          'bottom-0 left-0 w-full',
          'border-t border-slate-200 dark:border-slate-700',
          'rounded-t-3xl',
        ],
      },
      /**
       * 动画状态变体
       */
      animating: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      direction: 'right',
      animating: false,
    },
  }
)

/**
 * 抽屉头部样式
 */
export const headerVariants = cva(
  [
    'flex items-center justify-between',
    'px-6 py-4',
    'border-b border-slate-200 dark:border-slate-700',
    'flex-shrink-0',
  ],
  {
    variants: {
      hasTitle: {
        true: '',
        false: '',
      },
    },
  }
)

/**
 * 抽屉标题样式
 */
export const titleVariants = cva(
  [
    'text-lg font-semibold',
    'text-slate-900 dark:text-slate-100',
  ]
)

/**
 * 抽屉内容区域样式
 */
export const bodyVariants = cva(
  [
    'flex-1 overflow-auto',
    'px-6 py-4',
  ]
)

/**
 * 抽屉底部样式
 */
export const footerVariants = cva(
  [
    'flex items-center justify-end gap-3',
    'px-6 py-4',
    'border-t border-slate-200 dark:border-slate-700',
    'flex-shrink-0',
  ]
)

/**
 * 关闭按钮样式
 */
export const closeBtnVariants = cva(
  [
    'p-1 rounded-md',
    'text-slate-400 hover:text-slate-600',
    'dark:text-slate-500 dark:hover:text-slate-300',
    'hover:bg-slate-100 dark:hover:bg-slate-700',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary-500',
    'focus:ring-offset-2 dark:focus:ring-offset-slate-800',
  ]
)

/**
 * 遮罩层样式
 */
export const overlayVariants = cva(
  [
    'fixed inset-0',
    'bg-slate-900/50',
    'backdrop-blur-md',
    'transition-opacity duration-300',
  ],
  {
    variants: {
      visible: {
        true: 'opacity-100',
        false: 'opacity-0',
      },
    },
    defaultVariants: {
      visible: false,
    },
  }
)

/**
 * 动画变换样式映射
 * 用于 Transition 组件的 enter-from/leave-to 类
 */
export const transformVariants: Record<InternalDirection, string> = {
  left: 'translateX(-100%)',
  right: 'translateX(100%)',
  top: 'translateY(-100%)',
  bottom: 'translateY(100%)',
}

/**
 * 获取抽屉尺寸样式
 */
export function getSizeStyle(size: string | number, direction: InternalDirection): Record<string, string> {
  const isHorizontal = direction === 'left' || direction === 'right'

  if (typeof size === 'number') {
    return isHorizontal
      ? { width: `${size}px` }
      : { height: `${size}px` }
  }

  // 处理百分比
  if (typeof size === 'string' && /^\d+%$/.test(size)) {
    return isHorizontal
      ? { width: size, maxWidth: '100vw' }
      : { height: size, maxHeight: '100vh' }
  }

  // 处理其他单位（px, rem, em 等）
  return isHorizontal
    ? { width: size }
    : { height: size }
}

/**
 * 获取预设尺寸的实际值
 */
export function getPresetSize(size: 'small' | 'medium' | 'large'): string {
  const sizes: Record<typeof size, string> = {
    small: '30%',
    medium: '50%',
    large: '70%',
  }
  return sizes[size]
}
