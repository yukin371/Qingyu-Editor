<script setup lang="ts">
/**
 * CollapseItem 组件
 *
 * 折叠面板项组件，包含标题和内容区域
 */

import { inject, computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import Icon from '../../base/Icon/Icon.vue'
import type { CollapseItemProps } from './types'

// Collapse 上下文类型
interface CollapseContext {
  activeNames: Readonly<(string | number)[]>
  isItemActive: (name: string | number) => boolean
  handleItemClick: (name: string | number) => void
}

// 注入 Collapse 上下文
const collapse = inject<CollapseContext>('collapse')

// 使用 CVA 定义内容区域变体
const contentVariants = cva(
  'overflow-hidden transition-all duration-300 ease-in-out',
  {
    variants: {
      expanded: {
        true: 'max-h-96 opacity-100',
        false: 'max-h-0 opacity-0',
      },
    },
    defaultVariants: {
      expanded: false,
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<CollapseItemProps>(), {
  name: undefined,
  title: undefined,
  disabled: false,
})

// 面板名称（如果没有提供 name，使用索引）
const itemName = computed(() => {
  return props.name !== undefined ? props.name : ''
})

// 是否激活
const isActive = computed(() => {
  return collapse?.isItemActive(itemName.value) || false
})

// 计算头部容器类名
const headerClasses = computed(() => {
  return cn(
    'flex items-center justify-between px-4 py-3 cursor-pointer transition-colors',
    'bg-white dark:bg-slate-800',
    'hover:bg-slate-50 dark:hover:bg-slate-750',
    !props.disabled && 'cursor-pointer',
    props.disabled && 'cursor-not-allowed opacity-50',
    props.class
  )
})

// 计算标题类名
const titleClasses = computed(() => {
  return cn(
    'text-sm font-medium text-slate-700 dark:text-slate-300',
    props.disabled && 'text-slate-400 dark:text-slate-500'
  )
})

// 计算箭头容器类名
const arrowClasses = computed(() => {
  return cn(
    'text-slate-400 dark:text-slate-500 transition-transform duration-300',
    isActive.value && 'rotate-180',
    props.disabled && 'text-slate-300 dark:text-slate-600'
  )
})

// 计算内容区域类名
const contentClasses = computed(() => {
  return cn(
    contentVariants({ expanded: isActive.value }),
    'bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700'
  )
})

// 计算内部内容类名
const innerContentClasses = computed(() => {
  return cn('px-4 py-3 text-sm text-slate-600 dark:text-slate-400')
})

// 处理点击
const handleClick = () => {
  if (!props.disabled && collapse) {
    collapse.handleItemClick(itemName.value)
  }
}
</script>

<template>
  <div class="collapse-item border-b border-slate-200 dark:border-slate-700 last:border-b-0">
    <!-- 头部 -->
    <div :class="headerClasses" @click="handleClick">
      <!-- 标题 -->
      <div :class="titleClasses">
        <slot name="title">{{ title }}</slot>
      </div>

      <!-- 箭头图标 -->
      <div :class="arrowClasses">
        <slot name="arrow">
          <Icon name="chevron-down" size="sm" />
        </slot>
      </div>
    </div>

    <!-- 内容区域 -->
    <div :class="contentClasses">
      <div :class="innerContentClasses">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
