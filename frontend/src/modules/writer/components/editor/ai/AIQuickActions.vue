<template>
  <div v-if="actions.length > 0" class="ai-quick-actions">
    <button
      v-for="action in actions"
      :key="action.id"
      type="button"
      class="quick-action-card"
      :disabled="disabled"
      @click="$emit('select', action)"
    >
      <QyIcon :name="action.icon" class="quick-action-icon" />
      <span class="quick-action-label">{{ action.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import type { QuickAction } from './types'

// ==================== Props ====================
defineProps<{
  actions: QuickAction[]
  disabled?: boolean
}>()

// ==================== Emits ====================
defineEmits<{
  (e: 'select', action: QuickAction): void
}>()

</script>

<style scoped lang="scss">
.ai-quick-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
  padding: 0 8px 8px;

  .quick-action-card {
    border: 1px solid color-mix(in srgb, var(--ai-border, #e2e8f0) 68%, transparent);
    background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 98%, transparent);
    border-radius: 8px;
    padding: 6px 7px;
    cursor: pointer;
    transition:
      background-color 0.18s ease,
      border-color 0.18s ease,
      color 0.18s ease;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    text-align: left;
    font: inherit;

    &:hover {
      background: color-mix(in srgb, var(--editor-layer-soft, #f8fafc) 72%, transparent);
      border-color: color-mix(in srgb, var(--editor-accent, #2563eb) 18%, var(--ai-border, #e2e8f0));
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    .quick-action-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      font-size: 13px;
      color: color-mix(in srgb, var(--editor-accent, #2563eb) 82%, white 18%);
      flex-shrink: 0;
    }

    .quick-action-label {
      min-width: 0;
      font-size: 12px;
      font-weight: 600;
      color: var(--ai-text, #0f172a);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }

  }
}

@media (max-width: 768px) {
  .ai-quick-actions {
    .quick-action-card {
      padding: 6px 7px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .quick-action-card {
    transition: none;
  }
}
</style>
