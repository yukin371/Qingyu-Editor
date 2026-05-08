<template>
  <div :class="containerClasses">
    <!-- 线性进度条 -->
    <template v-if="type === 'line'">
      <div
        v-if="!textInside"
        :class="textClasses"
        class="mb-2"
      >
        <slot name="default">{{ formattedPercentage }}%</slot>
      </div>
      <div
        :class="trackClasses"
        :style="{ height: typeof strokeWidth === 'number' ? `${strokeWidth}px` : strokeWidth }"
      >
        <div
          :class="fillClasses"
          :style="fillStyle"
        />
      </div>
    </template>

    <!-- 环形进度条 -->
    <template v-else>
      <svg
        :width="width"
        :height="width"
        :viewBox="dashboard ? '0 0 100 100' : '0 0 126 126'"
        class="transform -rotate-90"
      >
        <!-- 背景圆环 -->
        <circle
          :cx="dashboard ? 50 : 63"
          :cy="dashboard ? 50 : 63"
          :r="radius"
          fill="none"
          class="stroke-slate-100 dark:stroke-slate-800"
          :stroke-width="strokeWidth"
        />
        <!-- 进度圆环 -->
        <circle
          :cx="dashboard ? 50 : 63"
          :cy="dashboard ? 50 : 63"
          :r="radius"
          fill="none"
          :class="circleFillClasses"
          :stroke-width="strokeWidth"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          class="transition-all duration-300 ease-out"
          :stroke="color"
        />
      </svg>
      <div
        v-if="showText"
        :class="textClasses"
        class="absolute inset-0 flex items-center justify-center"
      >
        <slot name="default">{{ formattedPercentage }}%</slot>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  progressVariants,
  progressTrackVariants,
  progressFillVariants,
  progressTextVariants
} from './variants'
import type { QyProgressProps } from './types'

// Props
const props = withDefaults(defineProps<QyProgressProps>(), {
  percentage: 0,
  type: 'line',
  showText: undefined,
  strokeWidth: 6,
  textInside: false,
  width: 126
})

// 计算状态
const currentStatus = computed(() => {
  if (props.status) return props.status
  if (props.percentage >= 100) return 'success'
  return 'active'
})

// 格式化百分比
const formattedPercentage = computed(() => {
  return Math.min(100, Math.max(0, props.percentage))
})

// 容器类名
const containerClasses = computed(() => {
  return progressVariants({
    type: props.type
  })
})

// 轨道类名
const trackClasses = computed(() => {
  return progressTrackVariants()
})

// 填充类名
const fillClasses = computed(() => {
  const hasCustomColor = !!props.color
  return progressFillVariants({
    status: currentStatus.value,
    customColor: hasCustomColor
  })
})

// 填充样式
const fillStyle = computed(() => {
  const style: Record<string, string> = {
    width: `${formattedPercentage.value}%`
  }
  if (props.color) {
    style.backgroundColor = props.color
  }
  return style
})

// 文字类名
const textClasses = computed(() => {
  return progressTextVariants({
    status: currentStatus.value
  })
})

// 环形进度条参数
const radius = computed(() => {
  // viewBox: 0 0 126 126, cx=63, cy=63, stroke-width=6
  // radius = (126 - 6) / 2 = 60
  return props.type === 'dashboard' ? 47 : 60 // dashboard 使用不同的半径
})

const circumference = computed(() => {
  return 2 * Math.PI * radius.value
})

const dashOffset = computed(() => {
  return circumference.value * (1 - formattedPercentage.value / 100)
})

// 环形进度条填充类名
const circleFillClasses = computed(() => {
  if (props.color) return ''
  return currentStatus.value === 'success'
    ? 'stroke-success-500'
    : currentStatus.value === 'exception'
    ? 'stroke-danger-500'
    : currentStatus.value === 'warning'
    ? 'stroke-warning-500'
    : 'stroke-primary-500'
})
</script>
