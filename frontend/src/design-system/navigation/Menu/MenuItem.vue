<script setup lang="ts">
/**
 * MenuItem 组件
 *
 * 菜单项组件
 */

import { computed, inject, ref } from 'vue'
import { cn } from '../../utils/cn'
import type { MenuItemProps } from './types'
import { MENU_KEY, type MenuContext } from './constants'

// 组件 Props
const props = withDefaults(defineProps<MenuItemProps>(), {
  disabled: false,
})

// 注入 Menu 上下文
const menuContext = inject<MenuContext>(MENU_KEY, {
  activeIndex: ref(''),
  openedMenus: ref([]),
  mode: ref('vertical'),
  collapse: ref(false),
  uniqueOpened: ref(false),
  handleSelect: () => {},
  handleOpen: () => {},
  handleClose: () => {},
} as MenuContext)

// 计算是否激活
const isActive = computed(() => menuContext.activeIndex.value === props.index)

// 计算是否折叠
const isCollapsed = computed(() => menuContext.collapse.value && menuContext.mode.value === 'vertical')

// 计算样式类名
const itemClasses = computed(() =>
  cn(
    // 基础样式
    'menu-item flex items-center gap-2 px-4 py-3 cursor-pointer transition-all duration-200',
    // 响应式间距
    'hover:bg-slate-100 dark:hover:bg-slate-700',
    // 激活状态
    isActive.value
      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-medium border-r-2 border-primary-500'
      : 'text-slate-700 dark:text-slate-300',
    // 禁用状态
    props.disabled
      ? 'opacity-50 cursor-not-allowed pointer-events-none'
      : '',
    // 折叠模式
    isCollapsed.value ? 'justify-center px-0' : '',
    props.class
  )
)

// 处理点击
const handleClick = () => {
  if (!props.disabled) {
    menuContext.handleSelect(props.index)
  }
}
</script>

<template>
  <li
    :class="itemClasses"
    role="menuitem"
    :tabindex="disabled ? -1 : 0"
    @click="handleClick"
    @keydown.enter="handleClick"
  >
    <!-- 图标插槽 -->
    <slot name="icon">
      <span v-if="isCollapsed" class="text-sm">
        <slot name="icon" />
      </span>
    </slot>

    <!-- 默认插槽 -->
    <slot />

    <!-- 折叠时的提示（仅图标） -->
    <template v-if="isCollapsed && !$slots.default">
      <slot />
    </template>
  </li>
</template>

<style scoped>
.menu-item {
  list-style: none;
  margin: 0;
  user-select: none;
}

.menu-item:focus-visible {
  outline: 2px solid rgb(59 130 246);
  outline-offset: -2px;
}
</style>
