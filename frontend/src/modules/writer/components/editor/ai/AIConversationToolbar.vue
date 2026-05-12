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
  gap: 8px;
  padding: 12px 14px 10px;
  border-bottom: 1px solid var(--ai-border, #e2e8f0);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.9));

  .conversation-select {
    flex: 1;
    min-width: 0;
    height: 34px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 10px;
    padding: 0 10px;
    background: rgba(255, 255, 255, 0.96);
    color: var(--ai-text, #0f172a);
    font-size: 12px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.84);
  }

  .conversation-new-btn {
    width: 34px;
    height: 34px;
    padding: 0;
    border: 1px solid #93c5fd;
    border-radius: 10px;
    background:
      linear-gradient(180deg, rgba(239, 246, 255, 0.98), rgba(219, 234, 254, 0.92));
    color: #1d4ed8;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    box-shadow: 0 10px 18px rgba(37, 99, 235, 0.12);
  }

  .conversation-action-btn {
    width: 34px;
    height: 34px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.96);
    color: #475569;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 8px 16px rgba(15, 23, 42, 0.05);
  }

  .conversation-action-btn--ghost {
    color: #64748b;
    background:
      linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(241, 245, 249, 0.92));
  }

  .conversation-action-btn,
  .conversation-new-btn {
    transition:
      transform 160ms ease-out,
      box-shadow 160ms ease-out,
      border-color 160ms ease-out,
      background 160ms ease-out,
      color 160ms ease-out;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.56;
      cursor: not-allowed;
      box-shadow: none;
    }
  }
}
</style>
