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
      <span class="quick-action-copy">
        <span class="quick-action-row">
          <span class="quick-action-label">{{ action.label }}</span>
          <span v-if="action.group" class="quick-action-group">{{ groupLabelMap[action.group] }}</span>
        </span>
        <span v-if="action.description" class="quick-action-description">
          {{ action.description }}
        </span>
      </span>
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

const groupLabelMap: Record<NonNullable<QuickAction['group']>, string> = {
  write: '写',
  review: '审',
  organize: '整理',
}
</script>

<style scoped lang="scss">
.ai-quick-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 0 16px 16px;

  .quick-action-card {
    border: 1px solid var(--ai-border, #e2e8f0);
    background: var(--editor-layer-panel, #ffffff);
    border-radius: 12px;
    padding: 10px 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    text-align: left;
    font: inherit;

    &:hover {
      background: var(--editor-layer-accent, #eff6ff);
      border-color: var(--editor-accent-soft-border, #93c5fd);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.55;
      transform: none;
    }

    .quick-action-icon {
      font-size: 18px;
      color: var(--editor-accent, #2563eb);
      flex-shrink: 0;
    }

    .quick-action-copy {
      min-width: 0;
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 3px;
    }

    .quick-action-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .quick-action-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--ai-text, #0f172a);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .quick-action-group {
      flex-shrink: 0;
      border-radius: 999px;
      padding: 2px 6px;
      background: var(--editor-layer-accent, #eff6ff);
      color: var(--editor-accent, #2563eb);
      font-size: 11px;
      font-weight: 600;
    }

    .quick-action-description {
      color: var(--editor-text-tertiary, #64748b);
      font-size: 11px;
      line-height: 1.35;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

@media (max-width: 768px) {
  .ai-quick-actions {
    grid-template-columns: 1fr;
    gap: 6px;

    .quick-action-card {
      padding: 10px 12px;

      .quick-action-icon {
        font-size: 18px;
      }

      .quick-action-label {
        font-size: 12px;
      }
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .quick-action-card {
    transition: none;
  }
}
</style>
