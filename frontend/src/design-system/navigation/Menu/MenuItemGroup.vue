<script setup lang="ts">
/**
 * MenuItemGroup 组件
 *
 * 菜单分组组件，用于对菜单项进行分组展示
 */

import { computed } from 'vue'
import { cn } from '../../utils/cn'
import type { MenuItemGroupProps } from './types'

// 组件 Props
const props = defineProps<MenuItemGroupProps>()

// 计算样式类名
const groupClasses = computed(() =>
  cn(
    // 基础样式
    'menu-item-group py-2',
    props.class
  )
)

// 计算标题类名
const titleClasses = computed(() =>
  cn(
    // 基础样式
    'menu-group-title px-4 py-1 text-xs font-semibold uppercase tracking-wider',
    // 颜色
    'text-slate-500 dark:text-slate-400',
    // 边距
    'mt-2 mb-1'
  )
)

// 计算列表类名
const listClasses = computed(() =>
  cn(
    // 基础样式
    'menu-group-list',
    // 缩进
    'pl-2'
  )
)
</script>

<template>
  <li :class="groupClasses" role="group">
    <!-- 分组标题 -->
    <div :class="titleClasses">
      {{ title }}
    </div>

    <!-- 分组内容 -->
    <ul :class="listClasses">
      <slot />
    </ul>
  </li>
</template>

<style scoped>
.menu-item-group {
  list-style: none;
  margin: 0;
}

.menu-group-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
