<template>
  <div
    :class="nodeClasses"
    :data-node-id="node.id"
    :data-level="level"
    :style="nodeStyle"
    :role="isLeaf ? 'treeitem' : 'treeitem'"
    :aria-expanded="isLeaf ? undefined : expanded"
    :aria-selected="selected"
    :tabindex="selected ? 0 : -1"
    :draggable="true"
    @click="handleClick"
    @dblclick="handleDoubleClick"
    @keydown="handleKeydown"
    @dragstart="handleDragStart"
    @dragover="handleDragOver"
    @dragend="handleDragEnd"
    @drop="handleDrop"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 缩进占位 -->
    <span class="tree-node-indent" :style="{ width: `${level * 20}px` }" />

    <!-- 展开/折叠图标 -->
    <span
      v-if="hasChildren"
      :class="expandIconClasses"
      class="tree-node-expand-icon"
      @click.stop="handleToggle"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clip-rule="evenodd"
        />
      </svg>
    </span>
    <span v-else class="tree-node-expand-icon-placeholder" />

    <!-- 节点图标 -->
    <span v-if="displayIcon" class="tree-node-icon">
      <slot name="icon" :node="node">
        <span class="tree-node-icon-text">{{ displayIcon }}</span>
      </slot>
    </span>

    <!-- 节点标签 -->
    <span class="tree-node-label">
      <slot :node="node">
        {{ node.label }}
      </slot>
    </span>

    <!-- 拖拽指示器 - VSCode蓝色插入线 -->
    <div v-if="showDropIndicator" class="drop-indicator" :class="dropIndicatorClasses" />
  </div>
</template>

<script setup lang="ts">
/**
 * TreeNodeItem 组件
 *
 * 树形列表的节点项组件
 * 处理单个节点的渲染、交互和拖拽
 */

import { computed, ref } from 'vue'
import type { TreeNode } from './TreeList.vue'

interface Props {
  node: TreeNode
  level: number
  icon?: string
  selected?: boolean
  expanded?: boolean
  draggingNodeId?: string | number | null
}

interface Emits {
  (e: 'select', node: TreeNode): void
  (e: 'toggle', node: TreeNode): void
  (e: 'dragstart', node: TreeNode): void
  (e: 'dragover', node: TreeNode, event: DragEvent): void
  (e: 'dragend'): void
  (e: 'drop', node: TreeNode, position: 'before' | 'after' | 'inner'): void
}

const props = withDefaults(defineProps<Props>(), {
  icon: '',
  selected: false,
  expanded: false,
  draggingNodeId: null,
})

const emit = defineEmits<Emits>()

// 是否有子节点
const hasChildren = computed(() => props.node.children && props.node.children.length > 0)

// 是否是叶子节点（没有子节点）
const isLeaf = computed(() => !hasChildren.value)

// 显示的图标（优先使用节点自己的图标，否则使用默认图标）
const displayIcon = computed(() => props.node.icon || props.icon)

// 节点样式类
const nodeClasses = computed(() => [
  'tree-node',
  {
    selected: props.selected,
    expanded: props.expanded,
    leaf: isLeaf.value,
    hover: isHovered.value,
    dragging: props.draggingNodeId === props.node.id,
  },
])

// 展开图标样式类
const expandIconClasses = computed(() => [
  'transition-transform duration-200',
  {
    'rotate-90': props.expanded,
  },
])

// 节点样式（行高32px）
const nodeStyle = computed(() => ({
  height: '32px',
  lineHeight: '32px',
  paddingLeft: `${props.level * 20}px`,
  backgroundColor: props.selected
    ? 'var(--vscode-inactiveSelectionBackground)'
    : isHovered.value
      ? 'var(--vscode-toolbar-hoverBackground)'
      : 'transparent',
  color: props.selected
    ? 'var(--vscode-inactiveSelectionForeground)'
    : 'var(--vscode-sideBar-foreground)',
}))

// 是否悬停
const isHovered = ref(false)

// 拖拽放置位置
const dropPosition = ref<'before' | 'after' | 'inner' | null>(null)

// 是否显示拖拽放置指示器
const showDropIndicator = computed(() => {
  return (
    isHovered.value &&
    props.draggingNodeId !== null &&
    props.draggingNodeId !== props.node.id &&
    !isDescendant(props.draggingNodeId, props.node.id) &&
    dropPosition.value !== null
  )
})

// 拖拽指示器样式类
const dropIndicatorClasses = computed(() => ({
  'drop-indicator-before': dropPosition.value === 'before',
  'drop-indicator-after': dropPosition.value === 'after',
  'drop-indicator-inner': dropPosition.value === 'inner',
}))

// 检查是否是后代节点
 
const isDescendant = (
  ancestorId: string | number | null | undefined,
  _nodeId: string | number,
): boolean => {
  if (!ancestorId || !props.node.children) return false

  const checkNode = (nodes: TreeNode[]): boolean => {
    for (const node of nodes) {
      if (node.id === ancestorId) return true
      if (node.children && checkNode(node.children)) return true
    }
    return false
  }

  return checkNode(props.node.children)
}

// 处理点击
const handleClick = () => {
  emit('select', props.node)
}

// 处理双击
const handleDoubleClick = () => {
  if (!isLeaf.value) {
    handleToggle()
  }
}

// 处理展开/折叠
const handleToggle = () => {
  if (!isLeaf.value) {
    emit('toggle', props.node)
  }
}

// 拖拽开始
const handleDragStart = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(props.node.id))
  }
  emit('dragstart', props.node)
}

// 拖拽经过
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()

  // 计算拖拽位置
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const y = event.clientY - rect.top
  const height = rect.height

  if (y < height * 0.25) {
    dropPosition.value = 'before'
  } else if (y > height * 0.75) {
    dropPosition.value = 'after'
  } else if (!isLeaf.value) {
    dropPosition.value = 'inner'
  } else {
    // 叶子节点默认after
    dropPosition.value = 'after'
  }

  emit('dragover', props.node, event)
}

// 拖拽结束
const handleDragEnd = () => {
  dropPosition.value = null
  emit('dragend')
}

// 放置
const handleDrop = (event: DragEvent) => {
  event.preventDefault()

  // 根据鼠标位置确定放置位置
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const y = event.clientY - rect.top
  const height = rect.height

  let position: 'before' | 'after' | 'inner' = 'after'

  if (y < height * 0.25) {
    position = 'before'
  } else if (y > height * 0.75) {
    position = 'after'
  } else if (!isLeaf.value) {
    position = 'inner'
  }

  emit('drop', props.node, position)
}

// 鼠标进入
const handleMouseEnter = () => {
  isHovered.value = true
}

// 鼠标离开
const handleMouseLeave = () => {
  isHovered.value = false
}

// 键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    emit('select', props.node)
  }
}
</script>

<style scoped lang="scss">
.tree-node {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 8px;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
  outline: none;

  &:focus-visible {
    outline: 1px solid var(--vscode-focusBorder);
    outline-offset: -1px;
  }

  &.selected {
    font-weight: 500;
  }

  &.dragging {
    opacity: 0.5;
  }

  &.hover:not(.selected) {
    background-color: var(--vscode-toolbar-hoverBackground);
  }
}

.tree-node-indent {
  flex-shrink: 0;
}

.tree-node-expand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-right: 4px;
  flex-shrink: 0;
  cursor: pointer;
  color: var(--vscode-sideBar-foreground);
  opacity: 0.7;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 1;
  }

  &.rotate-90 {
    transform: rotate(90deg);
  }

  &-placeholder {
    width: 16px;
    margin-right: 4px;
    flex-shrink: 0;
  }
}

.tree-node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-right: 6px;
  flex-shrink: 0;
  font-size: 12px;
}

.tree-node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drop-indicator {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #007acc; // VSCode品牌蓝
  pointer-events: none;
  opacity: 0;
  transform: scaleY(0);
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
  z-index: 10;

  &.drop-indicator-before {
    top: 0;
  }

  &.drop-indicator-after {
    bottom: 0;
  }

  &.drop-indicator-inner {
    // inner位置使用背景高亮而不是线条
    display: none;
  }

  // 显示状态
  &.drop-indicator-before,
  &.drop-indicator-after {
    opacity: 1;
    transform: scaleY(1);
  }
}
</style>
