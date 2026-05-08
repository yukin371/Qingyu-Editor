<template>
  <div
    class="workspace-left-panel-shell"
    :class="{ 'is-collapsed': collapsed, 'is-immersive-focus': isImmersiveMode }"
  >
    <WorkspaceLeftPanelChrome
      :collapsed="collapsed"
      :active-tab="activeTab"
      :more-menu-open="moreMenuOpen"
      @toggle="$emit('toggle')"
      @set-tab="activeTab = $event"
      @select-tab="handleDockClick"
      @open-tool="openTool"
      @toggle-more-menu="moreMenuOpen = !moreMenuOpen"
      @close-more-menu="closeMoreMenu"
    />

    <div class="workspace-left-panel-body">
      <ProjectSidebar
        v-if="activeTab === 'chapters'"
        v-model:projectId="localProjectId"
        v-model:chapterId="localChapterId"
        :projects="projects"
        :chapters="chapters"
        @add-doc="emit('add-doc')"
        @open-directory-outline="(id: string) => emit('open-directory-outline', id)"
        @delete-chapter="(id: string) => emit('delete-chapter', id)"
      />

      <OutlineTreePanel
        v-else-if="activeTab === 'outline'"
        :nodes="outlineTreeNodes"
        :selected-node-id="outlineTreeState.selectedNodeId.value"
        :expanded-node-ids="outlineTreeState.expandedNodeIds.value"
        :chapters="chapterOptions"
        :chapter-graphs="chapterGraphs"
        :asset-summary-by-chapter-id="assetSummaryByChapterId"
        :current-chapter-id="chapterId"
        :loading="isOutlineLoading"
        :can-move-up="outlineTreeState.canMoveUp.value"
        :can-move-down="outlineTreeState.canMoveDown.value"
        @toggle="outlineTreeState.toggleNode"
        @select="handleOutlineSelect"
        @create-root="emit('create-outline-root')"
        @create-child="emit('create-outline-child')"
        @open-graph="(chapterId: string) => $emit('open-graph', chapterId)"
        @convert-to-chapter="handleConvertToChapter"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ProjectSidebar from '@/modules/writer/components/ProjectSidebar.vue'
import WorkspaceLeftPanelChrome from '@/modules/writer/components/workspace/WorkspaceLeftPanelChrome.vue'
import OutlineTreePanel from '@/modules/writer/components/workspace/structure/OutlineTreePanel.vue'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import { useWorkspaceLayoutStore } from '@/modules/writer/stores/workspaceLayoutStore'
import { loadCharacterGraphDraftState } from '@/modules/writer/utils/characterGraphDrafts'
import {
  loadWriterAssetRefState,
  summarizeWriterAssetRefs,
  type WriterAssetSummary,
} from '@/modules/writer/utils/writerAssetRefs'
import { useOutlineTreeState } from '@/modules/writer/composables/useOutlineTreeState'
import type {
  SidebarProjectSummary,
  SidebarChapterSummary,
} from '@/modules/writer/composables/types'
import type { OutlineNode } from '@/types/writer'
import type { ChapterGraph } from '@/modules/writer/types/character'

const writerStore = useWriterStore()
const outlineTreeState = useOutlineTreeState()
const workspaceLayoutStore = useWorkspaceLayoutStore()

// =======================
// Props & Emits
// =======================
const props = defineProps<{
  collapsed: boolean
  isImmersiveMode: boolean
  projects: SidebarProjectSummary[]
  chapters: SidebarChapterSummary[]
  projectId: string
  chapterId: string
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'update:projectId', value: string): void
  (e: 'update:chapterId', value: string): void
  (e: 'add-doc'): void
  (e: 'open-directory-outline', directoryId: string): void
  (e: 'delete-chapter', chapterId: string): void
  (e: 'create-outline-root'): void
  (e: 'create-outline-child'): void
  (e: 'open-graph', chapterId: string): void
  (e: 'open-fullscreen-tool', tool: string): void
  (e: 'outline-select', node: OutlineNode): void
  (e: 'convert-to-chapter', payload: { outlineNode: OutlineNode; volumeNode: OutlineNode }): void
}>()

// =======================
// Tab 状态
// =======================
type LeftTab = 'chapters' | 'outline'
const activeTab = computed<LeftTab>({
  get: () => workspaceLayoutStore.leftSidebarTab,
  set: (value) => {
    workspaceLayoutStore.leftSidebarTab = value
  },
})

const moreMenuOpen = ref(false)

function closeMoreMenu() {
  moreMenuOpen.value = false
}

function openTool(tool: string) {
  moreMenuOpen.value = false
  emit('open-fullscreen-tool', tool)
}

function handleDockClick(tab: LeftTab) {
  if (activeTab.value === tab) {
    // 点击已激活图标 → 展开面板
    emit('toggle')
  } else {
    // 切换到其他 tab
    activeTab.value = tab
    emit('toggle')
  }
}

function handleOutlineSelect(node: OutlineNode) {
  outlineTreeState.selectNode(node)
  emit('outline-select', node)
}

// 转为章节处理
function handleConvertToChapter(payload: { outlineNode: OutlineNode; volumeNode: OutlineNode }) {
  emit('convert-to-chapter', payload)
}

// =======================
// 数据准备
// =======================
const chapterOptions = computed<SidebarChapterSummary[]>(() =>
  props.chapters.filter((chapter) => chapter.nodeType !== 'directory'),
)

const outlineTreeNodes = computed<OutlineNode[]>(() => {
  const tree = writerStore.outline.tree
  console.log('[WorkspaceLeftPanel] 获取大纲树:', tree)

  // 确保 tree 是数组
  if (Array.isArray(tree)) {
    console.log('[WorkspaceLeftPanel] 大纲树是数组，长度:', tree.length)
    return tree
  }
  // 如果不是数组，返回空数组
  console.warn('[WorkspaceLeftPanel] outline.tree is not an array:', tree)
  return []
})
const isOutlineLoading = computed(() => writerStore.outline.loading)

// 自动展开根节点
watch(
  () => writerStore.outline.tree,
  (tree) => {
    if (tree && tree.length > 0 && outlineTreeState.expandedNodeIds.value.length === 0) {
      console.log('[WorkspaceLeftPanel] 自动展开根节点')
      outlineTreeState.expandRootNodes()
    }
  },
  { immediate: true },
)

const graphDraftState = computed(() => loadCharacterGraphDraftState(props.projectId))
const chapterGraphs = computed<ChapterGraph[]>(() => graphDraftState.value.chapterGraphs)

const assetRefState = computed(() => loadWriterAssetRefState(props.projectId))
const assetSummaryByChapterId = computed<Record<string, WriterAssetSummary>>(() => {
  const summaries: Record<string, WriterAssetSummary> = {}
  for (const chapter of chapterOptions.value) {
    const chapterRefs = assetRefState.value.chapterRefs[chapter.id] || []
    const volumeRefs = chapter.parentId
      ? assetRefState.value.volumeRefs[chapter.parentId] || []
      : []
    const merged = [...chapterRefs]
    const seen = new Set(
      chapterRefs.map((ref) => `${ref.assetType}:${ref.assetId || ref.assetName}`),
    )
    for (const ref of volumeRefs) {
      const key = `${ref.assetType}:${ref.assetId || ref.assetName}`
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(ref)
    }
    summaries[chapter.id] = summarizeWriterAssetRefs(merged)
  }
  return summaries
})

// =======================
// 本地双向绑定
// =======================
const localProjectId = computed({
  get: () => props.projectId,
  set: (val) => emit('update:projectId', val),
})

const localChapterId = computed({
  get: () => props.chapterId,
  set: (val) => emit('update:chapterId', val),
})
</script>

<style scoped lang="scss">
.workspace-left-panel-shell {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  min-width: 56px;
  background: var(--editor-bg-surface, #f8fafc);
  border-right: 1px solid var(--editor-border, #e2e8f0);
  position: relative;
  transition: width 150ms ease-out;
}

.workspace-left-panel-shell.is-collapsed {
  width: 56px !important;
  min-width: 56px !important;
}

.workspace-left-panel-shell.is-collapsed .workspace-left-panel-body {
  width: 0;
  min-width: 0;
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
}

.workspace-left-panel-shell.is-immersive-focus {
  width: 56px !important;
  min-width: 56px !important;
}

.workspace-left-panel-shell.is-immersive-focus .workspace-left-panel-body {
  width: 0 !important;
  min-width: 0 !important;
  max-width: 0 !important;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
}

// =======================
// 内容区域
// =======================
.workspace-left-panel-body {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
}

@media (prefers-reduced-motion: reduce) {
  .workspace-left-panel-shell,
  .workspace-left-panel-body {
    transition: none;
  }
}
</style>
