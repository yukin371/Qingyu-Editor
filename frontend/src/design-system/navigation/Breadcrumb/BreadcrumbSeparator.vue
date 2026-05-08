<script setup lang="ts">
/**
 * BreadcrumbSeparator 组件
 *
 * 自定义分隔符组件，用于替代默认分隔符
 */

import { computed } from 'vue'
import { cn } from '../../utils/cn'
import type { BreadcrumbSeparatorProps } from './types'

// 组件 Props
const props = defineProps<BreadcrumbSeparatorProps>()

// 计算样式类名
const classes = computed(() =>
  cn(
    // 基础样式
    'flex items-center text-slate-400 dark:text-slate-600',
    // 自定义类名
    props.class
  )
)
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>
