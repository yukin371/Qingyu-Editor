<script setup lang="ts">
/**
 * Timeline 组件
 *
 * 时间线容器组件，支持左侧布局、右侧布局和交替居中布局
 */

import { computed, provide, ref } from 'vue'
import { cn } from '../../utils/cn'
import type { TimelineProps } from './types'

const props = withDefaults(defineProps<TimelineProps>(), {
  orientation: 'vertical',
  placement: 'left',
})

// 向子组件注入布局方式
provide('timelinePlacement', props.placement)
provide('timelineOrientation', props.orientation)

const nextAlternateIndex = ref(0)
provide('timelineNextIndex', () => nextAlternateIndex.value++)

// alternate 模式下内容区宽度占比（左 50% - 节点区域，右 50% - 节点区域）
const isHorizontal = computed(() => props.orientation === 'horizontal')
const isAlternate = computed(() => props.placement === 'alternate')
const isRight = computed(() => props.placement === 'right')

const containerClasses = computed(() =>
  cn('relative', isHorizontal.value && 'overflow-x-auto pb-4', props.class),
)

const horizontalRailClasses = computed(() =>
  cn('relative flex min-w-max snap-x snap-mandatory gap-6 px-4 pb-4 pt-4'),
)

// 中心连接线 - 仅 alternate 模式下显示
const lineClasses = computed(() =>
  cn(
    'pointer-events-none absolute bg-gradient-to-b from-blue-400 via-purple-400 to-amber-400 dark:from-blue-500 dark:via-purple-500 dark:to-amber-500',
    isHorizontal.value
      ? 'left-[8rem] right-[8rem] top-[4.5rem] h-px w-auto bg-gradient-to-r'
      : isAlternate.value
        ? 'bottom-0 top-0 left-1/2 w-px -translate-x-1/2'
        : isRight.value
          ? 'bottom-0 top-0 left-5 w-px sm:left-auto sm:right-5'
          : 'left-5 bottom-0 top-0 w-px',
  ),
)
</script>

<template>
  <div :class="containerClasses">
    <template v-if="isHorizontal">
      <div :class="horizontalRailClasses">
        <div :class="lineClasses" aria-hidden="true" />
        <slot />
      </div>
    </template>
    <template v-else>
      <!-- 连接线 -->
      <div :class="lineClasses" aria-hidden="true" />

      <!-- 插槽内容 -->
      <slot />
    </template>
  </div>
</template>
