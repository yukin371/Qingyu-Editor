<template>
  <div class="qy-tree">
    <ul class="qy-tree__list">
      <QyTreeNode
        v-for="node in data"
        :key="getNodeKey(node)"
        :node="node"
        :node-key="nodeKey"
        :expanded-keys="expandedKeys"
        :selected-keys="selectedKeySet"
        :draggable="draggable"
        @toggle="toggleExpand"
        @select="handleSelect"
        @drop-node="handleDrop"
        @node-contextmenu="handleContextMenu"
      />
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import QyTreeNode from './QyTreeNode.vue'

export interface TreeNode {
  id: string
  title?: string
  label?: string
  type?: 'volume' | 'chapter' | 'scene' | string
  children?: TreeNode[]
  [key: string]: unknown
}

const props = withDefaults(
  defineProps<{
    data: TreeNode[]
    nodeKey?: string
    selectedKeys?: string[]
    defaultExpandAll?: boolean
    draggable?: boolean
    showLine?: boolean
  }>(),
  {
    nodeKey: 'id',
    selectedKeys: () => [],
    defaultExpandAll: false,
    draggable: false,
    showLine: true,
  },
)

const emit = defineEmits<{
  (e: 'update:selectedKeys', keys: string[]): void
  (e: 'select', node: TreeNode): void
  (e: 'drop-node', payload: { dragId: string; dropId: string }): void
  (e: 'node-contextmenu', payload: { event: MouseEvent; node: TreeNode }): void
}>()

function getNodeKey(node: TreeNode): string {
  return String((node as Record<string, unknown>)[props.nodeKey])
}

function collectAllIds(nodes: TreeNode[]): string[] {
  const acc: string[] = []
  const walk = (list: TreeNode[]) => {
    for (const n of list) {
      acc.push(getNodeKey(n))
      if (Array.isArray(n.children) && n.children.length) walk(n.children)
    }
  }
  walk(nodes)
  return acc
}

const expandedKeys = ref<Set<string>>(new Set(props.defaultExpandAll ? collectAllIds(props.data) : []))
const selectedKeySet = computed(() => new Set(props.selectedKeys))

function toggleExpand(id: string) {
  if (expandedKeys.value.has(id)) expandedKeys.value.delete(id)
  else expandedKeys.value.add(id)
}

function handleSelect(node: TreeNode) {
  const id = getNodeKey(node)
  emit('update:selectedKeys', [id])
  emit('select', node)
}

function handleDrop(payload: { dragId: string; dropId: string }) {
  emit('drop-node', payload)
}

function handleContextMenu(payload: { event: MouseEvent; node: TreeNode }) {
  emit('node-contextmenu', payload)
}
</script>

<style scoped>
.qy-tree { height: 100%; overflow: auto; }
.qy-tree__list { list-style: none; padding: 0; margin: 0; }
</style>
