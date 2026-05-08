<script setup lang="ts">
/**
 * CarouselItem 组件
 *
 * 轮播图的子项组件
 * 支持懒加载功能
 */

import { computed, inject, ref, watch } from 'vue'
import type { CarouselItemProps } from './types'

// 组件 Props
const props = withDefaults(defineProps<CarouselItemProps>(), {
  lazy: false,
})

// 注入父组件上下文
const carouselContext = inject<{
  activeIndex: number
  itemNames: (string | number)[]
  registerItem: (name: string | number) => void
  unregisterItem: (name: string | number) => void
}>('carouselContext')

// 生成唯一名称
const itemName = computed(() => props.name || carouselContext?.itemNames.length || 0)

// 当前项是否激活
const isActive = computed(() => {
  if (!carouselContext) return false
  return carouselContext.activeIndex === carouselContext.itemNames.indexOf(itemName.value)
})

// 懒加载状态
const isLoaded = ref(!props.lazy)

// 监听激活状态，实现懒加载
watch(isActive, (active) => {
  if (active && !isLoaded.value) {
    isLoaded.value = true
  }
}, { immediate: true })

// 注册当前项
if (carouselContext) {
  carouselContext.registerItem(itemName.value)
}

// 计算样式类名
const itemClasses = computed(() => {
  const classes = [
    'carousel-item',
    'absolute',
    'inset-0',
    'transition-transform',
    'duration-500',
    'ease-in-out',
  ]

  if (isActive.value) {
    classes.push('translate-x-0', 'translate-y-0', 'opacity-100', 'z-10')
  } else {
    classes.push('opacity-0', 'z-0')
  }

  return classes
})

// 组件卸载时注销
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (carouselContext) {
    carouselContext.unregisterItem(itemName.value)
  }
})
</script>

<template>
  <div :class="itemClasses">
    <div v-if="isLoaded" class="w-full h-full">
      <slot />
    </div>
    <div
      v-else
      class="w-full h-full flex items-center justify-center bg-slate-100"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>
  </div>
</template>

<style scoped>
.carousel-item {
  pointer-events: none;
}

.carousel-item:first-child {
  position: relative;
}
</style>
