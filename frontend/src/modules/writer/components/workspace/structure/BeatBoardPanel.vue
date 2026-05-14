<template>
  <section class="beat-board-panel">
    <div class="beat-board-panel__header">
      <div>
        <p class="beat-board-panel__eyebrow">Beat Board</p>
        <h3 class="beat-board-panel__title">节拍板</h3>
      </div>
      <div class="beat-board-panel__badge">{{ beats.length }} 张卡片</div>
    </div>

    <div class="beat-board-panel__lanes">
      <article v-for="lane in lanes" :key="lane.id" class="beat-lane">
        <div class="beat-lane__head">
          <strong>{{ lane.label }}</strong>
          <span>{{ lane.items.length }}</span>
        </div>

        <div class="beat-lane__body">
          <article
            v-for="beat in lane.items"
            :key="beat.id"
            class="beat-card"
            :class="{
              'is-selected': selectedNodeId === beat.id,
              'is-dragging': dragState.draggingNodeId === beat.id,
              'is-drop-before': dragState.targetNodeId === beat.id && dragState.position === 'before',
              'is-drop-after': dragState.targetNodeId === beat.id && dragState.position === 'after',
            }"
            draggable="true"
            @click="emit('select', beat)"
            @dragstart="handleDragStart(beat, lane.id, $event)"
            @dragover="handleDragOver(beat, lane.id, $event)"
            @drop="handleDrop(beat, lane.id, $event)"
            @dragend="resetDragState"
          >
            <span class="beat-card__level">L{{ beat.level || 1 }}</span>
            <span class="beat-card__title">{{ beat.title }}</span>
            <span class="beat-card__desc">{{ beat.description || '补充该节点的事件目标、阻力与结果。' }}</span>
            <span class="beat-card__meta-row">
              <span class="beat-card__meta" :class="bindingStateToneClass(beat)">{{ bindingStateText(beat) }}</span>
              <span v-if="assetSummaryText(beat)" class="beat-card__asset">{{ assetSummaryText(beat) }}</span>
              <span
                v-if="boundChapterId(beat)"
                class="beat-card__graph"
                :class="graphToneClass(beat)"
              >{{ graphText(beat) }}</span>
              <span class="beat-card__status">{{ statusText(beat) }}</span>
            </span>
            <span class="beat-card__status-actions">
              <button
                v-for="option in statusOptions"
                :key="option.value"
                type="button"
                class="beat-card__status-action"
                :class="{ 'is-active': isStatusActive(beat, option.value) }"
                @click.stop="emit('updateStatus', beat, option.value)"
              >
                {{ option.label }}
              </button>
            </span>
            <span v-if="boundChapterLabel(beat)" class="beat-card__chapter">落地章节 · {{ boundChapterLabel(beat) }}</span>
            <span class="beat-card__actions">
              <button
                type="button"
                class="beat-card__action beat-card__action--ghost"
                @click.stop="emit('editNode', beat)"
              >
                编辑
              </button>
              <button
                type="button"
                class="beat-card__action beat-card__action--ghost"
                :disabled="!canMoveUp?.(beat)"
                @click.stop="emit('moveUp', beat)"
              >
                上移
              </button>
              <button
                type="button"
                class="beat-card__action beat-card__action--ghost"
                :disabled="!canMoveDown?.(beat)"
                @click.stop="emit('moveDown', beat)"
              >
                下移
              </button>
              <button
                type="button"
                class="beat-card__action beat-card__action--secondary"
                @click.stop="emit('createChildNode', beat)"
              >
                续子节点
              </button>
              <button
                v-if="canBindCurrentChapter(beat)"
                type="button"
                class="beat-card__action beat-card__action--info"
                @click.stop="emit('bindCurrentChapter', beat)"
              >
                绑定当前章节
              </button>
              <button
                v-if="boundChapterId(beat)"
                type="button"
                class="beat-card__action beat-card__action--ghost"
                @click.stop="emit('unbindChapter', beat)"
              >
                解绑
              </button>
              <button
                v-if="boundChapterId(beat)"
                type="button"
                class="beat-card__action"
                @click.stop="emit('jumpToChapter', boundChapterId(beat))"
              >
                跳转正文
              </button>
              <button
                v-if="boundChapterId(beat)"
                type="button"
                class="beat-card__action beat-card__action--graph"
                @click.stop="emit('openGraph', boundChapterId(beat))"
              >
                {{ graphActionText(beat) }}
              </button>
            </span>
          </article>

          <div v-if="lane.items.length === 0" class="beat-lane__empty">
            {{ loading ? '正在整理节拍卡片…' : '当前泳道暂无节点' }}
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import type { OutlineNode } from '@/types/writer'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type { ChapterGraph } from '@/modules/writer/types/character'
import type { WriterAssetSummary } from '@/modules/writer/utils/writerAssetRefs'
import {
  STRUCTURE_STATUS_OPTIONS,
  type StructureStatusValue,
  getBoundChapterId,
  getBoundChapterLabel,
  getStructureNodeBindingState,
  getStructureNodeGraphState,
  getStructureNodeLane,
  getStructureNodeStatusText,
} from './structureNodeTypes'

type TreeDropPosition = 'before' | 'after'

const props = defineProps<{
  beats: OutlineNode[]
  selectedNodeId: string
  chapters: SidebarChapterSummary[]
  chapterGraphs?: ChapterGraph[]
  assetSummaryByChapterId?: Record<string, WriterAssetSummary>
  currentChapterId?: string
  loading?: boolean
  canMoveUp?: (node: OutlineNode) => boolean
  canMoveDown?: (node: OutlineNode) => boolean
}>()

const emit = defineEmits<{
  (e: 'select', node: OutlineNode): void
  (e: 'editNode', node: OutlineNode): void
  (e: 'moveUp', node: OutlineNode): void
  (e: 'moveDown', node: OutlineNode): void
  (e: 'createChildNode', node: OutlineNode): void
  (e: 'bindCurrentChapter', node: OutlineNode): void
  (e: 'unbindChapter', node: OutlineNode): void
  (e: 'updateStatus', node: OutlineNode, status: StructureStatusValue): void
  (e: 'openGraph', chapterId: string): void
  (e: 'jumpToChapter', chapterId: string): void
  (e: 'reorder', payload: { draggedNodeId: string; targetNodeId: string; position: TreeDropPosition }): void
}>()

const statusOptions = STRUCTURE_STATUS_OPTIONS
const dragState = reactive<{
  draggingNodeId: string
  draggingParentId: string
  draggingLaneId: string
  targetNodeId: string
  position: TreeDropPosition | null
}>({
  draggingNodeId: '',
  draggingParentId: '',
  draggingLaneId: '',
  targetNodeId: '',
  position: null,
})

const lanes = computed(() => {
  const buckets = [
    { id: 'draft', label: '待成形', items: [] as OutlineNode[] },
    { id: 'writing', label: '推进中', items: [] as OutlineNode[] },
    { id: 'completed', label: '已稳定', items: [] as OutlineNode[] },
  ]

  for (const beat of props.beats) {
    const lane = getStructureNodeLane(beat)
    if (lane === 'completed') buckets[2].items.push(beat)
    else if (lane === 'writing') buckets[1].items.push(beat)
    else buckets[0].items.push(beat)
  }

  return buckets
})

function bindingStateText(beat: OutlineNode) {
  return getStructureNodeBindingState(beat).label
}

function bindingStateToneClass(beat: OutlineNode) {
  return getStructureNodeBindingState(beat).tone === 'linked'
    ? 'beat-card__meta--linked'
    : 'beat-card__meta--unlinked'
}

function statusText(beat: OutlineNode) {
  return getStructureNodeStatusText(beat)
}

function boundChapterId(beat: OutlineNode) {
  return getBoundChapterId(beat)
}

function boundChapterLabel(beat: OutlineNode) {
  return getBoundChapterLabel(beat, props.chapters)
}

function assetSummaryText(beat: OutlineNode) {
  const chapterId = boundChapterId(beat)
  const summary = chapterId ? props.assetSummaryByChapterId?.[chapterId] : undefined
  if (!summary || summary.total === 0) return ''
  return `${summary.characters}角 ${summary.locations}地${summary.items > 0 ? ` ${summary.items}物` : ''}`
}

function canBindCurrentChapter(beat: OutlineNode) {
  return !!props.currentChapterId && boundChapterId(beat) !== props.currentChapterId
}

function graphText(beat: OutlineNode) {
  return getStructureNodeGraphState(beat, props.chapterGraphs || []).label
}

function graphToneClass(beat: OutlineNode) {
  return `beat-card__graph--${getStructureNodeGraphState(beat, props.chapterGraphs || []).tone}`
}

function graphActionText(beat: OutlineNode) {
  return getStructureNodeGraphState(beat, props.chapterGraphs || []).tone === 'missing' ? '创建图谱' : '查看图谱'
}

function isStatusActive(beat: OutlineNode, status: StructureStatusValue) {
  return (beat.status || 'planned') === status
}

function normalizeParentId(parentId: string | undefined): string {
  return parentId || ''
}

function resetDragState() {
  dragState.draggingNodeId = ''
  dragState.draggingParentId = ''
  dragState.draggingLaneId = ''
  dragState.targetNodeId = ''
  dragState.position = null
}

function handleDragStart(beat: OutlineNode, laneId: string, event: DragEvent) {
  dragState.draggingNodeId = beat.id
  dragState.draggingParentId = normalizeParentId(beat.parentId)
  dragState.draggingLaneId = laneId
  dragState.targetNodeId = ''
  dragState.position = null
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', beat.id)
  }
  emit('select', beat)
}

function handleDragOver(beat: OutlineNode, laneId: string, event: DragEvent) {
  if (!dragState.draggingNodeId || dragState.draggingNodeId === beat.id) return
  if (dragState.draggingLaneId !== laneId) return
  if (normalizeParentId(beat.parentId) !== dragState.draggingParentId) return

  const targetElement = event.currentTarget as HTMLElement | null
  if (!targetElement) return

  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'

  const rect = targetElement.getBoundingClientRect()
  dragState.targetNodeId = beat.id
  dragState.position = event.clientY <= rect.top + rect.height / 2 ? 'before' : 'after'
}

function handleDrop(beat: OutlineNode, laneId: string, event: DragEvent) {
  if (
    !dragState.draggingNodeId ||
    !dragState.position ||
    dragState.draggingNodeId === beat.id ||
    dragState.draggingLaneId !== laneId ||
    normalizeParentId(beat.parentId) !== dragState.draggingParentId
  ) {
    resetDragState()
    return
  }

  event.preventDefault()
  emit('reorder', {
    draggedNodeId: dragState.draggingNodeId,
    targetNodeId: beat.id,
    position: dragState.position,
  })
  resetDragState()
}
</script>

<style scoped lang="scss">
.beat-board-panel {
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  border: 1px solid rgba(91, 72, 50, 0.14);
  background: linear-gradient(180deg, rgba(255, 251, 246, 0.98), rgba(243, 233, 220, 0.95));
  box-shadow: 0 16px 32px rgba(80, 49, 26, 0.08);
  overflow: hidden;
}

.beat-board-panel__header {
  padding: 18px 18px 14px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgba(91, 72, 50, 0.1);
}

.beat-board-panel__eyebrow {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #8f3f2f;
  font-weight: 800;
}

.beat-board-panel__title {
  margin: 6px 0 0;
  font-size: 22px;
  color: #2e2b27;
}

.beat-board-panel__badge {
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(54, 80, 107, 0.08);
  border: 1px solid rgba(54, 80, 107, 0.14);
  color: #27425c;
  font-size: 12px;
  font-weight: 700;
}

.beat-board-panel__lanes {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 14px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.beat-lane {
  min-height: 0;
  border-radius: 18px;
  background: color-mix(in srgb, var(--editor-layer-panel, #fffcf8) 88%, transparent);
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(117, 93, 67, 0.14)) 72%, transparent);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.beat-lane::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: linear-gradient(90deg, rgba(143, 63, 47, 0.66), rgba(183, 109, 56, 0.44));
  opacity: 0.52;
}

.beat-lane__head {
  padding: 12px 14px;
  border-bottom: 1px solid color-mix(in srgb, var(--editor-border, rgba(117, 93, 67, 0.12)) 68%, transparent);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--editor-text-secondary, #5c5045);
  font-size: 13px;
}

.beat-lane__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
  display: grid;
  gap: 10px;
}

.beat-card {
  position: relative;
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(117, 93, 67, 0.14)) 72%, transparent);
  border-radius: 16px;
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 92%, transparent);
  padding: 12px;
  display: grid;
  gap: 8px;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.beat-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--editor-accent, #8f3f2f) 24%, transparent);
  box-shadow: var(--editor-shadow-md, 0 16px 24px rgba(99, 60, 30, 0.08));
}

.beat-card.is-selected {
  border-color: color-mix(in srgb, var(--editor-accent, #8f3f2f) 38%, transparent);
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--editor-accent-soft, #fff7ed) 82%, transparent),
    color-mix(in srgb, var(--editor-layer-strong, #f6e0c7) 88%, transparent)
  );
  box-shadow: var(--editor-shadow-lg, 0 14px 24px rgba(99, 60, 30, 0.1));
}

.beat-card.is-dragging {
  opacity: 0.56;
}

.beat-card.is-drop-before::before,
.beat-card.is-drop-after::after {
  content: '';
  position: absolute;
  left: 10px;
  right: 10px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, #8f3f2f, #b76d38);
  box-shadow: 0 0 0 3px rgba(143, 63, 47, 0.1);
}

.beat-card.is-drop-before::before {
  top: -3px;
}

.beat-card.is-drop-after::after {
  bottom: -3px;
}

.beat-card__level {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--editor-accent, #8f3f2f);
}

.beat-card__title {
  color: var(--editor-text-primary, #2f2b26);
  font-size: 14px;
  font-weight: 700;
}

.beat-card__desc {
  color: var(--editor-text-secondary, #6c5f54);
  font-size: 12px;
  line-height: 1.55;
}

.beat-card__meta {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(117, 93, 67, 0.16)) 72%, transparent);
  background: color-mix(in srgb, var(--editor-layer-strong, #f6efe6) 92%, transparent);
  color: var(--editor-text-muted, #7a6250);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
}

.beat-card__meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.beat-card__meta--linked {
  border-color: rgba(54, 80, 107, 0.18);
  background: rgba(232, 241, 248, 0.92);
  color: #27425c;
}

.beat-card__meta--unlinked {
  border-color: rgba(117, 93, 67, 0.16);
}

.beat-card__graph {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: 999px;
  border: 1px solid rgba(117, 93, 67, 0.14);
  background: color-mix(in srgb, var(--editor-layer-panel, #fffbf6) 92%, transparent);
  color: var(--editor-text-secondary, #6e6155);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
}

.beat-card__asset {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: 999px;
  border: 1px solid rgba(84, 116, 79, 0.16);
  background: rgba(239, 247, 236, 0.94);
  color: #41613a;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
}

.beat-card__graph--ready {
  border-color: rgba(74, 127, 88, 0.18);
  background: rgba(232, 245, 236, 0.94);
  color: #2e6a3d;
}

.beat-card__graph--inherit {
  border-color: rgba(54, 80, 107, 0.18);
  background: rgba(235, 244, 249, 0.94);
  color: #2c4d66;
}

.beat-card__graph--missing {
  border-color: rgba(183, 109, 56, 0.18);
  background: rgba(255, 243, 230, 0.94);
  color: #9a551f;
}

.beat-card__graph--unbound {
  border-color: rgba(117, 93, 67, 0.14);
  background: rgba(248, 241, 233, 0.92);
  color: #7b6a5b;
}

.beat-card__status {
  color: #8b7a6c;
  font-size: 11px;
  font-weight: 700;
}

.beat-card__chapter {
  color: #5f5348;
  font-size: 12px;
  line-height: 1.5;
}

.beat-card__status-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.beat-card__status-action {
  border: 1px solid rgba(117, 93, 67, 0.14);
  border-radius: 999px;
  background: rgba(255, 252, 247, 0.92);
  color: #74675d;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 8px;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    background 0.16s ease,
    border-color 0.16s ease;
}

.beat-card__status-action:hover,
.beat-card__action:hover {
  transform: translateY(-1px);
}

.beat-card__status-action.is-active {
  border-color: rgba(143, 63, 47, 0.22);
  background: rgba(255, 242, 227, 0.96);
  color: #8f3f2f;
}

.beat-card__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.beat-card__action {
  border: 1px solid rgba(143, 63, 47, 0.18);
  border-radius: 999px;
  background: rgba(255, 247, 237, 0.96);
  color: #8f3f2f;
  font-size: 11px;
  font-weight: 800;
  padding: 5px 9px;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    background 0.16s ease;
}

.beat-card__action--secondary {
  border-color: rgba(54, 80, 107, 0.16);
  background: rgba(240, 246, 250, 0.96);
  color: #27425c;
}

.beat-card__action--ghost {
  border-color: rgba(117, 93, 67, 0.16);
  background: rgba(255, 252, 247, 0.94);
  color: #5f5348;
}

.beat-card__action--info {
  border-color: rgba(68, 103, 129, 0.16);
  background: rgba(235, 244, 249, 0.96);
  color: #32536a;
}

.beat-card__action--graph {
  border-color: rgba(74, 127, 88, 0.16);
  background: rgba(232, 245, 236, 0.96);
  color: #2e6a3d;
}

.beat-lane__empty {
  border-radius: 14px;
  border: 1px dashed rgba(117, 93, 67, 0.18);
  background: rgba(255, 252, 247, 0.86);
  padding: 14px;
  color: #7a6d63;
  font-size: 12px;
}

@media (max-width: 1180px) {
  .beat-board-panel__lanes {
    grid-template-columns: 1fr;
  }
}
</style>
