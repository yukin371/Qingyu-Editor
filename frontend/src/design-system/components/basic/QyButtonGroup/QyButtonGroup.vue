<template>
  <div :class="groupClasses" role="group" :aria-label="props.label">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ButtonGroupProps } from './types'

const props = withDefaults(defineProps<ButtonGroupProps>(), {
  size: 'md',
  disabled: false,
})

const groupClasses = computed(() => [
  'qy-button-group',
  `qy-button-group--${props.size}`,
  { 'qy-button-group--disabled': props.disabled },
])

defineOptions({ name: 'QyButtonGroup' })
</script>

<style scoped lang="scss">
// Apple/Google style button group
// Clean, minimal with connected buttons

.qy-button-group {
  display: inline-flex;
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.08);

  :deep(.qy-button) {
    border-radius: 0;
    box-shadow: none;

    &:not(:last-child) {
      border-right: 1px solid rgba(0, 0, 0, 0.08);
    }

    &:hover {
      position: relative;
      z-index: 1;
    }

    &:first-child {
      border-radius: 12px 0 0 12px;
    }

    &:last-child {
      border-radius: 0 12px 12px 0;
    }

    &:only-child {
      border-radius: 12px;
    }
  }

  &--sm {
    :deep(.qy-button) {
      padding: 6px 12px;
      font-size: 13px;
      border-radius: 0;

      &:first-child {
        border-radius: 8px 0 0 8px;
      }

      &:last-child {
        border-radius: 0 8px 8px 0;
      }

      &:only-child {
        border-radius: 8px;
      }
    }
  }

  &--lg {
    :deep(.qy-button) {
      padding: 12px 24px;
      font-size: 16px;
      border-radius: 0;

      &:first-child {
        border-radius: 16px 0 0 16px;
      }

      &:last-child {
        border-radius: 0 16px 16px 0;
      }

      &:only-child {
        border-radius: 16px;
      }
    }
  }

  &--disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}
</style>
