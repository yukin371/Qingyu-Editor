<template>
  <div class="workspace-panel-renderer">
    <template v-if="panelId === 'ai'">
      <AIWorkbench
        :project-id="projectId"
        :chapter-id="chapterId"
        :chapter-title="chapterTitle"
        :source-text="sourceText"
        :action-trigger="aiActionTrigger"
        :ai-apply-feedback="aiApplyFeedback"
        :workflow-context="workflowContext"
        :draft-proposals="draftProposals"
        @apply-generated-text="(payload: WriterAIApplyPayload) => $emit('ai-apply', payload)"
        @proposal-draft="(payload) => $emit('proposal-draft', payload)"
        @proposal-status-change="(payload) => $emit('proposal-status-change', payload)"
        @apply-structure-plan="(payload) => $emit('create-structure-plan', payload)"
      />
    </template>

    <template v-else-if="panelId === 'harness'">
      <StoryHarnessPanel
        v-if="harnessData"
        :project-id="harnessData.projectId"
        :chapter-id="harnessData.chapterId"
        :chapter-title="harnessData.chapterTitle"
        :content="harnessData.content"
        :chapter-count="harnessData.chapterCount"
        :scope-label="harnessData.scopeLabel"
        :entity-stats="harnessData.entityStats"
        :active-characters="harnessData.activeCharacters"
        :active-relations="harnessData.activeRelations"
        :change-requests="harnessData.changeRequests"
        :handle-change-request-decision="harnessData.handleChangeRequestDecision"
        :handle-trigger-index="harnessData.handleTriggerIndex"
        :is-triggering-index="harnessData.isTriggeringIndex"
        @trigger-ai-action="(payload) => $emit('trigger-ai-action', payload)"
      />
    </template>

    <WorkspaceStatusInspectorPanel
      v-else-if="panelId === 'status'"
      :chapter-count="chapterCount"
      :directory-count="directoryCount"
      :active-tool-label="activeToolLabel"
      :save-status-label="saveStatusLabel"
      :extra-status-chips="extraStatusChips"
    />

    <WorkspaceContextInspectorPanel
      v-else-if="panelId === 'context'"
      :project-display-name="projectDisplayName"
      :chapter-title="chapterTitle"
      :scope-label="scopeLabel"
      :active-entities="activeEntities"
    />

    <div v-else class="workspace-panel-renderer__empty">
      <strong>面板未接入</strong>
      <span>{{ panelId || '未知面板' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import AIWorkbench from '@/modules/writer/components/workspace/AIWorkbench.vue'
import StoryHarnessPanel from '@/modules/writer/components/v3/story-harness/StoryHarnessPanel.vue'
import WorkspaceStatusInspectorPanel from '@/modules/writer/components/workspace/WorkspaceStatusInspectorPanel.vue'
import WorkspaceContextInspectorPanel from '@/modules/writer/components/workspace/WorkspaceContextInspectorPanel.vue'
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
  panelId: WorkspacePanelId | null
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
.workspace-panel-renderer {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.workspace-panel-renderer__empty {
  display: grid;
  gap: 4px;
  align-content: center;
  justify-items: center;
  height: 100%;
  color: var(--editor-text-muted, #64748b);
}
</style>
