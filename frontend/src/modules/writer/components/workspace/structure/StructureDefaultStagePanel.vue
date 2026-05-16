<template>
  <section class="structure-stage-view__default-stage" data-testid="structure-stage-default">
    <section class="structure-stage-view__rhythm-board" data-testid="structure-rhythm-board">
      <div class="structure-stage-view__rhythm-head">
        <div class="structure-stage-view__rhythm-title-block">
          <h3>全书节奏表</h3>
        </div>
        <div class="structure-stage-view__rhythm-summary" aria-label="结构概览">
          <span>{{ `章节 ${chapterCount}` }}</span>
          <span>{{ `当前 ${activeRhythmSegmentTitle || '全书'}` }}</span>
          <span>{{ `未入纲 ${rhythmBoardSummary.unbound}` }}</span>
        </div>
      </div>

      <div v-if="rhythmSegments.length > 1" class="structure-stage-view__segment-map" aria-label="章节范围">
        <button
          v-for="segment in rhythmSegments"
          :key="segment.id"
          type="button"
          class="structure-stage-view__segment-node"
          :class="{
            'is-active': segment.id === activeSegmentId,
            'has-warnings': segment.unbound > 0 || segment.assetMissing > 0,
          }"
          @click="emit('activate-segment', segment.id)"
        >
          <strong>{{ segment.title }}</strong>
          <span>{{ segment.total }} 章</span>
          <em v-if="segment.unbound > 0">{{ segment.unbound }} 未入纲</em>
        </button>
      </div>

      <div class="structure-stage-view__locator-bar">
        <label class="structure-stage-view__locator-input">
          <QyIcon name="Search" :size="14" />
          <input
            :value="rhythmLocatorQuery"
            type="text"
            placeholder="跳转章节号或章节名"
            @input="emit('update:rhythm-locator-query', ($event.target as HTMLInputElement).value)"
            @keyup.enter="emit('locate-rhythm')"
          />
        </label>
        <button type="button" class="structure-stage-view__locator-action" @click="emit('locate-rhythm')">
          定位
        </button>
        <div class="structure-stage-view__window-filters">
          <button
            v-for="option in visibleRhythmFilterOptions"
            :key="option.value"
            type="button"
            class="structure-stage-view__window-filter"
            :class="{ 'is-active': rhythmFilterMode === option.value }"
            @click="emit('update:rhythm-filter-mode', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
        <span class="structure-stage-view__window-range">{{ rhythmWindowRangeLabel }}</span>
      </div>

      <div class="structure-stage-view__rhythm-card-wrap" data-testid="structure-stage-default-list">
        <div v-if="visibleChapterCards.length" class="structure-stage-view__rhythm-card-grid">
          <article
            v-for="row in visibleChapterCards"
            :key="row.id"
            class="structure-stage-view__rhythm-row structure-stage-view__chapter-card"
            :class="{ 'is-selected': selectedNodeId === row.id || currentChapterId === row.chapterId }"
            @click="emit('select-node', row.node)"
          >
            <div class="structure-stage-view__chapter-card-head">
              <span class="structure-stage-view__rhythm-order">{{ row.orderLabel }}</span>
              <span
                class="structure-stage-view__rhythm-status"
                :class="row.hasStructurePlan ? 'is-completed' : 'is-draft'"
              >
                {{ row.hasStructurePlan ? '已入纲' : '未入纲' }}
              </span>
            </div>
            <div class="structure-stage-view__rhythm-title">
              <strong>{{ row.title }}</strong>
              <p v-if="row.description">{{ row.description }}</p>
            </div>
            <div class="structure-stage-view__chapter-card-foot">
              <span class="structure-stage-view__rhythm-wordcount">{{ row.wordCountLabel }}</span>
              <button
                v-if="row.chapterId"
                type="button"
                class="structure-stage-view__rhythm-action is-primary"
                @click.stop="emit('jump-to-chapter', row.chapterId)"
              >
                写作
              </button>
            </div>
          </article>
        </div>
        <div v-else class="structure-stage-view__default-empty">
          {{
            isOutlineLoading
              ? '正在准备全书节奏表...'
              : '当前没有可展示的章节，先创建章节或导入黄金三章草案。'
          }}
        </div>
        <div v-if="hiddenChapterCount > 0" class="structure-stage-view__window-note">
          {{ `已折叠 ${hiddenChapterCount} 章，可用定位直接跳转。` }}
        </div>
      </div>
    </section>

    <section
      v-if="hasCreativeWorkflowBlueprint"
      class="structure-stage-view__blueprint-card"
      data-testid="structure-blueprint-card"
    >
      <div class="structure-stage-view__blueprint-head">
        <div class="structure-stage-view__blueprint-intro">
          <h3>{{ creativeWorkflowTemplateName || '蓝图接力' }}</h3>
        </div>
        <div class="structure-stage-view__blueprint-actions">
          <button
            type="button"
            class="structure-stage-view__blueprint-action is-secondary"
            @click="emit('open-advanced')"
          >
            展开结构视图
          </button>
          <button
            type="button"
            class="structure-stage-view__blueprint-action is-primary"
            data-testid="structure-blueprint-import"
            @click="emit('import-blueprint')"
          >
            导入章节草案
          </button>
          <button
            type="button"
            class="structure-stage-view__blueprint-action"
            @click="emit('send-blueprint-to-ai')"
          >
            交给 AI 做蓝图建议
          </button>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type { ToolType } from '@/modules/writer/composables/useToolOverlay'
import type { WriterStructureDuplicateStrategy, WriterStructureImportTarget } from '@/modules/writer/types/workflow'
import type { OutlineNode } from '@/types/writer'
import type {
  GoldenChapterPlanLike,
  RhythmBoardSummary,
  RhythmFilterMode,
  RhythmRow,
  RhythmSegment,
} from './structureStage.types'

const props = withDefaults(
  defineProps<{
    chapterCount: number
    currentChapterId: string
    currentVolumeDirectory?: string
    isOutlineLoading: boolean
    selectedNodeId: string
    selectedNode: OutlineNode | null
    selectedNodeTitle?: string
    boundChapter?: SidebarChapterSummary | null
    defaultStagePrimaryHint: string
    activeSegmentId: string
    activeRhythmSegmentTitle?: string
    rhythmLocatorQuery: string
    rhythmWindowRangeLabel: string
    rhythmFilterMode: RhythmFilterMode
    rhythmFilterOptions: Array<{ value: RhythmFilterMode; label: string }>
    rhythmBoardSummary: RhythmBoardSummary
    rhythmSegments: RhythmSegment[]
    rhythmWindowRows: RhythmRow[]
    hasCreativeWorkflowBlueprint: boolean
    creativeWorkflowTemplateName?: string
    creativeWorkflowPitch?: string
    creativeWorkflowAudienceLabel?: string
    creativeWorkflowPaceContract?: string
    creativeWorkflowPromises: string[]
    creativeWorkflowGoldenChapters: GoldenChapterPlanLike[]
    creativeWorkflowImportTarget: WriterStructureImportTarget
    creativeWorkflowDuplicateStrategy: WriterStructureDuplicateStrategy
    creativeWorkflowImportTargetLabel: string
  }>(),
  {
    currentVolumeDirectory: '',
    selectedNode: null,
    selectedNodeTitle: '',
    boundChapter: null,
    activeRhythmSegmentTitle: '',
    creativeWorkflowTemplateName: '',
    creativeWorkflowPitch: '',
    creativeWorkflowAudienceLabel: '',
    creativeWorkflowPaceContract: '',
  },
)

const emit = defineEmits<{
  (e: 'activate-segment', segmentId: string): void
  (e: 'update:rhythm-locator-query', value: string): void
  (e: 'update:rhythm-filter-mode', value: RhythmFilterMode): void
  (e: 'update:creative-workflow-import-target', value: string): void
  (e: 'update:creative-workflow-duplicate-strategy', value: string): void
  (e: 'locate-rhythm'): void
  (e: 'select-node', node: OutlineNode): void
  (e: 'jump-to-chapter', chapterId: string): void
  (e: 'bind-current-chapter', node: OutlineNode): void
  (e: 'switch-tool', tool: ToolType): void
  (e: 'open-advanced'): void
  (e: 'import-blueprint'): void
  (e: 'send-blueprint-to-ai'): void
}>()

const visibleRhythmFilterOptions = computed(() =>
  props.rhythmFilterOptions.filter((option) =>
    ['nearby', 'unlinked'].includes(option.value),
  ),
)

const MAX_VISIBLE_CHAPTER_CARDS = 9
const visibleChapterCards = computed(() => {
  const rows = props.rhythmWindowRows
  if (rows.length <= MAX_VISIBLE_CHAPTER_CARDS) return rows

  const anchorIndex = rows.findIndex(
    (row) => row.id === props.selectedNodeId || row.chapterId === props.currentChapterId,
  )
  const safeAnchor = anchorIndex >= 0 ? anchorIndex : 0
  const before = Math.floor(MAX_VISIBLE_CHAPTER_CARDS / 2)
  const start = Math.min(
    Math.max(0, safeAnchor - before),
    Math.max(0, rows.length - MAX_VISIBLE_CHAPTER_CARDS),
  )
  return rows.slice(start, start + MAX_VISIBLE_CHAPTER_CARDS)
})

const hiddenChapterCount = computed(() =>
  Math.max(0, props.rhythmWindowRows.length - visibleChapterCards.value.length),
)
</script>

<style scoped lang="scss">
.structure-stage-view__default-stage {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.structure-stage-view__rhythm-board {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  gap: 14px;
  padding: 16px;
  border-radius: var(--editor-radius-lg, 8px);
  border: 1px solid var(--editor-border, #e2e8f0);
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--editor-bg-base, #fff) 96%, transparent),
      color-mix(in srgb, var(--editor-bg-surface, #f8fafc) 94%, transparent)
    ),
    radial-gradient(
      circle at top left,
      color-mix(in srgb, var(--editor-accent-soft, #eaf2ff) 52%, transparent),
      transparent 34%
    );
  overflow: hidden;
}

.structure-stage-view__rhythm-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.structure-stage-view__rhythm-title-block {
  min-width: 0;

  h3 {
    margin: 0;
    color: var(--editor-text-primary, #0f172a);
    font-size: 18px;
    font-weight: 800;
  }
}

.structure-stage-view__rhythm-summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;

  span {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--editor-border, #94a3b8) 38%, transparent);
      background: color-mix(in srgb, var(--editor-layer-panel, #fff) 86%, transparent);
    color: var(--editor-text-secondary, #475569);
    font-size: 12px;
    font-weight: 700;
  }
}

.structure-stage-view__segment-map {
  display: flex;
  align-items: stretch;
  gap: 6px;
  min-height: 58px;
  overflow-x: auto;
  padding: 2px 2px 8px;
}

.structure-stage-view__segment-node {
  min-width: 132px;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #94a3b8) 40%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #fff) 88%, transparent);
  color: var(--editor-text-secondary, #475569);
  text-align: left;
  cursor: pointer;
  transition: all 120ms ease-out;

  span,
  strong,
  em {
    display: block;
  }

  span {
    color: var(--editor-text-ghost, #94a3b8);
    font-size: 11px;
    font-weight: 800;
  }

  em {
    margin-top: 4px;
    color: var(--color-warning-700, #b45309);
    font-size: 11px;
    font-style: normal;
    font-weight: 800;
  }

  strong {
    margin-top: 2px;
    color: var(--editor-text-primary, #0f172a);
    font-size: 12px;
    font-weight: 800;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover {
    transform: translateY(-1px);
    border-color: var(--editor-border-focus, #8f3f2f);
  }

  &.is-active {
    border-color: var(--editor-accent-soft-border, #8f3f2f);
    background: color-mix(in srgb, var(--editor-accent-soft, #fff7ed) 86%, var(--editor-bg-base, #fff) 14%);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--editor-accent, #8f3f2f) 18%, transparent);
  }

  &.has-warnings {
    background:
      linear-gradient(
        90deg,
        color-mix(in srgb, var(--color-warning-200, #fbbf24) 22%, transparent),
      color-mix(in srgb, var(--editor-layer-panel, #fff) 92%, transparent)
      ),
      var(--editor-layer-panel, #fff);
  }
}

.structure-stage-view__timeline-empty {
  display: grid;
  place-items: center;
  width: 100%;
  color: var(--editor-text-muted, #64748b);
  font-size: 13px;
}

.structure-stage-view__locator-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.structure-stage-view__locator-input {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 260px;
  min-height: 36px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #94a3b8) 42%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #fff) 90%, transparent);
  color: var(--editor-text-muted, #64748b);

  input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: var(--editor-text-primary, #0f172a);
    font-size: 13px;
  }
}

.structure-stage-view__locator-action,
.structure-stage-view__window-filter {
  min-height: 34px;
  padding: 0 11px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #94a3b8) 42%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #fff) 92%, transparent);
  color: var(--editor-text-secondary, #475569);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.structure-stage-view__locator-action {
  color: var(--editor-accent, #06b6d4);
}

.structure-stage-view__window-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.structure-stage-view__window-filter.is-active {
  border-color: var(--editor-accent-soft-border, #8f3f2f);
  background: color-mix(in srgb, var(--editor-accent-soft, rgba(59, 130, 246, 0.18)) 38%, var(--editor-layer-soft, rgba(15, 23, 42, 0.86)) 62%);
  color: color-mix(in srgb, var(--editor-accent, #60a5fa) 86%, white 14%);
}

.structure-stage-view__window-range {
  margin-left: auto;
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  font-weight: 800;
}

.structure-stage-view__rhythm-card-wrap {
  min-height: 0;
  overflow: auto;
  border: 1px solid color-mix(in srgb, var(--editor-border, #94a3b8) 32%, transparent);
  border-radius: 16px;
  background: color-mix(in srgb, var(--editor-layer-panel, rgba(15, 23, 42, 0.9)) 94%, transparent);
  padding: 12px;
}

.structure-stage-view__rhythm-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(168px, 1fr));
  gap: 10px;
}

.structure-stage-view__rhythm-row {
  cursor: pointer;
  transition:
    background-color 120ms ease-out,
    box-shadow 120ms ease-out;

  &:hover {
    background: color-mix(in srgb, var(--editor-layer-soft, rgba(15, 23, 42, 0.78)) 84%, transparent);
  }

  &.is-selected {
    background:
      linear-gradient(
        90deg,
        rgba(96, 165, 250, 0.14),
        rgba(96, 165, 250, 0.08) 24%,
        color-mix(in srgb, var(--editor-layer-soft, rgba(15, 23, 42, 0.88)) 96%, transparent) 24%
      );
    box-shadow: inset 3px 0 0 color-mix(in srgb, var(--editor-accent, rgba(96, 165, 250, 0.72)) 82%, transparent);

  }
}

.structure-stage-view__chapter-card {
  min-height: 132px;
  display: grid;
  align-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #94a3b8) 30%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #fff) 86%, transparent);
}

.structure-stage-view__chapter-card-head,
.structure-stage-view__chapter-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.structure-stage-view__rhythm-order,
.structure-stage-view__rhythm-status,
.structure-stage-view__rhythm-wordcount {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}

.structure-stage-view__rhythm-order {
  background: color-mix(in srgb, var(--editor-layer-glass, rgba(255, 255, 255, 0.08)) 88%, transparent);
  color: var(--editor-text-secondary, rgba(226, 232, 240, 0.84));
}

.structure-stage-view__rhythm-status {
  &.is-draft {
    background: color-mix(in srgb, var(--editor-layer-soft, rgba(15, 23, 42, 0.76)) 92%, transparent);
    color: var(--editor-text-secondary, rgba(226, 232, 240, 0.82));
  }

  &.is-writing {
    background: color-mix(in srgb, var(--editor-accent-soft, rgba(59, 130, 246, 0.18)) 82%, transparent);
    color: color-mix(in srgb, var(--editor-accent, #60a5fa) 88%, white 12%);
  }

  &.is-completed {
    background: rgba(16, 185, 129, 0.16);
    color: rgba(167, 243, 208, 0.96);
  }
}

.structure-stage-view__rhythm-title {
  display: grid;
  gap: 5px;
  max-width: 360px;

  strong {
    color: var(--editor-text-primary, #0f172a);
    font-size: 14px;
    font-weight: 800;
  }

  p {
    margin: 0;
    color: var(--editor-text-secondary, #475569);
    font-size: 12px;
    line-height: 1.55;
  }
}

.structure-stage-view__rhythm-wordcount {
  background: color-mix(in srgb, var(--editor-layer-glass, rgba(255, 255, 255, 0.08)) 88%, transparent);
  color: var(--editor-text-secondary, rgba(226, 232, 240, 0.82));
  border: 1px solid color-mix(in srgb, var(--editor-border, #94a3b8) 32%, transparent);
}

.structure-stage-view__rhythm-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.structure-stage-view__rhythm-action {
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #94a3b8) 44%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #fff) 96%, transparent);
  color: var(--editor-text-secondary, #475569);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;

  &.is-primary {
    border-color: var(--editor-accent-soft-border, rgba(14, 116, 144, 0.16));
    background: color-mix(in srgb, var(--editor-accent-soft, #ecfeff) 96%, transparent);
    color: var(--editor-accent, #0f766e);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.56;
  }
}

.structure-stage-view__blueprint-card {
  display: grid;
  gap: 14px;
  padding: 16px;
  border-radius: var(--editor-radius-lg, 8px);
  border: 1px solid color-mix(in srgb, var(--color-warning-300, #bf8d4f) 24%, var(--editor-border, #e2e8f0));
  background: color-mix(in srgb, var(--color-warning-50, #fffcf6) 64%, var(--editor-layer-panel, #fff) 36%);
  box-shadow: none;
}

.structure-stage-view__blueprint-head,
.structure-stage-view__blueprint-actions {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.structure-stage-view__blueprint-intro {
  min-width: 0;

  h3 {
    margin: 0;
    font-size: 16px;
    color: var(--editor-text-primary, #3f3023);
  }
}

.structure-stage-view__blueprint-actions {
  align-items: center;
  flex-wrap: wrap;
}

.structure-stage-view__blueprint-action {
  height: 36px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--color-warning-300, #5b4832) 24%, var(--editor-border, #e2e8f0));
  background: color-mix(in srgb, var(--editor-layer-panel, #fff) 94%, transparent);
  color: var(--editor-text-secondary, #6b4f35);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  &.is-primary {
    border-color: color-mix(in srgb, var(--color-warning-500, #d97706) 28%, transparent);
    color: var(--color-warning-700, #b45309);
  }
}

.structure-stage-view__default-empty {
  display: grid;
  place-items: center;
  min-height: 220px;
  padding: 24px;
  color: var(--editor-text-muted, #64748b);
  font-size: 13px;
  text-align: center;
}

.structure-stage-view__window-note {
  margin-top: 10px;
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  text-align: center;
}

@media (max-width: 1024px) {
  .structure-stage-view__blueprint-head {
    flex-direction: column;
  }
}
</style>
