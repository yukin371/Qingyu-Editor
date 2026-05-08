<script setup lang="ts">
/**
 * Slider 组件
 *
 * 滑块选择组件，支持单滑块、双滑块、垂直模式等多种功能
 */

import { ref, computed, watch } from 'vue'
 import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { SliderProps, SliderEmits, SliderValue } from './types'

// 使用 CVA 定义 Slider 变体
const sliderVariants = cva(
  // 基础样式
  'relative w-full',
  {
    variants: {
      vertical: {
        true: 'h-full',
        false: 'h-full',
      },
    },
    defaultVariants: {
      vertical: false,
    },
  }
)

// Slider 轨道变体
const sliderTrackVariants = cva(
  // 基础样式
  'relative w-full overflow-hidden rounded-full transition-colors',
  {
    variants: {
      vertical: {
        true: 'h-full',
        false: 'h-full',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
      },
      color: {
        primary: '',
        success: '',
        warning: '',
        danger: '',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: 'cursor-pointer',
      },
    },
    compoundVariants: [
      // 尺寸变体
      {
        size: 'sm',
        vertical: false,
        class: 'h-1.5',
      },
      {
        size: 'md',
        vertical: false,
        class: 'h-2',
      },
      {
        size: 'lg',
        vertical: false,
        class: 'h-2.5',
      },
      {
        size: 'sm',
        vertical: true,
        class: 'w-1.5',
      },
      {
        size: 'md',
        vertical: true,
        class: 'w-2',
      },
      {
        size: 'lg',
        vertical: true,
        class: 'w-2.5',
      },
      // 未激活轨道颜色
      {
        color: 'primary',
        class: 'bg-slate-200 dark:bg-slate-700',
      },
      {
        color: 'success',
        class: 'bg-slate-200 dark:bg-slate-700',
      },
      {
        color: 'warning',
        class: 'bg-slate-200 dark:bg-slate-700',
      },
      {
        color: 'danger',
        class: 'bg-slate-200 dark:bg-slate-700',
      },
    ],
    defaultVariants: {
      size: 'md',
      color: 'primary',
      disabled: false,
      vertical: false,
    },
  }
)

// Slider 滑块变体
const sliderThumbVariants = cva(
  // 基础样式
  'absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg ring-2 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  {
    variants: {
      size: {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
      color: {
        primary: 'ring-primary-500 focus-visible:ring-primary-500',
        success: 'ring-success-DEFAULT focus-visible:ring-success-DEFAULT',
        warning: 'ring-warning-DEFAULT focus-visible:ring-warning-DEFAULT',
        danger: 'ring-danger-DEFAULT focus-visible:ring-danger-DEFAULT',
      },
      disabled: {
        true: 'cursor-not-allowed',
        false: 'cursor-grab active:cursor-grabbing',
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
const props = withDefaults(defineProps<SliderProps>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  range: false,
  vertical: false,
  height: '200px',
  showTooltip: true,
  size: 'md',
  color: 'primary',
})

// 组件 Emits
const emit = defineEmits<SliderEmits>()

// 内部状态
const sliderRef = ref<HTMLElement>()
const isDragging = ref(false)
const dragIndex = ref(0) // 0 表示单个滑块或第一个滑块，1 表示第二个滑块

// 计算内部值
const internalValue = ref<SliderValue>(props.modelValue)

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  internalValue.value = newValue
}, { immediate: true })

// 格式化值显示
const formatValue = (value: number): string => {
  if (props.formatTooltip) {
    return props.formatTooltip(value)
  }
  return value.toString()
}

// 计算值转换为百分比
const valueToPercent = (value: number): number => {
  return ((value - props.min) / (props.max - props.min)) * 100
}

// 计算百分比转换为值
const percentToValue = (percent: number): number => {
  const rawValue = (percent / 100) * (props.max - props.min) + props.min
  // 根据步长调整值
  const step = props.step
  const steppedValue = Math.round(rawValue / step) * step
  return Math.max(props.min, Math.min(props.max, steppedValue))
}

// 计算滑块位置
const getThumbPosition = (index: number): number => {
  if (props.range && Array.isArray(internalValue.value)) {
    return valueToPercent(internalValue.value[index])
  }
  return valueToPercent(internalValue.value as number)
}

// 计算填充条样式
const fillStyle = computed(() => {
  if (props.range && Array.isArray(internalValue.value)) {
    const start = valueToPercent(internalValue.value[0])
    const end = valueToPercent(internalValue.value[1])
    if (props.vertical) {
      return {
        bottom: `${start}%`,
        height: `${end - start}%`,
      }
    }
    return {
      left: `${start}%`,
      width: `${end - start}%`,
    }
  } else {
    const percent = valueToPercent(internalValue.value as number)
    if (props.vertical) {
      return {
        height: `${percent}%`,
      }
    }
    return {
      width: `${percent}%`,
    }
  }
})

// 计算填充条颜色类
const fillClass = computed(() => {
  const colorMap = {
    primary: 'bg-primary-500',
    success: 'bg-success-DEFAULT',
    warning: 'bg-warning-DEFAULT',
    danger: 'bg-danger-DEFAULT',
  }
  return colorMap[props.color]
})

// 计算滑块样式
const getThumbStyle = (index: number): Record<string, string> => {
  const percent = getThumbPosition(index)
  if (props.vertical) {
    return {
      bottom: `${percent}%`,
    }
  }
  return {
    left: `${percent}%`,
  }
}

// 处理点击/拖动
const handlePointerDown = (event: PointerEvent, index?: number) => {
  if (props.disabled) return

  event.preventDefault()
  isDragging.value = true

  // 如果是点击轨道，确定要移动哪个滑块
  if (index === undefined) {
    if (props.range && Array.isArray(internalValue.value)) {
      // 找到最近的滑块
      const percent = getPercentFromEvent(event)
      const p1 = valueToPercent(internalValue.value[0])
      const p2 = valueToPercent(internalValue.value[1])
      dragIndex.value = Math.abs(percent - p1) < Math.abs(percent - p2) ? 0 : 1
    } else {
      dragIndex.value = 0
    }
  } else {
    dragIndex.value = index
  }

  updateValue(event)

  // 添加全局事件监听
  document.addEventListener('pointermove', handlePointerMove)
  document.addEventListener('pointerup', handlePointerUp)
  document.addEventListener('pointercancel', handlePointerUp)
}

// 处理指针移动
const handlePointerMove = (event: PointerEvent) => {
  if (!isDragging.value) return
  updateValue(event)
}

// 处理指针释放
const handlePointerUp = () => {
  if (!isDragging.value) return

  isDragging.value = false

  // 移除全局事件监听
  document.removeEventListener('pointermove', handlePointerMove)
  document.removeEventListener('pointerup', handlePointerUp)
  document.removeEventListener('pointercancel', handlePointerUp)

  // 触发 change 事件
  emit('change', internalValue.value)
}

// 从事件获取百分比
const getPercentFromEvent = (event: PointerEvent): number => {
  if (!sliderRef.value) return 0

  const rect = sliderRef.value.getBoundingClientRect()

  if (props.vertical) {
    const bottom = rect.bottom - event.clientY
    return (bottom / rect.height) * 100
  } else {
    const left = event.clientX - rect.left
    return (left / rect.width) * 100
  }
}

// 更新值
const updateValue = (event: PointerEvent) => {
  const percent = getPercentFromEvent(event)
  const newValue = percentToValue(percent)

  if (props.range && Array.isArray(internalValue.value)) {
    const newValues = [...internalValue.value] as [number, number]

    if (dragIndex.value === 0) {
      // 更新第一个滑块，确保不超过第二个滑块
      newValues[0] = Math.min(newValue, newValues[1] - props.step)
    } else {
      // 更新第二个滑块，确保不小于第一个滑块
      newValues[1] = Math.max(newValue, newValues[0] + props.step)
    }

    internalValue.value = newValues
    emit('update:modelValue', newValues)
  } else {
    internalValue.value = newValue
    emit('update:modelValue', newValue)
  }
}

// 计算轨道样式类名
const trackClasses = computed(() =>
  cn(
    sliderTrackVariants({
      vertical: props.vertical,
      size: props.size,
      color: props.color,
      disabled: props.disabled,
    }),
    props.class
  )
)

// 计算滑块样式类名
const thumbClasses = computed(() =>
  sliderThumbVariants({
    size: props.size,
    color: props.color,
    disabled: props.disabled,
  })
)

// 计算容器样式
const containerStyle = computed(() => {
  if (props.vertical) {
    return {
      height: props.height,
    }
  }
  return {}
})

// 刻度标记数据
const marksData = computed(() => {
  if (!props.marks) return []
  return Object.entries(props.marks).map(([value, label]) => ({
    value: Number(value),
    label,
    percent: valueToPercent(Number(value)),
  }))
})
</script>

<template>
  <div class="slider-wrapper" :class="{ 'inline-block': vertical }">
    <!-- Label -->
    <label
      v-if="label"
      class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
    >
      {{ label }}
    </label>

    <!-- Slider 容器 -->
    <div
      ref="sliderRef"
      :class="cn(
        'relative inline-flex',
        vertical ? 'flex-col items-center' : 'w-full',
        {
          'cursor-not-allowed': disabled,
          'cursor-pointer': !disabled,
        }
      )"
      :style="containerStyle"
    >
      <!-- Slider -->
      <div
        :class="cn(
          sliderVariants({ vertical }),
          vertical ? 'h-full' : 'w-full'
        )"
      >
        <!-- 轨道 -->
        <div
          :class="trackClasses"
          @pointerdown="handlePointerDown"
        >
          <!-- 填充条 -->
          <div
            :class="[
              'absolute rounded-full transition-all',
              fillClass,
              vertical ? 'left-0 right-0' : 'top-0 bottom-0'
            ]"
            :style="fillStyle"
          />

          <!-- 刻度标记 -->
          <div
            v-for="mark in marksData"
            :key="mark.value"
            :class="[
              'absolute top-1/2 -translate-y-1/2 w-0.5 h-2 rounded-full bg-slate-400 dark:bg-slate-600',
              vertical ? 'left-1/2 -translate-x-1/2' : ''
            ]"
            :style="vertical ? { bottom: `${mark.percent}%` } : { left: `${mark.percent}%` }"
          />

          <!-- 单滑块或双滑块 -->
          <template v-if="range && Array.isArray(internalValue)">
            <!-- 第一个滑块 -->
            <button
              type="button"
              :class="thumbClasses"
              :style="getThumbStyle(0)"
              :aria-disabled="disabled"
              :aria-valuenow="internalValue[0]"
              :aria-valuemin="min"
              :aria-valuemax="max"
              :disabled="disabled"
              @pointerdown="(e) => handlePointerDown(e, 0)"
            >
              <!-- Tooltip -->
              <div
                v-if="showTooltip"
                :class="[
                  'absolute left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium text-white rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none',
                  vertical ? 'bottom-full mb-2' : '-top-8'
                ]"
              >
                {{ formatValue(internalValue[0]) }}
              </div>
            </button>

            <!-- 第二个滑块 -->
            <button
              type="button"
              :class="thumbClasses"
              :style="getThumbStyle(1)"
              :aria-disabled="disabled"
              :aria-valuenow="internalValue[1]"
              :aria-valuemin="min"
              :aria-valuemax="max"
              :disabled="disabled"
              @pointerdown="(e) => handlePointerDown(e, 1)"
            >
              <!-- Tooltip -->
              <div
                v-if="showTooltip"
                :class="[
                  'absolute left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium text-white rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none',
                  vertical ? 'bottom-full mb-2' : '-top-8'
                ]"
              >
                {{ formatValue(internalValue[1]) }}
              </div>
            </button>
          </template>

          <!-- 单个滑块 -->
          <button
            v-else
            type="button"
            :class="thumbClasses"
            :style="getThumbStyle(0)"
            :aria-disabled="disabled"
            :aria-valuenow="internalValue as number"
            :aria-valuemin="min"
            :aria-valuemax="max"
            :disabled="disabled"
            @pointerdown="(e) => handlePointerDown(e, 0)"
          >
            <!-- Tooltip -->
            <div
              v-if="showTooltip"
              :class="[
                'absolute left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium text-white bg-slate-900 dark:bg-slate-700 rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none',
                vertical ? 'bottom-full mb-2' : '-top-8'
              ]"
            >
              {{ formatValue(internalValue as number) }}
            </div>
          </button>
        </div>
      </div>

      <!-- 刻度标签 -->
      <div
        v-if="marks"
        :class="[
          'w-full mt-2 flex justify-between text-xs text-slate-600 dark:text-slate-400',
          vertical ? 'flex-col h-full' : ''
        ]"
        :style="vertical ? { height } : {}"
      >
        <span
          v-for="mark in marksData"
          :key="mark.value"
          :class="[
            'absolute',
            vertical ? 'left-1/2 -translate-x-1/2' : ''
          ]"
          :style="vertical ? { bottom: `${mark.percent}%` } : { left: `${mark.percent}%`, transform: 'translateX(-50%)' }"
        >
          {{ mark.label }}
        </span>
      </div>
    </div>

    <!-- 当前值显示 -->
    <div
      v-if="!range && !showTooltip"
      class="mt-2 text-sm text-slate-600 dark:text-slate-400"
    >
      {{ formatValue(internalValue as number) }}
    </div>
    <div
      v-else-if="range && !showTooltip"
      class="mt-2 text-sm text-slate-600 dark:text-slate-400"
    >
      {{ formatValue((internalValue as number[])[0]) }} - {{ formatValue((internalValue as number[])[1]) }}
    </div>
  </div>
</template>

<style scoped>
.slider-wrapper button:focus-visible {
  outline: none;
}

.slider-wrapper button:focus-visible::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid currentColor;
}
</style>
