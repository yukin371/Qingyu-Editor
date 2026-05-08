<template>
  <section class="ai-workbench">
    <nav class="ai-workbench__tabs" aria-label="AI 工具标签">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="ai-workbench__tab"
        :class="{ active: activeTab === tab.id }"
        :title="tab.description"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </nav>

    <section
      v-if="hasWorkflowRail"
      class="workflow-rail"
      data-testid="workflow-state-rail"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        v-if="visibleApplyFeedback"
        class="apply-feedback workflow-feedback-strip"
        :class="`apply-feedback--${visibleApplyFeedback.status}`"
        data-testid="workflow-feedback-strip"
      >
        <div class="apply-feedback__content">
          <strong>{{ visibleApplyFeedback.title }}</strong>
          <p>{{ visibleApplyFeedback.detail }}</p>
        </div>
        <span class="apply-feedback__mode">
          {{
            visibleApplyFeedback.mode
              ? `模式 ${applyModeText(visibleApplyFeedback.mode)}`
              : '已更新正文'
          }}
        </span>
      </div>

      <div
        v-if="visibleProposalLifecycleFeedback"
        class="proposal-feedback workflow-feedback-strip"
        :class="`proposal-feedback--${visibleProposalLifecycleFeedback.status}`"
        data-testid="proposal-feedback-strip"
      >
        <div class="apply-feedback__content">
          <strong>{{ visibleProposalLifecycleFeedback.title }}</strong>
          <p>{{ visibleProposalLifecycleFeedback.detail }}</p>
        </div>
        <span class="apply-feedback__mode">
          {{ visibleProposalLifecycleFeedback.source }}
        </span>
      </div>

      <section
        v-if="primaryDraftProposal"
        class="proposal-card workflow-proposal-card"
        :class="{ 'proposal-card--condensed': shouldCondensePrimaryProposal }"
        data-testid="proposal-card"
      >
        <div class="proposal-card__content">
          <div class="workflow-card__meta proposal-card__meta" data-testid="proposal-card-meta">
            <span class="workflow-chip workflow-chip--status">
              {{ proposalStatusText(primaryDraftProposal.status) }}
            </span>
            <span class="workflow-chip">{{ proposalKindText(primaryDraftProposal.kind) }}</span>
            <span class="workflow-chip">{{ proposalSourceText(primaryDraftProposal.source) }}</span>
          </div>
          <div class="proposal-card__header">
            <div>
              <strong>{{ primaryDraftProposal.title }}</strong>
              <p v-if="!shouldCondensePrimaryProposal" data-testid="proposal-card-summary">
                {{ primaryDraftProposal.summary }}
              </p>
            </div>
          </div>
        </div>
        <div class="proposal-card__actions">
          <button
            v-if="primaryDraftProposal.status === 'draft'"
            type="button"
            class="proposal-card__action"
            :aria-label="`将 ${primaryDraftProposal.title} 定为当前${proposalKindText(primaryDraftProposal.kind)}`"
            @click="
              emit('proposalStatusChange', {
                proposalId: primaryDraftProposal.id,
                status: 'selected',
              })
            "
          >
            {{ proposalSelectActionText(primaryDraftProposal.kind) }}
          </button>
          <button
            v-if="primaryDraftProposal.status !== 'discarded'"
            type="button"
            class="proposal-card__action proposal-card__action--ghost"
            :aria-label="proposalDismissAriaLabelText(primaryDraftProposal)"
            @click="
              emit('proposalStatusChange', {
                proposalId: primaryDraftProposal.id,
                status: 'discarded',
              })
            "
          >
            {{ proposalDismissActionText(primaryDraftProposal.status) }}
          </button>
        </div>
      </section>

      <section
        v-if="visibleResultCandidate"
        class="workflow-result-card workflow-result-candidate"
        :class="{
          'workflow-result-card--secondary': !!primaryDraftProposal,
          'workflow-result-card--condensed': shouldCondenseResultCandidate,
        }"
        data-testid="workflow-result-card"
      >
        <div class="workflow-result-card__content">
          <div class="workflow-card__meta" data-testid="workflow-result-meta">
            <span class="workflow-chip workflow-chip--accent">候选</span>
            <span class="workflow-chip">{{ resultSourceText(visibleResultCandidate.source) }}</span>
            <span class="workflow-chip">{{ resultKindText(visibleResultCandidate) }}</span>
          </div>
          <div>
            <strong>{{ visibleResultCandidate.title }}</strong>
            <p v-if="!shouldCondenseResultCandidate" data-testid="workflow-result-summary">
              {{ visibleResultCandidate.summary }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="workflow-result-card__action workflow-result-action"
          data-testid="workflow-result-action"
          :aria-label="`将 ${visibleResultCandidate.title} 存为${resultKindText(visibleResultCandidate)}提案`"
          @click="handlePromoteToProposal"
        >
          {{ resultPromoteActionText(visibleResultCandidate) }}
        </button>
      </section>

      <section
        v-if="showEditorDiffStatus"
        class="workflow-diff-card"
        data-testid="workflow-diff-card"
      >
        <div class="workflow-card__meta">
          <span class="workflow-chip workflow-chip--accent">正文已挂起</span>
          <span class="workflow-chip">{{ diffModeText }}</span>
        </div>
        <p class="workflow-diff-card__hint">
          改动已同步到正文编辑器。请直接在正文区域接受或放弃，本侧栏不再重复展示前后对比。
        </p>
        <div
          v-if="pendingApplyPayload"
          class="workflow-diff-card__actions"
          data-testid="workflow-diff-actions"
        >
          <button
            type="button"
            class="workflow-diff-card__action workflow-diff-card__action--primary"
            data-testid="workflow-revise-action"
            @click="handleContinueRevision"
          >
            继续修改
          </button>
        </div>
      </section>
    </section>

    <div class="ai-workbench__panel">
      <RewriteWorkbenchTool
        v-if="activeTab === 'rewrite'"
        :project-id="projectId"
        :chapter-id="chapterId"
        :chapter-title="chapterTitle"
        :seed-text="sourceText"
        :action-trigger="actionTrigger"
        :workflow-context="workflowContext"
        @apply="handleApplyPayload"
      />

      <SummaryWorkbenchTool
        v-else-if="activeTab === 'summary'"
        :project-id="projectId"
        :chapter-id="chapterId"
        :chapter-title="chapterTitle"
        :seed-text="sourceText"
        :action-trigger="actionTrigger"
        :workflow-context="workflowContext"
        @result-candidate="handleResultCandidate"
        @apply-structure-plan="(payload) => emit('applyStructurePlan', payload)"
      />

      <ReviewWorkbenchTool
        v-else-if="activeTab === 'review'"
        :project-id="projectId"
        :chapter-id="chapterId"
        :chapter-title="chapterTitle"
        :seed-text="sourceText"
        :action-trigger="actionTrigger"
        @result-candidate="handleResultCandidate"
      />

      <AIPanel
        v-else
        :session-id="projectId"
        :source-text="sourceText"
        :action-trigger="actionTrigger"
        :workflow-context="workflowContext"
        :revision-seed="revisionSeed"
        @apply-generated-text="handleApplyPayload"
        @result-candidate="handleResultCandidate"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AIPanel from '@/modules/writer/components/editor/AIPanel.vue'
import RewriteWorkbenchTool from '@/modules/writer/components/workspace/ai-tools/RewriteWorkbenchTool.vue'
import SummaryWorkbenchTool from '@/modules/writer/components/workspace/ai-tools/SummaryWorkbenchTool.vue'
import ReviewWorkbenchTool from '@/modules/writer/components/workspace/ai-tools/ReviewWorkbenchTool.vue'
import type {
  WriterAIActionTrigger,
  WriterAIApplyFeedback,
  WriterAIApplyPayload,
  WriterDraftProposal,
  WriterDraftProposalKind,
  WriterDraftProposalSource,
  WriterDraftProposalStatus,
  WriterRevisionSeed,
  WriterResultCandidate,
  WriterStructurePlanPayload,
  WriterWorkbenchTab,
  WriterWorkflowContext,
} from '@/modules/writer/types/workflow'
import { resolveWriterWorkflowTab } from '@/modules/writer/types/workflow'

const props = defineProps<{
  projectId: string
  chapterId: string
  chapterTitle: string
  sourceText: string
  actionTrigger: WriterAIActionTrigger | null
  aiApplyFeedback: WriterAIApplyFeedback | null
  workflowContext: WriterWorkflowContext
  draftProposals: WriterDraftProposal[]
}>()

const emit = defineEmits<{
  (e: 'applyGeneratedText', payload: WriterAIApplyPayload): void
  (e: 'proposalDraft', payload: WriterResultCandidate): void
  (
    e: 'proposalStatusChange',
    payload: { proposalId: string; status: WriterDraftProposalStatus },
  ): void
  (e: 'applyStructurePlan', payload: WriterStructurePlanPayload): void
}>()

const activeTab = ref<WriterWorkbenchTab>('chat')
const latestResultCandidate = ref<WriterResultCandidate | null>(null)
const pendingApplyPayload = ref<WriterAIApplyPayload | null>(null)
const revisionSeed = ref<WriterRevisionSeed | null>(null)

const tabs: Array<{ id: WriterWorkbenchTab; label: string; description: string }> = [
  { id: 'rewrite', label: '改写', description: '续写 / 润色 / 扩写' },
  { id: 'summary', label: '总结', description: '摘要 / 章节提炼' },
  { id: 'review', label: '审校', description: '校对 / 风险检查' },
  { id: 'chat', label: '对话协作', description: '开放式协作' },
]

const actionDrivenTab = computed<WriterWorkbenchTab | null>(() =>
  resolveWriterWorkflowTab(props.actionTrigger?.action),
)

const primaryDraftProposal = computed<WriterDraftProposal | null>(() => {
  const selectedProposal = props.draftProposals.find((proposal) => proposal.status === 'selected')
  if (selectedProposal) {
    return selectedProposal
  }

  return props.draftProposals.find((proposal) => proposal.status === 'draft') || null
})

const shouldCondensePrimaryProposal = computed(
  () => !!primaryDraftProposal.value && !!visibleResultCandidate.value,
)

const shouldCondenseResultCandidate = computed(
  () => !!visibleResultCandidate.value && !!primaryDraftProposal.value,
)

const visibleResultCandidate = computed(() =>
  pendingApplyPayload.value ? null : latestResultCandidate.value,
)

const shouldShowApplyFeedback = computed(
  () =>
    !!props.aiApplyFeedback &&
    !(primaryDraftProposal.value?.status === 'selected' && !!visibleResultCandidate.value),
)

const visibleApplyFeedback = computed(() =>
  shouldShowApplyFeedback.value ? props.aiApplyFeedback : null,
)

const hasWorkflowRail = computed(
  () =>
    !!shouldShowApplyFeedback.value ||
    !!shouldShowProposalLifecycleFeedback.value ||
    !!visibleResultCandidate.value ||
    !!primaryDraftProposal.value ||
    !!pendingApplyPayload.value,
)

const proposalLifecycleFeedback = computed<{
  status: 'selected' | 'discarded'
  title: string
  detail: string
  source: string
} | null>(() => {
  if (props.draftProposals.length === 0) {
    return null
  }

  const latestProposal = [...props.draftProposals].sort(
    (left, right) => right.updatedAt - left.updatedAt,
  )[0]
  if (!latestProposal) {
    return null
  }

  const latestStatus = latestProposal.status
  if (latestStatus !== 'selected' && latestStatus !== 'discarded') {
    return null
  }

  return {
    status: latestStatus,
    title:
      latestStatus === 'selected'
        ? `${proposalKindText(latestProposal.kind)}提案已保留`
        : `${proposalKindText(latestProposal.kind)}提案已移出`,
    detail:
      latestStatus === 'selected'
        ? `当前保留：${latestProposal.title}`
        : `已从 rail 中移除：${latestProposal.title}`,
    source: proposalSourceText(latestProposal.source),
  }
})

const shouldShowProposalLifecycleFeedback = computed(() => {
  if (!proposalLifecycleFeedback.value) {
    return false
  }

  if (props.aiApplyFeedback || visibleResultCandidate.value) {
    return false
  }
  return proposalLifecycleFeedback.value.status === 'discarded'
})

const visibleProposalLifecycleFeedback = computed(() =>
  shouldShowProposalLifecycleFeedback.value ? proposalLifecycleFeedback.value : null,
)

const showEditorDiffStatus = computed(() => !!pendingApplyPayload.value)

const diffModeText = computed(() => {
  const mode = pendingApplyPayload.value?.applyMode || props.actionTrigger?.applyMode
  if (mode === 'replace_document') return '整章改写'
  if (mode === 'insert_after_selection') return '插入选区后'
  if (mode === 'replace_selection') return '替换选区'
  if (mode === 'append_paragraph') return '追加段落'
  return '正文改写'
})

watch(
  [() => props.projectId, () => props.chapterId, () => props.actionTrigger?.id],
  (
    [projectId, chapterId, actionTriggerId],
    [prevProjectId, prevChapterId, prevActionTriggerId],
  ) => {
    if (
      projectId !== prevProjectId ||
      chapterId !== prevChapterId ||
      actionTriggerId !== prevActionTriggerId
    ) {
      latestResultCandidate.value = null
      pendingApplyPayload.value = null
      revisionSeed.value = null
    }

    if (actionTriggerId !== prevActionTriggerId && actionDrivenTab.value) {
      activeTab.value = actionDrivenTab.value
    }
  },
)

watch(
  () => props.aiApplyFeedback?.updatedAt,
  (updatedAt, previousUpdatedAt) => {
    if (!updatedAt || updatedAt === previousUpdatedAt) {
      return
    }

    pendingApplyPayload.value = null
    latestResultCandidate.value = null
    revisionSeed.value = null
  },
)

function applyModeText(mode: NonNullable<WriterAIActionTrigger['applyMode']>) {
  if (mode === 'replace_selection') return '替换选区'
  if (mode === 'insert_after_selection') return '插入后方'
  if (mode === 'replace_document') return '替换全文'
  return '追加段落'
}

function handleResultCandidate(payload: WriterResultCandidate) {
  latestResultCandidate.value = payload
}

function buildCandidateFromPayload(payload: WriterAIApplyPayload): WriterResultCandidate {
  const resolvedTab = resolveWriterWorkflowTab(payload.action)
  const title =
    payload.applyMode === 'replace_document'
      ? 'AI 整章改写结果'
      : payload.applyMode === 'replace_selection'
        ? 'AI 选区替换结果'
        : payload.applyMode === 'insert_after_selection'
          ? 'AI 续写结果'
          : 'AI 正文结果'

  return {
    source:
      resolvedTab === 'summary' || resolvedTab === 'review' || resolvedTab === 'rewrite'
        ? resolvedTab
        : 'chat',
    action: payload.action,
    title,
    summary: payload.generatedText.slice(0, 72) || '已生成新的正文结果。',
    generatedText: payload.generatedText,
    sourceText: payload.sourceText,
  }
}

function handleApplyPayload(payload: WriterAIApplyPayload) {
  pendingApplyPayload.value = payload
  revisionSeed.value = null
  emit('applyGeneratedText', payload)

  const currentCandidate = latestResultCandidate.value
  if (
    !currentCandidate ||
    currentCandidate.generatedText.trim() !== payload.generatedText.trim() ||
    currentCandidate.sourceText.trim() !== payload.sourceText.trim()
  ) {
    latestResultCandidate.value = buildCandidateFromPayload(payload)
  }
}

function handleContinueRevision() {
  const revisionText = pendingApplyPayload.value?.generatedText?.trim() || ''
  if (!pendingApplyPayload.value || !revisionText) {
    return
  }

  revisionSeed.value = {
    id: Date.now(),
    text: revisionText,
    instructions: `基于当前候选继续修改，目标模式：${diffModeText.value}。`,
    applyMode: pendingApplyPayload.value.applyMode,
  }
  activeTab.value = 'chat'
}

function handlePromoteToProposal() {
  if (!visibleResultCandidate.value) {
    return
  }

  emit('proposalDraft', visibleResultCandidate.value)
  latestResultCandidate.value = null
}

function proposalStatusText(status: WriterDraftProposalStatus) {
  if (status === 'selected') return '保留'
  if (status === 'discarded') return '丢弃'
  return '草稿'
}

function proposalSelectActionText(kind: WriterDraftProposalKind) {
  return kind === 'chapter-direction' ? '定为方向' : '定为正文'
}

function proposalDismissActionText(status: WriterDraftProposalStatus) {
  return status === 'selected' ? '移出' : '丢弃'
}

function proposalDismissAriaLabelText(proposal: WriterDraftProposal) {
  const action = proposal.status === 'selected' ? '移出提案' : '丢弃提案'
  return `${action} ${proposal.title}`
}

function proposalKindText(kind: WriterDraftProposalKind) {
  return kind === 'chapter-direction' ? '方向' : '正文'
}

function proposalSourceText(source: WriterDraftProposalSource) {
  if (source === 'summary-workbench') return '总结'
  if (source === 'review-workbench') return '审校'
  if (source === 'rewrite-workbench') return '改写'
  return '对话'
}

function resultSourceText(source: WriterResultCandidate['source']) {
  if (source === 'summary') return '总结'
  if (source === 'review') return '审校'
  if (source === 'rewrite') return '改写'
  return '对话'
}

function resultKindText(candidate: WriterResultCandidate) {
  const tab = resolveWriterWorkflowTab(candidate.action)
  if (tab === 'summary') return '方向'
  return '正文'
}

function resultPromoteActionText(candidate: WriterResultCandidate) {
  return resultKindText(candidate) === '方向' ? '存为方向' : '存为正文'
}
</script>

<style scoped lang="scss">
.ai-workbench {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background:
    radial-gradient(circle at top, rgba(34, 211, 238, 0.08), transparent 28%),
    linear-gradient(180deg, rgba(253, 254, 255, 0.98), rgba(247, 250, 252, 0.95));
  color: #1f2430;
}

.ai-workbench__tabs {
  display: flex;
  gap: 6px;
  padding: 12px 14px 10px;
  border-bottom: 1px solid var(--editor-border, rgba(0, 0, 0, 0.06));
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(248, 250, 252, 0.72));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78);
}

.ai-workbench__tab {
  flex: 1;
  text-align: center;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(255, 255, 255, 0.56);
  border-radius: 999px;
  padding: 7px 10px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  color: var(--editor-text-muted, #64748b);
  transition: all 0.18s ease;
  white-space: nowrap;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.ai-workbench__tab:hover {
  background: rgba(255, 255, 255, 0.94);
  color: var(--editor-text-primary, #0f172a);
  transform: translateY(-1px);
}

.ai-workbench__tab.active {
  background:
    linear-gradient(135deg, rgba(14, 165, 233, 0.16), rgba(34, 211, 238, 0.08)),
    rgba(255, 255, 255, 0.96);
  border-color: rgba(14, 165, 233, 0.22);
  color: #0369a1;
  font-weight: 800;
  box-shadow: 0 10px 20px rgba(14, 165, 233, 0.12);
}

.workflow-rail {
  padding: 12px;
  border-bottom: 1px solid var(--editor-border, rgba(0, 0, 0, 0.06));
  background: linear-gradient(180deg, rgba(246, 250, 255, 0.92), rgba(255, 255, 255, 0.82));
  display: grid;
  gap: 10px;
}

.workflow-result-card__action,
.proposal-card__action {
  border: none;
  border-radius: 999px;
  padding: 5px 10px;
  background: var(--editor-accent-soft, #ecfeff);
  color: var(--editor-accent, #0891b2);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.workflow-result-card__content,
.proposal-card__content {
  min-width: 0;
  display: grid;
  gap: 6px;
}

.workflow-result-card,
.proposal-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 12px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.92));
  box-shadow:
    0 10px 24px rgba(15, 23, 42, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);

  strong {
    display: block;
    font-size: 12px;
    font-weight: 800;
    color: var(--editor-text-primary, #0f172a);
  }
  p {
    margin: 4px 0 0;
    font-size: 11px;
    line-height: 1.5;
    color: var(--editor-text-muted, #64748b);
  }
}

.workflow-result-card--secondary {
  background: rgba(250, 252, 255, 0.7);
}

.workflow-result-card--condensed {
  padding-block: 8px;
}

.workflow-result-card--condensed .workflow-result-card__content {
  gap: 4px;
}

.proposal-card {
  display: block;
}

.proposal-card--condensed {
  padding-block: 8px;
}

.proposal-card--condensed .proposal-card__content {
  gap: 4px;
}

.proposal-card--condensed .proposal-card__actions {
  margin-top: 6px;
}

.workflow-card__meta,
.proposal-card__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.workflow-card__meta {
  font-size: 10px;
  color: var(--editor-text-muted, #64748b);
}

.workflow-chip {
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.12);
  color: var(--editor-text-muted, #64748b);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.workflow-chip--status,
.workflow-chip--accent {
  background: var(--editor-accent-soft, #ecfeff);
  color: var(--editor-accent, #0891b2);
}

.proposal-card__meta {
  margin: 0;
}

.proposal-card__actions {
  margin-top: 8px;
  justify-content: flex-start;
}

.proposal-card__action--ghost {
  background: rgba(15, 23, 42, 0.06);
  color: var(--editor-text-muted, #64748b);
}

.workflow-diff-card {
  padding: 12px;
  border: 1px solid rgba(14, 165, 233, 0.14);
  border-radius: 16px;
  background:
    radial-gradient(circle at top right, rgba(34, 211, 238, 0.12), transparent 26%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(243, 248, 252, 0.95));
  display: grid;
  gap: 10px;
  box-shadow:
    0 16px 34px rgba(8, 47, 73, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
}

.workflow-diff-card__hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--editor-text-secondary, #334155);
  padding: 8px 10px;
  border-radius: 12px;
  background: rgba(240, 249, 255, 0.9);
  border: 1px solid rgba(125, 211, 252, 0.28);
}

.workflow-diff-card__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.workflow-diff-card__actions {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

.workflow-diff-card__column {
  min-width: 0;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(248, 250, 252, 0.95);
  padding: 10px;
}

.workflow-diff-card__column--after {
  background: linear-gradient(180deg, rgba(240, 253, 244, 0.98), rgba(236, 253, 245, 0.88));
  border-color: rgba(34, 197, 94, 0.22);
  box-shadow: inset 0 0 0 1px rgba(187, 247, 208, 0.45);
}

.workflow-diff-card__label {
  display: block;
  margin-bottom: 6px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--editor-text-muted, #64748b);
}

.workflow-diff-card__text {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--editor-text-primary, #0f172a);
  white-space: pre-wrap;
}

.workflow-diff-card__action {
  border: 1px solid rgba(14, 165, 233, 0.16);
  background: rgba(255, 255, 255, 0.96);
  color: var(--editor-text-primary, #0f172a);
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(14, 165, 233, 0.08);
}

.workflow-diff-card__action--primary {
  background: linear-gradient(135deg, #0284c7, #06b6d4);
  color: #f8fafc;
  border-color: rgba(2, 132, 199, 0.36);
}

.ai-workbench__panel {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 14px 16px 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.52), rgba(248, 250, 252, 0.12));
}

.apply-feedback {
  min-height: 34px;
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid rgba(117, 93, 67, 0.2);
  background: rgba(255, 251, 245, 0.94);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.apply-feedback__content {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.apply-feedback strong {
  display: inline;
  color: #241f19;
  font-size: 11px;
  line-height: 1.2;
}

.apply-feedback p {
  margin: 0;
  color: #6e6358;
  font-size: 11px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.apply-feedback--success {
  border-color: rgba(53, 132, 103, 0.2);
  background: linear-gradient(145deg, rgba(236, 250, 244, 0.96), rgba(249, 255, 252, 0.94));
}

.apply-feedback--fallback {
  border-color: rgba(143, 63, 47, 0.2);
  background: linear-gradient(145deg, rgba(255, 241, 232, 0.96), rgba(255, 250, 245, 0.94));
}

.proposal-feedback--selected {
  border-color: rgba(22, 163, 74, 0.18);
  background: linear-gradient(145deg, rgba(240, 253, 244, 0.96), rgba(248, 255, 250, 0.94));
}

.proposal-feedback--discarded {
  border-color: rgba(100, 116, 139, 0.18);
  background: linear-gradient(145deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 0.92));
}

.apply-feedback__mode {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(117, 93, 67, 0.2);
  background: rgba(255, 255, 255, 0.72);
  color: #5f4e40;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
}

@media (max-width: 1280px) {
  .ai-workbench__tabs {
    gap: 3px;
  }

  .ai-workbench__tab {
    font-size: 11px;
    padding: 4px 6px;
  }
}

@media (max-width: 768px) {
  .ai-workbench__tabs {
    flex-wrap: wrap;
    gap: 6px;
  }

  .ai-workbench__tab {
    flex: 1 1 calc(50% - 6px);
  }

  .workflow-rail {
    gap: 6px;
  }

  .apply-feedback,
  .workflow-result-card,
  .proposal-card,
  .workflow-diff-card {
    border-radius: 12px;
    flex-direction: column;
    align-items: flex-start;
  }

  .workflow-diff-card__grid {
    grid-template-columns: 1fr;
  }

  .workflow-diff-card__actions {
    flex-direction: column;
  }

  .apply-feedback__content {
    display: block;
  }

  .apply-feedback__mode,
  .workflow-result-card__action {
    align-self: flex-start;
  }
}
</style>
