<script setup lang="ts">
/**
 * Collapse 组件
 *
 * 折叠面板容器组件，支持手风琴模式和多个面板同时展开
 */

import { provide, computed, ref, watch } from 'vue'
import { cn } from '../../utils/cn'
import type { CollapseProps, CollapseEmits } from './types'

// 组件 Props
const props = withDefaults(defineProps<CollapseProps>(), {
  modelValue: () => [],
  accordion: false,
})

// 组件 Emits
const emit = defineEmits<CollapseEmits>()

// 计算容器类名
const containerClasses = computed(() => {
  return cn(
    'w-full border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden',
    props.class
  )
})

// 内部状态（用于非受控模式）
const internalActiveNames = ref<(string | number)[]>(props.modelValue || [])

// 当前激活的面板
const activeNames = computed<(string | number)[]>({
  get: () => internalActiveNames.value,
  set: (value) => {
    internalActiveNames.value = value
    emit('update:modelValue', value)
    emit('change', value)
  },
})

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    internalActiveNames.value = newVal || []
  }
)

// 处理面板点击
const handleItemClick = (name: string | number) => {
  if (props.accordion) {
    // 手风琴模式：只能展开一个
    activeNames.value = activeNames.value[0] === name ? [] : [name]
  } else {
    // 普通模式：可以展开多个
    const index = activeNames.value.indexOf(name)
    if (index > -1) {
      activeNames.value = activeNames.value.filter((n) => n !== name)
    } else {
      activeNames.value = [...activeNames.value, name]
    }
  }
}

// 检查面板是否激活
const isItemActive = (name: string | number) => {
  return activeNames.value.includes(name)
}

// 提供上下文给 CollapseItem
provide('collapse', {
  activeNames,
  isItemActive,
  handleItemClick,
})
</script>

<template>
  <div :class="containerClasses">
    <slot></slot>
  </div>
</template>
