<template>
  <section class="structure-stage-view__default-stage" data-testid="structure-stage-default">
    <section class="structure-stage-view__rhythm-board" data-testid="structure-rhythm-board">
      <div class="structure-stage-view__rhythm-head">
        <div>
          <h3>全书节奏表</h3>
        </div>
        <div class="structure-stage-view__rhythm-summary">
          <span>{{ `章节 ${rhythmBoardSummary.boundChapters}/${chapterCount}` }}</span>
          <span>{{ `当前 ${activeRhythmSegmentTitle || '未分段'}` }}</span>
          <span>{{ `推进中 ${rhythmBoardSummary.writing}` }}</span>
          <span>{{ `待绑定 ${rhythmBoardSummary.unbound}` }}</span>
          <span>{{ `资产引用 ${rhythmBoardSummary.assets}` }}</span>
        </div>
      </div>

      <div class="structure-stage-view__segment-map" aria-label="全书节奏区段">
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
          <span>{{ segment.total }} 节点</span>
          <em v-if="segment.unbound > 0">{{ segment.unbound }} 待绑定</em>
        </button>
        <div v-if="!rhythmSegments.length" class="structure-stage-view__timeline-empty">
          {{ isOutlineLoading ? '正在整理区段...' : '还没有可展示的结构节点' }}
        </div>
      </div>

      <div class="structure-stage-view__locator-bar">
        <label class="structure-stage-view__locator-input">
          <QyIcon name="Search" :size="14" />
          <input
            :value="rhythmLocatorQuery"
            type="text"
            placeholder="跳转章节号、章节名或结构节点"
            @input="emit('update:rhythm-locator-query', ($event.target as HTMLInputElement).value)"
            @keyup.enter="emit('locate-rhythm')"
          />
        </label>
        <button type="button" class="structure-stage-view__locator-action" @click="emit('locate-rhythm')">
          定位
        </button>
        <div class="structure-stage-view__window-filters">
          <button
            v-for="option in rhythmFilterOptions"
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

      <div class="structure-stage-view__rhythm-table-wrap" data-testid="structure-stage-default-list">
        <table v-if="rhythmWindowRows.length" class="structure-stage-view__rhythm-table">
          <thead>
            <tr>
              <th scope="col">节奏位</th>
              <th scope="col">章节/情节点</th>
              <th scope="col">状态</th>
              <th scope="col">钩子/兑现</th>
              <th scope="col">时间线</th>
              <th scope="col">资产摘要</th>
              <th scope="col">字数</th>
              <th scope="col">动作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rhythmWindowRows"
              :key="row.id"
              class="structure-stage-view__rhythm-row"
              :class="{ 'is-selected': selectedNodeId === row.id }"
              @click="emit('select-node', row.node)"
            >
              <td>
                <span class="structure-stage-view__rhythm-order">{{ row.orderLabel }}</span>
              </td>
              <td>
                <div class="structure-stage-view__rhythm-title">
                  <strong>{{ row.title }}</strong>
                  <p>{{ row.description }}</p>
                </div>
              </td>
              <td>
                <span class="structure-stage-view__rhythm-status" :class="`is-${row.statusTone}`">
                  {{ row.statusLabel }}
                </span>
              </td>
              <td>
                <span class="structure-stage-view__rhythm-hook">{{ row.hookLabel }}</span>
              </td>
              <td>
                <button
                  type="button"
                  class="structure-stage-view__rhythm-link"
                  @click.stop="emit('switch-tool', 'timeline')"
                >
                  {{ row.timelineLabel }}
                </button>
              </td>
              <td>
                <button
                  type="button"
                  class="structure-stage-view__rhythm-link"
                  @click.stop="emit('switch-tool', row.assetCount > 0 ? 'assets' : 'relations')"
                >
                  {{ row.assetLabel }}
                </button>
              </td>
              <td>
                <span class="structure-stage-view__rhythm-wordcount">{{ row.wordCountLabel }}</span>
              </td>
              <td>
                <div class="structure-stage-view__rhythm-actions">
                  <button
                    v-if="row.chapterId"
                    type="button"
                    class="structure-stage-view__rhythm-action is-primary"
                    @click.stop="emit('jump-to-chapter', row.chapterId)"
                  >
                    写作
                  </button>
                  <button
                    v-else
                    type="button"
                    class="structure-stage-view__rhythm-action"
                    :disabled="!currentChapterId"
                    @click.stop="emit('bind-current-chapter', row.node)"
                  >
                    绑定
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="structure-stage-view__default-empty">
          {{
            isOutlineLoading
              ? '正在准备全书节奏表...'
              : '当前没有可推进的结构节点，先创建主线节点或导入黄金三章草案。'
          }}
        </div>
      </div>

      <div class="structure-stage-view__selected-strip">
        <div>
          <span>当前聚焦</span>
          <strong>{{ selectedNodeTitle || '未选择结构节点' }}</strong>
          <p>{{ defaultStagePrimaryHint }}</p>
        </div>
        <div class="structure-stage-view__selected-actions">
          <button
            type="button"
            class="focus-card__action focus-card__action--primary"
            :disabled="!boundChapter"
            @click="boundChapter && emit('jump-to-chapter', boundChapter.id)"
          >
            进入写作
          </button>
          <button
            type="button"
            class="focus-card__action focus-card__action--secondary"
            :disabled="!selectedNode || !currentChapterId"
            @click="selectedNode && currentChapterId && emit('bind-current-chapter', selectedNode)"
          >
            绑定当前章节
          </button>
          <button
            type="button"
            class="focus-card__action focus-card__action--ghost"
            @click="emit('switch-tool', 'assets')"
          >
            深看资产
          </button>
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
          <p class="structure-stage-view__default-eyebrow">蓝图输入</p>
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

      <div class="structure-stage-view__blueprint-summary">
        <span v-if="creativeWorkflowPitch" class="structure-stage-view__blueprint-summary-item is-wide">
          <strong>定位</strong>
          <em>{{ creativeWorkflowPitch }}</em>
        </span>
        <span class="structure-stage-view__blueprint-summary-item">
          <strong>模板</strong>
          <em>{{ creativeWorkflowTemplateName || '未指定模板' }}</em>
        </span>
        <span class="structure-stage-view__blueprint-summary-item">
          <strong>目标读者</strong>
          <em>{{ creativeWorkflowAudienceLabel || '待补充' }}</em>
        </span>
        <span class="structure-stage-view__blueprint-summary-item is-accent">
          <strong>节奏合约</strong>
          <em>{{ creativeWorkflowPaceContract || '待补充' }}</em>
        </span>
      </div>

      <div class="structure-stage-view__blueprint-controls">
        <label class="structure-stage-view__blueprint-control">
          <span>导入位置</span>
          <select
            :value="creativeWorkflowImportTarget"
            class="structure-stage-view__blueprint-select"
            data-testid="structure-import-target"
            @change="emit('update:creative-workflow-import-target', ($event.target as HTMLSelectElement).value)"
          >
            <option v-if="currentVolumeDirectory" value="current-volume">
              {{ creativeWorkflowImportTargetLabel }}
            </option>
            <option value="project-root">项目根目录</option>
          </select>
          <small>{{ `当前导入到：${creativeWorkflowImportTargetLabel}` }}</small>
        </label>

        <label class="structure-stage-view__blueprint-control">
          <span>重复策略</span>
          <select
            :value="creativeWorkflowDuplicateStrategy"
            class="structure-stage-view__blueprint-select"
            data-testid="structure-duplicate-strategy"
            @change="emit('update:creative-workflow-duplicate-strategy', ($event.target as HTMLSelectElement).value)"
          >
            <option value="skip_existing">跳过已存在章节</option>
            <option value="allow_duplicate">允许重复导入</option>
          </select>
        </label>
      </div>

      <div v-if="creativeWorkflowPromises.length" class="structure-stage-view__blueprint-promises">
        <span
          v-for="promise in creativeWorkflowPromises"
          :key="promise"
          class="structure-stage-view__blueprint-token"
        >
          {{ promise }}
        </span>
      </div>

      <div class="structure-stage-view__blueprint-table-wrap">
        <table class="structure-stage-view__blueprint-table">
          <thead>
            <tr>
              <th scope="col">章次</th>
              <th scope="col">章节标题</th>
              <th scope="col">节奏目标</th>
              <th scope="col">钩子</th>
              <th scope="col">兑现</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="chapter in creativeWorkflowGoldenChapters" :key="chapter.chapterNumber">
              <td>
                <span class="structure-stage-view__blueprint-index">第 {{ chapter.chapterNumber }} 章</span>
              </td>
              <td>
                <strong>{{ chapter.title }}</strong>
              </td>
              <td>{{ chapter.summary || '补一条本章目标，方便继续拆节拍。' }}</td>
              <td>{{ chapter.hook || '待补齐' }}</td>
              <td>{{ chapter.payoff || '待补齐' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
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

  h3 {
    margin: 4px 0 4px;
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
  gap: 8px;
  min-height: 72px;
  overflow-x: auto;
  padding: 2px 2px 8px;
}

.structure-stage-view__segment-node {
  min-width: 156px;
  padding: 10px 12px;
  border-radius: 14px;
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
    margin-top: 4px;
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

.structure-stage-view__rhythm-table-wrap {
  min-height: 0;
  overflow: auto;
  border: 1px solid color-mix(in srgb, var(--editor-border, #94a3b8) 32%, transparent);
  border-radius: 16px;
  background: color-mix(in srgb, var(--editor-layer-panel, rgba(15, 23, 42, 0.9)) 94%, transparent);
}

.structure-stage-view__rhythm-table {
  width: 100%;
  min-width: 1040px;
  border-collapse: collapse;

  th,
  td {
    padding: 12px 14px;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid color-mix(in srgb, var(--editor-border, #94a3b8) 30%, transparent);
  }

  th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: color-mix(in srgb, var(--editor-layer-soft, rgba(15, 23, 42, 0.84)) 96%, transparent);
    color: var(--editor-text-muted, #64748b);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
}

.structure-stage-view__rhythm-row {
  cursor: pointer;
  transition:
    background-color 120ms ease-out,
    box-shadow 120ms ease-out;

  td {
    background: transparent;
  }

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

    td {
      background: transparent;
    }
  }
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
  max-width: 320px;

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

.structure-stage-view__rhythm-hook {
  display: block;
  max-width: 220px;
  color: var(--editor-text-secondary, #475569);
  font-size: 12px;
  line-height: 1.55;
}

.structure-stage-view__rhythm-link {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #94a3b8) 40%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #fff) 92%, transparent);
  color: var(--editor-accent, #06b6d4);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
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

.structure-stage-view__selected-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #94a3b8) 32%, transparent);
  background: color-mix(in srgb, var(--editor-bg-surface, #f8fafc) 76%, transparent);

  span {
    display: block;
    color: var(--editor-text-ghost, #94a3b8);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  strong {
    display: block;
    margin-top: 3px;
    color: var(--editor-text-primary, #0f172a);
    font-size: 14px;
    font-weight: 800;
  }

  p {
    margin: 3px 0 0;
    color: var(--editor-text-secondary, #475569);
    font-size: 12px;
  }
}

.structure-stage-view__selected-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.focus-card__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 11px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 120ms ease-out;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &--primary {
    background: var(--editor-accent, #06b6d4);
    color: var(--editor-text-inverse, #fff);
  }

  &--secondary {
    border-color: color-mix(in srgb, var(--editor-accent, #32536a) 22%, transparent);
    background: color-mix(in srgb, var(--editor-accent-soft, #ecfeff) 72%, transparent);
    color: var(--editor-accent, #06b6d4);
  }

  &--ghost {
    border-color: var(--editor-border, #e2e8f0);
    background: var(--editor-layer-panel, #fff);
    color: var(--editor-text-secondary, #334155);
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
}

.structure-stage-view__default-eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--editor-accent, #8f3f2f);
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

.structure-stage-view__blueprint-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
}

.structure-stage-view__blueprint-summary-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--color-warning-300, #bf8d4f) 22%, var(--editor-border, #e2e8f0));
  background: color-mix(in srgb, var(--editor-layer-panel, #fff) 82%, transparent);

  strong {
    color: var(--color-warning-700, #a17648);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  em {
    color: var(--editor-text-secondary, #5b4632);
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
  }
}

.structure-stage-view__blueprint-summary-item.is-wide {
  max-width: min(100%, 520px);
}

.structure-stage-view__blueprint-summary-item.is-accent {
  background: color-mix(in srgb, var(--color-warning-100, #fff7e6) 90%, transparent);
}

.structure-stage-view__blueprint-controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.structure-stage-view__blueprint-control {
  display: grid;
  gap: 6px;
  min-width: 0;

  > span {
    font-size: 12px;
    font-weight: 700;
    color: var(--editor-text-secondary, #6b4f35);
  }

  > small {
    color: var(--editor-text-muted, #8b6b4b);
    line-height: 1.4;
  }
}

.structure-stage-view__blueprint-select {
  width: 100%;
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid color-mix(in srgb, var(--color-warning-300, #bf8d4f) 30%, var(--editor-border, #e2e8f0));
  border-radius: 12px;
  background: color-mix(in srgb, var(--editor-layer-panel, #fff) 92%, transparent);
  color: var(--editor-text-secondary, #5b4632);
  font-size: 13px;
}

.structure-stage-view__blueprint-promises {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.structure-stage-view__blueprint-token,
.structure-stage-view__blueprint-index {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--editor-layer-panel, #fff) 88%, transparent);
  color: var(--color-warning-800, #8b5e34);
  font-size: 12px;
  font-weight: 600;
}

.structure-stage-view__blueprint-table-wrap {
  overflow: auto;
  border: 1px solid color-mix(in srgb, var(--color-warning-300, #bf8d4f) 22%, var(--editor-border, #e2e8f0));
  border-radius: 16px;
  background: color-mix(in srgb, var(--editor-layer-panel, #fff) 90%, transparent);
}

.structure-stage-view__blueprint-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;

  th,
  td {
    padding: 12px 14px;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid color-mix(in srgb, var(--color-warning-300, #bf8d4f) 18%, var(--editor-border, #e2e8f0));
  }

  th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: color-mix(in srgb, var(--color-warning-50, #fff8eb) 96%, var(--editor-layer-panel, #fff) 4%);
    color: var(--editor-text-muted, #8b6b4b);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  td {
    color: var(--editor-text-secondary, #5b4632);
    font-size: 13px;
    line-height: 1.65;
    background: color-mix(in srgb, var(--editor-layer-panel, #fff) 92%, transparent);
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  strong {
    color: var(--editor-text-primary, #3f3023);
    font-size: 13px;
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

@media (max-width: 1024px) {
  .structure-stage-view__blueprint-head {
    flex-direction: column;
  }

  .structure-stage-view__blueprint-controls {
    grid-template-columns: 1fr;
  }
}
</style>
