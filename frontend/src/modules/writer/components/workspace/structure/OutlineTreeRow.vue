<template>
  <article class="outline-tree-row">
    <div
      class="outline-tree-row__main"
      :class="{
        'is-selected': selectedNodeId === node.id,
        'is-dragging': draggingNodeId === node.id,
        'is-volume': isVolumeNode,
        'is-drop-before': dropTargetNodeId === node.id && dropPosition === 'before',
        'is-drop-after': dropTargetNodeId === node.id && dropPosition === 'after',
      }"
      :style="{ '--outline-level': `${depth}` }"
      draggable="true"
      @dragstart="handleDragStart"
      @dragover="handleDragOver"
      @drop="handleDrop"
      @dragend="emit('dragEnd')"
      @contextmenu.prevent="handleContextMenu"
    >
      <span class="outline-tree-row__depth" />
      <button
        type="button"
        class="outline-tree-row__toggle"
        :class="{ 'is-hidden': !hasChildren }"
        @click.stop="hasChildren && emit('toggle', node.id)"
      >
        {{ hasChildren ? (isExpanded ? '−' : '+') : '·' }}
      </button>
      <button type="button" class="outline-tree-row__select" @click="emit('select', node)">
        <span class="outline-tree-row__content">
          <span class="outline-tree-row__title-row">
            <span class="outline-tree-row__title">{{ node.title }}</span>
            <span v-if="boundChapterLabel" class="outline-tree-row__chapter">{{
              boundChapterLabel
            }}</span>
          </span>
          <span v-if="boundChapterId" class="outline-tree-row__meta-row">
            <span class="outline-tree-row__graph" :class="graphToneClass">{{ graphText }}</span>
            <span v-if="assetSummaryText" class="outline-tree-row__asset">{{
              assetSummaryText
            }}</span>
          </span>
        </span>
      </button>
      <button
        v-if="boundChapterId"
        type="button"
        class="outline-tree-row__graph-action"
        @click.stop="emit('openGraph', boundChapterId)"
      >
        {{ graphActionText }}
      </button>
    </div>

    <div v-if="hasChildren && isExpanded" class="outline-tree-row__children">
      <OutlineTreeRow
        v-for="child in node.children || []"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :selected-node-id="selectedNodeId"
        :expanded-node-ids="expandedNodeIds"
        :chapters="chapters"
        :chapter-graphs="chapterGraphs"
        :asset-summary-by-chapter-id="assetSummaryByChapterId"
        :current-chapter-id="currentChapterId"
        :dragging-node-id="draggingNodeId"
        :drop-target-node-id="dropTargetNodeId"
        :drop-position="dropPosition"
        @toggle="emit('toggle', $event)"
        @select="emit('select', $event)"
        @open-graph="emit('openGraph', $event)"
        @drag-start="emit('dragStart', $event)"
        @drag-over="emit('dragOver', $event)"
        @drag-end="emit('dragEnd')"
        @drop-node="emit('dropNode', $event)"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type { ChapterGraph } from '@/modules/writer/types/character'
import type { WriterAssetSummary } from '@/modules/writer/utils/writerAssetRefs'
import type { OutlineNode } from '@/types/writer'
import {
  getBoundChapterId,
  getBoundChapterLabel,
  getStructureNodeGraphState,
} from './structureNodeTypes'

const props = withDefaults(
  defineProps<{
    node: OutlineNode
    depth?: number
    selectedNodeId: string
    expandedNodeIds: string[]
    chapters: SidebarChapterSummary[]
    chapterGraphs?: ChapterGraph[]
    assetSummaryByChapterId?: Record<string, WriterAssetSummary>
    currentChapterId?: string
    draggingNodeId?: string
    dropTargetNodeId?: string
    dropPosition?: 'before' | 'after' | null
  }>(),
  {
    depth: 0,
    chapters: () => [],
    currentChapterId: '',
    draggingNodeId: '',
    dropTargetNodeId: '',
    dropPosition: null,
  },
)

const emit = defineEmits<{
  (e: 'toggle', nodeId: string): void
  (e: 'select', node: OutlineNode): void
  (e: 'openGraph', chapterId: string): void
  (e: 'dragStart', node: OutlineNode): void
  (e: 'dragOver', payload: { node: OutlineNode; event: DragEvent }): void
  (e: 'dragEnd'): void
  (e: 'dropNode', payload: { node: OutlineNode; event: DragEvent }): void
  (e: 'contextmenu', payload: { node: OutlineNode; event: MouseEvent }): void
}>()

const hasChildren = computed(
  () => Array.isArray(props.node.children) && props.node.children.length > 0,
)
const isExpanded = computed(() => props.expandedNodeIds.includes(props.node.id))
const isVolumeNode = computed(() => ((props.node as OutlineNode & { type?: string }).type || '') === 'volume')
const boundChapterId = computed(() => getBoundChapterId(props.node))
const boundChapterLabel = computed(() => getBoundChapterLabel(props.node, props.chapters))
const graphState = computed(() => getStructureNodeGraphState(props.node, props.chapterGraphs || []))
const graphText = computed(() => graphState.value.label)
const graphToneClass = computed(() => `outline-tree-row__graph--${graphState.value.tone}`)
const graphActionText = computed(() =>
  graphState.value.tone === 'missing' ? '创建图谱' : '查看图谱',
)
const assetSummaryText = computed(() => {
  const chapterId = boundChapterId.value
  const summary = chapterId ? props.assetSummaryByChapterId?.[chapterId] : undefined
  if (!summary || summary.total === 0) return ''
  return `资产 ${summary.characters}角 ${summary.locations}地${summary.items > 0 ? ` ${summary.items}物` : ''}`
})

function handleDragStart(event: DragEvent) {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', props.node.id)
  }
  emit('dragStart', props.node)
}

function handleDragOver(event: DragEvent) {
  emit('dragOver', {
    node: props.node,
    event,
  })
}

function handleDrop(event: DragEvent) {
  emit('dropNode', {
    node: props.node,
    event,
  })
}

function handleContextMenu(event: MouseEvent) {
  emit('contextmenu', {
    node: props.node,
    event,
  })
}
</script>

<style scoped lang="scss">
.outline-tree-row {
  display: grid;
  gap: 2px;
}

.outline-tree-row__main {
  width: 100%;
  position: relative;
  border-left: 2px solid transparent;
  border-radius: 4px;
  background: transparent;
  min-height: 34px;
  padding: 4px 6px 4px calc(6px + var(--outline-level, 0) * 14px);
  display: grid;
  grid-template-columns: 6px 20px minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
  transition: background-color 0.14s ease, border-color 0.14s ease, opacity 0.14s ease;
}

.outline-tree-row__main:hover {
  background: #f5f7fb;
  border-left-color: #d1d5db;
}

.outline-tree-row__main.is-selected {
  background: #eaf2ff;
  border-left-color: #2563eb;
}

.outline-tree-row__main.is-volume {
  background: #fff8e8;
  border-left-color: #d4a72c;
}

.outline-tree-row__main.is-volume:hover {
  background: #fff3d6;
  border-left-color: #c99514;
}

.outline-tree-row__main.is-selected.is-volume {
  background: #f5ead0;
  border-left-color: #b9810c;
}

.outline-tree-row__main.is-dragging {
  opacity: 0.56;
}

.outline-tree-row__main.is-drop-before::before,
.outline-tree-row__main.is-drop-after::after {
  content: '';
  position: absolute;
  left: 14px;
  right: 14px;
  height: 2px;
  border-radius: 999px;
  background: #2563eb;
}

.outline-tree-row__main.is-drop-before::before {
  top: -1px;
}

.outline-tree-row__main.is-drop-after::after {
  bottom: -1px;
}

.outline-tree-row__depth {
  width: 2px;
  height: 100%;
  border-radius: 999px;
  background: rgba(209, 213, 219, 0.9);
}

.outline-tree-row__toggle {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.14s ease, color 0.14s ease;
}

.outline-tree-row__toggle:hover:not(.is-hidden) {
  background: rgba(229, 231, 235, 0.75);
  color: #374151;
}

.outline-tree-row__toggle.is-hidden {
  opacity: 0.35;
  cursor: default;
}

.outline-tree-row__select {
  border: 0;
  background: transparent;
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  text-align: left;
  cursor: pointer;
}

.outline-tree-row__content {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.outline-tree-row__title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.outline-tree-row__title {
  min-width: 0;
  color: #111827;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.outline-tree-row__main.is-selected .outline-tree-row__title {
  color: #1d4ed8;
  font-weight: 700;
}

.outline-tree-row__main.is-volume .outline-tree-row__title {
  color: #8a5a00;
  font-weight: 700;
}

.outline-tree-row__chapter {
  color: #9ca3af;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.outline-tree-row__meta-row {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  color: #9ca3af;
  font-size: 11px;
}

.outline-tree-row__graph,
.outline-tree-row__asset {
  display: inline;
  font-size: 11px;
  font-weight: 400;
}

.outline-tree-row__graph {
  color: #9ca3af;
}

.outline-tree-row__graph--ready {
  color: #2e6a3d;
}

.outline-tree-row__graph--inherit {
  color: #2c4d66;
}

.outline-tree-row__graph--missing {
  color: #9a551f;
}

.outline-tree-row__graph--unbound {
  color: #9ca3af;
}

.outline-tree-row__asset {
  color: #9ca3af;
}

.outline-tree-row__meta-row > span + span::before {
  content: '·';
  margin-right: 4px;
  color: #c0c7d1;
}

.outline-tree-row__graph-action {
  align-self: center;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #6b7280;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 6px;
  cursor: pointer;
  transition: background-color 0.14s ease, color 0.14s ease;
}

.outline-tree-row__graph-action:hover {
  background: rgba(229, 231, 235, 0.75);
  color: #374151;
}

.outline-tree-row__children {
  display: grid;
  gap: 2px;
}
</style>
