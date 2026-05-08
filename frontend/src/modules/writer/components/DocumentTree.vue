<template>
  <div class="document-tree-container">
    <!-- 顶部工具栏：标题 + 搜索 + 添加 -->
    <div class="tree-toolbar">
      <div class="header-row">
        <span class="title">目录</span>
        <div class="actions">
          <!-- 多选模式切换按钮 -->
          <button
            v-if="!isMultiSelectMode"
            type="button"
            class="icon-button"
            title="多选模式"
            @click="toggleMultiSelectMode"
          >
            <svg class="toolbar-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            class="icon-button icon-button--active"
            title="退出多选"
            @click="toggleMultiSelectMode"
          >
            <svg class="toolbar-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <el-tooltip content="展开/折叠全部">
            <el-button link size="small" @click="toggleExpand">
              <QyIcon name="Sort" />
            </el-button>
          </el-tooltip>
          <el-tooltip content="新建文档">
            <el-button link type="primary" size="small" @click="emit('add')">
              <QyIcon name="Plus" />
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <div class="search-row">
        <el-input v-model="filterText" placeholder="搜索文档..." size="small" clearable />
      </div>
    </div>

    <!-- 多选模式提示栏 -->
    <div v-if="isMultiSelectMode" class="multi-select-hint">
      <div class="hint-left">
        <span class="hint-text">已选择</span>
        <span class="hint-count">{{ selectionCount }}</span>
        <span class="hint-text">个文档</span>
      </div>
      <div class="hint-actions">
        <button
          v-if="hasSelection"
          type="button"
          class="hint-btn hint-btn--danger"
          @click="handleBatchDelete"
        >
          批量删除
        </button>
        <button v-if="hasSelection" type="button" class="hint-btn" @click="clearSelection">
          取消选择
        </button>
      </div>
    </div>

    <!-- 树形控件 -->
    <div class="tree-content" @click.right.prevent @click="handleTreeClick">
      <el-tree
        ref="treeRef"
        :data="treeData"
        node-key="id"
        :props="treeProps"
        :highlight-current="!isMultiSelectMode"
        :expand-on-click-node="false"
        :default-expanded-keys="defaultExpandedKeys"
        :filter-node-method="filterNode"
        :allow-drop="allowDrop"
        :allow-drag="allowDrag"
        draggable
        empty-text="暂无文档，点击右上角新建"
        @node-click="handleNodeClick"
        @node-drop="handleNodeDrop"
        @node-drag-start="handleDragStart"
        @node-contextmenu="handleContextMenu"
      >
        <template #default="{ data }">
          <div
            class="custom-tree-node"
            :class="{
              'is-selected': isSelected(data.id),
              'is-multi-select-mode': isMultiSelectMode,
            }"
          >
            <!-- 多选复选框 -->
            <input
              v-if="isMultiSelectMode"
              type="checkbox"
              class="multi-select-checkbox"
              :checked="isSelected(data.id)"
              @click.stop="toggleSelection(data.id, $event)"
            />

            <!-- 图标区分：卷用文件夹，章用文档 -->
            <el-icon class="node-icon" :class="data.type">
              <QyIcon name="Folder" v-if="data.type === 'volume'" />
              <DocumentIcon v-else />
            </el-icon>

            <span class="node-title" :title="data.title">
              {{ data.title }}
              <span v-if="isModified(data)" class="dirty-dot">*</span>
            </span>

            <!-- 右侧信息：字数或状态 -->
            <span class="node-meta" v-if="data.wordCount">
              {{ formatCount(data.wordCount) }}
            </span>
          </div>
        </template>
      </el-tree>
    </div>

    <!-- 批量操作确认对话框 -->
    <BatchOperationConfirmDialog
      v-model="showConfirmDialog"
      :operation-type="pendingOperationType"
      :selected-count="selectionCount"
      @confirm="executeBatchOperation"
    />

    <!-- 批量操作进度对话框 -->
    <BatchOperationProgressDialog
      v-model:visible="showProgressDialog"
      :operation-id="activeOperationId"
      @complete="handleOperationComplete"
    />

    <!-- 自定义右键菜单 (Teleport 到 body 防止被遮挡) -->
    <teleport to="body">
      <div
        v-show="contextMenu.visible"
        class="custom-context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
        @click.stop
      >
        <div class="menu-item" @click="handleMenuAction('add')">
          <QyIcon name="Plus" /> 新建子文档
        </div>
        <div class="menu-item" @click="handleMenuAction('rename')">
          <QyIcon name="Edit" /> 重命名
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item danger" @click="handleMenuAction('delete')">
          <QyIcon name="Delete" /> 删除
        </div>
      </div>
    </teleport>

    <!-- 用于点击外部关闭右键菜单的透明遮罩 -->
    <div
      v-if="contextMenu.visible"
      class="context-menu-mask"
      @click="closeContextMenu"
      @contextmenu.prevent="closeContextMenu"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed } from 'vue'
import { ElTree } from 'element-plus'
import { messageBox, message } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import type { Document } from '@/modules/writer/types/document'
import { useDocumentSelection } from '../composables/useDocumentSelection'
import { useBatchOperationStore } from '../stores/batchOperationStore'
import { useDocumentStore } from '../stores/documentStore'
import { duplicateDocument, moveDocument } from '../api/document'
import BatchOperationConfirmDialog from './BatchOperationConfirmDialog.vue'
import BatchOperationProgressDialog from './BatchOperationProgressDialog.vue'

// DocumentIcon 组件定义
const DocumentIcon = {
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
}

// 拖拽数据类型定义
interface DragData {
  kind: 'documents'
  sourceProjectId: string
  ids: string[]
  mode: 'copy' | 'move'
}

// 使用标准的 Document 类型
interface Props {
  treeData: Document[]
  currentDocumentId?: string
  projectId?: string // 添加 projectId 以支持拖拽复制
}

const props = withDefaults(defineProps<Props>(), {
  projectId: '',
})

const emit = defineEmits<{
  select: [doc: Document]
  drop: [dragId: string, dropId: string, type: 'inner' | 'before' | 'after' | '']
  add: [parent?: Document]
  rename: [doc: Document]
  delete: [doc: Document]
}>()

// =======================
// 选择状态管理
// =======================
const {
  selectedIds,
  isSelected,
  selectionCount,
  hasSelection,
  toggleSelection,
  selectRange,
  clearSelection,
} = useDocumentSelection()

// 扁平化文档列表（用于范围选择）
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

// 多选模式
const isMultiSelectMode = ref(false)

function toggleMultiSelectMode(): void {
  isMultiSelectMode.value = !isMultiSelectMode.value
  if (!isMultiSelectMode.value) {
    clearSelection()
  }
}

// 树引用
const treeRef = ref<InstanceType<typeof ElTree>>()
const filterText = ref('')

// 树配置
const treeProps = {
  children: 'children',
  label: 'title',
}

// 默认展开
const defaultExpandedKeys = ref<string[]>([])

// 监听搜索
watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

// 过滤节点逻辑
const filterNode = (value: string, data: any): boolean => {
  if (!value) return true
  return (
    'title' in data &&
    typeof data.title === 'string' &&
    data.title.toLowerCase().includes(value.toLowerCase())
  )
}

// =======================
// 拖拽逻辑控制
// =======================

// 允许拖拽：所有节点都可拖拽
const allowDrag = (_node: any) => true

// 允许放置：
// 1. 'inner': 只能放入 'volume' (卷/文件夹) 类型，不能放入 'chapter' (章)
// 2. 'prev'/'next': 同级排序始终允许
const allowDrop = (_draggingNode: any, dropNode: any, type: string) => {
  const dropData = dropNode.data as Document
  if (type === 'inner') {
    return dropData.type === 'volume'
  }
  return true
}

// =======================
// 拖拽复制功能
// =======================

/**
 * 拖拽状态接口
 */
interface DragState {
  isCopy: boolean
  draggedNodeId: string
  sourceProjectId: string
}

// 组件级拖拽状态（可靠的数据源）
const dragState = ref<DragState | null>(null)

/**
 * 检测复制模式
 * Mac: Option键, Windows: Ctrl键
 */
function detectCopyMode(event: DragEvent): boolean {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  return isMac ? event.altKey : event.ctrlKey
}

/**
 * 获取有效的项目ID
 * 优先使用props.projectId,其次使用data.projectId
 * 如果都不存在,抛出错误
 */
function getValidProjectId(data: Document): string {
  const projectId = props.projectId || data.projectId

  if (!projectId) {
    throw new Error('projectId is required but not provided')
  }

  return projectId
}

/**
 * 处理拖拽开始事件
 * 设置拖拽数据和效果
 */
// el-tree node-drag-start 事件签名: (node, evt)
const handleDragStart = (node: any, evt: DragEvent) => {
  const isCopy = detectCopyMode(evt)
  const data = node.data as Document

  // 获取有效的projectId
  const sourceProjectId = getValidProjectId(data)

  // 保存到组件状态（可靠）
  dragState.value = {
    isCopy,
    draggedNodeId: data.id,
    sourceProjectId,
  }

  const payload: DragData = {
    kind: 'documents',
    sourceProjectId: sourceProjectId,
    ids: [data.id],
    mode: isCopy ? 'copy' : 'move',
  }

  // 设置拖拽效果
  evt.dataTransfer!.effectAllowed = isCopy ? 'copy' : 'move'

  // 设置拖拽数据（用于跨组件/跨窗口拖拽）
  const jsonData = JSON.stringify(payload)
  evt.dataTransfer!.setData('application/x-documents+json', jsonData)
  evt.dataTransfer!.setData('text/plain', jsonData) // 兼容性
}

// =======================
// 事件处理
// =======================

// el-tree node-click 事件签名: (data, node, nodeInstance, evt)
const handleNodeClick = (data: Document, _node: any, _nodeInstance: any, evt: MouseEvent) => {
  if (isMultiSelectMode.value) {
    // 多选模式
    if (evt && evt.shiftKey) {
      // Shift+点击：范围选择
      selectRange(data.id, flatDocs.value)
    } else {
      // Ctrl/Cmd+点击或普通点击：切换选择
      toggleSelection(data.id, evt || null)
    }
  } else {
    // 普通模式：选中并打开文档
    emit('select', data)
  }
}

// 树点击空白处取消选择
function handleTreeClick(event: MouseEvent): void {
  if (isMultiSelectMode.value && event.target === event.currentTarget) {
    clearSelection()
  }
}

// el-tree node-drop 事件签名: (dragNode, dropNode, type, evt)
const handleNodeDrop = async (
  dragNode: any,
  dropNode: any,
  type: 'inner' | 'before' | 'after',
  evt?: DragEvent,
) => {
  const dragData = dragNode.data as Document
  const dropData = dropNode.data as Document

  // 优先使用组件状态（可靠）
  let dragMode: 'copy' | 'move' = 'move'

  if (dragState.value) {
    // 使用组件状态
    dragMode = dragState.value.isCopy ? 'copy' : 'move'
  } else if (evt?.dataTransfer) {
    // 如果没有状态，尝试从 dataTransfer 获取（跨组件拖拽）
    try {
      const dragDataJson = evt.dataTransfer.getData('application/x-documents+json')
      if (dragDataJson) {
        const dragPayload: DragData = JSON.parse(dragDataJson)
        dragMode = dragPayload.mode
      }
    } catch (e) {
      console.warn('Failed to parse drag data from dataTransfer:', e)
    }
  }

  // 清除拖拽状态
  dragState.value = null

  // 执行拖拽操作
  await executeDragOperation(dragData, dropData, type, dragMode)
}

/**
 * 执行拖拽操作（复制或移动）
 * 处理API调用和错误恢复
 */
async function executeDragOperation(
  dragData: Document,
  dropData: Document,
  type: 'inner' | 'before' | 'after',
  dragMode: 'copy' | 'move',
): Promise<void> {
  try {
    if (dragMode === 'copy') {
      // 复制模式：调用 duplicate API
      await duplicateDocument(dragData.id, {
        targetParentId: dropData.id,
        position: type,
        copyContent: true,
      })

      message.success(`已复制 "${dragData.title}" 到 "${dropData.title}"`, { duration: 2000 })
    } else {
      // 移动模式：调用 move API
      const newParentId = type === 'inner' ? dropData.id : dropData.parentId

      await moveDocument(dragData.id, {
        parentId: newParentId,
      })

      message.success(`已移动 "${dragData.title}" 到 "${dropData.title}"`, { duration: 2000 })
    }

    // API调用成功后，触发刷新事件
    emit('drop', dragData.id, dropData.id, type)
  } catch (error) {
    console.error(`${dragMode === 'copy' ? 'Duplicate' : 'Move'} failed:`, error)

    message.error(`${dragMode === 'copy' ? '复制' : '移动'}失败: ${(error as Error).message}`, {
      duration: 3000,
    })

    // API失败后，刷新树节点以同步后端状态
    // 这会撤销ElTree的默认UI更新
    await refreshTreeState()
  }
}

/**
 * 刷新树状态以同步后端状态
 * 用于API失败后的状态恢复
 */
async function refreshTreeState(): Promise<void> {
  try {
    // 触发drop事件但不传递参数，让父组件重新加载整个树
    emit('drop', dragState.value?.draggedNodeId || '', '', '')
  } catch (error) {
    console.error('Failed to refresh tree state:', error)
  }
}

// =======================
// 右键菜单逻辑
// =======================

const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  target: null as Document | null,
})

// el-tree node-contextmenu 事件签名: (evt, data, node, nodeInstance)
const handleContextMenu = (evt: Event, data: Document, _node: any, _nodeInstance: any) => {
  contextMenu.visible = true
  const mouseEvent = evt as MouseEvent
  contextMenu.x = mouseEvent.clientX
  contextMenu.y = mouseEvent.clientY
  contextMenu.target = data
}

const closeContextMenu = () => {
  contextMenu.visible = false
}

const handleMenuAction = (action: 'add' | 'rename' | 'delete') => {
  if (!contextMenu.target) return
  if (action === 'add') {
    emit('add', contextMenu.target)
  } else if (action === 'rename') {
    emit('rename', contextMenu.target)
  } else if (action === 'delete') {
    emit('delete', contextMenu.target)
  }
  closeContextMenu()
}

// =======================
// 批量操作
// =======================
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

    // 清除选择
    clearSelection()
    isMultiSelectMode.value = false
  } catch (error) {
    messageBox.alert('批量操作提交失败：' + (error as Error).message, '错误')
  }
}

function handleOperationComplete(): void {
  showProgressDialog.value = false
  activeOperationId.value = null
  // 刷新文档树
  if (props.projectId) {
    documentStore.loadTree(props.projectId)
  }
}

// =======================
// 辅助功能
// =======================

// 展开/折叠全部
const toggleExpand = () => {
  const nodes = treeRef.value?.store.nodesMap
  if (!nodes) return

  // 取当前第一个节点的状态来反转
  const firstKey = Object.keys(nodes)[0]
  const isExpanded = nodes[firstKey]?.expanded

  for (const key in nodes) {
    nodes[key].expanded = !isExpanded
  }
}

// 判断是否有未保存修改 (需配合 Store 状态，这里仅作演示)
const isModified = (_data: Document) => {
  // return data.id === currentEditingId && isDirty
  return false
}

const formatCount = (count: number) => {
  if (count >= 10000) return (count / 10000).toFixed(1) + 'w'
  return count > 0 ? count : ''
}
</script>

<style scoped lang="scss">
.document-tree-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);

  .tree-toolbar {
    padding: 12px 12px 8px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .title {
        font-weight: 600;
        font-size: 14px;
        color: var(--el-text-color-primary);
      }
    }
  }

  .tree-content {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;

    // 隐藏横向滚动条
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--el-border-color);
      border-radius: 3px;
    }
  }
}

.actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-button {
  width: 28px;
  height: 28px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: #fff;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.icon-button--active {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}

.toolbar-icon-svg {
  width: 14px;
  height: 14px;
}

.multi-select-hint {
  padding: 8px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hint-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.hint-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.hint-text {
  font-size: 12px;
  color: #64748b;
}

.hint-count {
  min-width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

.hint-btn {
  height: 28px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #fff;
  color: #475569;
  padding: 0 10px;
  font-size: 12px;
  cursor: pointer;
}

.hint-btn--danger {
  color: #fff;
  background: #ef4444;
  border-color: #ef4444;
}

.multi-select-checkbox {
  width: 14px;
  height: 14px;
  margin-right: 6px;
  cursor: pointer;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 14px;
  padding-right: 8px;
  overflow: hidden;
  transition: background-color 0.2s;

  &.is-selected {
    background-color: var(--el-color-primary-light-9);
    border-radius: 4px;

    .node-title {
      color: var(--el-color-primary);
    }

    .node-icon {
      color: var(--el-color-primary);
    }
  }

  &.is-multi-select-mode {
    cursor: pointer;
  }

  .node-icon {
    margin-right: 6px;
    font-size: 16px;
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    :deep(svg) {
      width: 14px;
      height: 14px;
    }

    &.volume {
      color: #e6a23c; // 文件夹颜色
    }

    &.chapter,
    &.scene {
      color: var(--el-text-color-secondary);
    }
  }

  .node-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--el-text-color-regular);

    .dirty-dot {
      color: var(--el-color-danger);
      font-weight: bold;
      margin-left: 2px;
    }
  }

  .node-meta {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
    margin-left: 8px;
  }
}

// 覆盖 Element Tree 样式
:deep(.el-tree-node__content) {
  height: 32px;
  border-radius: 4px;
  margin: 0 4px;

  &:hover {
    background-color: var(--el-fill-color-light);
  }
}

:deep(.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content) {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);

  .node-title {
    color: var(--el-color-primary);
    font-weight: 500;
  }

  .node-icon {
    color: var(--el-color-primary);
  }
}
</style>

<!-- 全局样式：右键菜单 -->
<style lang="scss">
.custom-context-menu {
  position: fixed;
  z-index: 9999;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  box-shadow: var(--el-box-shadow-light);
  border-radius: 4px;
  padding: 4px 0;
  min-width: 140px;

  .menu-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    font-size: 13px;
    color: var(--el-text-color-regular);
    cursor: pointer;
    transition: background 0.2s;
    gap: 8px;

    &:hover {
      background: var(--el-fill-color-light);
      color: var(--el-color-primary);
    }

    &.danger {
      color: var(--el-color-danger);

      &:hover {
        background: var(--el-color-danger-light-9);
      }
    }
  }

  .menu-divider {
    height: 1px;
    background: var(--el-border-color-lighter);
    margin: 4px 0;
  }
}

.context-menu-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9998;
  background: transparent;
}
</style>
