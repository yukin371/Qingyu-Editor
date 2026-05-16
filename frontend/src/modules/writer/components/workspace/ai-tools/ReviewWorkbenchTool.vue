<template>
  <section class="tool-panel">
    <header class="tool-panel__header">
      <div class="tool-panel__header-copy">
        <p class="tool-panel__eyebrow">审校</p>
        <h3 class="tool-panel__title">文本审校与风险复核</h3>
        <p class="tool-panel__lede">
          沿用同一套候选卡结构，聚焦语言问题与风险表达，不直接进入正文 diff。
        </p>
      </div>
      <div class="tool-panel__actions">
        <button
          type="button"
          class="tool-panel__secondary"
          :disabled="loading || !content.trim()"
          @click="handleProofread"
        >
          {{ loading && mode === 'proofread' ? '处理中…' : '文本校对' }}
        </button>
        <button
          type="button"
          class="tool-panel__primary"
          :disabled="loading || !content.trim()"
          @click="handleAudit"
        >
          {{ loading && mode === 'audit' ? '处理中…' : '敏感词检查' }}
        </button>
      </div>
    </header>

    <label class="field field--stacked">
      <span>检测内容</span>
      <textarea
        v-model="content"
        rows="7"
        placeholder="输入需要检测的内容。后续可直接抓取当前章节正文。"
      />
    </label>

    <div
      class="tool-panel__status"
      :class="{
        'tool-panel__status--running': loading,
        'tool-panel__status--success': hasResult && !loading,
        'tool-panel__status--warning': !!props.actionTrigger && !hasResult && !loading,
      }"
    >
      <strong>{{ statusTitle }}</strong>
      <span>{{ statusDescription }}</span>
    </div>

    <div v-if="!hasResult && !errorText" class="tool-panel__empty">
      <strong>审校结果会显示在这里</strong>
      <p>可执行文本校对或风险检查。</p>
    </div>

    <article v-if="mode === 'proofread' && issues.length" class="result-card">
      <div class="result-card__header">
        <div>
          <strong>校对结果</strong>
          <p class="result-card__caption">聚焦错别字、语法与标点问题，适合发布前清理。</p>
        </div>
        <span class="pill">评分 {{ scoreText }}</span>
      </div>
      <div class="result-card__meta-row">
        <span class="result-chip">问题 {{ issues.length }}</span>
        <span class="result-chip result-chip--soft">模式: 文本校对</span>
      </div>
      <ul class="review-issues">
        <li v-for="issue in issues" :key="issue.id || issue.message">
          <strong>{{ issue.type || '问题' }}<span v-if="issue.severity" class="severity-pill">{{ issue.severity }}</span></strong>
          <span>{{ issue.message || '未提供说明' }}</span>
          <small v-if="issue.suggestions?.length">建议：{{ issue.suggestions.join('；') }}</small>
        </li>
      </ul>
    </article>

    <article v-if="mode === 'audit' && auditWords.length" class="result-card">
      <div class="result-card__header">
        <div>
          <strong>风险词结果</strong>
          <p class="result-card__caption">标出敏感词与疑似风险表达，便于二次人工复核。</p>
        </div>
        <span class="pill pill--warn">命中 {{ auditWords.length }}</span>
      </div>
      <div class="result-card__meta-row">
        <span class="result-chip result-chip--warn">{{ auditSummaryText }}</span>
      </div>
      <ul class="review-issues">
        <li v-for="word in auditWords" :key="String(word.id || word.word || word.context)">
          <strong>{{ String(word.word || '敏感项') }}</strong>
          <span>{{ String(word.suggestion || word.reason || '建议进一步人工复核') }}</span>
        </li>
      </ul>
    </article>

    <WorkbenchErrorState v-if="errorText" :message="errorText" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import WorkbenchErrorState from './WorkbenchErrorState.vue'
import {
  auditSensitiveWords,
  proofreadContent,
  type ReviewIssue,
} from '@/modules/ai/api/workbench'
import type {
  WriterAIActionTrigger,
  WriterResultCandidate,
} from '@/modules/writer/types/workflow'
import { resolveWriterAIErrorState } from '@/modules/writer/utils/writerAIError'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type { WriterAIAssetSummary } from '@/modules/writer/utils/writerAIContext'

const props = defineProps<{
  projectId: string
  chapterId: string
  chapterTitle: string
  chapters?: SidebarChapterSummary[]
  seedText: string
  actionTrigger: WriterAIActionTrigger | null
  aiSummaryContextText?: string
  aiAssetSummaries?: WriterAIAssetSummary[]
}>()

const emit = defineEmits<{
  (e: 'resultCandidate', payload: WriterResultCandidate): void
}>()

const content = ref('')
const loading = ref(false)
const errorText = ref('')
const mode = ref<'proofread' | 'audit'>('proofread')
const issues = ref<ReviewIssue[]>([])
const score = ref<number | undefined>(undefined)
const auditWords = ref<Array<Record<string, unknown>>>([])

const scoreText = computed(() => (typeof score.value === 'number' ? score.value.toFixed(1) : '--'))
const auditSummaryText = computed(() => auditWords.value.length > 0 ? `待人工复核 ${auditWords.value.length} 项` : '未发现明显风险词')
const hasResult = computed(() => issues.value.length > 0 || auditWords.value.length > 0)
const statusTitle = computed(() => {
  if (loading.value) return '处理中'
  if (mode.value === 'audit' && auditWords.value.length > 0) return '已就绪'
  if (mode.value === 'proofread' && issues.value.length > 0) return '已就绪'
  if (props.actionTrigger) return '已同步'
  return '等待执行'
})
const statusDescription = computed(() => {
  if (loading.value) return mode.value === 'audit' ? '正在扫描风险表达。' : '正在执行文本校对。'
  if (mode.value === 'audit' && auditWords.value.length > 0) {
    return `已识别 ${auditWords.value.length} 项，建议人工复核。`
  }
  if (mode.value === 'proofread' && issues.value.length > 0) {
    return `已识别 ${issues.value.length} 条问题，评分 ${scoreText.value}。`
  }
  if (props.actionTrigger) return '已注入检测内容，可直接执行。'
  return '输入内容后可执行审校。'
})

watch(
  () => props.seedText,
  (value) => {
    if (!content.value.trim() && value.trim()) {
      content.value = value
    }
  },
  { immediate: true },
)

watch(
  () => props.actionTrigger?.id,
  async () => {
    const trigger = props.actionTrigger
    if (!trigger || !['proofread', 'review', 'audit'].includes(trigger.action)) return

    content.value = trigger.text?.trim() || props.seedText || ''
    if (!content.value.trim()) return

    if (trigger.action === 'audit') {
      await handleAudit()
      return
    }

    await handleProofread()
  },
)

function buildProofreadGeneratedText(nextIssues: ReviewIssue[], nextScore?: number) {
  const header =
    typeof nextScore === 'number'
      ? `审校评分：${nextScore.toFixed(1)}`
      : '审校结果：需要人工复核'
  const issueLines = nextIssues.map((issue, index) => {
    const parts = [
      `${index + 1}. ${issue.type || '问题'}：${issue.message || '未提供说明'}`,
      issue.suggestions?.length ? `建议：${issue.suggestions.join('；')}` : '',
    ].filter(Boolean)
    return parts.join('；')
  })

  return [header, ...issueLines].join('\n')
}

function buildAuditGeneratedText(nextAuditWords: Array<Record<string, unknown>>) {
  return nextAuditWords
    .map((word, index) => {
      const label = String(word.word || word.context || `风险项 ${index + 1}`)
      const suggestion = String(word.suggestion || word.reason || '建议进一步人工复核')
      return `${index + 1}. ${label}：${suggestion}`
    })
    .join('\n')
}

function emitProofreadCandidate(nextIssues: ReviewIssue[], nextScore?: number) {
  emit('resultCandidate', {
    source: 'review',
    action: 'proofread',
    title: '审校建议提案',
    summary:
      nextIssues.length > 0
        ? `检测到 ${nextIssues.length} 条语言问题，建议人工复核后处理。`
        : '已生成审校建议提案。',
    generatedText: buildProofreadGeneratedText(nextIssues, nextScore),
    sourceText: content.value,
  })
}

function emitAuditCandidate(nextAuditWords: Array<Record<string, unknown>>) {
  emit('resultCandidate', {
    source: 'review',
    action: 'audit',
    title: '风险复核提案',
    summary:
      nextAuditWords.length > 0
        ? `命中 ${nextAuditWords.length} 项风险表达，建议二次复核。`
        : '已生成风险复核提案。',
    generatedText: buildAuditGeneratedText(nextAuditWords),
    sourceText: content.value,
  })
}

async function handleProofread() {
  if (!content.value.trim()) return
  loading.value = true
  mode.value = 'proofread'
  errorText.value = ''
  try {
    const result = await proofreadContent({
      content: content.value,
      projectId: props.projectId || undefined,
      chapterId: props.chapterId || undefined,
    })
    issues.value = result.issues
    score.value = result.score
    emitProofreadCandidate(result.issues, result.score)
  } catch (error) {
    console.error('[ReviewWorkbenchTool] proofread failed:', error)
    errorText.value = resolveWriterAIErrorState(error).message
  } finally {
    loading.value = false
  }
}

async function handleAudit() {
  if (!content.value.trim()) return
  loading.value = true
  mode.value = 'audit'
  errorText.value = ''
  try {
    const result = await auditSensitiveWords({
      content: content.value,
      projectId: props.projectId || undefined,
      chapterId: props.chapterId || undefined,
    })
    auditWords.value = result.sensitiveWords
    emitAuditCandidate(result.sensitiveWords)
  } catch (error) {
    console.error('[ReviewWorkbenchTool] audit failed:', error)
    errorText.value = resolveWriterAIErrorState(error).message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
@use './shared.scss';

.review-issues {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 10px;
  color: #544d47;
}

.review-issues strong {
  display: block;
  margin-bottom: 2px;
  color: #1f2430;
}

.review-issues small {
  color: #7a6d63;
  font-size: 11px;
  line-height: 1.5;
}

.pill {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(54, 80, 107, 0.12);
  color: #27425c;
  font-size: 11px;
  font-weight: 800;
}

.pill--warn {
  background: rgba(143, 63, 47, 0.12);
  color: #7b3123;
}

.severity-pill {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(54, 80, 107, 0.1);
  color: #27425c;
  font-size: 10px;
  font-weight: 800;
}
</style>
