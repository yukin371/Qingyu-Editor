<script setup lang="ts">
/**
 * MenuSub 组件
 *
 * 子菜单组件，支持嵌套
 */

import { computed, inject, ref, watch } from 'vue'
import { cn } from '../../utils/cn'
import type { MenuSubProps } from './types'
import { MENU_KEY, type MenuContext } from './constants'

// 组件 Props
const props = withDefaults(defineProps<MenuSubProps>(), {
  showTimeout: 300,
  hideTimeout: 300,
})

// 注入 Menu 上下文
const menuContext = inject<MenuContext>(MENU_KEY, {
  activeIndex: ref(''),
  openedMenus: ref([] as string[]),
  mode: ref('vertical'),
  collapse: ref(false),
  uniqueOpened: ref(false),
  handleSelect: () => {},
  handleOpen: () => {},
  handleClose: () => {},
} as MenuContext)

// 本地状态
const isOpened = ref(false)
const hoverTimer = ref<number | null>(null)

// 计算是否展开
const isMenuOpened = computed(() => {
  return menuContext.openedMenus.value.includes(props.index) || isOpened.value
})

// 计算是否折叠
const isCollapsed = computed(() => menuContext.collapse.value && menuContext.mode.value === 'vertical')

// 计算是否是水平模式
const isHorizontal = computed(() => menuContext.mode.value === 'horizontal')

// 计算标题容器类名
const titleClasses = computed(() =>
  cn(
    // 基础样式
    'menu-sub-title flex items-center justify-between gap-2 px-4 py-3 cursor-pointer transition-all duration-200',
    // 响应式样式
    'hover:bg-slate-100 dark:hover:bg-slate-700',
    // 文字颜色
    'text-slate-700 dark:text-slate-300',
    // 折叠模式
    isCollapsed.value ? 'justify-center px-0' : '',
    props.class
  )
)

// 计算子菜单容器类名
const subMenuClasses = computed(() =>
  cn(
    // 基础样式
    'menu-sub-content overflow-hidden transition-all duration-300',
    // 展开状态
    isMenuOpened.value ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0',
    // 水平模式（弹出菜单）
    isHorizontal.value
      ? 'absolute left-0 top-full min-w-[200px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50'
      : 'pl-4'
  )
)

// 箭头旋转
const arrowClasses = computed(() =>
  cn(
    'transition-transform duration-200',
    isMenuOpened.value ? 'rotate-90' : '',
    isCollapsed.value && !isHorizontal.value ? 'rotate-0' : ''
  )
)

// 处理标题点击
const handleTitleClick = () => {
  if (isMenuOpened.value) {
    menuContext.handleClose(props.index)
    isOpened.value = false
  } else {
    menuContext.handleOpen(props.index)
    isOpened.value = true
  }
}

// 处理鼠标进入
const handleMouseEnter = () => {
  if (isHorizontal.value) {
    if (hoverTimer.value) {
      clearTimeout(hoverTimer.value)
    }
    hoverTimer.value = window.setTimeout(() => {
      menuContext.handleOpen(props.index)
      isOpened.value = true
    }, props.showTimeout)
  }
}

// 处理鼠标离开
const handleMouseLeave = () => {
  if (isHorizontal.value) {
    if (hoverTimer.value) {
      clearTimeout(hoverTimer.value)
    }
    hoverTimer.value = window.setTimeout(() => {
      menuContext.handleClose(props.index)
      isOpened.value = false
    }, props.hideTimeout)
  }
}

// 监听上下文变化
watch(
  () => menuContext.openedMenus.value.includes(props.index),
  (val) => {
    isOpened.value = val
  }
)
</script>

<template>
  <li
    class="menu-sub relative"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 标题部分 -->
    <div
      :class="titleClasses"
      role="menuitem"
      aria-haspopup="true"
      :aria-expanded="isMenuOpened"
      @click="isHorizontal ? undefined : handleTitleClick"
    >
      <!-- 图标插槽 -->
      <slot name="icon">
        <span v-if="isCollapsed" class="text-sm">
          <slot name="icon" />
        </span>
      </slot>

      <!-- 标题内容 -->
      <span v-if="!isCollapsed" class="flex-1">
        <slot name="title" />
      </span>

      <!-- 折叠图标 -->
      <svg
        v-if="!isHorizontal && !isCollapsed"
        :class="arrowClasses"
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        />
      </svg>

      <!-- 向下箭头（水平模式） -->
      <svg
        v-if="isHorizontal"
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>

    <!-- 子菜单内容 -->
    <ul
      v-show="isMenuOpened || isHorizontal"
      :class="subMenuClasses"
      role="menu"
    >
      <slot />
    </ul>
  </li>
</template>

<style scoped>
.menu-sub {
  list-style: none;
  margin: 0;
}

.menu-sub-title:focus-visible {
  outline: 2px solid rgb(59 130 246);
  outline-offset: -2px;
}

.menu-sub-content {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
