<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { marked } from 'marked'
import { useReviewStore } from '../../stores/reviewStore'
import { sanitizeMarkdownHtml } from '@/utils/sanitize'

const reviewStore = useReviewStore()
const reportContainer = ref<HTMLDivElement | null>(null)

const activeReview = computed(() => reviewStore.activeReview)
const activeToolCall = computed(() => reviewStore.activeToolCall)

// 标题：章节审阅显示章节名，项目审阅显示"整个项目"
const titleText = computed(() => {
  const review = activeReview.value
  if (!review) return '审查'
  if (review.kind === 'chapter') {
    return `审查 - ${review.target?.chapterTitle || review.target?.chapterId || '当前章节'}`
  }
  return '审查 - 整个项目'
})

// 状态判断
const isStreaming = computed(() => activeReview.value?.status === 'streaming')
const isError = computed(() => activeReview.value?.status === 'error')
const isDone = computed(() => activeReview.value?.status === 'done')
const isEmptyStreaming = computed(
  () => isStreaming.value && (activeReview.value?.content || '') === '',
)

// 将 markdown 渲染为已 sanitize 的 HTML
const renderedHtml = computed(() => {
  const raw = activeReview.value?.content || ''
  if (!raw) return ''
  try {
    const html = marked.parse(raw, { breaks: true, gfm: true }) as string
    return sanitizeMarkdownHtml(html)
  } catch {
    return sanitizeMarkdownHtml(raw)
  }
})

// 流式追加时自动滚动到底部
watch(
  () => activeReview.value?.content,
  async () => {
    await nextTick()
    if (reportContainer.value) {
      reportContainer.value.scrollTop = reportContainer.value.scrollHeight
    }
  },
)
</script>

<template>
  <div class="review-report">
    <!-- 标题栏 -->
    <header class="review-report__header">
      <h2 class="review-report__title">{{ titleText }}</h2>
    </header>

    <!-- 工具状态条：仅在工具调用进行中显示 -->
    <div v-if="activeToolCall" class="review-report__tool-chip" role="status">
      <span class="review-report__tool-dot" aria-hidden="true"></span>
      <span class="review-report__tool-text">
        正在查阅 {{ activeToolCall.name }}...
      </span>
    </div>

    <!-- 错误横幅 -->
    <div v-if="isError" class="review-report__banner review-report__banner--error" role="alert">
      <span class="review-report__banner-label">审查失败</span>
      <span class="review-report__banner-detail">
        {{ activeReview?.errorMessage || '未知错误，请稍后重试' }}
      </span>
    </div>

    <!-- 内容区 -->
    <div ref="reportContainer" class="review-report__content">
      <!-- 空状态：流式开始但尚未收到首个 token -->
      <div v-if="isEmptyStreaming" class="review-report__empty">
        <span class="review-report__spinner" aria-hidden="true"></span>
        <p class="review-report__empty-text">正在准备审查报告...</p>
      </div>

      <!-- Markdown 渲染结果 -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <article v-else class="review-report__article" v-html="renderedHtml"></article>
    </div>

    <!-- 状态横幅：完成 / 流式中 -->
    <footer class="review-report__footer">
      <span v-if="isStreaming" class="review-report__status review-report__status--streaming">
        <span class="review-report__spinner review-report__spinner--small" aria-hidden="true"></span>
        <span>AI 正在审查...</span>
      </span>
      <span v-else-if="isDone" class="review-report__status review-report__status--done">
        审查完成
      </span>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.review-report {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--editor-layer-panel, #ffffff);
  color: var(--editor-text-primary, #0f172a);
}

.review-report__header {
  flex-shrink: 0;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--editor-border, #e2e8f0);
}

.review-report__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--editor-text-primary, #0f172a);
  word-break: break-word;
}

.review-report__tool-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 10px 20px 0;
  padding: 4px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--editor-accent, #3b82f6) 12%, transparent);
  color: var(--editor-accent, #1d4ed8);
  font-size: 12px;
  font-weight: 600;
  align-self: flex-start;
}

.review-report__tool-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--editor-accent, #3b82f6);
  animation: review-report-pulse 1.4s ease-in-out infinite;
}

.review-report__tool-text {
  line-height: 1.4;
}

@keyframes review-report-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.7);
  }
}

.review-report__banner {
  flex-shrink: 0;
  margin: 10px 20px 0;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.5;
}

.review-report__banner--error {
  background: color-mix(in srgb, #dc2626 12%, transparent);
  border: 1px solid color-mix(in srgb, #dc2626 32%, transparent);
  color: #b91c1c;
}

.review-report__banner-label {
  display: block;
  font-weight: 700;
  margin-bottom: 2px;
}

.review-report__banner-detail {
  display: block;
  word-break: break-word;
}

.review-report__content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 20px;

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

.review-report__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100%;
  min-height: 160px;
  color: var(--editor-text-muted, #64748b);
}

.review-report__empty-text {
  margin: 0;
  font-size: 13px;
}

.review-report__article {
  font-size: 13px;
  line-height: 1.65;
  word-break: break-word;

  :deep(p) {
    margin: 0 0 10px;
  }

  :deep(p:last-child) {
    margin-bottom: 0;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin: 16px 0 8px;
    font-weight: 600;
    line-height: 1.4;
  }

  :deep(h1) {
    font-size: 18px;
  }

  :deep(h2) {
    font-size: 16px;
  }

  :deep(h3) {
    font-size: 14px;
  }

  :deep(ul),
  :deep(ol) {
    margin: 0 0 10px;
    padding-left: 22px;
  }

  :deep(li) {
    margin: 2px 0;
  }

  :deep(blockquote) {
    margin: 10px 0;
    padding: 6px 12px;
    border-left: 3px solid var(--editor-border, #cbd5e1);
    color: var(--editor-text-muted, #64748b);
    background: color-mix(in srgb, var(--editor-border, #e2e8f0) 24%, transparent);
    border-radius: 0 6px 6px 0;
  }

  :deep(code) {
    padding: 2px 6px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--editor-text-primary, #0f172a) 8%, transparent);
    font-family:
      ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
    font-size: 12.5px;
  }

  :deep(pre) {
    margin: 10px 0;
    padding: 10px 12px;
    border-radius: 8px;
    background: #0f172a;
    color: #e2e8f0;
    overflow-x: auto;

    code {
      padding: 0;
      background: transparent;
      color: inherit;
      font-size: 12.5px;
    }
  }

  :deep(table) {
    width: 100%;
    margin: 10px 0;
    border-collapse: collapse;
    font-size: 12.5px;

    th,
    td {
      padding: 6px 8px;
      border: 1px solid var(--editor-border, #e2e8f0);
      text-align: left;
    }

    th {
      background: color-mix(in srgb, var(--editor-border, #e2e8f0) 32%, transparent);
      font-weight: 600;
    }
  }

  :deep(a) {
    color: var(--editor-accent, #2563eb);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  :deep(hr) {
    margin: 14px 0;
    border: none;
    border-top: 1px solid var(--editor-border, #e2e8f0);
  }
}

.review-report__footer {
  flex-shrink: 0;
  padding: 8px 20px 12px;
  border-top: 1px solid var(--editor-border, #e2e8f0);
  display: flex;
  align-items: center;
  min-height: 36px;
}

.review-report__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.review-report__status--streaming {
  color: var(--editor-text-muted, #64748b);
}

.review-report__status--done {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: color-mix(in srgb, #16a34a 12%, transparent);
  color: #15803d;
  font-weight: 600;
}

.review-report__spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid color-mix(in srgb, var(--editor-text-muted, #94a3b8) 32%, transparent);
  border-top-color: var(--editor-text-muted, #64748b);
  border-radius: 50%;
  animation: review-report-spin 0.8s linear infinite;
}

.review-report__spinner--small {
  width: 12px;
  height: 12px;
  border-width: 2px;
}

@keyframes review-report-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .review-report__tool-dot,
  .review-report__spinner {
    animation: none;
  }
}
</style>
