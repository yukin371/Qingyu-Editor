<template>
  <div class="conversation-toolbar">
    <select
      :value="currentId"
      id="ai-conversation-select"
      name="ai-conversation-select"
      class="conversation-select"
      aria-label="会话选择"
      :disabled="disabled"
      @change="handleChange"
    >
      <option
        v-for="conversation in conversationList"
        :key="conversation.id"
        :value="conversation.id"
      >
        {{ conversation.title }}
      </option>
    </select>
    <button
      class="conversation-action-btn conversation-action-btn--ghost"
      :disabled="disabled"
      title="清空当前对话"
      @click="$emit('clear')"
    >
      <QyIcon name="Delete" />
    </button>
    <button class="conversation-action-btn" :disabled="disabled" title="重命名对话" @click="$emit('rename')">
      <QyIcon name="Edit" />
    </button>
    <button class="conversation-new-btn" :disabled="disabled" title="新对话" @click="$emit('create')">
      <QyIcon name="Plus" />
    </button>
  </div>
</template>

<script setup lang="ts">
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import type { ConversationMeta } from './types'

// ==================== Props ====================
defineProps<{
  conversationList: ConversationMeta[]
  currentId: string
  disabled?: boolean
}>()

// ==================== Emits ====================
const emit = defineEmits<{
  (e: 'update:currentId', id: string): void
  (e: 'clear'): void
  (e: 'create'): void
  (e: 'rename'): void
  (e: 'delete'): void
}>()

// ==================== 方法 ====================
function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:currentId', target.value)
}
</script>

<style scoped lang="scss">
.conversation-toolbar {
  display: flex;
  gap: 4px;
  padding: 5px 7px 4px;
  border-bottom: 1px solid var(--ai-border, #e2e8f0);
  background: color-mix(in srgb, var(--ai-bg-soft, var(--editor-layer-soft, #f8fafc)) 14%, var(--ai-bg, #ffffff));

  .conversation-select {
    flex: 1;
    min-width: 0;
    height: 26px;
    border: 1px solid color-mix(in srgb, var(--ai-border, #e2e8f0) 68%, transparent);
    border-radius: 7px;
    padding: 0 7px;
    background: color-mix(in srgb, var(--ai-bg, var(--editor-layer-panel, #ffffff)) 98%, transparent);
    color: var(--ai-text, #0f172a);
    font-size: 10px;
  }

  .conversation-new-btn {
    width: 26px;
    height: 26px;
    padding: 0;
    border: 1px solid color-mix(in srgb, var(--editor-accent, #3b82f6) 22%, var(--ai-border, #93c5fd));
    border-radius: 7px;
    background: color-mix(in srgb, var(--ai-accent-soft, #eff6ff) 56%, var(--ai-bg, #ffffff));
    color: var(--editor-accent, #1d4ed8);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
  }

  .conversation-action-btn {
    width: 26px;
    height: 26px;
    border: 1px solid color-mix(in srgb, var(--ai-border, #e2e8f0) 68%, transparent);
    border-radius: 7px;
    background: color-mix(in srgb, var(--ai-bg, var(--editor-layer-panel, #ffffff)) 98%, transparent);
    color: var(--editor-text-secondary, #475569);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .conversation-action-btn--ghost {
    color: var(--ai-text-muted, #64748b);
    background: color-mix(in srgb, var(--ai-bg-soft, var(--editor-layer-soft, #f8fafc)) 68%, transparent);
  }

  .conversation-action-btn,
  .conversation-new-btn {
    transition:
      border-color 160ms ease-out,
      background 160ms ease-out,
      color 160ms ease-out;

    &:disabled {
      opacity: 0.56;
      cursor: not-allowed;
    }
  }
}
</style>
