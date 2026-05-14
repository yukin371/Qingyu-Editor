<template>
  <div class="workspace-flow-shell">
    <CreativeStageTabs
      v-model="activeCreativeStageId"
      :completed-stage-ids="completedCreativeStageIds"
    />

    <section
      v-if="activeCreativeStageId !== 'drafting'"
      class="creative-stage-board"
      :aria-label="activeCreativeStage.title"
    >
      <div class="creative-stage-board__hero">
        <div>
          <div class="creative-stage-board__eyebrow">阶段 {{ activeCreativeStage.order }} / 5</div>
          <h2>{{ activeCreativeStage.title }}</h2>
          <p>{{ activeCreativeStage.intent }}</p>
        </div>
        <QyGhostButton
          class="creative-stage-board__action"
          @click="handleStageAction(activeCreativeStage.primaryAction)"
        >
          <QyIcon :name="stageActionIcon" :size="14" />
          {{ activeCreativeStage.primaryActionLabel }}
        </QyGhostButton>
      </div>

      <div class="creative-stage-board__grid">
        <article class="creative-stage-board__card">
          <h3>当前任务</h3>
          <ul>
            <li v-for="task in activeCreativeStage.tasks" :key="task">
              <QyIcon name="Circle" :size="10" />
              <span>{{ task }}</span>
            </li>
          </ul>
        </article>
        <article class="creative-stage-board__card">
          <h3>阶段产出</h3>
          <ul>
            <li v-for="output in activeCreativeStage.outputs" :key="output">
              <QyIcon name="CheckCircle2" :size="12" />
              <span>{{ output }}</span>
            </li>
          </ul>
        </article>
        <article class="creative-stage-board__card creative-stage-board__card--wide">
          <h3>交接到下一步</h3>
          <p>{{ activeCreativeStage.handoff }}</p>
          <div class="creative-stage-board__quick-actions">
            <QyGhostButton @click="activeCreativeStageId = 'drafting'">
              <QyIcon name="PenLine" :size="14" />
              回到正文
            </QyGhostButton>
            <QyGhostButton @click="handleStageAction({ type: 'right-tool', tool: 'ai' })">
              <QyIcon name="Sparkles" :size="14" />
              交给 AI
            </QyGhostButton>
          </div>
        </article>
      </div>
    </section>
  </div>

  <div v-if="activeCreativeStageId === 'drafting' && !chapterId" class="editor-empty-state">
    <div class="empty-content">
      <h3>选择章节后开始写作</h3>
      <p>左侧管理目录，中间保持正文。先选择一章，或直接新建章节。</p>
      <QyGhostButton class="empty-action" @click="$emit('add-doc')">
        <QyIcon name="Plus" :size="14" />
        新建章节
      </QyGhostButton>
    </div>
  </div>

  <div
    v-else-if="activeCreativeStageId === 'drafting'"
    class="workspace-writing-surface"
    data-testid="workspace-writing-surface"
  >
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
        @selection-action="emit('trigger-ai-action', $event)"
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
import CreativeStageTabs from '@/modules/writer/components/workspace/CreativeStageTabs.vue'
import WorkspaceToolOverlay from '@/modules/writer/components/workspace/WorkspaceToolOverlay.vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import QyGhostButton from '@/design-system/components/basic/QyGhostButton/QyGhostButton.vue'
import { useToolOverlay, type ToolType } from '@/modules/writer/composables/useToolOverlay'
import { useWorkspaceShortcuts } from '@/modules/writer/composables/useWorkspaceShortcuts'
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
import {
  getCreativeFlowStage,
  type CreativeFlowAction,
  type CreativeFlowStageId,
} from '@/modules/writer/config/creativeFlow'

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
  initialStage?: CreativeFlowStageId
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
  (e: 'trigger-ai-action', payload: WriterWorkflowActionRequest): void
  (e: 'create-structure-plan', payload: WriterStructurePlanPayload): void
  (e: 'jump-to-chapter', chapterId: string): void
  (e: 'open-graph', chapterId: string): void
  (e: 'status-change', chips: string[]): void
  (e: 'open-right-tool', tool: 'ai' | 'assets' | 'proofread' | 'inspiration'): void
  (e: 'open-bottom-panel', panelId: 'status' | 'context' | 'harness'): void
}>()

const modelContent = computed({
  get: () => props.content,
  set: (value: string) => emit('update:content', value),
})

const titleInputRef = ref<HTMLInputElement | null>(null)
const titleDraft = ref(props.chapterTitle || '')
const isEditingTitle = ref(false)
const activeCreativeStageId = ref<CreativeFlowStageId>(props.initialStage || 'drafting')

const completedCreativeStageIds = computed<CreativeFlowStageId[]>(() => {
  const completed: CreativeFlowStageId[] = []
  if (props.chapterId) {
    completed.push('drafting')
  }
  if ((props.activeEntities?.length || 0) > 0 || (props.entityStats?.characters || 0) > 0) {
    completed.push('foundation')
  }
  if ((props.chapters?.length || 0) > 1) {
    completed.push('blueprint')
  }
  if ((props.changeRequests?.length || 0) > 0) {
    completed.push('review')
  }
  return completed
})

const activeCreativeStage = computed(() => getCreativeFlowStage(activeCreativeStageId.value))
const stageActionIcon = computed(() => {
  const action = activeCreativeStage.value.primaryAction
  if (action.type === 'right-tool') return action.tool === 'ai' ? 'Sparkles' : 'PanelRightOpen'
  if (action.type === 'overlay') return 'Maximize2'
  if (action.type === 'bottom-panel') return 'PanelBottomOpen'
  return 'Plus'
})

watch(
  () => props.chapterTitle,
  (value) => {
    if (!isEditingTitle.value) {
      titleDraft.value = value || ''
    }
  },
  { immediate: true },
)

watch(
  () => props.initialStage,
  (value) => {
    if (value) {
      activeCreativeStageId.value = value
    }
  },
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

const handleStageAction = (action: CreativeFlowAction) => {
  if (action.type === 'right-tool') {
    emit('open-right-tool', action.tool)
    return
  }
  if (action.type === 'overlay') {
    toolOverlay.open(action.tool)
    return
  }
  if (action.type === 'bottom-panel') {
    emit('open-bottom-panel', action.panel)
    return
  }
  emit('add-doc')
}

const handleOverlayTriggerAIAction = (payload: {
  source: string
  action: string
  title: string
  text: string
  instructions?: string
}) => {
  emit('trigger-ai-action', payload as WriterWorkflowActionRequest)
}

const toolOverlay = useToolOverlay()
useWorkspaceShortcuts({
  openLatestTool: () => toolOverlay.open(),
  openTool: (tool) => toolOverlay.open(tool),
  closeOverlay: () => toolOverlay.close(),
  isOverlayVisible: () => toolOverlay.visible.value,
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
  height: calc(100% - 90px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-left: 1px solid var(--editor-border, #e5e7eb);
  border-right: 1px solid var(--editor-border, #e5e7eb);
}

.workspace-flow-shell {
  min-height: 0;
}

.creative-stage-board {
  height: calc(100% - 90px);
  min-height: 0;
  overflow: auto;
  padding: 28px;
  background:
    linear-gradient(135deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 0.92)),
    repeating-linear-gradient(
      90deg,
      rgba(15, 23, 42, 0.035) 0,
      rgba(15, 23, 42, 0.035) 1px,
      transparent 1px,
      transparent 72px
    );
}

.creative-stage-board__hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.86);
  padding: 24px;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.08);
}

.creative-stage-board__eyebrow {
  color: #0f766e;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.creative-stage-board__hero h2 {
  margin: 8px 0 10px;
  color: #0f172a;
  font-size: 30px;
  line-height: 1.15;
  font-weight: 900;
}

.creative-stage-board__hero p {
  max-width: 680px;
  margin: 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.8;
}

.creative-stage-board__action {
  flex-shrink: 0;
}

.creative-stage-board__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 16px;
}

.creative-stage-board__card {
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 18px;
}

.creative-stage-board__card--wide {
  grid-column: 1 / -1;
}

.creative-stage-board__card h3 {
  margin: 0 0 12px;
  color: #0f172a;
  font-size: 15px;
  font-weight: 850;
}

.creative-stage-board__card ul {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.creative-stage-board__card li {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  color: #334155;
  font-size: 13px;
}

.creative-stage-board__card p {
  margin: 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.7;
}

.creative-stage-board__quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.empty-content {
  width: min(420px, calc(100% - 48px));
  text-align: center;
  color: #6b7280;
}

.empty-content h3 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
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
  height: calc(100% - 90px);
  min-height: 0;
  overflow: hidden;
  background: #fff;
}

.workspace-writing-surface__header {
  display: flex;
  align-items: center;
  padding: 18px 32px 10px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 0.96));
}

.workspace-writing-surface__title-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #0f172a;
  font-size: 28px;
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: -0.02em;
  padding: 4px 0;
}

.workspace-writing-surface__title-input::placeholder {
  color: #94a3b8;
}

.workspace-writing-surface__editor {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
</style>
