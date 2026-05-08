<template>
  <div ref="triggerRef" class="qy-tooltip-trigger inline-flex">
    <!-- 默认插槽：触发元素 -->
    <slot />

    <!-- Tooltip 弹出层 -->
    <Teleport to="body">
      <Transition
        :name="transitionName"
        @before-enter="handleBeforeShow"
        @after-enter="handleShow"
        @before-leave="handleBeforeHide"
        @after-leave="handleHide"
      >
        <div
          v-show="visible"
          ref="popperRef"
          :class="tooltipClasses"
          :style="popperStyles"
          :data-arrow="showArrow"
          :data-placement="placement"
          role="tooltip"
          :aria-hidden="!visible"
        >
          <!-- 箭头 -->
          <span v-if="showArrow" class="qy-tooltip__arrow" />

          <!-- 内容 -->
          <span v-if="!rawContent" class="qy-tooltip__content">
            {{ content }}
          </span>
          <span v-else class="qy-tooltip__content" v-html="content" />

          <!-- 自定义内容插槽 -->
          <slot v-if="!content" name="content" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { cn } from '@/design-system/utils/cn'
import { tooltipVariants } from './variants'
import type { QyTooltipProps, QyTooltipEmits } from './types'

// Props
const props = withDefaults(defineProps<QyTooltipProps>(), {
  placement: 'top',
  disabled: false,
  effect: 'dark',
  openDelay: 0,
  closeDelay: 200,
  rawContent: false,
  hideAfter: true,
  autoClose: false,
  trigger: 'hover'
})

// Emits
const emit = defineEmits<QyTooltipEmits>()

// Refs
const triggerRef = ref<HTMLElement>()
const popperRef = ref<HTMLElement>()

// State
const visible = ref(false)
const popperPosition = ref({ top: '0px', left: '0px' })
let openTimer: ReturnType<typeof setTimeout> | null = null
let closeTimer: ReturnType<typeof setTimeout> | null = null
let autoCloseTimer: ReturnType<typeof setTimeout> | null = null

// Computed
const tooltipClasses = computed(() => {
  return cn(
    tooltipVariants({
      effect: props.effect,
      placement: props.placement
    }),
    props.popperClass,
    'qy-tooltip'
  )
})

const popperStyles = computed(() => ({
  top: popperPosition.value.top,
  left: popperPosition.value.left
}))

const showArrow = computed(() => !props.popperClass?.includes('no-arrow'))

const transitionName = computed(() => {
  const placementMap: Record<string, string> = {
    top: 'qy-tooltip-fade',
    bottom: 'qy-tooltip-fade',
    left: 'qy-tooltip-fade',
    right: 'qy-tooltip-fade',
    'top-start': 'qy-tooltip-slide-top',
    'top-end': 'qy-tooltip-slide-top',
    'bottom-start': 'qy-tooltip-slide-bottom',
    'bottom-end': 'qy-tooltip-slide-bottom',
    'left-start': 'qy-tooltip-slide-left',
    'left-end': 'qy-tooltip-slide-left',
    'right-start': 'qy-tooltip-slide-right',
    'right-end': 'qy-tooltip-slide-right'
  }
  return placementMap[props.placement ?? 'top'] || 'qy-tooltip-fade'
})

// Methods
const calculatePosition = () => {
  if (!triggerRef.value || !popperRef.value) return

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const popperRect = popperRef.value.getBoundingClientRect()
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft
  const scrollY = window.pageYOffset || document.documentElement.scrollTop

  const gap = 8 // 与触发元素的间距
  let top = 0
  let left = 0

  // 根据位置计算坐标
  switch (props.placement) {
    case 'top':
      top = triggerRect.top + scrollY - popperRect.height - gap
      left = triggerRect.left + scrollX + (triggerRect.width - popperRect.width) / 2
      break
    case 'top-start':
      top = triggerRect.top + scrollY - popperRect.height - gap
      left = triggerRect.left + scrollX
      break
    case 'top-end':
      top = triggerRect.top + scrollY - popperRect.height - gap
      left = triggerRect.left + scrollX + triggerRect.width - popperRect.width
      break
    case 'bottom':
      top = triggerRect.bottom + scrollY + gap
      left = triggerRect.left + scrollX + (triggerRect.width - popperRect.width) / 2
      break
    case 'bottom-start':
      top = triggerRect.bottom + scrollY + gap
      left = triggerRect.left + scrollX
      break
    case 'bottom-end':
      top = triggerRect.bottom + scrollY + gap
      left = triggerRect.left + scrollX + triggerRect.width - popperRect.width
      break
    case 'left':
      top = triggerRect.top + scrollY + (triggerRect.height - popperRect.height) / 2
      left = triggerRect.left + scrollX - popperRect.width - gap
      break
    case 'left-start':
      top = triggerRect.top + scrollY
      left = triggerRect.left + scrollX - popperRect.width - gap
      break
    case 'left-end':
      top = triggerRect.top + scrollY + triggerRect.height - popperRect.height
      left = triggerRect.left + scrollX - popperRect.width - gap
      break
    case 'right':
      top = triggerRect.top + scrollY + (triggerRect.height - popperRect.height) / 2
      left = triggerRect.right + scrollX + gap
      break
    case 'right-start':
      top = triggerRect.top + scrollY
      left = triggerRect.right + scrollX + gap
      break
    case 'right-end':
      top = triggerRect.top + scrollY + triggerRect.height - popperRect.height
      left = triggerRect.right + scrollX + gap
      break
  }

  // 边界检测
  const padding = 8
  if (left < padding) left = padding
  if (top < padding) top = padding
  if (left + popperRect.width > window.innerWidth - padding) {
    left = window.innerWidth - popperRect.width - padding
  }
  if (top + popperRect.height > window.innerHeight - padding) {
    top = window.innerHeight - popperRect.height - padding
  }

  popperPosition.value = { top: `${top}px`, left: `${left}px` }
}

const clearTimers = () => {
  if (openTimer) {
    clearTimeout(openTimer)
    openTimer = null
  }
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer)
    autoCloseTimer = null
  }
}

const handleShow = () => {
  emit('show')
  if (props.autoClose && typeof props.autoClose === 'number') {
    autoCloseTimer = setTimeout(() => {
      hide()
    }, props.autoClose)
  }
}

const handleHide = () => {
  emit('hide')
}

const handleBeforeShow = () => {
  emit('before-show')
}

const handleBeforeHide = () => {
  emit('before-hide')
}

const show = async () => {
  if (props.disabled) return
  clearTimers()

  if (props.openDelay > 0) {
    openTimer = setTimeout(async () => {
      visible.value = true
      await nextTick()
      calculatePosition()
    }, props.openDelay)
  } else {
    visible.value = true
    await nextTick()
    calculatePosition()
  }
}

const hide = () => {
  clearTimers()

  if (props.hideAfter === false) {
    visible.value = false
    return
  }

  const delay = typeof props.hideAfter === 'number' ? props.hideAfter : props.closeDelay
  if (delay > 0) {
    closeTimer = setTimeout(() => {
      visible.value = false
    }, delay)
  } else {
    visible.value = false
  }
}

const update = () => {
  if (visible.value) {
    calculatePosition()
  }
}

// Event handlers
const handleMouseEnter = () => {
  if (props.trigger === 'hover') {
    show()
  }
}

const handleMouseLeave = () => {
  if (props.trigger === 'hover') {
    hide()
  }
}

const handleFocus = () => {
  if (props.trigger === 'focus') {
    show()
  }
}

const handleBlur = () => {
  if (props.trigger === 'focus') {
    hide()
  }
}

const handleClick = () => {
  if (props.trigger === 'click') {
    if (visible.value) {
      hide()
    } else {
      show()
    }
  }
}

const handleContextMenu = (event: MouseEvent) => {
  if (props.trigger === 'contextmenu') {
    event.preventDefault()
    if (visible.value) {
      hide()
    } else {
      show()
    }
  }
}

// Bind events to trigger element
const bindEvents = () => {
  if (!triggerRef.value) return

  const el = triggerRef.value

  if (props.trigger === 'hover') {
    el.addEventListener('mouseenter', handleMouseEnter)
    el.addEventListener('mouseleave', handleMouseLeave)
  } else if (props.trigger === 'focus') {
    el.addEventListener('focusin', handleFocus)
    el.addEventListener('focusout', handleBlur)
  } else if (props.trigger === 'click') {
    el.addEventListener('click', handleClick)
  } else if (props.trigger === 'contextmenu') {
    el.addEventListener('contextmenu', handleContextMenu)
  }
}

const unbindEvents = () => {
  if (!triggerRef.value) return

  const el = triggerRef.value

  el.removeEventListener('mouseenter', handleMouseEnter)
  el.removeEventListener('mouseleave', handleMouseLeave)
  el.removeEventListener('focusin', handleFocus)
  el.removeEventListener('focusout', handleBlur)
  el.removeEventListener('click', handleClick)
  el.removeEventListener('contextmenu', handleContextMenu)
}

// Watch for disabled state changes
watch(
  () => props.disabled,
  (val) => {
    if (val && visible.value) {
      hide()
    }
  }
)

// Lifecycle
onMounted(() => {
  bindEvents()
})

onBeforeUnmount(() => {
  clearTimers()
  unbindEvents()
})

// Expose methods
defineExpose({
  show,
  hide,
  update
})
</script>

<style scoped>
.qy-tooltip {
  position: fixed;
  z-index: 9999;
}

.qy-tooltip__arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 6px solid transparent;
}

.qy-tooltip__content {
  display: block;
}

/* 箭头位置 */
.qy-tooltip[data-placement^='top'] .qy-tooltip__arrow {
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: currentColor;
}

.qy-tooltip[data-placement='top-start'] .qy-tooltip__arrow {
  bottom: -6px;
  left: 12px;
  transform: none;
  border-top-color: currentColor;
}

.qy-tooltip[data-placement='top-end'] .qy-tooltip__arrow {
  bottom: -6px;
  right: 12px;
  left: auto;
  transform: none;
  border-top-color: currentColor;
}

.qy-tooltip[data-placement^='bottom'] .qy-tooltip__arrow {
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: currentColor;
}

.qy-tooltip[data-placement='bottom-start'] .qy-tooltip__arrow {
  top: -6px;
  left: 12px;
  transform: none;
  border-bottom-color: currentColor;
}

.qy-tooltip[data-placement='bottom-end'] .qy-tooltip__arrow {
  top: -6px;
  right: 12px;
  left: auto;
  transform: none;
  border-bottom-color: currentColor;
}

.qy-tooltip[data-placement^='left'] .qy-tooltip__arrow {
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: currentColor;
}

.qy-tooltip[data-placement='left-start'] .qy-tooltip__arrow {
  right: -6px;
  top: 12px;
  transform: none;
  border-left-color: currentColor;
}

.qy-tooltip[data-placement='left-end'] .qy-tooltip__arrow {
  right: -6px;
  bottom: 12px;
  top: auto;
  transform: none;
  border-left-color: currentColor;
}

.qy-tooltip[data-placement^='right'] .qy-tooltip__arrow {
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: currentColor;
}

.qy-tooltip[data-placement='right-start'] .qy-tooltip__arrow {
  left: -6px;
  top: 12px;
  transform: none;
  border-right-color: currentColor;
}

.qy-tooltip[data-placement='right-end'] .qy-tooltip__arrow {
  left: -6px;
  bottom: 12px;
  top: auto;
  transform: none;
  border-right-color: currentColor;
}

/* 深色模式下箭头颜色 */
.qy-tooltip[data-effect='dark'] .qy-tooltip__arrow {
  color: rgb(15 23 42 / 0.95);
}

/* 浅色模式下箭头颜色 */
.qy-tooltip[data-effect='light'] .qy-tooltip__arrow {
  color: rgb(255 255 255 / 0.95);
}

/* 过渡动画 */
.qy-tooltip-fade-enter-active,
.qy-tooltip-fade-leave-active {
  transition: opacity 0.2s ease-out;
}

.qy-tooltip-fade-enter-from,
.qy-tooltip-fade-leave-to {
  opacity: 0;
}

.qy-tooltip-slide-top-enter-active,
.qy-tooltip-slide-top-leave-active {
  transition: all 0.2s ease-out;
}

.qy-tooltip-slide-top-enter-from,
.qy-tooltip-slide-top-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.qy-tooltip-slide-bottom-enter-active,
.qy-tooltip-slide-bottom-leave-active {
  transition: all 0.2s ease-out;
}

.qy-tooltip-slide-bottom-enter-from,
.qy-tooltip-slide-bottom-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.qy-tooltip-slide-left-enter-active,
.qy-tooltip-slide-left-leave-active {
  transition: all 0.2s ease-out;
}

.qy-tooltip-slide-left-enter-from,
.qy-tooltip-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

.qy-tooltip-slide-right-enter-active,
.qy-tooltip-slide-right-leave-active {
  transition: all 0.2s ease-out;
}

.qy-tooltip-slide-right-enter-from,
.qy-tooltip-slide-right-leave-to {
  opacity: 0;
  transform: translateX(8px);
}
</style>
