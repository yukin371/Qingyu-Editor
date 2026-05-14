<template>
  <section class="canvas-outline-board" @wheel.prevent="handleWheel">
    <!-- 顶部标题 -->
    <div class="canvas-outline-board__header">
      <div>
        <p class="canvas-outline-board__eyebrow">Canvas</p>
        <h3 class="canvas-outline-board__title">自由画布</h3>
      </div>
      <div class="canvas-outline-board__hint">
        拖拽空白区域平移画布，滚轮缩放，双击节点改名，右键更多操作。
      </div>
      <div class="canvas-outline-board__zoom">
        <button type="button" class="canvas-zoom-btn" @click="zoomIn">
          <QyIcon name="Plus" :size="14" />
        </button>
        <span class="canvas-zoom-label">{{ Math.round(zoom * 100) }}%</span>
        <button type="button" class="canvas-zoom-btn" @click="zoomOut">
          <QyIcon name="Minus" :size="14" />
        </button>
        <button type="button" class="canvas-zoom-btn canvas-zoom-btn--reset" @click="resetView">
          <QyIcon name="Refresh" :size="14" />
        </button>
      </div>
    </div>

    <!-- 画布主体 -->
    <div
      class="canvas-outline-board__container"
      @mousedown="handleCanvasMouseDown"
      @mousemove="handleCanvasMouseMove"
      @mouseup="handleCanvasMouseUp"
      @mouseleave="handleCanvasMouseUp"
      @contextmenu.prevent
    >
      <div
        class="canvas-outline-board__world"
        :style="{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }"
      >
        <!-- 连接线 SVG -->
        <svg class="canvas-outline-board__connections" :width="svgWidth" :height="svgHeight">
          <path
            v-for="edge in edges"
            :key="edge.id"
            :d="edge.path"
            class="canvas-connection"
            :class="{ 'canvas-connection--active': edge.isActive }"
            fill="none"
            stroke-width="2"
          />
        </svg>

        <!-- 节点 -->
        <div
          v-for="layoutNode in layoutNodes"
          :key="layoutNode.node.id"
          class="canvas-node"
          :class="[
            `canvas-node--${nodeVisualType(layoutNode.node)}`,
            {
              'is-selected': selectedNodeId === layoutNode.node.id,
              'is-editing': editingNodeId === layoutNode.node.id,
            },
          ]"
          :style="{
            left: `${layoutNode.x}px`,
            top: `${layoutNode.y}px`,
          }"
          @click.stop="handleNodeClick(layoutNode.node)"
          @dblclick.stop="handleNodeDoubleClick(layoutNode.node)"
          @contextmenu.stop="handleNodeContextMenu(layoutNode.node, $event)"
        >
          <div class="canvas-node__icon">
            <QyIcon :name="nodeIcon(layoutNode.node)" :size="16" />
          </div>
          <div class="canvas-node__content">
            <span class="canvas-node__level">L{{ layoutNode.node.level || 1 }}</span>
            <!-- 正常模式：显示标题 -->
            <span v-if="editingNodeId !== layoutNode.node.id" class="canvas-node__title">
              {{ layoutNode.node.title || '未命名节点' }}
            </span>
            <!-- 编辑模式：内联输入 -->
            <input
              v-else
              ref="editingInputRef"
              v-model.trim="editingTitle"
              class="canvas-node__input"
              @keydown.enter="commitEdit"
              @keydown.escape="cancelEdit"
              @blur="commitEdit"
              @click.stop
            />
          </div>
          <!-- 选中时的操作栏 -->
          <div
            v-if="selectedNodeId === layoutNode.node.id && editingNodeId !== layoutNode.node.id"
            class="canvas-node__actions"
          >
            <button
              type="button"
              class="canvas-node__action canvas-node__action--primary"
              @click.stop="emit('createChildNode', layoutNode.node)"
            >
              <QyIcon name="Plus" :size="12" />
            </button>
            <button
              type="button"
              class="canvas-node__action"
              @click.stop="emit('editNode', layoutNode.node)"
            >
              <QyIcon name="Edit" :size="12" />
            </button>
            <button
              type="button"
              class="canvas-node__action canvas-node__action--danger"
              @click.stop="handleDeleteNode(layoutNode.node)"
            >
              <QyIcon name="Delete" :size="12" />
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!nodes.length && !loading" class="canvas-outline-board__empty">
        <p>暂无结构节点</p>
        <span>加载大纲树后，画布会自动展示节点图谱。</span>
      </div>
      <div
        v-if="!nodes.length && loading"
        class="canvas-outline-board__empty canvas-outline-board__empty--loading"
      >
        正在计算节点布局...
      </div>
    </div>

    <!-- 右键菜单 -->
    <OutlineContextMenu
      ref="contextMenuRef"
      :visible="contextMenuVisible"
      :can-create-child="!!contextMenuNode"
      :can-move-up="contextMenuNode ? canMoveUpNode(contextMenuNode) : false"
      :can-move-down="contextMenuNode ? canMoveDownNode(contextMenuNode) : false"
      :volume-nodes="volumeNodes"
      :can-convert-to-chapter="canConvertContextMenuNode"
      @create-child="handleContextMenuCreateChild"
      @move-up="handleContextMenuMoveUp"
      @move-down="handleContextMenuMoveDown"
      @edit="handleContextMenuEdit"
      @delete="handleContextMenuDelete"
      @close="contextMenuVisible = false"
      @convert-to-chapter="handleConvertToChapter"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import OutlineContextMenu from './OutlineContextMenu.vue'
import type { OutlineNode } from '@/types/writer'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type { ChapterGraph } from '@/modules/writer/types/character'
import type { WriterAssetSummary } from '@/modules/writer/utils/writerAssetRefs'
import { type StructureStatusValue } from './structureNodeTypes'

// =========================================================================
// Types
// =========================================================================
interface LayoutNode {
  node: OutlineNode
  x: number
  y: number
  width: number
  height: number
}

interface Edge {
  id: string
  path: string
  isActive: boolean
}

// =========================================================================
// Constants
// =========================================================================
const NODE_WIDTH = 200
const NODE_HEIGHT = 72
const H_GAP = 100
const V_GAP = 20
const MIN_ZOOM = 0.25
const MAX_ZOOM = 2

// =========================================================================
// Props & Emits
// =========================================================================
const props = defineProps<{
  nodes: OutlineNode[]
  selectedNodeId: string
  chapters: SidebarChapterSummary[]
  chapterGraphs?: ChapterGraph[]
  assetSummaryByChapterId?: Record<string, WriterAssetSummary>
  currentChapterId?: string
  loading?: boolean
  canMoveUp?: (node: OutlineNode) => boolean
  canMoveDown?: (node: OutlineNode) => boolean
}>()

const emit = defineEmits<{
  (e: 'select', node: OutlineNode): void
  (e: 'editNode', node: OutlineNode): void
  (e: 'moveUp', node: OutlineNode): void
  (e: 'moveDown', node: OutlineNode): void
  (e: 'createChildNode', node: OutlineNode): void
  (e: 'deleteNode', node: OutlineNode): void
  (e: 'bindCurrentChapter', node: OutlineNode): void
  (e: 'unbindChapter', node: OutlineNode): void
  (e: 'updateStatus', node: OutlineNode, status: StructureStatusValue): void
  (e: 'openGraph', chapterId: string): void
  (e: 'jumpToChapter', chapterId: string): void
  (e: 'convertToChapter', node: OutlineNode, volumeNode: OutlineNode): void
}>()

// =========================================================================
// Canvas State
// =========================================================================
const panX = ref(40)
const panY = ref(40)
const zoom = ref(1)
const isPanning = ref(false)
const panStartX = ref(0)
const panStartY = ref(0)
const panOriginX = ref(0)
const panOriginY = ref(0)

// =========================================================================
// Node Editing State
// =========================================================================
const editingNodeId = ref('')
const editingTitle = ref('')
const editingInputRef = ref<HTMLInputElement[]>([])

// =========================================================================
// Context Menu State
// =========================================================================
const contextMenuRef = ref<InstanceType<typeof OutlineContextMenu> | null>(null)
const contextMenuVisible = ref(false)
const contextMenuNode = ref<OutlineNode | null>(null)

// =========================================================================
// Layout Computation
// =========================================================================
const layoutNodes = computed<LayoutNode[]>(() => {
  const result: LayoutNode[] = []
  let currentY = 0

  function layoutTree(node: OutlineNode, depth: number): number {
    const x = depth * (NODE_WIDTH + H_GAP)
    const y = currentY

    result.push({
      node,
      x,
      y,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    })

    const children = node.children || []
    if (children.length === 0) {
      currentY += NODE_HEIGHT + V_GAP
      return y
    }

    const childYs: number[] = []
    for (const child of children) {
      childYs.push(layoutTree(child, depth + 1))
    }

    // Center parent vertically among children
    const firstChildY = childYs[0]
    const lastChildY = childYs[childYs.length - 1]
    const centerChildY = (firstChildY + lastChildY) / 2

    // Update parent position to be centered
    const parentNode = result.find((item) => item.node.id === node.id)
    if (parentNode) {
      parentNode.y = centerChildY
    }

    return centerChildY
  }

  for (const rootNode of props.nodes) {
    layoutTree(rootNode, 0)
  }

  return result
})

const edges = computed<Edge[]>(() => {
  const result: Edge[] = []

  function collectEdges(parent: OutlineNode) {
    const children = parent.children || []
    for (const child of children) {
      const parentLayout = layoutNodes.value.find((item) => item.node.id === parent.id)
      const childLayout = layoutNodes.value.find((item) => item.node.id === child.id)
      if (parentLayout && childLayout) {
        const x1 = parentLayout.x + NODE_WIDTH
        const y1 = parentLayout.y + NODE_HEIGHT / 2
        const x2 = childLayout.x
        const y2 = childLayout.y + NODE_HEIGHT / 2
        const cx = (x1 + x2) / 2
        result.push({
          id: `${parent.id}-${child.id}`,
          path: `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`,
          isActive: props.selectedNodeId === parent.id || props.selectedNodeId === child.id,
        })
      }
      collectEdges(child)
    }
  }

  for (const rootNode of props.nodes) {
    collectEdges(rootNode)
  }

  return result
})

const svgWidth = computed(() => {
  if (!layoutNodes.value.length) return 0
  const maxX = Math.max(...layoutNodes.value.map((item) => item.x + item.width))
  return maxX + 200
})

const svgHeight = computed(() => {
  if (!layoutNodes.value.length) return 0
  const maxY = Math.max(...layoutNodes.value.map((item) => item.y + item.height))
  return maxY + 200
})

// =========================================================================
// Volume Nodes (for context menu "convert to chapter" feature)
// =========================================================================
const volumeNodes = computed<OutlineNode[]>(() => {
  return props.nodes.filter((node) => {
    const nodeWithType = node as OutlineNode & { type?: string }
    return !nodeWithType.type || nodeWithType.type === 'volume'
  })
})

const canConvertContextMenuNode = computed(() => {
  if (!contextMenuNode.value) return false
  const nodeWithType = contextMenuNode.value as OutlineNode & { type?: string }
  return Boolean(
    nodeWithType.type && nodeWithType.type !== 'volume' && nodeWithType.type !== 'chapter',
  )
})

// =========================================================================
// Visual Helpers
// =========================================================================
function nodeVisualType(node: OutlineNode): 'volume' | 'chapter' | 'other' {
  const nodeWithType = node as OutlineNode & { type?: string }
  if (nodeWithType.type === 'volume' || node.level === 1) return 'volume'
  if (nodeWithType.type === 'chapter' || (node.level && node.level === 2)) return 'chapter'
  return 'other'
}

function nodeIcon(node: OutlineNode): string {
  const type = nodeVisualType(node)
  if (type === 'volume') return 'Folder'
  if (type === 'chapter') return 'Document'
  return 'Note'
}

// =========================================================================
// Canvas Pan / Zoom
// =========================================================================
function handleWheel(event: WheelEvent) {
  const delta = event.deltaY > 0 ? -0.08 : 0.08
  zoom.value = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom.value + delta))
}

function zoomIn() {
  zoom.value = Math.min(MAX_ZOOM, zoom.value + 0.15)
}

function zoomOut() {
  zoom.value = Math.max(MIN_ZOOM, zoom.value - 0.15)
}

function resetView() {
  panX.value = 40
  panY.value = 40
  zoom.value = 1
}

function handleCanvasMouseDown(event: MouseEvent) {
  // Left button on empty space = pan
  if (event.button === 0 && event.target === event.currentTarget) {
    isPanning.value = true
    panStartX.value = event.clientX
    panStartY.value = event.clientY
    panOriginX.value = panX.value
    panOriginY.value = panY.value
  }
}

function handleCanvasMouseMove(event: MouseEvent) {
  if (!isPanning.value) return
  const dx = event.clientX - panStartX.value
  const dy = event.clientY - panStartY.value
  panX.value = panOriginX.value + dx
  panY.value = panOriginY.value + dy
}

function handleCanvasMouseUp() {
  isPanning.value = false
}

// =========================================================================
// Node Interactions
// =========================================================================
function handleNodeClick(node: OutlineNode) {
  emit('select', node)
}

function handleNodeDoubleClick(node: OutlineNode) {
  editingNodeId.value = node.id
  editingTitle.value = node.title || ''

  nextTick(() => {
    const inputEl = editingInputRef.value?.[0]
    if (inputEl) {
      inputEl.focus()
      inputEl.select()
    }
  })
}

function commitEdit() {
  if (!editingNodeId.value) return
  const title = editingTitle.value.trim()
  if (!title) {
    cancelEdit()
    return
  }

  const node = findNode(editingNodeId.value)
  if (node && node.title !== title) {
    emit('editNode', node)
  }

  editingNodeId.value = ''
  editingTitle.value = ''
}

function cancelEdit() {
  editingNodeId.value = ''
  editingTitle.value = ''
}

function handleDeleteNode(node: OutlineNode) {
  emit('deleteNode', node)
}

// =========================================================================
// Context Menu
// =========================================================================
function handleNodeContextMenu(node: OutlineNode, event: MouseEvent) {
  contextMenuNode.value = node
  contextMenuVisible.value = true

  nextTick(() => {
    contextMenuRef.value?.show(event.clientX, event.clientY)
  })
}

function canMoveUpNode(node: OutlineNode): boolean {
  return props.canMoveUp?.(node) ?? false
}

function canMoveDownNode(node: OutlineNode): boolean {
  return props.canMoveDown?.(node) ?? false
}

function handleContextMenuCreateChild() {
  if (!contextMenuNode.value) return
  emit('createChildNode', contextMenuNode.value)
  contextMenuVisible.value = false
}

function handleContextMenuMoveUp() {
  if (!contextMenuNode.value) return
  emit('moveUp', contextMenuNode.value)
  contextMenuVisible.value = false
}

function handleContextMenuMoveDown() {
  if (!contextMenuNode.value) return
  emit('moveDown', contextMenuNode.value)
  contextMenuVisible.value = false
}

function handleContextMenuEdit() {
  if (!contextMenuNode.value) return
  emit('editNode', contextMenuNode.value)
  contextMenuVisible.value = false
}

function handleContextMenuDelete() {
  if (!contextMenuNode.value) return
  emit('deleteNode', contextMenuNode.value)
  contextMenuVisible.value = false
}

function handleConvertToChapter(volumeNode: OutlineNode) {
  if (!contextMenuNode.value) return
  emit('convertToChapter', contextMenuNode.value, volumeNode)
  contextMenuVisible.value = false
}

// =========================================================================
// Helpers
// =========================================================================
function findNode(nodeId: string): OutlineNode | null {
  function walk(nodes: OutlineNode[]): OutlineNode | null {
    for (const node of nodes) {
      if (node.id === nodeId) return node
      if (node.children?.length) {
        const found = walk(node.children)
        if (found) return found
      }
    }
    return null
  }
  return walk(props.nodes)
}

// Close context menu on click outside
watch(contextMenuVisible, (visible) => {
  if (visible) {
    document.addEventListener('click', closeContextMenuOnOutsideClick, { once: true })
  }
})

function closeContextMenuOnOutsideClick() {
  contextMenuVisible.value = false
}
</script>

<style scoped lang="scss">
.canvas-outline-board {
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  border: 1px solid rgba(91, 72, 50, 0.14);
  background:
    radial-gradient(circle at 8% 0%, rgba(91, 72, 50, 0.08), transparent 30%),
    linear-gradient(180deg, rgba(255, 252, 249, 0.99), rgba(245, 238, 226, 0.96));
  box-shadow: 0 18px 34px rgba(80, 49, 26, 0.06);
  overflow: hidden;
}

/* Header */
.canvas-outline-board__header {
  padding: 18px 18px 14px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgba(91, 72, 50, 0.1);
  flex-shrink: 0;
}

.canvas-outline-board__eyebrow {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #8f3f2f;
  font-weight: 800;
}

.canvas-outline-board__title {
  margin: 6px 0 0;
  font-size: 22px;
  color: #2e2b27;
}

.canvas-outline-board__hint {
  max-width: 320px;
  color: #74675d;
  font-size: 13px;
  line-height: 1.5;
}

.canvas-outline-board__zoom {
  display: flex;
  align-items: center;
  gap: 6px;
}

.canvas-zoom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(117, 93, 67, 0.16)) 72%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--editor-layer-panel, #fffcf7) 94%, transparent);
  color: var(--editor-text-secondary, #5f5348);
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: var(--editor-layer-soft, #ffffff);
    border-color: color-mix(in srgb, var(--editor-accent, #8f3f2f) 26%, transparent);
    color: var(--editor-accent, #8f3f2f);
  }
}

.canvas-zoom-btn--reset {
  width: auto;
  padding: 0 8px;
}

.canvas-zoom-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--editor-text-muted, #74675d);
  min-width: 40px;
  text-align: center;
}

/* Canvas Container */
.canvas-outline-board__container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.canvas-outline-board__world {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}

/* SVG Connections */
.canvas-outline-board__connections {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 0;
}

.canvas-connection {
  stroke: color-mix(in srgb, var(--editor-accent, #8f3f2f) 22%, transparent);
  transition: stroke 0.2s;

  &--active {
    stroke: color-mix(in srgb, var(--editor-accent, #8f3f2f) 48%, transparent);
  }
}

/* Node Styles */
.canvas-node {
  position: absolute;
  width: 200px;
  min-height: 56px;
  border: 1.5px solid color-mix(in srgb, var(--editor-border, rgba(117, 93, 67, 0.16)) 72%, transparent);
  border-radius: 16px;
  background: color-mix(in srgb, var(--editor-layer-panel, #fffcf8) 96%, transparent);
  padding: 10px 12px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
  z-index: 1;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--editor-shadow-md, 0 8px 20px rgba(80, 49, 26, 0.1));
    border-color: color-mix(in srgb, var(--editor-accent, #8f3f2f) 28%, transparent);
  }

  &.is-selected {
    border-color: color-mix(in srgb, var(--editor-accent, #8f3f2f) 54%, transparent);
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--editor-accent-soft, #fff7ed) 82%, transparent),
      color-mix(in srgb, var(--editor-layer-strong, #f6e0c7) 88%, transparent)
    );
    box-shadow: var(--editor-shadow-lg, 0 12px 28px rgba(99, 60, 30, 0.12));
  }

  &.is-editing {
    border-color: #32536a;
    box-shadow: 0 0 0 3px rgba(50, 83, 106, 0.12);
  }

  /* Volume type */
  &.canvas-node--volume {
    border-left: 3px solid #3b82f6;

    .canvas-node__icon {
      color: #3b82f6;
      background: rgba(59, 130, 246, 0.08);
    }

    .canvas-node__level {
      background: rgba(59, 130, 246, 0.08);
      color: #3b82f6;
    }
  }

  /* Chapter type */
  &.canvas-node--chapter {
    border-left: 3px solid #22c55e;

    .canvas-node__icon {
      color: #22c55e;
      background: rgba(34, 197, 94, 0.08);
    }

    .canvas-node__level {
      background: rgba(34, 197, 94, 0.08);
      color: #22c55e;
    }
  }

  /* Other type */
  &.canvas-node--other {
    border-left: 3px solid #9ca3af;

    .canvas-node__icon {
      color: #9ca3af;
      background: rgba(156, 163, 175, 0.08);
    }

    .canvas-node__level {
      background: rgba(156, 163, 175, 0.08);
      color: #9ca3af;
    }
  }
}

.canvas-node__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  margin-top: 2px;
}

.canvas-node__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.canvas-node__level {
  display: inline-flex;
  width: fit-content;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.canvas-node__title {
  font-size: 13px;
  font-weight: 700;
  color: var(--editor-text-primary, #2f2b26);
  line-height: 1.35;
  word-break: break-word;
}

.canvas-node__input {
  width: 100%;
  padding: 2px 6px;
  border: 1px solid rgba(50, 83, 106, 0.3);
  border-radius: 6px;
  background: var(--editor-layer-panel, var(--editor-bg-base, #ffffff));
  font-size: 13px;
  font-weight: 700;
  color: var(--editor-text-primary, #2f2b26);
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: #32536a;
    box-shadow: 0 0 0 2px rgba(50, 83, 106, 0.1);
  }
}

.canvas-node__actions {
  position: absolute;
  bottom: -14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  padding: 3px 6px;
  border-radius: 999px;
  border: 1px solid rgba(143, 63, 47, 0.14);
  background: var(--editor-layer-panel, #ffffff);
  box-shadow: var(--editor-shadow-sm, 0 4px 12px rgba(80, 49, 26, 0.1));
  z-index: 2;
}

.canvas-node__action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--editor-text-muted, #74675d);
  cursor: pointer;
  transition: all 0.12s;

  &:hover {
    background: rgba(143, 63, 47, 0.08);
    color: var(--editor-accent, #8f3f2f);
  }

  &--primary {
    color: #32536a;

    &:hover {
      background: rgba(50, 83, 106, 0.08);
      color: #32536a;
    }
  }

  &--danger {
    &:hover {
      background: rgba(239, 68, 68, 0.08);
      color: #ef4444;
    }
  }
}

/* Empty state */
.canvas-outline-board__empty {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 18px;
  border: 2px dashed rgba(143, 63, 47, 0.15);
  background: color-mix(in srgb, var(--editor-layer-panel, #fffbf7) 78%, transparent);
  padding: 32px;
  text-align: center;
  color: #8a7e74;

  p {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 700;
    color: #5f5348;
  }

  span {
    font-size: 13px;
  }

  &--loading {
    border-style: solid;
    border-color: rgba(50, 83, 106, 0.18);
    background: color-mix(in srgb, var(--editor-layer-soft, rgba(235, 244, 249, 0.92)) 94%, transparent);
    color: #32536a;
    font-size: 13px;
  }
}

@media (max-width: 960px) {
  .canvas-outline-board__header {
    flex-direction: column;
  }
}
</style>
