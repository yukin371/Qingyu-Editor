<template>
  <div
    :class="sliderWrapperClasses"
    :style="wrapperStyle"
  >
    <!-- 滑块主体 -->
    <div
      ref="sliderRef"
      :class="sliderClasses"
      class="qy-slider__core"
      @mousedown="handleMouseDown"
      @touchstart="handleTouchStart"
    >
      <!-- 轨道 -->
      <div :class="trackClasses" class="qy-slider__track">
        <!-- 已填充轨道 -->
        <div
          :class="fillClasses"
          class="qy-slider__fill"
          :style="fillStyle"
        ></div>

        <!-- 刻度标记 -->
        <template v-if="marks && marks.length > 0">
          <div
            v-for="mark in marks"
            :key="mark.value"
            :class="markClasses"
            :style="getMarkStyle(mark.percent)"
          ></div>
        </template>

        <!-- 滑块 -->
        <template v-if="isRange">
          <!-- 最小值滑块 -->
          <div
            :class="getThumbClasses(0)"
            :style="getThumbStyle(0)"
            @mousedown.stop="handleThumbMouseDown(0)"
            @touchstart.stop="handleThumbTouchStart(0)"
          >
            <!-- Tooltip -->
            <div v-if="showTooltip && Array.isArray(internalValue)" :class="tooltipClasses">
              {{ formatValue(internalValue[0]) }}
            </div>
          </div>

          <!-- 最大值滑块 -->
          <div
            :class="getThumbClasses(1)"
            :style="getThumbStyle(1)"
            @mousedown.stop="handleThumbMouseDown(1)"
            @touchstart.stop="handleThumbTouchStart(1)"
          >
            <!-- Tooltip -->
            <div v-if="showTooltip && Array.isArray(internalValue)" :class="tooltipClasses">
              {{ formatValue(internalValue[1]) }}
            </div>
          </div>
        </template>

        <!-- 单个滑块 -->
        <template v-else>
          <div
            :class="thumbClasses"
            :style="thumbStyle"
            @mousedown.stop="handleThumbMouseDown(0)"
            @touchstart.stop="handleThumbTouchStart(0)"
          >
            <!-- Tooltip -->
            <div v-if="showTooltip" :class="tooltipClasses">
              {{ formatValue(internalValue) }}
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 刻度标签 -->
    <div
      v-if="marks && marks.length > 0"
      :class="marksContainerClasses"
    >
      <div
        v-for="mark in marks"
        :key="`label-${mark.value}`"
        :class="markLabelClasses"
        :style="getMarkLabelStyle(mark.percent)"
      >
        {{ mark.label }}
      </div>
    </div>

    <!-- 数值显示（如果showTooltip为false） -->
    <div v-if="!showTooltip && !isRange" class="mt-2 text-sm text-slate-600">
      {{ formatValue(internalValue) }}
    </div>
    <div v-else-if="!showTooltip && isRange && Array.isArray(internalValue)" class="mt-2 text-sm text-slate-600">
      {{ formatValue(internalValue[0]) }} - {{ formatValue(internalValue[1]) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { cn } from '@/design-system/utils/cn'
import type { QySliderProps, QySliderEmits, SliderValue } from './types'
import {
  sliderVariants,
  trackVariants,
  fillVariants,
  thumbVariants,
  tooltipVariants
} from './variants'

// Props
const props = withDefaults(defineProps<QySliderProps>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  range: false,
  vertical: false,
  showTooltip: true,
  size: 'md',
  color: 'primary'
})

// Emits
const emit = defineEmits<QySliderEmits>()

// 内部值
const internalValue = ref<SliderValue>(props.modelValue)

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  internalValue.value = newValue
})

// 拖拽状态
const isDragging = ref(false)
const dragIndex = ref(0)

// 滑块引用
const sliderRef = ref<HTMLElement>()

// 是否为范围模式
const isRange = computed(() => props.range && Array.isArray(internalValue.value))

// 计算容器类名
const sliderWrapperClasses = computed(() => {
  return cn(
    sliderVariants({
      size: props.size,
      vertical: props.vertical,
      disabled: props.disabled
    }),
    props.class
  )
})

// 计算容器样式
const wrapperStyle = computed(() => {
  if (props.vertical) {
    return { height: props.height || '200px' }
  }
  return {}
})

// 计算滑块类名
const sliderClasses = computed(() => {
  return cn(
    'relative',
    props.vertical ? 'h-full w-6' : 'w-full h-6'
  )
})

// 计算轨道类名
const trackClasses = computed(() => {
  return cn(
    trackVariants({
      size: props.size,
      vertical: props.vertical,
      color: props.color
    }),
    props.vertical ? 'w-2' : ''
  )
})

// 计算填充类名
const fillClasses = computed(() => {
  return fillVariants({
    vertical: props.vertical,
    color: props.color
  })
})

// 计算填充样式
const fillStyle = computed(() => {
  if (isRange.value && Array.isArray(internalValue.value)) {
    const [min, max] = internalValue.value as number[]
    const minPercent = ((min - props.min) / (props.max - props.min)) * 100
    const maxPercent = ((max - props.min) / (props.max - props.min)) * 100

    if (props.vertical) {
      return {
        bottom: `${minPercent}%`,
        height: `${maxPercent - minPercent}%`
      }
    }
    return {
      left: `${minPercent}%`,
      width: `${maxPercent - minPercent}%`
    }
  } else {
    const percent = ((internalValue.value as number - props.min) / (props.max - props.min)) * 100

    if (props.vertical) {
      return {
        bottom: '0%',
        height: `${percent}%`
      }
    }
    return {
      left: '0%',
      width: `${percent}%`
    }
  }
})

// 计算滑块类名
const thumbClasses = computed(() => {
  return cn(
    thumbVariants({
      size: props.size,
      color: props.color,
      vertical: props.vertical
    })
  )
})

// 计算滑块样式
const thumbStyle = computed(() => {
  const percent = ((internalValue.value as number - props.min) / (props.max - props.min)) * 100
  
  if (props.vertical) {
    return { bottom: `${percent}%` }
  }
  return { left: `${percent}%` }
})

// 获取滑块类名
const getThumbClasses = (index: number) => {
  return cn(
    thumbVariants({
      size: props.size,
      color: props.color,
      vertical: props.vertical
    }),
    index === 0 ? 'z-20' : 'z-10'
  )
}

// 获取滑块样式
const getThumbStyle = (index: number) => {
  if (!Array.isArray(internalValue.value)) return {}
  const value = internalValue.value[index]
  const percent = ((value - props.min) / (props.max - props.min)) * 100

  if (props.vertical) {
    return { bottom: `${percent}%` }
  }
  return { left: `${percent}%` }
}

// 计算Tooltip类名
const tooltipClasses = computed(() => {
  return tooltipVariants({
    vertical: props.vertical
  })
})

// 计算刻度类名
const markClasses = computed(() => {
  return cn(
    'absolute w-1 h-1 rounded-full bg-slate-400',
    props.vertical ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2'
  )
})

// 获取刻度样式
const getMarkStyle = (percent: number) => {
  if (props.vertical) {
    return { bottom: `${percent}%` }
  }
  return { left: `${percent}%` }
}

// 计算刻度标签容器类名
const marksContainerClasses = computed(() => {
  return cn(
    'relative w-full mt-2',
    props.vertical ? 'flex-col h-full' : ''
  )
})

// 计算刻度标签类名
const markLabelClasses = computed(() => {
  return cn(
    'absolute text-xs text-slate-500',
    props.vertical ? 'left-1/2 -translate-x-1/2 -translate-y-1/2' : '-translate-x-1/2'
  )
})

// 获取刻度标签样式
const getMarkLabelStyle = (percent: number) => {
  if (props.vertical) {
    return { bottom: `${percent}%` }
  }
  return { left: `${percent}%` }
}

// 格式化值
const formatValue = (value: SliderValue): string => {
  let numValue: number
  
  if (Array.isArray(value)) {
    numValue = value[0]
  } else {
    numValue = value
  }
  
  if (props.formatTooltip) {
    return props.formatTooltip(numValue)
  }
  return String(numValue)
}

// 计算值从位置
const getValueFromPosition = (clientX: number, clientY: number): number => {
  if (!sliderRef.value) return props.min
  
  const rect = sliderRef.value.getBoundingClientRect()
  
  let percent: number
  if (props.vertical) {
    percent = 1 - (clientY - rect.top) / rect.height
  } else {
    percent = (clientX - rect.left) / rect.width
  }
  
  // 限制在0-1范围内
  percent = Math.max(0, Math.min(1, percent))
  
  // 计算实际值
  let value = props.min + percent * (props.max - props.min)
  
  // 应用步长
  if (props.step > 0) {
    value = Math.round(value / props.step) * props.step
  }
  
  // 限制在最小最大值范围内
  return Math.max(props.min, Math.min(props.max, value))
}

// 更新值
const updateValue = (value: number, index: number = 0) => {
  if (props.disabled) return

  if (isRange.value && Array.isArray(internalValue.value)) {
    const values = [...internalValue.value] as number[]
    values[index] = value

    // 确保最小值不大于最大值
    if (index === 0 && value > values[1]) {
      values[0] = values[1]
    } else if (index === 1 && value < values[0]) {
      values[1] = values[0]
    }

    internalValue.value = values
    emit('update:modelValue', values)
    emit('change', values)
  } else {
    internalValue.value = value
    emit('update:modelValue', value)
    emit('change', value)
  }
}

// 处理滑块鼠标按下
const handleThumbMouseDown = (index: number) => {
  if (props.disabled) return
  
  isDragging.value = true
  dragIndex.value = index
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 处理滑块触摸开始
const handleThumbTouchStart = (index: number) => {
  if (props.disabled) return
  
  isDragging.value = true
  dragIndex.value = index
  
  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleTouchEnd)
}

// 处理鼠标移动
const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  
  const value = getValueFromPosition(e.clientX, e.clientY)
  updateValue(value, dragIndex.value)
}

// 处理触摸移动
const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return
  
  e.preventDefault()
  const touch = e.touches[0]
  const value = getValueFromPosition(touch.clientX, touch.clientY)
  updateValue(value, dragIndex.value)
}

// 处理鼠标释放
const handleMouseUp = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

// 处理触摸结束
const handleTouchEnd = () => {
  isDragging.value = false
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
}

// 处理轨道鼠标按下
const handleMouseDown = (e: MouseEvent) => {
  if (props.disabled) return
  
  const value = getValueFromPosition(e.clientX, e.clientY)
  
  if (isRange.value) {
    // 确定更新哪个滑块
    const values = internalValue.value as number[]
    const distances = values.map(v => Math.abs(v - value))
    const index = distances[0] < distances[1] ? 0 : 1
    updateValue(value, index)
  } else {
    updateValue(value)
  }
}

// 处理轨道触摸开始
const handleTouchStart = (e: TouchEvent) => {
  if (props.disabled) return
  
  const touch = e.touches[0]
  const value = getValueFromPosition(touch.clientX, touch.clientY)
  
  if (isRange.value) {
    const values = internalValue.value as number[]
    const distances = values.map(v => Math.abs(v - value))
    const index = distances[0] < distances[1] ? 0 : 1
    updateValue(value, index)
  } else {
    updateValue(value)
  }
}

// 清理事件监听器
onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
})

// 暴露方法给父组件
defineExpose({
  focus: () => sliderRef.value?.focus(),
  blur: () => sliderRef.value?.blur()
})
</script>

<style scoped>
.qy-slider__core {
  width: 100%;
  min-height: 24px;
  overflow: visible;
}

.qy-slider__track {
  width: 100%;
  height: 8px !important;
  max-height: 8px;
  border-radius: 9999px;
  overflow: hidden;
  position: relative;
}

.qy-slider__fill {
  top: 0;
  left: 0;
  height: 100% !important;
  max-height: 8px;
  max-width: 100%;
  border-radius: inherit;
  position: absolute;
}
</style>
