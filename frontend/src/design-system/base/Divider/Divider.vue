<script setup lang="ts">
/**
 * Divider 组件
 *
 * 用于内容分割的分隔线组件
 * 支持水平/垂直方向、标签文字和多种线型
 */

import { computed } from 'vue'
import { cn } from '../../utils/cn'
import type { DividerProps } from './types'

// 组件 Props
const props = withDefaults(defineProps<DividerProps>(), {
  direction: 'horizontal',
  variant: 'solid',
  label: undefined,
})

const gradientDirections: Record<'horizontal' | 'vertical', string> = {
  horizontal: 'bg-gradient-to-r from-slate-200/0 via-slate-300/70 to-slate-200/0',
  vertical: 'bg-gradient-to-b from-slate-200/0 via-slate-300/70 to-slate-200/0',
}

const labelBaseClasses = 'px-3 py-1 rounded-full border border-slate-100 bg-white/90 shadow-sm text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase'

const containerClasses = computed(() => {
  return cn(
    'flex items-center gap-3 text-slate-500',
    props.direction === 'horizontal' ? 'w-full' : 'h-full flex-col justify-center',
    props.class
  )
})

const lineWrapperClasses = computed(() => {
  return cn(
    'flex items-center justify-center',
    props.direction === 'horizontal' ? 'flex-1 h-px' : 'h-full w-full'
  )
})

const lineClasses = computed(() => {
  const dimension = props.direction === 'horizontal' ? 'h-px w-full' : 'w-px h-full'
  const solidStyle = cn(
    'border border-transparent',
    gradientDirections[props.direction],
    'shadow-[0_12px_18px_-12px_rgba(15,23,42,0.9)]'
  )
  const dashedStyle = 'border border-dashed border-slate-300/70 bg-transparent'
  const dottedStyle = 'border border-dotted border-slate-300/70 bg-transparent'

  return cn(
    'relative overflow-hidden rounded-full transition-all duration-200 ease-out',
    dimension,
    props.variant === 'solid' ? solidStyle : props.variant === 'dashed' ? dashedStyle : dottedStyle
  )
})

const labelClasses = computed(() => {
  return cn(
    labelBaseClasses,
    props.direction === 'vertical' ? 'transform -rotate-90 origin-center' : ''
  )
})

const ariaOrientation = computed(() => {
  return props.direction === 'horizontal' ? 'horizontal' : 'vertical'
})
</script>

<template>
  <div :class="containerClasses" role="separator" :aria-orientation="ariaOrientation">
    <template v-if="label">
      <span :class="lineWrapperClasses">
        <span :class="lineClasses" aria-hidden="true"></span>
      </span>

      <span :class="labelClasses">
        {{ label }}
      </span>

      <span :class="lineWrapperClasses">
        <span :class="lineClasses" aria-hidden="true"></span>
      </span>
    </template>

    <template v-else>
      <span :class="lineWrapperClasses">
        <span :class="lineClasses" aria-hidden="true"></span>
      </span>
    </template>
  </div>
</template>
