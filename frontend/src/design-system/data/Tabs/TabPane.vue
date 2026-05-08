<script setup lang="ts">
/**
 * TabPane 组件
 *
 * 标签页面板组件，包含标签头和面板内容
 */

import { inject, computed, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import Icon from '../../base/Icon/Icon.vue'
import type { TabPaneProps, TabsContext, TabPaneInstance } from './types'

// 注入 Tabs 上下文
const tabs = inject<TabsContext>('tabs')

// 获取当前实例
const instance = getCurrentInstance()

// 组件 Props
const props = withDefaults(defineProps<TabPaneProps>(), {
  label: '',
  title: '',
  name: undefined,
  disabled: false,
  closable: undefined,
})

// 标签名称（如果没有提供 name，使用 uid）
const paneName = computed(() => {
  return props.name !== undefined ? props.name : (instance?.uid ?? 0)
})

// 是否激活
const isActive = computed(() => {
  return tabs?.currentName.value === paneName.value
})

// 是否可关闭（优先使用自身的 closable，其次使用 tabs 的 closable）
const isClosable = computed(() => {
  // 如果自身显式设置了 closable（不是 undefined），使用自身的值
  if (props.closable !== undefined) {
    return props.closable
  }
  // 否则继承父组件的 closable
  return tabs?.props.closable || false
})

const labelText = computed(() => props.label || props.title || '')
const isVerticalPosition = computed(
  () => tabs?.props.tabPosition === 'left' || tabs?.props.tabPosition === 'right',
)

// 使用 CVA 定义标签变体
const tabVariants = cva(
  'relative flex items-center justify-center gap-2 rounded-[1rem] px-4 py-2.5 text-sm font-medium transition-all duration-200',
  {
    variants: {
      type: {
        line: 'border border-transparent',
        card: 'border border-transparent',
        'border-card': 'border',
      },
      position: {
        top: '',
        right: '',
        bottom: '',
        left: '',
      },
      active: {
        true: '',
        false: '',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: 'cursor-pointer',
      },
    },
    compoundVariants: [
      // Line 类型激活状态
      {
        type: 'line',
        active: true,
        class:
          'border-white/70 bg-white text-slate-900 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.45)] dark:border-slate-700/70 dark:bg-slate-800 dark:text-slate-100',
      },
      {
        type: 'line',
        active: false,
        class:
          'text-slate-500 hover:bg-white/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200',
      },
      // Card 类型激活状态
      {
        type: 'card',
        active: true,
        class:
          'border-white/70 bg-white text-slate-950 shadow-[0_14px_28px_-18px_rgba(15,23,42,0.48)] dark:border-slate-700/70 dark:bg-slate-800 dark:text-slate-100',
      },
      {
        type: 'card',
        active: false,
        class:
          'text-slate-500 hover:bg-white/65 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/78 dark:hover:text-slate-200',
      },
      // Border-card 类型激活状态
      {
        type: 'border-card',
        active: true,
        class:
          'border-slate-200/80 bg-slate-950 text-white shadow-[0_16px_32px_-20px_rgba(15,23,42,0.6)] dark:border-slate-600 dark:bg-slate-100 dark:text-slate-900',
      },
      {
        type: 'border-card',
        active: false,
        class:
          'border-transparent text-slate-500 hover:border-slate-200/80 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:border-slate-700/70 dark:hover:bg-slate-900 dark:hover:text-slate-100',
      },
      // 禁用状态
      {
        disabled: true,
        class: 'text-slate-400 dark:text-slate-500 hover:bg-transparent',
      },
    ],
    defaultVariants: {
      type: 'line',
      position: 'top',
      active: false,
      disabled: false,
    },
  },
)

// 计算标签容器类名
const tabClasses = computed(() => {
  return cn(
    tabVariants({
      type: tabs?.props.type,
      position: tabs?.props.tabPosition,
      active: isActive.value,
      disabled: props.disabled,
    }),
    tabs?.props.stretch && 'flex-1',
    isVerticalPosition.value && 'min-w-[8.5rem]',
    props.class,
  )
})

// 计算标签文本类名
const labelClasses = computed(() => {
  return cn('whitespace-nowrap')
})

// 计算关闭按钮类名
const closeClasses = computed(() => {
  return cn(
    'ml-1 flex items-center justify-center rounded-sm transition-colors',
    'h-5 w-5 hover:bg-slate-200/80 dark:hover:bg-slate-600/80',
    'focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.16)]',
    props.disabled && 'opacity-50 cursor-not-allowed',
  )
})

// 计算面板内容类名
const paneClasses = computed(() => {
  return cn(
    'tab-pane order-last mt-4 w-full basis-full rounded-[1.6rem] border border-slate-200/75 bg-white/92 p-5 text-slate-700 shadow-[0_24px_54px_-36px_rgba(15,23,42,0.4)] backdrop-blur-md dark:border-slate-700/75 dark:bg-slate-950/72 dark:text-slate-300',
    !isActive.value && 'hidden',
    tabs?.props.type === 'border-card' && 'mt-3',
  )
})

// 处理点击
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && tabs) {
    tabs.handleTabClick(
      {
        uid: instance?.uid || 0,
        props,
        paneName: paneName.value,
        active: isActive.value,
        isClosable: isClosable.value,
      },
      event,
    )
  }
}

// 处理关闭
const handleClose = (event: MouseEvent) => {
  if (!props.disabled && tabs) {
    tabs.handleTabRemove(
      {
        uid: instance?.uid || 0,
        props,
        paneName: paneName.value,
        active: isActive.value,
        isClosable: isClosable.value,
      },
      event,
    )
  }
}

// 创建 TabPane 实例
const paneInstance: TabPaneInstance = {
  uid: instance?.uid || 0,
  props,
  paneName: paneName.value,
  active: isActive.value,
  isClosable: isClosable.value,
}

// 组件挂载时注册到 Tabs
onMounted(() => {
  tabs?.addPane(paneInstance)
})

// 组件卸载时从 Tabs 移除
onBeforeUnmount(() => {
  tabs?.removePane(paneInstance)
})
</script>

<template>
  <!-- 标签头 -->
  <div
    :class="tabClasses"
    role="tab"
    :aria-selected="isActive"
    :aria-disabled="props.disabled"
    @click="handleClick"
  >
    <!-- 标签内容 -->
    <slot name="label">
      <span :class="labelClasses">{{ labelText }}</span>
    </slot>

    <!-- 关闭按钮 -->
    <button
      v-if="isClosable"
      type="button"
      :class="closeClasses"
      :aria-label="`Close ${labelText || 'tab'}`"
      :disabled="props.disabled"
      @click="handleClose"
    >
      <Icon name="x-mark" size="sm" />
    </button>
  </div>

  <!-- 面板内容 -->
  <div v-if="isActive" :class="paneClasses" role="tabpanel" :aria-labelledby="`tab-${paneName}`">
    <slot></slot>
  </div>
</template>
