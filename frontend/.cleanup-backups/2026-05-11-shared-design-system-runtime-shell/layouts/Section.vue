<template>
  <section :class="sectionClasses">
    <div v-if="$slots.title || title" class="qy-section__header">
      <slot name="title">
        <h2 class="qy-section__title">{{ title }}</h2>
      </slot>
      <div v-if="$slots.extra" class="qy-section__extra">
        <slot name="extra" />
      </div>
    </div>

    <div class="qy-section__content">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  spacing?: 'sm' | 'md' | 'lg'
  bordered?: boolean
  background?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  spacing: 'md',
  bordered: false,
  background: false
})

const sectionClasses = computed(() => {
  return [
    'qy-section',
    `qy-section--spacing-${props.spacing}`,
    {
      'qy-section--bordered': props.bordered,
      'qy-section--background': props.background
    }
  ]
})
</script>

<style scoped lang="scss">
.qy-section__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.qy-section__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #212121;
  margin: 0;
}

.qy-section__extra {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qy-section__content {
  position: relative;
}

// 间距变体
.qy-section--spacing-sm {
  padding: 1rem 0;
}

.qy-section--spacing-md {
  padding: 1.5rem 0;
}

.qy-section--spacing-lg {
  padding: 2rem 0;
}

// 边框变体
.qy-section--bordered {
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  padding: 1.5rem;
}

// 背景变体
.qy-section--background {
  background-color: #FAFAFA;
  border-radius: 8px;
  padding: 1.5rem;
}
</style>

