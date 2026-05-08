<script setup lang="ts">
/**
 * BreadcrumbItem 组件
 *
 * 面包屑项组件，支持路由链接和点击事件
 */

import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { cn } from '../../utils/cn'
import type { BreadcrumbItemEmits, BreadcrumbItemProps } from './types'
import { BREADCRUMB_KEY } from './constants'

// 组件 Props
const props = withDefaults(defineProps<BreadcrumbItemProps>(), {
  clickable: true,
  replace: false,
})

// 组件 Emits
const emit = defineEmits<BreadcrumbItemEmits>()

// 获取路由实例
const router = useRouter()

// 获取父级上下文
const context = inject(BREADCRUMB_KEY, null)

// 响应式状态
const itemId = ref<string | null>(null)
const isLastItem = ref(false)

// 计算是否为最后一项
const checkIsLast = () => {
  if (context) {
    const index = context.itemCount.value - 1
    isLastItem.value = index === context.itemCount.value - 1
  }
}

// 计算样式类名
const classes = computed(() =>
  cn(
    // 基础样式
    'flex items-center gap-2 transition-colors',
    // 可点击样式
    props.clickable && props.to
      ? 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer'
      : 'text-slate-900 dark:text-slate-100 font-medium',
    // 最后一项样式
    isLastItem.value && 'text-slate-900 dark:text-slate-100 font-medium',
    // 自定义类名
    props.class
  )
)

// 点击处理
const handleClick = (e: MouseEvent) => {
  if (!props.clickable) {
    e.preventDefault()
    return
  }

  if (props.to) {
    if (props.replace) {
      router.replace(props.to)
    } else {
      router.push(props.to)
    }
  }

  emit('click', e)
}

// 挂载时注册
onMounted(() => {
  if (context) {
    itemId.value = context.registerItem(true)
    checkIsLast()
  }
})

// 卸载时注销
onUnmounted(() => {
  if (context && itemId.value) {
    context.unregisterItem(itemId.value)
  }
})
</script>

<template>
  <li class="flex items-center gap-2">
    <!-- 路由链接 -->
    <component
      :is="to ? 'router-link' : 'span'"
      v-if="to"
      :to="to"
      :replace="replace"
      :class="classes"
      @click="handleClick"
    >
      <slot />
    </component>

    <!-- 普通文本 -->
    <component
      :is="clickable ? 'button' : 'span'"
      v-else
      :class="classes"
      :type="clickable ? 'button' : undefined"
      @click="handleClick"
    >
      <slot />
    </component>

    <!-- 分隔符插槽 -->
    <slot v-if="!isLastItem" name="separator">
      <span
        v-if="context"
        :class="cn(
          'text-slate-400 dark:text-slate-600',
          context.separatorClass.value
        )"
      >
        {{ context.separator.value }}
      </span>
    </slot>
  </li>
</template>
