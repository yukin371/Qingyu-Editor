<template>
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
          visibleApplyFeedback.mode ? `模式 ${applyModeText(visibleApplyFeedback.mode)}` : '已更新正文'
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
            $emit('proposal-status-change', {
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
            $emit('proposal-status-change', {
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
        @click="$emit('promote-result')"
      >
        {{ resultPromoteActionText(visibleResultCandidate) }}
      </button>
    </section>

    <section v-if="showEditorDiffStatus" class="workflow-diff-card" data-testid="workflow-diff-card">
      <div class="workflow-card__meta">
        <span class="workflow-chip workflow-chip--accent">正文已挂起</span>
        <span class="workflow-chip">{{ diffModeText }}</span>
      </div>
      <p class="workflow-diff-card__hint">
        改动已同步到正文编辑器。请直接在正文区域接受或放弃，本侧栏不再重复展示前后对比。
      </p>
      <div
        v-if="hasPendingApplyPayload"
        class="workflow-diff-card__actions"
        data-testid="workflow-diff-actions"
      >
        <button
          type="button"
          class="workflow-diff-card__action workflow-diff-card__action--primary"
          data-testid="workflow-revise-action"
          @click="$emit('continue-revision')"
        >
          继续修改
        </button>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import type {
  WriterAIActionTrigger,
  WriterDraftProposal,
  WriterDraftProposalKind,
  WriterDraftProposalSource,
  WriterDraftProposalStatus,
  WriterResultCandidate,
} from '@/modules/writer/types/workflow'

defineProps<{
  hasWorkflowRail: boolean
  visibleApplyFeedback: {
    status: string
    title: string
    detail: string
    mode?: WriterAIActionTrigger['applyMode'] | null
  } | null
  visibleProposalLifecycleFeedback: {
    status: 'selected' | 'discarded'
    title: string
    detail: string
    source: string
  } | null
  primaryDraftProposal: WriterDraftProposal | null
  shouldCondensePrimaryProposal: boolean
  visibleResultCandidate: WriterResultCandidate | null
  shouldCondenseResultCandidate: boolean
  showEditorDiffStatus: boolean
  diffModeText: string
  hasPendingApplyPayload: boolean
}>()

defineEmits<{
  (
    e: 'proposal-status-change',
    payload: { proposalId: string; status: WriterDraftProposalStatus },
  ): void
  (e: 'promote-result'): void
  (e: 'continue-revision'): void
}>()

function applyModeText(mode: NonNullable<WriterAIActionTrigger['applyMode']>) {
  if (mode === 'replace_selection') return '替换选区'
  if (mode === 'insert_after_selection') return '插入后方'
  if (mode === 'replace_document') return '替换全文'
  return '追加段落'
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
  return candidate.action === 'summarize' ? '方向' : '正文'
}

function resultPromoteActionText(candidate: WriterResultCandidate) {
  return resultKindText(candidate) === '方向' ? '存为方向' : '存为正文'
}
</script>

<style scoped lang="scss">
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
    margin: 0;
    font-size: 12px;
    line-height: 1.55;
    color: var(--editor-text-secondary, #475569);
  }
}

.workflow-result-card--secondary {
  border-style: dashed;
}

.workflow-result-card--condensed {
  align-items: center;
}

.workflow-result-card--condensed .workflow-result-card__content {
  gap: 4px;
}

.proposal-card {
  border-color: rgba(14, 165, 233, 0.14);
}

.proposal-card--condensed {
  align-items: center;
}

.proposal-card--condensed .proposal-card__content {
  gap: 4px;
}

.proposal-card--condensed .proposal-card__actions {
  align-self: center;
}

.proposal-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.workflow-feedback-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(255, 255, 255, 0.9);

  strong,
  p {
    margin: 0;
  }
}

.apply-feedback--applied {
  border-color: rgba(34, 197, 94, 0.18);
}

.apply-feedback--error {
  border-color: rgba(239, 68, 68, 0.2);
}

.proposal-feedback--selected {
  border-color: rgba(14, 165, 233, 0.18);
}

.proposal-feedback--discarded {
  border-color: rgba(148, 163, 184, 0.18);
}

.apply-feedback__content {
  display: grid;
  gap: 4px;
}

.apply-feedback__mode {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--editor-text-secondary, #475569);
}

.workflow-card__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.workflow-chip {
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(241, 245, 249, 0.9);
  color: #475569;
  font-size: 11px;
  font-weight: 700;
}

.workflow-chip--accent {
  background: rgba(236, 254, 255, 0.95);
  color: #0891b2;
}

.workflow-chip--status {
  background: rgba(224, 242, 254, 0.95);
  color: #0369a1;
}

.proposal-card__meta {
  margin-bottom: 2px;
}

.proposal-card__action--ghost {
  background: rgba(241, 245, 249, 0.9);
  color: #475569;
}

.workflow-diff-card {
  display: grid;
  gap: 10px;
  padding: 11px 12px;
  border-radius: 14px;
  border: 1px solid rgba(14, 165, 233, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(240, 249, 255, 0.92)),
    rgba(255, 255, 255, 0.94);
  box-shadow:
    0 10px 24px rgba(14, 165, 233, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.82);
}

.workflow-diff-card__hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--editor-text-secondary, #475569);
}

.workflow-diff-card__actions {
  display: flex;
  justify-content: flex-end;
}

.workflow-diff-card__action {
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  border: none;
  background: rgba(224, 242, 254, 0.95);
  color: #0369a1;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.workflow-diff-card__action--primary {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.18), rgba(34, 211, 238, 0.1));
}

@media (max-width: 920px) {
  .workflow-rail {
    gap: 8px;
  }

  .workflow-result-card,
  .proposal-card,
  .workflow-diff-card {
    gap: 10px;
    padding: 10px;
  }

  .proposal-card__actions,
  .workflow-diff-card__actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .workflow-result-card__action {
    align-self: flex-start;
  }
}
</style>
