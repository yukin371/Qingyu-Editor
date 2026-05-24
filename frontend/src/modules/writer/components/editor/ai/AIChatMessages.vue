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
        <div
          v-if="parseWorkflowUserPrompt(message.content)"
          class="message-user-task-card"
        >
          <div class="message-user-task-card__badge">
            {{ parseWorkflowUserPrompt(message.content)?.badge }}
          </div>
          <div class="message-user-task-card__title">
            {{ parseWorkflowUserPrompt(message.content)?.target }}
          </div>
          <div class="message-user-task-card__detail">
            {{ parseWorkflowUserPrompt(message.content)?.instruction }}
          </div>
        </div>
        <div v-else class="message-content">{{ message.content }}</div>
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
            v-if="contextEvidenceItems(message.meta).length > 0"
            class="message-context-evidence"
          >
            <span class="message-context-evidence__label">参考</span>
            <span
              v-for="item in contextEvidenceItems(message.meta)"
              :key="`${item.source}:${item.label}:${item.detail || ''}`"
              class="message-context-evidence__chip"
              :title="item.detail || item.label"
            >
              {{ item.label }}
            </span>
          </div>
          <div
            class="message-content"
            :class="{
              'message-content--pending': message.typing,
              'message-content--collapsed': shouldCollapseAssistantMessage(message),
            }"
            v-safe-html="renderAssistantMessage(message)"
          ></div>
          <button
            v-if="shouldShowAssistantCollapseToggle(message)"
            type="button"
            class="message-content-toggle"
            @click="toggleAssistantMessage(message.id)"
          >
            {{ isAssistantMessageExpanded(message.id) ? '收起' : '展开' }}
          </button>
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
const emptyHint = t('ai.emptyHint', '向 AI 说明你的想法')

// ==================== Refs ====================
const messagesContainer = ref<HTMLElement>()
const expandedAssistantMessageIds = ref<string[]>([])
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

function parseWorkflowUserPrompt(content: string) {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 3 || !lines[0].startsWith('[') || !lines[0].endsWith(']')) {
    return null
  }

  const badge = lines[0].slice(1, -1).trim()
  const target = lines.find((line) => line.startsWith('目标：'))?.replace(/^目标：/, '').trim()
  const instruction = lines
    .find((line) => line.startsWith('修改要求：'))
    ?.replace(/^修改要求：/, '')
    .trim()

  if (!badge || !target || !instruction) {
    return null
  }

  return { badge, target, instruction }
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

function contextEvidenceItems(meta: ChatMessage['meta']) {
  return meta?.contextEvidence?.slice(0, 6) || []
}

function assistantMessageTextLength(message: ChatMessage) {
  return (message.content || '').replace(/\s+/g, '').length
}

function isAssistantMessageExpanded(messageId: string) {
  return expandedAssistantMessageIds.value.includes(messageId)
}

function shouldShowAssistantCollapseToggle(message: ChatMessage) {
  return (
    message.role === 'assistant' &&
    !message.typing &&
    contextEvidenceItems(message.meta).length > 0 &&
    assistantMessageTextLength(message) > 180
  )
}

function shouldCollapseAssistantMessage(message: ChatMessage) {
  return shouldShowAssistantCollapseToggle(message) && !isAssistantMessageExpanded(message.id)
}

function toggleAssistantMessage(messageId: string) {
  if (isAssistantMessageExpanded(messageId)) {
    expandedAssistantMessageIds.value = expandedAssistantMessageIds.value.filter((id) => id !== messageId)
    return
  }

  expandedAssistantMessageIds.value = [...expandedAssistantMessageIds.value, messageId]
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
  padding: 8px 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  // 滚动条样式
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--editor-border, #cbd5e1);
    border-radius: 4px;

    &:hover {
      background: var(--editor-text-ghost, #94a3b8);
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 2px 0 4px;
  text-align: left;
  color: var(--editor-text-muted);

  .empty-icon {
    font-size: 14px;
    color: var(--editor-text-ghost);
  }

  .empty-text {
    margin: 0;
    font-size: 11px;
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
  max-width: 100%;
  padding: 8px 10px;
  border-radius: 12px;
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
    gap: 6px;

    .message-avatar {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--editor-accent, #3b82f6);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 11px;
    }

    .message-content-wrapper {
      flex: 1;
    }
  }

  .message-content {
    font-size: 13px;
    line-height: 1.55;
    white-space: pre-wrap;

    &--pending {
      color: var(--ai-text-muted, #64748b);
    }

    &--collapsed {
      position: relative;
      max-height: 9.2em;
      overflow: hidden;

      &::after {
        content: '';
        position: absolute;
        inset: auto 0 0;
        height: 28px;
        background: linear-gradient(180deg, transparent, var(--ai-assistant-bg, #f1f5f9));
      }
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
    background: color-mix(in srgb, var(--editor-text-primary, #0f172a) 8%, transparent);
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
    font-size: 10px;
    color: var(--ai-text-muted, #64748b);
  }
}

.message-content-toggle {
  margin-top: 6px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--editor-accent, #2563eb);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.message-user .message-content {
  max-height: 180px;
  overflow: auto;
}

.message-user-task-card {
  display: grid;
  gap: 4px;
}

.message-user-task-card__badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 18px;
  padding: 0 7px;
  border-radius: 999px;
  background: color-mix(in srgb, #ffffff 18%, transparent);
  font-size: 10px;
  font-weight: 700;
}

.message-user-task-card__title {
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
}

.message-user-task-card__detail {
  font-size: 11px;
  line-height: 1.45;
  color: color-mix(in srgb, #ffffff 84%, transparent);
}

.message-tool-card {
  margin-bottom: 8px;
  border-radius: 10px;
  border: 1px solid var(--ai-border, #e2e8f0);
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--ai-bg, #ffffff) 88%, transparent),
      color-mix(in srgb, var(--ai-bg-soft, #f8fafc) 96%, transparent)
    ),
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
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--color-warning-50, #fffbeb) 34%, var(--ai-bg, #ffffff)),
        color-mix(in srgb, var(--color-warning-50, #fff7ed) 28%, var(--ai-bg-soft, #f8fafc))
      ),
      var(--ai-bg-soft, #fff7ed);

    .message-tool-card__status {
      background: color-mix(in srgb, var(--color-warning-100, #fef3c7) 72%, var(--ai-bg, #ffffff));
      color: var(--color-warning-700, #b45309);
    }
  }
}

.message-tool-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px 6px;
}

.message-tool-card__title {
  font-size: 12px;
  font-weight: 600;
  color: var(--ai-text, #0f172a);
}

.message-tool-card__status {
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  background: var(--ai-accent-soft, #eff6ff);
  color: var(--editor-accent, #1d4ed8);
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.message-tool-card__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 5px 6px;
  padding: 0 10px 8px;
  color: var(--ai-text-muted, #64748b);
  font-size: 11px;

  span {
    display: inline-flex;
    align-items: center;
    min-height: 20px;
    padding: 0 7px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--editor-border, #94a3b8) 22%, transparent);
  }
}

.message-tool-card__detail {
  padding: 0 10px 10px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--ai-text-muted, #64748b);
}

.message-context-evidence {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  margin: 0 0 6px;
  color: var(--ai-text-muted, #64748b);
  font-size: 10px;
}

.message-context-evidence__label {
  font-weight: 700;
}

.message-context-evidence__chip {
  display: inline-flex;
  align-items: center;
  max-width: 148px;
  min-height: 20px;
  padding: 0 7px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--ai-border, #e2e8f0) 72%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 82%, transparent);
  color: var(--ai-text-muted, #64748b);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-tool-card__blocks {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 10px 10px;
}

.message-target-candidates {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 10px 10px;
}

.message-target-candidate {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(191, 219, 254, 0.9);
  background: color-mix(in srgb, var(--ai-accent-soft, #eff6ff) 72%, var(--ai-bg, #ffffff));
  color: var(--ai-text, #0f172a);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    background 0.2s ease;

  &:hover {
    border-color: color-mix(in srgb, var(--editor-accent, #60a5fa) 62%, var(--ai-border, #bfdbfe));
    background: color-mix(in srgb, var(--ai-accent-soft, #dbeafe) 86%, var(--ai-bg, #ffffff));
    transform: translateY(-1px);
  }
}

.message-target-candidate__title {
  font-size: 12px;
  font-weight: 600;
}

.message-target-candidate__meta,
.message-target-candidate__reason {
  font-size: 11px;
  color: var(--ai-text-muted, #64748b);
}

.message-retrieval-hits {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 10px 10px;
}

.message-retrieval-hit {
  padding: 8px 10px;
  border: 1px solid rgba(203, 213, 225, 0.9);
  border-radius: 8px;
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
  font-size: 12px;
  font-weight: 600;
  color: var(--ai-text, #0f172a);
}

.message-retrieval-hit__badge {
  display: inline-flex;
  align-items: center;
  min-height: 18px;
  padding: 0 7px;
  border-radius: 999px;
  background: var(--ai-accent-soft, #dbeafe);
  color: var(--editor-accent, #1d4ed8);
  font-size: 10px;
  font-weight: 600;
}

.message-retrieval-hit__reason,
.message-retrieval-hit__excerpt {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  color: var(--ai-text-muted, #64748b);
}

.message-plan-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  margin: 0;
  padding: 0 10px 10px;

  div {
    min-width: 0;
    padding: 7px 8px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--editor-layer-panel, rgba(255, 255, 255, 0.82)) 86%, transparent);
    border: 1px solid rgba(203, 213, 225, 0.8);
  }

  dt {
    margin-bottom: 4px;
    color: var(--ai-text-muted, #64748b);
    font-size: 10px;
    font-weight: 600;
  }

  dd {
    margin: 0;
    color: var(--ai-text, #0f172a);
    font-size: 11px;
    line-height: 1.5;
    word-break: break-word;
  }
}

.message-checkpoint-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0 10px 10px;
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
  background: var(--editor-border, #cbd5e1);
  flex-shrink: 0;
}

.message-checkpoint-item--running .message-checkpoint-item__dot {
  background: var(--editor-accent, #2563eb);
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
  font-size: 11px;
  font-weight: 600;
}

.message-checkpoint-item__detail {
  color: var(--ai-text-muted, #64748b);
  font-size: 11px;
  line-height: 1.5;
}

.message-tool-block {
  padding: 8px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--editor-layer-panel, rgba(255, 255, 255, 0.84)) 88%, transparent);
  border: 1px solid rgba(203, 213, 225, 0.9);
}

.message-tool-block__title {
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--ai-text, #0f172a);
}

.message-tool-block__columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.message-tool-block__panel {
  padding: 7px;
  border-radius: 8px;
  min-width: 0;
}

.message-tool-block__panel--before {
  background: color-mix(in srgb, var(--ai-bg-soft, #f8fafc) 90%, transparent);
}

.message-tool-block__panel--after {
  background: color-mix(in srgb, var(--ai-accent-soft, #eff6ff) 76%, var(--ai-bg, #ffffff));
}

.message-tool-block__label {
  margin-bottom: 4px;
  font-size: 10px;
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
  font-size: 11px;
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
    background: var(--editor-text-ghost, #94a3b8);
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
