<template>
  <section class="fishbone-outline-board">
    <div class="fishbone-outline-board__header">
      <div>
        <p class="fishbone-outline-board__eyebrow">Fishbone</p>
        <h3 class="fishbone-outline-board__title">细纲鱼骨图</h3>
      </div>
      <div class="fishbone-outline-board__hint">适合观察主干章节与上下支节的失衡、堆积与断层。</div>
    </div>

    <div class="fishbone-outline-board__scroll">
      <div v-if="nodes.length" class="fishbone-outline-board__spine">
        <article
          v-for="node in nodes"
          :key="node.id"
          class="fishbone-outline-board__segment"
          :class="{ 'is-selected': selectedNodeId === node.id }"
        >
          <div class="fishbone-outline-board__top">
            <article
              v-for="child in topChildren(node)"
              :key="child.id"
              class="fishbone-leaf fishbone-leaf--top"
              :class="{ 'is-selected': selectedNodeId === child.id }"
            >
              <span class="fishbone-leaf__line" />
              <div class="fishbone-leaf__body">
                <button type="button" class="fishbone-leaf__card" @click="emit('select', child)">
                  <strong>{{ child.title }}</strong>
                  <small>{{ boundChapterLabel(child) || bindingText(child) }}</small>
                  <small v-if="assetSummaryText(child)" class="fishbone-leaf__asset">{{ assetSummaryText(child) }}</small>
                  <small
                    v-if="boundChapterId(child)"
                    class="fishbone-leaf__graph"
                    :class="graphToneClass(child)"
                  >{{ graphText(child) }}</small>
                </button>
                <span v-if="selectedNodeId === child.id" class="fishbone-leaf__actions">
                  <span class="fishbone-leaf__status-actions">
                    <button
                      v-for="option in statusOptions"
                      :key="option.value"
                      type="button"
                      class="fishbone-status-action"
                      :class="{ 'is-active': isStatusActive(child, option.value) }"
                      @click.stop="emit('updateStatus', child, option.value)"
                    >
                      {{ option.label }}
                    </button>
                  </span>
                  <button type="button" class="fishbone-action fishbone-action--ghost" @click.stop="emit('editNode', child)">
                    编辑
                  </button>
                  <button
                    type="button"
                    class="fishbone-action fishbone-action--ghost"
                    :disabled="!canMoveUp?.(child)"
                    @click.stop="emit('moveUp', child)"
                  >
                    上移
                  </button>
                  <button
                    type="button"
                    class="fishbone-action fishbone-action--ghost"
                    :disabled="!canMoveDown?.(child)"
                    @click.stop="emit('moveDown', child)"
                  >
                    下移
                  </button>
                  <button
                    type="button"
                    class="fishbone-action fishbone-action--secondary"
                    @click.stop="emit('createChildNode', child)"
                  >
                    续子节点
                  </button>
                  <button
                    v-if="canBindCurrentChapter(child)"
                    type="button"
                    class="fishbone-action fishbone-action--info"
                    @click.stop="emit('bindCurrentChapter', child)"
                  >
                    绑定当前章节
                  </button>
                  <button
                    v-if="boundChapterId(child)"
                    type="button"
                    class="fishbone-action fishbone-action--ghost"
                    @click.stop="emit('unbindChapter', child)"
                  >
                    解绑
                  </button>
                  <button
                    v-if="boundChapterId(child)"
                    type="button"
                    class="fishbone-action"
                    @click.stop="emit('jumpToChapter', boundChapterId(child))"
                  >
                    跳转正文
                  </button>
                  <button
                    v-if="boundChapterId(child)"
                    type="button"
                    class="fishbone-action fishbone-action--graph"
                    @click.stop="emit('openGraph', boundChapterId(child))"
                  >
                    {{ graphActionText(child) }}
                  </button>
                </span>
              </div>
            </article>
          </div>

          <button type="button" class="fishbone-spine-node" @click="emit('select', node)">
            <span class="fishbone-spine-node__index">L{{ node.level || 1 }}</span>
            <span class="fishbone-spine-node__title">{{ node.title }}</span>
            <span class="fishbone-spine-node__meta">
              <span class="fishbone-binding-tag" :class="bindingToneClass(node)">{{ bindingText(node) }}</span>
              <span v-if="boundChapterLabel(node)" class="fishbone-binding-chapter">{{ boundChapterLabel(node) }}</span>
              <span v-if="assetSummaryText(node)" class="fishbone-asset-tag">{{ assetSummaryText(node) }}</span>
              <span
                v-if="boundChapterId(node)"
                class="fishbone-graph-tag"
                :class="graphToneClass(node)"
              >{{ graphText(node) }}</span>
            </span>
            <span class="fishbone-spine-node__status-actions">
              <button
                v-for="option in statusOptions"
                :key="option.value"
                type="button"
                class="fishbone-status-action"
                :class="{ 'is-active': isStatusActive(node, option.value) }"
                @click.stop="emit('updateStatus', node, option.value)"
              >
                {{ option.label }}
              </button>
            </span>
            <span class="fishbone-spine-node__actions">
              <button
                type="button"
                class="fishbone-action fishbone-action--ghost"
                @click.stop="emit('editNode', node)"
              >
                编辑
              </button>
              <button
                type="button"
                class="fishbone-action fishbone-action--ghost"
                :disabled="!canMoveUp?.(node)"
                @click.stop="emit('moveUp', node)"
              >
                上移
              </button>
              <button
                type="button"
                class="fishbone-action fishbone-action--ghost"
                :disabled="!canMoveDown?.(node)"
                @click.stop="emit('moveDown', node)"
              >
                下移
              </button>
              <button
                type="button"
                class="fishbone-action fishbone-action--secondary"
                @click.stop="emit('createChildNode', node)"
              >
                续子节点
              </button>
              <button
                v-if="canBindCurrentChapter(node)"
                type="button"
                class="fishbone-action fishbone-action--info"
                @click.stop="emit('bindCurrentChapter', node)"
              >
                绑定当前章节
              </button>
              <button
                v-if="boundChapterId(node)"
                type="button"
                class="fishbone-action fishbone-action--ghost"
                @click.stop="emit('unbindChapter', node)"
              >
                解绑
              </button>
              <button
                v-if="boundChapterId(node)"
                type="button"
                class="fishbone-action"
                @click.stop="emit('jumpToChapter', boundChapterId(node))"
              >
                跳转正文
              </button>
              <button
                v-if="boundChapterId(node)"
                type="button"
                class="fishbone-action fishbone-action--graph"
                @click.stop="emit('openGraph', boundChapterId(node))"
              >
                {{ graphActionText(node) }}
              </button>
            </span>
          </button>

          <div class="fishbone-outline-board__bottom">
            <article
              v-for="child in bottomChildren(node)"
              :key="child.id"
              class="fishbone-leaf fishbone-leaf--bottom"
              :class="{ 'is-selected': selectedNodeId === child.id }"
            >
              <div class="fishbone-leaf__body">
                <button type="button" class="fishbone-leaf__card" @click="emit('select', child)">
                  <strong>{{ child.title }}</strong>
                  <small>{{ boundChapterLabel(child) || bindingText(child) }}</small>
                  <small v-if="assetSummaryText(child)" class="fishbone-leaf__asset">{{ assetSummaryText(child) }}</small>
                  <small
                    v-if="boundChapterId(child)"
                    class="fishbone-leaf__graph"
                    :class="graphToneClass(child)"
                  >{{ graphText(child) }}</small>
                </button>
                <span v-if="selectedNodeId === child.id" class="fishbone-leaf__actions">
                  <span class="fishbone-leaf__status-actions">
                    <button
                      v-for="option in statusOptions"
                      :key="option.value"
                      type="button"
                      class="fishbone-status-action"
                      :class="{ 'is-active': isStatusActive(child, option.value) }"
                      @click.stop="emit('updateStatus', child, option.value)"
                    >
                      {{ option.label }}
                    </button>
                  </span>
                  <button type="button" class="fishbone-action fishbone-action--ghost" @click.stop="emit('editNode', child)">
                    编辑
                  </button>
                  <button
                    type="button"
                    class="fishbone-action fishbone-action--ghost"
                    :disabled="!canMoveUp?.(child)"
                    @click.stop="emit('moveUp', child)"
                  >
                    上移
                  </button>
                  <button
                    type="button"
                    class="fishbone-action fishbone-action--ghost"
                    :disabled="!canMoveDown?.(child)"
                    @click.stop="emit('moveDown', child)"
                  >
                    下移
                  </button>
                  <button
                    type="button"
                    class="fishbone-action fishbone-action--secondary"
                    @click.stop="emit('createChildNode', child)"
                  >
                    续子节点
                  </button>
                  <button
                    v-if="canBindCurrentChapter(child)"
                    type="button"
                    class="fishbone-action fishbone-action--info"
                    @click.stop="emit('bindCurrentChapter', child)"
                  >
                    绑定当前章节
                  </button>
                  <button
                    v-if="boundChapterId(child)"
                    type="button"
                    class="fishbone-action fishbone-action--ghost"
                    @click.stop="emit('unbindChapter', child)"
                  >
                    解绑
                  </button>
                  <button
                    v-if="boundChapterId(child)"
                    type="button"
                    class="fishbone-action"
                    @click.stop="emit('jumpToChapter', boundChapterId(child))"
                  >
                    跳转正文
                  </button>
                  <button
                    v-if="boundChapterId(child)"
                    type="button"
                    class="fishbone-action fishbone-action--graph"
                    @click.stop="emit('openGraph', boundChapterId(child))"
                  >
                    {{ graphActionText(child) }}
                  </button>
                </span>
              </div>
              <span class="fishbone-leaf__line" />
            </article>
          </div>
        </article>
      </div>
      <div v-else-if="loading" class="fishbone-outline-board__empty fishbone-outline-board__empty--loading">
        正在整理鱼骨主干与细纲分支。
      </div>
      <div v-else class="fishbone-outline-board__empty">暂无可视化结构。加载大纲树后，鱼骨图会自动展示章节主干与细纲支节。</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type { ChapterGraph } from '@/modules/writer/types/character'
import type { OutlineNode } from '@/types/writer'
import type { WriterAssetSummary } from '@/modules/writer/utils/writerAssetRefs'
import {
  STRUCTURE_STATUS_OPTIONS,
  type StructureStatusValue,
  getBoundChapterId,
  getBoundChapterLabel,
  getStructureNodeBindingState,
  getStructureNodeGraphState,
} from './structureNodeTypes'

const props = defineProps<{
  nodes: OutlineNode[]
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
}>()

const statusOptions = STRUCTURE_STATUS_OPTIONS

function topChildren(node: OutlineNode): OutlineNode[] {
  return (node.children || []).filter((_, index) => index % 2 === 0)
}

function bottomChildren(node: OutlineNode): OutlineNode[] {
  return (node.children || []).filter((_, index) => index % 2 === 1)
}

function bindingText(node: OutlineNode): string {
  return getStructureNodeBindingState(node).label
}

function bindingToneClass(node: OutlineNode): string {
  return getStructureNodeBindingState(node).tone === 'linked'
    ? 'fishbone-binding-tag--linked'
    : 'fishbone-binding-tag--unlinked'
}

function boundChapterLabel(node: OutlineNode): string {
  return getBoundChapterLabel(node, props.chapters)
}

function graphText(node: OutlineNode): string {
  return getStructureNodeGraphState(node, props.chapterGraphs || []).label
}

function graphToneClass(node: OutlineNode): string {
  return `fishbone-graph-tag--${getStructureNodeGraphState(node, props.chapterGraphs || []).tone}`
}

function graphActionText(node: OutlineNode): string {
  return getStructureNodeGraphState(node, props.chapterGraphs || []).tone === 'missing' ? '创建图谱' : '查看图谱'
}

function boundChapterId(node: OutlineNode): string {
  return getBoundChapterId(node)
}

function assetSummaryText(node: OutlineNode): string {
  const chapterId = boundChapterId(node)
  const summary = chapterId ? props.assetSummaryByChapterId?.[chapterId] : undefined
  if (!summary || summary.total === 0) return ''
  return `${summary.characters}角 ${summary.locations}地${summary.items > 0 ? ` ${summary.items}物` : ''}`
}

function canBindCurrentChapter(node: OutlineNode): boolean {
  return !!props.currentChapterId && boundChapterId(node) !== props.currentChapterId
}

function isStatusActive(node: OutlineNode, status: StructureStatusValue): boolean {
  return (node.status || 'planned') === status
}
</script>

<style scoped lang="scss">
.fishbone-outline-board {
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  border: 1px solid rgba(91, 72, 50, 0.14);
  background:
    radial-gradient(circle at 12% 0%, rgba(183, 109, 56, 0.14), transparent 28%),
    linear-gradient(180deg, rgba(255, 251, 246, 0.99), rgba(244, 234, 219, 0.96));
  box-shadow: 0 18px 34px rgba(80, 49, 26, 0.08);
  overflow: hidden;
}

.fishbone-outline-board__header {
  padding: 18px 18px 14px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgba(91, 72, 50, 0.1);
}

.fishbone-outline-board__eyebrow {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #8f3f2f;
  font-weight: 800;
}

.fishbone-outline-board__title {
  margin: 6px 0 0;
  font-size: 22px;
  color: #2e2b27;
}

.fishbone-outline-board__hint {
  max-width: 320px;
  color: #74675d;
  font-size: 13px;
  line-height: 1.5;
}

.fishbone-outline-board__scroll {
  flex: 1;
  min-height: 0;
  overflow: auto hidden;
  padding: 24px 18px 20px;
}

.fishbone-outline-board__spine {
  min-width: max-content;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 90px 26px;
}

.fishbone-outline-board__segment {
  position: relative;
  width: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease;
}

.fishbone-outline-board__segment:hover {
  transform: translateY(-2px);
}

.fishbone-outline-board__segment::after {
  content: '';
  position: absolute;
  top: 50%;
  left: calc(100% - 8px);
  width: 34px;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(183, 109, 56, 0.22), rgba(143, 63, 47, 0.5));
  transform: translateY(-50%);
}

.fishbone-outline-board__segment:last-child::after {
  display: none;
}

.fishbone-outline-board__segment.is-selected .fishbone-spine-node {
  border-color: rgba(143, 63, 47, 0.42);
  background: linear-gradient(135deg, #fff7ed, #f6e0c7);
  box-shadow: 0 18px 30px rgba(99, 60, 30, 0.12);
}

.fishbone-outline-board__top,
.fishbone-outline-board__bottom {
  width: 100%;
  min-height: 98px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.fishbone-outline-board__top {
  align-items: flex-end;
}

.fishbone-outline-board__bottom {
  align-items: flex-start;
}

.fishbone-spine-node {
  width: 100%;
  min-height: 74px;
  border: 1px solid rgba(117, 93, 67, 0.16);
  border-radius: 22px;
  background: rgba(255, 252, 248, 0.92);
  padding: 14px 16px;
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

.fishbone-spine-node:hover {
  transform: translateY(-1px);
  border-color: rgba(143, 63, 47, 0.2);
  box-shadow: 0 18px 28px rgba(99, 60, 30, 0.08);
}

.fishbone-spine-node__index {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #8f3f2f;
}

.fishbone-spine-node__title {
  font-size: 15px;
  font-weight: 700;
  color: #2f2b26;
}

.fishbone-spine-node__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.fishbone-spine-node__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.fishbone-spine-node__status-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.fishbone-leaf {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.fishbone-leaf__body {
  display: grid;
  justify-items: center;
  gap: 6px;
}

.fishbone-leaf__line {
  width: 2px;
  height: 26px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(183, 109, 56, 0.18), rgba(143, 63, 47, 0.5));
}

.fishbone-leaf__card {
  border: 1px solid rgba(117, 93, 67, 0.14);
  background: rgba(255, 253, 249, 0.96);
  cursor: pointer;
  max-width: 112px;
  border-radius: 14px;
  padding: 8px 10px;
  color: #5a4d40;
  font-size: 12px;
  line-height: 1.45;
  text-align: center;
  appearance: none;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.fishbone-leaf__card:hover {
  transform: translateY(-1px);
  border-color: rgba(143, 63, 47, 0.2);
  box-shadow: 0 12px 18px rgba(99, 60, 30, 0.08);
}

.fishbone-leaf__card strong,
.fishbone-leaf__card small {
  display: block;
}

.fishbone-leaf__card strong {
  font-size: 12px;
  font-weight: 700;
}

.fishbone-leaf__card small {
  margin-top: 4px;
  font-size: 10px;
  line-height: 1.4;
  color: #8b7a6c;
}

.fishbone-leaf__asset {
  color: #41613a !important;
}

.fishbone-leaf__graph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  margin: 6px auto 0;
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px solid rgba(117, 93, 67, 0.14);
  background: rgba(255, 251, 246, 0.92);
}

.fishbone-leaf.is-selected .fishbone-leaf__card {
  border-color: rgba(143, 63, 47, 0.34);
  background: rgba(250, 234, 214, 0.98);
  color: #7b3123;
}

.fishbone-leaf__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  max-width: 188px;
}

.fishbone-leaf__status-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  width: 100%;
}

.fishbone-binding-tag {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(117, 93, 67, 0.16);
  background: rgba(246, 239, 230, 0.92);
  color: #7a6250;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 7px;
}

.fishbone-binding-tag--linked {
  border-color: rgba(54, 80, 107, 0.18);
  background: rgba(232, 241, 248, 0.92);
  color: #27425c;
}

.fishbone-binding-chapter {
  color: #6b5d52;
  font-size: 11px;
  line-height: 1.4;
}

.fishbone-graph-tag {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(117, 93, 67, 0.14);
  background: rgba(255, 251, 246, 0.92);
  color: #6e6155;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 7px;
}

.fishbone-asset-tag {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(84, 116, 79, 0.16);
  background: rgba(239, 247, 236, 0.94);
  color: #41613a;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 7px;
}

.fishbone-graph-tag--ready {
  border-color: rgba(74, 127, 88, 0.18);
  background: rgba(232, 245, 236, 0.94);
  color: #2e6a3d;
}

.fishbone-graph-tag--inherit {
  border-color: rgba(54, 80, 107, 0.18);
  background: rgba(235, 244, 249, 0.94);
  color: #2c4d66;
}

.fishbone-graph-tag--missing {
  border-color: rgba(183, 109, 56, 0.18);
  background: rgba(255, 243, 230, 0.94);
  color: #9a551f;
}

.fishbone-graph-tag--unbound {
  border-color: rgba(117, 93, 67, 0.14);
  background: rgba(248, 241, 233, 0.92);
  color: #7b6a5b;
}

.fishbone-action {
  border: 1px solid rgba(143, 63, 47, 0.18);
  border-radius: 999px;
  background: rgba(255, 247, 237, 0.96);
  color: #8f3f2f;
  font-size: 10px;
  font-weight: 800;
  padding: 5px 8px;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease;
}

.fishbone-action--secondary {
  border-color: rgba(54, 80, 107, 0.16);
  background: rgba(240, 246, 250, 0.96);
  color: #27425c;
}

.fishbone-action--ghost {
  border-color: rgba(117, 93, 67, 0.16);
  background: rgba(255, 252, 247, 0.94);
  color: #5f5348;
}

.fishbone-action--info {
  border-color: rgba(68, 103, 129, 0.16);
  background: rgba(235, 244, 249, 0.96);
  color: #32536a;
}

.fishbone-action--graph {
  border-color: rgba(74, 127, 88, 0.16);
  background: rgba(232, 245, 236, 0.96);
  color: #2e6a3d;
}

.fishbone-status-action {
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
    border-color 0.16s ease,
    background 0.16s ease;
}

.fishbone-action:hover,
.fishbone-status-action:hover {
  transform: translateY(-1px);
}

.fishbone-status-action.is-active {
  border-color: rgba(143, 63, 47, 0.22);
  background: rgba(255, 242, 227, 0.96);
  color: #8f3f2f;
}

.fishbone-outline-board__empty {
  border-radius: 18px;
  border: 1px dashed rgba(117, 93, 67, 0.2);
  background: rgba(255, 252, 247, 0.92);
  padding: 24px;
  color: #74675d;
  font-size: 13px;
  line-height: 1.6;
}

.fishbone-outline-board__empty--loading {
  border-style: solid;
  border-color: rgba(54, 80, 107, 0.18);
  background: rgba(235, 244, 249, 0.92);
  color: #32536a;
}

@media (max-width: 960px) {
  .fishbone-outline-board__header {
    flex-direction: column;
  }
}
</style>
