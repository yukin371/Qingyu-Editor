<template>
  <section class="structure-inspector-panel">
    <div class="structure-inspector-panel__header">
      <p class="structure-inspector-panel__eyebrow">Inspector</p>
      <h3 class="structure-inspector-panel__title">结构检视</h3>
    </div>

    <div v-if="selectedNode" class="structure-inspector-panel__body">
      <article class="inspector-hero">
        <div class="inspector-hero__level">L{{ selectedNode.level || 1 }}</div>
        <h4>{{ selectedNode.title }}</h4>
        <p>{{ selectedNode.description || '该节点还没有补充细纲说明。' }}</p>
      </article>

      <div class="inspector-stats">
        <div class="inspector-stat">
          <span>状态</span>
          <strong>{{ statusText }}</strong>
        </div>
        <div class="inspector-stat">
          <span>预估字数</span>
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
          <span>关系图谱</span>
          <strong>{{ graphState.label }}</strong>
        </div>
      </div>

      <div class="inspector-outline">
        <div class="inspector-outline__title">结构建议</div>
        <ul>
          <li>
            {{
              childCount > 0
                ? '已有细纲支节，可优先检查信息密度是否均衡。'
                : '当前节点缺少细纲支节，建议拆出冲突、转折与收束。'
            }}
          </li>
          <li>
            {{
              selectedNode.level <= 1
                ? '作为主干节点，优先明确事件目标、阻力与结果。'
                : '作为细纲节点，优先明确动作、信息与情绪推进。'
            }}
          </li>
          <li>{{ linkedChapterHint }}</li>
          <li>{{ graphHint }}</li>
        </ul>
      </div>

      <div class="inspector-binding">
        <div class="inspector-binding__title">章节绑定</div>
        <p class="inspector-binding__hint">
          {{
            boundChapter
              ? `当前已绑定「${boundChapter.title}」`
              : '为该结构节点指定一个落地章节，形成结构到正文的稳定映射。'
          }}
        </p>

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
          查看全局资产
        </button>
        <button
          type="button"
          class="inspector-action inspector-action--secondary"
          :disabled="!boundChapter"
          @click="boundChapter && emit('openGraph', boundChapter.id)"
        >
          {{ graphState.tone === 'missing' ? '创建关系图谱' : '查看关系图谱' }}
        </button>
        <button
          type="button"
          class="inspector-action inspector-action--primary"
          :disabled="!boundChapter"
          @click="boundChapter && emit('jumpToChapter', boundChapter.id)"
        >
          跳转到关联章节
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
      选择左侧树节点或鱼骨节点后，这里会显示层级、状态和结构建议。
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

const linkedChapterHint = computed(() => {
  if (props.boundChapter) {
    return '该节点已经和具体章节建立关联，可从这里直接回到正文修订。'
  }
  if (!props.currentChapterTitle || props.currentChapterTitle === '未选择章节') {
    return '当前未锁定章节，可从目录选择章节后回看结构映射。'
  }
  return `当前工作章节是「${props.currentChapterTitle}」，下一步可把这个节点绑定到对应章节。`
})

const graphHint = computed(() => {
  if (graphState.value.tone === 'ready') {
    return '该章节已建立独立关系图谱，可继续补充局部角色关系。'
  }
  if (graphState.value.tone === 'inherit') {
    return '该章节当前使用继承图谱，适合在全局关系基础上追加章节特有连线。'
  }
  if (graphState.value.tone === 'missing') {
    return '该章节已经绑定，但尚未建关系图谱，建议去关系图页创建。'
  }
  return '节点尚未绑定章节，暂时无法挂接章节关系图谱。'
})

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
  padding: 18px 18px 14px;
  border-bottom: 1px solid color-mix(in srgb, var(--editor-border, rgba(91, 72, 50, 0.1)) 68%, transparent);
}

.structure-inspector-panel__eyebrow {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--editor-accent, #8f3f2f);
  font-weight: 800;
}

.structure-inspector-panel__title {
  margin: 6px 0 0;
  font-size: 22px;
  color: var(--editor-text-primary, #2e2b27);
}

.structure-inspector-panel__body {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 16px;
  display: grid;
  gap: 14px;
}

.inspector-hero {
  position: relative;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(143, 63, 47, 0.95), rgba(183, 109, 56, 0.92));
  color: color-mix(in srgb, var(--editor-text-inverse, #fff9f3) 94%, var(--editor-text-secondary, #334155) 6%);
  padding: 16px;
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
  margin: 8px 0 0;
  font-size: 20px;
}

.inspector-hero p {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.6;
  opacity: 0.94;
}

.inspector-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.inspector-stat {
  border-radius: 16px;
  background: color-mix(in srgb, var(--editor-layer-panel, #fffcf7) 92%, transparent);
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(117, 93, 67, 0.14)) 72%, transparent);
  padding: 12px;
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
  margin-top: 6px;
  font-size: 18px;
  color: var(--editor-text-primary, #2d2b29);
}

.inspector-outline {
  border-radius: 18px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--editor-layer-panel, #fffcf8) 94%, transparent),
    color-mix(in srgb, var(--editor-layer-strong, #faf3ea) 90%, transparent)
  );
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(117, 93, 67, 0.14)) 72%, transparent);
  padding: 14px 16px;
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--editor-text-inverse, #ffffff) 12%, transparent);
}

.inspector-outline__title {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 800;
  color: var(--editor-accent, #8f3f2f);
}

.inspector-outline ul {
  margin: 10px 0 0;
  padding-left: 18px;
  display: grid;
  gap: 8px;
  color: var(--editor-text-secondary, #5f5348);
  font-size: 13px;
  line-height: 1.6;
}

.inspector-binding {
  border-radius: 18px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--editor-layer-panel, #fffcf8) 94%, transparent),
    color-mix(in srgb, var(--editor-layer-strong, #faf3ea) 90%, transparent)
  );
  border: 1px solid color-mix(in srgb, var(--editor-border, rgba(117, 93, 67, 0.14)) 72%, transparent);
  padding: 14px 16px;
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--editor-text-inverse, #ffffff) 12%, transparent);
}

.inspector-binding__title {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 800;
  color: var(--editor-accent, #8f3f2f);
}

.inspector-binding__hint {
  margin: 8px 0 0;
  color: var(--editor-text-muted, #6a5d52);
  font-size: 12px;
  line-height: 1.6;
}

.inspector-binding__controls {
  margin-top: 12px;
  display: grid;
  gap: 10px;
}

.inspector-binding__select {
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(117, 93, 67, 0.16);
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
  border: 1px dashed rgba(117, 93, 67, 0.2);
  background: color-mix(in srgb, var(--editor-layer-panel, #fffcf7) 92%, transparent);
  padding: 20px;
  color: #74675d;
  font-size: 13px;
  line-height: 1.6;
}

.structure-inspector-panel__empty--loading {
  border-style: solid;
  border-color: rgba(54, 80, 107, 0.18);
  background: rgba(235, 244, 249, 0.92);
  color: #32536a;
}

.inspector-actions {
  display: flex;
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
  background: linear-gradient(135deg, #8f3f2f, #b76d38);
  color: #fff9f3;
  box-shadow: 0 12px 20px rgba(99, 60, 30, 0.12);
}

.inspector-action--secondary {
  border: 1px solid rgba(117, 93, 67, 0.16);
  background: rgba(255, 252, 247, 0.92);
  color: var(--editor-text-secondary, #453b31);
}

.inspector-action--ghost {
  border: 1px dashed rgba(117, 93, 67, 0.26);
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
