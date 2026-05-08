<script setup lang="ts">
/**
 * Steps 组件
 *
 * 引导用户按照流程完成任务的导航条
 */

import { computed, provide, ref, watch } from 'vue'
import { cn } from '../../utils/cn'
import type { StepsEmits, StepsProps } from './types'
import { STEPS_KEY } from './constants'

// 组件 Props
const props = withDefaults(defineProps<StepsProps>(), {
  current: 0,
  direction: 'horizontal',
  alignCenter: false,
  simple: false,
  finishStatus: 'finish',
  processStatus: 'process',
})

// 组件 Emits
const emit = defineEmits<StepsEmits>()

// 响应式状态
const currentStep = ref(props.current)

// 监听 current 变化
watch(
  () => props.current,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      currentStep.value = newVal
      emit('change', newVal, oldVal ?? 0)
    }
  }
)

// 计算样式类名
const stepsClasses = computed(() =>
  cn(
    // 基础样式
    'steps',
    // 方向样式
    props.direction === 'horizontal'
      ? 'steps-horizontal flex flex-row items-center'
      : 'steps-vertical flex flex-col',
    // 对齐方式
    props.alignCenter && props.direction === 'horizontal'
      ? 'steps-centered'
      : '',
    // 简洁模式
    props.simple ? 'steps-simple' : '',
    props.class
  )
)

// 提供上下文给子组件
provide(STEPS_KEY, {
  currentStep,
  direction: computed(() => props.direction),
  simple: computed(() => props.simple),
  finishStatus: computed(() => props.finishStatus),
  processStatus: computed(() => props.processStatus),
  stepCount: ref(0),
  handleClick: (index: number) => {
    emit('change', index, currentStep.value)
  },
})
</script>

<template>
  <div :class="stepsClasses" role="list">
    <slot />
  </div>
</template>

<style scoped>
.steps {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* 水平步骤条 */
.steps-horizontal {
  gap: 0;
}

/* 垂直步骤条 */
.steps-vertical {
  gap: 0;
}

/* 居中对齐 */
.steps-centered {
  justify-content: center;
}
</style>
