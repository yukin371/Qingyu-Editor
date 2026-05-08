<template>
  <div :class="['qy-descriptions', `qy-descriptions--${size}`]">
    <!-- Title -->
    <div v-if="title" class="qy-descriptions__title">
      {{ title }}
    </div>

    <!-- Header (when border mode) -->
    <div v-if="border" class="qy-descriptions__header">
      <div class="qy-descriptions__header-label">属性</div>
      <div class="qy-descriptions__header-value">值</div>
    </div>

    <!-- Content -->
    <div class="qy-descriptions__body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DescriptionsProps } from './types'

const props = withDefaults(defineProps<DescriptionsProps>(), {
  size: 'default',
  border: true,
  column: 3,
  layout: 'horizontal',
  labelPlacement: 'left',
})

defineOptions({ name: 'QyDescriptions' })
</script>

<style scoped lang="scss">
// Apple/Google settings-style descriptions
// Clean, minimal key-value display

.qy-descriptions {
  width: 100%;

  &__title {
    font-size: 17px;
    font-weight: 600;
    color: #1d1d1f;
    margin-bottom: 16px;
    padding: 0 4px;
  }

  &__header {
    display: flex;
    background: #f5f5f7;
    border-radius: 12px 12px 0 0;
    padding: 12px 20px;
    font-size: 13px;
    font-weight: 600;
    color: #6e6e73;
    text-transform: uppercase;
    letter-spacing: 0.02em;

    &-label {
      flex: 0 0 40%;
    }

    &-value {
      flex: 1;
    }
  }

  &__body {
    background: #fff;
    border-radius: 0 0 12px 12px;
    overflow: hidden;
  }

  // Size variants
  &--small {
    .qy-descriptions__header {
      padding: 8px 16px;
      font-size: 12px;
    }
  }

  &--large {
    .qy-descriptions__header {
      padding: 16px 24px;
      font-size: 14px;
    }
  }
}
</style>
