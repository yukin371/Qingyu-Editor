<script setup lang="ts">
/**
 * Drawer 抽屉组件
 *
 * 可从屏幕边缘滑出的面板组件，支持四个方向
 */

import { computed, watch, nextTick, ref, onMounted, onUnmounted } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { DrawerProps, DrawerEmits, DrawerDirection } from './types'
import { Icon } from '../../base/Icon'

// 使用 CVA 定义抽屉变体
const drawerVariants = cva(
  // 基础样式
  'fixed z-50 bg-white dark:bg-neutral-800 shadow-xl flex flex-col transition-transform duration-300 ease-in-out',
  {
    variants: {
      direction: {
        left: 'top-0 left-0 h-full border-r border-neutral-200 dark:border-neutral-700',
        right: 'top-0 right-0 h-full border-l border-neutral-200 dark:border-neutral-700',
        top: 'top-0 left-0 w-full border-b border-neutral-200 dark:border-neutral-700',
        bottom: 'bottom-0 left-0 w-full border-t border-neutral-200 dark:border-neutral-700',
      },
    },
    defaultVariants: {
      direction: 'right',
    },
  },
)

// 组件 Props
const props = withDefaults(defineProps<DrawerProps>(), {
  modelValue: false,
  title: '',
  direction: 'right',
  size: '30%',
  closable: true,
  showClose: true,
  destroyOnClose: false,
  modal: true,
  closeOnClickModal: true,
  closeOnPressEscape: true,
  lockScroll: true,
  rtl: false,
})

// 组件 Emits
const emit = defineEmits<DrawerEmits>()

// 内部状态
const isVisible = ref(false)
const isAnimating = ref(false)

// 计算抽屉样式类名
const drawerClasses = computed(() => {
  const direction = props.rtl && props.direction === 'right' ? 'left' : props.direction
  return cn(
    drawerVariants({
      direction: direction as DrawerDirection,
    }),
    props.class,
  )
})

// 计算抽屉尺寸样式
const sizeStyle = computed(() => {
  const size = props.size
  const direction = props.rtl && props.direction === 'right' ? 'left' : props.direction

  if (direction === 'left' || direction === 'right') {
    // 水平方向，设置宽度
    if (typeof size === 'number') {
      return { width: `${size}px` }
    }
    return { width: size }
  } else {
    // 垂直方向，设置高度
    if (typeof size === 'number') {
      return { height: `${size}px` }
    }
    return { height: size }
  }
})

// 计算抽屉变换样式（隐藏时的位移）
const transformStyle = computed(() => {
  const direction = props.rtl && props.direction === 'right' ? 'left' : props.direction

  if (isVisible.value && !isAnimating.value) {
    return {}
  }

  switch (direction) {
    case 'left':
      return { transform: 'translateX(-100%)' }
    case 'right':
      return { transform: 'translateX(100%)' }
    case 'top':
      return { transform: 'translateY(-100%)' }
    case 'bottom':
      return { transform: 'translateY(100%)' }
    default:
      return {}
  }
})

// 计算遮罩层样式类名
const modalClasses = computed(() =>
  cn('fixed inset-0 bg-black/50 z-40 transition-opacity duration-300', props.modalClass),
)

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      open(false)
    } else {
      close(false)
    }
  },
)

// 打开抽屉
const open = async (syncModel = true) => {
  if (isVisible.value) return

  if (syncModel) {
    emit('update:modelValue', true)
  }
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

// 关闭抽屉
const close = async (syncModel = true) => {
  if (!isVisible.value) return

  // 执行关闭前回调
  if (props.beforeClose) {
    try {
      const canClose = await props.beforeClose()
      if (!canClose) {
        return
      }
    } catch (error) {
      console.error('Drawer beforeClose error:', error)
      return
    }
  }

  if (syncModel) {
    emit('update:modelValue', false)
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

// 点击遮罩层关闭
const handleModalClick = () => {
  if (props.closeOnClickModal && props.modal) {
    close()
  }
}

// 点击抽屉内容，阻止事件冒泡
const handleContentClick = (e: MouseEvent) => {
  e.stopPropagation()
}

// 点击关闭按钮
const handleCloseClick = () => {
  if (props.closable) {
    close()
  }
}

// 键盘事件处理
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.closeOnPressEscape) {
    close()
  }
}

// 组件挂载时添加键盘监听
onMounted(() => {
  if (props.modelValue) {
    void open(false)
  }
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

// 暴露方法给父组件
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
        v-if="isVisible && modal"
        :class="modalClasses"
        @click="handleModalClick"
        aria-hidden="true"
      />
    </Transition>

    <!-- 抽屉 -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      leave-active-class="transition-transform duration-300 ease-in"
    >
      <div
        v-if="isVisible"
        ref="drawerContent"
        :class="drawerClasses"
        :style="{
          ...sizeStyle,
          ...transformStyle,
        }"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'drawer-title' : undefined"
        @click="handleContentClick"
      >
        <!-- 头部 -->
        <div
          v-if="$slots.header || title || (showClose && closable)"
          class="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0"
        >
          <div class="flex items-center gap-3">
            <slot name="header">
              <slot name="title">
                <h3
                  v-if="title"
                  id="drawer-title"
                  class="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
                >
                  {{ title }}
                </h3>
              </slot>
            </slot>
          </div>
          <button
            v-if="showClose && closable"
            type="button"
            class="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:shadow-[0_0_0_3px_rgba(14,165,233,0.16)]"
            @click="handleCloseClick"
            aria-label="关闭抽屉"
          >
            <Icon name="x-mark" size="sm" />
          </button>
        </div>

        <!-- 内容区域 -->
        <div class="flex-1 overflow-auto px-6 py-4">
          <slot v-if="!destroyOnClose || props.modelValue">
            <p class="text-neutral-600 dark:text-neutral-400">抽屉内容</p>
          </slot>
        </div>

        <!-- 底部 -->
        <div
          v-if="$slots.footer"
          class="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 flex-shrink-0"
        >
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 抽屉动画 */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s ease;
}

/* 从左侧滑入 */
.direction-left.drawer-enter-from,
.direction-left.drawer-leave-to {
  transform: translateX(-100%);
}

/* 从右侧滑入 */
.direction-right.drawer-enter-from,
.direction-right.drawer-leave-to {
  transform: translateX(100%);
}

/* 从顶部滑入 */
.direction-top.drawer-enter-from,
.direction-top.drawer-leave-to {
  transform: translateY(-100%);
}

/* 从底部滑入 */
.direction-bottom.drawer-enter-from,
.direction-bottom.drawer-leave-to {
  transform: translateY(100%);
}

/* RTL 支持 */
.rtl .drawer-content {
  direction: rtl;
}
</style>
