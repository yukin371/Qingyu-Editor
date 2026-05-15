<template>
  <section class="tool-panel">
    <header class="tool-panel__header">
      <div class="tool-panel__header-copy">
        <p class="tool-panel__eyebrow">总结</p>
        <h3 class="tool-panel__title">摘要与方向提炼</h3>
        <p class="tool-panel__lede">统一输出片段摘要或章节方向提案，只生成候选，不直接覆盖正文。</p>
      </div>
      <div class="tool-panel__actions">
        <button
          type="button"
          class="tool-panel__secondary"
          :disabled="loading || !content.trim()"
          @click="handleSelectionSummary"
        >
          {{ loading && mode === 'selection' ? '处理中…' : '总结片段' }}
        </button>
        <button
          type="button"
          class="tool-panel__primary"
          :disabled="loading || !projectId || !chapterId"
          @click="handleChapterSummary"
        >
          {{ loading && mode === 'chapter' ? '处理中…' : '总结章节' }}
        </button>
      </div>
    </header>

    <label class="field field--stacked">
      <span>内容输入</span>
      <textarea v-model="content" rows="7" placeholder="输入要提炼的文本，或直接使用章节总结。" />
    </label>

    <div
      class="tool-panel__status"
      :class="{
        'tool-panel__status--running': loading,
        'tool-panel__status--success': !!summary && !loading,
        'tool-panel__status--warning': !!props.actionTrigger && !summary && !loading,
      }"
    >
      <strong>{{ statusTitle }}</strong>
      <span>{{ statusDescription }}</span>
    </div>

    <section class="result-card result-card--planner">
      <div class="result-card__header">
        <div>
          <strong>结构扩展</strong>
          <p class="result-card__caption">
            先做最小可演示版：让 AI 直接补出卷/章节草案，并一键创建到项目。
          </p>
        </div>
        <div class="tool-panel__actions">
          <button
            type="button"
            class="tool-panel__secondary"
            :disabled="planning || !planningPrompt.trim()"
            @click="handleGenerateStructure('volume')"
          >
            {{ planning && structurePlanMode === 'volume' ? '生成中…' : 'AI 增加卷' }}
          </button>
          <button
            type="button"
            class="tool-panel__primary"
            :disabled="planning || !planningPrompt.trim()"
            @click="handleGenerateStructure('chapter')"
          >
            {{ planning && structurePlanMode === 'chapter' ? '生成中…' : 'AI 增加章节' }}
          </button>
        </div>
      </div>
      <div class="tool-panel__controls">
        <label class="field">
          <span>建议数量</span>
          <select v-model.number="structurePlanCount">
            <option :value="1">1</option>
            <option :value="2">2</option>
            <option :value="3">3</option>
            <option :value="4">4</option>
            <option :value="5">5</option>
          </select>
        </label>
        <label class="field">
          <span>规划要求</span>
          <input
            v-model="planningPrompt"
            type="text"
            placeholder="例如：围绕当前冲突补 3 个后续章节，保持人物节奏。"
          />
        </label>
      </div>
      <div
        class="tool-panel__status"
        :class="{
          'tool-panel__status--running': planning,
          'tool-panel__status--success': structurePlanItems.length > 0 && !planning,
          'tool-panel__status--warning': !!plannerErrorText && !planning,
        }"
      >
        <strong>{{ planningStatusTitle }}</strong>
        <span>{{ planningStatusDescription }}</span>
      </div>
      <div v-if="structurePlanItems.length" class="result-card__body">
        <div class="result-card__section">
          <span class="result-card__section-label">规划摘要</span>
          <p class="summary-text">{{ structurePlanSummary }}</p>
        </div>
        <div class="result-card__section">
          <div class="result-card__meta-row result-card__meta-row--flush">
            <span class="result-chip">
              {{ structurePlanMode === 'volume' ? '卷草案' : '章节草案' }}
            </span>
            <span class="result-chip result-chip--soft">共 {{ structurePlanItems.length }} 项</span>
          </div>
          <ol class="structure-plan-list">
            <li
              v-for="item in structurePlanItems"
              :key="`${structurePlanMode}-${item.title}`"
              class="structure-plan-list__item"
            >
              <strong>{{ item.title }}</strong>
              <p v-if="item.summary">{{ item.summary }}</p>
              <span v-if="item.reason">{{ item.reason }}</span>
            </li>
          </ol>
          <button
            type="button"
            class="result-card__action result-card__action--primary"
            @click="handleApplyStructurePlan"
          >
            创建到项目
          </button>
        </div>
      </div>
      <p v-else-if="!plannerErrorText" class="tool-panel__empty-copy">
        这里会生成可直接创建的卷/章节草案。
      </p>
      <p v-if="plannerErrorText" class="tool-error">{{ plannerErrorText }}</p>
    </section>

    <div v-if="!summary && !errorText" class="tool-panel__empty">
      <strong>摘要结果会显示在这里</strong>
      <p>可总结片段，也可直接总结当前章节。</p>
    </div>

    <article v-if="summary" class="result-card">
      <div class="result-card__header">
        <div>
          <strong>{{ mode === 'chapter' ? '章节摘要' : '片段摘要' }}</strong>
          <p class="result-card__caption">
            {{
              mode === 'chapter'
                ? '针对当前章节生成结构化摘要。'
                : '适合快速提炼当前片段的核心信息。'
            }}
          </p>
        </div>
      </div>
      <div class="result-card__meta-row">
        <span class="result-chip">{{ mode === 'chapter' ? '章节模式' : '片段模式' }}</span>
        <span v-if="keyPoints.length" class="result-chip result-chip--soft"
          >要点 {{ keyPoints.length }}</span
        >
      </div>
      <div class="result-card__body">
        <div class="result-card__section">
          <span class="result-card__section-label">摘要正文</span>
          <p class="summary-text">{{ summary }}</p>
        </div>
        <div v-if="keyPoints.length" class="result-card__section">
          <span class="result-card__section-label">核心要点</span>
          <ul class="summary-points">
            <li v-for="point in keyPoints" :key="point">{{ point }}</li>
          </ul>
        </div>
      </div>
    </article>

    <p v-if="errorText" class="tool-error">{{ errorText }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  generateStructurePlan,
  summarizeChapter,
  summarizeSelection,
} from '@/modules/ai/api/workbench'
import type {
  WriterAIActionTrigger,
  WriterResultCandidate,
  WriterStructurePlanMode,
  WriterStructurePlanPayload,
  WriterWorkflowContext,
} from '@/modules/writer/types/workflow'
import { buildWriterAIContextBlock } from '@/modules/writer/utils/writerAIContext'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'

const props = defineProps<{
  projectId: string
  chapterId: string
  chapterTitle: string
  chapters?: SidebarChapterSummary[]
  seedText: string
  actionTrigger: WriterAIActionTrigger | null
  workflowContext?: WriterWorkflowContext | null
  aiSummaryContextText?: string
}>()

const emit = defineEmits<{
  (e: 'resultCandidate', payload: WriterResultCandidate): void
  (e: 'applyStructurePlan', payload: WriterStructurePlanPayload): void
}>()

const content = ref('')
const summary = ref('')
const keyPoints = ref<string[]>([])
const loading = ref(false)
const errorText = ref('')
const mode = ref<'selection' | 'chapter'>('selection')
const planningPrompt = ref('')
const planning = ref(false)
const plannerErrorText = ref('')
const structurePlanMode = ref<WriterStructurePlanMode>('chapter')
const structurePlanSummary = ref('')
const structurePlanItems = ref<WriterStructurePlanPayload['items']>([])
const structurePlanCount = ref(3)
const statusTitle = computed(() => {
  if (loading.value) return '处理中'
  if (summary.value.trim()) return '已就绪'
  if (props.actionTrigger) return '已同步'
  return '等待执行'
})
const statusDescription = computed(() => {
  if (loading.value) return mode.value === 'chapter' ? '正在提炼章节摘要。' : '正在提炼片段摘要。'
  if (summary.value.trim()) {
    return keyPoints.value.length > 0
      ? `已生成摘要与 ${keyPoints.value.length} 条要点。`
      : '已生成摘要结果。'
  }
  if (props.actionTrigger) return '已注入章节/片段上下文，可直接执行。'
  return '可先输入片段，或直接总结章节。'
})
const planningStatusTitle = computed(() => {
  if (planning.value) return '正在规划'
  if (structurePlanItems.value.length > 0) return '结构草案已就绪'
  if (plannerErrorText.value) return '规划失败'
  return '等待结构生成'
})
const planningStatusDescription = computed(() => {
  if (planning.value) {
    return structurePlanMode.value === 'volume'
      ? 'AI 正在补出新的卷级结构。'
      : 'AI 正在补出新的章节结构。'
  }
  if (structurePlanItems.value.length > 0) {
    return '可以直接创建到当前项目，后续再继续收敛为更完整的规划工作流。'
  }
  if (plannerErrorText.value) return plannerErrorText.value
  return '先写一句规划要求，再让 AI 给出卷/章节草案。'
})
const effectiveWorkflowContext = computed(
  () => props.actionTrigger?.context ?? props.workflowContext ?? null,
)

watch(
  () => props.seedText,
  (value) => {
    if (!content.value.trim() && value.trim()) {
      content.value = value
    }
    if (!planningPrompt.value.trim()) {
      planningPrompt.value = props.chapterTitle
        ? `围绕「${props.chapterTitle}」继续补出后续结构，保持当前叙事节奏。`
        : '围绕当前正文补出后续结构，保持当前叙事节奏。'
    }
  },
  { immediate: true },
)

watch(
  () => props.actionTrigger?.id,
  async () => {
    const trigger = props.actionTrigger
    if (!trigger || !['summary', 'summarize', 'summarize_chapter'].includes(trigger.action)) return

    content.value = trigger.text?.trim() || props.seedText || ''

    if (trigger.action === 'summarize_chapter' && props.projectId && props.chapterId) {
      await handleChapterSummary()
      return
    }

    if (content.value.trim()) {
      await handleSelectionSummary()
    }
  },
)

function buildGeneratedText(nextSummary: string, nextKeyPoints: string[]) {
  if (nextKeyPoints.length === 0) {
    return nextSummary
  }

  return `${nextSummary}\n\n核心要点：\n${nextKeyPoints.map((point) => `- ${point}`).join('\n')}`
}

function emitResultCandidate(nextSummary: string, nextKeyPoints: string[]) {
  const generatedText = buildGeneratedText(nextSummary, nextKeyPoints)
  const isChapterMode = mode.value === 'chapter'
  const sourceText = isChapterMode
    ? props.chapterTitle || props.chapterId || props.seedText || content.value
    : content.value

  emit('resultCandidate', {
    source: 'summary',
    action: isChapterMode ? 'summarize_chapter' : 'summary',
    title: isChapterMode ? '章节方向提案' : '片段摘要结果',
    summary: nextSummary.slice(0, 72) || '已生成新的摘要结果。',
    generatedText,
    sourceText,
  })
}

async function handleSelectionSummary() {
  if (!content.value.trim()) return
  loading.value = true
  mode.value = 'selection'
  errorText.value = ''
  try {
    const result = await summarizeSelection({
      content: content.value,
      projectId: props.projectId || undefined,
      chapterId: props.chapterId || undefined,
      summaryType: 'detailed',
    })
    summary.value = result.summary
    keyPoints.value = result.keyPoints
    emitResultCandidate(result.summary, result.keyPoints)
  } catch (error) {
    console.error('[SummaryWorkbenchTool] selection summarize failed:', error)
    errorText.value = '总结失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

async function handleChapterSummary() {
  if (!props.projectId || !props.chapterId) return
  loading.value = true
  mode.value = 'chapter'
  errorText.value = ''
  try {
    const result = await summarizeChapter({
      projectId: props.projectId,
      chapterId: props.chapterId,
      outlineLevel: 3,
    })
    summary.value = result.summary
    keyPoints.value = result.keyPoints
    emitResultCandidate(result.summary, result.keyPoints)
  } catch (error) {
    console.error('[SummaryWorkbenchTool] chapter summarize failed:', error)
    if (props.seedText.trim()) {
      try {
        const fallbackResult = await summarizeSelection({
          content: props.seedText,
          projectId: props.projectId || undefined,
          chapterId: props.chapterId || undefined,
          summaryType: 'detailed',
        })
        summary.value = fallbackResult.summary
        keyPoints.value = fallbackResult.keyPoints
        emitResultCandidate(fallbackResult.summary, fallbackResult.keyPoints)
        errorText.value = ''
        return
      } catch (fallbackError) {
        console.error('[SummaryWorkbenchTool] chapter summarize fallback failed:', fallbackError)
      }
    }
    errorText.value = '章节总结失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

async function handleGenerateStructure(mode: WriterStructurePlanMode) {
  if (!planningPrompt.value.trim()) return
  planning.value = true
  plannerErrorText.value = ''
  structurePlanMode.value = mode
  try {
    const result = await generateStructurePlan({
      projectId: props.projectId,
      chapterId: props.chapterId || undefined,
      chapterTitle: props.chapterTitle || undefined,
      seedText: props.seedText || content.value,
      mode,
      count: structurePlanCount.value,
      prompt: planningPrompt.value,
      workflowContextPrompt: buildWriterAIContextBlock({
        workflowContext: effectiveWorkflowContext.value,
        aiSummaryContextText: props.aiSummaryContextText,
      }),
    })
    structurePlanSummary.value = result.summary
    structurePlanItems.value = result.items
    if (result.items.length === 0) {
      plannerErrorText.value = 'AI 已返回结果，但暂时没解析出可创建的标题。请换个描述再试。'
    }
  } catch (error) {
    console.error('[SummaryWorkbenchTool] structure planning failed:', error)
    plannerErrorText.value = '结构生成失败，请稍后重试。'
  } finally {
    planning.value = false
  }
}

function handleApplyStructurePlan() {
  if (structurePlanItems.value.length === 0) {
    return
  }

  emit('applyStructurePlan', {
    mode: structurePlanMode.value,
    prompt: planningPrompt.value.trim(),
    summary: structurePlanSummary.value.trim(),
    items: structurePlanItems.value,
  })
}
</script>

<style scoped lang="scss">
@use './shared.scss';

.result-card--planner {
  margin-top: 16px;
}

.result-card__meta-row--flush {
  margin-bottom: 10px;
}

.result-card__action--primary {
  background: linear-gradient(180deg, #8f3f2f 0%, #6f271a 100%);
  color: #fff;
  border-color: rgba(143, 63, 47, 0.25);
}

.tool-panel__empty-copy {
  margin: 12px 0 0;
  color: #6a5f55;
  font-size: 12px;
  line-height: 1.6;
}

.summary-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: #544d47;
}

.summary-points {
  margin: 12px 0 0;
  padding-left: 18px;
  color: #544d47;
  display: grid;
  gap: 8px;
}

.structure-plan-list {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 10px;
  color: #4f463e;
}

.structure-plan-list__item {
  display: grid;
  gap: 4px;

  strong {
    font-size: 13px;
    color: #2f241b;
  }

  p,
  span {
    margin: 0;
    font-size: 12px;
    line-height: 1.6;
    color: #6a5f55;
  }
}
</style>
