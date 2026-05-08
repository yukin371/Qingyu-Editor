<script setup lang="ts">
/**
 * BackTop 返回顶部组件
 *
 * 当页面滚动到一定高度时显示的返回顶部按钮
 * 支持自定义样式、动画时长、缓动函数等
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { BackTopProps, BackTopEmits, EasingFunction } from './types'
import { easings } from './types'

// 使用 CVA 定义按钮变体
const backtopVariants = cva(
  // 基础样式
  'fixed z-50 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer',
  {
    variants: {
      shape: {
        circle: 'rounded-full',
        square: 'rounded-lg',
      },
      size: {
        small: 'w-10 h-10',
        medium: 'w-12 h-12',
        large: 'w-14 h-14',
      },
      position: {
        'top-right': 'top-8 right-8',
        'top-left': 'top-8 left-8',
        'bottom-right': 'bottom-8 right-8',
        'bottom-left': 'bottom-8 left-8',
      },
    },
    defaultVariants: {
      shape: 'circle',
      size: 'medium',
      position: 'bottom-right',
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<BackTopProps>(), {
  visibilityHeight: 400,
  backPosition: 0,
  duration: 300,
  easing: 'ease-in-out',
  shape: 'circle',
  size: 'medium',
  position: 'bottom-right',
  showProgress: false,
  smooth: true,
  autoHide: false,
})

// 组件 Emits
const emit = defineEmits<BackTopEmits>()

// 内部状态
const visible = ref(false)
const scrollTop = ref(0)
const backTopRef = ref<HTMLElement | null>(null)

// 获取滚动容器
const getScrollTarget = (): HTMLElement | Window => {
  if (typeof props.target === 'function') {
    return props.target()
  }
  if (typeof props.target === 'string') {
    const el = document.querySelector(props.target)
    if (el) {
      return el as HTMLElement
    }
  }
  return window
}

// 获取当前滚动位置
const getCurrentScrollTop = (): number => {
  const target = getScrollTarget()
  if (target === window) {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
  }
  return (target as HTMLElement).scrollTop
}

// 计算样式类名
const classes = computed(() =>
  cn(
    backtopVariants({
      shape: props.shape,
      size: props.size,
      position: props.position,
    }),
    'bg-white/90 backdrop-blur-md hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/60',
    {
      'opacity-0 translate-y-4 pointer-events-none': !visible.value,
      'opacity-100 translate-y-0': visible.value,
    },
    props.class
  )
)

// 计算滚动进度
const scrollProgress = computed(() => {
  const target = getScrollTarget()
  let maxScroll = 0
  
  if (target === window) {
    maxScroll = document.documentElement.scrollHeight - window.innerHeight
  } else {
    const el = target as HTMLElement
    maxScroll = el.scrollHeight - el.clientHeight
  }
  
  if (maxScroll <= 0) return 100
  return Math.min(100, Math.round((scrollTop.value / maxScroll) * 100))
})

// 获取缓动函数
const getEasingFunction = (): EasingFunction => {
  if (typeof props.easing === 'function') {
    return props.easing
  }
  return easings[props.easing] || easings['ease-in-out']
}

// 滚动处理函数
const handleScroll = () => {
  const currentScrollTop = getCurrentScrollTop()
  scrollTop.value = currentScrollTop
  
  const shouldShow = currentScrollTop >= props.visibilityHeight
  
  if (shouldShow && !visible.value) {
    visible.value = true
    emit('show')
  } else if (!shouldShow && visible.value && !props.autoHide) {
    visible.value = false
    emit('hide')
  }
}

// 返回顶部
const scrollToTop = () => {
  emit('click', new MouseEvent('click'))
  
  const target = getScrollTarget()
  const startPosition = getCurrentScrollTop()
  const distance = props.backPosition - startPosition
  const duration = props.duration
  const easing = getEasingFunction()
  
  // 如果距离很小，直接滚动
  if (Math.abs(distance) < 10) {
    if (target === window) {
      window.scrollTo(0, props.backPosition)
    } else {
      (target as HTMLElement).scrollTop = props.backPosition
    }
    if (props.autoHide) {
      visible.value = false
      emit('hide')
    }
    return
  }
  
  // 如果禁用平滑滚动，直接跳转
  if (!props.smooth) {
    if (target === window) {
      window.scrollTo(0, props.backPosition)
    } else {
      (target as HTMLElement).scrollTop = props.backPosition
    }
    if (props.autoHide) {
      visible.value = false
      emit('hide')
    }
    return
  }
  
  // 平滑滚动
  let startTime: number | null = null
  
  const animation = (currentTime: number) => {
    if (startTime === null) {
      startTime = currentTime
    }
    
    const timeElapsed = currentTime - startTime
    const progress = Math.min(timeElapsed / duration, 1)
    const easedProgress = easing(progress)
    
    const newPosition = startPosition + distance * easedProgress
    
    if (target === window) {
      window.scrollTo(0, newPosition)
    } else {
      (target as HTMLElement).scrollTop = newPosition
    }
    
    if (progress < 1) {
      requestAnimationFrame(animation)
    } else {
      if (props.autoHide) {
        visible.value = false
        emit('hide')
      }
    }
  }
  
  requestAnimationFrame(animation)
}

// 滚动到指定元素
const scrollToElement = () => {
  if (!props.targetElement) return
  
  const targetElement = document.getElementById(props.targetElement)
  if (!targetElement) {
    console.warn(`BackTop: 目标元素 #${props.targetElement} 未找到`)
    return
  }
  
  emit('click', new MouseEvent('click'))
  
  const targetRect = targetElement.getBoundingClientRect()
  const absoluteTop = targetRect.top + window.pageYOffset
  
  const target = getScrollTarget()
  const startPosition = getCurrentScrollTop()
  const distance = absoluteTop - props.backPosition - startPosition
  const duration = props.duration
  const easing = getEasingFunction()
  
  if (Math.abs(distance) < 10) {
    if (target === window) {
      window.scrollTo(0, absoluteTop - props.backPosition)
    }
    return
  }
  
  if (!props.smooth) {
    if (target === window) {
      window.scrollTo(0, absoluteTop - props.backPosition)
    }
    return
  }
  
  let startTime: number | null = null
  
  const animation = (currentTime: number) => {
    if (startTime === null) {
      startTime = currentTime
    }
    
    const timeElapsed = currentTime - startTime
    const progress = Math.min(timeElapsed / duration, 1)
    const easedProgress = easing(progress)
    
    const newPosition = startPosition + distance * easedProgress
    
    if (target === window) {
      window.scrollTo(0, newPosition)
    }
    
    if (progress < 1) {
      requestAnimationFrame(animation)
    }
  }
  
  requestAnimationFrame(animation)
}

// 点击处理
const handleClick = (e: MouseEvent | KeyboardEvent) => {
  e.preventDefault()
  if (props.targetElement) {
    scrollToElement()
  } else {
    scrollToTop()
  }
}

// 组件挂载时添加滚动监听
onMounted(() => {
  const target = getScrollTarget()
  target.addEventListener('scroll', handleScroll, { passive: true } as AddEventListenerOptions)
  
  // 初始化滚动位置
  scrollTop.value = getCurrentScrollTop()
  handleScroll()
})

// 组件卸载时移除滚动监听
onUnmounted(() => {
  const target = getScrollTarget()
  target.removeEventListener('scroll', handleScroll)
})

// 监听 target 变化
watch(() => props.target, () => {
  // 重新绑定滚动监听
  const oldTarget = getScrollTarget()
  oldTarget.removeEventListener('scroll', handleScroll)
  
  handleScroll()
  const newTarget = getScrollTarget()
  newTarget.addEventListener('scroll', handleScroll, { passive: true } as AddEventListenerOptions)
})

// 暴露方法给父组件
defineExpose({
  scrollToTop,
  scrollToElement,
  visible,
})
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-8"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-8"
  >
    <div
      v-if="visible"
      :ref="(el: any) => backTopRef = el"
      :class="classes"
      :style="style"
      @click="handleClick"
      role="button"
      tabindex="0"
      aria-label="返回顶部"
      @keydown.enter.prevent="handleClick"
      @keydown.space.prevent="handleClick"
    >
      <!-- 自定义图标插槽 -->
      <slot name="icon">
        <!-- 默认向上箭头图标 -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          :class="{
            'w-4 h-4': size === 'small',
            'w-5 h-5': size === 'medium',
            'w-6 h-6': size === 'large',
          }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </slot>

      <!-- 显示进度百分比 -->
      <span
        v-if="showProgress"
        :class="{
          'text-xs': size === 'small',
          'text-sm': size === 'medium',
          'text-base': size === 'large',
        }"
        class="absolute font-semibold"
      >
        {{ scrollProgress }}%
      </span>

      <!-- 自定义内容插槽 -->
      <slot />
    </div>
  </Transition>
</template>

<style scoped>
/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .bg-primary-500 {
    background-color: rgb(59 130 246);
  }
  
  .hover\:bg-primary-600:hover {
    background-color: rgb(37 99 235);
  }
}
</style>
