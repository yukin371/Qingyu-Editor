/**
 * useOutlineTreeState - 结构树共享状态 Composable
 *
 * 在侧边栏 (WorkspaceLeftPanel) 和舞台 (StructureStageView) 之间共享：
 * - 选中的节点 ID
 * - 展开的节点 ID 列表
 *
 * 类似 CharacterGraphView 的左右映射关系模式
 *
 * 注意：使用模块级单例状态，确保多个组件调用时共享同一份状态
 */
import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import type { OutlineNode } from '@/types/writer'

// 模块级单例状态 - 确保所有组件共享同一份状态
const selectedNodeId = ref('')
const expandedNodeIds = ref<string[]>([])

export interface UseOutlineTreeStateReturn {
  // 状态
  selectedNodeId: Ref<string>
  expandedNodeIds: Ref<string[]>
  // 计算属性
  rootNodes: ComputedRef<OutlineNode[]>
  flattenedNodes: ComputedRef<OutlineNode[]>
  selectedNode: ComputedRef<OutlineNode | null>
  canMoveUp: ComputedRef<boolean>
  canMoveDown: ComputedRef<boolean>
  siblingContext: ComputedRef<{ siblings: OutlineNode[]; index: number; targetNode: OutlineNode | null }>
  // 方法
  selectNode: (node: OutlineNode) => void
  toggleNode: (nodeId: string) => void
  expandRootNodes: () => void
}

export function useOutlineTreeState(): UseOutlineTreeStateReturn {
  const writerStore = useWriterStore()

  // 计算属性
  const rootNodes = computed<OutlineNode[]>(() => writerStore.outline.tree || [])

  const flattenedNodes = computed<OutlineNode[]>(() => {
    const list: OutlineNode[] = []
    const walk = (nodes: OutlineNode[]) => {
      for (const node of nodes) {
        list.push(node)
        if (node.children?.length) walk(node.children)
      }
    }
    walk(rootNodes.value)
    return list
  })

  const selectedNode = computed(
    () => flattenedNodes.value.find((node) => node.id === selectedNodeId.value) || null,
  )

  const siblingContext = computed(() => {
    const current = selectedNode.value
    if (!current) {
      return { siblings: [] as OutlineNode[], index: -1, targetNode: null as OutlineNode | null }
    }

    const siblings = current.parentId
      ? flattenedNodes.value.find((node) => node.id === current.parentId)?.children || []
      : rootNodes.value
    const orderedSiblings = [...siblings].sort((left, right) => (left.order ?? 0) - (right.order ?? 0))

    const currentIndex = orderedSiblings.findIndex((node) => node.id === current.id)

    return {
      siblings: orderedSiblings,
      index: currentIndex,
      targetNode: current,
    }
  })

  const canMoveUp = computed(
    () => !!selectedNode.value && siblingContext.value.index > 0,
  )

  const canMoveDown = computed(() => {
    const { siblings, index } = siblingContext.value
    return !!selectedNode.value && index >= 0 && index < siblings.length - 1
  })

  // 方法
  function selectNode(node: OutlineNode): OutlineNode {
    selectedNodeId.value = node.id
    writerStore.setCurrentOutlineNode(node)
    return node
  }

  function toggleNode(nodeId: string) {
    expandedNodeIds.value = expandedNodeIds.value.includes(nodeId)
      ? expandedNodeIds.value.filter((id) => id !== nodeId)
      : [...expandedNodeIds.value, nodeId]
  }

  function expandRootNodes() {
    expandedNodeIds.value = rootNodes.value.map((node) => node.id)
  }

  return {
    // 状态
    selectedNodeId,
    expandedNodeIds,
    // 计算属性
    rootNodes,
    flattenedNodes,
    selectedNode,
    canMoveUp,
    canMoveDown,
    siblingContext,
    // 方法
    selectNode,
    toggleNode,
    expandRootNodes,
  }
}
