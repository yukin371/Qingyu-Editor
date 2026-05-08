<template>
  <component
    :is="tag"
    :class="[
      'rounded-2xl border border-slate-200 bg-white/95 shadow-sm transition',
      padded ? 'p-5 md:p-6' : '',
      centered ? 'text-center' : '',
      interactive ? 'cursor-pointer hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg' : ''
    ]"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    tag?: string
    padded?: boolean
    centered?: boolean
    interactive?: boolean
  }>(),
  {
    tag: 'div',
    padded: true,
    centered: false,
    interactive: false
  }
)
</script>
