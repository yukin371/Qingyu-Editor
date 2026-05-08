<script setup lang="ts">
/**
 * Empty 组件
 *
 * 空状态展示组件，支持自定义图标、描述和尺寸，并提供研磨过的表面和层级
 */

import { computed } from 'vue'
import { cn } from '../../utils/cn'
import Icon from '../Icon/Icon.vue'
import type { EmptyProps, EmptySize } from './types'

// 组件 Props
const props = withDefaults(defineProps<EmptyProps>(), {
  description: '暂无数据',
  size: 'md',
  iconSize: undefined,
})

// 组件 Emits
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// 尺寸调整映射
const sizeClasses: Record<string, { icon: string; iconText: string; title: string; description: string; gap: string }> = {
  sm: { icon: 'h-8 w-8', iconText: 'text-lg', title: 'text-sm font-semibold', description: 'text-xs', gap: 'gap-3' },
  md: { icon: 'h-12 w-12', iconText: 'text-xl', title: 'text-base font-semibold', description: 'text-sm', gap: 'gap-4' },
  lg: { icon: 'h-14 w-14', iconText: 'text-2xl', title: 'text-lg font-semibold', description: 'text-base', gap: 'gap-5' },
  xl: { icon: 'h-16 w-16', iconText: 'text-3xl', title: 'text-xl font-semibold', description: 'text-lg', gap: 'gap-6' },
}

const surfaceClasses = computed(() =>
  cn(
    'relative w-full max-w-[440px] flex flex-col items-center rounded-[1.5rem] border border-slate-200/70 bg-white/90 px-7 py-8 shadow-[0_35px_60px_-40px_rgba(15,23,42,0.6)] backdrop-blur-3xl transition',
    'hover:border-slate-300 focus-within:ring-2 focus-within:ring-slate-200 focus-within:ring-offset-2 focus-within:ring-offset-white/95',
    props.class,
  ),
)

const iconWrapperClasses = computed(() =>
  cn(
    'flex items-center justify-center rounded-2xl border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]',
    sizeClasses[resolvedSize.value].icon,
  ),
)

const iconClasses = computed(() =>
  cn('text-slate-400', sizeClasses[resolvedSize.value].iconText),
)

const contentGap = computed(() => sizeClasses[resolvedSize.value].gap)

// Resolve effective size from iconSize or size prop
const resolvedSize = computed<EmptySize>(() => {
  if (props.iconSize) {
    const iconSizeMap: Record<string, EmptySize> = {
      small: 'sm',
      medium: 'md',
      large: 'lg',
    }
    return iconSizeMap[props.iconSize] || (props.iconSize as EmptySize) || props.size
  }
  return props.size
})

const titleClasses = computed(() =>
  cn('text-slate-900', sizeClasses[resolvedSize.value].title, 'tracking-tight'),
)

const descriptionClasses = computed(() =>
  cn(
    sizeClasses[resolvedSize.value].description,
    'text-slate-500 leading-relaxed text-center max-w-[300px]',
  ),
)

const actionSlotClasses = computed(() => 'mt-5 flex w-full justify-center gap-3')

// 点击处理
const handleClick = (e: MouseEvent) => {
  emit('click', e)
}
</script>

<template>
  <div :class="surfaceClasses" role="status" aria-live="polite" @click="handleClick">
    <div
      class="pointer-events-none absolute inset-x-8 top-6 h-[3px] rounded-full bg-gradient-to-r from-slate-200/70 via-white to-slate-200/60"
      aria-hidden="true"
    />

    <div :class="['flex flex-col items-center text-center', contentGap]">
      <slot name="image">
        <div v-if="icon" :class="iconWrapperClasses">
          <Icon :name="icon" :class="iconClasses" />
        </div>
      </slot>

      <p v-if="title" :class="titleClasses">
        {{ title }}
      </p>

      <p :class="descriptionClasses">
        {{ description }}
      </p>
    </div>

    <div v-if="$slots.action" :class="actionSlotClasses">
      <slot name="action" />
    </div>

    <slot />
  </div>
</template>
