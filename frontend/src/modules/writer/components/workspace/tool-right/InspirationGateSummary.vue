<template>
  <section class="inspiration-gate-summary">
    <div class="inspiration-gate-summary__line" :class="`is-${status}`">
      <strong>{{ status === 'ready' ? '阶段 1 已就绪' : '阶段 1 待补齐' }}</strong>
      <span class="inspiration-gate-summary__pill">
        {{ items.filter((item) => item.done).length }}/{{ items.length }}
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

.inspiration-gate-summary__line {
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--editor-text-primary, #0f172a);

  &.is-ready {
    color: var(--color-success-700, #166534);
  }

  &.is-blocked {
    color: var(--editor-text-primary, #0f172a);
  }
}

.inspiration-gate-summary__pill {
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--editor-bg-surface, #f8fafc);
  color: var(--editor-text-muted, #64748b);
  font-size: 11px;
  font-weight: 700;
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
  padding: 4px 0;
  border-radius: 999px;
  color: var(--editor-text-secondary, #475569);

  &.is-done {
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
