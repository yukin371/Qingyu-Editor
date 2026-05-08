<script setup lang="ts">
/**
 * TreeNodeItem 组件
 *
 * 递归树节点组件，用于渲染树形结构的每个节点
 * 使用template语法确保Vue响应式系统正确追踪状态变化
 * 重构：使用reactive对象代替嵌套Ref，确保响应式正确追踪
 */

import { computed, inject } from 'vue'
import Icon from '../../base/Icon/Icon.vue'
import type { TreeNodeState, TreeNode } from './types'
import { TREE_CONTEXT_KEY } from './constants'

// Props
const props = defineProps<{
  nodeState: TreeNodeState
}>()

// 使用 defineSlots 明确定义 slot 类型，解决递归组件的类型推断问题
defineSlots<{
  default(props: { node: TreeNode; data: TreeNode }): void
}>()

// 从父组件注入的方法
const treeContext = inject<{
  props: any
  currentNode: any
  toggleExpand: (nodeState: TreeNodeState) => void
  toggleCheck: (nodeState: TreeNodeState) => void
  handleNodeClick: (nodeState: TreeNodeState, event: MouseEvent) => void
  handleExpandClick: (nodeState: TreeNodeState, event: MouseEvent) => void
  handleCheckClick: (nodeState: TreeNodeState, event: MouseEvent) => void
  getNodeClasses: (nodeState: TreeNodeState) => string
  getNodeContentClasses: string
}>(TREE_CONTEXT_KEY)

// 计算是否有子节点
const hasChildren = computed(() =>
  props.nodeState.node.children && props.nodeState.node.children.length > 0
)

// 计算展开状态
// 重构：nodeState.expanded现在是reactive对象的属性（boolean），不需要Ref处理
const isExpanded = computed(() => props.nodeState.expanded)

// 计算选中状态
// 重构：nodeState.checked现在是reactive对象的属性（boolean），不需要Ref处理
const isChecked = computed(() => props.nodeState.checked)

// 计算半选状态
// 重构：nodeState.indeterminate现在是reactive对象的属性（boolean），不需要Ref处理
const isIndeterminate = computed(() => props.nodeState.indeterminate)

// 节点点击处理
const onNodeClick = (event: MouseEvent) => {
  treeContext?.handleNodeClick(props.nodeState, event)
}

// 展开/收起图标点击处理
const onExpandClick = (event: MouseEvent) => {
  treeContext?.handleExpandClick(props.nodeState, event)
}

// 复选框点击处理
const onCheckClick = (event: MouseEvent) => {
  treeContext?.handleCheckClick(props.nodeState, event)
}
</script>

<template>
  <div class="tree-node-wrapper">
    <!-- 节点内容 -->
    <div
      :class="treeContext?.getNodeClasses(nodeState)"
      :style="{ paddingLeft: nodeState.level * 16 + 'px' }"
      @click="onNodeClick"
      :tabindex="nodeState.node.disabled ? undefined : '0'"
    >
      <!-- 展开/收起图标 -->
      <span
        :class="[
          'expand-icon flex-shrink-0 cursor-pointer transition-transform duration-200',
          isExpanded && 'rotate-90',
        ].join(' ')"
        @click="onExpandClick"
      >
        <template v-if="hasChildren">
          <Icon name="chevron-right" size="sm" class="text-slate-400" />
        </template>
        <template v-else>
          <span class="w-4 inline-block" />
        </template>
      </span>

      <!-- 复选框 -->
      <span
        v-if="treeContext?.props.checkable"
        :class="['checkbox-wrapper flex-shrink-0 cursor-pointer', nodeState.node.disabled && 'opacity-50'].join(' ')"
        @click="onCheckClick"
      >
        <span
          :class="[
            'checkbox',
            'relative flex-shrink-0 rounded border-2 transition-all duration-200',
            'w-4 h-4 flex items-center justify-center',
            isChecked
              ? 'bg-primary-500 border-primary-500'
              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700',
            isIndeterminate && 'bg-primary-500 border-primary-500',
          ].join(' ')"
        >
          <svg v-if="isChecked" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <svg v-if="isIndeterminate && !isChecked" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clip-rule="evenodd"
            />
          </svg>
        </span>
      </span>

      <!-- 节点内容 -->
      <div :class="['flex items-center flex-1 min-w-0', treeContext?.getNodeContentClasses]">
        <slot :node="nodeState.node" :data="nodeState.node">
          <span class="node-label truncate">{{ nodeState.node.label }}</span>
        </slot>
      </div>
    </div>

    <!-- 子节点（递归渲染） -->
    <!-- 修复：直接使用isExpanded，因为computed已经返回boolean值 -->
    <div
      v-if="hasChildren && isExpanded"
      class="tree-children"
    >
      <TreeNodeItem
        v-for="childState in nodeState.children"
        :key="childState.node.id || childState.node.label"
        :node-state="childState"
      >
        <template #default="slotProps">
          <slot v-bind="slotProps" />
        </template>
      </TreeNodeItem>
    </div>
  </div>
</template>
