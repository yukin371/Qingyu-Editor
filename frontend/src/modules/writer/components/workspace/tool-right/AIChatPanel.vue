<template>
  <div class="tool-right-ai">
    <AIWorkbench
      :project-id="projectId"
      :chapter-id="chapterId"
      :chapter-title="chapterTitle"
      :chapters="chapters"
      :source-text="sourceText"
      :action-trigger="aiActionTrigger"
      :ai-apply-feedback="aiApplyFeedback"
      :workflow-context="workflowContext"
      :ai-summary-context-text="aiSummaryContextText"
      :ai-asset-summaries="aiAssetSummaries"
      :ai-scene-stage-summary="aiSceneStageSummary"
      :writer-project-brief="writerProjectBrief"
      :writer-user-preference="writerUserPreference"
      :draft-proposals="draftProposals"
      @apply-generated-text="(payload) => $emit('ai-apply', payload)"
      @proposal-draft="(payload) => $emit('proposal-draft', payload)"
      @proposal-status-change="(payload) => $emit('proposal-status-change', payload)"
      @apply-structure-plan="(payload) => $emit('create-structure-plan', payload)"
    />
  </div>
</template>

<script setup lang="ts">
import AIWorkbench from '@/modules/writer/components/workspace/AIWorkbench.vue'
import type {
  WriterAIActionTrigger,
  WriterAIApplyFeedback,
  WriterAIApplyPayload,
  WriterDraftProposal,
  WriterDraftProposalStatus,
  WriterResultCandidate,
  WriterStructurePlanPayload,
  WriterWorkflowContext,
} from '@/modules/writer/types/workflow'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type {
  WriterAIAssetSummary,
  WriterAISceneStageSummary,
} from '@/modules/writer/utils/writerAIContext'
import type { WriterProjectBrief } from '@/modules/writer/services/writerProjectBrief.service'
import type { WriterUserPreferenceMemory } from '@/modules/writer/services/writerUserPreferenceMemory.service'

defineProps<{
  projectId: string
  chapterId: string
  chapterTitle: string
  chapters: SidebarChapterSummary[]
  sourceText: string
  aiActionTrigger: WriterAIActionTrigger | null
  aiApplyFeedback: WriterAIApplyFeedback | null
  workflowContext: WriterWorkflowContext
  aiSummaryContextText?: string
  aiAssetSummaries?: WriterAIAssetSummary[]
  aiSceneStageSummary?: WriterAISceneStageSummary
  writerProjectBrief?: WriterProjectBrief | null
  writerUserPreference?: WriterUserPreferenceMemory | null
  draftProposals: WriterDraftProposal[]
}>()

defineEmits<{
  (e: 'ai-apply', payload: WriterAIApplyPayload): void
  (e: 'proposal-draft', payload: WriterResultCandidate): void
  (
    e: 'proposal-status-change',
    payload: { proposalId: string; status: WriterDraftProposalStatus },
  ): void
  (e: 'create-structure-plan', payload: WriterStructurePlanPayload): void
}>()
</script>

<style scoped lang="scss">
.tool-right-ai {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
