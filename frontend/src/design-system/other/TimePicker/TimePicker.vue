<script setup lang="ts">
/**
 * TimePicker 组件
 *
 * 时间选择器组件，支持单时间和时间范围选择
 */

import { computed, ref } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import Icon from '../../base/Icon/Icon.vue'
import type { TimePickerProps, TimePickerEmits, TimePickerValue } from './types'
import {
  parseTime,
  formatTime,
  isValidTime,
  isTimeInDisabledRanges,
  isHourDisabled,
  isMinuteDisabled,
  isSecondDisabled,
} from './utils'

// 使用 CVA 定义 TimePicker 变体
const timePickerVariants = cva(
  // 基础样式
  'w-full rounded-lg border transition-all duration-200 bg-white placeholder:text-slate-400 focus:outline-none',
  {
    variants: {
      size: {
        sm: 'h-8 px-2 py-1 text-sm',
        md: 'h-10 px-3 py-2 text-base',
        lg: 'h-12 px-4 py-3 text-lg',
      },
      disabled: {
        true: 'bg-slate-100 cursor-not-allowed opacity-60',
        false: '',
      },
    },
    compoundVariants: [
      {
        disabled: false,
        class: 'border-slate-300 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(14,165,233,0.16)]',
      },
    ],
    defaultVariants: {
      size: 'md',
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
const props = withDefaults(defineProps<TimePickerProps>(), {
  size: 'md',
  disabled: false,
  readonly: false,
  editable: true,
  clearable: false,
  isRange: false,
  rangeSeparator: '-',
  format: 'HH:mm:ss',
  step: () => ({ hour: 1, minute: 1, second: 1 }),
  showPrefix: true,
})

// 组件 Emits
const emit = defineEmits<TimePickerEmits>()

// 内部状态
const isFocused = ref(false)
const startTimeInputRef = ref<HTMLInputElement>()

// 计算输入框样式类名
const inputClasses = computed(() =>
  cn(
    timePickerVariants({
      size: props.size,
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

  const defaultPlaceholder = '选择时间'
  const rangePlaceholders = ['开始时间', '结束时间']

  return props.isRange ? rangePlaceholders : defaultPlaceholder
})

// 验证时间是否可用
const isTimeAvailable = (time: string): boolean => {
  // 检查是否在时间限制范围内
  if (props.start && compareTimes(time, props.start) < 0) {
    return false
  }

  if (props.end && compareTimes(time, props.end) > 0) {
    return false
  }

  // 检查是否在禁用时间段内
  if (props.disabledTimeRanges && isTimeInDisabledRanges(time, props.disabledTimeRanges, props.format)) {
    return false
  }

  const parsed = parseTime(time, props.format)
  if (!parsed) {
    return false
  }

  // 检查小时、分钟、秒是否被禁用
  if (isHourDisabled(parsed.hour, props.disabledHours)) {
    return false
  }

  if (isMinuteDisabled(parsed.hour, parsed.minute, props.disabledMinutes)) {
    return false
  }

  if (isSecondDisabled(parsed.hour, parsed.minute, parsed.second, props.disabledSeconds)) {
    return false
  }

  return true
}

// 比较两个时间
const compareTimes = (time1: string, time2: string): number => {
  const parsed1 = parseTime(time1, props.format)
  const parsed2 = parseTime(time2, props.format)

  if (!parsed1 || !parsed2) {
    return 0
  }

  if (parsed1.hour !== parsed2.hour) {
    return parsed1.hour > parsed2.hour ? 1 : -1
  }

  if (parsed1.minute !== parsed2.minute) {
    return parsed1.minute > parsed2.minute ? 1 : -1
  }

  if (parsed1.second !== parsed2.second) {
    return parsed1.second > parsed2.second ? 1 : -1
  }

  return 0
}

// 计算当前显示值
const displayValue = computed(() => {
  const value = props.modelValue

  if (!value) {
    return props.isRange ? ['', ''] : ''
  }

  if (props.isRange && Array.isArray(value)) {
    return value
  }

  return value as string
})

// 获取插槽
const slots = defineSlots<{
  prefix?: () => any
  suffix?: () => any
}>()

// 处理输入
const handleInput = (event: Event, index?: number) => {
  const target = event.target as HTMLInputElement
  const value = target.value.trim()

  if (!value) {
    if (!props.isRange) {
      emit('update:modelValue', null)
      emit('change', null)
    }
    return
  }

  // 验证时间格式
  if (!isValidTime(value, props.format)) {
    return
  }

  // 验证时间是否可用
  if (!isTimeAvailable(value)) {
    return
  }

  let newValue: TimePickerValue

  if (props.isRange) {
    const currentArray = Array.isArray(displayValue.value) ? displayValue.value : ['', '']
    const newArray = [...currentArray] as [string, string]
    newArray[index!] = value

    // 只有当两个值都有时才更新
    if (newArray[0] && newArray[1]) {
      // 确保开始时间小于结束时间
      if (compareTimes(newArray[0], newArray[1]) > 0) {
        // 交换两个时间
        newValue = [newArray[1], newArray[0]]
      } else {
        newValue = newArray
      }
    } else {
      newValue = null
    }
  } else {
    newValue = value
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
  if (startTimeInputRef.value) {
    startTimeInputRef.value.focus()
  }
}

// 格式化时间显示
const formatTimeDisplay = (time: string | any): string => {
  if (!time || typeof time !== 'string') {
    return ''
  }

  const parsed = parseTime(time, props.format)
  if (!parsed) {
    return time
  }

  // 根据 format 属性格式化显示
  const displayFormat = props.format || 'HH:mm:ss'
  return formatTime(parsed.hour, parsed.minute, parsed.second, displayFormat)
}

// 暴露方法
defineExpose({
  focus: () => startTimeInputRef.value?.focus(),
  blur: () => startTimeInputRef.value?.blur(),
  // 获取当前时间
  getCurrentTime: () => {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const hour = now.getHours()
    const minute = now.getMinutes()
    const second = now.getSeconds()

    if (props.format === 'HH:mm') {
      return `${pad(hour)}:${pad(minute)}`
    } else if (props.format === 'HHmmss') {
      return `${pad(hour)}${pad(minute)}${pad(second)}`
    } else if (props.format === 'HHmm') {
      return `${pad(hour)}${pad(minute)}`
    }
    return `${pad(hour)}:${pad(minute)}:${pad(second)}`
  },
})
</script>

<template>
  <div :class="wrapperClasses">
    <!-- 单时间选择器 -->
    <template v-if="!isRange">
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

        <!-- 时间输入框 -->
        <input
          ref="startTimeInputRef"
          type="text"
          :class="inputClasses"
          :placeholder="computedPlaceholder as string"
          :disabled="disabled"
          :readonly="readonly || !editable"
          :value="formatTimeDisplay(displayValue as string)"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
        />

        <!-- 后缀图标/插槽和清空按钮 -->
        <div class="absolute right-0 top-0 h-full flex items-center pr-3 gap-1">
          <!-- 后缀图标/插槽 -->
          <div v-if="suffix || slots.suffix" class="flex items-center text-slate-400">
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

    <!-- 时间范围选择器 -->
    <template v-else>
      <div class="flex items-center gap-2">
        <!-- 开始时间 -->
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

          <!-- 开始时间输入框 -->
          <input
            ref="startTimeInputRef"
            type="text"
            :class="inputClasses"
            :placeholder="(computedPlaceholder as string[])[0] || '开始时间'"
            :disabled="disabled"
            :readonly="readonly || !editable"
            :value="formatTimeDisplay((displayValue as string[])[0])"
            @input="handleInput($event, 0)"
            @focus="handleFocus"
            @blur="handleBlur"
          />
        </div>

        <!-- 分隔符 -->
        <span class="text-slate-400">{{ rangeSeparator }}</span>

        <!-- 结束时间 -->
        <div class="relative flex-1">
          <!-- 结束时间输入框 -->
          <input
            ref="_endTimeInputRef"
            type="text"
            :class="inputClasses"
            :placeholder="(computedPlaceholder as string[])[1] || '结束时间'"
            :disabled="disabled"
            :readonly="readonly || !editable"
            :value="formatTimeDisplay((displayValue as string[])[1])"
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
