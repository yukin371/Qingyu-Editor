<template>
  <div
    class="workspace-right-panel-shell"
    :class="{
      'is-collapsed': collapsed || !workspaceLayoutStore.rightToolArea.visible,
      'is-immersive-hidden': isImmersiveMode,
    }"
  >
    <div class="workspace-right-panel-body">
      <ToolRightPanel
        :active-tool="workspaceLayoutStore.rightToolArea.activeTool"
        :project-id="projectId"
        :chapter-id="chapterId"
        :chapter-title="chapterTitle"
        :chapters="chapters"
        :source-text="sourceText"
        :ai-action-trigger="aiActionTrigger"
        :ai-apply-feedback="aiApplyFeedback"
        :workflow-context="workflowContext"
        :scene-stage="sceneStage"
        :draft-proposals="draftProposals"
        :harness-data="harnessData"
        @ai-apply="(payload: WriterAIApplyPayload) => $emit('ai-apply', payload)"
        @proposal-draft="(payload) => $emit('proposal-draft', payload)"
        @proposal-status-change="(payload) => $emit('proposal-status-change', payload)"
        @create-structure-plan="(payload) => $emit('create-structure-plan', payload)"
        @jump-to-chapter="(chapterId) => $emit('jump-to-chapter', chapterId)"
        @trigger-ai-action="(payload) => $emit('trigger-ai-action', payload)"
        @close="handleCloseRightTool"
      />
    </div>

    <WorkspaceRightActivityBar
      :collapsed="collapsed"
      :visible="workspaceLayoutStore.rightToolArea.visible"
      :active-tool="workspaceLayoutStore.rightToolArea.activeTool"
      @select-tool="handleRightToolSelect"
    />
  </div>
</template>

<script setup lang="ts">
import ToolRightPanel from '@/modules/writer/components/workspace/ToolRightPanel.vue'
import WorkspaceRightActivityBar from '@/modules/writer/components/workspace/WorkspaceRightActivityBar.vue'
import { usePanelStore } from '@/modules/writer/stores/panelStore'
import { useWorkspaceLayoutStore } from '@/modules/writer/stores/workspaceLayoutStore'
import type {
  WriterAIApplyPayload,
  WriterDraftProposal,
  WriterDraftProposalStatus,
  WriterResultCandidate,
  WriterStructurePlanPayload,
  WriterWorkflowActionRequest,
} from '@/modules/writer/types/workflow'
import type {
  StoryHarnessChangeRequestDecision,
  StoryHarnessCharacterSummary,
  StoryHarnessChangeRequestPreview,
  StoryHarnessRelationSummary,
} from '@/modules/writer/stores/v3/storyHarnessStore'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type { RightToolType } from '@/modules/writer/types/workspaceLayout'
import type { WriterSceneStageState } from '@/modules/writer/types/sceneStage'

// =======================
// Props & Emits
// =======================
defineProps<{
  collapsed: boolean
  isImmersiveMode: boolean
  projectId: string
  chapterId: string
  chapterTitle: string
  chapters: SidebarChapterSummary[]
  sourceText: string
  aiActionTrigger: import('@/modules/writer/types/workflow').WriterAIActionTrigger | null
  aiApplyFeedback: import('@/modules/writer/types/workflow').WriterAIApplyFeedback | null
  workflowContext: import('@/modules/writer/types/workflow').WriterWorkflowContext
  sceneStage?: WriterSceneStageState | null
  draftProposals: WriterDraftProposal[]
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
  (e: 'create-structure-plan', payload: WriterStructurePlanPayload): void
  (e: 'jump-to-chapter', chapterId: string): void
  (e: 'trigger-ai-action', payload: WriterWorkflowActionRequest): void
}>()

const panelStore = usePanelStore()
const workspaceLayoutStore = useWorkspaceLayoutStore()

const handleRightToolSelect = (toolId: RightToolType) => {
  if (panelStore.rightCollapsed) {
    panelStore.setRightCollapsed(false)
    workspaceLayoutStore.setRightToolActive(toolId)
    return
  }
  const isSameTool =
    workspaceLayoutStore.rightToolArea.activeTool === toolId &&
    workspaceLayoutStore.rightToolArea.visible

  workspaceLayoutStore.toggleRightTool(toolId)

  if (isSameTool) {
    panelStore.setRightCollapsed(true)
    return
  }

  panelStore.setRightCollapsed(false)
}

const handleCloseRightTool = () => {
  workspaceLayoutStore.setRightToolVisible(false)
  panelStore.setRightCollapsed(true)
}
</script>

<style scoped lang="scss">
.workspace-right-panel-shell {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: row;
  width: 100%;
  min-width: 0;
  position: relative;
  background: transparent;
}

.workspace-right-panel-body {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--editor-border, #e2e8f0);
  transition:
    opacity 200ms ease-out,
    width 200ms ease-out;
  background: transparent;
}

// 折叠状态：内容区收起，Activity Bar 保持可见
.workspace-right-panel-shell.is-collapsed {
  .workspace-right-panel-body {
    width: 0;
    opacity: 0;
    border-left-width: 0;
    pointer-events: none;
    overflow: hidden;
  }
}

.workspace-right-panel-shell.is-immersive-hidden {
  display: none;
}

// 占位面板
.panel-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
  color: var(--editor-text-ghost, #94a3b8);

  span {
    font-size: 14px;
    font-weight: 500;
    color: var(--editor-text-muted, #64748b);
  }

  p {
    font-size: 12px;
    margin: 0;
  }
}
</style>
