<script setup lang="ts">
/**
 * Switch 组件
 *
 * 开关切换组件，支持多种尺寸、颜色和状态
 */

import { computed, ref } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { SwitchProps, SwitchEmits } from './types'

// 使用 CVA 定义 Switch 变体
const switchVariants = cva(
  // 基础样式
  'relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
        lg: 'h-7 w-13',
      },
      checked: {
        true: '',
        false: 'bg-slate-200 dark:bg-slate-700',
      },
      color: {
        primary: 'focus-visible:ring-primary-500',
        success: 'focus-visible:ring-success-DEFAULT',
        warning: 'focus-visible:ring-warning-DEFAULT',
        danger: 'focus-visible:ring-danger-DEFAULT',
      },
    },
    compoundVariants: [
      // 选中状态的颜色变体
      {
        checked: true,
        color: 'primary',
        class: 'bg-primary-500',
      },
      {
        checked: true,
        color: 'success',
        class: 'bg-success-DEFAULT',
      },
      {
        checked: true,
        color: 'warning',
        class: 'bg-warning-DEFAULT',
      },
      {
        checked: true,
        color: 'danger',
        class: 'bg-danger-DEFAULT',
      },
    ],
    defaultVariants: {
      size: 'md',
      color: 'primary',
      checked: false,
    },
  }
)

// Switch 滑块变体
const switchThumbVariants = cva(
  // 基础样式
  'pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 data-[state=checked]:translate-x-4',
        md: 'h-5 w-5 data-[state=checked]:translate-x-5',
        lg: 'h-6 w-6 data-[state=checked]:translate-x-6',
      },
      checked: {
        true: '',
        false: 'translate-x-0',
      },
    },
    defaultVariants: {
      size: 'md',
      checked: false,
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<SwitchProps>(), {
  modelValue: false,
  disabled: false,
  loading: false,
  size: 'md',
  color: 'primary',
  activeValue: true,
  inactiveValue: false,
})

// 组件 Emits
const emit = defineEmits<SwitchEmits>()

// 内部加载状态
const isLoading = ref(false)

// 计算是否选中
const isChecked = computed(() => props.modelValue === props.activeValue)

// 计算是否禁用（disabled、loading 或内部加载中）
const isDisabled = computed(() => props.disabled || props.loading || isLoading.value)

// 计算样式类名
const classes = computed(() =>
  cn(
    switchVariants({
      size: props.size,
      checked: isChecked.value,
      color: props.color,
    }),
    props.class
  )
)

// 计算滑块样式类名
const thumbClasses = computed(() =>
  switchThumbVariants({
    size: props.size,
    checked: isChecked.value,
  })
)

// 切换处理
const handleChange = async (event: MouseEvent) => {
  if (isDisabled.value) {
    event.preventDefault()
    return
  }

  // 触发点击事件
  emit('click', event)

  // 如果有 beforeChange 回调，先执行
  if (props.beforeChange) {
    try {
      isLoading.value = true
      const result = await props.beforeChange()
      if (result === false) {
        isLoading.value = false
        return
      }
    } catch (error) {
      isLoading.value = false
      return
    }
  }

  // 切换值
  const newValue = isChecked.value ? props.inactiveValue : props.activeValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
  isLoading.value = false
}
</script>

<template>
  <div class="inline-flex items-center gap-2">
    <!-- Label（如果在前面） -->
    <span
      v-if="label && !$slots.label"
      class="text-sm font-medium text-slate-700 dark:text-slate-300"
    >
      {{ label }}
    </span>
    <slot v-else-if="label || $slots.label" name="label">
      <span
        v-if="label"
        class="text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {{ label }}
      </span>
    </slot>

    <!-- Switch 按钮 -->
    <button
      type="button"
      role="switch"
      :class="classes"
      :aria-checked="isChecked"
      :aria-disabled="isDisabled"
      :aria-label="label || 'Switch'"
      :disabled="isDisabled"
      @click="handleChange"
    >
      <!-- 滑块 -->
      <span
        :class="thumbClasses"
        :data-state="isChecked ? 'checked' : 'unchecked'"
        aria-hidden="true"
      >
        <!-- 选中时内容（可选） -->
        <span
          v-if="$slots.active && isChecked"
          class="absolute inset-0 flex items-center justify-center"
        >
          <slot name="active" />
        </span>

        <!-- 未选中时内容（可选） -->
        <span
          v-if="$slots.inactive && !isChecked"
          class="absolute inset-0 flex items-center justify-center"
        >
          <slot name="inactive" />
        </span>
      </span>

      <!-- 加载状态指示器 -->
      <svg
        v-if="loading || isLoading"
        class="absolute inset-0 m-auto h-4 w-4 animate-spin text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </button>

    <!-- Active/Inactive 文本（如果在后面） -->
    <span
      v-if="activeText || inactiveText"
      class="text-sm text-slate-600 dark:text-slate-400"
    >
      {{ isChecked ? (activeText ?? '') : (inactiveText ?? '') }}
    </span>
  </div>
</template>
