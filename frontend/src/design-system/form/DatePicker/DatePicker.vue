<script setup lang="ts">
/**
 * DatePicker 组件
 *
 * 日期选择器组件，支持单日期和日期范围选择
 */

import { computed, ref } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import Icon from '../../base/Icon/Icon.vue'
import type { DatePickerProps, DatePickerEmits, DatePickerValue } from './types'

// 使用 CVA 定义 DatePicker 变体
const datePickerVariants = cva(
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
        true: 'border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.16)]',
        false: 'border-slate-300 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(14,165,233,0.16)]',
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
const props = withDefaults(defineProps<DatePickerProps>(), {
  type: 'date',
  size: 'md',
  disabled: false,
  readonly: false,
  error: false,
  clearable: false,
  showPrefix: true,
  suffix: undefined,
  showSuffix: false,
  placement: 'bottom-start',
  showTime: false,
  timeFormat: 'HH:mm:ss',
  showToday: false,
})

// 组件 Emits
const emit = defineEmits<DatePickerEmits>()

// 内部状态
const isFocused = ref(false)
const startDateRef = ref<HTMLInputElement>()

// 计算输入框样式类名
const inputClasses = computed(() =>
  cn(
    datePickerVariants({
      size: props.size,
      error: props.error,
      disabled: props.disabled,
    }),
    {
      'pl-10': props.showPrefix && props.prefix,
      'pr-10': props.clearable,
    },
    props.class
  )
)

// 计算包装器样式
const wrapperClasses = computed(() => {
  const base = 'relative w-full'
  return base
})

// 计算是否显示清空按钮
const showClearButton = computed(() => {
  return (
    props.clearable &&
    !props.disabled &&
    !props.readonly &&
    props.modelValue !== null &&
    props.modelValue !== undefined
  )
})

// 计算占位符
const computedPlaceholder = computed(() => {
  if (props.placeholder) {
    return props.placeholder
  }

  const placeholders: Record<string, string | string[]> = {
    date: '选择日期',
    daterange: ['开始日期', '结束日期'],
    datetime: '选择日期时间',
    datetimerange: ['开始时间', '结束时间'],
  }

  return placeholders[props.type] || '选择日期'
})

// 计算输入类型
const inputType = computed(() => {
  if (props.type === 'datetime' || props.type === 'datetimerange') {
    return 'datetime-local'
  }
  return 'date'
})

// 格式化日期为字符串
const formatDateToString = (date: Date | string): string => {
  if (typeof date === 'string') {
    return date
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  if (props.type === 'datetime' || props.type === 'datetimerange') {
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
  }

  return `${year}-${month}-${day}`
}

// 格式化字符串为日期
const formatStringToDate = (value: string): Date => {
  return new Date(value)
}

// 计算当前显示值
const displayValue = computed(() => {
  const value = props.modelValue

  if (!value) {
    return ''
  }

  if (props.type === 'daterange' || props.type === 'datetimerange') {
    if (Array.isArray(value) && value.length === 2) {
      return [formatDateToString(value[0]), formatDateToString(value[1])]
    }
    return ['', '']
  }

  return formatDateToString(value as Date | string)
})

// 计算最小和最大日期
const minDateAttr = computed(() => {
  if (!props.minDate) return undefined
  return formatDateToString(props.minDate)
})

const maxDateAttr = computed(() => {
  if (!props.maxDate) return undefined
  return formatDateToString(props.maxDate)
})

// 获取插槽
const slots = defineSlots<{
  prefix?: () => any
  suffix?: () => any
}>()

// 处理输入
const handleInput = (event: Event, index?: number) => {
  const target = event.target as HTMLInputElement
  const value = target.value

  if (!value) {
    emit('update:modelValue', null)
    emit('change', null)
    return
  }

  let newValue: DatePickerValue

  if (props.type === 'daterange' || props.type === 'datetimerange') {
    const currentArray = Array.isArray(displayValue.value) ? displayValue.value : ['', '']
    const newArray = [...currentArray] as [string, string]
    newArray[index!] = value

    // 只有当两个值都有时才更新
    if (newArray[0] && newArray[1]) {
      newValue = [formatStringToDate(newArray[0]), formatStringToDate(newArray[1])]
    } else {
      newValue = null
    }
  } else {
    newValue = formatStringToDate(value)
  }

  emit('update:modelValue', newValue)
  emit('change', newValue)
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

// 处理清空
const handleClear = () => {
  emit('update:modelValue', null)
  emit('change', null)
  emit('clear')

  // 清空后重新聚焦
  if (startDateRef.value) {
    startDateRef.value.focus()
  }
}

// 快捷选项处理
const handleShortcutClick = (shortcut: { text: string; value: Date | (() => Date) | [Date, Date] | (() => [Date, Date]) }) => {
  if (props.disabled) return
  const value = typeof shortcut.value === 'function' ? shortcut.value() : shortcut.value
  emit('update:modelValue', value as DatePickerValue)
  emit('change', value as DatePickerValue)
}

// 暴露方法
defineExpose({
  focus: () => startDateRef.value?.focus(),
  blur: () => startDateRef.value?.blur(),
})
</script>

<template>
  <div :class="wrapperClasses">
    <!-- 快捷选项 -->
    <div v-if="shortcuts && shortcuts.length > 0" class="mb-2 flex flex-wrap gap-2">
      <button
        v-for="(shortcut, index) in shortcuts"
        :key="index"
        type="button"
        class="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
        :disabled="disabled"
        @click="handleShortcutClick(shortcut)"
      >
        {{ shortcut.text }}
      </button>
    </div>

    <!-- 单日期选择器 -->
    <template v-if="type === 'date' || type === 'datetime'">
      <div class="relative">
        <!-- 前缀图标 -->
        <div
          v-if="showPrefix && prefix"
          class="absolute left-0 top-0 h-full flex items-center justify-center pl-3 pointer-events-none text-slate-400"
        >
          <slot name="prefix">
            <Icon :name="prefix as any" :size="size === 'sm' ? 'xs' : size === 'lg' ? 'sm' : 'sm'" />
          </slot>
        </div>

        <!-- 日期输入框 -->
        <input
          ref="startDateRef"
          :type="inputType"
          :class="inputClasses"
          :placeholder="computedPlaceholder as string"
          :disabled="disabled"
          :readonly="readonly"
          :value="displayValue"
          :min="minDateAttr"
          :max="maxDateAttr"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
        />

        <!-- 后缀图标/插槽和清空按钮 -->
        <div class="absolute right-0 top-0 h-full flex items-center pr-3 gap-1">
          <!-- 后缀图标/插槽 -->
          <div v-if="showSuffix && (suffix || slots.suffix)" class="flex items-center text-slate-400">
            <slot name="suffix">
              <Icon :name="suffix as any" :size="size === 'sm' ? 'xs' : size === 'lg' ? 'sm' : 'sm'" />
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
        </div>
      </div>
    </template>

    <!-- 日期范围选择器 -->
    <template v-else-if="type === 'daterange' || type === 'datetimerange'">
      <div class="flex items-center gap-2">
        <!-- 开始日期 -->
        <div class="relative flex-1">
          <!-- 前缀图标 -->
          <div
            v-if="showPrefix && prefix"
            class="absolute left-0 top-0 h-full flex items-center justify-center pl-3 pointer-events-none text-slate-400"
          >
            <slot name="prefix">
              <Icon :name="prefix as any" :size="size === 'sm' ? 'xs' : size === 'lg' ? 'sm' : 'sm'" />
            </slot>
          </div>

          <!-- 开始日期输入框 -->
          <input
            ref="startDateRef"
            :type="inputType"
            :class="inputClasses"
            :placeholder="(computedPlaceholder as string[])[0] || '开始日期'"
            :disabled="disabled"
            :readonly="readonly"
            :value="(displayValue as string[])[0]"
            :min="minDateAttr"
            :max="maxDateAttr"
            @input="handleInput($event, 0)"
            @focus="handleFocus"
            @blur="handleBlur"
          />
        </div>

        <!-- 分隔符 -->
        <span class="text-slate-400">至</span>

        <!-- 结束日期 -->
        <div class="relative flex-1">
          <!-- 结束日期输入框 -->
          <input
            ref="_endDateRef"
            :type="inputType"
            :class="inputClasses"
            :placeholder="(computedPlaceholder as string[])[1] || '结束日期'"
            :disabled="disabled"
            :readonly="readonly"
            :value="(displayValue as string[])[1]"
            :min="minDateAttr"
            :max="maxDateAttr"
            @input="handleInput($event, 1)"
            @focus="handleFocus"
            @blur="handleBlur"
          />

          <!-- 清空按钮 -->
          <div class="absolute right-0 top-0 h-full flex items-center pr-3">
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
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
