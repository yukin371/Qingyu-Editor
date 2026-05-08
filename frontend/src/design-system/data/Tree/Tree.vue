<script setup lang="ts">
/**
 * Tree 组件
 *
 * 树形控件组件，支持展开/收起、勾选、高亮等功能
 * 使用递归组件+template语法实现，确保Vue响应式系统正确追踪状态变化
 * 重构：使用reactive对象代替嵌套Ref，避免响应式追踪问题
 */

import { computed, provide, reactive, ref, useSlots, watch } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import TreeNodeItem from './TreeNodeItem.vue'
import type { TreeNode, TreeEmits, TreeProps, TreeNodeState, TreeInstance } from './types'
import { TREE_CONTEXT_KEY } from './constants'

// 使用 CVA 定义树节点变体
const treeNodeVariants = cva(
  // 基础样式
  'select-none transition-all duration-200',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<TreeProps>(), {
  checkable: false,
  defaultExpandAll: false,
  highlightCurrent: false,
  expandOnClickNode: false,
  size: 'md',
  defaultCheckedKeys: () => [],
  defaultExpandedKeys: () => [],
})

// 组件 Emits
const emit = defineEmits<TreeEmits>()

// 插槽
const slots = useSlots()

// 当前节点
const currentNode = ref<TreeNodeState | null>(null)

// 展开的节点 keys
const expandedKeys = ref<Set<string | number>>(new Set(props.defaultExpandedKeys || []))

// 选中的节点 keys
const checkedKeys = ref<Set<string | number>>(new Set(props.defaultCheckedKeys || []))

// 半选状态的节点 keys
const indeterminateKeys = ref<Set<string | number>>(new Set())

// 扁平化的所有节点状态
const nodeStates = ref<TreeNodeState[]>([])

// 初始化节点状态
// 重构：使用reactive对象代替嵌套Ref，确保响应式系统正确追踪状态变化
const initializeNodeStates = (nodes: TreeNode[], level: number = 0, parent: TreeNodeState | null = null): TreeNodeState[] => {
  const states: TreeNodeState[] = []

  nodes.forEach((node) => {
    const nodeId = node.id || node.label

    // 计算节点是否应该展开
    const shouldExpand = props.defaultExpandAll || (node.defaultExpand && !props.defaultExpandAll) || props.defaultExpandedKeys?.includes(nodeId)

    // 使用reactive创建响应式对象，不使用嵌套Ref
    // 这样可以避免Vue在props传递时解包嵌套Ref的问题
    const nodeState = reactive<TreeNodeState>({
      node,
      expanded: shouldExpand,
      checked: props.defaultCheckedKeys?.includes(nodeId) || false,
      indeterminate: false,
      level,
      parent,
      children: [],
    })

    states.push(nodeState)

    // 如果应该展开，添加到 expandedKeys
    if (shouldExpand) {
      expandedKeys.value.add(nodeId)
    }

    // 初始化选中状态
    if (props.defaultCheckedKeys?.includes(nodeId)) {
      checkedKeys.value.add(nodeId)
    }

    // 递归处理子节点
    if (node.children && node.children.length > 0) {
      nodeState.children = initializeNodeStates(node.children, level + 1, nodeState)
    }
  })

  return states
}

// 初始化
nodeStates.value = initializeNodeStates(props.data)

// 初始化完成后emit事件，确保父组件能获取初始状态
if (props.defaultCheckedKeys && props.defaultCheckedKeys.length > 0) {
  emit('update:checkedKeys', Array.from(checkedKeys.value))
}
if (props.defaultExpandedKeys && props.defaultExpandedKeys.length > 0 || props.defaultExpandAll) {
  emit('update:expandedKeys', Array.from(expandedKeys.value))
}

// 计算样式类名
const treeClasses = computed(() =>
  cn(
    'tree',
    treeNodeVariants({ size: props.size }),
    props.class
  )
)

// 切换展开状态
// 重构：直接修改reactive对象的属性，不需要Ref
const toggleExpand = (nodeState: TreeNodeState) => {
  if (nodeState.node.disabled) return

  const nodeId = nodeState.node.id || nodeState.node.label
  const newExpanded = !nodeState.expanded

  // 直接修改reactive对象的属性，Vue会自动追踪变化
  nodeState.expanded = newExpanded

  if (newExpanded) {
    expandedKeys.value.add(nodeId)
  } else {
    expandedKeys.value.delete(nodeId)
  }

  emit('nodeExpand', nodeState.node, newExpanded, nodeState)
  emit('update:expandedKeys', Array.from(expandedKeys.value))
}

// 切换选中状态
const toggleCheck = (nodeState: TreeNodeState) => {
  if (nodeState.node.disabled || !props.checkable) return

  const newChecked = !nodeState.checked

  // 更新自身及所有子节点
  updateNodeCheckState(nodeState, newChecked)

  // 更新父节点状态
  updateParentCheckState(nodeState)

  emit('checkChange', nodeState.node, newChecked, nodeState)
  emit('update:checkedKeys', Array.from(checkedKeys.value))
}

// 更新节点及其子节点的选中状态
// 重构：直接修改reactive对象的属性，不需要Ref
const updateNodeCheckState = (nodeState: TreeNodeState, checked: boolean) => {
  const nodeId = nodeState.node.id || nodeState.node.label

  // 直接修改reactive对象的属性
  nodeState.checked = checked
  nodeState.indeterminate = false

  if (checked) {
    checkedKeys.value.add(nodeId)
  } else {
    checkedKeys.value.delete(nodeId)
  }

  // 递归更新子节点
  if (nodeState.children && Array.isArray(nodeState.children)) {
    nodeState.children.forEach((child) => {
      updateNodeCheckState(child, checked)
    })
  }
}

// 更新父节点的选中状态
// 重构：直接修改reactive对象的属性，不需要Ref
const updateParentCheckState = (nodeState: TreeNodeState) => {
  if (!nodeState.parent) return

  // 验证 parent 的结构
  const parent = nodeState.parent
  if (!parent.children || !Array.isArray(parent.children)) {
    console.warn('[Tree] Invalid parent node state for:', nodeState.node)
    return
  }

  const allChildrenChecked = parent.children.every((child) => child?.checked ?? false)
  const someChildrenChecked = parent.children.some((child) => (child?.checked ?? false) || (child?.indeterminate ?? false))

  const parentId = parent.node.id || parent.node.label

  // 直接修改reactive对象的属性
  if (allChildrenChecked) {
    parent.checked = true
    parent.indeterminate = false
    checkedKeys.value.add(parentId)
    indeterminateKeys.value.delete(parentId)
  } else if (someChildrenChecked) {
    parent.checked = false
    parent.indeterminate = true
    checkedKeys.value.delete(parentId)
    indeterminateKeys.value.add(parentId)
  } else {
    parent.checked = false
    parent.indeterminate = false
    checkedKeys.value.delete(parentId)
    indeterminateKeys.value.delete(parentId)
  }

  // 递归更新上级父节点
  updateParentCheckState(parent)
}

// 节点点击
const handleNodeClick = (nodeState: TreeNodeState, _event: MouseEvent) => {
  if (nodeState.node.disabled) return

  currentNode.value = nodeState
  emit('nodeClick', nodeState.node, nodeState)

  if (props.expandOnClickNode) {
    toggleExpand(nodeState)
  }
}

// 展开/收起图标点击
const handleExpandClick = (nodeState: TreeNodeState, event: MouseEvent) => {
  event.stopPropagation()
  toggleExpand(nodeState)
}

// 复选框点击
const handleCheckClick = (nodeState: TreeNodeState, event: MouseEvent) => {
  event.stopPropagation()
  toggleCheck(nodeState)
}

// 节点样式类名
const getNodeClasses = (nodeState: TreeNodeState) => {
  const isCurrent = props.highlightCurrent && currentNode.value === nodeState
  return cn(
    treeNodeVariants({ size: props.size }),
    'tree-node flex items-center py-1 px-2 rounded-md cursor-pointer',
    'hover:bg-slate-100 dark:hover:bg-slate-800',
    {
      'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400': isCurrent,
      'opacity-50 cursor-not-allowed pointer-events-none': nodeState.node.disabled,
    }
  )
}

// 节点内容样式类名
const sizeClasses = {
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-2.5',
}

const getNodeContentClasses = computed(() => sizeClasses[props.size])

// 组件实例方法
// 重构：直接访问reactive对象的属性，不需要.value
const getCheckedNodes = (): TreeNode[] => {
  return nodeStates.value
    .filter((ns) => ns.checked)
    .map((ns) => ns.node)
}

const getCheckedKeys = (): Array<string | number> => {
  return Array.from(checkedKeys.value)
}

const setCheckedKeys = (keys: Array<string | number>) => {
  const newSet = new Set(keys)

  nodeStates.value.forEach((nodeState) => {
    const nodeId = nodeState.node.id || nodeState.node.label
    const checked = newSet.has(nodeId)
    updateNodeCheckState(nodeState, checked)
    updateParentCheckState(nodeState)
  })

  emit('update:checkedKeys', keys)
}

const getExpandedKeys = (): Array<string | number> => {
  return Array.from(expandedKeys.value)
}

const setExpandedKeys = (keys: Array<string | number>) => {
  const newSet = new Set(keys)

  nodeStates.value.forEach((nodeState) => {
    const nodeId = nodeState.node.id || nodeState.node.label

    // 直接修改reactive对象的属性
    nodeState.expanded = newSet.has(nodeId)

    if (newSet.has(nodeId)) {
      expandedKeys.value.add(nodeId)
    } else {
      expandedKeys.value.delete(nodeId)
    }
  })

  emit('update:expandedKeys', keys)
}

// 暴露实例方法
defineExpose<TreeInstance>({
  getCheckedNodes,
  getCheckedKeys,
  setCheckedKeys,
  getExpandedKeys,
  setExpandedKeys,
})

// 提供上下文给子组件使用
provide(TREE_CONTEXT_KEY, {
  props,
  currentNode,
  expandedKeys,
  checkedKeys,
  indeterminateKeys,
  toggleExpand,
  toggleCheck,
  handleNodeClick,
  handleExpandClick,
  handleCheckClick,
  getNodeClasses,
  getNodeContentClasses,
})

// 监听数据变化
watch(() => props.data, () => {
  nodeStates.value = initializeNodeStates(props.data)
}, { deep: true })
</script>

<template>
  <div :class="treeClasses">
    <!-- 使用递归的TreeNode组件渲染树节点 -->
    <TreeNodeItem
      v-for="nodeState in nodeStates"
      :key="nodeState.node.id || nodeState.node.label"
      :node-state="nodeState"
    >
      <template v-if="slots.default" #default="slotProps">
        <slot v-bind="slotProps" />
      </template>
    </TreeNodeItem>
  </div>
</template>
