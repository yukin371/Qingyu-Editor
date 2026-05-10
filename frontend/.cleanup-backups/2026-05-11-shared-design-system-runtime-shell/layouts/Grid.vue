<template>
  <div :class="gridClasses" :style="gridStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  cols?: number | { sm?: number; md?: number; lg?: number; xl?: number }
  gap?: 'sm' | 'md' | 'lg'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
}

const props = withDefaults(defineProps<Props>(), {
  cols: 3,
  gap: 'md',
  align: 'stretch',
  justify: 'start'
})

const gridClasses = computed(() => {
  return [
    'qy-grid',
    `qy-grid--gap-${props.gap}`,
    `qy-grid--align-${props.align}`,
    `qy-grid--justify-${props.justify}`
  ]
})

const gridStyle = computed(() => {
  const style: Record<string, string> = {}

  if (typeof props.cols === 'number') {
    style.gridTemplateColumns = `repeat(${props.cols}, 1fr)`
  }

  return style
})
</script>

<style scoped lang="scss">
.qy-grid {
  display: grid;

  // 间距变体
  &--gap-sm {
    gap: 0.5rem;
  }

  &--gap-md {
    gap: 1rem;
  }

  &--gap-lg {
    gap: 1.5rem;
  }

  // 对齐方式
  &--align-start {
    align-items: start;
  }

  &--align-center {
    align-items: center;
  }

  &--align-end {
    align-items: end;
  }

  &--align-stretch {
    align-items: stretch;
  }

  // 分布方式
  &--justify-start {
    justify-content: start;
  }

  &--justify-center {
    justify-content: center;
  }

  &--justify-end {
    justify-content: end;
  }

  &--justify-between {
    justify-content: space-between;
  }

  &--justify-around {
    justify-content: space-around;
  }

  // 响应式列数
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }

  @media (min-width: 641px) and (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

