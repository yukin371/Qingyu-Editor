<script setup lang="ts">
/**
 * QySelect 下拉选择器
 *
 * Apple + Material 3 风格基础选择器，保持 API 兼容，
 * 用于承接历史选择器的常见交互场景。
 */

import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { cn } from '../../utils/cn'
import type { SelectProps, SelectEmits, SelectOption } from './types'

const props = withDefaults(defineProps<SelectProps>(), {
  placeholder: '请选择',
  disabled: false,
  clearable: false,
  size: 'md',
  options: () => [],
})

const emit = defineEmits<SelectEmits>()

const triggerRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()
const isOpen = ref(false)
const isFocused = ref(false)
const highlightedIndex = ref(-1)
const dropdownStyle = ref<Record<string, string>>({})

const triggerId = `qy-select-trigger-${Math.random().toString(36).slice(2)}`
const dropdownId = `qy-select-dropdown-${Math.random().toString(36).slice(2)}`

const sizeClasses: Record<string, string> = {
  sm: 'min-h-[38px] px-3.5 text-sm',
  md: 'min-h-[44px] px-4 text-[15px]',
  lg: 'min-h-[52px] px-5 text-base',
}

const selectedOption = computed(() =>
  props.options.find((option) => option.value === props.modelValue),
)

const selectedIndex = computed(() =>
  props.options.findIndex((option) => option.value === props.modelValue),
)

const hasValue = computed(() => props.modelValue !== undefined && props.modelValue !== '')

const activeDescendant = computed(() =>
  isOpen.value && highlightedIndex.value >= 0
    ? `${dropdownId}-option-${highlightedIndex.value}`
    : undefined,
)

const triggerClasses = computed(() =>
  cn(
    'surface-control group flex w-full items-center justify-between gap-3 text-left',
    'transition-[border-color,box-shadow,background-color,transform] duration-200',
    sizeClasses[props.size],
    {
      'hover:border-[var(--color-line-strong)] hover:bg-white': !props.disabled && !isOpen.value,
      'border-primary-400/70 bg-white ring-brand':
        !props.disabled && (isOpen.value || isFocused.value),
      'cursor-not-allowed opacity-55': props.disabled,
    },
    props.class,
  ),
)

const getOptionId = (index: number) => `${dropdownId}-option-${index}`

const getEnabledIndex = (start: number, step: 1 | -1) => {
  if (!props.options.length) {
    return -1
  }

  let current = start
  for (let count = 0; count < props.options.length; count += 1) {
    current = (current + step + props.options.length) % props.options.length
    if (!props.options[current].disabled) {
      return current
    }
  }

  return -1
}

const updatePosition = () => {
  if (!triggerRef.value) {
    return
  }

  const rect = triggerRef.value.getBoundingClientRect()
  const gap = 10
  const estimatedHeight = Math.min(Math.max(props.options.length, 1) * 44 + 20, 280)
  const showAbove =
    rect.bottom + estimatedHeight + gap > window.innerHeight && rect.top > window.innerHeight / 2

  dropdownStyle.value = {
    position: 'fixed',
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    top: showAbove
      ? `${Math.max(12, rect.top - estimatedHeight - gap)}px`
      : `${rect.bottom + gap}px`,
    zIndex: '1000',
  }
}

const scrollHighlightedIntoView = () => {
  if (highlightedIndex.value < 0) {
    return
  }

  nextTick(() => {
    const optionEl = document.getElementById(getOptionId(highlightedIndex.value))
    optionEl?.scrollIntoView({ block: 'nearest' })
  })
}

const openDropdown = async () => {
  if (props.disabled || isOpen.value) {
    return
  }

  isOpen.value = true
  highlightedIndex.value = selectedIndex.value >= 0 ? selectedIndex.value : getEnabledIndex(-1, 1)

  await nextTick()
  updatePosition()
  scrollHighlightedIntoView()
}

const closeDropdown = () => {
  isOpen.value = false
  highlightedIndex.value = -1
}

const toggleOpen = async () => {
  if (isOpen.value) {
    closeDropdown()
    return
  }

  await openDropdown()
}

const selectOption = (option: SelectOption) => {
  if (option.disabled) {
    return
  }

  emit('update:modelValue', option.value)
  emit('change', option.value)
  closeDropdown()
}

const handleClear = (event: MouseEvent) => {
  event.stopPropagation()
  emit('update:modelValue', '')
  emit('change', '')
  closeDropdown()
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (triggerRef.value?.contains(target) || dropdownRef.value?.contains(target)) {
    return
  }

  closeDropdown()
}

const handleTriggerKeydown = async (event: KeyboardEvent) => {
  if (props.disabled) {
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value) {
        await openDropdown()
      } else {
        highlightedIndex.value = getEnabledIndex(highlightedIndex.value, 1)
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (!isOpen.value) {
        await openDropdown()
      } else {
        highlightedIndex.value = getEnabledIndex(highlightedIndex.value, -1)
      }
      break
    case 'Enter':
    case ' ': {
      event.preventDefault()
      if (!isOpen.value) {
        await openDropdown()
      } else if (highlightedIndex.value >= 0) {
        selectOption(props.options[highlightedIndex.value])
      }
      break
    }
    case 'Home':
    case 'PageUp':
      event.preventDefault()
      highlightedIndex.value = getEnabledIndex(-1, 1)
      break
    case 'End':
    case 'PageDown':
      event.preventDefault()
      highlightedIndex.value = getEnabledIndex(0, -1)
      break
    case 'Escape':
      event.preventDefault()
      closeDropdown()
      break
    case 'Tab':
      closeDropdown()
      break
  }
}

watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('mousedown', handleClickOutside, true)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
  } else {
    document.removeEventListener('mousedown', handleClickOutside, true)
    window.removeEventListener('resize', updatePosition)
    window.removeEventListener('scroll', updatePosition, true)
  }
})

watch(highlightedIndex, () => {
  scrollHighlightedIntoView()
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside, true)
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
})
</script>

<template>
  <div class="relative w-full">
    <div
      :id="triggerId"
      ref="triggerRef"
      :class="triggerClasses"
      :tabindex="disabled ? -1 : 0"
      role="combobox"
      aria-autocomplete="none"
      :aria-expanded="isOpen"
      :aria-controls="dropdownId"
      :aria-activedescendant="activeDescendant"
      :aria-disabled="disabled"
      @click="toggleOpen"
      @keydown="handleTriggerKeydown"
      @focus="isFocused = true"
      @blur="isFocused = false"
    >
      <span class="min-w-0 flex-1 truncate" :class="hasValue ? 'text-slate-900' : 'text-slate-400'">
        {{ selectedOption ? selectedOption.label : placeholder }}
      </span>

      <span class="ml-2 flex shrink-0 items-center gap-2">
        <button
          v-if="clearable && hasValue && !disabled"
          type="button"
          class="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-slate-400 transition-all duration-150 hover:-translate-y-px hover:border-slate-300 hover:text-slate-700"
          @click="handleClear"
          @mousedown.stop
        >
          <svg
            class="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <svg
          class="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:text-slate-600"
          :class="{ 'rotate-180': isOpen }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition-[opacity,transform] duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-1 scale-[0.98]"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-[opacity,transform] duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-1 scale-[0.98]"
      >
        <div
          v-if="isOpen"
          :id="dropdownId"
          ref="dropdownRef"
          :style="dropdownStyle"
          class="surface-floating overflow-hidden py-2"
        >
          <div v-if="options.length === 0" class="px-4 py-6 text-center text-sm text-slate-400">
            暂无数据
          </div>

          <ul
            v-else
            role="listbox"
            :aria-labelledby="triggerId"
            class="max-h-64 overflow-y-auto px-2"
          >
            <li
              v-for="(option, index) in options"
              :id="getOptionId(index)"
              :key="option.value"
              role="option"
              :aria-selected="option.value === modelValue"
              class="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors duration-150"
              :class="{
                'bg-primary-500/12 text-primary-700': option.value === modelValue,
                'bg-slate-100 text-slate-900':
                  highlightedIndex === index && option.value !== modelValue && !option.disabled,
                'text-slate-700 hover:bg-slate-100/90':
                  !option.disabled && highlightedIndex !== index && option.value !== modelValue,
                'cursor-not-allowed opacity-45': option.disabled,
              }"
              @mouseenter="!option.disabled && (highlightedIndex = index)"
              @click="selectOption(option)"
            >
              <span class="flex-1 truncate">{{ option.label }}</span>

              <svg
                v-if="option.value === modelValue"
                class="ml-auto h-4 w-4 shrink-0 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
