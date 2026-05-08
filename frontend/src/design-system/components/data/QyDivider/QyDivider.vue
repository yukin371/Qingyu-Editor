<template>
  <div
    :class="containerClasses"
    role="separator"
    :aria-orientation="direction"
  >
    <span
      v-if="content || $slots.default"
      :class="contentClasses"
    >
      <slot>{{ content }}</slot>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { dividerVariants, dividerContentVariants } from './variants'
import type { QyDividerProps } from './types'

// Props
const props = withDefaults(defineProps<QyDividerProps>(), {
  direction: 'horizontal',
  contentPosition: 'center',
  dashed: false,
  borderStyle: 'solid'
})

// 计算容器类名
const containerClasses = computed(() => {
  return dividerVariants({
    direction: props.direction,
    dashed: props.dashed || props.borderStyle === 'dashed'
  })
})

// 计算内容类名
const contentClasses = computed(() => {
  return dividerContentVariants({
    position: props.contentPosition
  })
})
</script>
