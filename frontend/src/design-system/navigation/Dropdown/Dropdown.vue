<script setup lang="ts">
/**
 * QyDropdown 下拉菜单组件
 *
 * Apple 风格下拉菜单，支持 click/hover 触发、Teleport 浮层、
 * ESC 关闭、点击外部关闭
 */

import { ref, onMounted, onUnmounted, nextTick, useAttrs } from 'vue'
import { cn } from '../../utils/cn'
import type { QyDropdownProps, DropdownItem } from './types'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

const props = withDefaults(defineProps<QyDropdownProps>(), {
  trigger: 'click',
  placement: 'bottom-start',
  disabled: false,
})

const emit = defineEmits<{
  select: [key: string]
}>()

const visible = ref(false)
const triggerRef = ref<HTMLElement>()
const panelRef = ref<HTMLElement>()
const panelStyle = ref<Record<string, string>>({})

/** 计算面板位置 */
function computePosition() {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  const gap = 6
  let top = rect.bottom + gap
  let left: number | undefined
  let right: number | undefined

  if (props.placement === 'bottom-start') {
    left = rect.left
  } else if (props.placement === 'bottom-end') {
    right = window.innerWidth - rect.right
  } else {
    left = rect.left + rect.width / 2
  }

  panelStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    ...(left !== undefined && !right ? (props.placement === 'bottom' ? { left: `${left}px`, transform: 'translateX(-50%)' } : { left: `${left}px` }) : {}),
    ...(right !== undefined ? { right: `${right}px` } : {}),
    zIndex: '1000',
  }
}

function show() {
  if (props.disabled) return
  computePosition()
  visible.value = true
  nextTick(() => document.addEventListener('mousedown', onOutsideClick))
}

function hide() {
  visible.value = false
  document.removeEventListener('mousedown', onOutsideClick)
}

function toggle() {
  visible.value ? hide() : show()
}

function onItemClick(item: DropdownItem) {
  if (item.disabled) return
  emit('select', item.key)
  hide()
}

function onOutsideClick(e: MouseEvent) {
  const target = e.target as Node
  if (
    triggerRef.value?.contains(target) ||
    panelRef.value?.contains(target)
  ) {
    return
  }
  hide()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && visible.value) {
    hide()
  }
}

function onTriggerClick() {
  if (props.trigger === 'click') toggle()
}

function onTriggerEnter() {
  if (props.trigger === 'hover') show()
}

function onTriggerLeave() {
  if (props.trigger === 'hover') hide()
}

function onPanelEnter() {
  if (props.trigger === 'hover') show()
}

function onPanelLeave() {
  if (props.trigger === 'hover') hide()
}

/** 菜单项样式 */
function itemClasses(item: DropdownItem) {
  return cn(
    'flex items-center gap-3 px-3 py-2 text-sm cursor-pointer transition-colors duration-150 rounded-lg mx-1',
    {
      'text-red-500 hover:bg-red-50 active:bg-red-100': item.danger && !item.disabled,
      'hover:bg-gray-50 active:bg-gray-100': !item.danger && !item.disabled,
      'opacity-50 cursor-not-allowed': item.disabled,
    },
  )
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('mousedown', onOutsideClick)
})
</script>

<template>
  <!-- 触发器 — .stop 阻止冒泡到父元素（如卡片点击导航） -->
  <div
    ref="triggerRef"
    class="inline-flex"
    v-bind="attrs"
    @click.stop="onTriggerClick"
    @mousedown.stop
    @mouseenter="onTriggerEnter"
    @mouseleave="onTriggerLeave"
  >
    <slot />
  </div>

  <!-- 浮层面板 -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="visible"
        ref="panelRef"
        :style="panelStyle"
        :class="cn(
          'rounded-xl border border-gray-100 bg-white py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] min-w-[180px]',
        )"
        role="menu"
        @mouseenter="onPanelEnter"
        @mouseleave="onPanelLeave"
      >
        <template v-for="(item, idx) in items" :key="item.key">
          <div
            :class="itemClasses(item)"
            role="menuitem"
            :aria-disabled="item.disabled"
            @click="onItemClick(item)"
          >
            <!-- 图标 -->
            <span
              v-if="item.icon"
              :class="cn('w-4 h-4 shrink-0', item.icon)"
            />

            <!-- 文本 -->
            <span class="flex-1 truncate">{{ item.label }}</span>

            <!-- 快捷键 -->
            <span
              v-if="item.shortcut"
              class="ml-auto text-xs text-gray-400"
            >{{ item.shortcut }}</span>
          </div>

          <!-- 分隔线 -->
          <div
            v-if="item.divider && idx < items.length - 1"
            class="my-1 border-t border-gray-100"
            role="separator"
          />
        </template>
      </div>
    </Transition>
  </Teleport>
</template>
