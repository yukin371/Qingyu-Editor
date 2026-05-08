<script setup lang="ts">
/**
 * Alert 组件
 *
 * 用于显示页面中的警告、成功、错误和消息提示的反馈组件
 */

import { computed, ref } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { AlertProps } from './types'

// 使用 CVA 定义 Alert 变体
const alertVariants = cva(
  // 基础样式
  'relative w-full rounded-lg border p-4 transition-all duration-300',
  {
    variants: {
      type: {
        success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300',
        info: 'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950 dark:border-sky-800 dark:text-sky-300',
        warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300',
        error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-300',
      },
      center: {
        true: 'text-center',
        false: 'text-left',
      },
    },
    defaultVariants: {
      type: 'info',
      center: false,
    },
  }
)

// 图标 SVG 数据
const icons: Record<string, string> = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" /></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" /></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5"><path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.198 0 8.357 14.466 8.357 14.466 8.357 14.466.45.777-.113 1.752-.932 1.752H1.174c-.82 0-1.383-.975-.932-1.752 0 0 8.357-14.466 8.357-14.466ZM12 9.75a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Zm0 9.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" /></svg>`,
  error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 0 0-1.06-1.06L12 10.94l-1.72-1.72Z" clip-rule="evenodd" /></svg>`,
}

// 组件 Props
const props = withDefaults(defineProps<AlertProps>(), {
  type: 'info',
  closable: false,
  showIcon: true,
  center: false,
  effect: 'light',
})

// 组件 Emits
const emit = defineEmits<{
  close: []
  afterClose: []
}>()

// 状态
const visible = ref(true)
const closing = ref(false)

// 计算样式类名
const classes = computed(() =>
  cn(
    alertVariants({
      type: props.type,
      center: props.center,
    }),
    props.class,
    closing.value ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
  )
)

// 计算图标样式
const iconClasses = computed(() =>
  cn(
    'flex-shrink-0',
    props.center ? 'mb-2' : 'mr-3'
  )
)

// 关闭处理
const handleClose = () => {
  closing.value = true
  emit('close')

  // 等待动画结束后隐藏
  setTimeout(() => {
    visible.value = false
    emit('afterClose')
  }, 300)
}

// 动画结束后清理
const handleTransitionEnd = () => {
  if (closing.value) {
    visible.value = false
    emit('afterClose')
  }
}
</script>

<template>
  <Transition
    name="alert"
    @after-leave="handleTransitionEnd"
  >
    <div
      v-if="visible"
      :class="classes"
      role="alert"
      :aria-live="type === 'error' || type === 'warning' ? 'assertive' : 'polite'"
    >
      <!-- 图标 -->
      <div
        v-if="showIcon"
        :class="iconClasses"
        v-html="icons[type || 'info']"
      />

      <!-- 内容区域 -->
      <div :class="cn('flex-1 flex flex-col', center ? 'items-center text-center' : 'items-start text-left')">
        <!-- 标题 -->
        <div
          v-if="title || $slots.title"
          class="font-semibold mb-1"
        >
          <slot name="title">
            {{ title }}
          </slot>
        </div>

        <!-- 描述内容 -->
        <div
          v-if="description || $slots.default"
          class="text-sm"
        >
          <slot>
            {{ description }}
          </slot>
        </div>
      </div>

      <!-- 关闭按钮 -->
      <button
        v-if="closable"
        type="button"
        :class="cn(
          'flex-shrink-0 ml-3 rounded-md p-1.5 hover:bg-black/10',
          'focus:outline-none focus:shadow-[0_0_0_3px_rgba(100,116,139,0.16)]',
          'transition-colors duration-200',
          'dark:hover:bg-white/10'
        )"
        :aria-label="'关闭警告'"
        @click="handleClose"
      >
        <svg
          class="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
/* Alert 过渡动画 */
.alert-enter-active,
.alert-leave-active {
  transition: all 0.3s ease;
}

.alert-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.alert-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.alert-enter-to,
.alert-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
