<template>
  <header class="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
    <div class="space-y-1.5 pt-1">
      <p class="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
        {{ eyebrow }}
      </p>
      <h1 class="text-[2.25rem] font-semibold tracking-tight text-slate-950 lg:text-[2.5rem]">
        {{ title }}
      </h1>
      <p class="max-w-3xl text-[15px] leading-6 text-slate-500">{{ description }}</p>
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
