<template>
  <div class="tool-right-panel" :class="`tool-right-panel--${activeConfig.mode}`">
    <div class="tool-right-panel__topbar">
      <button
        type="button"
        class="tool-right-panel__icon-btn"
        :title="`收起${activeConfig.label}`"
        @click="$emit('close')"
      >
        <QyIcon name="Close" :size="14" />
      </button>
    </div>

    <div class="tool-right-panel__content">
      <template v-if="showListPanel">
        <aside class="tool-right-panel__list" :style="{ width: `${listWidth}px` }">
          <AssetListPanel
            :loading="loading"
            :search-keyword="searchKeyword"
            :active-category="assetCategory"
            :category-options="categoryOptions"
            :empty-message="emptyMessage"
            :assets="filteredAssets"
            :selected-asset-id="selectedAsset?.id"
            @update:search-keyword="searchKeyword = $event"
            @select-category="handleAssetCategoryChange"
            @select-asset="handleAssetSelect"
          />
        </aside>
        <div
          class="tool-right-panel__divider"
          :class="{ 'tool-right-panel__divider--active': isResizingList }"
          role="separator"
          aria-orientation="vertical"
          aria-label="调整右侧设定列表宽度"
          @mousedown="startListResize"
        ></div>
      </template>

      <section :ref="setDetailPanelRef" class="tool-right-panel__detail">
        <AIChatPanel
          v-if="activeTool === 'ai'"
          :project-id="projectId"
          :chapter-id="chapterId"
          :chapter-title="chapterTitle"
          :source-text="sourceText"
          :ai-action-trigger="aiActionTrigger"
          :ai-apply-feedback="aiApplyFeedback"
          :workflow-context="workflowContext"
          :draft-proposals="draftProposals"
          @ai-apply="(payload) => $emit('ai-apply', payload)"
          @proposal-draft="(payload) => $emit('proposal-draft', payload)"
          @proposal-status-change="(payload) => $emit('proposal-status-change', payload)"
          @create-structure-plan="(payload) => $emit('create-structure-plan', payload)"
        />

        <AssetDetailPanel
          v-else-if="activeTool === 'assets'"
          :asset="selectedAsset"
          :detail-fields="selectedDetailFields"
          :state-fields="selectedStateFields"
          :data-hint="selectedDataHint"
          @open-graph="handleOpenAssetGraph"
          @jump-to-chapter="$emit('jump-to-chapter', $event)"
          @open-fullscreen="handleOpenAssetsFullscreen"
        />

        <ProofreadPanel v-else-if="activeTool === 'proofread'" :source-text="sourceText" />

        <InspirationPanel
          v-else
          :project-id="projectId"
          :chapter-id="chapterId"
          :chapter-title="chapterTitle"
          @open-fullscreen="handleOpenInspirationFullscreen"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type ComponentPublicInstance } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import AIChatPanel from '@/modules/writer/components/workspace/tool-right/AIChatPanel.vue'
import AssetDetailPanel from '@/modules/writer/components/workspace/tool-right/AssetDetailPanel.vue'
import AssetListPanel from '@/modules/writer/components/workspace/tool-right/AssetListPanel.vue'
import InspirationPanel from '@/modules/writer/components/workspace/tool-right/InspirationPanel.vue'
import ProofreadPanel from '@/modules/writer/components/workspace/tool-right/ProofreadPanel.vue'
import { useToolOverlay } from '@/modules/writer/composables/useToolOverlay'
import { useToolRightPanel } from '@/modules/writer/composables/useToolRightPanel'
import { useWriterAssetCatalog } from '@/modules/writer/composables/useWriterAssetCatalog'
import type { EncyclopediaCategory, SidebarChapterSummary } from '@/modules/writer/composables/types'
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
import type { RightToolType } from '@/modules/writer/types/workspaceLayout'

const props = defineProps<{
  activeTool: RightToolType
  projectId: string
  chapterId: string
  chapterTitle: string
  chapters: SidebarChapterSummary[]
  sourceText: string
  aiActionTrigger: WriterAIActionTrigger | null
  aiApplyFeedback: WriterAIApplyFeedback | null
  workflowContext: WriterWorkflowContext
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
  (e: 'jump-to-chapter', chapterId: string): void
  (e: 'close'): void
}>()

const searchKeyword = ref('')
const assetCategory = ref<EncyclopediaCategory>('characters')
const toolOverlay = useToolOverlay()
const activeToolRef = computed(() => props.activeTool)
const { activeConfig, showListPanel, listWidth, isResizingList, attachDetailPanel, startListResize } =
  useToolRightPanel(activeToolRef)
const {
  loading,
  categoryOptions,
  filteredAssets,
  emptyMessage,
  selectedAsset,
  selectedDetailFields,
  selectedStateFields,
  selectedDataHint,
  selectAsset,
  buildGraphFocusTarget,
} = useWriterAssetCatalog({
  projectId: computed(() => props.projectId),
  chapters: computed(() => props.chapters),
  activeCategory: assetCategory,
  searchKeyword,
})
const setDetailPanelRef = (
  value: Element | ComponentPublicInstance | null,
  _refs?: Record<string, unknown>,
) => {
  attachDetailPanel(value instanceof HTMLElement ? value : null)
}

const handleAssetCategoryChange = (category: EncyclopediaCategory) => {
  assetCategory.value = category
}

const handleAssetSelect = (assetId: string) => {
  const nextAsset = filteredAssets.value.find((asset) => asset.id === assetId) || null
  selectAsset(nextAsset)
}

const handleOpenAssetsFullscreen = () => {
  toolOverlay.openFromRightPanel('assets', {
    assetsCategory: assetCategory.value,
    assetId: selectedAsset.value?.id,
  })
}

const handleOpenAssetGraph = () => {
  if (!selectedAsset.value) return
  toolOverlay.openFromRightPanel('relations', {
    focusedAsset: buildGraphFocusTarget(selectedAsset.value),
  })
}

const handleOpenInspirationFullscreen = () => {
  toolOverlay.openFromRightPanel('structure')
}
</script>

<style scoped lang="scss">
.tool-right-panel {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  background: #fff;
}

.tool-right-panel__topbar {
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 12px;
  border-bottom: 1px solid #eceff3;
}

.tool-right-panel__icon-btn {
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  color: #6b7280;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover:not(:disabled) {
    color: #111827;
    background: #f3f4f6;
  }

  &:disabled {
    cursor: default;
    opacity: 0.35;
  }
}

.tool-right-panel__content {
  min-height: 0;
  flex: 1;
  display: flex;
}

.tool-right-panel__list {
  flex-shrink: 0;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.tool-right-panel__detail {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.tool-right-panel__divider {
  position: relative;
  width: var(--drag-handle-width, 6px);
  flex-shrink: 0;
  background: transparent;
  cursor: col-resize;
  user-select: none;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
    transform: translateX(-50%);
    background: #eceff3;
    transition:
      background-color var(--transition-fast, 100ms) ease-out,
      width var(--transition-fast, 100ms) ease-out;
  }

  &:hover::before {
    width: 2px;
    background: var(--drag-handle-hover-bg, #007fd4);
  }
}

.tool-right-panel__divider--active::before {
  width: 3px;
  background: var(--drag-handle-hover-bg, #007fd4);
}
</style>
