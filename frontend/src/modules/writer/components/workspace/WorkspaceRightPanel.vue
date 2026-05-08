<template>
  <div
    class="workspace-right-panel-shell"
    :class="{ 'is-collapsed': collapsed, 'is-immersive-hidden': isImmersiveMode }"
  >
    <div class="workspace-right-panel-body">
    <WorkspaceRightPane
      :active-panel-id="activePanelId"
      :project-id="projectId"
      :chapter-id="chapterId"
      :chapter-title="chapterTitle"
      :source-text="sourceText"
      :ai-action-trigger="aiActionTrigger"
      :ai-apply-feedback="aiApplyFeedback"
      :workflow-context="workflowContext"
      :draft-proposals="draftProposals"
      :chapter-count="harnessData?.chapterCount || 0"
      :directory-count="0"
      :active-tool-label="activePanelTitle"
      :save-status-label="''"
      :project-display-name="chapterTitle"
      :harness-data="harnessData"
      @ai-apply="(payload: WriterAIApplyPayload) => $emit('ai-apply', payload)"
      @proposal-draft="(payload) => $emit('proposal-draft', payload)"
        @proposal-status-change="(payload) => $emit('proposal-status-change', payload)"
        @trigger-ai-action="(payload) => $emit('trigger-ai-action', payload)"
        @create-structure-plan="(payload) => $emit('create-structure-plan', payload)"
      />
    </div>

    <WorkspaceRightActivityBar
      :collapsed="collapsed"
      :active-panel-id="activePanelId"
      :panel-ids="rightPanelIds"
      @toggle="$emit('toggle')"
      @select-panel="activePanelId = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WorkspaceRightActivityBar from '@/modules/writer/components/workspace/WorkspaceRightActivityBar.vue'
import WorkspaceRightPane from '@/modules/writer/components/workspace/WorkspaceRightPane.vue'
import { workspacePanelRegistryById } from '@/modules/writer/config/workspacePanels'
import { useWorkspaceLayoutStore } from '@/modules/writer/stores/workspaceLayoutStore'
import type {
  WriterAIApplyPayload,
  WriterDraftProposal,
  WriterDraftProposalStatus,
  WriterResultCandidate,
  WriterStructurePlanPayload,
} from '@/modules/writer/types/workflow'
import type {
  StoryHarnessChangeRequestDecision,
  StoryHarnessCharacterSummary,
  StoryHarnessChangeRequestPreview,
  StoryHarnessRelationSummary,
} from '@/modules/writer/stores/v3/storyHarnessStore'
import type { WriterWorkflowActionRequest } from '@/modules/writer/types/workflow'

// =======================
// Props & Emits
// =======================
const props = defineProps<{
  collapsed: boolean
  isImmersiveMode: boolean
  projectId: string
  chapterId: string
  chapterTitle: string
  sourceText: string
  aiActionTrigger: import('@/modules/writer/types/workflow').WriterAIActionTrigger | null
  aiApplyFeedback: import('@/modules/writer/types/workflow').WriterAIApplyFeedback | null
  workflowContext: import('@/modules/writer/types/workflow').WriterWorkflowContext
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

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'ai-apply', payload: WriterAIApplyPayload): void
  (e: 'proposal-draft', payload: WriterResultCandidate): void
  (
    e: 'proposal-status-change',
    payload: { proposalId: string; status: WriterDraftProposalStatus },
  ): void
  (e: 'trigger-ai-action', payload: WriterWorkflowActionRequest): void
  (e: 'create-structure-plan', payload: WriterStructurePlanPayload): void
}>()

const workspaceLayoutStore = useWorkspaceLayoutStore()
const activePanelId = computed({
  get: () => workspaceLayoutStore.areas.right.activePanelId || 'ai',
  set: (value) => {
    workspaceLayoutStore.setAreaActivePanel('right', value)
  },
})
const rightPanelIds = computed(() => workspaceLayoutStore.areas.right.panelIds)
const activePanelTitle = computed(() => {
  if (!activePanelId.value) return '右侧面板'
  return workspacePanelRegistryById[activePanelId.value]?.title || '右侧面板'
})
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
