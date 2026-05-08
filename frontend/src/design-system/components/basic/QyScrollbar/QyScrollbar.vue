<template>
  <div
    ref="scrollbarWrapper"
    :class="wrapperClasses"
    :style="wrapStyle"
  >
    <div
      ref="scrollbarView"
      :class="viewClasses"
      :style="viewStyle"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * QyScrollbar 滚动条组件
 *
 * 自定义滚动条样式，支持横向和纵向滚动
 */

import { computed, ref } from 'vue'
import { cn } from '../../../utils/cn'
import type { QyScrollbarProps } from './types'

// 组件 Props
const props = withDefaults(defineProps<QyScrollbarProps>(), {
  native: false,
  wrapClass: '',
  viewClass: '',
  noresize: false,
  tag: 'div',
})

// 模板引用
const scrollbarWrapper = ref<HTMLElement>()
const scrollbarView = ref<HTMLElement>()

// 计算包装器类名
const wrapperClasses = computed(() => {
  return cn(
    'qy-scrollbar',
    'relative overflow-hidden',
    'h-full w-full',
    props.wrapClass
  )
})

// 计算视图类名
const viewClasses = computed(() => {
  return cn(
    'qy-scrollbar-view',
    'h-full w-full',
    'overflow-auto',
    props.viewClass
  )
})

// 包装器样式
const wrapStyle = computed(() => props.wrapStyle)

// 视图样式
const viewStyle = computed(() => props.viewStyle)

// 暴露给父组件
defineExpose({
  scrollbarWrapper,
  scrollbarView,
})
</script>

<style scoped>
.qy-scrollbar {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.qy-scrollbar-view {
  height: 100%;
  width: 100%;
  overflow: auto;
}

/* 自定义滚动条样式 - 纵向 */
.qy-scrollbar-view::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.qy-scrollbar-view::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.qy-scrollbar-view::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
  transition: background 0.2s;
}

.qy-scrollbar-view::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Firefox 滚动条样式 */
.qy-scrollbar-view {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .qy-scrollbar-view::-webkit-scrollbar-track {
    background: #1e293b;
  }

  .qy-scrollbar-view::-webkit-scrollbar-thumb {
    background: #475569;
  }

  .qy-scrollbar-view::-webkit-scrollbar-thumb:hover {
    background: #64748b;
  }

  .qy-scrollbar-view {
    scrollbar-color: #475569 #1e293b;
  }
}
</style>
