<template>
  <section class="structure-stage-view">
    <StructureStageControls
      :current-chapter-title="currentChapterTitle"
      :selected-node-title="selectedNode?.title || ''"
      :default-stage-action-text="defaultStageActionText"
      :selected-node-asset-count="selectedNodeAssetCount"
      :show-advanced-controls="showAdvancedControls"
      :is-outline-loading="isOutlineLoading"
      :structure-refresh-error="structureRefreshError"
      :stage-view-mode="stageViewMode"
      :view-mode-options="viewModeOptions"
      :filter-text="filterText"
      :primary-filter-options="primaryFilterOptions"
      :active-filter="activeFilter"
      :secondary-filter-options="secondaryFilterOptions"
      :secondary-filter-value="secondaryFilterValue"
      :root-node-count="rootNodes.length"
      :flattened-node-count="flattenedNodes.length"
      :filtered-flattened-node-count="filteredFlattenedNodes.length"
      @toggle-advanced="showAdvancedControls = !showAdvancedControls"
      @refresh="handleRefresh"
      @update:stage-view-mode="stageViewMode = $event"
      @update:filter-text="filterText = $event"
      @update:active-filter="activeFilter = $event"
      @secondary-filter-change="handleSecondaryFilterChange"
    />

    <div class="structure-stage-view__grid">
      <div class="structure-stage-view__stage-column">
        <StructureStageContent
          :show-advanced-controls="showAdvancedControls"
          :stage-view-mode="stageViewMode"
          :chapter-count="chapterOptions.length"
          :chapter-options="chapterOptions"
          :current-chapter-id="currentChapterId"
          :current-volume-directory="currentVolumeDirectory"
          :is-outline-loading="isOutlineLoading"
          :selected-node-id="selectedNodeId"
          :selected-node="selectedNode"
          :selected-node-title="selectedNode?.title || ''"
          :bound-chapter="boundChapter"
          :default-stage-primary-hint="defaultStagePrimaryHint"
          :active-segment-id="activeSegmentId"
          :active-rhythm-segment-title="activeRhythmSegment?.title || ''"
          :rhythm-locator-query="rhythmLocatorQuery"
          :rhythm-window-range-label="rhythmWindowRangeLabel"
          :rhythm-filter-mode="rhythmFilterMode"
          :rhythm-filter-options="rhythmFilterOptions"
          :rhythm-board-summary="rhythmBoardSummary"
          :rhythm-segments="rhythmSegments"
          :rhythm-window-rows="rhythmWindowRows"
          :has-creative-workflow-blueprint="hasCreativeWorkflowBlueprint"
          :creative-workflow-template-name="creativeWorkflowTemplateName"
          :creative-workflow-pitch="creativeWorkflowPitch"
          :creative-workflow-audience-label="creativeWorkflowAudienceLabel"
          :creative-workflow-pace-contract="creativeWorkflowPaceContract"
          :creative-workflow-promises="creativeWorkflowPromises"
          :creative-workflow-golden-chapters="creativeWorkflowGoldenChapters"
          :creative-workflow-import-target="creativeWorkflowImportTarget"
          :creative-workflow-duplicate-strategy="creativeWorkflowDuplicateStrategy"
          :creative-workflow-import-target-label="creativeWorkflowImportTargetLabel"
          :branch-spotlights="branchSpotlights"
          :filtered-root-nodes="filteredRootNodes"
          :filtered-flattened-nodes="filteredFlattenedNodes"
          :chapter-graphs="chapterGraphs"
          :asset-summary-by-chapter-id="assetSummaryByChapterId"
          :can-move-up="canMoveNodeUp"
          :can-move-down="canMoveNodeDown"
          @activate-segment="activateRhythmSegment"
          @update:rhythm-locator-query="rhythmLocatorQuery = $event"
          @update:rhythm-filter-mode="rhythmFilterMode = $event"
          @update:creative-workflow-import-target="setCreativeWorkflowImportTarget($event)"
          @update:creative-workflow-duplicate-strategy="setCreativeWorkflowDuplicateStrategy($event)"
          @locate-rhythm="handleRhythmLocate"
          @select-node="selectNode"
          @jump-to-chapter="emit('jumpToChapter', $event)"
          @bind-current-chapter="bindCurrentChapterForNode"
          @switch-tool="emit('switch-tool', $event)"
          @open-advanced="showAdvancedControls = true"
          @import-blueprint="emitCreativeWorkflowStructurePlan"
          @send-blueprint-to-ai="emitCreativeWorkflowToAI"
          @edit-node="openEditNode"
          @move-up="moveNodeUp"
          @move-down="moveNodeDown"
          @create-child-node="openCreateChildForNode"
          @unbind-chapter="unbindChapterForNode"
          @update-status="updateNodeStatus"
          @open-graph="emit('openGraph', $event)"
          @canvas-edit-node="handleCanvasEditNode"
          @canvas-delete-node="handleCanvasDeleteNode"
          @reorder="handleTreeReorder"
        />
      </div>

      <StructureInspectorPanel
        :selected-node="selectedNode"
        :chapters="chapterOptions"
        :chapter-graphs="chapterGraphs"
        :workflow-context="workflowContext"
        :active-entities="activeEntities"
        :current-chapter-id="currentChapterId"
        :current-chapter-title="currentChapterTitle"
        :draft-binding-chapter-id="draftBindingChapterId"
        :bound-chapter="boundChapter"
        :loading="isOutlineLoading"
        @update:draft-binding-chapter-id="draftBindingChapterId = $event"
        @bind-current-chapter="bindNodeToChapter"
        @bind-chapter="bindNodeToChapter"
        @unbind-chapter="unbindNodeFromChapter"
        @trigger-ai-action="emit('trigger-ai-action', $event)"
        @open-graph="emit('openGraph', $event)"
        @jump-to-chapter="emit('jumpToChapter', $event)"
        @switch-tool="emit('switch-tool', $event)"
      />
    </div>

    <StructureNodeEditorDialog
      v-model:visible="editorVisible"
      :mode="editorMode"
      :initial-value="editorForm"
      :submitting="editorSubmitting"
      @submit="submitNodeEditor"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { message } from '@/design-system/services'
import { useWriterAssetRefState } from '@/modules/writer/composables/useWriterAssetRefState'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import { loadCharacterGraphDraftState } from '@/modules/writer/utils/characterGraphDrafts'
import {
  buildWriterAssetSummaryByChapterId,
  type WriterAssetSummary,
} from '@/modules/writer/utils/writerAssetRefs'
import type { OutlineNode } from '@/types/writer'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type { ActiveEntitySummary } from '@/modules/writer/composables/useWorkflowContext'
import {
  type WriterWorkflowActionRequest,
  type WriterWorkflowContext,
  type WriterStructurePlanPayload,
} from '@/modules/writer/types/workflow'
import StructureStageContent from './StructureStageContent.vue'
import StructureStageControls from './StructureStageControls.vue'
import StructureInspectorPanel from './StructureInspectorPanel.vue'
import StructureNodeEditorDialog, { type StructureNodeFormValue } from './StructureNodeEditorDialog.vue'
import { useStructureStageActions } from './useStructureStageActions'
import { useStructureStageBlueprint } from './useStructureStageBlueprint'
import { useStructureStageFilters } from './useStructureStageFilters'
import { useStructureStageFocus } from './useStructureStageFocus'
import { useStructureStageRhythm } from './useStructureStageRhythm'
import type { StageViewMode, StructureFilterMode } from './structureStage.types'
import type { ToolType } from '@/modules/writer/composables/useToolOverlay'
import { getBoundChapterId } from './structureNodeTypes'

type TreeDropPosition = 'before' | 'after'

const props = withDefaults(
  defineProps<{
    projectId?: string
    chapters?: SidebarChapterSummary[]
    currentChapterId?: string
    currentChapterTitle?: string
    workflowContext?: WriterWorkflowContext
    activeEntities?: ActiveEntitySummary[]
  }>(),
  {
    projectId: '',
    chapters: () => [],
    currentChapterId: '',
    currentChapterTitle: '',
    workflowContext: undefined,
    activeEntities: () => [],
  },
)

// 本地状态管理
const writerStore = useWriterStore()
const expandedNodeIds = ref<string[]>([])
const selectedNodeId = ref('')

// 本地计算属性
const rootNodes = computed<OutlineNode[]>(() => writerStore.outline.tree || [])

// 未过滤的扁平化节点（用于节点排序等操作）
const flattenedNodes = computed<OutlineNode[]>(() => {
  const list: OutlineNode[] = []
  const walk = (nodes: OutlineNode[]) => {
    for (const node of nodes) {
      list.push(node)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(rootNodes.value)
  return list
})

const editorVisible = ref(false)
const editorSubmitting = ref(false)
const editorMode = ref<'create-root' | 'create-child' | 'edit'>('create-root')
const editorForm = ref<StructureNodeFormValue>({
  title: '',
  level: 1,
  status: 'planned',
  description: '',
})
const filterText = ref('')
const activeFilter = ref<StructureFilterMode>('all')
const stageViewMode = ref<StageViewMode>('overview')
const showAdvancedControls = ref(false)
const viewModeOptions: Array<{ value: StageViewMode; label: string; icon: string }> = [
  { value: 'overview', label: '分叉总览', icon: 'Connection' },
  { value: 'fishbone', label: '鱼骨聚焦', icon: 'Workflow' },
  { value: 'canvas', label: '自由画布', icon: 'Grid' },
  { value: 'beats', label: '节拍卡片', icon: 'Card' },
]
const draftBindingChapterId = ref('')
const structureRefreshError = ref('')
const emit = defineEmits<{
  (e: 'trigger-ai-action', payload: WriterWorkflowActionRequest): void
  (e: 'create-structure-plan', payload: WriterStructurePlanPayload): void
  (e: 'jumpToChapter', chapterId: string): void
  (e: 'openGraph', chapterId: string): void
  (e: 'switch-tool', toolId: ToolType): void
}>()

const effectiveProjectId = computed(() => props.projectId || writerStore.currentProjectId || '')
const isOutlineLoading = computed(() => writerStore.outline.loading)
const chapterOptions = computed(() =>
  props.chapters.filter((chapter) => chapter.nodeType !== 'directory'),
)
const { assetRefState, reloadWriterAssetRefs } = useWriterAssetRefState(effectiveProjectId)
const graphDraftState = computed(() => loadCharacterGraphDraftState(effectiveProjectId.value))
const chapterGraphs = computed(() => graphDraftState.value.chapterGraphs)
const assetSummaryByChapterId = computed<Record<string, WriterAssetSummary>>(() =>
  buildWriterAssetSummaryByChapterId(assetRefState.value, chapterOptions.value),
)
const {
  primaryFilterOptions,
  secondaryFilterOptions,
  secondaryFilterValue,
  filteredRootNodes,
  filteredFlattenedNodes,
  branchSpotlights,
} = useStructureStageFilters({
  filterText,
  activeFilter,
  rootNodes,
  currentChapterId: computed(() => props.currentChapterId),
  chapterOptions,
  chapterGraphs,
  assetSummaryByChapterId,
})
const {
  selectedNode,
  boundChapter,
  selectedNodeAssetCount,
  defaultStagePrimaryHint,
  defaultStageActionText,
} = useStructureStageFocus({
  selectedNodeId,
  filteredFlattenedNodes,
  chapterOptions,
  currentChapterTitle: computed(() => props.currentChapterTitle),
  assetSummaryByChapterId,
})
const {
  activeSegmentId,
  rhythmLocatorQuery,
  rhythmFilterMode,
  rhythmFilterOptions,
  rhythmBoardSummary,
  rhythmSegments,
  activeRhythmSegment,
  rhythmWindowRows,
  rhythmWindowRangeLabel,
  activateRhythmSegment,
  handleRhythmLocate,
} = useStructureStageRhythm({
  currentChapterId: computed(() => props.currentChapterId),
  currentChapterTitle: computed(() => props.currentChapterTitle),
  chapterOptions,
  rootNodes,
  flattenedNodes,
  selectedNodeId,
  selectedNode,
  assetSummaryByChapterId,
  selectNode,
})
const {
  creativeWorkflow,
  hasCreativeWorkflowBlueprint,
  creativeWorkflowTemplateName,
  creativeWorkflowPitch,
  creativeWorkflowAudienceLabel,
  creativeWorkflowPaceContract,
  creativeWorkflowPromises,
  creativeWorkflowGoldenChapters,
  currentVolumeDirectory,
  creativeWorkflowImportTarget,
  creativeWorkflowDuplicateStrategy,
  creativeWorkflowImportTargetLabel,
  loadBlueprint,
  setCreativeWorkflowImportTarget,
  setCreativeWorkflowDuplicateStrategy,
  buildCreativeWorkflowToAIRequest,
  buildCreativeWorkflowStructurePlan,
} = useStructureStageBlueprint({
  chapters: computed(() => props.chapters),
  currentChapterId: computed(() => props.currentChapterId),
  effectiveProjectId,
  workflowContext: computed(() => props.workflowContext),
})

function getNodeAssetCount(node: OutlineNode | null | undefined): number {
  const chapterId = getBoundChapterId(node)
  if (!chapterId) return 0
  return assetSummaryByChapterId.value[chapterId]?.total || 0
}

function emitCreativeWorkflowToAI() {
  const payload = buildCreativeWorkflowToAIRequest()
  if (!payload) return
  emit('trigger-ai-action', payload)
}

function emitCreativeWorkflowStructurePlan() {
  const payload = buildCreativeWorkflowStructurePlan()
  if (!payload) return
  emit('create-structure-plan', payload)
}

function expandRootNodes() {
  expandedNodeIds.value = rootNodes.value.map((node) => node.id)
}

function handleSecondaryFilterChange(value: string) {
  if (!value) return
  activeFilter.value = value as StructureFilterMode
}

function selectNode(node: OutlineNode) {
  selectedNodeId.value = node.id
  draftBindingChapterId.value = getBoundChapterId(node)
  writerStore.setCurrentOutlineNode(node)
}
const {
  canMoveNodeUp,
  canMoveNodeDown,
  openCreateChildForNode,
  openEditNode,
  handleRefresh,
  moveNodeUp,
  moveNodeDown,
  handleTreeReorder,
  bindNodeToChapter,
  unbindNodeFromChapter,
  unbindChapterForNode,
  bindCurrentChapterForNode,
  updateNodeStatus,
  submitNodeEditor,
  handleCanvasEditNode,
  handleCanvasDeleteNode,
} = useStructureStageActions({
  writerStore,
  effectiveProjectId,
  currentChapterId: computed(() => props.currentChapterId),
  chapterOptions,
  rootNodes,
  flattenedNodes,
  filteredRootNodes,
  selectedNodeId,
  selectedNode,
  draftBindingChapterId,
  structureRefreshError,
  editorVisible,
  editorSubmitting,
  editorMode,
  editorForm,
  reloadWriterAssetRefs,
  loadBlueprint,
  selectNode,
  expandRootNodes,
})

watch(
  () => effectiveProjectId.value,
  async (projectId) => {
    if (!projectId) return
    await handleRefresh()
  },
  { immediate: true },
)

watch(
  () => selectedNode.value?.id,
  () => {
    draftBindingChapterId.value = getBoundChapterId(selectedNode.value)
  },
  { immediate: true },
)

watch(
  () => [
    filterText.value,
    activeFilter.value,
    filteredFlattenedNodes.value.map((node) => node.id).join('|'),
  ],
  () => {
    if (
      selectedNodeId.value &&
      filteredFlattenedNodes.value.some((node) => node.id === selectedNodeId.value)
    ) {
      return
    }

    const firstNode = filteredFlattenedNodes.value[0]
    if (firstNode) {
      selectNode(firstNode)
      return
    }

    selectedNodeId.value = ''
    draftBindingChapterId.value = ''
    writerStore.setCurrentOutlineNode(null)
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
/* ==========================================================================
   结构舞台主容器 - 采用现代毛玻璃设计与分层 Flex 布局
   ========================================================================== */
.structure-stage-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  position: relative;
  background: transparent;
}

.focus-card__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 11px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 120ms ease-out;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &--primary {
    background: var(--editor-accent, #06b6d4);
    color: var(--editor-text-inverse, #fff);
  }

  &--secondary {
    border-color: color-mix(in srgb, var(--editor-accent, #32536a) 22%, transparent);
    background: color-mix(in srgb, var(--editor-accent-soft, #ecfeff) 72%, transparent);
    color: var(--editor-accent, #06b6d4);
  }

  &--ghost {
    border-color: var(--editor-border, #e2e8f0);
    background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
    color: var(--editor-text-secondary, #334155);
  }
}

/* 3. 双栏网格布局容器（树已移至侧边栏） */
.structure-stage-view__grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  grid-template-areas: 'stage inspector';
  gap: 16px;
  padding: 0 4px 4px;
}

.structure-stage-view__grid > * {
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--editor-layer-soft, var(--editor-bg-surface, #f8fafc));
  border-radius: var(--editor-radius-lg, 8px);
  border: 1px solid var(--editor-border, #e2e8f0);
  overflow: hidden;
}

.structure-stage-view__stage-column {
  grid-area: stage;
  background: transparent;
  border: none;
  gap: 16px;
}

/* 4. 具体视图样式 (鱼骨/节拍) */
:deep(.structure-stage-view__branch-ribbon),
:deep(.fishbone-outline-board),
:deep(.beat-board-panel) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--editor-layer-panel, var(--editor-bg-base, #ffffff));
  border-radius: var(--editor-radius-lg, 8px);
  border: 1px solid var(--editor-border, #e2e8f0);
  overflow: hidden;
}

/* 子组件特殊覆盖 */
:deep(.structure-inspector-panel) {
  grid-area: inspector;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

@media (max-width: 1380px) {
  .structure-stage-view__grid {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'stage'
      'inspector';
  }
}

@media (max-width: 1024px) {
  .structure-stage-view__grid {
    grid-template-columns: 1fr;
    grid-template-areas:
      'stage'
      'inspector';
  }
}
</style>
