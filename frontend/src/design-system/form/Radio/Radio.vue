<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
/**
 * Radio 组件
 *
 * 单选框组件，支持标准模式和按钮模式
 */

import { computed, inject } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { RadioProps, RadioEmits, RadioSize } from './types'

// 使用 CVA 定义单选框变体
const radioVariants = cva(
  // 基础样式
  'relative inline-flex items-center justify-center cursor-pointer transition-all duration-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
      button: {
        true: '',
        false: '',
      },
      checked: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      // 按钮模式样式
      {
        button: true,
        checked: true,
        size: 'sm',
        class: 'bg-primary-500 text-white border-primary-500 hover:bg-primary-600 active:bg-primary-700',
      },
      {
        button: true,
        checked: false,
        size: 'sm',
        class: 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 dark:hover:border-slate-500',
      },
      {
        button: true,
        checked: true,
        size: 'md',
        class: 'bg-primary-500 text-white border-primary-500 hover:bg-primary-600 active:bg-primary-700',
      },
      {
        button: true,
        checked: false,
        size: 'md',
        class: 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 dark:hover:border-slate-500',
      },
      {
        button: true,
        checked: true,
        size: 'lg',
        class: 'bg-primary-500 text-white border-primary-500 hover:bg-primary-600 active:bg-primary-700',
      },
      {
        button: true,
        checked: false,
        size: 'lg',
        class: 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 dark:hover:border-slate-500',
      },
    ],
    defaultVariants: {
      size: 'md',
      button: false,
      checked: false,
    },
  }
)

// 按钮模式尺寸变体
const buttonSizeVariants = cva(
  'border rounded-md font-medium',
  {
    variants: {
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-11 px-6 text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<RadioProps>(), {
  disabled: false,
  size: 'md',
  button: false,
})

// 组件 Emits
const emit = defineEmits<RadioEmits>()

// 从 RadioGroup 注入的属性
const groupProps = inject<{
  disabled?: boolean
  size?: RadioSize
  button?: boolean
  modelValue?: string | number | boolean
  updateModelValue?: (value: string | number | boolean) => void
}>('radioGroup', {})

// 计算实际属性（优先使用自身属性，否则使用组属性）
const actualDisabled = computed(() => props.disabled || groupProps.disabled || false)
const actualSize = computed(() => props.size || groupProps.size || 'md')
const actualButton = computed(() => props.button !== undefined ? props.button : (groupProps.button || false))
const actualModelValue = computed(() => groupProps.modelValue !== undefined ? groupProps.modelValue : props.modelValue)

// 计算是否选中
const isChecked = computed(() => actualModelValue.value === props.value)

// 计算样式类名
const classes = computed(() => {
  if (actualButton.value) {
    return cn(
      buttonSizeVariants({ size: actualSize.value }),
      radioVariants({
        size: actualSize.value,
        button: true,
        checked: isChecked.value,
      }),
      props.class
    )
  }
  return cn(
    radioVariants({
      size: actualSize.value,
      button: false,
      checked: isChecked.value,
    }),
    props.class
  )
})

// 单选框输入样式
const inputClasses = computed(() => {
  if (actualButton.value) {
    return 'sr-only' // 按钮模式隐藏原生 input
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return cn(
    'appearance-none border rounded-full transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500',
    'checked:border-primary-500 checked:bg-primary-500',
    'disabled:cursor-not-allowed disabled:opacity-50',
    sizeClasses[actualSize.value],
    isChecked.value ? 'border-primary-500' : 'border-slate-300 dark:border-slate-600'
  )
})

// 标签样式
const labelClasses = computed(() => {
  if (actualButton.value) {
    return '' // 按钮模式不需要额外标签样式
  }

  return cn(
    'ml-2 cursor-pointer select-none',
    actualDisabled.value ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'
  )
})

// 单选框内部圆点样式
const dotSizeClasses = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
}

const dotClasses = computed(() =>
  cn(
    'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white transition-all duration-200',
    dotSizeClasses[actualSize.value],
    isChecked.value ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
  )
)

// 更新值
const updateValue = () => {
  if (!actualDisabled.value && props.value !== undefined) {
    if (groupProps.updateModelValue) {
      groupProps.updateModelValue(props.value)
    } else {
      emit('update:modelValue', props.value)
    }
    emit('change', props.value)
  }
}
</script>

<template>
  <label
    :class="cn(
      'inline-flex items-center',
      actualButton ? '' : 'cursor-pointer',
      actualDisabled && 'cursor-not-allowed opacity-50'
    )"
  >
    <!-- 按钮模式 -->
    <template v-if="actualButton">
      <input
        type="radio"
        :class="'sr-only'"
        :checked="isChecked"
        :disabled="actualDisabled"
        :value="props.value"
        @change="updateValue"
      >
      <span :class="classes">
        <slot>{{ label }}</slot>
      </span>
    </template>

    <!-- 标准模式 -->
    <template v-else>
      <input
        type="radio"
        :class="inputClasses"
        :checked="isChecked"
        :disabled="actualDisabled"
        :value="props.value"
        @change="updateValue"
      >
      <!-- 选中状态的小圆点 -->
      <span v-if="isChecked" :class="dotClasses"></span>

      <!-- 标签 -->
      <span v-if="label || $slots.default" :class="labelClasses">
        <slot>{{ label }}</slot>
      </span>
    </template>
  </label>
</template>
