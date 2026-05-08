<template>
  <div :class="containerClasses" :style="containerStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: boolean
  centered?: boolean
  fluid?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: 'lg',
  padding: true,
  centered: true,
  fluid: false
})

const containerClasses = computed(() => {
  return [
    'qy-container',
    {
      'qy-container--centered': props.centered,
      'qy-container--padded': props.padding,
      'qy-container--fluid': props.fluid
    }
  ]
})

const containerStyle = computed(() => {
  if (props.fluid) return {}
  
  const maxWidths = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    full: '100%'
  }
  
  return {
    maxWidth: maxWidths[props.maxWidth]
  }
})
</script>

<style scoped lang="scss">
.qy-container {
  width: 100%;
  
  &--centered {
    margin-left: auto;
    margin-right: auto;
  }
  
  &--padded {
    padding-left: 1rem;
    padding-right: 1rem;
    
    @media (min-width: 768px) {
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }
  }
  
  &--fluid {
    max-width: 100%;
  }
}
</style>

