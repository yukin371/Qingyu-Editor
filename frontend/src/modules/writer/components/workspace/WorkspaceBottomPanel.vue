<template>
  <section
    v-if="visible"
    class="workspace-bottom-panel"
    :class="{ 'workspace-bottom-panel--immersive': isImmersiveMode }"
  >
    <div class="workspace-bottom-panel__tabs">
      <button
        v-for="panelId in panelIds"
        :key="panelId"
        type="button"
        class="workspace-bottom-panel__tab"
        :class="{ active: activePanelId === panelId }"
        @click="$emit('select-panel', panelId)"
      >
        {{ getPanelTitle(panelId) }}
      </button>
      <div class="workspace-bottom-panel__spacer"></div>
      <button type="button" class="workspace-bottom-panel__close" @click="$emit('close')">
        收起
      </button>
    </div>

    <div class="workspace-bottom-panel__content">
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
  </section>
</template>

<script setup lang="ts">
import WorkspacePanelRenderer from '@/modules/writer/components/workspace/WorkspacePanelRenderer.vue'
import type { WorkspacePanelId } from '@/modules/writer/types/workspaceLayout'
import type { ActiveEntitySummary } from '@/modules/writer/composables/useWorkflowContext'
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
import {
  getWorkspaceAreaDefaultPanelIds,
  getWorkspacePanelTitle,
} from '@/modules/writer/config/workspacePanels'

const props = withDefaults(
  defineProps<{
    visible: boolean
    activePanelId: WorkspacePanelId | null
    panelIds: WorkspacePanelId[]
    projectId: string
    chapterId: string
    chapterCount: number
    directoryCount: number
    activeToolLabel: string
    saveStatusLabel: string
    sourceText: string
    aiActionTrigger: WriterAIActionTrigger | null
    aiApplyFeedback: WriterAIApplyFeedback | null
    workflowContext: WriterWorkflowContext
    draftProposals: WriterDraftProposal[]
    extraStatusChips?: string[]
    projectDisplayName?: string
    chapterTitle?: string
    scopeLabel?: string
    activeEntities?: ActiveEntitySummary[]
    isImmersiveMode?: boolean
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
  }>(),
  {
    extraStatusChips: () => [],
    projectDisplayName: '',
    chapterId: '',
    chapterTitle: '',
    scopeLabel: '',
    activeEntities: () => [],
    isImmersiveMode: false,
    panelIds: () => getWorkspaceAreaDefaultPanelIds('bottom'),
  },
)

defineEmits<{
  (e: 'select-panel', panelId: WorkspacePanelId): void
  (e: 'close'): void
  (e: 'ai-apply', payload: WriterAIApplyPayload): void
  (e: 'proposal-draft', payload: WriterResultCandidate): void
  (
    e: 'proposal-status-change',
    payload: { proposalId: string; status: WriterDraftProposalStatus },
  ): void
  (e: 'trigger-ai-action', payload: WriterWorkflowActionRequest): void
  (e: 'create-structure-plan', payload: WriterStructurePlanPayload): void
}>()

function getPanelTitle(panelId: WorkspacePanelId) {
  return getWorkspacePanelTitle(panelId)
}
</script>

<style scoped lang="scss">
.workspace-bottom-panel {
  border-top: 1px solid var(--editor-border, #e2e8f0);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
  min-height: 120px;
  max-height: 240px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.workspace-bottom-panel--immersive {
  opacity: 0.88;
}

.workspace-bottom-panel__tabs {
  height: 36px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border-bottom: 1px solid var(--editor-border, #e2e8f0);
  background: rgba(248, 250, 252, 0.94);
}

.workspace-bottom-panel__tab,
.workspace-bottom-panel__close {
  height: 24px;
  padding: 0 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.workspace-bottom-panel__tab.active {
  background: var(--editor-accent-soft, #ecfeff);
  color: var(--editor-accent, #06b6d4);
}

.workspace-bottom-panel__close:hover,
.workspace-bottom-panel__tab:hover {
  background: var(--editor-bg-elevated, #f1f5f9);
  color: var(--editor-text-primary, #0f172a);
}

.workspace-bottom-panel__spacer {
  flex: 1;
}

.workspace-bottom-panel__content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
}
</style>
