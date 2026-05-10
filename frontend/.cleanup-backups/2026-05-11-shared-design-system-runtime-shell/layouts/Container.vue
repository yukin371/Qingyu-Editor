<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { Container as CanonicalContainer } from '@/design-system/layout'

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
  fluid: false,
})

const attrs = useAttrs()

const containerSize = computed<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'>(() => {
  if (props.fluid) {
    return 'full'
  }

  const sizeMap = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
    full: 'full',
  } as const

  return sizeMap[props.maxWidth] ?? 'lg'
})
</script>

<template>
  <CanonicalContainer
    v-bind="attrs"
    :size="containerSize"
    :padding="padding"
    :centered="centered"
    :fluid="fluid"
  >
    <slot />
  </CanonicalContainer>
</template>
