<template>
  <li class="qy-tree-node">
    <div
      class="qy-tree-node__label"
      :class="{ selected: selectedKeys.has(nodeId) }"
      :draggable="draggable"
      @dragstart="onDragStart"
      @dragover.prevent
      @drop="onDrop"
      @contextmenu.prevent="$emit('node-contextmenu', { event: $event, node })"
    >
      <button
        v-if="hasChildren"
        class="qy-tree-node__toggle"
        type="button"
        @click="$emit('toggle', nodeId)"
      >
        {{ expandedKeys.has(nodeId) ? '-' : '+' }}
      </button>
      <span v-else class="qy-tree-node__placeholder" />

      <button class="qy-tree-node__text" type="button" @click="$emit('select', node)">
        {{ title }}
      </button>
    </div>

    <ul v-if="hasChildren && expandedKeys.has(nodeId)" class="qy-tree__list qy-tree__list--child">
      <QyTreeNode
        v-for="child in childNodes"
        :key="getNodeKey(child)"
        :node="child"
        :node-key="nodeKey"
        :expanded-keys="expandedKeys"
        :selected-keys="selectedKeys"
        :draggable="draggable"
        @toggle="$emit('toggle', $event)"
        @select="$emit('select', $event)"
        @drop-node="$emit('drop-node', $event)"
        @node-contextmenu="$emit('node-contextmenu', $event)"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TreeNode } from './QyTree.vue'

const props = defineProps<{
  node: TreeNode
  nodeKey: string
  expandedKeys: Set<string>
  selectedKeys: Set<string>
  draggable: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle', id: string): void
  (e: 'select', node: TreeNode): void
  (e: 'drop-node', payload: { dragId: string; dropId: string }): void
  (e: 'node-contextmenu', payload: { event: MouseEvent; node: TreeNode }): void
}>()

const nodeId = computed(() => String((props.node as Record<string, unknown>)[props.nodeKey]))
const childNodes = computed(() => (Array.isArray(props.node.children) ? props.node.children : []))
const hasChildren = computed(() => childNodes.value.length > 0)
const title = computed(() => props.node.title || props.node.label || nodeId.value)

function getNodeKey(node: TreeNode): string {
  return String((node as Record<string, unknown>)[props.nodeKey])
}

function onDragStart(event: DragEvent) {
  event.dataTransfer?.setData('text/plain', nodeId.value)
}

function onDrop(event: DragEvent) {
  const from = event.dataTransfer?.getData('text/plain')
  if (!from || from === nodeId.value) return
  emit('drop-node', { dragId: from, dropId: nodeId.value })
}
</script>

<style scoped>
.qy-tree__list { list-style: none; padding: 0; margin: 0; }
.qy-tree__list--child { padding-left: 16px; }
.qy-tree-node__label { display: flex; align-items: center; gap: 6px; padding: 4px 6px; border-radius: 6px; }
.qy-tree-node__label.selected { background: #ecf5ff; }
.qy-tree-node__toggle, .qy-tree-node__text {
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 0;
}
.qy-tree-node__toggle { width: 16px; color: #606266; }
.qy-tree-node__text { text-align: left; flex: 1; color: #303133; }
.qy-tree-node__placeholder { width: 16px; display: inline-block; }
</style>
