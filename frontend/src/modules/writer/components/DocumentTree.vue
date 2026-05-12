<template>
  <div class="flex h-full min-h-0 flex-col bg-[var(--editor-bg-surface)] text-[var(--editor-text-primary)]">
    <div class="border-b border-[var(--editor-border)] px-3 pb-2 pt-3">
      <div class="mb-2 flex items-center justify-between gap-3">
        <span class="text-sm font-semibold tracking-[0.01em] text-[var(--editor-text-primary)]">
          目录
        </span>

        <div class="flex items-center gap-1.5">
          <button
            v-if="!isMultiSelectMode"
            type="button"
            title="多选模式"
            class="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
            @click="toggleMultiSelectMode"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </button>
          <button
            v-else
            type="button"
            title="退出多选"
            class="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 transition hover:border-blue-300 hover:bg-blue-100"
            @click="toggleMultiSelectMode"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <button
            type="button"
            title="展开/折叠全部"
            class="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
            @click="toggleExpand"
          >
            <QyIcon name="Sort" />
          </button>

          <button
            type="button"
            title="新建文档"
            class="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600 transition hover:border-amber-300 hover:bg-amber-100"
            @click="emit('add')"
          >
            <QyIcon name="Plus" />
          </button>
        </div>
      </div>

      <QyInput v-model="filterText" placeholder="搜索文档..." size="sm" clearable />
    </div>

    <div
      v-if="isMultiSelectMode"
      class="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2"
    >
      <div class="flex items-center gap-1.5 text-xs text-slate-500">
        <span>已选择</span>
        <span
          class="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-100 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700"
        >
          {{ selectionCount }}
        </span>
        <span>个文档</span>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="hasSelection"
          type="button"
          class="rounded-lg bg-rose-500 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-rose-600"
          @click="handleBatchDelete"
        >
          批量删除
        </button>
        <button
          v-if="hasSelection"
          type="button"
          class="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          @click="clearSelection"
        >
          取消选择
        </button>
      </div>
    </div>

    <div
      class="flex-1 overflow-y-auto px-2 py-2"
      role="tree"
      aria-label="文档目录"
      @click.right.prevent
      @click="handleTreeClick"
    >
      <template v-if="visibleTreeNodes.length > 0">
        <div
          v-for="node in visibleTreeNodes"
          :key="node.doc.id"
          class="py-0.5"
          :data-node-id="node.doc.id"
        >
          <div
            class="tree-node-row group relative flex min-h-9 items-center gap-2 rounded-xl px-2 py-1.5 text-sm transition"
            :class="getTreeNodeClasses(node)"
            :style="{ paddingLeft: `${12 + node.depth * 18}px` }"
            :draggable="true"
            role="treeitem"
            :aria-expanded="node.hasChildren ? node.expanded : undefined"
            :aria-selected="isTreeNodeSelected(node.doc.id)"
            @click="handleNodeClick(node.doc, $event)"
            @contextmenu.prevent="handleContextMenu($event, node.doc)"
            @dragstart="handleDragStart(node.doc, $event)"
            @dragend="handleDragEnd"
            @dragover="handleDragOver(node.doc, $event)"
            @drop="handleDrop(node.doc, $event)"
          >
            <button
              v-if="node.hasChildren"
              type="button"
              class="inline-flex h-5 w-5 flex-none items-center justify-center rounded-md text-slate-400 transition hover:bg-white/80 hover:text-slate-600"
              :aria-label="node.expanded ? '折叠节点' : '展开节点'"
              @click.stop="toggleNodeExpand(node.doc.id)"
            >
              <svg
                class="h-3.5 w-3.5 transition-transform"
                :class="node.expanded ? 'rotate-90' : ''"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.21 14.77a.75.75 0 0 1 .02-1.06L10.94 10 7.23 6.29a.75.75 0 1 1 1.06-1.06l4.24 4.24a.75.75 0 0 1 0 1.06l-4.24 4.24a.75.75 0 0 1-1.08 0Z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <span v-else class="inline-flex h-5 w-5 flex-none"></span>

            <input
              v-if="isMultiSelectMode"
              :checked="isSelected(node.doc.id)"
              type="checkbox"
              class="h-4 w-4 flex-none rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              @click.stop="toggleSelection(node.doc.id, $event)"
            />

            <span class="tree-node-icon flex h-5 w-5 flex-none items-center justify-center">
              <svg
                v-if="node.doc.type === 'volume'"
                class="h-4 w-4 text-amber-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
              </svg>
              <svg
                v-else
                class="h-4 w-4 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </span>

            <span class="min-w-0 flex-1 truncate text-[13px]" :title="node.doc.title">
              {{ node.doc.title }}
              <span v-if="isModified(node.doc)" class="ml-1 font-semibold text-rose-500">*</span>
            </span>

            <span
              v-if="node.doc.wordCount"
              class="ml-2 flex-none text-[11px] font-medium text-slate-400"
            >
              {{ formatCount(node.doc.wordCount) }}
            </span>
          </div>
        </div>
      </template>

      <div
        v-else
        class="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 text-center text-sm text-slate-400"
      >
        {{ filterText.trim() ? '没有匹配的文档' : '暂无文档，点击右上角新建' }}
      </div>
    </div>

    <BatchOperationConfirmDialog
      v-model="showConfirmDialog"
      :operation-type="pendingOperationType"
      :selected-count="selectionCount"
      @confirm="executeBatchOperation"
    />

    <BatchOperationProgressDialog
      v-model:visible="showProgressDialog"
      :operation-id="activeOperationId"
      @complete="handleOperationComplete"
    />

    <teleport to="body">
      <div
        v-show="contextMenu.visible"
        class="fixed z-[9999] min-w-36 rounded-xl border border-slate-200 bg-white/95 py-1.5 shadow-xl shadow-slate-900/10 backdrop-blur"
        :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
        @click.stop
      >
        <button
          type="button"
          class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          @click="handleMenuAction('add')"
        >
          <QyIcon name="Plus" />
          <span>新建子文档</span>
        </button>
        <button
          type="button"
          class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          @click="handleMenuAction('rename')"
        >
          <QyIcon name="Edit" />
          <span>重命名</span>
        </button>
        <div class="my-1 h-px bg-slate-100"></div>
        <button
          type="button"
          class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-rose-500 transition hover:bg-rose-50"
          @click="handleMenuAction('delete')"
        >
          <QyIcon name="Delete" />
          <span>删除</span>
        </button>
      </div>
    </teleport>

    <div
      v-if="contextMenu.visible"
      class="fixed inset-0 z-[9998]"
      @click="closeContextMenu"
      @contextmenu.prevent="closeContextMenu"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { messageBox, message } from '@/design-system/services'
import { QyIcon, QyInput } from '@/design-system/components'
import type { Document } from '@/modules/writer/types/document'
import { useDocumentSelection } from '../composables/useDocumentSelection'
import { useBatchOperationStore } from '../stores/batchOperationStore'
import { useDocumentStore } from '../stores/documentStore'
import { duplicateDocument, moveDocument } from '../api/document'
import BatchOperationConfirmDialog from './BatchOperationConfirmDialog.vue'
import BatchOperationProgressDialog from './BatchOperationProgressDialog.vue'

type DropType = 'inner' | 'before' | 'after' | ''

interface DragData {
  kind: 'documents'
  sourceProjectId: string
  ids: string[]
  mode: 'copy' | 'move'
}

interface DragState {
  isCopy: boolean
  draggedNodeId: string
  sourceProjectId: string
}

interface VisibleTreeNode {
  doc: Document
  depth: number
  hasChildren: boolean
  expanded: boolean
}

interface Props {
  treeData: Document[]
  currentDocumentId?: string
  projectId?: string
}

const props = withDefaults(defineProps<Props>(), {
  projectId: '',
})

const emit = defineEmits<{
  select: [doc: Document]
  drop: [dragId: string, dropId: string, type: DropType]
  add: [parent?: Document]
  rename: [doc: Document]
  delete: [doc: Document]
}>()

const {
  selectedIds,
  isSelected,
  selectionCount,
  hasSelection,
  toggleSelection,
  selectRange,
  clearSelection,
} = useDocumentSelection()

const flatDocs = computed(() => {
  const flatten = (docs: Document[]): Document[] => {
    const result: Document[] = []
    for (const doc of docs) {
      result.push(doc)
      if (doc.children?.length) {
        result.push(...flatten(doc.children))
      }
    }
    return result
  }

  return flatten(props.treeData)
})

const isMultiSelectMode = ref(false)
const filterText = ref('')
const expandedIds = ref<Set<string>>(new Set())
const dragState = ref<DragState | null>(null)
const dropIndicator = ref<{ targetId: string; type: Exclude<DropType, ''> } | null>(null)

watch(
  () => props.treeData,
  (nodes) => {
    const validIds = new Set(collectAllNodeIds(nodes))
    const nextExpandedIds = new Set(
      [...expandedIds.value].filter((nodeId) => validIds.has(nodeId)),
    )

    if (nextExpandedIds.size === 0) {
      for (const nodeId of collectExpandableIds(nodes, true)) {
        nextExpandedIds.add(nodeId)
      }
    }

    expandedIds.value = nextExpandedIds
  },
  { immediate: true, deep: true },
)

function toggleMultiSelectMode(): void {
  isMultiSelectMode.value = !isMultiSelectMode.value
  if (!isMultiSelectMode.value) {
    clearSelection()
  }
}

const normalizedFilterText = computed(() => filterText.value.trim().toLowerCase())

const filteredTreeData = computed(() => {
  if (!normalizedFilterText.value) {
    return props.treeData
  }

  return filterDocuments(props.treeData, normalizedFilterText.value)
})

const visibleTreeNodes = computed<VisibleTreeNode[]>(() => {
  const collector: VisibleTreeNode[] = []
  const expandAllForSearch = Boolean(normalizedFilterText.value)
  flattenVisibleNodes(filteredTreeData.value, collector, 0, expandAllForSearch)
  return collector
})

const allExpandableIds = computed(() => collectExpandableIds(props.treeData))

function collectAllNodeIds(nodes: Document[], collector: string[] = []): string[] {
  for (const node of nodes) {
    collector.push(node.id)
    if (node.children?.length) {
      collectAllNodeIds(node.children, collector)
    }
  }

  return collector
}

function collectExpandableIds(
  nodes: Document[],
  rootOnly = false,
  depth = 0,
  collector: string[] = [],
): string[] {
  for (const node of nodes) {
    if (node.children?.length) {
      if (!rootOnly || depth === 0) {
        collector.push(node.id)
      }
      collectExpandableIds(node.children, rootOnly, depth + 1, collector)
    }
  }

  return collector
}

function filterDocuments(nodes: Document[], keyword: string): Document[] {
  return nodes.reduce<Document[]>((result, node) => {
    const childMatches = node.children?.length ? filterDocuments(node.children, keyword) : []
    const selfMatches = node.title.toLowerCase().includes(keyword)

    if (selfMatches || childMatches.length > 0) {
      result.push({
        ...node,
        children: childMatches.length > 0 ? childMatches : undefined,
      })
    }

    return result
  }, [])
}

function flattenVisibleNodes(
  nodes: Document[],
  collector: VisibleTreeNode[],
  depth: number,
  expandAllForSearch: boolean,
): void {
  for (const doc of nodes) {
    const hasChildren = Boolean(doc.children?.length)
    const expanded = hasChildren && (expandAllForSearch || expandedIds.value.has(doc.id))

    collector.push({
      doc,
      depth,
      hasChildren,
      expanded,
    })

    if (hasChildren && expanded) {
      flattenVisibleNodes(doc.children ?? [], collector, depth + 1, expandAllForSearch)
    }
  }
}

function toggleNodeExpand(nodeId: string): void {
  const nextExpandedIds = new Set(expandedIds.value)

  if (nextExpandedIds.has(nodeId)) {
    nextExpandedIds.delete(nodeId)
  } else {
    nextExpandedIds.add(nodeId)
  }

  expandedIds.value = nextExpandedIds
}

function toggleExpand(): void {
  if (allExpandableIds.value.length === 0) {
    return
  }

  const shouldCollapse = allExpandableIds.value.every((nodeId) => expandedIds.value.has(nodeId))
  const nextExpandedIds = new Set(expandedIds.value)

  for (const nodeId of allExpandableIds.value) {
    if (shouldCollapse) {
      nextExpandedIds.delete(nodeId)
    } else {
      nextExpandedIds.add(nodeId)
    }
  }

  expandedIds.value = nextExpandedIds
}

function isTreeNodeSelected(nodeId: string): boolean {
  if (isMultiSelectMode.value) {
    return isSelected(nodeId)
  }

  return props.currentDocumentId === nodeId
}

function getTreeNodeClasses(node: VisibleTreeNode): Record<string, boolean> {
  const indicator = dropIndicator.value

  return {
    'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900':
      !isTreeNodeSelected(node.doc.id) && props.currentDocumentId !== node.doc.id,
    'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100':
      props.currentDocumentId === node.doc.id && !isMultiSelectMode.value,
    'bg-blue-50/80 text-blue-700 ring-1 ring-inset ring-blue-100':
      isMultiSelectMode.value && isSelected(node.doc.id),
    'tree-node-row--drop-before':
      indicator?.targetId === node.doc.id && indicator.type === 'before',
    'tree-node-row--drop-after':
      indicator?.targetId === node.doc.id && indicator.type === 'after',
    'tree-node-row--drop-inner':
      indicator?.targetId === node.doc.id && indicator.type === 'inner',
  }
}

function handleNodeClick(data: Document, event: MouseEvent): void {
  closeContextMenu()

  if (isMultiSelectMode.value) {
    if (event.shiftKey) {
      selectRange(data.id, flatDocs.value)
    } else {
      toggleSelection(data.id, event)
    }
    return
  }

  emit('select', data)
}

function handleTreeClick(event: MouseEvent): void {
  closeContextMenu()

  if (isMultiSelectMode.value && event.target === event.currentTarget) {
    clearSelection()
  }
}

function detectCopyMode(event: DragEvent): boolean {
  const isMac = navigator.platform.toUpperCase().includes('MAC')
  return isMac ? event.altKey : event.ctrlKey
}

function getValidProjectId(data: Document): string {
  const projectId = props.projectId || data.projectId

  if (!projectId) {
    throw new Error('projectId is required but not provided')
  }

  return projectId
}

function handleDragStart(data: Document, event: DragEvent): void {
  closeContextMenu()

  const isCopy = detectCopyMode(event)
  const sourceProjectId = getValidProjectId(data)

  dragState.value = {
    isCopy,
    draggedNodeId: data.id,
    sourceProjectId,
  }

  const payload: DragData = {
    kind: 'documents',
    sourceProjectId,
    ids: [data.id],
    mode: isCopy ? 'copy' : 'move',
  }

  if (event.dataTransfer) {
    const jsonData = JSON.stringify(payload)
    event.dataTransfer.effectAllowed = isCopy ? 'copy' : 'move'
    event.dataTransfer.setData('application/x-documents+json', jsonData)
    event.dataTransfer.setData('text/plain', jsonData)
  }
}

function handleDragEnd(): void {
  dragState.value = null
  dropIndicator.value = null
}

function resolveDropType(target: Document, event: DragEvent): Exclude<DropType, ''> {
  const currentTarget = event.currentTarget as HTMLElement | null

  if (!currentTarget) {
    return target.type === 'volume' ? 'inner' : 'after'
  }

  const { top, height } = currentTarget.getBoundingClientRect()
  const offsetY = event.clientY - top
  const ratio = height > 0 ? offsetY / height : 0.5

  if (ratio < 0.25) {
    return 'before'
  }

  if (ratio > 0.75) {
    return 'after'
  }

  if (target.type === 'volume') {
    return 'inner'
  }

  return ratio < 0.5 ? 'before' : 'after'
}

function findDocumentById(nodes: Document[], id: string): Document | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node
    }

    if (node.children?.length) {
      const childResult = findDocumentById(node.children, id)
      if (childResult) {
        return childResult
      }
    }
  }

  return null
}

function containsDescendant(node: Document, targetId: string): boolean {
  if (!node.children?.length) {
    return false
  }

  for (const child of node.children) {
    if (child.id === targetId || containsDescendant(child, targetId)) {
      return true
    }
  }

  return false
}

function handleDragOver(target: Document, event: DragEvent): void {
  const activeDragState = dragState.value
  if (!activeDragState) {
    return
  }

  const draggedDocument = findDocumentById(props.treeData, activeDragState.draggedNodeId)
  if (!draggedDocument) {
    return
  }

  if (draggedDocument.id === target.id || containsDescendant(draggedDocument, target.id)) {
    dropIndicator.value = null
    return
  }

  event.preventDefault()

  const type = resolveDropType(target, event)
  dropIndicator.value = { targetId: target.id, type }

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = activeDragState.isCopy ? 'copy' : 'move'
  }
}

async function handleDrop(target: Document, event: DragEvent): Promise<void> {
  const activeDragState = dragState.value
  if (!activeDragState) {
    return
  }

  event.preventDefault()

  const draggedDocument = findDocumentById(props.treeData, activeDragState.draggedNodeId)
  const type = dropIndicator.value?.targetId === target.id
    ? dropIndicator.value.type
    : resolveDropType(target, event)

  dropIndicator.value = null
  dragState.value = null

  if (!draggedDocument) {
    return
  }

  if (draggedDocument.id === target.id || containsDescendant(draggedDocument, target.id)) {
    return
  }

  await executeDragOperation(
    draggedDocument,
    target,
    type,
    activeDragState.isCopy ? 'copy' : 'move',
  )
}

async function executeDragOperation(
  dragData: Document,
  dropData: Document,
  type: Exclude<DropType, ''>,
  dragMode: 'copy' | 'move',
): Promise<void> {
  try {
    if (dragMode === 'copy') {
      await duplicateDocument(dragData.id, {
        targetParentId: type === 'inner' ? dropData.id : dropData.parentId,
        targetDocumentId: dropData.id,
        position: type,
        copyContent: true,
      })

      message.success(`已复制 "${dragData.title}" 到 "${dropData.title}"`, { duration: 2000 })
    } else {
      await moveDocument(dragData.id, {
        parentId: type === 'inner' ? dropData.id : dropData.parentId,
        order:
          type === 'inner'
            ? undefined
            : type === 'before'
              ? Number(dropData.order ?? 0)
              : Number(dropData.order ?? 0) + 1,
      })

      message.success(`已移动 "${dragData.title}" 到 "${dropData.title}"`, { duration: 2000 })
    }

    emit('drop', dragData.id, dropData.id, type)
  } catch (error) {
    console.error(`${dragMode === 'copy' ? 'Duplicate' : 'Move'} failed:`, error)

    message.error(`${dragMode === 'copy' ? '复制' : '移动'}失败: ${(error as Error).message}`, {
      duration: 3000,
    })

    await refreshTreeState(dragData.id)
  }
}

async function refreshTreeState(draggedNodeId = ''): Promise<void> {
  try {
    emit('drop', draggedNodeId, '', '')
  } catch (error) {
    console.error('Failed to refresh tree state:', error)
  }
}

const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  target: null as Document | null,
})

function handleContextMenu(event: MouseEvent, data: Document): void {
  contextMenu.visible = true
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
  contextMenu.target = data
}

function closeContextMenu(): void {
  contextMenu.visible = false
}

function handleMenuAction(action: 'add' | 'rename' | 'delete'): void {
  if (!contextMenu.target) {
    return
  }

  if (action === 'add') {
    emit('add', contextMenu.target)
  } else if (action === 'rename') {
    emit('rename', contextMenu.target)
  } else if (action === 'delete') {
    emit('delete', contextMenu.target)
  }

  closeContextMenu()
}

const batchOpStore = useBatchOperationStore()
const documentStore = useDocumentStore()
const showConfirmDialog = ref(false)
const showProgressDialog = ref(false)
const pendingOperationType = ref<'delete' | 'move' | 'export'>('delete')
const activeOperationId = ref<string | null>(null)

async function handleBatchDelete(): Promise<void> {
  pendingOperationType.value = 'delete'
  showConfirmDialog.value = true
}

async function executeBatchOperation(): Promise<void> {
  showConfirmDialog.value = false

  try {
    const operation = await batchOpStore.submit({
      projectId: props.treeData[0]?.projectId || '',
      type: pendingOperationType.value,
      targetIds: Array.from(selectedIds.value),
      atomic: true,
      includeDescendants: true,
    })

    activeOperationId.value = operation.batchId
    showProgressDialog.value = true

    clearSelection()
    isMultiSelectMode.value = false
  } catch (error) {
    messageBox.alert('批量操作提交失败：' + (error as Error).message, '错误')
  }
}

function handleOperationComplete(): void {
  showProgressDialog.value = false
  activeOperationId.value = null

  if (props.projectId) {
    documentStore.loadTree(props.projectId)
  }
}

function isModified(_data: Document): boolean {
  return false
}

function formatCount(count: number): string | number {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}w`
  }

  return count > 0 ? count : ''
}
</script>

<style scoped lang="scss">
.tree-node-row {
  user-select: none;

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 0.5rem;
    right: 0.5rem;
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms ease;
  }

  &::before {
    top: 0;
    border-top: 2px solid rgb(59 130 246 / 0.95);
  }

  &::after {
    bottom: 0;
    border-bottom: 2px solid rgb(59 130 246 / 0.95);
  }
}

.tree-node-row--drop-before::before {
  opacity: 1;
}

.tree-node-row--drop-after::after {
  opacity: 1;
}

.tree-node-row--drop-inner {
  background: rgb(239 246 255 / 0.95) !important;
  box-shadow: inset 0 0 0 1px rgb(147 197 253 / 0.9);
}

.tree-node-icon :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
