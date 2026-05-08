<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
/**
 * Carousel 组件
 *
 * 轮播图组件，支持自动播放、方向控制、指示器、箭头等功能
 */

import { computed, provide, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { CarouselProps, CarouselEmits } from './types'
import { carouselDefaults } from './types'

// 使用 CVA 定义指示器变体
const indicatorVariants = cva(
  'inline-block w-2 h-2 rounded-full cursor-pointer transition-all duration-300',
  {
    variants: {
      active: {
        true: 'bg-primary-500 w-8',
        false: 'bg-slate-300 hover:bg-slate-400',
      },
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<CarouselProps>(), carouselDefaults)

// 组件 Emits
const emit = defineEmits<CarouselEmits>()

// 当前激活的索引
const activeIndex = ref(props.initialIndex)

// 子项名称列表
const itemNames = ref<(string | number)[]>([])

// 自动播放定时器
let autoplayTimer: ReturnType<typeof setTimeout> | null = null

// 是否暂停（鼠标悬停时）
const isPaused = ref(false)

// 注册子项
const registerItem = (name: string | number) => {
  if (!itemNames.value.includes(name)) {
    itemNames.value.push(name)
  }
}

// 注销子项
const unregisterItem = (name: string | number) => {
  const index = itemNames.value.indexOf(name)
  if (index > -1) {
    itemNames.value.splice(index, 1)
  }
}

// 提供上下文给子组件
provide('carouselContext', {
  activeIndex,
  itemNames,
  registerItem,
  unregisterItem,
})

// 切换到指定索引
const goTo = (index: number) => {
  const itemCount = itemNames.value.length
  if (itemCount === 0) return

  let newIndex = index

  // 处理循环播放
  if (props.loop) {
    if (newIndex < 0) {
      newIndex = itemCount - 1
    } else if (newIndex >= itemCount) {
      newIndex = 0
    }
  } else {
    // 非循环模式，限制范围
    newIndex = Math.max(0, Math.min(itemCount - 1, newIndex))
  }

  if (newIndex !== activeIndex.value) {
    const prevIndex = activeIndex.value
    activeIndex.value = newIndex
    emit('change', newIndex, prevIndex)
  }
}

// 上一张
const prev = () => {
  goTo(activeIndex.value - 1)
}

// 下一张
const next = () => {
  goTo(activeIndex.value + 1)
}

// 处理指示器点击
const handleIndicatorClick = (index: number) => {
  goTo(index)
}

// 处理指示器悬停
let hoverTimer: ReturnType<typeof setTimeout> | null = null
const handleIndicatorHover = (index: number) => {
  if (props.trigger === 'hover') {
    if (hoverTimer) {
      clearTimeout(hoverTimer)
    }
    hoverTimer = setTimeout(() => {
      goTo(index)
    }, 150)
  }
}

// 启动自动播放
const startAutoplay = () => {
  if (!props.autoplay || isPaused.value) return

  if (autoplayTimer) {
    clearInterval(autoplayTimer)
  }

  autoplayTimer = setInterval(() => {
    next()
  }, props.interval)
}

// 停止自动播放
const stopAutoplay = () => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

// 处理鼠标悬停
const handleMouseEnter = () => {
  if (props.pauseOnHover) {
    isPaused.value = true
    stopAutoplay()
  }
}

const handleMouseLeave = () => {
  if (props.pauseOnHover) {
    isPaused.value = false
    startAutoplay()
  }
}

// 监听 props 变化
watch(() => props.autoplay, (val) => {
  if (val) {
    startAutoplay()
  } else {
    stopAutoplay()
  }
})

watch(() => props.interval, () => {
  if (props.autoplay) {
    stopAutoplay()
    startAutoplay()
  }
})

// 组件挂载后启动自动播放
onMounted(() => {
  nextTick(() => {
    if (props.autoplay) {
      startAutoplay()
    }
  })
})

// 组件卸载时清理定时器
onUnmounted(() => {
  stopAutoplay()
  if (hoverTimer) {
    clearTimeout(hoverTimer)
  }
})

// 计算箭头显示
const showArrows = computed(() => {
  return props.arrow !== 'never' && itemNames.value.length > 1
})

// 计算箭头可见性
const arrowsVisible = computed(() => {
  return props.arrow === 'always' || (props.arrow === 'hover' && isHovered.value)
})

const isHovered = ref(false)

// 计算指示器显示
const showIndicators = computed(() => {
  return props.indicatorPosition !== 'none' && itemNames.value.length > 1
})

// 计算容器类名
const containerClasses = computed(() => {
  const classes = [
    'carousel',
    'relative',
    'overflow-hidden',
    'bg-slate-50',
  ]

  if (props.direction === 'vertical') {
    classes.push('flex-col')
  } else {
    classes.push('flex-row')
  }

  return cn(classes)
})

// 计算指示器容器类名
const indicatorContainerClasses = computed(() => {
  const baseClasses = [
    'flex',
    'gap-2',
    'transition-all',
    'duration-300',
  ]

  if (props.indicatorPosition === 'outside') {
    if (props.direction === 'vertical') {
      return cn(baseClasses, 'absolute', 'right-4', 'top-1/2', '-translate-y-1/2', 'flex-col')
    } else {
      return cn(baseClasses, 'absolute', 'bottom-[-40px]', 'left-1/2', '-translate-x-1/2')
    }
  } else {
    // inside
    if (props.direction === 'vertical') {
      return cn(baseClasses, 'absolute', 'right-4', 'top-1/2', '-translate-y-1/2', 'flex-col')
    } else {
      return cn(baseClasses, 'absolute', 'bottom-4', 'left-1/2', '-translate-x-1/2', 'z-20')
    }
  }
})

// 计算箭头容器类名
const arrowButtonClasses = 'absolute top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow-md transition-all duration-300 z-20 cursor-pointer'

const prevArrowClasses = computed(() => {
  return cn(arrowButtonClasses, 'left-4')
})

const nextArrowClasses = computed(() => {
  return cn(arrowButtonClasses, 'right-4')
})
</script>

<template>
  <div
    ref="containerRef"
    :class="containerClasses"
    :style="{ height: props.height }"
    @mouseenter="handleMouseEnter(); isHovered = true"
    @mouseleave="handleMouseLeave(); isHovered = false"
  >
    <!-- 轮播内容 -->
    <div class="carousel-items relative w-full h-full">
      <slot />
    </div>

    <!-- 箭头 -->
    <template v-if="showArrows">
      <div
        v-if="arrowsVisible || arrow === 'always'"
        :class="prevArrowClasses"
        @click="prev"
      >
        <slot name="prev">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </slot>
      </div>

      <div
        v-if="arrowsVisible || arrow === 'always'"
        :class="nextArrowClasses"
        @click="next"
      >
        <slot name="next">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </slot>
      </div>
    </template>

    <!-- 指示器 -->
    <div
      v-if="showIndicators"
      :class="indicatorContainerClasses"
    >
      <button
        v-for="(name, index) in itemNames"
        :key="name"
        :class="indicatorVariants({ active: index === activeIndex })"
        :aria-label="`Slide ${index + 1}`"
        @click="handleIndicatorClick(index)"
        @mouseenter="handleIndicatorHover(index)"
      />
    </div>

    <!-- 自定义插槽 -->
    <slot name="default" />
  </div>
</template>

<style scoped>
.carousel {
  user-select: none;
}

.carousel-items {
  display: flex;
  align-items: stretch;
}

.carousel-items:deep(.carousel-item) {
  flex-shrink: 0;
  width: 100%;
  height: 100%;
}
</style>
