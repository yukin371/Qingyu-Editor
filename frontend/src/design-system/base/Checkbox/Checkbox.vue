<script setup lang="ts">
/**
 * Checkbox 组件
 *
 * 单个复选框组件，支持布尔值和数组值两种模式
 */

import { computed, inject, ref, watch } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import { CHECKBOX_GROUP_KEY } from './contextKey'
import type { CheckboxProps, CheckboxEmits } from './types'

// 使用 CVA 定义复选框变体
const checkboxVariants = cva(
  // 基础样式
  'flex items-center gap-2 cursor-pointer transition-all duration-200 select-none',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed pointer-events-none',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      disabled: false,
    },
  }
)

// 复选框输入框样式
const checkboxInputVariants = cva(
  // 基础样式
  'relative flex-shrink-0 rounded border-2 transition-all duration-200 appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 checked:bg-current',
  {
    variants: {
      size: {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
      },
      color: {
        primary: 'border-slate-300 focus-visible:ring-primary-500 checked:border-primary-500 checked:bg-primary-500 dark:border-slate-600',
        success: 'border-slate-300 focus-visible:ring-success-500 checked:border-success-500 checked:bg-success-500 dark:border-slate-600',
        warning: 'border-slate-300 focus-visible:ring-warning-500 checked:border-warning-500 checked:bg-warning-500 dark:border-slate-600',
        danger: 'border-slate-300 focus-visible:ring-danger-500 checked:border-danger-500 checked:bg-danger-500 dark:border-slate-600',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'primary',
      disabled: false,
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<CheckboxProps>(), {
  disabled: false,
  indeterminate: false,
  size: 'md',
  color: 'primary',
})

// 组件 Emits
const emit = defineEmits<CheckboxEmits>()

// 注入组上下文
import type { CheckboxGroupContext } from './contextKey'

const groupContext = inject<CheckboxGroupContext | undefined>(CHECKBOX_GROUP_KEY, undefined)

// 是否在组中
const isInGroup = computed(() => groupContext !== undefined)

// 实际的 disabled、size 值（优先使用组的设置）
const actualDisabled = computed(() => isInGroup.value ? groupContext!.disabled.value : props.disabled)
const actualSize = computed(() => isInGroup.value ? groupContext!.size.value : props.size)

// 内部值（用于处理半选状态）
const indeterminate = ref(props.indeterminate)

// 监听 indeterminate prop 变化
watch(() => props.indeterminate, (newVal) => {
  indeterminate.value = newVal
})

// 判断是否为数组模式
const isArrayMode = computed(() => !isInGroup.value && Array.isArray(props.modelValue))

// 计算当前是否选中
const isChecked = computed(() => {
  if (isInGroup.value && props.value !== undefined && groupContext) {
    return groupContext.isChecked(props.value)
  }
  if (isArrayMode.value && props.value !== undefined) {
    return (props.modelValue as string[]).includes(String(props.value))
  }
  return Boolean(props.modelValue)
})

// 计算包装器样式类名
const wrapperClasses = computed(() =>
  cn(
    checkboxVariants({
      size: actualSize.value,
      disabled: actualDisabled.value,
    }),
    props.class
  )
)

// 计算输入框样式类名
const inputClasses = computed(() =>
  cn(
    checkboxInputVariants({
      size: actualSize.value,
      color: props.color,
      disabled: actualDisabled.value,
    })
  )
)

// 计算复选框图标尺寸
const iconSize = computed(() => {
  const sizeMap = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }
  return sizeMap[actualSize.value as keyof typeof sizeMap]
})

// 处理变化
const handleChange = (event: Event) => {
  if (actualDisabled.value) return

  const target = event.target as HTMLInputElement
  let newValue: boolean | string[]

  if (isInGroup.value && props.value !== undefined) {
    // 在组中，使用组的 toggle 方法
    groupContext!.toggle(props.value)
    return
  }

  if (isArrayMode.value) {
    // 数组模式
    const valueStr = String(props.value)
    newValue = props.modelValue as string[]
    
    if (target.checked) {
      newValue = [...newValue, valueStr]
    } else {
      newValue = newValue.filter(v => v !== valueStr)
    }
  } else {
    // 布尔模式
    newValue = target.checked
  }

  emit('update:modelValue', newValue)
  emit('change', newValue)
}

// 引用 input 元素
const inputRef = ref<HTMLInputElement>()

// 设置 indeterminate 状态
watch([isChecked, indeterminate, inputRef], ([checked, indet, ref]) => {
  if (ref) {
    ref.indeterminate = indet && !checked
  }
}, { immediate: true })
</script>

<template>
  <label :class="wrapperClasses">
    <!-- 复选框输入 -->
    <input
      ref="inputRef"
      type="checkbox"
      :class="inputClasses"
      :checked="isChecked"
      :disabled="disabled"
      :value="value"
      @change="handleChange"
    />

    <!-- 选中状态图标 -->
    <svg
      v-if="isChecked"
      :class="iconSize"
      class="absolute pointer-events-none text-white"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clip-rule="evenodd"
      />
    </svg>

    <!-- 半选状态图标 -->
    <svg
      v-else-if="indeterminate"
      :class="iconSize"
      class="absolute pointer-events-none text-white"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
        clip-rule="evenodd"
      />
    </svg>

    <!-- 标签文本 -->
    <span v-if="label" :class="{ 'text-slate-400 dark:text-slate-500': actualDisabled }">
      <slot>{{ label }}</slot>
    </span>
    <slot v-else />
  </label>
</template>
