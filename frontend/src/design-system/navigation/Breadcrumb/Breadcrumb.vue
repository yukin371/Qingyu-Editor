<script setup lang="ts">
/**
 * Breadcrumb 组件
 *
 * 面包屑导航容器组件，用于显示当前页面在层级结构中的位置
 */

import { computed, provide, ref } from 'vue'
import { cn } from '../../utils/cn'
import type { BreadcrumbProps, BreadcrumbContext } from './types'
import { BREADCRUMB_KEY } from './constants'

// 组件 Props
const props = withDefaults(defineProps<BreadcrumbProps>(), {
  separator: '/',
})

// 响应式状态
const items = ref<Array<{ id: string; hasChildren: boolean }>>([])
const itemIdCounter = ref(0)

// 计算子项数量
const itemCount = computed(() => items.value.length)

// 计算样式类名
const classes = computed(() =>
  cn(
    // 基础样式
    'flex items-center gap-2 text-sm',
    props.class
  )
)

// 注册面包屑项
const registerItem = (hasChildren: boolean) => {
  const id = `breadcrumb-item-${itemIdCounter.value++}`
  items.value.push({ id, hasChildren })
  return id
}

// 注销面包屑项
const unregisterItem = (id: string) => {
  const index = items.value.findIndex((item) => item.id === id)
  if (index > -1) {
    items.value.splice(index, 1)
  }
}

// 提供上下文给子组件
provide(BREADCRUMB_KEY, {
  separator: computed(() => props.separator),
  separatorClass: computed(() => props.separatorClass),
  itemCount,
  registerItem,
  unregisterItem,
} as BreadcrumbContext)
</script>

<template>
  <nav :class="classes" aria-label="Breadcrumb">
    <ol class="flex items-center gap-2">
      <slot />
    </ol>
  </nav>
</template>
