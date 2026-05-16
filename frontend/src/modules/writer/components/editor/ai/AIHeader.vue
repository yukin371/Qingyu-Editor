<template>
  <div class="ai-header">
    <div class="header-left">
      <span class="header-caption">对话协作</span>
    </div>
    <div class="header-right">
      <button
        class="icon-button"
        data-action="clear"
        :aria-label="clearLabel"
        :title="clearLabel"
        @click="$emit('clear')"
      >
        <QyIcon name="Delete" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import { useI18n } from '@/composables/useI18n'

// ==================== Emits ====================
defineEmits<{
  (e: 'clear'): void
}>()

// ==================== 国际化 ====================
const { t } = useI18n()
const clearLabel = t('ai.clear', '清空对话')
</script>

<style scoped lang="scss">
.ai-header {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--ai-bg-soft, #f8fafc);
  border-bottom: 1px solid var(--ai-border, #e2e8f0);

  .header-left {
    display: flex;
    align-items: center;
    .header-caption {
      margin: 0;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--ai-text-muted, #64748b);
    }
  }

  .header-right {
    display: flex;
    gap: 4px;

    .icon-button {
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--ai-text-muted, #64748b);
      cursor: pointer;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;

      &:hover {
        background: var(--ai-accent-soft, #dbeafe);
        color: var(--editor-accent, #1d4ed8);
      }

      &:active {
        background: color-mix(in srgb, var(--ai-accent-soft, #bfdbfe) 82%, var(--editor-accent, #1d4ed8) 18%);
      }
    }
  }
}
</style>
