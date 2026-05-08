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
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  padding: 10px;
  font-size: 12px;
  line-height: 1.5;
  color: #334155;

  .selection-title {
    font-weight: 600;
  }

  .selection-content {
    margin-top: 4px;
    color: #475569;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .selection-extra {
    margin-top: 4px;
    color: #1e293b;
  }

  .selection-status {
    margin-top: 6px;
    font-weight: 600;
  }

  &.is-running {
    border-color: #93c5fd;
    background: #eff6ff;
  }

  &.is-done {
    border-color: #86efac;
    background: #f0fdf4;
  }

  &.is-error {
    border-color: #fca5a5;
    background: #fef2f2;
  }
}
</style>
