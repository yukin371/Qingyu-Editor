<template>
  <header class="workbench-page-header flex flex-col gap-4 pb-5 lg:flex-row lg:items-start lg:justify-between">
    <div class="space-y-1.5 pt-1">
      <p class="workbench-page-header__eyebrow text-xs font-medium uppercase tracking-[0.24em]">
        {{ eyebrow }}
      </p>
      <h1 class="workbench-page-header__title text-[2.25rem] font-semibold tracking-tight lg:text-[2.5rem]">
        {{ title }}
      </h1>
      <p class="workbench-page-header__desc max-w-3xl text-[15px] leading-6">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap gap-3 pt-1 lg:justify-end">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description: string
    eyebrow?: string
  }>(),
  {
    eyebrow: '作者工作台',
  },
)
</script>

<style scoped>
.workbench-page-header {
  border-bottom: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 68%, transparent);
}

.workbench-page-header__eyebrow {
  color: var(--editor-text-ghost, #94a3b8);
}

.workbench-page-header__title {
  color: var(--editor-text-primary, #0f172a);
}

.workbench-page-header__desc {
  color: var(--editor-text-muted, #64748b);
}
</style>
