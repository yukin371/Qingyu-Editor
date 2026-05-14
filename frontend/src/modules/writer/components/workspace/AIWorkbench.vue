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

    <AIWorkflowRail
      :has-workflow-rail="hasWorkflowRail"
      :visible-apply-feedback="visibleApplyFeedback"
      :visible-proposal-lifecycle-feedback="visibleProposalLifecycleFeedback"
      :primary-draft-proposal="primaryDraftProposal"
      :should-condense-primary-proposal="shouldCondensePrimaryProposal"
      :visible-result-candidate="visibleResultCandidate"
      :should-condense-result-candidate="shouldCondenseResultCandidate"
      :show-editor-diff-status="showEditorDiffStatus"
      :diff-mode-text="diffModeText"
      :has-pending-apply-payload="!!pendingApplyPayload"
      @proposal-status-change="emit('proposalStatusChange', $event)"
      @promote-result="handlePromoteToProposal"
      @continue-revision="handleContinueRevision"
    />

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
import { ref, toRef } from 'vue'
import AIPanel from '@/modules/writer/components/editor/AIPanel.vue'
import AIWorkflowRail from '@/modules/writer/components/workspace/AIWorkflowRail.vue'
import RewriteWorkbenchTool from '@/modules/writer/components/workspace/ai-tools/RewriteWorkbenchTool.vue'
import SummaryWorkbenchTool from '@/modules/writer/components/workspace/ai-tools/SummaryWorkbenchTool.vue'
import ReviewWorkbenchTool from '@/modules/writer/components/workspace/ai-tools/ReviewWorkbenchTool.vue'
import { useAIWorkbenchRail } from '@/modules/writer/composables/useAIWorkbenchRail'
import type {
  WriterAIActionTrigger,
  WriterAIApplyFeedback,
  WriterAIApplyPayload,
  WriterDraftProposal,
  WriterDraftProposalStatus,
  WriterResultCandidate,
  WriterStructurePlanPayload,
  WriterWorkbenchTab,
  WriterWorkflowContext,
} from '@/modules/writer/types/workflow'

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

const tabs: Array<{ id: WriterWorkbenchTab; label: string; description: string }> = [
  { id: 'rewrite', label: '改写', description: '续写 / 润色 / 扩写' },
  { id: 'summary', label: '总结', description: '摘要 / 章节提炼' },
  { id: 'review', label: '审校', description: '校对 / 风险检查' },
  { id: 'chat', label: '对话协作', description: '开放式协作' },
]

const {
  revisionSeed,
  pendingApplyPayload,
  primaryDraftProposal,
  shouldCondensePrimaryProposal,
  visibleResultCandidate,
  shouldCondenseResultCandidate,
  visibleApplyFeedback,
  visibleProposalLifecycleFeedback,
  hasWorkflowRail,
  showEditorDiffStatus,
  diffModeText,
  handleResultCandidate,
  handleApplyPayload,
  handleContinueRevision,
  handlePromoteToProposal,
} = useAIWorkbenchRail({
  projectId: toRef(props, 'projectId'),
  chapterId: toRef(props, 'chapterId'),
  actionTrigger: toRef(props, 'actionTrigger'),
  aiApplyFeedback: toRef(props, 'aiApplyFeedback'),
  draftProposals: toRef(props, 'draftProposals'),
  activeTab,
  onApplyGeneratedText: (payload) => emit('applyGeneratedText', payload),
  onProposalDraft: (payload) => emit('proposalDraft', payload),
})

</script>

<style scoped lang="scss">
.ai-workbench {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background:
    radial-gradient(circle at top, color-mix(in srgb, var(--editor-accent, #22d3ee) 10%, transparent), transparent 28%),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--editor-layer-panel, var(--editor-bg-base, #fff)) 98%, transparent),
      color-mix(in srgb, var(--editor-layer-soft, var(--editor-bg-surface, #f8fafc)) 95%, transparent)
    );
  color: var(--editor-text-primary, #1f2430);
}

.ai-workbench__tabs {
  display: flex;
  gap: 6px;
  padding: 12px 14px 10px;
  border-bottom: 1px solid var(--editor-border, rgba(0, 0, 0, 0.06));
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--editor-layer-panel, var(--editor-bg-base, #fff)) 90%, transparent),
    color-mix(in srgb, var(--editor-layer-soft, var(--editor-bg-surface, #f8fafc)) 76%, transparent)
  );
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--editor-bg-elevated, #fff) 64%, transparent);
}

.ai-workbench__tab {
  flex: 1;
  text-align: center;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: color-mix(in srgb, var(--editor-layer-glass, var(--editor-bg-base, #fff)) 82%, transparent);
  border-radius: 999px;
  padding: 7px 10px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  color: var(--editor-text-muted, #64748b);
  transition: all 0.18s ease;
  white-space: nowrap;
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--editor-bg-elevated, #fff) 52%, transparent);
}

.ai-workbench__tab:hover {
  background: color-mix(in srgb, var(--editor-layer-panel, var(--editor-bg-base, #fff)) 96%, transparent);
  color: var(--editor-text-primary, #0f172a);
  transform: translateY(-1px);
}

.ai-workbench__tab.active {
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--editor-accent, #0ea5e9) 16%, transparent),
      color-mix(in srgb, var(--editor-accent, #22d3ee) 8%, transparent)
    ),
    color-mix(in srgb, var(--editor-layer-panel, var(--editor-bg-base, #fff)) 96%, transparent);
  border-color: color-mix(in srgb, var(--editor-accent, #0ea5e9) 22%, transparent);
  color: var(--editor-accent, #0369a1);
  font-weight: 800;
  box-shadow: var(--editor-shadow-md, 0 10px 20px rgba(14, 165, 233, 0.12));
}

.workflow-rail {
  padding: 12px;
  border-bottom: 1px solid var(--editor-border, rgba(0, 0, 0, 0.06));
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--editor-layer-soft, var(--editor-bg-surface, #f8fafc)) 92%, transparent),
    color-mix(in srgb, var(--editor-layer-panel, var(--editor-bg-base, #fff)) 84%, transparent)
  );
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
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(148, 163, 184, 0.14)) 42%, transparent);
  border-radius: 14px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--editor-layer-panel, var(--editor-bg-base, #fff)) 98%, transparent),
    color-mix(in srgb, var(--editor-layer-soft, var(--editor-bg-surface, #f8fafc)) 92%, transparent)
  );
  box-shadow:
    var(--editor-shadow-md, 0 10px 24px rgba(15, 23, 42, 0.05)),
    inset 0 1px 0 color-mix(in srgb, var(--editor-bg-elevated, #fff) 62%, transparent);

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
  background: color-mix(in srgb, var(--editor-layer-soft, rgba(250, 252, 255, 0.7)) 88%, transparent);
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
  background: color-mix(in srgb, var(--editor-border, rgba(148, 163, 184, 0.12)) 22%, transparent);
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
  border: 1px solid color-mix(in srgb, var(--editor-accent, rgba(14, 165, 233, 0.14)) 18%, transparent);
  border-radius: 16px;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--editor-accent, #22d3ee) 12%, transparent), transparent 26%),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--editor-layer-panel, var(--editor-bg-base, #fff)) 99%, transparent),
      color-mix(in srgb, var(--editor-layer-soft, var(--editor-bg-surface, #f8fafc)) 95%, transparent)
    );
  display: grid;
  gap: 10px;
  box-shadow:
    var(--editor-shadow-lg, 0 16px 34px rgba(8, 47, 73, 0.08)),
    inset 0 1px 0 color-mix(in srgb, var(--editor-bg-elevated, #fff) 68%, transparent);
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
  background: color-mix(in srgb, var(--editor-layer-soft, rgba(248, 250, 252, 0.95)) 94%, transparent);
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
  background: color-mix(in srgb, var(--editor-layer-panel, rgba(255, 255, 255, 0.96)) 96%, transparent);
  color: var(--editor-text-primary, #0f172a);
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--editor-shadow-sm, 0 8px 18px rgba(14, 165, 233, 0.08));
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
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--editor-layer-glass, rgba(255, 255, 255, 0.52)) 78%, transparent),
    color-mix(in srgb, var(--editor-layer-soft, rgba(248, 250, 252, 0.12)) 38%, transparent)
  );
}

.apply-feedback {
  min-height: 34px;
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid rgba(117, 93, 67, 0.2);
  background: color-mix(in srgb, var(--editor-layer-panel, rgba(255, 251, 245, 0.94)) 94%, transparent);
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
  color: var(--editor-text-primary, #241f19);
  font-size: 11px;
  line-height: 1.2;
}

.apply-feedback p {
  margin: 0;
  color: var(--editor-text-muted, #6e6358);
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
  background: color-mix(in srgb, var(--editor-layer-glass, rgba(255, 255, 255, 0.72)) 90%, transparent);
  color: var(--editor-text-secondary, #5f4e40);
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
