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
  border: 1px solid rgba(148, 163, 184, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  &.is-ready {
    border-color: rgba(34, 197, 94, 0.35);
    background: rgba(240, 253, 244, 0.86);
  }

  &.is-blocked {
    border-color: rgba(245, 158, 11, 0.3);
    background: rgba(255, 251, 235, 0.9);
  }
}

.inspiration-gate-summary__pill {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
  color: #92400e;
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
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(248, 250, 252, 0.78);
  color: var(--editor-text-secondary, #475569);

  &.is-done {
    border-color: rgba(34, 197, 94, 0.24);
    background: rgba(240, 253, 244, 0.86);
    color: #166534;
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
