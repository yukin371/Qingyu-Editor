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
        :chapters="chapters"
        :seed-text="sourceText"
        :action-trigger="actionTrigger"
        :workflow-context="workflowContext"
        :ai-summary-context-text="aiSummaryContextText"
        :ai-asset-summaries="aiAssetSummaries"
        :ai-scene-stage-summary="aiSceneStageSummary"
        :writer-project-brief="writerProjectBrief"
        :writer-user-preference="writerUserPreference"
        @apply="handleApplyPayload"
      />

      <SummaryWorkbenchTool
        v-else-if="activeTab === 'summary'"
        :project-id="projectId"
        :chapter-id="chapterId"
        :chapter-title="chapterTitle"
        :chapters="chapters"
        :seed-text="sourceText"
        :action-trigger="actionTrigger"
        :workflow-context="workflowContext"
        :ai-summary-context-text="aiSummaryContextText"
        :ai-asset-summaries="aiAssetSummaries"
        :ai-scene-stage-summary="aiSceneStageSummary"
        :writer-project-brief="writerProjectBrief"
        :writer-user-preference="writerUserPreference"
        @result-candidate="handleResultCandidate"
        @apply-structure-plan="(payload) => emit('applyStructurePlan', payload)"
      />

      <ReviewWorkbenchTool
        v-else-if="activeTab === 'review'"
        :project-id="projectId"
        :chapter-id="chapterId"
        :chapter-title="chapterTitle"
        :chapters="chapters"
        :seed-text="sourceText"
        :action-trigger="actionTrigger"
        :ai-summary-context-text="aiSummaryContextText"
        :ai-asset-summaries="aiAssetSummaries"
        :ai-scene-stage-summary="aiSceneStageSummary"
        :writer-project-brief="writerProjectBrief"
        :writer-user-preference="writerUserPreference"
        @result-candidate="handleResultCandidate"
      />

      <AIPanel
        v-else
        :session-id="projectId"
        :source-text="sourceText"
        :action-trigger="actionTrigger"
        :workflow-context="workflowContext"
        :chapters="chapters"
        :ai-summary-context-text="aiSummaryContextText"
        :ai-asset-summaries="aiAssetSummaries"
        :ai-scene-stage-summary="aiSceneStageSummary"
        :writer-project-brief="writerProjectBrief"
        :writer-user-preference="writerUserPreference"
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
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type {
  WriterAIAssetSummary,
  WriterAISceneStageSummary,
} from '@/modules/writer/utils/writerAIContext'
import type { WriterProjectBrief } from '@/modules/writer/services/writerProjectBrief.service'
import type { WriterUserPreferenceMemory } from '@/modules/writer/services/writerUserPreferenceMemory.service'
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

const props = withDefaults(defineProps<{
  projectId: string
  chapterId: string
  chapterTitle: string
  chapters?: SidebarChapterSummary[]
  sourceText: string
  actionTrigger: WriterAIActionTrigger | null
  aiApplyFeedback: WriterAIApplyFeedback | null
  workflowContext: WriterWorkflowContext
  aiSummaryContextText?: string
  aiAssetSummaries?: WriterAIAssetSummary[]
  aiSceneStageSummary?: WriterAISceneStageSummary
  writerProjectBrief?: WriterProjectBrief | null
  writerUserPreference?: WriterUserPreferenceMemory | null
  draftProposals: WriterDraftProposal[]
}>(), {
  chapters: () => [],
  aiAssetSummaries: () => [],
})

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
  { id: 'rewrite', label: '写作', description: '续写 / 润色 / 扩写' },
  { id: 'summary', label: '整理', description: '摘要 / 结构草案' },
  { id: 'review', label: '回审', description: '校对 / 风险检查' },
  { id: 'chat', label: '问答', description: '开放式协作' },
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
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
  color: var(--editor-text-primary, #1f2430);
}

.ai-workbench__tabs {
  display: flex;
  gap: 3px;
  padding: 8px 10px 6px;
  border-bottom: 1px solid var(--editor-border, rgba(0, 0, 0, 0.06));
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
}

.ai-workbench__tab {
  flex: 1;
  text-align: center;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 9px;
  padding: 6px 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: var(--editor-text-muted, #64748b);
  transition: all 0.18s ease;
  white-space: nowrap;
}

.ai-workbench__tab:hover {
  background: var(--editor-layer-soft, var(--editor-bg-surface, #f8fafc));
  color: var(--editor-text-primary, #0f172a);
}

.ai-workbench__tab.active {
  background: color-mix(in srgb, var(--editor-accent, #0ea5e9) 10%, var(--editor-layer-panel, #fff));
  border-color: color-mix(in srgb, var(--editor-accent, #0ea5e9) 16%, transparent);
  color: var(--editor-accent, #0369a1);
  font-weight: 700;
}

.ai-workbench__panel {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 10px 12px 14px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--editor-layer-glass, rgba(255, 255, 255, 0.52)) 62%, transparent),
    color-mix(in srgb, var(--editor-layer-soft, rgba(248, 250, 252, 0.12)) 26%, transparent)
  );
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
}
</style>
