<template>
  <section class="outline-tree-panel">
    <div class="outline-tree-panel__header">
      <div>
        <p class="outline-tree-panel__eyebrow">Outline Tree</p>
        <h3 class="outline-tree-panel__title">结构树</h3>
      </div>
      <div class="outline-tree-panel__header-side">
        <div class="outline-tree-panel__count">{{ flattenedCount }} 节点</div>
        <div class="outline-tree-panel__hint">支持同级拖拽排序</div>
        <div class="outline-tree-panel__actions">
          <button
            type="button"
            class="outline-action outline-action--primary"
            @click="emit('createRoot')"
          >
            新增主干
          </button>
          <button
            type="button"
            class="outline-action"
            :disabled="!selectedNodeId"
            @click="emit('createChild')"
          >
            新增子节点
          </button>
          <button
            type="button"
            class="outline-action"
            :disabled="!canMoveUp"
            @click="emit('moveUp')"
          >
            上移
          </button>
          <button
            type="button"
            class="outline-action"
            :disabled="!canMoveDown"
            @click="emit('moveDown')"
          >
            下移
          </button>
          <button
            type="button"
            class="outline-action"
            :disabled="!selectedNodeId"
            @click="handleEdit"
          >
            编辑
          </button>
          <button
            type="button"
            class="outline-action outline-action--danger"
            :disabled="!selectedNodeId"
            @click="handleDelete"
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <div class="outline-tree-panel__body">
      <div v-if="nodes.length" class="outline-tree-panel__tree">
        <OutlineTreeRow
          v-for="node in nodes"
          :key="node.id"
          :node="node"
          :selected-node-id="selectedNodeId"
          :expanded-node-ids="expandedNodeIds"
          :chapters="chapters"
          :chapter-graphs="chapterGraphs"
          :asset-summary-by-chapter-id="assetSummaryByChapterId"
          :current-chapter-id="currentChapterId"
          :dragging-node-id="dragState.draggingNodeId"
          :drop-target-node-id="dragState.targetNodeId"
          :drop-position="dragState.position"
          @toggle="emit('toggle', $event)"
          @select="handleSelect"
          @open-graph="emit('openGraph', $event)"
          @drag-start="handleDragStart"
          @drag-over="handleDragOver"
          @drag-end="handleDragEnd"
          @drop-node="handleDrop"
          @contextmenu="handleContextMenu"
        />
      </div>
      <div v-else-if="loading" class="outline-tree-panel__empty outline-tree-panel__empty--loading">
        正在加载结构树，请稍候。
      </div>
      <div v-else class="outline-tree-panel__empty">
        还没有结构节点，先从章节目录或 AI 生成大纲进入。
      </div>
    </div>

    <!-- 右键菜单 -->
    <OutlineContextMenu
      ref="contextMenuRef"
      :visible="contextMenuVisible"
      :can-create-child="!!selectedNodeId"
      :can-move-up="canMoveUp"
      :can-move-down="canMoveDown"
      :volume-nodes="volumeNodes"
      :can-convert-to-chapter="canConvertToChapter"
      @create-child="handleCreateChild"
      @move-up="emit('moveUp')"
      @move-down="emit('moveDown')"
      @edit="handleEdit"
      @delete="handleDelete"
      @close="contextMenuVisible = false"
      @convert-to-chapter="handleConvertToChapter"
    />

    <!-- 编辑对话框 -->
    <OutlineNodeDialog
      v-model:visible="dialogVisible"
      :is-edit="isEditDialog"
      :node="selectedNodeData"
      :chapters="chapters"
      @confirm="handleDialogConfirm"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type { ChapterGraph } from '@/modules/writer/types/character'
import type { OutlineNode } from '@/types/writer'
import type { WriterAssetSummary } from '@/modules/writer/utils/writerAssetRefs'
import OutlineTreeRow from './OutlineTreeRow.vue'
import OutlineContextMenu from './OutlineContextMenu.vue'
import OutlineNodeDialog from './OutlineNodeDialog.vue'
import type { CreateOutlineRequest, UpdateOutlineRequest } from '@/modules/writer/api/outline'

type TreeDropPosition = 'before' | 'after'

const props = defineProps<{
  nodes: OutlineNode[]
  selectedNodeId: string
  expandedNodeIds: string[]
  chapters: SidebarChapterSummary[]
  chapterGraphs?: ChapterGraph[]
  assetSummaryByChapterId?: Record<string, WriterAssetSummary>
  currentChapterId?: string
  loading?: boolean
  canMoveUp?: boolean
  canMoveDown?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle', nodeId: string): void
  (e: 'select', node: OutlineNode): void
  (e: 'openGraph', chapterId: string): void
  (e: 'createRoot'): void
  (e: 'createChild'): void
  (e: 'createChild', data: CreateOutlineRequest): void
  (e: 'moveUp'): void
  (e: 'moveDown'): void
  (e: 'editSelected', data: UpdateOutlineRequest): void
  (e: 'deleteSelected'): void
  (
    e: 'reorder',
    payload: { draggedNodeId: string; targetNodeId: string; position: TreeDropPosition },
  ): void
  (e: 'convertToChapter', payload: { outlineNode: OutlineNode; volumeNode: OutlineNode }): void
}>()

const dragState = reactive<{
  draggingNodeId: string
  draggingParentId: string
  targetNodeId: string
  position: TreeDropPosition | null
}>({
  draggingNodeId: '',
  draggingParentId: '',
  targetNodeId: '',
  position: null,
})

const flattenedCount = computed(() => {
  const walk = (items: OutlineNode[]): number =>
    items.reduce((total, item) => total + 1 + walk(item.children || []), 0)
  return walk(props.nodes)
})

function normalizeParentId(parentId: string | undefined): string {
  return parentId || ''
}

function resetDragState() {
  dragState.draggingNodeId = ''
  dragState.draggingParentId = ''
  dragState.targetNodeId = ''
  dragState.position = null
}

function handleDragStart(node: OutlineNode) {
  dragState.draggingNodeId = node.id
  dragState.draggingParentId = normalizeParentId(node.parentId)
  dragState.targetNodeId = ''
  dragState.position = null
  emit('select', node)
}

function handleDragOver(payload: { node: OutlineNode; event: DragEvent }) {
  if (!dragState.draggingNodeId || dragState.draggingNodeId === payload.node.id) return

  if (normalizeParentId(payload.node.parentId) !== dragState.draggingParentId) {
    dragState.targetNodeId = ''
    dragState.position = null
    return
  }

  const targetElement = payload.event.currentTarget as HTMLElement | null
  if (!targetElement) return

  payload.event.preventDefault()
  if (payload.event.dataTransfer) payload.event.dataTransfer.dropEffect = 'move'

  const rect = targetElement.getBoundingClientRect()
  dragState.targetNodeId = payload.node.id
  dragState.position = payload.event.clientY <= rect.top + rect.height / 2 ? 'before' : 'after'
}

function handleDragEnd() {
  resetDragState()
}

function handleDrop(payload: { node: OutlineNode; event: DragEvent }) {
  if (
    !dragState.draggingNodeId ||
    !dragState.position ||
    dragState.draggingNodeId === payload.node.id ||
    normalizeParentId(payload.node.parentId) !== dragState.draggingParentId
  ) {
    resetDragState()
    return
  }

  payload.event.preventDefault()

  emit('reorder', {
    draggedNodeId: dragState.draggingNodeId,
    targetNodeId: payload.node.id,
    position: dragState.position,
  })

  resetDragState()
}

// =======================
// 右键菜单和编辑对话框
// =======================
const contextMenuRef = ref<InstanceType<typeof OutlineContextMenu> | null>(null)
const contextMenuVisible = ref(false)
const dialogVisible = ref(false)
const isEditDialog = ref(false)

const selectedNodeData = computed(() => {
  const findNode = (nodes: OutlineNode[], id: string): OutlineNode | undefined => {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children?.length) {
        const found = findNode(node.children, id)
        if (found) return found
      }
    }
    return undefined
  }
  return findNode(props.nodes, props.selectedNodeId)
})

// 从大纲树中提取所有 volume 类型的节点
const volumeNodes = computed<OutlineNode[]>(() => {
  const result: OutlineNode[] = []
  const walk = (nodes: OutlineNode[]) => {
    for (const node of nodes) {
      // 检查 type 字段（OutlineNode 可能通过扩展属性包含 type）
      const nodeWithType = node as OutlineNode & { type?: string }
      if (nodeWithType.type === 'volume') {
        result.push(node)
      }
      if (node.children?.length) {
        walk(node.children)
      }
    }
  }
  walk(props.nodes)
  return result
})

// 当前选中节点是否可以转为章节（非 volume 类型的大纲节点可以转换）
const canConvertToChapter = computed(() => {
  const node = selectedNodeData.value
  if (!node) return false
  const nodeWithType = node as OutlineNode & { type?: string }
  // 只有非 volume 类型的节点可以转为章节
  return nodeWithType.type !== 'volume'
})

function handleSelect(node: OutlineNode) {
  emit('select', node)
}

function handleContextMenu(payload: { node: OutlineNode; event: MouseEvent }) {
  emit('select', payload.node)
  contextMenuVisible.value = true

  // 延迟显示菜单以确保状态已更新
  setTimeout(() => {
    contextMenuRef.value?.show(payload.event.clientX, payload.event.clientY)
  }, 0)
}

function handleCreateChild() {
  contextMenuVisible.value = false
  emit('createChild')
}

function handleEdit() {
  contextMenuVisible.value = false
  isEditDialog.value = true
  dialogVisible.value = true
}

function handleDelete() {
  contextMenuVisible.value = false
  emit('deleteSelected')
}

// 转为章节处理
function handleConvertToChapter(volumeNode: OutlineNode) {
  contextMenuVisible.value = false
  const outlineNode = selectedNodeData.value
  if (outlineNode) {
    emit('convertToChapter', { outlineNode, volumeNode })
  }
}

function handleDialogConfirm(data: CreateOutlineRequest | UpdateOutlineRequest) {
  if (isEditDialog.value) {
    // 编辑模式：将数据传递给父组件进行API调用
    emit('editSelected', data as UpdateOutlineRequest)
  } else {
    // 新增模式：将数据传递给父组件进行API调用
    emit('createChild', data as CreateOutlineRequest)
  }
  dialogVisible.value = false
}
</script>

<style scoped lang="scss">
.outline-tree-panel {
  position: relative;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-radius: var(--editor-radius-lg);
  border: 1px solid var(--editor-border);
  background:
    radial-gradient(circle at 0% 0%, var(--editor-bg-surface), transparent 26%),
    linear-gradient(180deg, var(--editor-bg-base), var(--editor-bg-surface));
  box-shadow: 0 16px 32px rgba(80, 49, 26, 0.08);
  overflow: hidden;
}

.outline-tree-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.14), transparent 30%),
    repeating-linear-gradient(
      180deg,
      transparent 0,
      transparent 22px,
      rgba(145, 117, 86, 0.03) 23px
    );
  pointer-events: none;
}

.outline-tree-panel__header {
  position: relative;
  z-index: 1;
  padding: 18px 18px 14px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--editor-border);
}

.outline-tree-panel__eyebrow {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--editor-accent);
  font-weight: 800;
}

.outline-tree-panel__title {
  margin: 6px 0 0;
  font-size: 22px;
  color: var(--editor-text-primary);
}

.outline-tree-panel__count {
  padding: 7px 10px;
  border-radius: var(--radius-full, 9999px);
  background: var(--editor-accent-soft);
  border: 1px solid var(--editor-border);
  color: var(--editor-accent);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.outline-tree-panel__header-side {
  display: grid;
  gap: 8px;
  justify-items: end;
}

.outline-tree-panel__hint {
  color: var(--editor-text-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.outline-tree-panel__actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.outline-action {
  border: 1px solid var(--editor-border);
  border-radius: var(--radius-full, 9999px);
  background: var(--editor-bg-base);
  color: var(--editor-text-secondary);
  font-size: 12px;
  font-weight: 700;
  padding: 7px 10px;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease;
}

.outline-action--primary {
  border-color: transparent;
  background: linear-gradient(135deg, var(--editor-accent), #b76d38);
  color: #fff9f3;
  box-shadow: 0 10px 18px rgba(99, 60, 30, 0.12);
}

.outline-action--danger {
  color: var(--editor-accent);
}

.outline-action:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 16px rgba(99, 60, 30, 0.08);
}

.outline-action:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.outline-tree-panel__body {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 14px;
}

.outline-tree-panel__tree {
  display: grid;
  gap: 8px;
  align-content: start;
}

.outline-tree-panel__empty {
  border-radius: 16px;
  border: 1px dashed var(--editor-border);
  background: var(--editor-bg-base);
  padding: 18px;
  color: var(--editor-text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.outline-tree-panel__empty--loading {
  border-style: solid;
  border-color: rgba(54, 80, 107, 0.18);
  background: rgba(235, 244, 249, 0.92);
  color: #32536a;
}

@media (max-width: 960px) {
  .outline-tree-panel__header {
    flex-direction: column;
  }

  .outline-tree-panel__header-side {
    justify-items: start;
  }

  .outline-tree-panel__actions {
    justify-content: flex-start;
  }
}
</style>
