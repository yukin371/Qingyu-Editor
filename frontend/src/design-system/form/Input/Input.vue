<script setup lang="ts">
/**
 * Input 组件
 *
 * 功能完整的输入框组件，支持多种类型、尺寸和状态
 */

import { computed, ref } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import Icon from '../../base/Icon/Icon.vue'
import type { IconName } from '../../base/Icon/types'
import type { InputProps, InputEmits } from './types'

// 使用 CVA 定义 Input 变体
const inputVariants = cva(
  // 基础样式
  'w-full rounded-lg border transition-all duration-200 bg-white placeholder:text-slate-400 focus:outline-none',
  {
    variants: {
      size: {
        sm: 'h-8 px-2 py-1 text-sm',
        md: 'h-10 px-3 py-2 text-base',
        lg: 'h-12 px-4 py-3 text-lg',
      },
      error: {
        true: 'border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]',
        false: 'border-slate-300 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]',
      },
      disabled: {
        true: 'bg-slate-100 cursor-not-allowed opacity-60',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      error: false,
      disabled: false,
    },
  }
)

// 图标尺寸映射
const iconSizes: Record<string, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

// 组件 Props
const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  size: 'md',
  disabled: false,
  readonly: false,
  error: false,
  showCount: false,
  clearable: false,
})

// 组件 Emits
const emit = defineEmits<InputEmits>()

// 内部状态
const isFocused = ref(false)
const inputRef = ref<HTMLInputElement>()

// 计算输入框样式类名
const inputClasses = computed(() =>
  cn(
    inputVariants({
      size: props.size,
      error: props.error,
      disabled: props.disabled,
    }),
    {
      'pl-10': props.prefix || slots.prefix,
      'pr-10': props.suffix || slots.suffix || props.clearable,
      'pr-16': (props.suffix || slots.suffix) && props.clearable,
    },
    props.class
  )
)

// 计算包装器样式
const wrapperClasses = computed(() => {
  const base = 'relative w-full'
  
  if (slots.prepend || slots.append) {
    return cn(base, 'flex')
  }
  
  return base
})

// 计算是否显示清空按钮
const showClearButton = computed(() => {
  return props.clearable && !props.disabled && !props.readonly && props.modelValue !== '' && props.modelValue !== undefined && props.modelValue !== null
})

// 计算当前值长度
const currentValueLength = computed(() => {
  const value = props.modelValue
  if (value === undefined || value === null) return 0
  return String(value).length
})

// 获取插槽
const slots = defineSlots<{
  prefix?: () => any
  suffix?: () => any
  prepend?: () => any
  append?: () => any
}>()

// 处理输入
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value: string | number = target.value
  
  // 处理数字类型
  if (props.type === 'number') {
    value = target.value === '' ? '' : Number(target.value)
  }
  
  emit('update:modelValue', value)
}

// 处理焦点
const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

// 处理失焦
const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

// 处理值改变
const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value: string | number = target.value
  
  if (props.type === 'number') {
    value = target.value === '' ? '' : Number(target.value)
  }
  
  emit('change', value)
}

// 处理清空
const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  
  // 清空后重新聚焦
  if (inputRef.value) {
    inputRef.value.focus()
  }
}

// 暴露方法
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
})
</script>

<template>
  <div :class="wrapperClasses">
    <!-- 前置插槽 -->
    <div
      v-if="slots.prepend"
      class="inline-flex items-center px-3 bg-slate-50 border border-r-0 border-slate-300 rounded-l-lg text-slate-500 text-sm"
    >
      <slot name="prepend" />
    </div>

    <!-- 输入框包装器 -->
    <div class="relative flex-1">
      <!-- 前缀图标/插槽 -->
      <div
        v-if="prefix || slots.prefix"
        class="absolute left-0 top-0 h-full flex items-center justify-center pl-3 pointer-events-none text-slate-400"
      >
        <slot name="prefix">
          <Icon :name="prefix as IconName" :size="size === 'sm' ? 'xs' : size === 'lg' ? 'sm' : 'sm'" />
        </slot>
      </div>

      <!-- 输入框 -->
      <input
        ref="inputRef"
        :type="type"
        :class="inputClasses"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :value="modelValue"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
      />

      <!-- 后缀图标/插槽和清空按钮 -->
      <div class="absolute right-0 top-0 h-full flex items-center pr-3 gap-1">
        <!-- 后缀图标/插槽 -->
        <div v-if="suffix || slots.suffix" class="flex items-center text-slate-400">
          <slot name="suffix">
            <Icon :name="suffix as IconName" :size="size === 'sm' ? 'xs' : size === 'lg' ? 'sm' : 'sm'" />
          </slot>
        </div>

        <!-- 清空按钮 -->
        <button
          v-if="showClearButton"
          type="button"
          class="flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded hover:bg-slate-100 focus:outline-none focus:shadow-[0_0_0_3px_rgba(14,165,233,0.16)]"
          :class="iconSizes[size]"
          @click="handleClear"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- 字数统计 -->
        <span
          v-if="showCount && maxlength"
          class="text-xs text-slate-400 ml-2 select-none"
          :class="{ 'text-red-500': currentValueLength > maxlength }"
        >
          {{ currentValueLength }}/{{ maxlength }}
        </span>
      </div>
    </div>

    <!-- 后置插槽 -->
    <div
      v-if="slots.append"
      class="inline-flex items-center px-3 bg-slate-50 border border-l-0 border-slate-300 rounded-r-lg text-slate-500 text-sm"
    >
      <slot name="append" />
    </div>
  </div>
</template>
