<script setup lang="ts">
/**
 * ListItem 组件
 *
 * 列表项组件，用于 List 组件的子项
 * 支持禁用状态
 */

import { computed } from 'vue'
import { cn } from '../../utils/cn'
import type { ListItemProps } from './types'

// 组件 Props
const props = withDefaults(defineProps<ListItemProps>(), {
  disabled: false,
})

// 计算样式类名
const itemClasses = computed(() =>
  cn(
    'px-4 py-3 transition-colors duration-150',
    {
      'hover:bg-slate-50 cursor-pointer': !props.disabled,
      'cursor-not-allowed opacity-50': props.disabled,
    },
    props.class
  )
)
</script>

<template>
  <li :class="itemClasses">
    <slot />
  </li>
</template>
