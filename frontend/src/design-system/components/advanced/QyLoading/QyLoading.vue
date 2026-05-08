<template>
  <div :class="loadingClasses">
    <!-- Spinner -->
    <div
      :class="spinnerClasses"
      :style="spinnerStyle"
    />

    <!-- Loading Text -->
    <p v-if="text" class="qy-loading__text">
      {{ text }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QyLoadingProps } from './types'

// Props
const props = withDefaults(defineProps<QyLoadingProps>(), {
  size: 'md',
  color: 'cyan',
  text: '',
  fullscreen: false
})

// Compute container classes
const loadingClasses = computed(() => {
  const classes = [
    'qy-loading',
    props.fullscreen && 'qy-loading--fullscreen'
  ]
  return classes.filter(Boolean).join(' ')
})

// Compute spinner size
const spinnerSize = computed(() => {
  const sizes = {
    sm: '24px',
    md: '40px',
    lg: '56px'
  }
  return sizes[props.size]
})

// Compute spinner border width
const borderWidth = computed(() => {
  const widths = {
    sm: '3px',
    md: '4px',
    lg: '5px'
  }
  return widths[props.size]
})

// Compute spinner colors
const spinnerColors = computed(() => {
  const colors = {
    cyan: {
      border: 'rgb(165 243 252)', // primary-200
      active: 'rgb(8 145 178)' // primary-600
    },
    blue: {
      border: 'rgb(191 219 254)', // secondary-200
      active: 'rgb(37 99 235)' // secondary-600
    },
    white: {
      border: 'rgb(255 255 255 / 0.3)',
      active: 'rgb(255 255 255)'
    }
  }
  return colors[props.color]
})

// Compute spinner classes
const spinnerClasses = computed(() => {
  return 'qy-loading__spinner animate-spin'
})

// Compute spinner inline styles
const spinnerStyle = computed(() => ({
  width: spinnerSize.value,
  height: spinnerSize.value,
  borderWidth: borderWidth.value,
  borderColor: spinnerColors.value.border,
  borderTopColor: spinnerColors.value.active
}))
</script>

<style scoped>
.qy-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.qy-loading--fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: rgb(15 23 42 / 0.5);
  backdrop-filter: blur(4px);
}

.qy-loading__spinner {
  border-style: solid;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.qy-loading__text {
  margin: 0;
  font-size: 0.875rem;
  color: rgb(71 85 105);
  text-align: center;
}

.qy-loading--fullscreen .qy-loading__text {
  color: rgb(255 255 255);
}
</style>
