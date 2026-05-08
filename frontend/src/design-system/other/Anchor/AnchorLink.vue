<script setup lang="ts">
/**
 * AnchorLink 锚点链接组件
 *
 * 用于渲染单个锚点链接项
 */

import { computed } from 'vue'
import { cn } from '../../utils/cn'
import type { AnchorLinkProps } from './types'

// 组件 Props
const props = withDefaults(defineProps<AnchorLinkProps>(), {
  target: '_self',
})

// 内部状态
const isActive = computed(() => false)

// 计算链接样式类名
const linkClasses = computed(() =>
  cn(
    'flex items-center py-2 px-3 text-sm transition-all duration-200',
    'hover:text-primary-600 dark:hover:text-primary-400',
    'relative',
    {
      'text-neutral-600 dark:text-neutral-400': !isActive.value,
      'text-primary-600 dark:text-primary-400 font-medium': isActive.value,
    }
  )
)

// 点击处理
const handleClick = (_e: MouseEvent) => {
  // 阻止默认跳转行为，由父组件处理滚动
  // _e.preventDefault()
}
</script>

<template>
  <li class="list-none">
    <a
      :href="href"
      :target="target"
      :class="linkClasses"
      @click="handleClick"
    >
      <slot>{{ title }}</slot>
    </a>
    <!-- 子锚点 -->
    <ul v-if="$slots.default" class="ml-4 mt-1 space-y-1">
      <slot />
    </ul>
  </li>
</template>
