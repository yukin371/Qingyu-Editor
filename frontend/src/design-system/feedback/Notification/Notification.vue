<script setup lang="ts">
/**
 * Notification 组件
 *
 * 通知提醒组件，用于显示全局通知消息
 */

import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { NotificationProps, NotificationType } from './types'

// 使用 CVA 定义通知变体
const notificationVariants = cva(
  // 基础样式
  'w-[320px] max-w-[calc(100vw-32px)] p-4 rounded-xl flex items-start gap-3 transition-all duration-300 pointer-events-auto relative overflow-hidden',
  {
    variants: {
      type: {
        success: 'bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm ring-1 ring-emerald-200/60 dark:ring-emerald-700/40 shadow-[0_8px_30px_-12px_rgba(5,150,105,0.18)]',
        info: 'bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm ring-1 ring-sky-200/60 dark:ring-sky-700/40 shadow-[0_8px_30px_-12px_rgba(14,165,233,0.18)]',
        warning: 'bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm ring-1 ring-amber-200/60 dark:ring-amber-700/40 shadow-[0_8px_30px_-12px_rgba(245,158,11,0.18)]',
        error: 'bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm ring-1 ring-red-200/60 dark:ring-red-700/40 shadow-[0_8px_30px_-12px_rgba(239,68,68,0.18)]',
      },
    },
    defaultVariants: {
      type: 'info',
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<NotificationProps>(), {
  type: 'info',
  duration: 4500,
  position: 'top-right',
  showClose: true,
  dangerouslyUseHTMLString: false,
})

// 组件 Emits
const emit = defineEmits<{
  close: []
  click: []
}>()

// 内部状态
const visible = ref(false)
const timer = ref<number | null>(null)

// 图标组件映射
const iconMap: Record<NotificationType, string> = {
  success: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>',
  info: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>',
  warning: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>',
  error: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>',
}

// 图标颜色映射
const iconColorMap: Record<NotificationType, string> = {
  success: 'text-emerald-500 dark:text-emerald-400',
  info: 'text-sky-500 dark:text-sky-400',
  warning: 'text-amber-500 dark:text-amber-400',
  error: 'text-red-500 dark:text-red-400',
}

// 标题颜色映射
const titleColorMap: Record<NotificationType, string> = {
  success: 'text-emerald-900 dark:text-emerald-100',
  info: 'text-sky-900 dark:text-sky-100',
  warning: 'text-amber-900 dark:text-amber-100',
  error: 'text-red-900 dark:text-red-100',
}

// 计算样式类名
const classes = computed(() =>
  cn(
    notificationVariants({
      type: props.type,
    }),
    props.class
  )
)

// 计算图标 HTML
const iconHtml = computed(() => props.customIcon || iconMap[props.type])

// 计算图标类名
const iconClass = computed(() => iconColorMap[props.type])

// 计算标题类名
const titleClass = computed(() => titleColorMap[props.type])

// 计算消息类名
const messageClass = computed(() => {
  const colors: Record<NotificationType, string> = {
    success: 'text-emerald-700 dark:text-emerald-300',
    info: 'text-sky-700 dark:text-sky-300',
    warning: 'text-amber-700 dark:text-amber-300',
    error: 'text-red-700 dark:text-red-300',
  }
  return colors[props.type]
})

// 进度条颜色映射
const progressColorMap: Record<NotificationType, string> = {
  success: '#10b981',
  info: '#0ea5e9',
  warning: '#f59e0b',
  error: '#ef4444',
}

// 计算进度条颜色
const progressColor = computed(() => progressColorMap[props.type])

// 关闭通知
const close = () => {
  visible.value = false
  if (timer.value) {
    clearTimeout(timer.value)
    timer.value = null
  }
}

// 处理关闭按钮点击
const handleClose = () => {
  close()
  emit('close')
}

// 处理通知点击
const handleClick = () => {
  emit('click')
  if (props.onClick) {
    props.onClick()
  }
}

// 启动自动关闭定时器
const startTimer = () => {
  if (props.duration > 0) {
    timer.value = window.setTimeout(() => {
      close()
    }, props.duration)
  }
}

// 清除定时器
const clearTimer = () => {
  if (timer.value) {
    clearTimeout(timer.value)
    timer.value = null
  }
}

// 组件挂载时
onMounted(async () => {
  await nextTick()
  visible.value = true
  startTimer()
})

// 组件卸载时清除定时器
onUnmounted(() => {
  clearTimer()
})

// 监听 duration 变化
watch(() => props.duration, () => {
  clearTimer()
  startTimer()
})

// 监听 visible 变化，触发关闭事件
watch(visible, (val) => {
  if (!val) {
    emit('close')
  }
})
</script>

<template>
  <Transition
    name="qy-notification"
    @after-leave="handleClose"
  >
    <div
      v-show="visible"
      :class="classes"
      role="alert"
      @click="handleClick"
    >
      <!-- 图标 -->
      <div
        v-if="!customIcon"
        :class="iconClass"
        v-html="iconHtml"
      />
      <div
        v-else
        :class="iconClass"
        v-html="iconHtml"
      />

      <!-- 内容区域 -->
      <div class="flex-1 min-w-0">
        <!-- 标题 -->
        <h4
          v-if="title"
          :class="['font-semibold text-sm mb-1 truncate', titleClass]"
        >
          {{ title }}
        </h4>

        <!-- 消息内容 -->
        <p
          v-if="!dangerouslyUseHTMLString"
          :class="['text-sm leading-relaxed break-words', messageClass]"
        >
          {{ message }}
        </p>
        <p
          v-else
          :class="['text-sm leading-relaxed break-words', messageClass]"
          v-html="message as string"
        />
      </div>

      <!-- 关闭按钮 -->
      <button
        v-if="showClose"
        class="qy-notification__close flex-shrink-0 p-1.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-600/60 transition-colors"
        @click.stop="handleClose"
        aria-label="关闭"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- 自动关闭进度条 -->
      <div
        v-if="duration > 0"
        class="absolute bottom-0 left-0 h-0.5 rounded-full transition-transform origin-left"
        :style="{
          width: '100%',
          backgroundColor: progressColor,
          animation: `notif-progress ${duration}ms linear forwards`
        }"
      />
    </div>
  </Transition>
</template>

<style scoped>
.qy-notification__close {
  opacity: 0.5;
  color: currentColor;
  transition: opacity 0.2s, background-color 0.2s;
}

.qy-notification__close:hover {
  opacity: 1;
}

/* Transition 动画 */
.qy-notification-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.qy-notification-leave-active {
  transition: all 0.25s ease-in;
}

.qy-notification-enter-from {
  opacity: 0;
  transform: translateX(110%) scale(0.96);
}

.qy-notification-leave-to {
  opacity: 0;
  transform: translateX(110%) scale(0.96);
}

/* 自动关闭进度条动画 */
@keyframes notif-progress {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}
</style>
