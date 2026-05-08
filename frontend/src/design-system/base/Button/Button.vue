<script setup lang="ts">
/**
 * Button 组件
 *
 * 基础按钮组件，支持多种变体和尺寸
 */

import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { ButtonProps } from './types'

// 使用 CVA 定义按钮变体
const buttonVariants = cva(
  // 基础样式
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500 active:bg-primary-700',
        secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 focus-visible:ring-slate-500 active:bg-slate-400 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600',
        ghost: 'hover:bg-slate-100 text-slate-700 hover:text-slate-900 focus-visible:ring-slate-500 active:bg-slate-200 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-100',
        danger: 'bg-danger-DEFAULT text-white hover:bg-danger-dark focus-visible:ring-danger-DEFAULT active:bg-red-700',
        success: 'bg-success-DEFAULT text-white hover:bg-success-dark focus-visible:ring-success-DEFAULT active:bg-emerald-700',
        warning: 'bg-warning-DEFAULT text-white hover:bg-warning-dark focus-visible:ring-warning-DEFAULT active:bg-amber-700',
        gradient: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 focus-visible:ring-cyan-500 active:from-cyan-700 active:to-blue-700',
        text: 'text-sky-600 hover:text-sky-700 hover:bg-sky-50 focus-visible:ring-sky-500 dark:text-sky-400 dark:hover:text-sky-300 dark:hover:bg-sky-950',
        outline: 'border-2 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-slate-400 dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-800',
        default: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:border-slate-700',
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-11 px-6 text-lg',
        xl: 'h-12 px-8 text-xl',
      },
      block: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      block: false,
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  block: false,
  type: 'button',
})

// 组件 Emits
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// 计算样式类名
const classes = computed(() =>
  cn(
    buttonVariants({
      variant: props.variant,
      size: props.size,
      block: props.block,
    }),
    props.class
  )
)

// 计算是否禁用（loading 或 disabled）
const isDisabled = computed(() => props.disabled || props.loading)

// 点击处理
const handleClick = (e: MouseEvent) => {
  if (!isDisabled.value) {
    emit('click', e)
  }
}
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="isDisabled"
    @click="handleClick"
  >
    <!-- 加载图标 -->
    <svg
      v-if="loading"
      class="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>

    <!-- 插槽内容 -->
    <slot />
  </button>
</template>
