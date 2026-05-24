<template>
  <div v-if="notice" class="selection-notice" :class="`is-${notice.status}`">
    <div class="selection-heading">
      <div class="selection-title">{{ notice.actionLabel }} · {{ notice.text.length }}字</div>
      <div class="selection-status">{{ notice.statusText }}</div>
    </div>
    <div class="selection-content">{{ notice.text }}</div>
    <div v-if="notice.instructions" class="selection-extra">要求 {{ notice.instructions }}</div>
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
  margin: 8px 10px 0;
  border-radius: 8px;
  border: 1px solid var(--ai-border-strong, var(--editor-border, #cbd5e1));
  background: color-mix(in srgb, var(--ai-bg-soft, var(--editor-bg-surface, #f8fafc)) 94%, transparent);
  padding: 7px 9px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--editor-text-secondary, #334155);

  .selection-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .selection-title {
    min-width: 0;
    font-weight: 600;
    color: var(--editor-text-primary, #1e293b);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .selection-content {
    margin-top: 3px;
    color: var(--editor-text-secondary, #475569);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .selection-extra {
    margin-top: 3px;
    color: var(--editor-text-primary, #1e293b);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .selection-status {
    flex-shrink: 0;
    max-width: 42%;
    font-weight: 600;
    color: var(--editor-text-muted, #64748b);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
