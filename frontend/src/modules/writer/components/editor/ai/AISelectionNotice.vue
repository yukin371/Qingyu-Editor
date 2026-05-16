<template>
  <div v-if="notice" class="selection-notice" :class="`is-${notice.status}`">
    <div class="selection-title">{{ notice.actionLabel }} · 已选中 {{ notice.text.length }} 字</div>
    <div class="selection-content">{{ notice.text }}</div>
    <div v-if="notice.instructions" class="selection-extra">要求：{{ notice.instructions }}</div>
    <div class="selection-status">{{ notice.statusText }}</div>
  </div>
</template>

<script setup lang="ts">
import type { SelectionNotice } from './types'

// ==================== Props ====================
defineProps<{
  notice: SelectionNotice | null
}>()
</script>

<style scoped lang="scss">
.selection-notice {
  margin: 10px 12px 0;
  border-radius: 10px;
  border: 1px solid var(--ai-border-strong, var(--editor-border, #cbd5e1));
  background: color-mix(in srgb, var(--ai-bg-soft, var(--editor-bg-surface, #f8fafc)) 94%, transparent);
  padding: 10px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--editor-text-secondary, #334155);

  .selection-title {
    font-weight: 600;
  }

  .selection-content {
    margin-top: 4px;
    color: var(--editor-text-secondary, #475569);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .selection-extra {
    margin-top: 4px;
    color: var(--editor-text-primary, #1e293b);
  }

  .selection-status {
    margin-top: 6px;
    font-weight: 600;
  }

  &.is-running {
    border-color: color-mix(in srgb, var(--editor-accent, #3b82f6) 36%, var(--ai-border, #93c5fd));
    background: color-mix(in srgb, var(--ai-accent-soft, #eff6ff) 64%, var(--ai-bg-soft, #f8fafc));
  }

  &.is-done {
    border-color: color-mix(in srgb, var(--color-success-400, #4ade80) 42%, var(--ai-border, #86efac));
    background: color-mix(in srgb, var(--color-success-50, #f0fdf4) 28%, var(--ai-bg-soft, #f8fafc));
  }

  &.is-error {
    border-color: color-mix(in srgb, var(--color-danger-400, #f87171) 42%, var(--ai-border, #fca5a5));
    background: color-mix(in srgb, var(--color-danger-50, #fef2f2) 28%, var(--ai-bg-soft, #f8fafc));
  }
}
</style>
