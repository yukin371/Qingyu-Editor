<script setup lang="ts">
/**
 * Menu 组件
 *
 * 为页面和功能提供导航的菜单列表
 */

import { computed, provide, ref, watch } from 'vue'
import { cn } from '../../utils/cn'
import type { MenuEmits, MenuProps } from './types'
import { MENU_KEY } from './constants'

// 组件 Props
const props = withDefaults(defineProps<MenuProps>(), {
  mode: 'vertical',
  defaultActive: '',
  defaultOpeneds: () => [],
  collapse: false,
  uniqueOpened: false,
})

// 组件 Emits
const emit = defineEmits<MenuEmits>()

// 响应式状态
const activeIndex = ref(props.defaultActive || '')
const openedMenus = ref<string[]>([...props.defaultOpeneds])

// 计算样式类名
const menuClasses = computed(() =>
  cn(
    // 基础样式
    'menu border border-slate-200 dark:border-slate-700 rounded-lg transition-all duration-300',
    // 模式样式
    props.mode === 'horizontal'
      ? 'menu-horizontal flex flex-row items-center bg-white dark:bg-slate-800'
      : 'menu-vertical flex flex-col min-w-[200px] bg-white dark:bg-slate-800',
    // 折叠样式
    props.collapse && props.mode === 'vertical' ? 'w-[64px]' : '',
    // 自定义背景色
    props.backgroundColor ? '' : '',
    props.class
  )
)

const menuStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.backgroundColor) {
    style.backgroundColor = props.backgroundColor
  }
  if (props.textColor) {
    style.color = props.textColor
  }
  return style
})

// 处理菜单选择
const handleSelect = (index: string) => {
  activeIndex.value = index
  emit('select', index, getIndexPath(index))
}

// 处理子菜单展开
const handleOpen = (index: string) => {
  if (props.uniqueOpened) {
    openedMenus.value = [index]
  } else if (!openedMenus.value.includes(index)) {
    openedMenus.value.push(index)
  }
  emit('open', index)
}

// 处理子菜单收起
const handleClose = (index: string) => {
  const idx = openedMenus.value.indexOf(index)
  if (idx > -1) {
    openedMenus.value.splice(idx, 1)
  }
  emit('close', index)
}

// 获取菜单项路径（用于事件）
const getIndexPath = (index: string): string[] => {
  // 简化版本，实际应该根据菜单结构获取完整路径
  return [index]
}

// 监听默认激活项变化
watch(
  () => props.defaultActive,
  (val) => {
    if (val) {
      activeIndex.value = val
    }
  }
)

// 监听默认展开项变化
watch(
  () => props.defaultOpeneds,
  (val) => {
    openedMenus.value = [...val]
  },
  { deep: true }
)

// 提供上下文给子组件
provide(MENU_KEY, {
  activeIndex,
  openedMenus,
  mode: computed(() => props.mode),
  collapse: computed(() => props.collapse),
  uniqueOpened: computed(() => props.uniqueOpened),
  handleSelect,
  handleOpen,
  handleClose,
})
</script>

<template>
  <ul
    :class="menuClasses"
    :style="menuStyle"
    role="menu"
  >
    <slot />
  </ul>
</template>

<style scoped>
/* Menu 基础样式 */
.menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* 水平菜单样式 */
.menu-horizontal {
  padding: 0.5rem;
}

/* 垂直菜单样式 */
.menu-vertical {
  padding: 0.5rem 0;
}

/* 折叠模式样式 */
.menu-vertical:has(.menu-item--collapsed) {
  min-width: 64px;
}
</style>
