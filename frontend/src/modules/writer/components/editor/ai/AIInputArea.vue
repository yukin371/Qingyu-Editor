<template>
  <div class="ai-input-area">
    <div v-if="targetLabel" class="target-scope-bar">
      <span class="target-scope-bar__value">{{ targetLabel }}</span>
      <span
        v-if="targetDetail || contextEvidence"
        class="target-scope-bar__meta"
      >
        {{ [targetDetail, contextEvidence].filter(Boolean).join(' · ') }}
      </span>
    </div>
    <div v-if="context" class="chat-context-chip">
      <div class="context-copy">
        <span class="context-label">携带上下文</span>
        <span class="context-text">{{ context.text }}</span>
        <span v-if="context.instructions" class="context-extra">
          {{ context.instructions }}
        </span>
      </div>
      <button class="context-clear" type="button" @click="$emit('clearContext')">移除</button>
    </div>
    <div v-if="context && canEdit" class="interaction-mode">
      <button
        type="button"
        class="interaction-mode__option"
        :class="{ 'is-active': mode === 'edit' }"
        :disabled="disabled"
        @click="$emit('update:mode', 'edit')"
      >
        直接改正文
      </button>
      <button
        type="button"
        class="interaction-mode__option"
        :class="{ 'is-active': mode === 'chat' }"
        :disabled="disabled"
        @click="$emit('update:mode', 'chat')"
      >
        仅对话
      </button>
    </div>
    <div class="input-wrapper">
      <textarea
        ref="inputRef"
        id="writer-ai-input"
        name="writer-ai-input"
        :value="modelValue"
        class="message-input"
        :placeholder="placeholder"
        rows="1"
        :disabled="disabled"
        @focus="isInputFocused = true"
        @blur="isInputFocused = false"
        @keydown="handleKeyDown"
        @input="handleInput"
      ></textarea>
      <button
        class="send-button"
        :disabled="!modelValue.trim() || disabled"
        :aria-label="sendLabel"
        @click="handleSend"
      >
        <QyIcon :name="disabled ? 'Loading' : 'Promotion'" />
      </button>
    </div>
    <div v-if="hint && isInputFocused" class="input-hint">
      <span>{{ hint }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import { useI18n } from '@/composables/useI18n'
import type { ChatContextSnippet } from './types'

// ==================== Props ====================
const props = withDefaults(
  defineProps<{
    modelValue: string
    context?: ChatContextSnippet | null
    targetLabel?: string
    targetDetail?: string
    contextEvidence?: string
    mode?: 'chat' | 'edit'
    canEdit?: boolean
    disabled?: boolean
    placeholder?: string
    hint?: string
  }>(),
  {
    modelValue: '',
    context: null,
    targetLabel: '',
    targetDetail: '',
    contextEvidence: '',
    mode: 'chat',
    canEdit: false,
    disabled: false,
    placeholder: '输入消息...',
    hint: '按 Enter 发送，Shift + Enter 换行',
  },
)

// ==================== Emits ====================
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:mode', value: 'chat' | 'edit'): void
  (e: 'send'): void
  (e: 'clearContext'): void
}>()

// ==================== 国际化 ====================
const { t } = useI18n()
const sendLabel = t('ai.send', '发送')

// ==================== Refs ====================
const inputRef = ref<HTMLTextAreaElement>()
const isInputFocused = ref(false)

// ==================== 方法 ====================
function handleKeyDown(event: KeyboardEvent) {
  // Enter 发送，Shift + Enter 换行
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)

  // 自动调整文本框高度
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
    inputRef.value.style.height = `${Math.min(inputRef.value.scrollHeight, 120)}px`
  }
}

function handleSend() {
  if (props.modelValue.trim() && !props.disabled) {
    emit('send')
  }
}

// ==================== 暴露方法 ====================
defineExpose({
  focus: () => inputRef.value?.focus(),
})
</script>

<style scoped lang="scss">
.ai-input-area {
  padding: 5px 7px 7px;
  background: color-mix(in srgb, var(--ai-bg-soft, #f8fafc) 72%, var(--ai-bg, #ffffff));
  border-top: 1px solid var(--ai-border, #e2e8f0);

  .interaction-mode {
    display: inline-flex;
    gap: 4px;
    margin-bottom: 4px;
    padding: 2px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--editor-border, #e2e8f0) 28%, transparent);
  }

  .interaction-mode__option {
    border: none;
    background: transparent;
    color: var(--editor-text-secondary, #475569);
      border-radius: 999px;
      padding: 3px 8px;
      font-size: 10px;
      font-weight: 600;
    cursor: pointer;

    &.is-active {
      background: var(--editor-layer-panel, #ffffff);
      color: var(--editor-text-primary, #0f172a);
      box-shadow: var(--editor-shadow-sm, 0 1px 2px rgba(15, 23, 42, 0.12));
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  .chat-context-chip {
    margin-bottom: 4px;
    border: 1px solid color-mix(in srgb, var(--editor-accent-soft-border, #bfdbfe) 72%, transparent);
    background: color-mix(in srgb, var(--editor-layer-accent, #eff6ff) 62%, var(--ai-bg, #ffffff));
    color: var(--editor-accent, #1e3a8a);
    border-radius: 7px;
    padding: 4px 6px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 10px;

    .context-copy {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .context-label {
      font-weight: 600;
    }

    .context-text {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .context-extra {
      color: var(--editor-text-secondary, #334155);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .context-clear {
      flex-shrink: 0;
      border: none;
      background: transparent;
      color: var(--editor-accent, #1d4ed8);
      cursor: pointer;
      font-size: 10px;
      padding: 0;
    }
  }

  .target-scope-bar {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 4px;
    padding: 3px 6px;
    border: 1px solid color-mix(in srgb, var(--editor-border, #dbeafe) 34%, transparent);
    background: color-mix(in srgb, var(--editor-layer-soft, #f8fafc) 82%, transparent);
    color: var(--editor-text-secondary, #334155);
    border-radius: 7px;
    font-size: 10px;
    min-width: 0;
  }

  .target-scope-bar__value {
    min-width: 0;
    color: var(--editor-text-primary, #0f172a);
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .target-scope-bar__meta {
    min-width: 0;
    color: var(--editor-accent, #2563eb);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .input-wrapper {
    display: flex;
    gap: 6px;
    align-items: flex-end;
    background: var(--editor-layer-panel, #ffffff);
    border: 1px solid var(--ai-border-strong, #cbd5e1);
    border-radius: 9px;
    padding: 4px 6px;
    transition: border-color 0.2s ease;

    &:focus-within {
      border-color: var(--editor-border-focus, #60a5fa);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--editor-accent, #60a5fa) 16%, transparent);
    }

    .message-input {
      flex: 1;
      min-height: 24px;
      max-height: 120px;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--ai-text, #0f172a);
      font-size: 12px;
      line-height: 1.4;
      resize: none;
      outline: none;

      &::placeholder {
        color: var(--editor-text-ghost, #94a3b8);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .send-button {
      width: 26px;
      height: 26px;
      padding: 0;
      border: none;
      background: var(--ai-user-bg, #2563eb);
      color: white;
      border-radius: 7px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;
      flex-shrink: 0;

      &:hover:not(:disabled) {
        background: var(--ai-user-bg-hover, #1d4ed8);
      }

      &:active:not(:disabled) {
        background: color-mix(in srgb, var(--ai-user-bg, #2563eb) 72%, var(--editor-text-primary, #0f172a));
      }

      &:disabled {
        background: var(--editor-bg-elevated, #cbd5e1);
        color: var(--editor-text-ghost, #94a3b8);
        cursor: not-allowed;
      }
    }
  }

  .input-hint {
    margin-top: 4px;
    text-align: center;

    span {
      font-size: 10px;
      color: var(--editor-text-ghost, #94a3b8);
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .send-button {
    transition: none;
  }
}
</style>
