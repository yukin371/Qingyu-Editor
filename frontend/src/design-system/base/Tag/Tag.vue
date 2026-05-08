<script setup lang="ts">
/**
 * Tag 组件
 *
 * 用于标签和分类展示的基础组件，支持多种变体、尺寸和视觉效果
 * 基于 CVA 管理变体，支持 light/dark/plain 三种效果
 */

import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import Icon from '../Icon/Icon.vue'
import type { TagProps } from './types'

// 使用 CVA 定义 Tag 变体
const tagVariants = cva(
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
       * 颜色变体
       */
      variant: {
        default: '',
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

    // 组合变体（variant + effect 的样式组合）
    compoundVariants: [
      // default variant
      {
        variant: 'default',
        effect: 'light',
        class:
          'border-slate-200/75 bg-[linear-gradient(135deg,rgba(248,250,252,0.96),rgba(241,245,249,0.92))] text-slate-700 shadow-[0_18px_28px_-24px_rgba(71,85,105,0.72)]',
      },
      {
        variant: 'default',
        effect: 'dark',
        class:
          'border-white/15 bg-[linear-gradient(135deg,#64748b,#334155)] text-white before:bg-white/12 after:bg-white/34 shadow-[0_22px_36px_-24px_rgba(51,65,85,0.92)]',
      },
      {
        variant: 'default',
        effect: 'plain',
        class:
          'border-slate-200/85 bg-white/74 text-slate-700 shadow-[0_16px_28px_-26px_rgba(71,85,105,0.62)]',
      },

      // primary variant
      {
        variant: 'primary',
        effect: 'light',
        class:
          'border-sky-200/75 bg-[linear-gradient(135deg,rgba(240,249,255,0.96),rgba(224,242,254,0.92))] text-sky-700 shadow-[0_18px_28px_-24px_rgba(14,165,233,0.82)]',
      },
      {
        variant: 'primary',
        effect: 'dark',
        class:
          'border-white/15 bg-[linear-gradient(135deg,#0ea5e9,#2563eb)] text-white before:bg-white/14 after:bg-white/42 shadow-[0_22px_36px_-24px_rgba(37,99,235,0.95)]',
      },
      {
        variant: 'primary',
        effect: 'plain',
        class:
          'border-sky-200/80 bg-white/72 text-sky-700 shadow-[0_16px_28px_-26px_rgba(37,99,235,0.78)]',
      },

      // success variant
      {
        variant: 'success',
        effect: 'light',
        class:
          'border-emerald-200/75 bg-[linear-gradient(135deg,rgba(236,253,245,0.96),rgba(220,252,231,0.92))] text-emerald-700 shadow-[0_18px_28px_-24px_rgba(5,150,105,0.8)]',
      },
      {
        variant: 'success',
        effect: 'dark',
        class:
          'border-white/15 bg-[linear-gradient(135deg,#10b981,#059669)] text-white before:bg-white/14 after:bg-white/42 shadow-[0_22px_36px_-24px_rgba(5,150,105,0.92)]',
      },
      {
        variant: 'success',
        effect: 'plain',
        class:
          'border-emerald-200/80 bg-white/72 text-emerald-700 shadow-[0_16px_28px_-26px_rgba(5,150,105,0.72)]',
      },

      // warning variant
      {
        variant: 'warning',
        effect: 'light',
        class:
          'border-amber-200/80 bg-[linear-gradient(135deg,rgba(255,251,235,0.96),rgba(254,243,199,0.94))] text-amber-800 shadow-[0_18px_28px_-24px_rgba(217,119,6,0.8)]',
      },
      {
        variant: 'warning',
        effect: 'dark',
        class:
          'border-white/15 bg-[linear-gradient(135deg,#f59e0b,#d97706)] text-white before:bg-white/12 after:bg-white/36 shadow-[0_22px_36px_-24px_rgba(217,119,6,0.9)]',
      },
      {
        variant: 'warning',
        effect: 'plain',
        class:
          'border-amber-200/85 bg-white/74 text-amber-800 shadow-[0_16px_28px_-26px_rgba(217,119,6,0.72)]',
      },

      // danger variant
      {
        variant: 'danger',
        effect: 'light',
        class:
          'border-rose-200/80 bg-[linear-gradient(135deg,rgba(255,241,242,0.96),rgba(255,228,230,0.92))] text-rose-700 shadow-[0_18px_28px_-24px_rgba(225,29,72,0.8)]',
      },
      {
        variant: 'danger',
        effect: 'dark',
        class:
          'border-white/15 bg-[linear-gradient(135deg,#f43f5e,#e11d48)] text-white before:bg-white/12 after:bg-white/36 shadow-[0_22px_36px_-24px_rgba(225,29,72,0.9)]',
      },
      {
        variant: 'danger',
        effect: 'plain',
        class:
          'border-rose-200/80 bg-white/74 text-rose-700 shadow-[0_16px_28px_-26px_rgba(225,29,72,0.7)]',
      },

      // info variant
      {
        variant: 'info',
        effect: 'light',
        class:
          'border-slate-200/85 bg-[linear-gradient(135deg,rgba(248,250,252,0.96),rgba(241,245,249,0.94))] text-slate-700 shadow-[0_18px_28px_-24px_rgba(71,85,105,0.72)]',
      },
      {
        variant: 'info',
        effect: 'dark',
        class:
          'border-white/15 bg-[linear-gradient(135deg,#64748b,#334155)] text-white before:bg-white/12 after:bg-white/34 shadow-[0_22px_36px_-24px_rgba(51,65,85,0.92)]',
      },
      {
        variant: 'info',
        effect: 'plain',
        class:
          'border-slate-200/85 bg-white/74 text-slate-700 shadow-[0_16px_28px_-26px_rgba(71,85,105,0.62)]',
      },
    ],

    // 默认变体
    defaultVariants: {
      variant: 'default',
      size: 'md',
      effect: 'light',
      round: true,
      hit: false,
    },
  }
)

// 关闭按钮尺寸映射
const closeIconSizes: Record<string, string> = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
}

// 组件 Props
const props = withDefaults(defineProps<TagProps>(), {
  variant: 'default',
  size: 'md',
  effect: 'light',
  round: true,
  hit: false,
  removable: false,
  disabled: false,
})

// 组件 Emits
const emit = defineEmits<{
  close: []
  click: [event: MouseEvent]
}>()

// 计算样式类名
const classes = computed(() =>
  cn(
    tagVariants({
      variant: props.variant,
      size: props.size,
      effect: props.effect,
      round: props.round,
      hit: props.hit,
    }),
    {
      'opacity-50 cursor-not-allowed pointer-events-none': props.disabled,
      'shadow-[0_8px_18px_-14px_rgba(15,23,42,0.35)]':
        props.effect === 'light' && props.variant === 'primary',
      'hover:shadow-lg': !props.disabled,
    },
    props.class
  )
)

// 计算关闭按钮样式
const closeButtonClasses = computed(() => {
  const base = 'rounded-full transition-colors duration-200 hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus:shadow-[0_0_0_2px_rgba(100,116,139,0.16)]'
  const size = 'flex items-center justify-center p-0.5'
  return cn(base, size)
})

// 点击处理
const handleClick = (e: MouseEvent) => {
  if (props.onClick) {
    emit('click', e)
  }
}

// 关闭处理
const handleClose = (e: MouseEvent) => {
  e.stopPropagation() // 防止触发 Tag 的点击事件
  if (!props.disabled) {
    emit('close')
  }
}
</script>

<template>
  <span :class="classes" @click="handleClick">
    <!-- 前缀图标 -->
    <Icon
      v-if="icon"
      :name="icon"
      :size="size === 'sm' ? 'xs' : size === 'lg' ? 'sm' : 'sm'"
      class="flex-shrink-0"
    />

    <!-- 标签内容 -->
    <span class="truncate">
      <slot />
    </span>

    <!-- 关闭按钮 -->
    <button
      v-if="removable"
      type="button"
      :class="closeButtonClasses"
      :disabled="disabled"
      :aria-label="`关闭标签`"
      @click="handleClose"
    >
      <svg
        :class="closeIconSizes[size]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </span>
</template>
