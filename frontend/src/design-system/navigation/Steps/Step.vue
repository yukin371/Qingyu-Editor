<script setup lang="ts">
/**
 * Step 组件
 *
 * 步骤条中的单个步骤项
 */

import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
import { cn } from '../../utils/cn'
import type { StepEmits, StepProps } from './types'
import { STEPS_KEY, type StepsContext } from './constants'

// 组件 Props
const props = withDefaults(defineProps<StepProps>(), {
  status: undefined,
})

// 组件 Emits
const emit = defineEmits<StepEmits>()

// 注入 Steps 上下文
const stepsContext = inject<StepsContext>(STEPS_KEY, {
  currentStep: ref(0),
  direction: ref('horizontal'),
  simple: ref(false),
  finishStatus: ref('finish'),
  processStatus: ref('process'),
  stepCount: ref(0),
  handleClick: () => {},
} as StepsContext)

// 计算步骤索引（需要在挂载时设置）
let stepIndex = 0

// 注册步骤
onMounted(() => {
  stepIndex = stepsContext.stepCount.value
  stepsContext.stepCount.value++
})

// 注销步骤
onUnmounted(() => {
  stepsContext.stepCount.value--
})

// 计算步骤状态
const stepStatus = computed(() => {
  // 如果明确指定了状态，使用指定的状态
  if (props.status) {
    return props.status
  }

  const current = stepsContext.currentStep.value

  // 当前步骤
  if (stepIndex === current) {
    return stepsContext.processStatus.value
  }

  // 已完成步骤
  if (stepIndex < current) {
    return stepsContext.finishStatus.value
  }

  // 等待步骤
  return 'wait'
})

// 是否是最后一个步骤
const isLast = computed(() => {
  // 简化判断，实际应该通过父组件传入
  return false
})

// 计算容器类名
const stepClasses = computed(() =>
  cn(
    // 基础样式
    'step flex',
    // 方向样式
    stepsContext.direction.value === 'horizontal'
      ? 'flex-row items-center flex-1'
      : 'flex-col items-start',
    // 简洁模式
    stepsContext.simple.value ? 'step-simple' : '',
    // 状态样式
    `step-${stepStatus.value}`,
    props.class
  )
)

// 计算图标容器类名
const iconClasses = computed(() =>
  cn(
    // 基础样式
    'step-icon flex items-center justify-center',
    // 尺寸
    stepsContext.simple.value ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm',
    // 圆形
    'rounded-full border-2 transition-all duration-300',
    // 状态样式
    stepStatus.value === 'finish'
      ? 'bg-primary-500 border-primary-500 text-white'
      : stepStatus.value === 'process'
        ? 'bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
        : stepStatus.value === 'error'
          ? 'bg-red-50 border-red-500 text-red-500 dark:bg-red-900/20'
          : stepStatus.value === 'success'
            ? 'bg-green-50 border-green-500 text-green-500 dark:bg-green-900/20'
            : 'bg-white border-slate-300 text-slate-400 dark:bg-slate-800 dark:border-slate-600'
  )
)

// 计算内容容器类名
const contentClasses = computed(() =>
  cn(
    // 基础样式
    'step-content',
    // 间距
    stepsContext.direction.value === 'horizontal' ? 'ml-3 flex-1' : 'ml-3 mt-2',
    // 居中对齐
    'flex flex-col'
  )
)

// 计算标题类名
const titleClasses = computed(() =>
  cn(
    // 基础样式
    'step-title font-medium',
    // 状态颜色
    stepStatus.value === 'finish'
      ? 'text-slate-900 dark:text-slate-100'
      : stepStatus.value === 'process'
        ? 'text-primary-600 dark:text-primary-400'
        : stepStatus.value === 'error'
          ? 'text-red-500'
          : 'text-slate-500 dark:text-slate-400'
  )
)

// 计算描述类名
const descriptionClasses = computed(() =>
  cn(
    // 基础样式
    'step-description text-sm mt-1',
    // 状态颜色
    stepStatus.value === 'wait'
      ? 'text-slate-400 dark:text-slate-500'
      : 'text-slate-500 dark:text-slate-400'
  )
)

// 计算线条类名
const lineClasses = computed(() =>
  cn(
    // 基础样式
    'step-line flex-1',
    // 方向
    stepsContext.direction.value === 'horizontal' ? 'h-0.5 mx-2' : 'w-0.5 my-2 ml-4',
    // 颜色
    stepStatus.value === 'finish'
      ? 'bg-primary-500'
      : 'bg-slate-200 dark:bg-slate-700'
  )
)

// 计算是否显示完成图标
const showCheckIcon = computed(() => stepStatus.value === 'finish' && !props.icon)

// 计算是否显示错误图标
const showErrorIcon = computed(() => stepStatus.value === 'error' && !props.icon)

// 处理点击
const handleClick = () => {
  emit('click', stepIndex)
  stepsContext.handleClick(stepIndex)
}
</script>

<template>
  <div
    :class="stepClasses"
    role="listitem"
    :aria-current="stepStatus === 'process' ? 'step' : undefined"
    class="cursor-pointer"
    @click="handleClick"
  >
    <!-- 步骤图标/序号 -->
    <div :class="iconClasses">
      <!-- 自定义图标插槽 -->
      <slot name="icon">
        <!-- 完成状态图标 -->
        <svg
          v-if="showCheckIcon"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <!-- 错误状态图标 -->
        <svg
          v-else-if="showErrorIcon"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <!-- 默认序号 -->
        <span v-else>{{ stepIndex + 1 }}</span>
      </slot>
    </div>

    <!-- 步骤内容 -->
    <div :class="contentClasses">
      <!-- 标题 -->
      <div :class="titleClasses">
        <slot name="title">{{ title }}</slot>
      </div>
      <!-- 描述 -->
      <div v-if="description || $slots.description" :class="descriptionClasses">
        <slot name="description">{{ description }}</slot>
      </div>
    </div>

    <!-- 连接线（非最后一个步骤） -->
    <div v-if="!isLast" :class="lineClasses"></div>
  </div>
</template>

<style scoped>
.step:focus-visible .step-icon {
  outline: 2px solid rgb(59 130 246);
  outline-offset: 2px;
}
</style>
