<template>
  <section class="inspiration-gate-summary">
    <div class="inspiration-gate-summary__card" :class="`is-${status}`">
      <strong>{{ status === 'ready' ? '可推进到阶段 2' : '仍有阻塞项' }}</strong>
      <span class="inspiration-gate-summary__pill">
        {{ status === 'ready' ? 'READY' : 'BLOCKED' }}
      </span>
    </div>

    <div class="inspiration-gate-summary__items">
      <div
        v-for="item in items"
        :key="item.label"
        class="inspiration-gate-summary__item"
        :class="{ 'is-done': item.done }"
      >
        <span>{{ item.label }}</span>
        <strong>{{ item.done ? '完成' : '待补齐' }}</strong>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  status: 'ready' | 'blocked'
  items: Array<{ label: string; done: boolean }>
}>()
</script>

<style scoped lang="scss">
.inspiration-gate-summary {
  display: grid;
  gap: 10px;
}

.inspiration-gate-summary__card {
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(148, 163, 184, 0.2)) 42%, transparent);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: color-mix(in srgb, var(--editor-layer-panel, rgba(255, 255, 255, 0.82)) 88%, transparent);

  &.is-ready {
    border-color: color-mix(in srgb, var(--color-success-500, rgba(34, 197, 94, 0.35)) 30%, transparent);
    background: color-mix(in srgb, var(--editor-layer-accent, rgba(240, 253, 244, 0.86)) 38%, var(--editor-layer-panel, rgba(255, 255, 255, 0.82)) 62%);
  }

  &.is-blocked {
    border-color: color-mix(in srgb, var(--color-warning-500, rgba(245, 158, 11, 0.3)) 28%, transparent);
    background: color-mix(
      in srgb,
      var(--editor-layer-accent, rgba(255, 251, 235, 0.9)) 34%,
      var(--editor-layer-panel, rgba(255, 255, 255, 0.82)) 66%
    );
  }
}

.inspiration-gate-summary__pill {
  padding: 6px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--editor-bg-elevated, rgba(15, 23, 42, 0.08)) 52%, transparent);
  color: var(--color-warning-700, #92400e);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.inspiration-gate-summary__items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.inspiration-gate-summary__item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(148, 163, 184, 0.18)) 42%, transparent);
  background: color-mix(in srgb, var(--editor-layer-glass, rgba(248, 250, 252, 0.78)) 88%, transparent);
  color: var(--editor-text-secondary, #475569);

  &.is-done {
    border-color: color-mix(in srgb, var(--color-success-500, rgba(34, 197, 94, 0.24)) 24%, transparent);
    background: color-mix(in srgb, var(--editor-layer-accent, rgba(240, 253, 244, 0.86)) 34%, var(--editor-layer-glass, rgba(248, 250, 252, 0.78)) 66%);
    color: var(--color-success-700, #166534);
  }

  span {
    font-size: 12px;
    font-weight: 600;
  }

  strong {
    font-size: 11px;
    line-height: 1;
  }
}
</style>
