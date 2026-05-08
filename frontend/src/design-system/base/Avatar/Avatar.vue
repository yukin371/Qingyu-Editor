<script setup lang="ts">
/**
 * Avatar 组件
 *
 * 用于用户头像展示，支持图片、fallback 文字和在线状态指示器
 */

import { computed, getCurrentInstance, ref } from 'vue'
import type { CSSProperties } from 'vue'
import { cn } from '../../utils/cn'
import type { AvatarProps } from './types'

// 组件 Props
const props = withDefaults(defineProps<AvatarProps>(), {
  size: 'md',
  variant: 'circle',
  disableStatus: false,
})

// 组件 Emits
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
const instance = getCurrentInstance()

const imageError = ref(false)

// 处理图片加载错误
const handleImageError = () => {
  imageError.value = true
}

// 处理图片加载成功
const handleImageLoad = () => {
  imageError.value = false
}

// 计算是否显示 fallback
const showFallback = computed(() => {
  return !props.src || imageError.value
})

// 获取 fallback 文字（取首字母，最多两个字符）
const fallbackText = computed(() => {
  if (!props.alt) return '?'

  const normalized = props.alt.trim()
  if (!normalized) return '?'

  // 群组场景中的 +5 / 99 等简短标记，直接显示原文
  if (normalized.length <= 3 && /^[+\dA-Za-z\u4e00-\u9fa5]+$/u.test(normalized)) {
    return normalized.toUpperCase()
  }

  // 如果是中文字符，取第一个字
  const chineseRegex = /^[\u4e00-\u9fa5]/
  if (chineseRegex.test(normalized)) {
    return normalized.charAt(0).toUpperCase()
  }

  // 英文取首字母，最多两个
  const words = normalized.split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }

  return normalized.slice(0, 2).toUpperCase()
})

// 尺寸样式映射
const sizeClasses: Record<string, string> = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-xl',
  '2xl': 'h-20 w-20 text-2xl',
}

// 形状样式映射
const variantClasses: Record<string, string> = {
  circle: 'rounded-full',
  square: 'rounded-[1.1rem]',
  rounded: 'rounded-[1.5rem]',
}

// 状态指示器颜色映射
const statusColorClasses: Record<string, string> = {
  online: 'bg-success-DEFAULT',
  offline: 'bg-neutral-400',
  away: 'bg-warning-DEFAULT',
  busy: 'bg-danger-DEFAULT',
}

// 状态指示器尺寸映射
const statusSizeClasses: Record<string, string> = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-3.5 w-3.5',
  '2xl': 'h-4 w-4',
}

// 状态指示器位置映射
const statusPositionClasses: Record<string, string> = {
  xs: '-bottom-0 -right-0',
  sm: '-bottom-0.5 -right-0.5',
  md: '-bottom-0.5 -right-0.5',
  lg: '-bottom-1 -right-1',
  xl: '-bottom-1 -right-1',
  '2xl': '-bottom-1.5 -right-1.5',
}

const fallbackPalettes = [
  {
    background: 'linear-gradient(145deg, #eff6ff 0%, #dbeafe 52%, #c7d2fe 100%)',
    color: '#274c77',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.82), inset 0 -12px 20px rgba(148,163,184,0.14)',
  },
  {
    background: 'linear-gradient(145deg, #f5f3ff 0%, #ede9fe 50%, #ddd6fe 100%)',
    color: '#54418e',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.82), inset 0 -12px 18px rgba(124,58,237,0.12)',
  },
  {
    background: 'linear-gradient(145deg, #ecfeff 0%, #ccfbf1 50%, #bae6fd 100%)',
    color: '#155e75',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.84), inset 0 -12px 18px rgba(14,116,144,0.12)',
  },
  {
    background: 'linear-gradient(145deg, #fff7ed 0%, #ffedd5 50%, #fde68a 100%)',
    color: '#8a4b14',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.84), inset 0 -12px 18px rgba(245,158,11,0.12)',
  },
  {
    background: 'linear-gradient(145deg, #fff1f2 0%, #ffe4e6 50%, #fbcfe8 100%)',
    color: '#9a3458',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.82), inset 0 -12px 18px rgba(244,114,182,0.12)',
  },
  {
    background: 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 54%, #dbeafe 100%)',
    color: '#334155',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.88), inset 0 -12px 18px rgba(100,116,139,0.12)',
  },
]

const getSeedIndex = (seed: string) => {
  return (
    Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0) % fallbackPalettes.length
  )
}

const fallbackPalette = computed(() => {
  const seed = props.alt?.trim() || props.src || '?'
  return fallbackPalettes[getSeedIndex(seed)]
})

const fallbackPaletteStyle = computed<CSSProperties>(() => {
  return {
    background: fallbackPalette.value.background,
    color: fallbackPalette.value.color,
    boxShadow: fallbackPalette.value.boxShadow,
  }
})

const isInteractive = computed(() => {
  return Boolean(instance?.vnode.props?.onClick)
})

// 计算容器样式类名
const containerClasses = computed(() => {
  return cn(
    'group relative isolate inline-flex items-center justify-center overflow-hidden p-[2px]',
    'bg-white/85 shadow-[0_18px_32px_-20px_rgba(15,23,42,0.42)] ring-1 ring-slate-900/[0.06] backdrop-blur-xl',
    sizeClasses[props.size],
    variantClasses[props.variant],
    isInteractive.value
      ? 'cursor-pointer transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_42px_-20px_rgba(59,130,246,0.38)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200/60'
      : '',
    props.class,
  )
})

const innerClasses = computed(() => {
  return cn(
    'relative flex h-full w-full items-center justify-center overflow-hidden border border-white/45 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(241,245,249,0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]',
    variantClasses[props.variant],
  )
})

const imageClasses = computed(() => {
  return cn(
    'h-full w-full object-cover object-center saturate-[1.06] transition-transform duration-500 ease-out',
    variantClasses[props.variant],
    isInteractive.value ? 'group-hover:scale-[1.05]' : '',
  )
})

const fallbackClasses = computed(() => {
  return cn(
    'relative flex h-full w-full items-center justify-center',
    variantClasses[props.variant],
  )
})

const fallbackTextClasses = computed(() => {
  return cn(
    'font-semibold tracking-[0.06em] text-current drop-shadow-[0_1px_0_rgba(255,255,255,0.28)]',
    props.size === 'xs' ? 'text-[10px]' : '',
    props.size === 'sm' ? 'text-xs' : '',
    props.size === 'md' ? 'text-sm' : '',
    props.size === 'lg' ? 'text-base' : '',
    props.size === 'xl' ? 'text-lg' : '',
    props.size === '2xl' ? 'text-xl' : '',
  )
})

const glowClasses = computed(() => {
  return cn(
    'pointer-events-none absolute inset-[2px] opacity-90',
    'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_58%)]',
    variantClasses[props.variant],
  )
})

// 计算状态指示器样式类名
const statusClasses = computed(() => {
  if (props.disableStatus || !props.status) return ''

  return cn(
    'absolute rounded-full border-[3px] border-white shadow-[0_6px_14px_-8px_rgba(15,23,42,0.9)] ring-1 ring-slate-900/10',
    statusColorClasses[props.status],
    statusSizeClasses[props.size],
    statusPositionClasses[props.size],
  )
})

const emitInteraction = (event: MouseEvent | KeyboardEvent) => {
  emit('click', event as unknown as MouseEvent)
}

// 点击处理
const handleClick = (e: MouseEvent) => {
  emitInteraction(e)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!isInteractive.value || (event.key !== 'Enter' && event.key !== ' ')) {
    return
  }

  event.preventDefault()
  emitInteraction(event)
}
</script>

<template>
  <div
    :class="containerClasses"
    :role="isInteractive ? 'button' : 'img'"
    :aria-label="alt"
    :tabindex="isInteractive ? 0 : undefined"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <div :class="innerClasses">
      <!-- 图片模式 -->
      <img
        v-if="src && !showFallback"
        :src="src"
        :alt="alt"
        :class="imageClasses"
        @error="handleImageError"
        @load="handleImageLoad"
      />

      <!-- Fallback 模式 -->
      <span v-else :class="fallbackClasses" :style="fallbackPaletteStyle">
        <span :class="fallbackTextClasses">{{ fallbackText }}</span>
      </span>
    </div>

    <span :class="glowClasses" aria-hidden="true" />

    <!-- 状态指示器 -->
    <span v-if="status && !disableStatus" :class="statusClasses" aria-hidden="true" />
  </div>
</template>
