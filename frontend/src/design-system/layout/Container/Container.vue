<script setup lang="ts">
/**
 * Container 组件
 *
 * 响应式内容容器组件
 * 用于包裹和居中页面内容，支持多种尺寸和配置选项
 */

import { computed } from 'vue'
import { cn } from '../../utils/cn'
import type { ContainerProps, ContainerSize } from './types'

// 组件 Props
const props = withDefaults(defineProps<ContainerProps>(), {
  size: 'full',
  fluid: false,
  padding: true,
  centered: true,
})

/**
 * 将 size 转换为 Tailwind CSS 类名
 */
const getSizeClass = (size: ContainerSize): string => {
  const sizeMap: Record<ContainerSize, string> = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  }
  return sizeMap[size] || 'max-w-full'
}

/**
 * 获取内边距类名
 */
const paddingClass = computed(() => {
  return props.padding ? 'px-4 sm:px-6 lg:px-8' : ''
})

/**
 * 获取居中类名
 */
const centeredClass = computed(() => {
  return props.centered ? 'mx-auto' : ''
})

/**
 * 获取宽度类名
 */
const widthClass = computed(() => {
  return 'w-full'
})

/**
 * 计算容器类名
 */
const containerClasses = computed(() => {
  return cn(
    widthClass.value,
    centeredClass.value,
    paddingClass.value,
    getSizeClass(props.size),
    props.class
  )
})
</script>

<template>
  <div :class="containerClasses">
    <slot />
  </div>
</template>
