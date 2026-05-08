<script setup lang="ts">
/**
 * Popover 气泡卡片组件
 *
 * 点击或悬停在元素上时，显示弹出气泡卡片
 */

import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { cn } from '../../utils/cn'
import type { PopoverProps, PopoverEmits } from './types'

// 组件 Props
const props = withDefaults(defineProps<PopoverProps>(), {
  trigger: 'click',
  placement: 'bottom',
  disabled: false,
  offset: 0,
  showArrow: true,
  openDelay: 0,
  closeDelay: 200,
  closeOnClickOutside: true,
})

// 组件 Emits
const emit = defineEmits<PopoverEmits>()

// 模板引用
const triggerRef = ref<HTMLElement>()
const popoverRef = ref<HTMLElement>()

// 状态
const isVisible = ref(false)
const isTransitioning = ref(false)
const internalVisible = ref(false)
let openTimer: number | null = null
let closeTimer: number | null = null

// 计算触发元素样式类名
const triggerClasses = computed(() =>
  cn(
    'inline-block',
    props.disabled && 'cursor-not-allowed opacity-50'
  )
)

// 计算弹出框位置样式
const popoverStyle = computed(() => {
  const style: Record<string, any> = {
    ...props.popperStyle,
  }

  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }

  return style
})

// 计算弹出框样式类名
const popoverClasses = computed(() =>
  cn(
    'qy-popover',
    'absolute z-50',
    'bg-white/96 dark:bg-slate-800/96 backdrop-blur-sm',
    'border border-slate-200/70 dark:border-slate-700/50',
    'rounded-2xl',
    'shadow-[0_16px_48px_-20px_rgba(15,23,42,0.22)]',
    'p-4',
    'transition-all duration-250 ease-out',
    'origin-center',
    props.popperClass,
    isTransitioning.value ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
  )
)

// 计算箭头样式类名
const arrowClasses = computed(() => {
  const placement = props.placement || 'bottom'
  const baseClasses = 'absolute w-2.5 h-2.5 bg-white/96 dark:bg-slate-800/96 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/50 rotate-45'

  // 根据位置调整箭头方向
  const positionClasses: Record<string, string> = {
    'top': '-bottom-1 left-1/2 -translate-x-1/2 border-b-0 border-r-0',
    'top-start': '-bottom-1 left-3 border-b-0 border-r-0',
    'top-end': '-bottom-1 right-3 border-b-0 border-r-0',
    'bottom': '-top-1 left-1/2 -translate-x-1/2 border-t-0 border-l-0',
    'bottom-start': '-top-1 left-3 border-t-0 border-l-0',
    'bottom-end': '-top-1 right-3 border-t-0 border-l-0',
    'left': '-right-1 top-1/2 -translate-y-1/2 border-t-0 border-r-0',
    'left-start': '-right-1 top-3 border-t-0 border-r-0',
    'left-end': '-right-1 bottom-3 border-t-0 border-r-0',
    'right': '-left-1 top-1/2 -translate-y-1/2 border-b-0 border-l-0',
    'right-start': '-left-1 top-3 border-b-0 border-l-0',
    'right-end': '-left-1 bottom-3 border-b-0 border-l-0',
  }

  return cn(baseClasses, positionClasses[placement] || positionClasses['bottom'])
})

// 显示弹出框
const show = () => {
  if (props.disabled) return

  // 清除之前的定时器
  if (openTimer) {
    window.clearTimeout(openTimer)
    openTimer = null
  }
  if (closeTimer) {
    window.clearTimeout(closeTimer)
    closeTimer = null
  }

  const delay = props.trigger === 'hover' ? props.openDelay : 0

  openTimer = window.setTimeout(() => {
    emit('beforeEnter')
    isTransitioning.value = true
    internalVisible.value = true

    nextTick(() => {
      isVisible.value = true
      emit('update:visible', true)

      setTimeout(() => {
        isTransitioning.value = false
        emit('afterEnter')
      }, 10)
    })
  }, delay)
}

// 隐藏弹出框
const hide = () => {
  if (props.disabled) return

  // 清除之前的定时器
  if (openTimer) {
    window.clearTimeout(openTimer)
    openTimer = null
  }
  if (closeTimer) {
    window.clearTimeout(closeTimer)
    closeTimer = null
  }

  const delay = props.trigger === 'hover' ? props.closeDelay : 0

  closeTimer = window.setTimeout(() => {
    emit('beforeLeave')
    isTransitioning.value = true

    setTimeout(() => {
      isVisible.value = false
      internalVisible.value = false
      emit('update:visible', false)
      emit('afterLeave')
    }, 200)
  }, delay)
}

// 切换显示状态
const toggle = () => {
  if (isVisible.value) {
    hide()
  } else {
    show()
  }
}

// 处理鼠标进入
const handleMouseEnter = () => {
  if (props.trigger === 'hover') {
    show()
  }
}

// 处理鼠标离开
const handleMouseLeave = () => {
  if (props.trigger === 'hover') {
    hide()
  }
}

// 处理焦点获得
const handleFocus = () => {
  if (props.trigger === 'focus') {
    show()
  }
}

// 处理焦点失去
const handleBlur = () => {
  if (props.trigger === 'focus') {
    hide()
  }
}

// 处理点击
const handleClick = () => {
  if (props.trigger === 'click') {
    toggle()
  }
}

// 处理点击外部
const handleClickOutside = (event: MouseEvent) => {
  if (!props.closeOnClickOutside) return

  const target = event.target as Node
  if (
    triggerRef.value?.contains(target) ||
    popoverRef.value?.contains(target)
  ) {
    return
  }

  if (isVisible.value && props.trigger === 'click') {
    hide()
  }
}

// 监听 visible prop 变化（仅用于 manual 模式）
watch(
  () => props.visible,
  (newVal) => {
    if (props.trigger === 'manual') {
      if (newVal) {
        show()
      } else {
        hide()
      }
    }
  }
)

// 生命周期
onMounted(() => {
  if (props.trigger === 'click' || props.trigger === 'focus') {
    document.addEventListener('click', handleClickOutside)
  }
})

onUnmounted(() => {
  if (openTimer) {
    window.clearTimeout(openTimer)
  }
  if (closeTimer) {
    window.clearTimeout(closeTimer)
  }
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="qy-popover-wrapper relative inline-block">
    <!-- 触发元素 -->
    <component
      :is="$slots.default ? 'div' : 'button'"
      ref="triggerRef"
      :class="triggerClasses"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @focus="handleFocus"
      @blur="handleBlur"
      @click="handleClick"
    >
      <slot />
    </component>

    <!-- Teleport 容器 -->
    <Teleport to="body">
      <Transition>
        <div
          v-if="isVisible"
          ref="popoverRef"
          :class="popoverClasses"
          :style="popoverStyle"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
          role="tooltip"
          :aria-hidden="!isVisible"
        >
          <!-- 箭头 -->
          <div v-if="showArrow" :class="arrowClasses" />

          <!-- 内容 -->
          <div class="qy-popover__content relative z-10">
            <slot name="content">
              {{ content }}
            </slot>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Popover 过渡动画 */
.v-enter-active {
  transition: all 0.22s cubic-bezier(0.34, 1.2, 0.64, 1);
}
.v-leave-active {
  transition: all 0.18s ease-in;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: scale(0.94);
}
.v-enter-to,
.v-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
