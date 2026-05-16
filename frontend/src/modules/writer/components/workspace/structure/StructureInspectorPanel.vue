<template>
  <section class="structure-inspector-panel">
    <div class="structure-inspector-panel__header">
      <h3 class="structure-inspector-panel__title">结构检视</h3>
      <span v-if="selectedNode" class="structure-inspector-panel__status">{{ statusText }}</span>
    </div>

    <div v-if="selectedNode" class="structure-inspector-panel__body">
      <article class="inspector-hero">
        <div class="inspector-hero__level">L{{ selectedNode.level || 1 }}</div>
        <h4>{{ selectedNode.title }}</h4>
        <p v-if="selectedNode.description">{{ selectedNode.description }}</p>
      </article>

      <div class="inspector-stats">
        <div class="inspector-stat">
          <span>字数</span>
          <strong>{{ selectedNode.wordCount || 0 }}</strong>
        </div>
        <div class="inspector-stat">
          <span>子节点</span>
          <strong>{{ childCount }}</strong>
        </div>
        <div class="inspector-stat">
          <span>章节映射</span>
          <strong>{{ bindingState.label }}</strong>
        </div>
        <div class="inspector-stat">
          <span>图谱</span>
          <strong>{{ graphState.label }}</strong>
        </div>
      </div>

      <div class="inspector-binding">
        <div class="inspector-binding__controls">
          <select
            class="inspector-binding__select"
            :value="draftBindingChapterId"
            @change="
              emit('update:draftBindingChapterId', ($event.target as HTMLSelectElement).value)
            "
          >
            <option value="">未绑定章节</option>
            <option v-for="chapter in chapterOptions" :key="chapter.id" :value="chapter.id">
              {{ chapter.title }}
            </option>
          </select>

          <div class="inspector-binding__actions">
            <button
              type="button"
              class="inspector-action inspector-action--secondary"
              :disabled="!currentChapterId"
              @click="currentChapterId && emit('bindCurrentChapter', currentChapterId)"
            >
              绑定当前章节
            </button>
            <button
              type="button"
              class="inspector-action inspector-action--secondary"
              :disabled="!draftBindingChapterId"
              @click="draftBindingChapterId && emit('bindChapter', draftBindingChapterId)"
            >
              保存绑定
            </button>
            <button
              type="button"
              class="inspector-action inspector-action--ghost"
              :disabled="!boundChapter"
              @click="emit('unbindChapter')"
            >
              解绑
            </button>
          </div>
        </div>
      </div>

      <div class="inspector-actions">
        <button
          type="button"
          class="inspector-action inspector-action--primary"
          :disabled="!boundChapter"
          @click="boundChapter && emit('jumpToChapter', boundChapter.id)"
        >
          进入章节
        </button>
        <button
          type="button"
          class="inspector-action inspector-action--secondary"
          data-testid="structure-send-to-ai"
          @click="emitStructureNodeToAI"
        >
          交给 AI
        </button>
        <button
          type="button"
          class="inspector-action inspector-action--secondary"
          data-testid="structure-open-assets"
          @click="emit('switch-tool', 'assets')"
        >
          资产
        </button>
        <button
          type="button"
          class="inspector-action inspector-action--secondary"
          :disabled="!boundChapter"
          @click="boundChapter && emit('openGraph', boundChapter.id)"
        >
          {{ graphState.tone === 'missing' ? '建图谱' : '图谱' }}
        </button>
      </div>
    </div>

    <div
      v-else-if="loading"
      class="structure-inspector-panel__empty structure-inspector-panel__empty--loading"
    >
      正在准备结构检视数据。
    </div>

    <div v-else class="structure-inspector-panel__empty">
      选择结构节点后查看绑定与操作。
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ToolType } from '@/modules/writer/composables/useToolOverlay'
import type { OutlineNode } from '@/types/writer'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type { ChapterGraph } from '@/modules/writer/types/character'
import {
  formatActiveEntitiesPrompt,
  type ActiveEntitySummary,
} from '@/modules/writer/composables/useWorkflowContext'
import {
  buildWriterWorkflowContextPrompt,
  type WriterWorkflowActionRequest,
  type WriterWorkflowContext,
} from '@/modules/writer/types/workflow'
import {
  getStructureNodeBindingState,
  getStructureNodeGraphState,
  getStructureNodeStatusText,
} from './structureNodeTypes'

const props = defineProps<{
  selectedNode: OutlineNode | null
  chapters: SidebarChapterSummary[]
  chapterGraphs?: ChapterGraph[]
  workflowContext?: WriterWorkflowContext
  activeEntities?: ActiveEntitySummary[]
  currentChapterId: string
  currentChapterTitle: string
  draftBindingChapterId: string
  boundChapter: SidebarChapterSummary | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'trigger-ai-action', payload: WriterWorkflowActionRequest): void
  (e: 'jumpToChapter', chapterId: string): void
  (e: 'openGraph', chapterId: string): void
  (e: 'switch-tool', toolId: ToolType): void
  (e: 'update:draftBindingChapterId', value: string): void
  (e: 'bindCurrentChapter', chapterId: string): void
  (e: 'bindChapter', chapterId: string): void
  (e: 'unbindChapter'): void
}>()

const childCount = computed(() => props.selectedNode?.children?.length || 0)
const statusText = computed(() => getStructureNodeStatusText(props.selectedNode))
const bindingState = computed(() => getStructureNodeBindingState(props.selectedNode))
const graphState = computed(() =>
  getStructureNodeGraphState(props.selectedNode, props.chapterGraphs || []),
)
const chapterOptions = computed(() =>
  props.chapters.filter((chapter) => chapter.nodeType !== 'directory'),
)

function emitStructureNodeToAI() {
  if (!props.selectedNode) return

  const workflowPrompt = buildWriterWorkflowContextPrompt(props.workflowContext)
  const activeEntitiesPrompt = formatActiveEntitiesPrompt(props.activeEntities)
  const lines = [
    `结构节点：${props.selectedNode.title || '未命名节点'}`,
    props.boundChapter ? `已绑定章节：${props.boundChapter.title}` : '已绑定章节：未绑定',
    `节点层级：L${props.selectedNode.level || 1}`,
    `节点状态：${statusText.value}`,
    `子节点数：${childCount.value}`,
    props.selectedNode.description ? `节点描述：${props.selectedNode.description}` : '',
    activeEntitiesPrompt,
    workflowPrompt,
  ].filter(Boolean)

  emit('trigger-ai-action', {
    source: 'workspace',
    action: 'add_to_chat',
    title: `结构节点分析：${props.selectedNode.title || '未命名节点'}`,
    text: lines.join('\n'),
    instructions:
      '请结合当前结构节点与章节映射，分析它在叙事推进中的作用，并优先给出可执行的细纲补强与正文落地建议。',
  })
}
</script>

<style scoped lang="scss">
.structure-inspector-panel {
  position: relative;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(91, 72, 50, 0.14)) 74%, transparent);
  background:
    radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--editor-accent, #32536a) 12%, transparent), transparent 28%),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--editor-layer-panel, #fffbf6) 98%, transparent),
      color-mix(in srgb, var(--editor-layer-strong, #f3e9dc) 92%, var(--editor-bg-base, #fff) 8%)
    );
  box-shadow: var(--editor-shadow-lg, 0 16px 32px rgba(80, 49, 26, 0.08));
  overflow: hidden;
}

.structure-inspector-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--editor-text-inverse, #ffffff) 14%, transparent),
    transparent 26%
  );
  pointer-events: none;
}

.structure-inspector-panel__header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid color-mix(in srgb, var(--editor-border, rgba(91, 72, 50, 0.1)) 68%, transparent);
}

.structure-inspector-panel__title {
  margin: 0;
  font-size: 18px;
  color: var(--editor-text-primary, #2e2b27);
}

.structure-inspector-panel__status {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--editor-accent, #8f3f2f) 22%, transparent);
  background: color-mix(in srgb, var(--editor-accent-soft, #fff7ed) 62%, transparent);
  color: var(--editor-accent, #8f3f2f);
  font-size: 12px;
  font-weight: 800;
}

.structure-inspector-panel__body {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 14px;
  display: grid;
  gap: 12px;
}

.inspector-hero {
  position: relative;
  border-radius: 18px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--editor-accent, #8f3f2f) 92%, var(--editor-layer-panel, #fff) 8%),
    color-mix(in srgb, var(--color-warning-600, #b76d38) 82%, var(--editor-accent, #8f3f2f) 18%)
  );
  color: color-mix(in srgb, var(--editor-text-inverse, #fff9f3) 94%, var(--editor-text-secondary, #334155) 6%);
  padding: 14px;
  overflow: hidden;
  box-shadow: var(--editor-shadow-lg, 0 18px 30px rgba(99, 60, 30, 0.14));
}

.inspector-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(120deg, color-mix(in srgb, var(--editor-text-inverse, #ffffff) 14%, transparent), transparent 34%),
    radial-gradient(circle at 82% 18%, color-mix(in srgb, var(--editor-text-inverse, #ffffff) 16%, transparent), transparent 20%);
  pointer-events: none;
}

.inspector-hero__level {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  opacity: 0.9;
}

.inspector-hero h4 {
  margin: 6px 0 0;
  font-size: 18px;
}

.inspector-hero p {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.5;
  opacity: 0.94;
}

.inspector-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.inspector-stat {
  border-radius: 14px;
  background: color-mix(in srgb, var(--editor-layer-panel, #fffcf7) 92%, transparent);
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(117, 93, 67, 0.14)) 72%, transparent);
  padding: 10px;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    border-color 0.16s ease;
}

.inspector-stat:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--editor-accent, #8f3f2f) 24%, transparent);
  box-shadow: var(--editor-shadow-md, 0 12px 18px rgba(99, 60, 30, 0.07));
}

.inspector-stat span {
  display: block;
  font-size: 11px;
  color: var(--editor-text-muted, #8b7a6c);
}

.inspector-stat strong {
  display: block;
  margin-top: 4px;
  font-size: 15px;
  color: var(--editor-text-primary, #2d2b29);
}

.inspector-binding {
  border-radius: 16px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--editor-layer-panel, #fffcf8) 94%, transparent),
    color-mix(in srgb, var(--editor-layer-strong, #faf3ea) 90%, transparent)
  );
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(117, 93, 67, 0.14)) 72%, transparent);
  padding: 12px 14px;
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--editor-text-inverse, #ffffff) 12%, transparent);
}

.inspector-binding__controls {
  display: grid;
  gap: 10px;
}

.inspector-binding__select {
  width: 100%;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(117, 93, 67, 0.16)) 82%, transparent);
  background: var(--editor-layer-panel, #fffdf9);
  color: var(--editor-text-primary, #2d2b29);
  padding: 10px 12px;
  font-size: 13px;
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    background 0.16s ease;
}

.inspector-binding__select:focus {
  outline: none;
  border-color: color-mix(in srgb, var(--editor-accent, #8f3f2f) 36%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--editor-accent, #8f3f2f) 12%, transparent);
}

.inspector-binding__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.structure-inspector-panel__empty {
  margin: 16px;
  border-radius: 18px;
  border: 1px dashed color-mix(in srgb, var(--editor-border, rgba(117, 93, 67, 0.2)) 82%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #fffcf7) 92%, transparent);
  padding: 20px;
  color: var(--editor-text-muted, #74675d);
  font-size: 13px;
  line-height: 1.6;
}

.structure-inspector-panel__empty--loading {
  border-style: solid;
  border-color: color-mix(in srgb, var(--editor-accent, #32536a) 18%, transparent);
  background: color-mix(in srgb, var(--editor-accent-soft, #ebf4f9) 70%, var(--editor-layer-panel, #fff) 30%);
  color: var(--editor-accent, #32536a);
}

.inspector-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.inspector-action {
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease;
}

.inspector-action--primary {
  border: 0;
  background: linear-gradient(135deg, var(--editor-accent, #8f3f2f), var(--color-warning-600, #b76d38));
  color: var(--editor-text-inverse, #fff9f3);
  box-shadow: 0 12px 20px rgba(99, 60, 30, 0.12);
}

.inspector-action--secondary {
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(117, 93, 67, 0.16)) 84%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #fffcf7) 92%, transparent);
  color: var(--editor-text-secondary, #453b31);
}

.inspector-action--ghost {
  border: 1px dashed color-mix(in srgb, var(--editor-border, rgba(117, 93, 67, 0.26)) 86%, transparent);
  background: transparent;
  color: var(--editor-text-muted, #7a6250);
}

.inspector-action:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: var(--editor-shadow-md, 0 10px 16px rgba(99, 60, 30, 0.08));
}

.inspector-action:disabled {
  opacity: 0.48;
  cursor: not-allowed;
}

@media (max-width: 960px) {
  .inspector-stats {
    grid-template-columns: 1fr;
  }
}
</style>
