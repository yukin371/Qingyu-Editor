<template>
  <div class="chapter-tree" role="tree" aria-label="章节列表">
    <!-- 工具栏 -->
    <div class="chapter-tree__toolbar">
      <h3 class="chapter-tree__title">章节目录</h3>
      <div class="chapter-tree__actions">
        <button
          class="chapter-tree__action-btn"
          title="新建章节"
          @click="handleCreateRoot"
        >
          <QyIcon name="Plus" :size="16" />
        </button>
        <button
          class="chapter-tree__action-btn"
          :title="allExpanded ? '折叠全部' : '展开全部'"
          @click="handleToggleAll"
        >
          <QyIcon :name="allExpanded ? 'Folder' : 'FolderOpened'" :size="16" />
        </button>
      </div>
    </div>

    <!-- 章节列表 -->
    <div class="chapter-tree__content" @scroll="handleScroll">
      <!-- 加载状态 -->
      <div v-if="loading" class="chapter-tree__loading">
        <QyIcon name="Loading" :size="24" class="is-spinning" />
        <span>加载中...</span>
      </div>

      <!-- 空状态 -->
      <div v-else-if="treeData.length === 0" class="chapter-tree__empty">
        <QyIcon name="Document" :size="48" />
        <p>暂无章节</p>
        <button class="chapter-tree__empty-btn" @click="handleCreateRoot">
          <QyIcon name="Plus" :size="14" />
          <span>创建第一个章节</span>
        </button>
      </div>

      <!-- 章节树 -->
      <template v-else>
        <ChapterTreeNode
          v-for="node in treeData"
          :key="node.id"
          :node="node"
          :level="0"
          :selected-id="selectedId"
          :expanded-ids="expandedIds"
          @select="handleSelect"
          @toggle-expand="handleToggleExpand"
          @context-menu="handleContextMenu"
        />
      </template>
    </div>

    <!-- 右键菜单 -->
    <Teleport to="body">
      <Transition name="context-menu">
        <div
          v-if="contextMenu.visible"
          ref="contextMenuRef"
          class="chapter-tree__context-menu"
          :style="contextMenuStyle"
          @click.stop
        >
          <button
            class="context-menu__item"
            @click="handleContextAction('create-child')"
          >
            <QyIcon name="Plus" :size="14" />
            <span>新建子章节</span>
          </button>
          <button
            class="context-menu__item"
            @click="handleContextAction('rename')"
          >
            <QyIcon name="Edit" :size="14" />
            <span>重命名</span>
          </button>
          <div class="context-menu__divider" />
          <button
            class="context-menu__item context-menu__item--danger"
            @click="handleContextAction('delete')"
          >
            <QyIcon name="Delete" :size="14" />
            <span>删除章节</span>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
/**
 * ChapterTree 组件
 *
 * 章节树容器组件，用于显示和管理章节的树形结构
 * 功能：
 * - 显示章节树形结构
 * - 新建章节按钮
 * - 展开/折叠全部
 * - 选中状态管理
 * - 右键菜单操作
 */

import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import ChapterTreeNode from './ChapterTreeNode.vue'
import type { ChapterNode } from '../../stores/chapterStore'

// ==================== Props & Emits ====================

interface Props {
  /** 章节列表（扁平结构，会自动组装成树） */
  chapters: ChapterNode[]
  /** 当前选中的章节ID */
  selectedId: string | null
  /** 加载状态 */
  loading?: boolean
}

interface Emits {
  (e: 'select', node: ChapterNode): void
  (e: 'create', parentId: string | null): void
  (e: 'rename', node: ChapterNode): void
  (e: 'delete', node: ChapterNode): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

// ==================== State ====================

/** 展开的节点ID列表 */
const expandedIds = ref<string[]>([])

/** 右键菜单状态 */
const contextMenu = ref<{
  visible: boolean
  node: ChapterNode | null
  x: number
  y: number
}>({
  visible: false,
  node: null,
  x: 0,
  y: 0
})

/** 右键菜单DOM引用 */
const contextMenuRef = ref<HTMLElement | null>(null)

// ==================== Computed ====================

/**
 * 将扁平列表组装成树形结构
 */
const treeData = computed(() => {
  return buildTree(props.chapters)
})

/**
 * 所有可展开节点ID（有子节点的节点）
 */
const expandableIds = computed(() => {
  const ids: string[] = []
  const collect = (nodes: ChapterNode[]) => {
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        ids.push(node.id)
        collect(node.children)
      }
    }
  }
  collect(treeData.value)
  return ids
})

/**
 * 是否全部展开
 */
const allExpanded = computed(() => {
  if (expandableIds.value.length === 0) return false
  return expandableIds.value.every(id => expandedIds.value.includes(id))
})

/**
 * 右键菜单样式
 */
const contextMenuStyle = computed(() => ({
  left: `${contextMenu.value.x}px`,
  top: `${contextMenu.value.y}px`
}))

// ==================== Methods ====================

/**
 * 将扁平列表构建成树形结构
 */
function buildTree(flatList: ChapterNode[]): ChapterNode[] {
  const map = new Map<string, ChapterNode>()
  const roots: ChapterNode[] = []

  // 先创建所有节点的映射
  for (const node of flatList) {
    map.set(node.id, { ...node, children: [] })
  }

  // 构建树形结构
  for (const node of flatList) {
    const currentNode = map.get(node.id)!
    if (node.parentId === null || !map.has(node.parentId)) {
      // 根节点
      roots.push(currentNode)
    } else {
      // 添加到父节点的 children
      const parent = map.get(node.parentId)
      if (parent) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(currentNode)
      }
    }
  }

  // 按 order 排序
  const sortByOrder = (a: ChapterNode, b: ChapterNode) => a.order - b.order
  const sortChildren = (nodes: ChapterNode[]) => {
    nodes.sort(sortByOrder)
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        sortChildren(node.children)
      }
    }
  }
  sortChildren(roots)

  return roots
}

/**
 * 处理节点选择
 */
function handleSelect(node: ChapterNode) {
  emit('select', node)
}

/**
 * 处理展开/折叠
 */
function handleToggleExpand(nodeId: string) {
  const index = expandedIds.value.indexOf(nodeId)
  if (index === -1) {
    expandedIds.value.push(nodeId)
  } else {
    expandedIds.value.splice(index, 1)
  }
}

/**
 * 处理新建根章节
 */
function handleCreateRoot() {
  emit('create', null)
}

/**
 * 处理展开/折叠全部
 */
function handleToggleAll() {
  if (allExpanded.value) {
    // 折叠全部
    expandedIds.value = []
  } else {
    // 展开全部
    expandedIds.value = [...expandableIds.value]
  }
}

/**
 * 处理右键菜单
 */
function handleContextMenu(event: { action: string; node: ChapterNode; x: number; y: number }) {
  // 调整菜单位置，确保不超出视口
  nextTick(() => {
    let x = event.x
    let y = event.y

    // 检查是否超出右边界
    if (contextMenuRef.value) {
      const menuWidth = contextMenuRef.value.offsetWidth
      const menuHeight = contextMenuRef.value.offsetHeight
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      if (x + menuWidth > viewportWidth) {
        x = viewportWidth - menuWidth - 8
      }
      if (y + menuHeight > viewportHeight) {
        y = viewportHeight - menuHeight - 8
      }
    }

    contextMenu.value = {
      visible: true,
      node: event.node,
      x,
      y
    }
  })
}

/**
 * 处理右键菜单操作
 */
function handleContextAction(action: string) {
  if (!contextMenu.value.node) return

  const node = contextMenu.value.node

  switch (action) {
    case 'create-child':
      emit('create', node.id)
      break
    case 'rename':
      emit('rename', node)
      break
    case 'delete':
      emit('delete', node)
      break
  }

  closeContextMenu()
}

/**
 * 关闭右键菜单
 */
function closeContextMenu() {
  contextMenu.value.visible = false
  contextMenu.value.node = null
}

/**
 * 处理滚动（关闭右键菜单）
 */
function handleScroll() {
  closeContextMenu()
}

/**
 * 点击外部关闭右键菜单
 */
function handleClickOutside(event: MouseEvent) {
  if (contextMenu.value.visible && contextMenuRef.value) {
    if (!contextMenuRef.value.contains(event.target as Node)) {
      closeContextMenu()
    }
  }
}

// ==================== Lifecycle ====================

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('contextmenu', closeContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('contextmenu', closeContextMenu)
})

// 监听选中节点变化，自动展开父节点
watch(() => props.selectedId, (newId) => {
  if (newId) {
    // 找到选中节点的所有父节点并展开
    expandParents(newId)
  }
})

/**
 * 展开指定节点的所有父节点
 */
function expandParents(nodeId: string) {
  const findAndExpandParents = (nodes: ChapterNode[], targetId: string, parents: string[]): boolean => {
    for (const node of nodes) {
      if (node.id === targetId) {
        // 找到目标节点，展开所有父节点
        for (const parentId of parents) {
          if (!expandedIds.value.includes(parentId)) {
            expandedIds.value.push(parentId)
          }
        }
        return true
      }
      if (node.children && node.children.length > 0) {
        if (findAndExpandParents(node.children, targetId, [...parents, node.id])) {
          return true
        }
      }
    }
    return false
  }

  findAndExpandParents(treeData.value, nodeId, [])
}
</script>

<style scoped lang="scss">
.chapter-tree {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--vscode-sideBar-background, #ffffff);
  color: var(--vscode-foreground, #1f2937);
}

.chapter-tree__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px 8px;
  border-bottom: 1px solid var(--vscode-sideBar-border, #e5e7eb);
}

.chapter-tree__title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--vscode-sideBarTitle-foreground, #374151);
}

.chapter-tree__actions {
  display: flex;
  gap: 4px;
}

.chapter-tree__action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: var(--vscode-sideBar-foreground, #6b7280);
  transition: all 0.15s ease;

  &:hover {
    background-color: var(--vscode-toolbar-hoverBackground, rgba(0, 0, 0, 0.06));
    color: var(--vscode-foreground, #1f2937);
  }

  &:focus-visible {
    outline: 2px solid var(--vscode-focusBorder, #007acc);
    outline-offset: -2px;
  }
}

.chapter-tree__toolbar :deep(.qy-icon),
.chapter-tree__content :deep(.qy-icon) {
  width: 14px;
  height: 14px;
}

.chapter-tree__content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--vscode-scrollbarSlider-background, #d1d5db);
    border-radius: 4px;

    &:hover {
      background: var(--vscode-scrollbarSlider-hoverBackground, #9ca3af);
    }
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.chapter-tree__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--vscode-sideBar-foreground, #6b7280);
  gap: 12px;

  .is-spinning {
    animation: spin 1s linear infinite;
  }
}

.chapter-tree__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--vscode-sideBar-foreground, #9ca3af);
  gap: 12px;

  p {
    margin: 0;
    font-size: 14px;
  }
}

.chapter-tree__empty-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--vscode-button-border, #d1d5db);
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--vscode-foreground, #374151);
  font-size: 13px;
  transition: all 0.15s ease;

  &:hover {
    background-color: var(--vscode-toolbar-hoverBackground, rgba(0, 0, 0, 0.04));
    border-color: var(--vscode-focusBorder, #007acc);
  }
}

// 右键菜单
.chapter-tree__context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 160px;
  padding: 4px 0;
  background: var(--vscode-menu-background, #ffffff);
  border: 1px solid var(--vscode-menu-border, #e5e7eb);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.context-menu__item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  color: var(--vscode-menu-foreground, #374151);
  text-align: left;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--vscode-menu-selectionBackground, rgba(0, 0, 0, 0.04));
  }

  &--danger {
    color: #ef4444;

    &:hover {
      background-color: rgba(239, 68, 68, 0.1);
    }
  }
}

.context-menu__divider {
  height: 1px;
  margin: 4px 8px;
  background-color: var(--vscode-menu-separatorBackground, #e5e7eb);
}

// 右键菜单动画
.context-menu-enter-active,
.context-menu-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.context-menu-enter-from,
.context-menu-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

// 旋转动画
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 暗色模式适配
@media (prefers-color-scheme: dark) {
  .chapter-tree {
    background-color: var(--vscode-sideBar-background, #1e1e1e);
  }

  .chapter-tree__toolbar {
    border-bottom-color: var(--vscode-sideBar-border, #3c3c3c);
  }

  .chapter-tree__context-menu {
    background: var(--vscode-menu-background, #252526);
    border-color: var(--vscode-menu-border, #454545);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  .context-menu__divider {
    background-color: var(--vscode-menu-separatorBackground, #454545);
  }
}
</style>
