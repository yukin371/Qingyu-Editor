<template>
  <div :class="rowClasses" :style="rowStyles">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RowProps } from './types'

const props = withDefaults(defineProps<RowProps>(), {
  gutter: 0,
  justify: 'start',
  align: 'top'
})

const rowClasses = computed(() => [
  'qy-row',
  `qy-row--justify-${props.justify}`,
  `qy-row--align-${props.align}`
])

const rowStyles = computed(() => {
  if (props.gutter) {
    return {
      marginLeft: `-${Number(props.gutter) / 2}px`,
      marginRight: `-${Number(props.gutter) / 2}px`
    }
  }
  return {}
})

defineOptions({ name: 'QyRow' })
</script>

<style scoped lang="scss">
.qy-row {
  display: flex;
  flex-wrap: wrap;
  box-sizing: border-box;

  &--justify-start {
    justify-content: flex-start;
  }

  &--justify-center {
    justify-content: center;
  }

  &--justify-end {
    justify-content: flex-end;
  }

  &--justify-space-between {
    justify-content: space-between;
  }

  &--justify-space-around {
    justify-content: space-around;
  }

  &--justify-space-evenly {
    justify-content: space-evenly;
  }

  &--align-top {
    align-items: flex-start;
  }

  &--align-middle {
    align-items: center;
  }

  &--align-bottom {
    align-items: flex-end;
  }

  &--align-stretch {
    align-items: stretch;
  }
}
</style>
