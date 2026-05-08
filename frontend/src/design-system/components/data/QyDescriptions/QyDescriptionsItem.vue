<template>
  <div
    :class="[
      'qy-descriptions-item',
      `qy-descriptions-item--align-${align}`,
      `qy-descriptions-item--span-${span}`,
    ]"
  >
    <div class="qy-descriptions-item__label">
      <slot name="label">{{ label }}</slot>
    </div>
    <div class="qy-descriptions-item__value">
      <slot>{{ value }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DescriptionsItemProps } from './types'

const props = withDefaults(defineProps<DescriptionsItemProps>(), {
  span: 1,
  align: 'left',
})

defineOptions({ name: 'QyDescriptionsItem' })
</script>

<style scoped lang="scss">
// Descriptions Item - Apple settings style
// Clean separator lines between items

.qy-descriptions-item {
  display: contents;

  &__label {
    padding: 14px 20px;
    font-size: 14px;
    color: #1d1d1f;
    font-weight: 500;
    background: #fafafa;
    border-bottom: 1px solid #e5e5e5;
    display: flex;
    align-items: center;

    .qy-descriptions--vertical & {
      background: #f5f5f7;
    }
  }

  &__value {
    padding: 14px 20px;
    font-size: 14px;
    color: #424245;
    background: #fff;
    border-bottom: 1px solid #e5e5e5;
    display: flex;
    align-items: center;

    .qy-descriptions--vertical & {
      background: #fafafa;
    }
  }

  // Alignment
  &--align-left &__value {
    justify-content: flex-start;
  }

  &--align-center &__value {
    justify-content: center;
  }

  &--align-right &__value {
    justify-content: flex-end;
  }

  // Span handling
  &--span-2 {
    grid-column: span 2;
  }

  &--span-3 {
    grid-column: span 3;
  }

  // Last item - remove bottom border
  &:last-child {
    .qy-descriptions-item__label,
    .qy-descriptions-item__value {
      border-bottom: none;
    }
  }
}

// Non-border mode style
.qy-descriptions:not(.qy-descriptions--border) {
  .qy-descriptions-item__label {
    background: transparent;
    padding: 8px 12px 8px 0;
    border-bottom: 1px dashed #e5e5e5;
  }

  .qy-descriptions-item__value {
    background: transparent;
    padding: 8px 0;
    border-bottom: 1px dashed #e5e5e5;
  }

  .qy-descriptions-item:last-child {
    .qy-descriptions-item__label,
    .qy-descriptions-item__value {
      border-bottom: none;
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .qy-descriptions-item {
    flex-direction: column;

    &__label {
      padding: 12px 16px 4px;
    }

    &__value {
      padding: 4px 16px 12px;
    }
  }
}
</style>
