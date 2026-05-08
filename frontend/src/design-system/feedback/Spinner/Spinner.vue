<script setup lang="ts">
/**
 * Spinner 加载中组件
 *
 * 用于显示加载状态和进度反馈的组件
 * 支持多种动画类型和尺寸
 */

import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { SpinnerProps } from './types'

// 使用 CVA 定义 Spinner 容器变体
const spinnerContainerVariants = cva(
  // 基础样式
  'inline-flex items-center justify-center',
  {
    variants: {
      size: {
        sm: 'gap-1.5',
        md: 'gap-2',
        lg: 'gap-2.5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<SpinnerProps>(), {
  type: 'default',
  size: 'md',
  strokeWidth: 3,
})

// 计算容器样式类名
const containerClasses = computed(() =>
  cn(
    spinnerContainerVariants({
      size: props.size,
    }),
    props.class
  )
)

// 计算颜色样式
const colorStyle = computed(() => {
  if (!props.color) return {}
  return {
    color: props.color,
  }
})

</script>

<template>
  <div
    :class="containerClasses"
    :style="colorStyle"
    role="status"
    :aria-label="label || '加载中'"
  >
    <!-- Default 类型: 旋转圆圈 -->
    <template v-if="type === 'default'">
      <svg
        :class="cn(
          'animate-spin',
          size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'
        )"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        :style="{
          ...colorStyle,
          strokeWidth: `${strokeWidth}px`
        }"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          :stroke-width="strokeWidth"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </template>

    <!-- Dots 类型: GitHub/nprogress 风格三点脉冲 -->
    <template v-else-if="type === 'dots'">
      <div :class="cn('flex items-center gap-1', size === 'sm' ? 'h-4' : size === 'md' ? 'h-5' : 'h-6')">
        <div
          v-for="i in 3"
          :key="i"
          :class="cn(
            'w-1 rounded-full bg-current',
            size === 'sm' ? 'h-1' : size === 'md' ? 'h-1.5' : 'h-2'
          )"
          :style="{
            ...colorStyle,
            animation: 'sp-dot 1.4s ease-in-out infinite',
            animationDelay: `${(i - 1) * 0.16}s`
          }"
        />
      </div>
    </template>

    <!-- Bars 类型: 优雅的拉伸条（YouTube/Spotify 风格） -->
    <template v-else-if="type === 'bars'">
      <div :class="cn('flex items-center gap-0.5', size === 'sm' ? 'h-4' : size === 'md' ? 'h-5' : 'h-6')">
        <div
          v-for="i in 5"
          :key="i"
          :class="cn(
            'w-1 rounded-full bg-current',
            size === 'sm' ? 'h-1' : size === 'md' ? 'h-1.5' : 'h-2'
          )"
          :style="{
            ...colorStyle,
            animation: 'sp-bar 1.2s ease-in-out infinite',
            animationDelay: `${(i - 1) * 0.1}s`
          }"
        />
      </div>
    </template>

    <!-- Wave 类型: 波浪条（Nprogress 渐变波浪） -->
    <template v-else-if="type === 'wave'">
      <div class="flex items-end gap-0.5">
        <div
          v-for="i in 5"
          :key="i"
          class="rounded-full bg-current"
          :style="{
            ...colorStyle,
            width: size === 'sm' ? '3px' : size === 'md' ? '4px' : '5px',
            height: size === 'sm' ? '16px' : size === 'md' ? '20px' : '28px',
            animation: 'sp-wave 1.2s ease-in-out infinite',
            animationDelay: `${(i - 1) * 0.12}s`
          }"
        />
      </div>
    </template>

    <!-- 加载文字说明 -->
    <span
      v-if="label || $slots.default"
      :class="cn(
        'ml-2 text-current',
        size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
      )"
    >
      <slot>{{ label }}</slot>
    </span>
  </div>
</template>

<style>
/* Dots: 三点脉冲（GitHub/nprogress 风格） */
@keyframes sp-dot {
  0%, 80%, 100% {
    transform: scaleY(0.5) translateY(0);
    opacity: 0.35;
  }
  40% {
    transform: scaleY(1) translateY(0);
    opacity: 1;
  }
}

/* Bars: 高度拉伸（YouTube 加载条风格） */
@keyframes sp-bar {
  0%, 100% {
    transform: scaleY(0.35);
    opacity: 0.5;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

/* Wave: 波浪起伏（Nprogress 渐变波浪） */
@keyframes sp-wave {
  0%, 100% {
    transform: scaleY(0.4);
    opacity: 0.5;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}
</style>
