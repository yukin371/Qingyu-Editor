<script setup lang="ts">
/**
 * Progress 组件
 *
 * 用于展示操作当前进度的反馈组件
 * 支持线性进度条、圆形进度条和仪表盘进度条
 */

import { computed, watch } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { ProgressProps, ProgressStatus } from './types'

// 使用 CVA 定义进度条变体
const progressVariants = cva(
  // 基础样式
  'inline-block',
  {
    variants: {
      type: {
        line: 'w-full',
        circle: 'inline-flex items-center justify-center',
        dashboard: 'inline-flex items-center justify-center',
      },
    },
    defaultVariants: {
      type: 'line',
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<ProgressProps>(), {
  percentage: 0,
  type: 'line',
  strokeWidth: 6,
  status: undefined,
  striped: false,
  flow: false,
  textInside: false,
  showText: true,
  width: 126,
  gapDegree: 240,
  gapPosition: 'top',
  animated: true,
})

// 组件 Emits
const emit = defineEmits<{
  change: [percentage: number]
}>()

// 计算当前状态
const currentStatus = computed<ProgressStatus | undefined>(() => {
  if (props.status) {
    return props.status
  }
  if (props.percentage >= 100) {
    return 'success'
  }
  return undefined
})

// 计算进度条颜色
const progressColor = computed(() => {
  if (!props.color) {
    return undefined
  }

  if (typeof props.color === 'function') {
    return props.color(props.percentage)
  }

  if (Array.isArray(props.color)) {
    const segment = 100 / props.color.length
    const index = Math.min(Math.floor(props.percentage / segment), props.color.length - 1)
    return props.color[index]
  }

  return props.color
})

// 计算显示文本
const displayText = computed(() => {
  if (props.format) {
    return props.format(props.percentage)
  }
  return `${props.percentage}%`
})

// 计算样式类名
const classes = computed(() =>
  cn(
    progressVariants({
      type: props.type,
    }),
    'qy-progress',
    props.class
  )
)

// 圆形进度条相关计算
const radius = computed(() => {
  const baseRadius = props.type === 'circle' ? 50 : 50
  return baseRadius - props.strokeWidth / 2
})

const circumference = computed(() => {
  return 2 * Math.PI * radius.value
})

const dashOffset = computed(() => {
  const offset = circumference.value - (props.percentage / 100) * circumference.value
  return offset
})

const strokeDashoffset = computed(() => {
  if (props.type === 'dashboard') {
    // 仪表盘类型需要根据 gapDegree 计算
    const gapRatio = props.gapDegree / 360
    const effectiveCircumference = circumference.value * (1 - gapRatio)
    const offset = effectiveCircumference - (props.percentage / 100) * effectiveCircumference
    return offset
  }
  return dashOffset.value
})

const effectiveCircumference = computed(() => {
  if (props.type === 'dashboard') {
    const gapRatio = props.gapDegree / 360
    return circumference.value * (1 - gapRatio)
  }
  return circumference.value
})

// 计算仪表盘旋转角度
const dashboardRotation = computed(() => {
  const rotations = {
    top: -90,
    bottom: 90,
    left: 180,
    right: 0,
  }
  return rotations[props.gapPosition] || -90
})

// 计算线性进度条宽度
const lineProgressWidth = computed(() => {
  return `${Math.min(100, Math.max(0, props.percentage))}%`
})

// SVG 容器尺寸
const svgSize = computed(() => {
  return props.width || 126
})

// SVG 视图框
const viewBox = computed(() => {
  const size = 100
  return `0 0 ${size} ${size}`
})

// 圆心位置
const circleCenter = computed(() => {
  return 50
})

// 监听百分比变化
watch(() => props.percentage, (newVal) => {
  emit('change', newVal)
})
</script>

<template>
  <div :class="classes" :style="style">
    <!-- 线性进度条 -->
    <template v-if="type === 'line'">
      <div class="qy-progress__outer">
        <div
          class="qy-progress__bar"
          :class="{
            'qy-progress__bar--striped': striped,
            'qy-progress__bar--flow': striped && flow,
            'qy-progress__bar--text-inside': textInside,
          }"
        >
          <div
            class="qy-progress__bar-outer"
            :class="`qy-progress__bar-outer--${currentStatus || 'active'}`"
          >
            <div
              class="qy-progress__bar-inner"
              :class="{
                'qy-progress__bar-inner--animated': animated && !striped,
                'qy-progress__bar-inner--striped': striped,
                'qy-progress__bar-inner--flow': striped && flow,
              }"
              :style="{
                width: lineProgressWidth,
                backgroundColor: progressColor,
              }"
            >
              <!-- 文字在进度条内部 -->
              <span
                v-if="textInside && showText"
                class="qy-progress__text qy-progress__text--inner"
              >
                {{ displayText }}
              </span>
            </div>
          </div>
        </div>

        <!-- 文字在进度条外部 -->
        <span
          v-if="!textInside && showText"
          class="qy-progress__text"
          :class="`qy-progress__text--${currentStatus || 'active'}`"
        >
          {{ displayText }}
        </span>
      </div>
    </template>

    <!-- 圆形进度条 -->
    <template v-else-if="type === 'circle'">
      <div
        class="qy-progress__circle"
        :style="{
          width: `${svgSize}px`,
          height: `${svgSize}px`,
        }"
      >
        <svg
          :viewBox="viewBox"
          class="qy-progress__circle-svg"
        >
          <!-- 背景圆 -->
          <circle
            class="qy-progress__circle-bg"
            :cx="circleCenter"
            :cy="circleCenter"
            :r="radius"
            :stroke-width="strokeWidth"
            fill="none"
          />

          <!-- 进度圆 -->
          <circle
            class="qy-progress__circle-stroke"
            :class="{
              'qy-progress__circle-stroke--animated': animated,
              [`qy-progress__circle-stroke--${currentStatus || 'active'}`]: currentStatus,
            }"
            :cx="circleCenter"
            :cy="circleCenter"
            :r="radius"
            :stroke-width="strokeWidth"
            fill="none"
            :stroke="progressColor"
            :stroke-dasharray="effectiveCircumference"
            :stroke-dashoffset="strokeDashoffset"
            stroke-linecap="round"
            transform="rotate(-90 50 50)"
          />
        </svg>

        <!-- 中心文字 -->
        <div
          v-if="showText"
          class="qy-progress__circle-text"
          :class="`qy-progress__circle-text--${currentStatus || 'active'}`"
        >
          {{ displayText }}
        </div>
      </div>
    </template>

    <!-- 仪表盘进度条 -->
    <template v-else-if="type === 'dashboard'">
      <div
        class="qy-progress__dashboard"
        :style="{
          width: `${svgSize}px`,
          height: `${svgSize}px`,
        }"
      >
        <svg
          :viewBox="viewBox"
          class="qy-progress__dashboard-svg"
        >
          <!-- 背景圆弧 -->
          <circle
            class="qy-progress__dashboard-bg"
            :cx="circleCenter"
            :cy="circleCenter"
            :r="radius"
            :stroke-width="strokeWidth"
            fill="none"
            :stroke-dasharray="effectiveCircumference"
            :stroke-dashoffset="0"
            :transform="`rotate(${dashboardRotation} 50 50)`"
          />

          <!-- 进度圆弧 -->
          <circle
            class="qy-progress__dashboard-stroke"
            :class="{
              'qy-progress__dashboard-stroke--animated': animated,
              [`qy-progress__dashboard-stroke--${currentStatus || 'active'}`]: currentStatus,
            }"
            :cx="circleCenter"
            :cy="circleCenter"
            :r="radius"
            :stroke-width="strokeWidth"
            fill="none"
            :stroke="progressColor"
            :stroke-dasharray="effectiveCircumference"
            :stroke-dashoffset="strokeDashoffset"
            stroke-linecap="round"
            :transform="`rotate(${dashboardRotation} 50 50)`"
          />
        </svg>

        <!-- 中心文字 -->
        <div
          v-if="showText"
          class="qy-progress__dashboard-text"
          :class="`qy-progress__dashboard-text--${currentStatus || 'active'}`"
        >
          {{ displayText }}
        </div>
      </div>
    </template>

    <!-- 自定义插槽内容 -->
    <div v-if="$slots.default" class="qy-progress__custom">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.qy-progress__outer {
  display: flex;
  align-items: center;
  width: 100%;
}

.qy-progress__bar {
  flex: 1;
  position: relative;
  margin-right: auto;
}

.qy-progress__bar-outer {
  width: 100%;
  height: 100%;
  background-color: rgb(226 232 240 / 80%);
  border-radius: 9999px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.qy-progress__bar-outer--success {
  background-color: rgb(209 250 229 / 80%);
}

.qy-progress__bar-outer--exception {
  background-color: rgb(254 226 226 / 80%);
}

.qy-progress__bar-outer--warning {
  background-color: rgb(253 230 138 / 80%);
}

.qy-progress__bar-inner {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease;
  position: relative;
  background-color: rgb(14 165 233);
}

.qy-progress__bar-inner--animated {
  animation: progress-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.qy-progress__bar-inner--striped {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
}

.qy-progress__bar-inner--flow {
  animation: progress-stripe-flow 2s linear infinite;
}

.qy-progress__text {
  margin-left: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(71 85 105);
  white-space: nowrap;
}

.qy-progress__text--inner {
  color: white;
  margin-left: 0;
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
}

.qy-progress__text--success {
  color: rgb(16 185 129);
}

.qy-progress__text--exception {
  color: rgb(239 68 68);
}

.qy-progress__text--warning {
  color: rgb(245 158 11);
}

/* 圆形进度条 */
.qy-progress__circle {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.qy-progress__circle-svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.qy-progress__circle-bg {
  stroke: rgb(226 232 240 / 80%);
}

.qy-progress__circle-stroke {
  stroke: rgb(14 165 233);
  transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease;
}

.qy-progress__circle-stroke--animated {
  animation: circle-progress 1s ease-out;
}

.qy-progress__circle-stroke--success {
  stroke: rgb(16 185 129);
}

.qy-progress__circle-stroke--exception {
  stroke: rgb(239 68 68);
}

.qy-progress__circle-stroke--warning {
  stroke: rgb(245 158 11);
}

.qy-progress__circle-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(71 85 105);
}

.qy-progress__circle-text--success {
  color: rgb(16 185 129);
}

.qy-progress__circle-text--exception {
  color: rgb(239 68 68);
}

.qy-progress__circle-text--warning {
  color: rgb(245 158 11);
}

/* 仪表盘进度条 */
.qy-progress__dashboard {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.qy-progress__dashboard-svg {
  width: 100%;
  height: 100%;
}

.qy-progress__dashboard-bg {
  stroke: rgb(226 232 240 / 80%);
}

.qy-progress__dashboard-stroke {
  stroke: rgb(14 165 233);
  transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease;
}

.qy-progress__dashboard-stroke--animated {
  animation: circle-progress 1s ease-out;
}

.qy-progress__dashboard-stroke--success {
  stroke: rgb(16 185 129);
}

.qy-progress__dashboard-stroke--exception {
  stroke: rgb(239 68 68);
}

.qy-progress__dashboard-stroke--warning {
  stroke: rgb(245 158 11);
}

.qy-progress__dashboard-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(71 85 105);
}

.qy-progress__dashboard-text--success {
  color: rgb(16 185 129);
}

.qy-progress__dashboard-text--exception {
  color: rgb(239 68 68);
}

.qy-progress__dashboard-text--warning {
  color: rgb(245 158 11);
}

@keyframes progress-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes progress-stripe-flow {
  0% {
    background-position: 1rem 0;
  }
  100% {
    background-position: 0 0;
  }
}

@keyframes circle-progress {
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: var(--stroke-dashoffset);
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .qy-progress__bar-outer {
    background-color: rgb(51 65 85 / 80%);
  }

  .qy-progress__text {
    color: rgb(203 213 225);
  }

  .qy-progress__circle-bg,
  .qy-progress__dashboard-bg {
    stroke: rgb(51 65 85 / 80%);
  }

  .qy-progress__circle-text,
  .qy-progress__dashboard-text {
    color: rgb(203 213 225);
  }
}
</style>
