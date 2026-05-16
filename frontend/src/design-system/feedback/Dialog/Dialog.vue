<script setup lang="ts">
/**
 * Dialog 对话框组件 (Apple Style)
 *
 * Apple 风格的对话框，毛玻璃遮罩、柔和阴影、弹性动画
 */

import { computed, watch, nextTick, ref, onMounted, onUnmounted } from 'vue'
import { cn } from '../../utils/cn'
import type { DialogProps, DialogEmits } from './types'
import { Icon } from '../../base/Icon'

// 尺寸到 max-width 的映射
const sizeMap: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full w-full h-full m-0 rounded-none',
}

// Props
const props = withDefaults(defineProps<DialogProps>(), {
  visible: false,
  title: '',
  size: 'md',
  center: false,
  modal: true,
  showClose: true,
  closeOnClickModal: true,
  closeOnPressEscape: true,
  lockScroll: true,
  teleportTo: 'body',
})

// Emits
const emit = defineEmits<DialogEmits>()

// Internal state
const isVisible = ref(false)
const isAnimating = ref(false)
const dialogContent = ref<HTMLElement | null>(null)
const isInitialized = ref(false)
const titleId = `qy-dialog-title-${Math.random().toString(36).slice(2)}`

// Dialog container classes
const dialogClasses = computed(() =>
  cn(
    'surface-floating flex flex-col overflow-hidden text-[var(--color-ink-primary)]',
    'max-h-[min(88vh,900px)] rounded-[1.75rem]',
    props.center ? 'text-center' : '',
    // 尺寸
    sizeMap[props.size] || sizeMap.md,
    // 自定义 class
    props.class,
  ),
)

// Overlay classes
const overlayClasses = computed(() =>
  cn(
    'qy-dialog__overlay fixed inset-0 flex justify-center px-4 py-6',
    props.size === 'full' ? 'items-stretch' : props.center ? 'items-center' : 'items-start pt-20',
    props.modal ? 'bg-black/30 backdrop-blur-sm' : '',
    props.modalClass,
  ),
)

// Watch external visible -> open/close
watch(
  () => props.visible,
  (val) => {
    if (val) {
      open()
    } else {
      close()
    }
  },
)

// Sync internal state back to parent
watch(isVisible, (val, oldVal) => {
  if (isInitialized.value && val !== oldVal) {
    emit('update:visible', val)
  }
})

// Keyboard listener toggle
watch(
  () => props.closeOnPressEscape,
  (val) => {
    if (val) {
      document.addEventListener('keydown', handleKeydown)
    } else {
      document.removeEventListener('keydown', handleKeydown)
    }
  },
)

// Mount: restore visible state
onMounted(async () => {
  if (props.visible) {
    await open()
  }
  isInitialized.value = true
  if (props.closeOnPressEscape) {
    document.addEventListener('keydown', handleKeydown)
  }
})

// Open
const open = async () => {
  if (isVisible.value) return

  emit('open')
  isVisible.value = true
  isAnimating.value = true

  if (props.lockScroll) {
    document.body.style.overflow = 'hidden'
  }

  await nextTick()
  requestAnimationFrame(() => {
    isAnimating.value = false
    dialogContent.value?.focus()
    emit('opened')
  })
}

// Close
const close = async () => {
  if (!isVisible.value) return

  if (props.beforeClose) {
    try {
      const canClose = await props.beforeClose()
      if (!canClose) return
    } catch (error) {
      console.error('Dialog beforeClose error:', error)
      return
    }
  }

  emit('close')
  isAnimating.value = true

  setTimeout(() => {
    isVisible.value = false
    isAnimating.value = false

    if (props.lockScroll) {
      document.body.style.overflow = ''
    }

    emit('closed')
  }, 220)
}

// Click overlay to close
const handleOverlayClick = () => {
  if (props.closeOnClickModal) {
    close()
  }
}

// Prevent click propagation from content
const handleContentClick = (e: MouseEvent) => {
  e.stopPropagation()
}

// Close button
const handleCloseClick = () => {
  close()
}

// Keyboard handler
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.closeOnPressEscape) {
    close()
  }
}

// Cleanup
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (props.lockScroll && isVisible.value) {
    document.body.style.overflow = ''
  }
})

// Expose
defineExpose({
  open,
  close,
  dialogContent,
})
</script>

<template>
  <Teleport :to="teleportTo">
    <!-- 遮罩 + 居中容器 -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isVisible" :class="overlayClasses" @click="handleOverlayClick">
        <!-- 对话框卡片 -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isVisible"
            ref="dialogContent"
            :class="dialogClasses"
            class="qy-dialog__content relative"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="title ? titleId : undefined"
            tabindex="-1"
            @click="handleContentClick"
          >
            <!-- Header -->
            <div
              v-if="$slots.header || title || showClose"
              class="flex items-start justify-between gap-4 border-b border-[var(--color-line-soft)] px-6 pt-6 pb-4"
            >
              <div class="flex items-center gap-3 min-w-0">
                <slot name="header">
                  <slot name="title">
                    <h3
                      v-if="title"
                      :id="titleId"
                      class="truncate text-lg font-semibold tracking-[-0.01em] text-slate-950"
                    >
                      {{ title }}
                    </h3>
                  </slot>
                </slot>
              </div>
              <button
                v-if="showClose"
                type="button"
                class="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200/70 bg-white/88 text-slate-400 shadow-[0_8px_20px_-16px_rgba(15,23,42,0.4)] transition-all duration-150 hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/18 focus-visible:ring-offset-2"
                @click="handleCloseClick"
                aria-label="关闭对话框"
              >
                <Icon name="x-mark" size="sm" />
              </button>
            </div>

            <!-- Body -->
            <div class="flex-1 overflow-auto px-6 py-5">
              <slot>
                <p class="text-slate-500">对话框内容</p>
              </slot>
            </div>

            <!-- Footer -->
            <div
              v-if="$slots.footer"
              class="flex items-center justify-end gap-3 border-t border-[var(--color-line-soft)] bg-slate-50/72 px-6 py-4"
            >
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.qy-dialog__overlay {
  z-index: var(--theme-z-dialog, 11000);
}

.qy-dialog__content {
  z-index: calc(var(--theme-z-dialog, 11000) + 1);
}
</style>
