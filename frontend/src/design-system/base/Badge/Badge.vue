<script setup lang="ts">
/**
 * Badge 组件
 *
 * 用于轻量状态标记、数量提示和附着式提醒
 */

import { computed, useSlots } from 'vue'
import { cn } from '../../utils/cn'
import type { BadgeProps } from './types'

// Emits
const emit = defineEmits<{
  close: []
}>()

const props = withDefaults(defineProps<BadgeProps>(), {
  variant: 'default',
  size: 'md',
  max: 99,
  absolute: false,
  position: 'top-0 right-0 -translate-y-1/3 translate-x-1/3',
  dot: false,
  content: null,
  closable: false,
})

const slots = useSlots()

const displayContent = computed(() => {
  if (props.dot) return ''

  if (props.content === null || props.content === undefined) {
    return ''
  }

  if (typeof props.content === 'number') {
    return props.content > props.max ? `${props.max}+` : String(props.content)
  }

  return String(props.content)
})

const isDot = computed(() => {
  return props.dot || (props.content === null || props.content === undefined)
})

const hasSlotContent = computed(() => Boolean(slots.default))

const shouldRender = computed(() => {
  return isDot.value || hasSlotContent.value || displayContent.value.length > 0
})

const contentLength = computed(() => displayContent.value.length)

const pillToneClasses = {
  default:
    'bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.95))] text-slate-600 ring-1 ring-slate-200/85',
  primary:
    'bg-[linear-gradient(180deg,rgba(239,246,255,0.98),rgba(219,234,254,0.96))] text-sky-700 ring-1 ring-sky-200/85',
  success:
    'bg-[linear-gradient(180deg,rgba(236,253,245,0.98),rgba(209,250,229,0.96))] text-emerald-700 ring-1 ring-emerald-200/85',
  warning:
    'bg-[linear-gradient(180deg,rgba(255,251,235,0.98),rgba(254,243,199,0.96))] text-amber-700 ring-1 ring-amber-200/85',
  danger:
    'bg-[linear-gradient(180deg,rgba(255,241,242,0.98),rgba(255,228,230,0.96))] text-rose-700 ring-1 ring-rose-200/85',
  secondary:
    'bg-[linear-gradient(180deg,rgba(241,245,249,0.98),rgba(226,232,240,0.95))] text-slate-500 ring-1 ring-slate-200/70',
  ghost:
    'bg-transparent text-slate-500 ring-1 ring-slate-300/60',
} as const

const dotToneClasses = {
  default: 'bg-slate-400',
  primary: 'bg-sky-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  secondary: 'bg-slate-400',
  ghost: 'bg-slate-400',
} as const

const pillSizeClasses = {
  sm: 'min-h-5 min-w-5 px-1.5 text-[11px]',
  md: 'min-h-6 min-w-6 px-2 text-xs',
  lg: 'min-h-7 min-w-7 px-2.5 text-sm',
} as const

const widePillClasses = {
  sm: 'px-2',
  md: 'px-2.5',
  lg: 'px-3',
} as const

const dotSizeClasses = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
} as const

const classes = computed(() => {
  if (!shouldRender.value) return 'hidden'

  return cn(
    'relative inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full font-semibold tracking-[0.01em] transition-all duration-200',
    isDot.value
      ? [
          dotToneClasses[props.variant],
          dotSizeClasses[props.size],
          props.absolute
            ? 'absolute z-10 ring-[4px] ring-white shadow-[0_10px_20px_-12px_rgba(15,23,42,0.55)]'
            : 'shadow-[0_8px_16px_-12px_rgba(15,23,42,0.45)]',
        ]
      : [
          pillToneClasses[props.variant],
          pillSizeClasses[props.size],
          contentLength.value > 2 ? widePillClasses[props.size] : '',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_10px_18px_-16px_rgba(15,23,42,0.4)]',
          props.absolute
            ? 'absolute z-10 ring-[3px] ring-white/95 shadow-[0_12px_24px_-16px_rgba(15,23,42,0.45)]'
            : '',
        ],
    props.absolute ? props.position : '',
    props.class,
  )
})
</script>

<template>
  <span
    v-if="shouldRender"
    :class="classes"
    :aria-hidden="isDot ? 'true' : undefined"
  >
    <template v-if="!isDot">
      <slot>{{ displayContent }}</slot>
      <button
        v-if="closable"
        type="button"
        class="ml-1 -mr-0.5 rounded-full p-0.5 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-slate-400/50 transition-colors"
        aria-label="关闭"
        @click.stop="emit('close')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </template>
  </span>
</template>
