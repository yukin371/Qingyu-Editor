<script setup lang="ts">
/**
 * Row 组件
 *
 * 基于 Flexbox 的行布局容器组件
 * 支持水平对齐、垂直对齐、间距和换行
 */

import { computed, provide } from 'vue'
import { cn } from '../../utils/cn'
import type { RowProps } from './types'

// 组件 Props
const props = withDefaults(defineProps<RowProps>(), {
  justify: 'start',
  align: 'top',
  gutter: 0,
  wrap: true,
})

/**
 * 将 justify 值转换为 Tailwind CSS 类名
 */
const getJustifyClass = (justify: string): string => {
  const justifyMap: Record<string, string> = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    'space-between': 'justify-between',
    'space-around': 'justify-around',
    'space-evenly': 'justify-evenly',
  }
  return justifyMap[justify] || 'justify-start'
}

/**
 * 将 align 值转换为 Tailwind CSS 类名
 */
const getAlignClass = (align: string): string => {
  const alignMap: Record<string, string> = {
    top: 'items-start',
    center: 'items-center',
    bottom: 'items-end',
    stretch: 'items-stretch',
  }
  return alignMap[align] || 'items-start'
}

/**
 * 将 gutter 数值转换为 Tailwind CSS 类名
 */
const getGutterClass = (gutter: number): string => {
  const gutterMap: Record<number, string> = {
    0: '',
    8: '-mx-2',
    16: '-mx-4',
    24: '-mx-6',
    32: '-mx-8',
  }
  return gutterMap[gutter] || ''
}

/**
 * 获取 wrap 类名
 */
const getWrapClass = computed(() => {
  return props.wrap ? 'flex-wrap' : 'flex-nowrap'
})

/**
 * 计算容器类名
 */
const containerClasses = computed(() => {
  return cn(
    'flex', // Flexbox 容器
    getWrapClass.value,
    getJustifyClass(props.justify),
    getAlignClass(props.align),
    getGutterClass(props.gutter),
    props.class
  )
})

/**
 * 提供 gutter 值给子 Col 组件使用
 * Col 组件会根据这个值添加对应的 padding
 */
provide('gutter', props.gutter)
</script>

<template>
  <div :class="containerClasses">
    <slot />
  </div>
</template>
