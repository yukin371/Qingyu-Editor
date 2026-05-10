<template>
  <div :class="sectionClasses">
    <div v-if="label || $slots.label" class="qy-form-section__label">
      <slot name="label">
        <label class="qy-form-section__label-text">
          {{ label }}
          <span v-if="required" class="qy-form-section__required">*</span>
        </label>
        <span v-if="description" class="qy-form-section__description">{{ description }}</span>
      </slot>
    </div>

    <div class="qy-form-section__content">
      <slot />
    </div>

    <div v-if="$slots.hint || hint" class="qy-form-section__hint">
      <slot name="hint">
        <span class="qy-form-section__hint-text">{{ hint }}</span>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label?: string
  description?: string
  hint?: string
  required?: boolean
  layout?: 'vertical' | 'horizontal'
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  layout: 'vertical'
})

const sectionClasses = computed(() => {
  return [
    'qy-form-section',
    `qy-form-section--${props.layout}`
  ]
})
</script>

<style scoped lang="scss">
.qy-form-section {
  margin-bottom: 1.5rem;
}

.qy-form-section__label {
  margin-bottom: 0.5rem;
}

.qy-form-section__label-text {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #212121;
  margin-bottom: 0.25rem;
}

.qy-form-section__required {
  color: #F44336;
  margin-left: 0.125rem;
}

.qy-form-section__description {
  display: block;
  font-size: 0.75rem;
  color: #757575;
  margin-top: 0.25rem;
}

.qy-form-section__content {
  position: relative;
}

.qy-form-section__hint {
  margin-top: 0.5rem;
}

.qy-form-section__hint-text {
  font-size: 0.75rem;
  color: #9E9E9E;
}

// 水平布局
.qy-form-section--horizontal {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.qy-form-section--horizontal .qy-form-section__label {
  flex: 0 0 150px;
  margin-bottom: 0;
  padding-top: 0.5rem;
}

.qy-form-section--horizontal .qy-form-section__content {
  flex: 1;
}
</style>

