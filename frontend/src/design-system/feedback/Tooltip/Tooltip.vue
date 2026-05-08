<script setup lang="ts">
/**
 * Tooltip 组件
 *
 * 用于显示鼠标悬停时的提示信息
 */

import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { TooltipProps } from './types'

// 使用 CVA 定义 Tooltip 变体
const tooltipVariants = cva('relative inline-flex', { variants: {} })

// 组件 Props
const props = withDefaults(defineProps<TooltipProps>(), {
  trigger: 'hover',
  placement: 'bottom',
  disabled: false,
  effect: 'dark',
  showArrow: true,
  offset: 12,
  transition: 'tooltip-fade',
  openDelay: 0,
  closeDelay: 200,
  destroyOnClose: false,
})

// 组件 Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  beforeShow: []
  afterShow: []
  beforeHide: []
  afterHide: []
}>()

// 状态
const visible = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const popperRef = ref<HTMLElement | null>(null)
let showTimer: number | null = null
let hideTimer: number | null = null

// 计算样式类名
const classes = computed(() => cn(tooltipVariants(), props.class))

// 计算 Popper 位置样式
const popperStyle = computed(() => {
  if (!triggerRef.value) return {}

  const trigger = triggerRef.value.getBoundingClientRect()
  const offset = props.offset

  let top = 0
  let left = 0

  switch (props.placement) {
    case 'top':
      top = trigger.top - trigger.height - offset
      left = trigger.left + (trigger.width) / 2
      break
    case 'top-start':
      top = trigger.top - trigger.height - offset
      left = trigger.left
      break
    case 'top-end':
      top = trigger.top - trigger.height - offset
      left = trigger.right
      break
    case 'bottom':
      top = trigger.bottom + offset
      left = trigger.left + (trigger.width) / 2
      break
    case 'bottom-start':
      top = trigger.bottom + offset
      left = trigger.left
      break
    case 'bottom-end':
      top = trigger.bottom + offset
      left = trigger.right
      break
    case 'left':
      top = trigger.top + (trigger.height) / 2
      left = trigger.left - offset
      break
    case 'left-start':
      top = trigger.top
      left = trigger.left - offset
      break
    case 'left-end':
      top = trigger.bottom
      left = trigger.left - offset
      break
    case 'right':
      top = trigger.top + (trigger.height) / 2
      left = trigger.right + offset
      break
    case 'right-start':
      top = trigger.top
      left = trigger.right + offset
      break
    case 'right-end':
      top = trigger.bottom
      left = trigger.right + offset
      break
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
    transform: getTransform(),
  }
})

function getTransform() {
  switch (props.placement) {
    case 'top':
    case 'bottom':
      return 'translateX(-50%)'
    case 'top-start':
    case 'bottom-start':
    case 'left':
    case 'right':
      return ''
    case 'top-end':
    case 'bottom-end':
      return 'translateX(-100%)'
    case 'left-start':
    case 'right-start':
      return 'translateY(-50%)'
    case 'left-end':
    case 'right-end':
      return 'translateY(-100%)'
    default:
      return ''
  }
}

// 箭头样式
const arrowStyle = computed(() => {
  const size = 6
  const dark = props.effect === 'dark'
  const borderColor = dark ? '#1e293b' : '#e2e8f0'

  const rotationMap: Record<string, number> = {
    top: 0,
    'top-start': 0,
    'top-end': 0,
    bottom: 180,
    'bottom-start': 180,
    'bottom-end': 180,
    left: 90,
    'left-start': 90,
    'left-end': 90,
    right: -90,
    'right-start': -90,
    'right-end': -90,
  }

  const placementPosMap: Record<string, { top: string; left: string; transform: string }> = {
    top: { top: '100%', left: '50%', transform: 'translateX(-50%)' },
    'top-start': { top: '100%', left: `${size}px`, transform: 'translate(0, 0)' },
    'top-end': { top: '100%', left: `calc(100% - ${size}px)`, transform: 'translate(0, 0)' },
    bottom: { top: `-${size}px`, left: '50%', transform: 'translateX(-50%)' },
    'bottom-start': { top: `-${size}px`, left: `${size}px`, transform: 'translate(0, 0)' },
    'bottom-end': { top: `-${size}px`, left: `calc(100% - ${size}px)`, transform: 'translate(0, 0)' },
    left: { top: '50%', left: '100%', transform: 'translateY(-50%)' },
    'left-start': { top: `${size}px`, left: '100%', transform: 'translate(0, 0)' },
    'left-end': { top: `calc(100% - ${size}px)`, left: '100%', transform: 'translate(0, 0)' },
    right: { top: '50%', left: `-${size}px`, transform: 'translateY(-50%)' },
    'right-start': { top: `${size}px`, left: `-${size}px`, transform: 'translate(0, 0)' },
    'right-end': { top: `calc(100% - ${size}px)`, left: `-${size}px`, transform: 'translate(0, 0)' },
  }

  const rotation = rotationMap[props.placement] ?? 0
  const pos = placementPosMap[props.placement]

  return {
    width: `${size}px`,
    height: `${size}px`,
    borderTopColor: rotation === 0 ? borderColor : 'transparent',
    borderRightColor: rotation === -90 ? borderColor : 'transparent',
    borderBottomColor: rotation === 180 ? borderColor : 'transparent',
    borderLeftColor: rotation === 90 ? borderColor : 'transparent',
    transform: pos.transform,
    top: pos.top,
    left: pos.left,
  }
})

// 清除定时器
const clearTimers = () => {
  if (showTimer !== null) { clearTimeout(showTimer); showTimer = null }
  if (hideTimer !== null) { clearTimeout(hideTimer); hideTimer = null }
}

// 显示
const show = async () => {
  if (props.disabled) return
  clearTimers()
  if (props.openDelay > 0) {
    showTimer = window.setTimeout(() => doShow(), props.openDelay)
  } else {
    await doShow()
  }
}

const doShow = async () => {
  if (props.onBeforeShow) {
    emit('beforeShow')
    const canShow = await props.onBeforeShow()
    if (canShow === false) return
  } else {
    emit('beforeShow')
  }
  visible.value = true
  if (props.onAfterShow) props.onAfterShow()
  emit('afterShow')
}

// 隐藏
const hide = async () => {
  if (props.trigger === 'manual') return
  clearTimers()
  if (props.closeDelay > 0) {
    hideTimer = window.setTimeout(() => doHide(), props.closeDelay)
  } else {
    await doHide()
  }
}

const doHide = async () => {
  if (props.onBeforeHide) {
    emit('beforeHide')
    const canHide = await props.onBeforeHide()
    if (canHide === false) return
  } else {
    emit('beforeHide')
  }
  visible.value = false
  if (props.onAfterHide) props.onAfterHide()
  emit('afterHide')
}

const toggle = async () => {
  visible.value ? await hide() : await show()
}

// 事件
const handleMouseEnter = () => { if (props.trigger === 'hover') show() }
const handleMouseLeave = () => { if (props.trigger === 'hover') hide() }
const handleClick = () => { if (props.trigger === 'click') toggle() }
const handleFocus = () => { if (props.trigger === 'focus') show() }
const handleBlur = () => { if (props.trigger === 'focus') hide() }

// modelValue 监听
watch(() => props.modelValue, (val) => {
  if (props.trigger === 'manual') val ? show() : hide()
})
watch(visible, (val) => emit('update:modelValue', val))

// 点击外部关闭
const handleClickOutside = (e: MouseEvent) => {
  if (props.trigger !== 'click' || !visible.value) return
  if (
    triggerRef.value && !triggerRef.value.contains(e.target as Node) &&
    popperRef.value && !popperRef.value.contains(e.target as Node)
  ) {
    hide()
  }
}

// 页面滚动/resize 时关闭
const handleScroll = () => { if (visible.value) hide() }
const handleResize = () => { if (visible.value) hide() }

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
  clearTimers()
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', handleResize)
})

defineExpose({ show, hide, toggle })
</script>

<template>
  <div
    ref="triggerRef"
    :class="classes"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <slot />

    <Teleport to="body">
      <Transition :name="transition">
        <div
          v-if="visible || !destroyOnClose"
          v-show="visible"
          ref="popperRef"
          role="tooltip"
          :class="cn(
            'qy-tooltip absolute z-50 max-w-xs px-3 py-2 text-sm rounded-xl',
            'pointer-events-none',
            effect === 'dark'
              ? 'bg-slate-800 text-slate-100 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.4)] border border-slate-700/50'
              : 'bg-white text-slate-700 border border-slate-200/70 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.22)]',
            popperClass
          )"
          :style="popperStyle"
        >
          <div v-if="content || $slots.content">
            <slot name="content">{{ content }}</slot>
          </div>

          <!-- 箭头 -->
          <span
            v-if="showArrow"
            :class="cn(
              'qy-tooltip__arrow absolute border-[6px] border-transparent'
            )"
            :style="arrowStyle"
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.tooltip-fade-enter-to,
.tooltip-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
