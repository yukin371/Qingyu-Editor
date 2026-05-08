<script setup lang="ts">
/**
 * Card 组件
 *
 * 基础卡片组件，用于内容分组展示
 * 支持 header, default, footer 插槽
 * 支持多种变体、阴影、内边距和 hover 效果
 */

import { computed } from 'vue'
import { cn } from '../../utils/cn'
import type { CardProps } from './types'

// 组件 Props
const props = withDefaults(defineProps<CardProps>(), {
  variant: 'default',
  shadow: 'never',
  padding: 'md',
  hoverable: false,
})

const paddingClasses: Record<string, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

const headerPaddingClasses: Record<string, string> = {
  none: 'px-0 pt-0',
  sm: 'px-4 pt-4',
  md: 'px-6 pt-6',
  lg: 'px-8 pt-8',
}

const footerPaddingClasses: Record<string, string> = {
  none: 'px-0 pb-0',
  sm: 'px-4 pb-4',
  md: 'px-6 pb-6',
  lg: 'px-8 pb-8',
}

const variantClasses: Record<string, string> = {
  default: 'bg-white border border-slate-200/80',
  bordered: 'bg-white border border-slate-200',
  elevated: 'bg-white shadow-md',
  outlined: 'bg-white/90 border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
  glass: 'bg-white/80 border border-white/60 backdrop-blur-xl',
}

const shadowClasses: Record<string, string> = {
  always: 'shadow-[0_4px_16px_rgba(15,23,42,0.06)]',
  hover: 'hover:shadow-[0_8px_24px_rgba(15,23,42,0.1)] hover:-translate-y-0.5',
  never: '',
}

// 计算卡片样式类名
const cardClasses = computed(() =>
  cn(
    'relative rounded-lg overflow-hidden transition-all duration-200',
    variantClasses[props.variant] || variantClasses.default,
    paddingClasses[props.padding],
    shadowClasses[props.shadow],
    props.hoverable ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : '',
    props.class
  )
)

const headerClasses = computed(() =>
  cn(
    'border-b border-slate-100 pb-4 mb-4',
    headerPaddingClasses[props.padding],
  )
)

const footerClasses = computed(() =>
  cn(
    'border-t border-slate-100 pt-4 mt-4',
    footerPaddingClasses[props.padding],
  )
)
</script>

<template>
  <div :class="cardClasses">
    <!-- Header 插槽 -->
    <div v-if="$slots.header" :class="headerClasses">
      <slot name="header" />
    </div>

    <!-- 默认内容插槽 -->
    <slot />

    <!-- Footer 插槽 -->
    <div v-if="$slots.footer" :class="footerClasses">
      <slot name="footer" />
    </div>
  </div>
</template>
