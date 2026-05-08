<template>
  <div
    class="tree-list"
    data-testid="tree-list"
    role="tree"
    :style="treeListStyle"
    @keydown="handleKeydown"
  >
    <template v-if="data && data.length > 0">
      <TreeNodeItem
        v-for="(node, index) in flatNodes"
        :key="`${node.id}-${index}`"
        :node="node"
        :level="node.level"
        :icon="icon"
        :selected="selectedKey === node.id"
        :expanded="expandedKeys.has(node.id)"
        :dragging-node-id="draggingNodeId"
        @select="handleSelect"
        @toggle="handleToggle"
        @dragstart="handleDragStart"
        @dragover="handleDragOver"
        @dragend="handleDragEnd"
        @drop="handleDrop"
      >
        <template v-if="$slots.default" #default="{ node }">
          <slot :node="node" />
        </template>
        <template v-if="$slots.icon" #icon="{ node }">
          <slot name="icon" :node="node" />
        </template>
      </TreeNodeItem>
    </template>
    <div v-else class="tree-list-empty">
      <slot name="empty">
        <span class="text-slate-400">暂无数据</span>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * TreeList 组件
 *
 * 简化版树形列表组件，专为编辑器设计
 * 支持展开/折叠、选中高亮、拖拽排序
 * VSCode风格样式：20px缩进/层级，32px行高
 */

import { computed, ref, watch, type CSSProperties } from 'vue'
import TreeNodeItem from './TreeNodeItem.vue'

// 类型定义
export interface TreeNode {
  id: string | number
  label: string
  icon?: string
  children?: TreeNode[]
}

interface Props {
  data: TreeNode[] | null
  icon?: string
  defaultExpandedKeys?: Array<string | number>
  selectedKey?: string | number | null
}

interface Emits {
  (e: 'select', node: TreeNode): void
  (e: 'expand', node: TreeNode, expanded: boolean): void
  (e: 'update:selectedKey', key: string | number | null): void
  (e: 'update:data', data: TreeNode[]): void
}

// Props
const props = withDefaults(defineProps<Props>(), {
  data: null,
  icon: '',
  defaultExpandedKeys: () => [],
  selectedKey: null,
})

// Emits
const emit = defineEmits<Emits>()

// 展开的节点keys
const expandedKeys = ref<Set<string | number>>(new Set(props.defaultExpandedKeys || []))

// 拖拽中的节点ID
const draggingNodeId = ref<string | number | null>(null)

// 扁平化节点数据（用于渲染）
interface FlatNode extends TreeNode {
  level: number
  parentId?: string | number | null
}

const flatNodes = computed<FlatNode[]>(() => {
  if (!props.data || props.data.length === 0) return []

  const result: FlatNode[] = []

  const flatten = (
    nodes: TreeNode[],
    level: number = 0,
    parentId: string | number | null = null,
  ) => {
    nodes.forEach((node) => {
      // 添加当前节点
      result.push({
        ...node,
        level,
        parentId,
      })

      // 如果节点展开且有子节点，递归处理
      if (expandedKeys.value.has(node.id) && node.children && node.children.length > 0) {
        flatten(node.children, level + 1, node.id)
      }
    })
  }

  flatten(props.data)
  return result
})

// VSCode主题样式
const treeListStyle = computed<CSSProperties>(() => ({
  '--vscode-tree-list-bg': 'var(--vscode-sideBar-background)',
  '--vscode-tree-list-fg': 'var(--vscode-sideBar-foreground)',
  '--vscode-tree-list-hover': 'var(--vscode-toolbar-hoverBackground)',
  '--vscode-tree-list-selected': 'var(--vscode-inactiveSelectionBackground)',
  '--vscode-tree-list-selected-fg': 'var(--vscode-inactiveSelectionForeground)',
  backgroundColor: 'var(--vscode-tree-list-bg)',
  color: 'var(--vscode-tree-list-fg)',
}))

// 处理节点选择
const handleSelect = (node: TreeNode) => {
  emit('select', node)
  emit('update:selectedKey', node.id)
}

// 处理展开/折叠
const handleToggle = (node: TreeNode) => {
  const nodeId = node.id
  const newExpanded = !expandedKeys.value.has(nodeId)

  if (newExpanded) {
    expandedKeys.value.add(nodeId)
  } else {
    expandedKeys.value.delete(nodeId)
  }

  emit('expand', node, newExpanded)
}

// 拖拽开始
const handleDragStart = (node: TreeNode) => {
  draggingNodeId.value = node.id
}

// 拖拽结束
const handleDragEnd = () => {
  draggingNodeId.value = null
}

// 拖拽经过
const handleDragOver = (targetNode: TreeNode, event: DragEvent) => {
  event.preventDefault()

  // 不允许拖拽到自身或父节点到子节点
  if (draggingNodeId.value === targetNode.id) {
    return
  }

  if (isDescendant(draggingNodeId.value, targetNode.id)) {
    return
  }
}

// 放置
const handleDrop = (targetNode: TreeNode, position: 'before' | 'after' | 'inner') => {
  if (draggingNodeId.value === null) return
  if (draggingNodeId.value === targetNode.id) return
  if (isDescendant(draggingNodeId.value, targetNode.id)) return

  const newData = moveNode(props.data || [], draggingNodeId.value, targetNode.id, position)
  emit('update:data', newData)
  draggingNodeId.value = null
}

// 检查是否是后代节点
const isDescendant = (ancestorId: string | number | null, nodeId: string | number): boolean => {
  if (!ancestorId || !props.data) return false

  const findNode = (nodes: TreeNode[], id: string | number): TreeNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children) {
        const found = findNode(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  const node = findNode(props.data, nodeId)
  if (!node) return false

  const checkAncestor = (n: TreeNode): boolean => {
    if (n.id === ancestorId) return true
    if (n.children) {
      for (const child of n.children) {
        if (checkAncestor(child)) return true
      }
    }
    return false
  }

  return checkAncestor(node)
}

// 安全的深拷贝方法
// 避免structuredClone在循环引用、函数等情况下失败

const deepClone = <T extends Record<string, any>>(obj: T): T => {
  // 处理基本类型和null/undefined
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 处理Date对象
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T
  }

  // 处理普通对象
  const clonedObj = {} as T

  const seen = new WeakMap<object, any>() // 用于检测循环引用

  // 检查循环引用
  if (seen.has(obj)) {
    return seen.get(obj)
  }
  seen.set(obj, clonedObj)

  // 递归克隆所有属性
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      // 跳过函数属性
      if (typeof value !== 'function') {
        clonedObj[key] = deepClone(value)
      }
    }
  }

  return clonedObj
}

// 移动节点
const moveNode = (
  data: TreeNode[],
  sourceId: string | number,
  targetId: string | number,
  position: 'before' | 'after' | 'inner',
): TreeNode[] => {
  // 深拷贝数据 - 使用自定义的deepClone方法
  // 比structuredClone更安全，可以处理循环引用和特殊类型
  const newData = deepClone(data)

  let sourceNode: TreeNode | null = null

  // 查找并移除源节点
  const findAndRemoveSource = (nodes: TreeNode[]): boolean => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === sourceId) {
        sourceNode = nodes[i]
        nodes.splice(i, 1)
        return true
      }
      if (nodes[i].children && nodes[i].children!.length > 0) {
        if (findAndRemoveSource(nodes[i].children!)) {
          return true
        }
      }
    }
    return false
  }

  findAndRemoveSource(newData)
  if (!sourceNode) return newData

  // 插入到目标位置
  const insertToTarget = (nodes: TreeNode[]): boolean => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === targetId) {
        if (position === 'inner') {
          if (!nodes[i].children) {
            nodes[i].children = []
          }
          nodes[i].children!.push(sourceNode!)
        } else if (position === 'before') {
          nodes.splice(i, 0, sourceNode!)
        } else {
          nodes.splice(i + 1, 0, sourceNode!)
        }
        return true
      }
      if (nodes[i].children && nodes[i].children!.length > 0) {
        if (insertToTarget(nodes[i].children!)) {
          return true
        }
      }
    }
    return false
  }

  insertToTarget(newData)
  return newData
}

// 键盘导航
const handleKeydown = (event: KeyboardEvent) => {
  const nodes = flatNodes.value
  if (nodes.length === 0) return

  const currentIndex = nodes.findIndex((n) => n.id === props.selectedKey)

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (currentIndex < nodes.length - 1) {
        const nextNode = nodes[currentIndex + 1]
        emit('select', nextNode)
        emit('update:selectedKey', nextNode.id)
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (currentIndex > 0) {
        const prevNode = nodes[currentIndex - 1]
        emit('select', prevNode)
        emit('update:selectedKey', prevNode.id)
      }
      break
    case 'Enter':
      event.preventDefault()
      if (props.selectedKey !== null) {
        const node = nodes.find((n) => n.id === props.selectedKey)
        if (node) {
          emit('select', node)
        }
      }
      break
  }
}

// 监听selectedKey变化
watch(
  () => props.selectedKey,
  (newKey) => {
    if (newKey !== null && newKey !== undefined) {
      const node = findNodeById(props.data, newKey)
      if (node) {
        emit('select', node)
      }
    }
  },
)

// 根据ID查找节点
const findNodeById = (nodes: TreeNode[] | null, id: string | number): TreeNode | null => {
  if (!nodes) return null
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}
</script>

<style scoped lang="scss">
.tree-list {
  width: 100%;
  height: 100%;
  overflow: auto;
  user-select: none;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--vscode-scrollbarSlider-background);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.tree-list-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
}
</style>
