<template>
  <div v-if="actions.length > 0" class="ai-quick-actions">
    <div
      v-for="action in actions"
      :key="action.id"
      class="quick-action-card"
      @click="$emit('select', action)"
    >
      <QyIcon :name="action.icon" class="quick-action-icon" />
      <span class="quick-action-label">{{ action.label }}</span>
    </div>
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
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px 16px;

  .quick-action-card {
    background: var(--editor-layer-panel, #ffffff);
    border: 1px solid var(--ai-border, #e2e8f0);
    border-radius: 12px;
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    text-align: left;

    &:hover {
      background: var(--editor-layer-accent, #eff6ff);
      border-color: var(--editor-accent-soft-border, #93c5fd);
      transform: translateX(4px);
    }

    &:active {
      transform: translateX(0);
    }

    .quick-action-icon {
      font-size: 20px;
      color: #2563eb;
      flex-shrink: 0;
    }

    .quick-action-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--ai-text, #0f172a);
    }
  }
}

@media (max-width: 768px) {
  .ai-quick-actions {
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
