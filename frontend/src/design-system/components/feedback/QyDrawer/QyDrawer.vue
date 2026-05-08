<script setup lang="ts">
/**
 * QyDrawer 抽屉组件
 *
 * 基于 Tailwind v4 和 CVA 的抽屉组件
 * 支持 Element Plus API 命名规范
 */

import { computed, watch, nextTick, ref, onMounted, onUnmounted } from 'vue'
import { cn } from '../../../utils/cn'
import type { QyDrawerProps, QyDrawerEmits, QyDrawerSlots } from './types'
import { DIRECTION_MAP, DRAWER_SIZES, drawerDefaults } from './types'
import {
  drawerVariants,
  headerVariants,
  titleVariants,
  bodyVariants,
  footerVariants,
  closeBtnVariants,
  overlayVariants,
  getSizeStyle,
  getPresetSize,
  transformVariants,
} from './variants'

// ============================================
// Props & Emits
// ============================================

const props = withDefaults(defineProps<QyDrawerProps>(), drawerDefaults)
const emit = defineEmits<QyDrawerEmits>()
const slots = defineSlots<QyDrawerSlots>()

// ============================================
// Internal State
// ============================================

const isVisible = ref(props.modelValue)
const isAnimating = ref(false)

// ============================================
// Computed
// ============================================

/**
 * 内部方向（用于样式计算）
 */
const internalDirection = computed(() => DIRECTION_MAP[props.direction || 'rtl'])

/**
 * 计算抽屉类名
 */
const drawerClasses = computed(() => {
  return cn(
    drawerVariants({
      direction: internalDirection.value,
    }),
    props.class
  )
})

/**
 * 计算抽屉尺寸样式
 */
const drawerSizeStyle = computed(() => {
  let size = props.size

  // 处理预设尺寸
  if (typeof size === 'string' && size in DRAWER_SIZES) {
    size = getPresetSize(size as keyof typeof DRAWER_SIZES)
  }

  return getSizeStyle(size, internalDirection.value)
})

/**
 * 计算抽屉 z-index
 */
const drawerZIndex = computed(() => props.zIndex ?? 50)

/**
 * 计算遮罩层 z-index
 */
const overlayZIndex = computed(() => props.modalZIndex ?? 40)

/**
 * 计算遮罩层类名
 */
const overlayClasses = computed(() => {
  return cn(
    overlayVariants({
      visible: isVisible.value && !isAnimating.value,
    }),
    props.modalClass
  )
})

/**
 * 计算头部类名
 */
const headerClasses = computed(() => {
  return headerVariants({
    hasTitle: !!props.title || !!slots.title,
  })
})

/**
 * 计算标题类名
 */
const titleClasses = computed(() => titleVariants())

/**
 * 计算内容区域类名
 */
const bodyClasses = computed(() => bodyVariants())

/**
 * 计算底部类名
 */
const footerClasses = computed(() => footerVariants())

/**
 * 计算关闭按钮类名
 */
const closeBtnClasses = computed(() => closeBtnVariants())

/**
 * 计算动画变换样式
 */
const transformStyle = computed(() => {
  if (isVisible.value && !isAnimating.value) {
    return {}
  }
  return {
    transform: transformVariants[internalDirection.value],
  }
})

// ============================================
// Methods
// ============================================

/**
 * 打开抽屉
 */
const open = async () => {
  if (isVisible.value) return

  emit('open')
  isVisible.value = true
  isAnimating.value = true

  // 禁用 body 滚动
  if (props.lockScroll) {
    document.body.style.overflow = 'hidden'
  }

  // 等待 DOM 更新
  await nextTick()

  // 触发打开动画
  requestAnimationFrame(() => {
    isAnimating.value = false
    emit('opened')
  })
}

/**
 * 关闭抽屉
 */
const close = async () => {
  if (!isVisible.value) return

  // 执行关闭前回调
  if (props.beforeClose) {
    try {
      const canClose = await props.beforeClose()
      if (!canClose) {
        return
      }
    } catch (error) {
      console.error('QyDrawer beforeClose error:', error)
      return
    }
  }

  emit('close')
  isAnimating.value = true

  // 等待动画结束
  setTimeout(() => {
    isVisible.value = false
    isAnimating.value = false

    // 恢复 body 滚动
    if (props.lockScroll) {
      document.body.style.overflow = ''
    }

    emit('closed')
  }, 300)
}

/**
 * 点击遮罩层
 */
const handleOverlayClick = () => {
  if (props.closeOnClickModal && props.modal) {
    close()
  }
}

/**
 * 点击抽屉内容（阻止事件冒泡）
 */
const handleContentClick = (e: MouseEvent) => {
  e.stopPropagation()
}

/**
 * 点击关闭按钮
 */
const handleCloseClick = () => {
  close()
}

/**
 * 键盘事件处理
 */
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.closeOnPressEscape && isVisible.value) {
    close()
  }
}

// ============================================
// Watchers
// ============================================

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    open()
  } else {
    close()
  }
})

// 监听内部状态变化同步到父组件
watch(isVisible, (newVal) => {
  if (!isAnimating.value) {
    emit('update:modelValue', newVal)
  }
})

// ============================================
// Lifecycle
// ============================================

// 组件挂载时添加键盘监听
onMounted(() => {
  if (props.closeOnPressEscape) {
    document.addEventListener('keydown', handleKeydown)
  }
})

// 组件卸载时移除键盘监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)

  // 恢复 body 滚动
  if (props.lockScroll && isVisible.value) {
    document.body.style.overflow = ''
  }
})

// ============================================
// Expose
// ============================================

defineExpose({
  open,
  close,
})
</script>

<template>
  <Teleport to="body">
    <!-- 遮罩层 -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue && modal"
        :class="overlayClasses"
        :style="{ zIndex: overlayZIndex }"
        @click="handleOverlayClick"
        aria-hidden="true"
      />
    </Transition>

    <!-- 抽屉主体 -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-ios"
      leave-active-class="transition-transform duration-300 ease-ios"
    >
      <div
        v-if="modelValue"
        :class="drawerClasses"
        :style="{
          ...drawerSizeStyle,
          zIndex: drawerZIndex,
          ...transformStyle,
        }"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'qy-drawer-title' : undefined"
        @click="handleContentClick"
      >
        <!-- 头部 -->
        <div
          v-if="slots.header || slots.title || title"
          :class="headerClasses"
        >
          <div class="flex items-center gap-3">
            <slot name="header">
              <slot name="title">
                <h3
                  v-if="title"
                  id="qy-drawer-title"
                  :class="titleClasses"
                >
                  {{ title }}
                </h3>
              </slot>
            </slot>
          </div>
          <button
            v-if="showClose"
            type="button"
            :class="closeBtnClasses"
            @click="handleCloseClick"
            aria-label="关闭抽屉"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- 内容区域 -->
        <div :class="bodyClasses">
          <slot v-if="!destroyOnClose || modelValue">
            <p class="text-slate-600 dark:text-slate-400">
              抽屉内容
            </p>
          </slot>
        </div>

        <!-- 底部 -->
        <div
          v-if="slots.footer"
          :class="footerClasses"
        >
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/**
 * 抽屉动画
 * 方向特定的进入/离开动画
 */

/* 从左侧滑入 */
.direction-left-enter-active,
.direction-left-leave-active {
  transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.direction-left-enter-from,
.direction-left-leave-to {
  transform: translateX(-100%);
}

/* 从右侧滑入 */
.direction-right-enter-active,
.direction-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.direction-right-enter-from,
.direction-right-leave-to {
  transform: translateX(100%);
}

/* 从顶部滑入 */
.direction-top-enter-active,
.direction-top-leave-active {
  transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.direction-top-enter-from,
.direction-top-leave-to {
  transform: translateY(-100%);
}

/* 从底部滑入 */
.direction-bottom-enter-active,
.direction-bottom-leave-active {
  transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.direction-bottom-enter-from,
.direction-bottom-leave-to {
  transform: translateY(100%);
}
</style>
