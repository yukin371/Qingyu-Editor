<template>
  <section class="tool-panel">
    <header class="tool-panel__header">
      <div class="tool-panel__header-copy">
        <h3 class="tool-panel__title">改写</h3>
      </div>
      <button
        type="button"
        class="tool-panel__primary"
        :disabled="loading || !draftText.trim() || !projectId"
        @click="handleRun"
      >
        {{ loading ? '处理中…' : '执行改写' }}
      </button>
    </header>

    <div class="tool-panel__controls">
      <label class="field">
        <span>模式</span>
        <select v-model="mode">
          <option value="polish">润色</option>
          <option value="expand">扩写</option>
          <option value="shorten">缩写</option>
        </select>
      </label>

      <label class="field">
        <span>写作取向</span>
        <select v-model="skillId">
          <option value="">自动</option>
          <option
            v-for="skill in writingSkills"
            :key="skill.id"
            :value="skill.id"
          >
            {{ skill.label }}
          </option>
        </select>
      </label>

      <label class="field">
        <span>附加要求</span>
        <input v-model="instructions" type="text" placeholder="例如：保留人物语气，降低重复表达" />
      </label>
    </div>

    <div
      class="tool-panel__status"
      :class="{
        'tool-panel__status--running': loading,
        'tool-panel__status--success': !!resultText && !loading,
        'tool-panel__status--warning': !!props.actionTrigger && !resultText && !loading,
      }"
    >
      <strong>{{ statusTitle }}</strong>
      <span>{{ statusDescription }}</span>
    </div>

    <label class="field field--stacked">
      <span>输入文本</span>
      <textarea
        v-model="draftText"
        rows="8"
        placeholder="输入或粘贴要加工的文本。后续可自动绑定编辑器选区。"
      />
    </label>

    <div v-if="!resultText && !errorText" class="tool-panel__empty">
      <strong>等待结果</strong>
    </div>

    <article v-if="resultText" class="result-card">
      <div class="result-card__header">
        <div>
          <strong>改写结果</strong>
          <p class="result-card__caption">{{ applyModeDescription }}</p>
        </div>
        <button type="button" class="result-card__action" @click="handleApply">应用到正文</button>
      </div>
      <div class="result-card__meta-row">
        <span class="result-chip">{{ modeLabel }}</span>
        <span class="result-chip result-chip--soft">{{ applyModeLabel }}</span>
        <span v-if="instructions.trim()" class="result-chip result-chip--ghost">附加要求已启用</span>
      </div>
      <div class="result-card__body">
        <div class="result-card__section">
          <span class="result-card__section-label">输入上下文</span>
          <p class="result-card__section-text">{{ inputPreview }}</p>
        </div>
        <div class="result-card__section">
          <span class="result-card__section-label">生成结果</span>
          <p class="result-card__section-text">{{ resultText }}</p>
        </div>
      </div>
    </article>

    <WorkbenchErrorState v-if="errorText" :message="errorText" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import WorkbenchErrorState from './WorkbenchErrorState.vue'
import { rewriteWithWorkbench } from '@/modules/ai/api/workbench'
import {
  listWriterAIWritingSkills,
  type WriterAIWritingSkillId,
} from '@/modules/writer/config/writerAIPromptPresets'
import type { WriterProjectBrief } from '@/modules/writer/services/writerProjectBrief.service'
import type { WriterUserPreferenceMemory } from '@/modules/writer/services/writerUserPreferenceMemory.service'
import type {
  WriterAIActionTrigger,
  WriterWorkflowContext,
} from '@/modules/writer/types/workflow'
import {
  mergeWriterAIInstructions,
  type WriterAIAssetSummary,
  type WriterAISceneStageSummary,
} from '@/modules/writer/utils/writerAIContext'
import { resolveWriterAIErrorState } from '@/modules/writer/utils/writerAIError'
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
  aiAssetSummaries?: WriterAIAssetSummary[]
  aiSceneStageSummary?: WriterAISceneStageSummary
  writerProjectBrief?: WriterProjectBrief | null
  writerUserPreference?: WriterUserPreferenceMemory | null
}>()

const emit = defineEmits<{
  (
    e: 'apply',
    payload: {
      action: string
      sourceText: string
      generatedText: string
      applyMode?: 'replace_selection' | 'insert_after_selection' | 'append_paragraph' | 'replace_document'
    },
  ): void
}>()

const mode = ref<'polish' | 'expand' | 'shorten'>('polish')
const skillId = ref<WriterAIWritingSkillId | ''>('')
const draftText = ref('')
const instructions = ref('')
const resultText = ref('')
const loading = ref(false)
const errorText = ref('')
const currentApplyMode = computed(() =>
  mode.value === 'expand' ? 'insert_after_selection' : 'replace_selection',
)
const inputPreview = computed(() => {
  const text = draftText.value.trim()
  if (!text) return '等待输入或选区触发。'
  return text.length > 220 ? `${text.slice(0, 220)}…` : text
})
const modeLabel = computed(() => {
  if (mode.value === 'expand') return '扩写'
  if (mode.value === 'shorten') return '缩写'
  return '润色'
})
const applyModeLabel = computed(() => {
  if (currentApplyMode.value === 'insert_after_selection') return '插入选区后'
  return '替换选区'
})
const applyModeDescription = computed(() =>
  currentApplyMode.value === 'insert_after_selection' ? '生成内容追加到选区后' : '生成内容替换选区',
)
const statusTitle = computed(() => {
  if (loading.value) return '处理中'
  if (resultText.value.trim()) return '已就绪'
  if (props.actionTrigger) return '已同步'
  return '等待执行'
})
const statusDescription = computed(() => {
  if (loading.value) return '正在生成改写结果。'
  if (resultText.value.trim()) return `可${applyModeLabel.value}。`
  if (props.actionTrigger) return '已带入选区。'
  return '输入后执行。'
})
const effectiveWorkflowContext = computed(
  () => props.actionTrigger?.context ?? props.workflowContext ?? null,
)
const writingSkills = listWriterAIWritingSkills({ recommendedOnly: true })

watch(
  () => props.seedText,
  (value) => {
    if (!draftText.value.trim() && value.trim()) {
      draftText.value = value
    }
  },
  { immediate: true },
)

watch(
  () => props.actionTrigger?.id,
  async () => {
    const trigger = props.actionTrigger
    if (!trigger || !['continue', 'polish', 'expand', 'rewrite'].includes(trigger.action)) return

    draftText.value = trigger.text?.trim() || props.seedText || ''
    instructions.value = trigger.instructions || ''
    mode.value =
      trigger.action === 'expand' || trigger.action === 'continue'
        ? 'expand'
        : 'polish'

    if (draftText.value.trim()) {
      await handleRun()
    }
  },
)

async function handleRun() {
  if (!props.projectId || !draftText.value.trim()) return
  loading.value = true
  errorText.value = ''
  try {
    const mergedInstructions = mergeWriterAIInstructions([instructions.value.trim()], {
      projectId: props.projectId,
      currentDocument: {
        documentId: props.chapterId,
        documentTitle: props.chapterTitle,
        sourceText: props.seedText,
      },
      workflowContext: effectiveWorkflowContext.value,
      aiSummaryContextText: props.aiSummaryContextText,
      assets: props.aiAssetSummaries,
      sceneStage: props.aiSceneStageSummary,
      projectBrief: props.writerProjectBrief,
      userPreference: props.writerUserPreference,
    })
    const result = await rewriteWithWorkbench({
      projectId: props.projectId,
      chapterId: props.chapterId || undefined,
      originalText: draftText.value,
      mode: mode.value,
      instructions: mergedInstructions,
      skillId: skillId.value || undefined,
      toolHintIds: ['scene_stage', 'assets'],
    })
    resultText.value = result.rewrittenText
  } catch (error) {
    console.error('[RewriteWorkbenchTool] run failed:', error)
    errorText.value = resolveWriterAIErrorState(error).message
  } finally {
    loading.value = false
  }
}

function handleApply() {
  if (!resultText.value.trim()) return
  emit('apply', {
    action: mode.value === 'expand' ? 'expand' : 'rewrite',
    sourceText: draftText.value,
    generatedText: resultText.value,
    applyMode: currentApplyMode.value,
  })
}
</script>

<style scoped lang="scss">
@use './shared.scss';
</style>
