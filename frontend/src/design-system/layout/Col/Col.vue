<script setup lang="ts">
/**
 * Col 组件
 *
 * 基于 12 列网格系统的列布局组件
 * 支持响应式断点、偏移和排序
 */

import { computed, inject } from 'vue'
import { cn } from '../../utils/cn'
import type { ColProps } from './types'

// 组件 Props
const props = withDefaults(defineProps<ColProps>(), {
  span: 12,
  offset: 0,
})

// 从父 Row 组件注入 gutter 值
const gutter = inject<number>('gutter', 0)

/**
 * 将 span 数值转换为 Tailwind CSS 类名
 */
const getSpanClass = (span: number): string => {
  const spanMap: Record<number, string> = {
    1: 'w-1/12',
    2: 'w-2/12',
    3: 'w-3/12',
    4: 'w-4/12',
    5: 'w-5/12',
    6: 'w-6/12',
    7: 'w-7/12',
    8: 'w-8/12',
    9: 'w-9/12',
    10: 'w-10/12',
    11: 'w-11/12',
    12: 'w-full',
  }
  return spanMap[span] || 'w-full'
}

/**
 * 将 offset 数值转换为 Tailwind CSS 类名
 */
const getOffsetClass = (offset: number): string => {
  const offsetMap: Record<number, string> = {
    0: '',
    1: 'ml-1/12',
    2: 'ml-2/12',
    3: 'ml-3/12',
    4: 'ml-4/12',
    5: 'ml-5/12',
    6: 'ml-6/12',
    7: 'ml-7/12',
    8: 'ml-8/12',
    9: 'ml-9/12',
    10: 'ml-10/12',
    11: 'ml-11/12',
  }
  return offsetMap[offset] || ''
}

/**
 * 获取响应式 span 类名
 */
const getResponsiveClasses = computed(() => {
  const classes: string[] = []

  if (props.xs !== undefined) {
    classes.push(getSpanClass(props.xs))
  }
  if (props.sm !== undefined) {
    classes.push(`sm:${getSpanClass(props.sm)}`)
  }
  if (props.md !== undefined) {
    classes.push(`md:${getSpanClass(props.md)}`)
  }
  if (props.lg !== undefined) {
    classes.push(`lg:${getSpanClass(props.lg)}`)
  }
  if (props.xl !== undefined) {
    classes.push(`xl:${getSpanClass(props.xl)}`)
  }

  return classes.join(' ')
})

/**
 * 获取基础 span 类名
 */
const baseSpanClass = computed(() => {
  // 如果有响应式断点，不设置基础 span
  if (props.xs !== undefined || props.sm !== undefined || 
      props.md !== undefined || props.lg !== undefined || 
      props.xl !== undefined) {
    return ''
  }
  return getSpanClass(props.span)
})

/**
 * 获取偏移类名
 */
const offsetClass = computed(() => {
  return getOffsetClass(props.offset)
})

/**
 * 获取排序类名
 */
const orderClass = computed(() => {
  return props.order !== undefined ? `order-${props.order}` : ''
})

/**
 * 获取 gutter padding 类名
 */
const gutterPaddingClass = computed(() => {
  const gutterMap: Record<number, string> = {
    0: '',
    8: 'px-2',
    16: 'px-4',
    24: 'px-6',
    32: 'px-8',
  }
  return gutterMap[gutter] || ''
})

/**
 * 计算容器类名
 */
const containerClasses = computed(() => {
  return cn(
    'min-w-0', // 防止内容溢出
    gutterPaddingClass.value, // gutter padding
    baseSpanClass.value,
    getResponsiveClasses.value,
    offsetClass.value,
    orderClass.value,
    props.class
  )
})
</script>

<template>
  <div :class="containerClasses">
    <slot />
  </div>
</template>
