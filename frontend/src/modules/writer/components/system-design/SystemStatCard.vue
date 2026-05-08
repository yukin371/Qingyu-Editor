<template>
  <section class="system-stat-card" :class="toneClass">
    <div class="system-stat-card__label">{{ label }}</div>
    <div class="system-stat-card__value">{{ value }}</div>
    <div v-if="hint" class="system-stat-card__hint">{{ hint }}</div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type StatTone = 'default' | 'info' | 'success' | 'warning'

const props = withDefaults(
  defineProps<{
    label: string
    value: string | number
    hint?: string
    tone?: StatTone
  }>(),
  {
    hint: '',
    tone: 'default',
  },
)

const toneClass = computed(() => `system-stat-card--${props.tone}`)
</script>

<style scoped lang="scss">
.system-stat-card {
  border-radius: 12px;
  border: 1px solid #d9e2f1;
  background: linear-gradient(160deg, #ffffff 0%, #f6f9ff 100%);
  padding: 10px 12px;
  min-width: 0;
}

.system-stat-card__label {
  font-size: 11px;
  font-weight: 700;
  color: #64728f;
}

.system-stat-card__value {
  margin-top: 4px;
  font-size: 18px;
  line-height: 1.1;
  font-weight: 800;
  color: #1a2f56;
}

.system-stat-card__hint {
  margin-top: 4px;
  font-size: 11px;
  color: #7684a1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.system-stat-card--info {
  border-color: #c7dcff;
  background: linear-gradient(160deg, #f7fbff 0%, #eaf2ff 100%);
}

.system-stat-card--success {
  border-color: #cde8d6;
  background: linear-gradient(160deg, #f7fffb 0%, #ebf9ef 100%);
}

.system-stat-card--warning {
  border-color: #f2dfbe;
  background: linear-gradient(160deg, #fffbf2 0%, #fdf4df 100%);
}
</style>
