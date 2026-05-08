<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="nativeType"
    :aria-disabled="disabled || loading || undefined"
    :aria-busy="loading || undefined"
    @click="handleClick"
  >
    <!-- 左侧图标 -->
    <span
      v-if="icon && iconPosition === 'left' && !loading"
      class="qy-button__icon qy-button__icon--left"
      v-html="icon"
    ></span>

    <!-- 加载动画 -->
    <svg
      v-if="loading"
      class="animate-spin qy-button__spinner"
      :class="spinnerSize"
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
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>

    <!-- 按钮内容 -->
    <slot />

    <!-- 右侧图标 -->
    <span
      v-if="icon && iconPosition === 'right' && !loading"
      class="qy-button__icon qy-button__icon--right"
      v-html="icon"
    ></span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/design-system/utils/cn'
import { buttonVariants } from './variants'
import type { QyButtonProps, QyButtonEmits } from './types'

// Props
const props = withDefaults(defineProps<QyButtonProps>(), {
  variant: 'primary',
  size: 'md',
  stateLayer: 'none',
  disabled: false,
  loading: false,
  iconPosition: 'left',
  nativeType: 'button',
  block: false,
})

// Emits
const emit = defineEmits<QyButtonEmits>()

// 计算按钮类名
const buttonClasses = computed(() => {
  return cn(
    buttonVariants({
      variant: props.variant,
      size: props.size,
      stateLayer: props.stateLayer,
      block: props.block,
    }),
    props.class,
  )
})

// 计算加载动画尺寸
const spinnerSize = computed(() => {
  const sizeMap: Record<string, string> = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
  }
  return sizeMap[props.size ?? 'md']
})

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.qy-button__icon {
  display: inline-flex;
  align-items: center;
  width: 1em;
  height: 1em;
  flex-shrink: 0;
}

.qy-button__icon--left {
  margin-right: 0.375em;
}

.qy-button__icon--right {
  margin-left: 0.375em;
}

.qy-button__icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.qy-button__spinner {
  margin-right: 0.5rem;
}
</style>
