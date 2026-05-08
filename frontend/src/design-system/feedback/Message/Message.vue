<script setup lang="ts">
/**
 * Message 组件
 *
 * 消息提示组件，用于显示操作反馈信息
 */

import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { MessageProps, MessageType } from './types'

// 使用 CVA 定义消息变体
const messageVariants = cva(
  // 基础样式
  'fixed left-1/2 -translate-x-1/2 min-w-[300px] max-w-[500px] px-4 py-3 rounded-2xl shadow-[0_8px_24px_-12px_rgba(0,0,0,0.15)] flex items-start gap-3 transition-all duration-300 z-5000 pointer-events-auto',
  {
    variants: {
      type: {
        success: 'bg-white/96 dark:bg-slate-800/96 backdrop-blur-sm ring-1 ring-emerald-200/50 dark:ring-emerald-800/40 text-emerald-800 dark:text-emerald-200',
        info: 'bg-white/96 dark:bg-slate-800/96 backdrop-blur-sm ring-1 ring-sky-200/50 dark:ring-sky-800/40 text-sky-800 dark:text-sky-200',
        warning: 'bg-white/96 dark:bg-slate-800/96 backdrop-blur-sm ring-1 ring-amber-200/50 dark:ring-amber-800/40 text-amber-800 dark:text-amber-200',
        error: 'bg-white/96 dark:bg-slate-800/96 backdrop-blur-sm ring-1 ring-red-200/50 dark:ring-red-800/40 text-red-800 dark:text-red-200',
      },
      center: {
        true: 'justify-center text-center',
        false: 'justify-start text-left',
      },
    },
    defaultVariants: {
      type: 'info',
      center: false,
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<MessageProps>(), {
  type: 'info',
  duration: 3000,
  showClose: false,
  center: false,
  dangerouslyUseHTMLString: false,
  offset: 20,
})

// 组件 Emits
const emit = defineEmits<{
  close: []
}>()

// 内部状态
const visible = ref(false)
const timer = ref<number | null>(null)
const currentOffset = ref(props.offset)

// 图标组件映射
const iconMap: Record<MessageType, string> = {
  success: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>',
  info: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>',
  warning: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>',
  error: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>',
}

// 计算样式类名
const classes = computed(() =>
  cn(
    messageVariants({
      type: props.type,
      center: props.center,
    }),
    props.class
  )
)

// 计算图标 HTML
const iconHtml = computed(() => iconMap[props.type])

// 计算消息内容的 top 值
const topStyle = computed(() => ({
  top: `${currentOffset.value}px`,
}))

// 监听 offset prop 变化，同步到内部状态
watch(() => props.offset, (newOffset) => {
  currentOffset.value = newOffset
})

// 计算消息内容的类名
const messageClass = computed(() => ({
  'qy-message__content': true,
  'qy-message__content--center': props.center,
}))

// 关闭消息
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
    name="qy-message"
    @after-leave="handleClose"
  >
    <div
      v-show="visible"
      :class="classes"
      :style="topStyle"
    >
      <!-- 图标 -->
      <span
        v-if="!center"
        class="qy-message__icon"
        :class="`qy-message__icon--${type}`"
        v-html="iconHtml"
      />

      <!-- 消息内容 -->
      <div :class="messageClass">
        <p
          v-if="!dangerouslyUseHTMLString"
          class="qy-message__text"
        >
          {{ message }}
        </p>
        <p
          v-else
          class="qy-message__text"
          v-html="message as string"
        />
      </div>

      <!-- 关闭按钮 -->
      <button
        v-if="showClose"
        class="qy-message__close self-center flex-shrink-0"
        @click="handleClose"
        aria-label="关闭"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.qy-message__content {
  flex: 1;
  line-height: 1.5;
  word-break: break-word;
}

.qy-message__content--center {
  text-align: center;
}

.qy-message__text {
  margin: 0;
  font-size: 0.875rem;
}

.qy-message__icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.qy-message__icon--success {
  color: #10b981;
}

.qy-message__icon--info {
  color: #0ea5e9;
}

.qy-message__icon--warning {
  color: #f59e0b;
}

.qy-message__icon--error {
  color: #ef4444;
}

.qy-message__close {
  flex-shrink: 0;
  margin-left: auto;
  padding: 0.375rem;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s, background-color 0.2s;
  color: currentColor;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
}

.qy-message__close:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.1);
}

/* Transition 动画 */
.qy-message-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.qy-message-leave-active {
  transition: all 0.25s ease-in;
}

.qy-message-enter-from {
  opacity: 0;
  transform: translate(-50%, -24px) scale(0.96);
}

.qy-message-leave-to {
  opacity: 0;
  transform: translate(-50%, -16px) scale(0.96);
}
</style>
