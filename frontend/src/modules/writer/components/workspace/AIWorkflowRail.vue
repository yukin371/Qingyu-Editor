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
        {{ visibleApplyFeedback.mode ? applyModeText(visibleApplyFeedback.mode) : '已更新正文' }}
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
        <span class="workflow-chip workflow-chip--accent">正文待确认</span>
        <span class="workflow-chip">{{ diffModeText }}</span>
      </div>
      <p class="workflow-diff-card__hint">
        已同步到正文，直接接受或放弃。
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
  padding: 7px 9px;
  border-bottom: 1px solid var(--editor-border, rgba(0, 0, 0, 0.06));
  background: var(--editor-layer-soft, #f8fafc);
  display: grid;
  gap: 5px;
}

.workflow-result-card__action,
.proposal-card__action {
  border: none;
  border-radius: 999px;
  min-height: 28px;
  padding: 0 10px;
  background: color-mix(in srgb, var(--editor-accent-soft, #ecfeff) 78%, transparent);
  color: var(--editor-accent, #0891b2);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.workflow-result-card__content,
.proposal-card__content {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.workflow-result-card,
.proposal-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 9px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #cbd5e1) 84%, transparent);
  border-radius: 8px;
  background: var(--editor-layer-panel, #fff);

  strong {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: var(--editor-text-primary, #0f172a);
  }

  p {
    margin: 0;
    font-size: 11px;
    line-height: 1.45;
    color: var(--editor-text-secondary, #475569);
  }
}

.workflow-result-card--secondary {
  background: color-mix(in srgb, var(--editor-layer-soft, #f8fafc) 82%, transparent);
}

.workflow-result-card--condensed .workflow-result-card__content,
.proposal-card--condensed .proposal-card__content {
  gap: 4px;
}

.proposal-card {
  border-color: color-mix(in srgb, var(--editor-accent, #0891b2) 18%, transparent);
}

.proposal-card__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 6px;
}

.workflow-feedback-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 9px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #94a3b8) 66%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 94%, transparent);

  strong,
  p {
    margin: 0;
  }
}

.apply-feedback--applied {
  border-color: color-mix(in srgb, var(--color-success-500, #22c55e) 26%, transparent);
}

.apply-feedback--error {
  border-color: color-mix(in srgb, var(--color-danger-500, #ef4444) 28%, transparent);
}

.proposal-feedback--selected {
  border-color: color-mix(in srgb, var(--editor-accent, #0891b2) 28%, transparent);
}

.proposal-feedback--discarded {
  border-color: color-mix(in srgb, var(--editor-border, #94a3b8) 72%, transparent);
}

.apply-feedback__content {
  min-width: 0;
  display: grid;
  gap: 2px;

  p {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.apply-feedback__mode {
  flex-shrink: 0;
  font-size: 10px;
  color: var(--editor-text-secondary, #475569);
}

.workflow-card__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.workflow-chip {
  display: inline-flex;
  align-items: center;
  min-height: 17px;
  padding: 0 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--editor-layer-strong, #f1f5f9) 92%, transparent);
  color: var(--editor-text-secondary, #475569);
  font-size: 10px;
  font-weight: 700;
}

.workflow-chip--accent {
  background: color-mix(in srgb, var(--editor-accent-soft, #ecfeff) 88%, transparent);
  color: var(--editor-accent, #0891b2);
}

.workflow-chip--status {
  background: color-mix(in srgb, var(--editor-accent-soft, #e0f2fe) 78%, var(--editor-bg-base, #fff) 22%);
  color: var(--editor-accent, #0369a1);
}

.proposal-card__meta {
  margin-bottom: 0;
}

.proposal-card__action--ghost {
  background: color-mix(in srgb, var(--editor-layer-strong, #f1f5f9) 90%, transparent);
  color: var(--editor-text-secondary, #475569);
}

.workflow-diff-card {
  display: grid;
  gap: 6px;
  padding: 7px 9px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--editor-accent, #0891b2) 26%, transparent);
  background: color-mix(in srgb, var(--editor-accent-soft, #f0f9ff) 48%, var(--editor-layer-panel, #ffffff) 52%);
}

.workflow-diff-card__hint {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  color: var(--editor-text-secondary, #475569);
}

.workflow-diff-card__actions {
  display: flex;
  justify-content: flex-start;
}

.workflow-diff-card__action {
  min-height: 28px;
  padding: 0 11px;
  border-radius: 999px;
  border: none;
  background: color-mix(in srgb, var(--editor-accent-soft, #e0f2fe) 84%, transparent);
  color: var(--editor-accent, #0369a1);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.workflow-diff-card__action--primary {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--editor-accent, #0891b2) 22%, transparent),
    color-mix(in srgb, var(--editor-accent-soft, #22d3ee) 54%, transparent)
  );
}

@media (max-width: 920px) {
  .workflow-result-card,
  .proposal-card,
  .workflow-diff-card {
    align-items: flex-start;
    gap: 8px;
    padding: 8px 9px;
  }

  .workflow-feedback-strip,
  .proposal-card__actions,
  .workflow-diff-card__actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .workflow-feedback-strip {
    border-radius: 12px;
  }

  .workflow-result-card__action {
    align-self: flex-start;
  }
}
</style>
