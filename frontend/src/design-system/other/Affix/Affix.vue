<script setup lang="ts">
/**
 * Affix 固钉组件
 *
 * 将元素固定在页面特定位置，常用于导航栏、操作按钮等需要固定显示的场景
 * 支持自定义偏移量、固定位置、层级和滚动容器
 */

import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { cn } from '../../utils/cn'
import type { AffixProps, AffixEmits, AffixState } from './types'

// 组件 Props
const props = withDefaults(defineProps<AffixProps>(), {
  offset: 0,
  position: 'top',
  zIndex: 10,
})

// 组件 Emits
const emit = defineEmits<AffixEmits>()

// 内部状态
const affixRef = ref<HTMLElement | null>(null)
const state = ref<AffixState>({
  isFixed: false,
  containerHeight: 0,
  containerWidth: 0,
  originalPosition: {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  },
})

// 获取滚动容器
const getScrollTarget = (): HTMLElement | Window => {
  if (typeof props.target === 'function') {
    const resolved = props.target()
    if (resolved && typeof (resolved as EventTarget).addEventListener === 'function') {
      return resolved
    }
    return window
  }
  if (typeof props.target === 'string') {
    const el = document.querySelector(props.target)
    if (el) {
      return el as HTMLElement
    }
  }
  return window
}

// 获取容器的滚动位置
const getContainerScrollTop = (): number => {
  const target = getScrollTarget()
  if (target === window) {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
  }
  return (target as HTMLElement | null)?.scrollTop || 0
}

// 计算样式类名
const classes = computed(() =>
  cn(
    'transition-all duration-200',
    {
      fixed: state.value.isFixed,
    },
    props.class,
  ),
)

// 计算固定样式
const fixedStyle = computed(() => {
  if (!state.value.isFixed) {
    return {}
  }

  const style: Record<string, string> = {
    position: 'fixed',
    zIndex: String(props.zIndex),
  }

  if (props.position === 'top') {
    style.top = `${props.offset}px`
  } else {
    style.bottom = `${props.offset}px`
  }

  // 保持原始宽度
  if (state.value.containerWidth > 0) {
    style.width = `${state.value.containerWidth}px`
  }

  return style
})

// 检查是否应该固定
const checkFixed = () => {
  if (!affixRef.value) return

  const target = getScrollTarget()
  const scrollTop = getContainerScrollTop()

  // 获取元素位置信息
  const rect = affixRef.value.getBoundingClientRect()
  const targetRect =
    target === window
      ? { top: 0, left: 0 }
      : (target as HTMLElement | null)?.getBoundingClientRect() || { top: 0, left: 0 }

  // 计算元素相对于滚动容器的位置
  const elementTop = rect.top - targetRect.top + scrollTop
  const shouldFixed =
    props.position === 'top'
      ? scrollTop >= elementTop - props.offset
      : scrollTop <= elementTop + rect.height - (window.innerHeight - props.offset)

  // 更新固定状态
  if (shouldFixed !== state.value.isFixed) {
    state.value.isFixed = shouldFixed
    emit('change', shouldFixed)

    // 更新尺寸信息
    if (shouldFixed) {
      state.value.containerWidth = rect.width
      state.value.containerHeight = rect.height
    }
  }
}

// 滚动处理函数
const handleScroll = (event: Event) => {
  checkFixed()
  emit('scroll', event)
}

// 窗口大小改变处理
const handleResize = () => {
  if (!affixRef.value) return

  // 重新计算尺寸
  const rect = affixRef.value.getBoundingClientRect()
  if (state.value.isFixed) {
    state.value.containerWidth = rect.width
  }
}

// 组件挂载时添加监听
onMounted(() => {
  // 添加滚动监听
  const target = getScrollTarget()
  target.addEventListener('scroll', handleScroll, { passive: true } as AddEventListenerOptions)
  window.addEventListener('resize', handleResize)

  // 在下一个tick中初始化
  nextTick(() => {
    if (!affixRef.value) return

    // 保存原始位置信息
    const rect = affixRef.value.getBoundingClientRect()
    state.value.originalPosition = {
      top: rect.top + window.pageYOffset,
      left: rect.left + window.pageXOffset,
      width: rect.width,
      height: rect.height,
    }

    // 初始化检查
    checkFixed()
  })
})

// 组件卸载时移除监听
onUnmounted(() => {
  try {
    const target = getScrollTarget()
    if (target && target.removeEventListener) {
      target.removeEventListener('scroll', handleScroll, {
        passive: true,
      } as AddEventListenerOptions)
    }
  } catch (error) {
    // Ignore errors during cleanup
  }
  try {
    window.removeEventListener('resize', handleResize)
  } catch (error) {
    // Ignore errors during cleanup
  }
})

// 监听 offset 变化
watch(
  () => props.offset,
  () => {
    checkFixed()
  },
)

// 监听 position 变化
watch(
  () => props.position,
  () => {
    checkFixed()
  },
)

// 监听 target 变化
watch(
  () => props.target,
  () => {
    // 重新绑定滚动监听
    const oldTarget = getScrollTarget()
    if (oldTarget && oldTarget.removeEventListener) {
      oldTarget.removeEventListener('scroll', handleScroll)
    }

    checkFixed()
    const newTarget = getScrollTarget()
    if (newTarget && newTarget.addEventListener) {
      newTarget.addEventListener('scroll', handleScroll, {
        passive: true,
      } as AddEventListenerOptions)
    }
  },
)

// 暴露方法和状态给父组件
defineExpose({
  isFixed: computed(() => state.value.isFixed),
  checkFixed,
  getScrollTarget,
  state,
})
</script>

<template>
  <div :ref="(el: any) => (affixRef = el)" :class="classes" :style="{ ...fixedStyle, ...style }">
    <slot />
  </div>
</template>

<style scoped>
/* 平滑过渡效果 */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.duration-200 {
  transition-duration: 200ms;
}
</style>
