<template>
  <div class="structure-stage-content">
    <StructureDefaultStagePanel
      v-if="!showAdvancedControls"
      :chapter-count="chapterCount"
      :current-chapter-id="currentChapterId"
      :current-chapter-title="currentChapterTitle"
      :current-volume-directory="currentVolumeDirectory"
      :is-outline-loading="isOutlineLoading"
      :selected-node-id="selectedNodeId"
      :selected-node="selectedNode"
      :selected-node-title="selectedNodeTitle"
      :bound-chapter="boundChapter"
      :scene-stage="sceneStage"
      :default-stage-primary-hint="defaultStagePrimaryHint"
      :active-segment-id="activeSegmentId"
      :active-rhythm-segment-title="activeRhythmSegmentTitle"
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
      @activate-segment="emit('activate-segment', $event)"
      @update:rhythm-locator-query="emit('update:rhythm-locator-query', $event)"
      @update:rhythm-filter-mode="emit('update:rhythm-filter-mode', $event)"
      @update:creative-workflow-import-target="emit('update:creative-workflow-import-target', $event)"
      @update:creative-workflow-duplicate-strategy="
        emit('update:creative-workflow-duplicate-strategy', $event)
      "
      @locate-rhythm="emit('locate-rhythm')"
      @select-node="emit('select-node', $event)"
      @jump-to-chapter="emit('jump-to-chapter', $event)"
      @bind-current-chapter="emit('bind-current-chapter', $event)"
      @switch-tool="emit('switch-tool', $event)"
      @open-advanced="emit('open-advanced')"
      @import-blueprint="emit('import-blueprint')"
      @send-blueprint-to-ai="emit('send-blueprint-to-ai')"
      @send-current-to-ai="emit('send-current-to-ai')"
    />

    <template v-else>
      <StructureBranchRibbon
        v-if="stageViewMode === 'overview'"
        :branch-spotlights="branchSpotlights"
        :selected-node-id="selectedNodeId"
        :is-outline-loading="isOutlineLoading"
        @select-node="emit('select-node', $event)"
      />

      <FishboneOutlineBoard
        v-if="stageViewMode === 'fishbone'"
        :nodes="filteredRootNodes"
        :selected-node-id="selectedNodeId"
        :chapters="chapterOptions"
        :chapter-graphs="chapterGraphs"
        :asset-summary-by-chapter-id="assetSummaryByChapterId"
        :current-chapter-id="currentChapterId"
        :loading="isOutlineLoading"
        :can-move-up="canMoveUp"
        :can-move-down="canMoveDown"
        @select="emit('select-node', $event)"
        @edit-node="emit('edit-node', $event)"
        @move-up="emit('move-up', $event)"
        @move-down="emit('move-down', $event)"
        @create-child-node="emit('create-child-node', $event)"
        @bind-current-chapter="emit('bind-current-chapter', $event)"
        @unbind-chapter="emit('unbind-chapter', $event)"
        @update-status="(node, status) => emit('update-status', node, status)"
        @open-graph="emit('open-graph', $event)"
        @jump-to-chapter="emit('jump-to-chapter', $event)"
      />

      <CanvasOutlineBoard
        v-if="stageViewMode === 'canvas'"
        :nodes="filteredRootNodes"
        :selected-node-id="selectedNodeId"
        :chapters="chapterOptions"
        :chapter-graphs="chapterGraphs"
        :asset-summary-by-chapter-id="assetSummaryByChapterId"
        :current-chapter-id="currentChapterId"
        :loading="isOutlineLoading"
        :can-move-up="canMoveUp"
        :can-move-down="canMoveDown"
        @select="emit('select-node', $event)"
        @edit-node="emit('canvas-edit-node', $event)"
        @move-up="emit('move-up', $event)"
        @move-down="emit('move-down', $event)"
        @create-child-node="emit('create-child-node', $event)"
        @delete-node="emit('canvas-delete-node', $event)"
        @update-status="(node, status) => emit('update-status', node, status)"
        @open-graph="emit('open-graph', $event)"
        @jump-to-chapter="emit('jump-to-chapter', $event)"
      />

      <BeatBoardPanel
        v-if="stageViewMode === 'beats'"
        :beats="filteredFlattenedNodes"
        :selected-node-id="selectedNodeId"
        :chapters="chapterOptions"
        :chapter-graphs="chapterGraphs"
        :asset-summary-by-chapter-id="assetSummaryByChapterId"
        :current-chapter-id="currentChapterId"
        :loading="isOutlineLoading"
        :can-move-up="canMoveUp"
        :can-move-down="canMoveDown"
        @select="emit('select-node', $event)"
        @edit-node="emit('edit-node', $event)"
        @move-up="emit('move-up', $event)"
        @move-down="emit('move-down', $event)"
        @create-child-node="emit('create-child-node', $event)"
        @bind-current-chapter="emit('bind-current-chapter', $event)"
        @unbind-chapter="emit('unbind-chapter', $event)"
        @update-status="(node, status) => emit('update-status', node, status)"
        @open-graph="emit('open-graph', $event)"
        @jump-to-chapter="emit('jump-to-chapter', $event)"
        @reorder="emit('reorder', $event)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type { ToolType } from '@/modules/writer/composables/useToolOverlay'
import type { ChapterGraph } from '@/modules/writer/types/character'
import type {
  WriterStructureDuplicateStrategy,
  WriterStructureImportTarget,
} from '@/modules/writer/types/workflow'
import type { WriterAssetSummary } from '@/modules/writer/utils/writerAssetRefs'
import type { OutlineNode } from '@/types/writer'
import type { WriterSceneStageState } from '@/modules/writer/types/sceneStage'
import BeatBoardPanel from './BeatBoardPanel.vue'
import CanvasOutlineBoard from './CanvasOutlineBoard.vue'
import FishboneOutlineBoard from './FishboneOutlineBoard.vue'
import StructureBranchRibbon from './StructureBranchRibbon.vue'
import StructureDefaultStagePanel from './StructureDefaultStagePanel.vue'
import type {
  BranchSpotlight,
  GoldenChapterPlanLike,
  RhythmBoardSummary,
  RhythmFilterMode,
  RhythmRow,
  RhythmSegment,
  StageViewMode,
} from './structureStage.types'
import type { StructureStatusValue } from './structureNodeTypes'
type TreeDropPosition = 'before' | 'after'

defineProps<{
  showAdvancedControls: boolean
  stageViewMode: StageViewMode
  chapterCount: number
  chapterOptions: SidebarChapterSummary[]
  currentChapterId: string
  currentChapterTitle: string
  currentVolumeDirectory: string
  isOutlineLoading: boolean
  selectedNodeId: string
  selectedNode: OutlineNode | null
  selectedNodeTitle: string
  boundChapter: SidebarChapterSummary | null
  sceneStage?: WriterSceneStageState | null
  defaultStagePrimaryHint: string
  activeSegmentId: string
  activeRhythmSegmentTitle: string
  rhythmLocatorQuery: string
  rhythmWindowRangeLabel: string
  rhythmFilterMode: RhythmFilterMode
  rhythmFilterOptions: Array<{ value: RhythmFilterMode; label: string }>
  rhythmBoardSummary: RhythmBoardSummary
  rhythmSegments: RhythmSegment[]
  rhythmWindowRows: RhythmRow[]
  hasCreativeWorkflowBlueprint: boolean
  creativeWorkflowTemplateName: string
  creativeWorkflowPitch: string
  creativeWorkflowAudienceLabel: string
  creativeWorkflowPaceContract: string
  creativeWorkflowPromises: string[]
  creativeWorkflowGoldenChapters: GoldenChapterPlanLike[]
  creativeWorkflowImportTarget: WriterStructureImportTarget
  creativeWorkflowDuplicateStrategy: WriterStructureDuplicateStrategy
  creativeWorkflowImportTargetLabel: string
  branchSpotlights: BranchSpotlight[]
  filteredRootNodes: OutlineNode[]
  filteredFlattenedNodes: OutlineNode[]
  chapterGraphs: ChapterGraph[]
  assetSummaryByChapterId: Record<string, WriterAssetSummary>
  canMoveUp: (node: OutlineNode) => boolean
  canMoveDown: (node: OutlineNode) => boolean
}>()

const emit = defineEmits<{
  (e: 'activate-segment', segmentId: string): void
  (e: 'update:rhythm-locator-query', value: string): void
  (e: 'update:rhythm-filter-mode', value: RhythmFilterMode): void
  (e: 'update:creative-workflow-import-target', value: string): void
  (e: 'update:creative-workflow-duplicate-strategy', value: string): void
  (e: 'locate-rhythm'): void
  (e: 'select-node', node: OutlineNode): void
  (e: 'jump-to-chapter', chapterId: string): void
  (e: 'bind-current-chapter', node: OutlineNode): void
  (e: 'switch-tool', tool: ToolType): void
  (e: 'open-advanced'): void
  (e: 'import-blueprint'): void
  (e: 'send-blueprint-to-ai'): void
  (e: 'send-current-to-ai'): void
  (e: 'edit-node', node: OutlineNode): void
  (e: 'move-up', node: OutlineNode): void
  (e: 'move-down', node: OutlineNode): void
  (e: 'create-child-node', node: OutlineNode): void
  (e: 'unbind-chapter', node: OutlineNode): void
  (e: 'update-status', node: OutlineNode, status: StructureStatusValue): void
  (e: 'open-graph', chapterId: string): void
  (e: 'canvas-edit-node', node: OutlineNode): void
  (e: 'canvas-delete-node', node: OutlineNode): void
  (
    e: 'reorder',
    payload: { draggedNodeId: string; targetNodeId: string; position: TreeDropPosition },
  ): void
}>()
</script>

<style scoped lang="scss">
.structure-stage-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
