<template>
  <section class="tool-state-card tool-state-card--error" role="status" aria-live="polite">
    <div class="tool-state-card__header">
      <strong>{{ title }}</strong>
      <span class="tool-state-card__badge">{{ badge }}</span>
    </div>
    <p class="tool-state-card__detail">{{ message }}</p>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    message: string
    title?: string
    badge?: string
  }>(),
  {
    title: '当前不可执行',
    badge: '错误',
  },
)
</script>

<style scoped lang="scss">
@use './shared.scss';
</style>
