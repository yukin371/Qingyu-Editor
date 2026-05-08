<template>
  <div
    :class="nodeClasses"
    :style="nodeStyle"
    role="treeitem"
    :aria-expanded="hasChildren ? isExpanded : undefined"
    :aria-selected="isSelected"
    :tabindex="isSelected ? 0 : -1"
    @click="handleClick"
    @contextmenu="handleContextMenu"
    @keydown="handleKeydown"
  >
    <!-- 缩进占位 -->
    <span
      class="chapter-node__indent"
      :style="{ width: `${level * 16}px` }"
    />

    <!-- 展开/折叠图标 -->
    <span
      v-if="hasChildren"
      class="chapter-node__expand-icon"
      :class="{ 'is-expanded': isExpanded }"
      @click.stop="handleToggleExpand"
    >
      <QyIcon name="ArrowRight" :size="14" />
    </span>
    <span v-else class="chapter-node__expand-placeholder" />

    <!-- 章节图标 -->
    <span class="chapter-node__icon">
      <QyIcon :name="chapterIcon" :size="16" />
    </span>

    <!-- 章节标题 -->
    <span class="chapter-node__title" :title="node.title">
      {{ node.title }}
    </span>

    <!-- 字数统计 -->
    <span v-if="node.wordCount > 0" class="chapter-node__word-count">
      {{ formatWordCount(node.wordCount) }}
    </span>

    <!-- 状态标签 -->
    <span class="chapter-node__status" :class="statusClass">
      {{ statusText }}
    </span>

    <!-- 子节点 -->
    <div
      v-if="hasChildren && isExpanded"
      class="chapter-node__children"
      role="group"
    >
      <ChapterTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        :selected-id="selectedId"
        :expanded-ids="expandedIds"
        @select="handleChildSelect"
        @toggle-expand="handleChildToggleExpand"
        @context-menu="handleChildContextMenu"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ChapterTreeNode 组件
 *
 * 章节树的递归节点组件，专门用于显示章节数据
 * 支持：
 * - 展开/折叠子章节
 * - 选中高亮
 * - 字数统计显示
 * - 状态标签（草稿/写作中/已完成）
 * - 右键菜单
 */

import { computed } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import type { ChapterNode, ChapterStatus } from '../../stores/chapterStore'

// ==================== Props & Emits ====================

interface Props {
  /** 章节节点数据 */
  node: ChapterNode
  /** 当前层级（0为根级） */
  level: number
  /** 当前选中的章节ID */
  selectedId: string | null
  /** 展开的节点ID列表 */
  expandedIds: string[]
}

interface Emits {
  (e: 'select', node: ChapterNode): void
  (e: 'toggle-expand', nodeId: string): void
  (e: 'context-menu', event: { action: string; node: ChapterNode; x: number; y: number }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// ==================== Computed ====================

/** 是否有子节点 */
const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0
})

/** 是否被选中 */
const isSelected = computed(() => {
  return props.selectedId === props.node.id
})

/** 是否展开 */
const isExpanded = computed(() => {
  return props.expandedIds.includes(props.node.id)
})

/** 节点样式类 */
const nodeClasses = computed(() => [
  'chapter-node',
  {
    'is-selected': isSelected.value,
    'is-expanded': isExpanded.value,
    'has-children': hasChildren.value
  }
])

/** 节点样式 */
const nodeStyle = computed(() => ({
  '--node-level': props.level
}))

/** 状态样式类 */
const statusClass = computed(() => {
  const statusMap: Record<ChapterStatus, string> = {
    draft: 'is-draft',
    writing: 'is-writing',
    completed: 'is-completed'
  }
  return statusMap[props.node.status]
})

/** 状态文本 */
const statusText = computed(() => {
  const statusMap: Record<ChapterStatus, string> = {
    draft: '草稿',
    writing: '写作中',
    completed: '已完成'
  }
  return statusMap[props.node.status]
})

/** 章节图标 */
const chapterIcon = computed(() => {
  if (hasChildren.value) {
    return 'Folder'
  }
  return 'Document'
})

// ==================== Methods ====================

/**
 * 格式化字数显示
 */
function formatWordCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万字`
  }
  return `${count}字`
}

/**
 * 处理节点点击
 */
function handleClick() {
  emit('select', props.node)
}

/**
 * 处理展开/折叠
 */
function handleToggleExpand() {
  emit('toggle-expand', props.node.id)
}

/**
 * 处理右键菜单
 */
function handleContextMenu(event: MouseEvent) {
  event.preventDefault()
  emit('context-menu', {
    action: 'open',
    node: props.node,
    x: event.clientX,
    y: event.clientY
  })
}

/**
 * 处理键盘事件
 */
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    emit('select', props.node)
  } else if (event.key === 'ArrowRight' && hasChildren.value && !isExpanded.value) {
    event.preventDefault()
    emit('toggle-expand', props.node.id)
  } else if (event.key === 'ArrowLeft' && isExpanded.value) {
    event.preventDefault()
    emit('toggle-expand', props.node.id)
  }
}

/**
 * 子节点选择事件传递
 */
function handleChildSelect(node: ChapterNode) {
  emit('select', node)
}

/**
 * 子节点展开事件传递
 */
function handleChildToggleExpand(nodeId: string) {
  emit('toggle-expand', nodeId)
}

/**
 * 子节点右键菜单事件传递
 */
function handleChildContextMenu(event: { action: string; node: ChapterNode; x: number; y: number }) {
  emit('context-menu', event)
}
</script>

<style scoped lang="scss">
.chapter-node {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 6px 8px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  border-radius: 4px;
  margin: 2px 0;

  &:hover {
    background-color: var(--vscode-toolbar-hoverBackground, rgba(0, 0, 0, 0.04));
  }

  &:focus-visible {
    outline: 2px solid var(--vscode-focusBorder, #007acc);
    outline-offset: -2px;
  }

  &.is-selected {
    background-color: var(--vscode-inactiveSelectionBackground, rgba(0, 0, 0, 0.08));
    font-weight: 500;

    .chapter-node__title {
      color: var(--vscode-inactiveSelectionForeground, inherit);
    }
  }
}

.chapter-node__indent {
  flex-shrink: 0;
}

.chapter-node__expand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-right: 2px;
  flex-shrink: 0;
  cursor: pointer;
  color: var(--vscode-sideBar-foreground, #6b7280);
  transition: transform 0.2s ease;

  &:hover {
    color: var(--vscode-foreground, #1f2937);
  }

  &.is-expanded {
    transform: rotate(90deg);
  }
}

.chapter-node__expand-placeholder {
  width: 18px;
  height: 18px;
  margin-right: 2px;
  flex-shrink: 0;
}

.chapter-node__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 6px;
  flex-shrink: 0;
  color: var(--vscode-sideBar-foreground, #6b7280);
}

.chapter-node__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: var(--vscode-foreground, #1f2937);
}

.chapter-node__word-count {
  flex-shrink: 0;
  margin-left: 8px;
  font-size: 11px;
  color: var(--vscode-sideBar-foreground, #9ca3af);
}

.chapter-node__status {
  flex-shrink: 0;
  margin-left: 6px;
  padding: 1px 6px;
  font-size: 10px;
  border-radius: 3px;
  font-weight: 500;

  &.is-draft {
    background-color: rgba(156, 163, 175, 0.2);
    color: #6b7280;
  }

  &.is-writing {
    background-color: rgba(59, 130, 246, 0.15);
    color: #3b82f6;
  }

  &.is-completed {
    background-color: rgba(34, 197, 94, 0.15);
    color: #22c55e;
  }
}

.chapter-node__children {
  width: 100%;
  margin-top: 2px;
}

// 暗色模式适配
@media (prefers-color-scheme: dark) {
  .chapter-node {
    &:hover {
      background-color: rgba(255, 255, 255, 0.06);
    }

    &.is-selected {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }

  .chapter-node__status {
    &.is-draft {
      background-color: rgba(156, 163, 175, 0.25);
      color: #9ca3af;
    }

    &.is-writing {
      background-color: rgba(59, 130, 246, 0.25);
      color: #60a5fa;
    }

    &.is-completed {
      background-color: rgba(34, 197, 94, 0.25);
      color: #4ade80;
    }
  }
}
</style>
