<script setup lang="ts">
/**
 * DialogFooter 对话框底部组件 (Apple Style)
 *
 * Apple 风格底部区域，无分割线，柔和间距
 */

import { computed } from 'vue'
import { cn } from '../../utils/cn'

interface DialogFooterProps {
  /**
   * 对齐方式
   * @default 'end'
   */
  justify?: 'start' | 'center' | 'end' | 'between'

  /**
   * 自定义类名
   */
  class?: any
}

const props = withDefaults(defineProps<DialogFooterProps>(), {
  justify: 'end',
})

const justifyMap: Record<string, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
}

const classes = computed(() =>
  cn(
    'flex items-center gap-3 px-6 py-4',
    justifyMap[props.justify],
    props.class,
  )
)
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
