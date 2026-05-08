<template>
  <div class="workspace-right-panel-content">
    <WorkspacePanelRenderer
      :panel-id="activePanelId"
      :project-id="projectId"
      :chapter-id="chapterId"
      :chapter-title="chapterTitle"
      :source-text="sourceText"
      :ai-action-trigger="aiActionTrigger"
      :ai-apply-feedback="aiApplyFeedback"
      :workflow-context="workflowContext"
      :draft-proposals="draftProposals"
      :chapter-count="chapterCount"
      :directory-count="directoryCount"
      :active-tool-label="activeToolLabel"
      :save-status-label="saveStatusLabel"
      :extra-status-chips="extraStatusChips"
      :project-display-name="projectDisplayName"
      :scope-label="scopeLabel"
      :active-entities="activeEntities"
      :harness-data="harnessData"
      @ai-apply="(payload) => $emit('ai-apply', payload)"
      @proposal-draft="(payload) => $emit('proposal-draft', payload)"
      @proposal-status-change="(payload) => $emit('proposal-status-change', payload)"
      @trigger-ai-action="(payload) => $emit('trigger-ai-action', payload)"
      @create-structure-plan="(payload) => $emit('create-structure-plan', payload)"
    />
  </div>
</template>

<script setup lang="ts">
import WorkspacePanelRenderer from '@/modules/writer/components/workspace/WorkspacePanelRenderer.vue'
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
import type {
  StoryHarnessChangeRequestDecision,
  StoryHarnessCharacterSummary,
  StoryHarnessChangeRequestPreview,
  StoryHarnessRelationSummary,
} from '@/modules/writer/stores/v3/storyHarnessStore'
import type { WriterWorkflowActionRequest } from '@/modules/writer/types/workflow'
import type { WorkspacePanelId } from '@/modules/writer/types/workspaceLayout'
import type { ActiveEntitySummary } from '@/modules/writer/composables/useWorkflowContext'

defineProps<{
  activePanelId: WorkspacePanelId | null
  projectId: string
  chapterId: string
  chapterTitle: string
  sourceText: string
  aiActionTrigger: WriterAIActionTrigger | null
  aiApplyFeedback: WriterAIApplyFeedback | null
  workflowContext: WriterWorkflowContext
  draftProposals: WriterDraftProposal[]
  chapterCount: number
  directoryCount: number
  activeToolLabel: string
  saveStatusLabel: string
  extraStatusChips?: string[]
  projectDisplayName?: string
  scopeLabel?: string
  activeEntities?: ActiveEntitySummary[]
  harnessData?: {
    projectId: string
    chapterId: string
    chapterTitle: string
    content: string
    chapterCount: number
    scopeLabel?: string
    entityStats?: {
      characters: number
      locations: number
      items: number
      concepts: number
    }
    activeCharacters?: StoryHarnessCharacterSummary[]
    activeRelations?: StoryHarnessRelationSummary[]
    changeRequests?: StoryHarnessChangeRequestPreview[]
    handleChangeRequestDecision?: (
      requestId: string,
      decision: StoryHarnessChangeRequestDecision,
    ) => Promise<boolean>
    handleTriggerIndex?: () => Promise<void>
    isTriggeringIndex?: boolean
  }
}>()

defineEmits<{
  (e: 'ai-apply', payload: WriterAIApplyPayload): void
  (e: 'proposal-draft', payload: WriterResultCandidate): void
  (
    e: 'proposal-status-change',
    payload: { proposalId: string; status: WriterDraftProposalStatus },
  ): void
  (e: 'trigger-ai-action', payload: WriterWorkflowActionRequest): void
  (e: 'create-structure-plan', payload: WriterStructurePlanPayload): void
}>()
</script>

<style scoped lang="scss">
.workspace-right-panel-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

.workspace-right-panel-pane {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
</style>
