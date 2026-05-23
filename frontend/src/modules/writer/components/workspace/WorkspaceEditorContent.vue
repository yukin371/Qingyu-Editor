<template>
  <div v-if="!chapterId" class="editor-empty-state">
    <div class="empty-content">
      <h3>选择章节后开始写作</h3>
      <p>左侧管理目录，中间保持正文。先选择一章，或直接新建章节。</p>
      <QyGhostButton class="empty-action" @click="$emit('add-doc')">
        <QyIcon name="Plus" :size="14" />
        新建章节
      </QyGhostButton>
    </div>
  </div>

  <div v-else class="workspace-writing-surface" data-testid="workspace-writing-surface">
    <div class="workspace-writing-surface__header">
      <input
        ref="titleInputRef"
        id="writer-chapter-title"
        name="writer-chapter-title"
        v-model="titleDraft"
        type="text"
        class="workspace-writing-surface__title-input"
        :placeholder="chapterTitle || '未命名章节'"
        @focus="isEditingTitle = true"
        @blur="handleTitleBlur"
        @keydown.enter.prevent="handleTitleEnter"
        @keydown.esc.prevent="handleTitleEscape"
      />
    </div>
    <div class="workspace-writing-surface__editor">
      <TipTapEditorView
        v-model="modelContent"
        :project-id="projectId"
        :document-id="chapterId"
        :readonly="false"
        :show-reference-panel="false"
        :proofread-highlights="proofreadHighlights"
        :focused-proofread-issue-id="focusedProofreadIssueId"
        @selection-action="emit('trigger-ai-action', $event)"
        @entity-scan="emit('entity-scan', $event)"
        @save="(contents: unknown[]) => $emit('save', contents)"
        @open-tool-overlay="toolOverlay.open()"
      />
    </div>
  </div>

  <WorkspaceToolOverlay
    :visible="toolOverlay.visible.value"
    :active-tool="toolOverlay.activeTool.value"
    :project-id="projectId"
    :chapter-id="overlayChapterId"
    :chapter-title="overlayChapterTitle"
    :chapters="chapters"
    :workflow-context="workflowContext"
    :active-entities="activeEntities"
    :scene-stage="sceneStage"
    @close="toolOverlay.close"
    @tool-change="toolOverlay.switchTool"
    @status-change="emit('status-change', $event)"
    @open-graph="(chapterId: string) => emit('open-graph', chapterId)"
    @jump-to-chapter="(chapterId: string) => emit('jump-to-chapter', chapterId)"
    @trigger-ai-action="handleOverlayTriggerAIAction"
    @create-structure-plan="(payload) => emit('create-structure-plan', payload)"
  />
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import TipTapEditorView from '@/modules/writer/components/editor-new/TipTapEditorView.vue'
import WorkspaceToolOverlay from '@/modules/writer/components/workspace/WorkspaceToolOverlay.vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import QyGhostButton from '@/design-system/components/basic/QyGhostButton/QyGhostButton.vue'
import { useToolOverlay, type ToolType } from '@/modules/writer/composables/useToolOverlay'
import { useWorkspaceShortcuts } from '@/modules/writer/composables/useWorkspaceShortcuts'
import { usePanelStore } from '@/modules/writer/stores/panelStore'
import type {
  StoryHarnessChangeRequestDecision,
  StoryHarnessCharacterSummary,
  StoryHarnessChangeRequestPreview,
  StoryHarnessRelationSummary,
} from '@/modules/writer/stores/v3/storyHarnessStore'
import type {
  WriterStructurePlanPayload,
  WriterWorkflowActionRequest,
} from '@/modules/writer/types/workflow'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type { ActiveEntitySummary } from '@/modules/writer/composables/useWorkflowContext'
import type { WriterWorkflowContext } from '@/modules/writer/types/workflow'
import type { WriterSceneStageState } from '@/modules/writer/types/sceneStage'
import type { ProofreadHighlightRange } from '@/design-system/components/editor'

const props = defineProps<{
  projectId: string
  chapterId: string
  chapterTitle: string
  toolOverlayChapterId?: string
  toolOverlayChapterTitle?: string
  chapters: SidebarChapterSummary[]
  content: string
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
  workflowContext?: WriterWorkflowContext
  activeEntities?: ActiveEntitySummary[]
  sceneStage?: WriterSceneStageState | null
  proofreadHighlights?: ProofreadHighlightRange[]
  focusedProofreadIssueId?: string
  handleChangeRequestDecision?: (
    requestId: string,
    decision: StoryHarnessChangeRequestDecision,
  ) => Promise<boolean>
  handleTriggerIndex?: () => Promise<void>
  isTriggeringIndex?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:content', value: string): void
  (e: 'save', contents: unknown[]): void
  (e: 'add-doc'): void
  (e: 'rename-title', value: string): void
  (e: 'entity-scan', refs: Array<{ id?: string; name: string; type: string }>): void
  (e: 'trigger-ai-action', payload: WriterWorkflowActionRequest): void
  (e: 'create-structure-plan', payload: WriterStructurePlanPayload): void
  (e: 'jump-to-chapter', chapterId: string): void
  (e: 'open-graph', chapterId: string): void
  (e: 'status-change', chips: string[]): void
}>()

const modelContent = computed({
  get: () => props.content,
  set: (value: string) => emit('update:content', value),
})

const titleInputRef = ref<HTMLInputElement | null>(null)
const titleDraft = ref(props.chapterTitle || '')
const isEditingTitle = ref(false)

watch(
  () => props.chapterTitle,
  (value) => {
    if (!isEditingTitle.value) {
      titleDraft.value = value || ''
    }
  },
  { immediate: true },
)

const commitTitleDraft = () => {
  const nextTitle = titleDraft.value.trim()
  const currentTitle = (props.chapterTitle || '').trim()
  isEditingTitle.value = false

  if (!nextTitle) {
    titleDraft.value = props.chapterTitle || ''
    return
  }

  if (nextTitle === currentTitle) {
    titleDraft.value = props.chapterTitle || ''
    return
  }

  emit('rename-title', nextTitle)
}

const handleTitleBlur = () => {
  commitTitleDraft()
}

const handleTitleEnter = async () => {
  commitTitleDraft()
  await nextTick()
  titleInputRef.value?.blur()
}

const handleTitleEscape = async () => {
  titleDraft.value = props.chapterTitle || ''
  isEditingTitle.value = false
  await nextTick()
  titleInputRef.value?.blur()
}

const overlayChapterId = computed(() => props.toolOverlayChapterId ?? props.chapterId)
const overlayChapterTitle = computed(() => props.toolOverlayChapterTitle ?? props.chapterTitle)

const handleOverlayTriggerAIAction = (payload: WriterWorkflowActionRequest) => {
  emit('trigger-ai-action', payload)
}

const toolOverlay = useToolOverlay()
const panelStore = usePanelStore()
useWorkspaceShortcuts({
  openLatestTool: () => toolOverlay.open(),
  openTool: (tool) => toolOverlay.open(tool),
  closeOverlay: () => toolOverlay.close(),
  isOverlayVisible: () => toolOverlay.visible.value,
  toggleLeftPanel: () => panelStore.toggleLeftCollapsed(),
  toggleRightPanel: () => panelStore.toggleRightCollapsed(),
})

defineExpose({
  openFullscreenTool: (tool: string) => {
    toolOverlay.open(tool as ToolType)
  },
  closeFullscreen: () => {
    toolOverlay.close()
  },
  openToolOverlay: () => {
    toolOverlay.open()
  },
  focusTitleInput: async () => {
    await nextTick()
    titleInputRef.value?.focus()
    titleInputRef.value?.select()
  },
})
</script>

<style scoped lang="scss">
.editor-empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
  border-left: 1px solid var(--editor-border, #e5e7eb);
  border-right: 1px solid var(--editor-border, #e5e7eb);
}

.empty-content {
  width: min(420px, calc(100% - 48px));
  text-align: center;
  color: var(--editor-text-muted, #6b7280);
}

.empty-content h3 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  color: var(--editor-text-primary, #111827);
}

.empty-content p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
}

.empty-action {
  margin-top: 18px;
}

.workspace-writing-surface {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
}

.workspace-writing-surface__header {
  display: flex;
  align-items: center;
  padding: 18px 32px 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 88%, transparent);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--editor-layer-soft, var(--editor-bg-surface, #f8fafc)) 96%, transparent),
    color-mix(in srgb, var(--editor-layer-panel, var(--editor-bg-base, #ffffff)) 96%, transparent)
  );
}

.workspace-writing-surface__title-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--editor-text-primary, #0f172a);
  font-size: 28px;
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: -0.02em;
  padding: 4px 0;
}

.workspace-writing-surface__title-input::placeholder {
  color: var(--editor-text-ghost, #94a3b8);
}

.workspace-writing-surface__editor {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
</style>
