<template>
  <button
    class="group relative overflow-hidden rounded-[28px] border border-white/70 bg-white/90 p-5 text-left shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)] disabled:cursor-default"
    :class="{ 'cursor-pointer': clickable, 'cursor-default': !clickable }"
    :disabled="!clickable"
    type="button"
    @click="handleClick"
  >
    <div class="absolute inset-0 opacity-90" :style="{ background: accentGlow }"></div>
    <div class="relative flex items-start justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          {{ eyebrow }}
        </p>
        <h3 class="mt-3 text-3xl font-black text-slate-900">{{ value }}</h3>
        <p class="mt-2 text-sm text-slate-500">{{ title }}</p>
      </div>
      <div
        class="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold text-white shadow-lg"
        :style="{ background: accent }"
      >
        {{ icon }}
      </div>
    </div>
    <div class="relative mt-5 flex items-center justify-between text-xs text-slate-500">
      <span>{{ subtitle }}</span>
      <span
        v-if="trend !== undefined"
        class="rounded-full px-2.5 py-1 font-semibold"
        :class="trendClass"
      >
        {{ trendPrefix }}{{ Math.abs(trend) }}%
      </span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    value: string | number
    subtitle?: string
    icon?: string
    accent?: string
    accentGlow?: string
    trend?: number
    clickable?: boolean
  }>(),
  {
    eyebrow: '配额指标',
    subtitle: '',
    icon: 'AI',
    accent: 'linear-gradient(135deg, #2563eb 0%, #0f766e 100%)',
    accentGlow: 'radial-gradient(circle at top right, rgba(37,99,235,0.14), transparent 45%)',
    trend: undefined,
    clickable: false,
  },
)

const emit = defineEmits<{
  click: []
}>()

const trendClass = computed(() =>
  props.trend === undefined
    ? ''
    : props.trend >= 0
      ? 'bg-emerald-50 text-emerald-600'
      : 'bg-rose-50 text-rose-600',
)

const trendPrefix = computed(() => (props.trend === undefined ? '' : props.trend >= 0 ? '+' : '-'))

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>
