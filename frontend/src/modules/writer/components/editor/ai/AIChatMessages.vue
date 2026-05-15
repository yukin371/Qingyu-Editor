<template>
  <div class="ai-messages" ref="messagesContainer">
    <!-- 空状态提示 -->
    <div v-if="messages.length === 0" class="empty-state">
      <QyIcon name="ChatBubbleLeftRight" class="empty-icon" />
      <p class="empty-text">{{ emptyHint }}</p>
    </div>

    <!-- 消息列表 -->
    <div
      v-for="message in messages"
      :key="message.id"
      :class="['message-item', `message-${message.role}`]"
    >
      <!-- 用户消息 -->
      <div v-if="message.role === 'user'" class="message-bubble message-user">
        <div class="message-content">{{ message.content }}</div>
        <div class="message-time">{{ formatTime(message.timestamp) }}</div>
      </div>

      <!-- AI消息 -->
      <div v-else class="message-bubble message-ai">
        <div class="message-avatar">
          <QyIcon name="MagicStick" />
        </div>
        <div class="message-content-wrapper">
          <div
            v-if="message.meta?.kind === 'document_tool_patch_preview'"
            class="message-tool-card"
            :class="`message-tool-card--${message.meta.status}`"
          >
            <div class="message-tool-card__header">
              <div class="message-tool-card__title">{{ message.meta.documentLabel }}</div>
              <span class="message-tool-card__status">{{ message.meta.statusText }}</span>
            </div>
            <div class="message-tool-card__stats">
              <span>操作：{{ toolOperationLabel(message.meta.operationType) }}</span>
              <span>变更块：{{ message.meta.blockCount }}</span>
              <span>结果行数：{{ message.meta.totalLines }}</span>
            </div>
            <div class="message-tool-card__blocks">
              <article
                v-for="block in message.meta.blocks"
                :key="block.header"
                class="message-tool-block"
              >
                <div class="message-tool-block__title">{{ block.header }}</div>
                <div class="message-tool-block__columns">
                  <section class="message-tool-block__panel message-tool-block__panel--before">
                    <div class="message-tool-block__label">原文</div>
                    <div v-if="block.before.length > 0" class="message-tool-block__lines">
                      <div
                        v-for="(line, index) in block.before"
                        :key="`${block.header}-before-${index}`"
                        class="message-tool-block__line"
                      >
                        - {{ line }}
                      </div>
                    </div>
                    <div v-else class="message-tool-block__empty">（空）</div>
                  </section>
                  <section class="message-tool-block__panel message-tool-block__panel--after">
                    <div class="message-tool-block__label">变更后</div>
                    <div v-if="block.after.length > 0" class="message-tool-block__lines">
                      <div
                        v-for="(line, index) in block.after"
                        :key="`${block.header}-after-${index}`"
                        class="message-tool-block__line"
                      >
                        + {{ line }}
                      </div>
                    </div>
                    <div v-else class="message-tool-block__empty">（删除）</div>
                  </section>
                </div>
              </article>
            </div>
          </div>
          <div
            v-else-if="message.meta?.kind === 'document_target_candidates'"
            class="message-tool-card message-tool-card--selection"
          >
            <div class="message-tool-card__header">
              <div class="message-tool-card__title">{{ message.meta.requestLabel }}</div>
              <span class="message-tool-card__status">{{ message.meta.statusText }}</span>
            </div>
            <div class="message-tool-card__detail">请选择本次要读取或修改的目标章节。</div>
            <div class="message-target-candidates">
              <button
                v-for="candidate in message.meta.candidates"
                :key="candidate.documentId"
                type="button"
                class="message-target-candidate"
                @click="
                  emit('select-document-target', {
                    instruction: message.meta.instruction,
                    route: message.meta.route,
                    documentId: candidate.documentId,
                    documentTitle: candidate.documentTitle,
                  })
                "
              >
                <span class="message-target-candidate__title">
                  {{ candidate.documentTitle || candidate.documentId }}
                </span>
                <span class="message-target-candidate__meta">{{ candidate.documentId }}</span>
                <span v-if="candidate.reason" class="message-target-candidate__reason">
                  {{ candidate.reason }}
                </span>
              </button>
            </div>
          </div>
          <div
            v-else-if="message.meta?.kind === 'document_target_status'"
            class="message-tool-card"
            :class="`message-tool-card--${message.meta.status}`"
          >
            <div class="message-tool-card__header">
              <div class="message-tool-card__title">{{ message.meta.documentLabel }}</div>
              <span class="message-tool-card__status">{{ message.meta.statusText }}</span>
            </div>
            <div v-if="message.meta.detail" class="message-tool-card__detail">
              {{ message.meta.detail }}
            </div>
          </div>
          <div
            v-else-if="message.meta?.kind === 'writer_retrieval_summary'"
            class="message-tool-card"
            :class="`message-tool-card--${message.meta.status || 'ready'}`"
          >
            <div class="message-tool-card__header">
              <div class="message-tool-card__title">
                {{ message.meta.queryLabel || '跨文件查找' }}
              </div>
              <span class="message-tool-card__status">{{ message.meta.statusText }}</span>
            </div>
            <div v-if="message.meta.hits.length > 0" class="message-retrieval-hits">
              <article
                v-for="hit in message.meta.hits"
                :key="hit.documentId"
                class="message-retrieval-hit"
                :class="{ 'is-selected': hit.selected }"
              >
                <div class="message-retrieval-hit__header">
                  <span class="message-retrieval-hit__title">
                    {{ hit.documentTitle || hit.documentId }}
                  </span>
                  <span v-if="hit.selected" class="message-retrieval-hit__badge">目标</span>
                </div>
                <div class="message-retrieval-hit__reason">{{ hit.reason }}</div>
                <p v-if="hit.excerpt" class="message-retrieval-hit__excerpt">
                  {{ hit.excerpt }}
                </p>
              </article>
            </div>
            <div v-else class="message-tool-card__detail">没有找到可用章节。</div>
          </div>
          <div
            v-else-if="message.meta?.kind === 'writer_plan_preview'"
            class="message-tool-card"
            :class="`message-tool-card--${message.meta.status || 'planned'}`"
          >
            <div class="message-tool-card__header">
              <div class="message-tool-card__title">{{ message.meta.operationLabel }}</div>
              <span class="message-tool-card__status">{{ message.meta.statusText }}</span>
            </div>
            <dl class="message-plan-grid">
              <div>
                <dt>目标</dt>
                <dd>{{ message.meta.targetLabel }}</dd>
              </div>
              <div>
                <dt>执行</dt>
                <dd>{{ executionModeLabel(message.meta.executionMode) }}</dd>
              </div>
              <div>
                <dt>确认</dt>
                <dd>{{ message.meta.requiresConfirmation ? '需要确认' : '可直接生成 diff' }}</dd>
              </div>
            </dl>
            <div v-if="message.meta.nextStep" class="message-tool-card__detail">
              {{ message.meta.nextStep }}
            </div>
          </div>
          <div
            v-else-if="message.meta?.kind === 'writer_apply_checkpoint'"
            class="message-tool-card"
            :class="`message-tool-card--${message.meta.status}`"
          >
            <div class="message-tool-card__header">
              <div class="message-tool-card__title">{{ message.meta.targetLabel }}</div>
              <span class="message-tool-card__status">{{ message.meta.statusText }}</span>
            </div>
            <div v-if="message.meta.detail" class="message-tool-card__detail">
              {{ message.meta.detail }}
            </div>
            <ol class="message-checkpoint-list">
              <li
                v-for="item in message.meta.stages"
                :key="item.stage"
                class="message-checkpoint-item"
                :class="`message-checkpoint-item--${item.status}`"
              >
                <span class="message-checkpoint-item__dot" aria-hidden="true"></span>
                <span class="message-checkpoint-item__body">
                  <span class="message-checkpoint-item__label">
                    {{ item.label || checkpointStageLabel(item.stage) }}
                  </span>
                  <span v-if="item.detail" class="message-checkpoint-item__detail">
                    {{ item.detail }}
                  </span>
                </span>
              </li>
            </ol>
          </div>
          <div
            v-else-if="message.meta?.kind === 'writer_connection_status'"
            class="message-tool-card"
            :class="`message-tool-card--${message.meta.status}`"
          >
            <div class="message-tool-card__header">
              <div class="message-tool-card__title">{{ message.meta.targetLabel }}</div>
              <span class="message-tool-card__status">{{ message.meta.statusText }}</span>
            </div>
            <div v-if="message.meta.detail" class="message-tool-card__detail">
              {{ message.meta.detail }}
            </div>
          </div>
          <div
            class="message-content"
            :class="{ 'message-content--pending': message.typing }"
            v-safe-html="renderAssistantMessage(message)"
          ></div>
          <div v-if="message.typing" class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>
    </div>

    <div v-if="showPendingAssistant" class="message-item message-ai message-ai-pending">
      <div class="message-bubble message-ai">
        <div class="message-avatar">
          <QyIcon name="MagicStick" />
        </div>
        <div class="message-content-wrapper">
          <div
            class="message-content message-content--pending"
            v-safe-html="renderPendingMarkdown()"
          ></div>
          <div class="typing-indicator"><span></span><span></span><span></span></div>
          <div class="message-time">思考中</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import { marked } from 'marked'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import { useI18n } from '@/composables/useI18n'
import { sanitizeMarkdownHtml } from '@/utils/sanitize'
import type { ChatMessage } from './types'

// ==================== Props ====================
const props = withDefaults(
  defineProps<{
    messages: ChatMessage[]
    typingText?: string
    isTyping?: boolean
  }>(),
  {
    messages: () => [],
    typingText: '',
    isTyping: false,
  },
)

// ==================== Emits ====================
const emit = defineEmits<{
  (e: 'scrollToBottom'): void
  (
    e: 'select-document-target',
    payload: {
      instruction: string
      route: 'edit' | 'analysis'
      documentId: string
      documentTitle?: string
    },
  ): void
}>()

// ==================== 国际化 ====================
const { t } = useI18n()
const emptyHint = t('ai.emptyHint', '开始与AI助手对话...')

// ==================== Refs ====================
const messagesContainer = ref<HTMLElement>()
const showPendingAssistant = computed(
  () =>
    props.isTyping &&
    !props.messages.some((message) => message.role === 'assistant' && message.typing),
)

// ==================== 方法 ====================
function renderMarkdown(content: string): string {
  if (!content) return ''
  try {
    const html = marked(content, { breaks: true, gfm: true }) as string
    return sanitizeMarkdownHtml(html)
  } catch {
    return content
  }
}

function renderAssistantMessage(message: ChatMessage): string {
  const content = message.typing ? props.typingText || '正在整理回复…' : message.content
  return renderMarkdown(content)
}

function renderPendingMarkdown(): string {
  return renderMarkdown(props.typingText || '正在思考，请稍候…')
}

function toolOperationLabel(operationType: string): string {
  if (operationType === 'replace_lines') return '替换行'
  if (operationType === 'insert_after_line') return '插入行'
  if (operationType === 'delete_lines') return '删除行'
  return operationType
}

function executionModeLabel(mode: string): string {
  if (mode === 'direct_apply') return '生成正文 diff'
  if (mode === 'confirm_first') return '先确认目标'
  if (mode === 'plan_only') return '仅生成计划'
  return mode
}

function checkpointStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    planned: '已规划',
    retrieving: '检索正文',
    generated: '生成结果',
    switching: '切换章节',
    ready_for_review: '等待审阅',
    accepted: '已接受',
    discarded: '已放弃',
    failed: '失败',
  }
  return labels[stage] || stage
}

/**
 * 格式化时间戳
 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }

  // 小于1小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }

  // 今天
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 其他
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

/**
 * 滚动到底部
 */
async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// ==================== 暴露方法 ====================
defineExpose({
  scrollToBottom,
})

// ==================== 生命周期 ====================
onMounted(() => {
  if (props.messages.length > 0) {
    scrollToBottom()
  }
})

// ==================== 监听 ====================
watch(
  () => props.messages,
  () => {
    scrollToBottom()
  },
  { deep: true },
)

watch(
  () => props.isTyping,
  (newVal) => {
    if (newVal) {
      scrollToBottom()
    }
  },
)
</script>

<style scoped lang="scss">
.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  // 滚动条样式
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;

    &:hover {
      background: #94a3b8;
    }
  }
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--editor-text-muted);

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    color: var(--editor-text-ghost);
  }

  .empty-text {
    margin: 0;
    font-size: 14px;
  }
}

.message-item {
  display: flex;
  flex-direction: column;

  &.message-user {
    align-items: flex-end;
  }

  &.message-ai {
    align-items: flex-start;
  }
}

.message-bubble {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 14px;
  word-wrap: break-word;

  &.message-user {
    background: var(--ai-user-bg, #2563eb);
    color: white;
    border-bottom-right-radius: 4px;
  }

  &.message-ai {
    background: var(--ai-assistant-bg, #f1f5f9);
    border: 1px solid var(--ai-border, #e2e8f0);
    border-bottom-left-radius: 4px;
    display: flex;
    gap: 8px;

    .message-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #3b82f6;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 12px;
    }

    .message-content-wrapper {
      flex: 1;
    }
  }

  .message-content {
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;

    &--pending {
      color: var(--ai-text-muted, #64748b);
    }
  }

  .message-content :deep(p) {
    margin: 0 0 8px;
  }

  .message-content :deep(p:last-child) {
    margin-bottom: 0;
  }

  .message-content :deep(ul),
  .message-content :deep(ol) {
    margin: 0;
    padding-left: 20px;
  }

  .message-content :deep(blockquote) {
    margin: 8px 0;
    padding-left: 12px;
    border-left: 3px solid var(--ai-border-strong, #cbd5e1);
    color: var(--ai-text-muted, #64748b);
  }

  .message-content :deep(code) {
    padding: 2px 6px;
    border-radius: 6px;
    background: rgba(15, 23, 42, 0.08);
    font-size: 13px;
  }

  .message-content :deep(pre) {
    margin: 8px 0 0;
    padding: 10px 12px;
    border-radius: 10px;
    overflow-x: auto;
    background: #0f172a;
    color: #e2e8f0;
    white-space: pre-wrap;
  }

  .message-content :deep(pre code) {
    padding: 0;
    background: transparent;
    color: inherit;
  }

  .message-time {
    margin-top: 4px;
    font-size: 11px;
    color: var(--ai-text-muted, #64748b);
  }
}

.message-tool-card {
  margin-bottom: 10px;
  border-radius: 12px;
  border: 1px solid var(--ai-border, #e2e8f0);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(248, 250, 252, 0.96)),
    var(--ai-bg-soft, #f8fafc);
  overflow: hidden;

  &--switching {
    border-color: #bfdbfe;
    box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.08);
  }

  &--ready {
    border-color: #cbd5e1;
  }

  &--loading,
  &--selection {
    border-color: #bfdbfe;
    box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.08);
  }

  &--offline,
  &--error {
    border-color: rgba(245, 158, 11, 0.55);
    background:
      linear-gradient(180deg, rgba(255, 251, 235, 0.96), rgba(255, 247, 237, 0.98)),
      var(--ai-bg-soft, #fff7ed);

    .message-tool-card__status {
      background: rgba(254, 243, 199, 0.95);
      color: #b45309;
    }
  }
}

.message-tool-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px 8px;
}

.message-tool-card__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ai-text, #0f172a);
}

.message-tool-card__status {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.message-tool-card__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 8px;
  padding: 0 12px 10px;
  color: var(--ai-text-muted, #64748b);
  font-size: 12px;

  span {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    padding: 0 8px;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.12);
  }
}

.message-tool-card__detail {
  padding: 0 12px 12px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--ai-text-muted, #64748b);
}

.message-tool-card__blocks {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 12px 12px;
}

.message-target-candidates {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 12px 12px;
}

.message-target-candidate {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(191, 219, 254, 0.9);
  background: rgba(239, 246, 255, 0.9);
  color: var(--ai-text, #0f172a);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    background 0.2s ease;

  &:hover {
    border-color: #60a5fa;
    background: rgba(219, 234, 254, 0.96);
    transform: translateY(-1px);
  }
}

.message-target-candidate__title {
  font-size: 13px;
  font-weight: 600;
}

.message-target-candidate__meta,
.message-target-candidate__reason {
  font-size: 12px;
  color: var(--ai-text-muted, #64748b);
}

.message-retrieval-hits {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 12px 12px;
}

.message-retrieval-hit {
  padding: 10px 12px;
  border: 1px solid rgba(203, 213, 225, 0.9);
  border-radius: 10px;
  background: color-mix(in srgb, var(--editor-layer-panel, rgba(255, 255, 255, 0.86)) 88%, transparent);

  &.is-selected {
    border-color: rgba(59, 130, 246, 0.5);
    background: rgba(239, 246, 255, 0.95);
  }
}

.message-retrieval-hit__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.message-retrieval-hit__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ai-text, #0f172a);
}

.message-retrieval-hit__badge {
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 600;
}

.message-retrieval-hit__reason,
.message-retrieval-hit__excerpt {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--ai-text-muted, #64748b);
}

.message-plan-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
  padding: 0 12px 12px;

  div {
    min-width: 0;
    padding: 8px 10px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--editor-layer-panel, rgba(255, 255, 255, 0.82)) 86%, transparent);
    border: 1px solid rgba(203, 213, 225, 0.8);
  }

  dt {
    margin-bottom: 4px;
    color: var(--ai-text-muted, #64748b);
    font-size: 11px;
    font-weight: 600;
  }

  dd {
    margin: 0;
    color: var(--ai-text, #0f172a);
    font-size: 12px;
    line-height: 1.5;
    word-break: break-word;
  }
}

.message-checkpoint-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0 12px 12px;
  list-style: none;
}

.message-checkpoint-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.message-checkpoint-item__dot {
  width: 8px;
  height: 8px;
  margin-top: 6px;
  border-radius: 50%;
  background: #cbd5e1;
  flex-shrink: 0;
}

.message-checkpoint-item--running .message-checkpoint-item__dot {
  background: #2563eb;
}

.message-checkpoint-item--done .message-checkpoint-item__dot {
  background: #16a34a;
}

.message-checkpoint-item--error .message-checkpoint-item__dot {
  background: #dc2626;
}

.message-checkpoint-item__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.message-checkpoint-item__label {
  color: var(--ai-text, #0f172a);
  font-size: 12px;
  font-weight: 600;
}

.message-checkpoint-item__detail {
  color: var(--ai-text-muted, #64748b);
  font-size: 12px;
  line-height: 1.5;
}

.message-tool-block {
  padding: 10px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--editor-layer-panel, rgba(255, 255, 255, 0.84)) 88%, transparent);
  border: 1px solid rgba(203, 213, 225, 0.9);
}

.message-tool-block__title {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ai-text, #0f172a);
}

.message-tool-block__columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.message-tool-block__panel {
  padding: 8px;
  border-radius: 8px;
  min-width: 0;
}

.message-tool-block__panel--before {
  background: rgba(248, 250, 252, 0.9);
}

.message-tool-block__panel--after {
  background: rgba(239, 246, 255, 0.95);
}

.message-tool-block__label {
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--ai-text-muted, #64748b);
}

.message-tool-block__lines {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-tool-block__line,
.message-tool-block__empty {
  font-size: 12px;
  line-height: 1.5;
  color: var(--ai-text, #0f172a);
  word-break: break-word;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 0;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #94a3b8;
    animation: typing 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .typing-indicator span {
    animation: none;
  }
}

@media (max-width: 768px) {
  .message-tool-block__columns,
  .message-plan-grid {
    grid-template-columns: 1fr;
  }
}
</style>
