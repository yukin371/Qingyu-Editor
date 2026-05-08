<script setup lang="ts">
/**
 * Skeleton 组件
 *
 * 骨架屏组件，用于加载时展示占位内容
 */

import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { SkeletonProps } from './types'

// 使用 CVA 定义骨架变体
const skeletonVariants = cva(
  // 基础样式 - subtle tonal 风格，无边框无 inset shadow
  'relative isolate overflow-hidden bg-slate-100/90 dark:bg-slate-800/60',
  {
    variants: {
      type: {
        text: 'rounded-full',
        circle: 'rounded-full',
        rect: 'rounded-2xl',
        avatar: 'rounded-full',
        image: 'rounded-2xl',
      },
      animated: {
        true: 'qy-skeleton--animated',
        false: '',
      },
    },
    defaultVariants: {
      type: 'text',
      animated: true,
    },
  },
)

// 组件 Props
const props = withDefaults(defineProps<SkeletonProps>(), {
  type: 'text',
  size: 'md',
  animated: true,
})

// 动态导入尺寸映射
import { skeletonSizeMap as sizeMap } from './types'

// 计算尺寸类名
const sizeClasses = computed(() => {
  if (props.width || props.height) {
    return []
  }
  const sizeInfo = sizeMap[props.type || 'text'][props.size || 'md']
  return [sizeInfo.width, sizeInfo.height]
})

// 计算自定义尺寸
const customStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.width) {
    style.width = props.width
  }
  if (props.height) {
    style.height = props.height
  }
  return style
})

// 计算样式类名
const classes = computed(() =>
  cn(
    skeletonVariants({
      type: props.type,
      animated: props.animated,
    }),
    sizeClasses.value,
    props.class,
  ),
)
</script>

<template>
  <div :class="classes" :style="customStyle" aria-hidden="true">
    <div
      v-if="props.animated"
      class="pointer-events-none absolute inset-y-0 left-0 w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/[0.06] qy-skeleton__shimmer"
    />
  </div>
</template>

<style scoped>
.qy-skeleton__shimmer {
  animation: qy-skeleton-shimmer 1.8s ease-in-out infinite;
}

@keyframes qy-skeleton-shimmer {
  100% {
    transform: translateX(300%);
  }
}
</style>
