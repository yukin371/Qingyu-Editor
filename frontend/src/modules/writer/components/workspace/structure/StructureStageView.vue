<template>
  <section class="structure-stage-view">
    <header class="structure-stage-view__header">
      <div class="structure-stage-view__header-main">
        <div class="structure-stage-view__title-block">
          <h2>结构舞台</h2>
          <div class="structure-stage-view__header-summary">
            <span>{{ `当前章节 ${currentChapterTitle || '未锁定'}` }}</span>
            <span>节点 {{ selectedNode?.title || '未选择' }}</span>
            <span>{{ `下一步 ${defaultStageActionText}` }}</span>
            <span v-if="selectedNodeAssetCount > 0">{{ `资产 ${selectedNodeAssetCount}` }}</span>
          </div>
        </div>

        <div class="structure-stage-view__header-actions">
          <button
            type="button"
            class="stage-secondary-action"
            :class="{ 'is-active': showAdvancedControls }"
            @click="showAdvancedControls = !showAdvancedControls"
          >
            <QyIcon name="Filter" :size="14" />
            <span>{{ showAdvancedControls ? '收起高级' : '高级视图' }}</span>
          </button>
          <button
            type="button"
            class="refresh-action"
            :disabled="isOutlineLoading"
            @click="handleRefresh"
          >
            <QyIcon :name="isOutlineLoading ? 'Loading' : 'Refresh'" :size="14" />
            <span>{{ isOutlineLoading ? '加载中' : '刷新' }}</span>
          </button>
        </div>
      </div>
    </header>

    <section
      v-if="showAdvancedControls"
      class="structure-stage-view__advanced"
      data-testid="structure-stage-advanced"
    >
      <!-- 视图模式 Tab：仅在高级控制展开时显示 -->
      <nav class="structure-stage-view__tabs" aria-label="结构舞台视图切换">
        <div class="tabs-group">
          <button
            v-for="option in viewModeOptions"
            :key="option.value"
            type="button"
            class="stage-tab"
            :class="{ 'is-active': stageViewMode === option.value }"
            @click="stageViewMode = option.value"
          >
            <QyIcon :name="option.icon" :size="14" class="stage-tab__icon" />
            <span class="stage-tab__label">{{ option.label }}</span>
          </button>
        </div>
      </nav>

      <!-- 高级工具栏 -->
      <header class="structure-stage-view__toolbar">
        <div class="toolbar-left">
          <div class="structure-search">
            <QyIcon name="Search" :size="14" class="search-icon" />
            <input
              v-model.trim="filterText"
              type="text"
              class="structure-search__input"
              placeholder="搜索节点标题或描述"
            />
          </div>
          <div class="structure-filter-chips">
            <button
              v-for="option in primaryFilterOptions"
              :key="option.value"
              type="button"
              class="structure-filter-chip"
              :class="{ 'is-active': activeFilter === option.value }"
              @click="activeFilter = option.value"
            >
              {{ option.label }}
            </button>
            <label v-if="secondaryFilterOptions.length" class="structure-filter-select-wrap">
              <span class="structure-filter-select__label">更多筛选</span>
              <select
                class="structure-filter-select"
                data-testid="structure-secondary-filter"
                :value="secondaryFilterValue"
                @change="handleSecondaryFilterChange(($event.target as HTMLSelectElement).value)"
              >
                <option value="">选择筛选</option>
                <option
                  v-for="option in secondaryFilterOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </label>
          </div>
        </div>

        <div class="toolbar-right">
          <div class="mini-metrics">
            <div class="mini-metric" title="主干节点数">
              <span>主干</span><strong>{{ rootNodes.length }}</strong>
            </div>
            <div class="mini-metric" title="结构总数">
              <span>总计</span><strong>{{ flattenedNodes.length }}</strong>
            </div>
            <div class="mini-metric" title="当前筛选数">
              <span>命中</span><strong>{{ filteredFlattenedNodes.length }}</strong>
            </div>
            <div class="mini-metric highlight" title="当前章节">
              <span>当前</span><strong>{{ currentChapterTitle || '未选择' }}</strong>
            </div>
          </div>
        </div>
      </header>
    </section>

    <section v-if="structureRefreshError" class="structure-stage-view__error-card">
      <div>
        <p class="structure-stage-view__error-eyebrow">Structure Sync</p>
        <h3>结构数据暂时未同步成功</h3>
        <p>{{ structureRefreshError }}</p>
      </div>
      <button
        type="button"
        class="refresh-action"
        :disabled="isOutlineLoading"
        @click="handleRefresh"
      >
        重新加载
      </button>
    </section>

    <div class="structure-stage-view__grid">
      <div class="structure-stage-view__stage-column">
        <section
          v-if="!showAdvancedControls"
          class="structure-stage-view__default-stage"
          data-testid="structure-stage-default"
        >
          <section class="structure-stage-view__rhythm-board" data-testid="structure-rhythm-board">
            <div class="structure-stage-view__rhythm-head">
              <div>
                <h3>全书节奏表</h3>
              </div>
              <div class="structure-stage-view__rhythm-summary">
                <span>{{
                  `章节 ${rhythmBoardSummary.boundChapters}/${chapterOptions.length}`
                }}</span>
                <span>{{ `当前 ${activeRhythmSegment?.title || '未分段'}` }}</span>
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
                @click="activateRhythmSegment(segment.id)"
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
                  v-model.trim="rhythmLocatorQuery"
                  type="text"
                  placeholder="跳转章节号、章节名或结构节点"
                  @keyup.enter="handleRhythmLocate"
                />
              </label>
              <button
                type="button"
                class="structure-stage-view__locator-action"
                @click="handleRhythmLocate"
              >
                定位
              </button>
              <div class="structure-stage-view__window-filters">
                <button
                  v-for="option in rhythmFilterOptions"
                  :key="option.value"
                  type="button"
                  class="structure-stage-view__window-filter"
                  :class="{ 'is-active': rhythmFilterMode === option.value }"
                  @click="rhythmFilterMode = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
              <span class="structure-stage-view__window-range">{{ rhythmWindowRangeLabel }}</span>
            </div>

            <div
              class="structure-stage-view__rhythm-table-wrap"
              data-testid="structure-stage-default-list"
            >
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
                    @click="selectNode(row.node)"
                  >
                    <td>
                      <span class="structure-stage-view__rhythm-order">{{ row.orderLabel }}</span>
                    </td>
                    <td>
                      <div class="structure-stage-view__rhythm-title">
                        <strong>{{ row.title }}</strong>
                        <p>
                          {{ row.description }}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span
                        class="structure-stage-view__rhythm-status"
                        :class="`is-${row.statusTone}`"
                      >
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
                        @click.stop="
                          emit('switch-tool', row.assetCount > 0 ? 'assets' : 'relations')
                        "
                      >
                        {{ row.assetLabel }}
                      </button>
                    </td>
                    <td>
                      <span class="structure-stage-view__rhythm-wordcount">
                        {{ row.wordCountLabel }}
                      </span>
                    </td>
                    <td>
                      <div class="structure-stage-view__rhythm-actions">
                        <button
                          v-if="row.chapterId"
                          type="button"
                          class="structure-stage-view__rhythm-action is-primary"
                          @click.stop="emit('jumpToChapter', row.chapterId)"
                        >
                          写作
                        </button>
                        <button
                          v-else
                          type="button"
                          class="structure-stage-view__rhythm-action"
                          :disabled="!currentChapterId"
                          @click.stop="bindCurrentChapterForNode(row.node)"
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
                <strong>{{ selectedNode?.title || '未选择结构节点' }}</strong>
                <p>{{ defaultStagePrimaryHint }}</p>
              </div>
              <div class="structure-stage-view__selected-actions">
                <button
                  type="button"
                  class="focus-card__action focus-card__action--primary"
                  :disabled="!boundChapter"
                  @click="boundChapter && emit('jumpToChapter', boundChapter.id)"
                >
                  进入写作
                </button>
                <button
                  type="button"
                  class="focus-card__action focus-card__action--secondary"
                  :disabled="!selectedNode || !currentChapterId"
                  @click="
                    selectedNode && currentChapterId && bindCurrentChapterForNode(selectedNode)
                  "
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
                  @click="showAdvancedControls = true"
                >
                  展开结构视图
                </button>
                <button
                  type="button"
                  class="structure-stage-view__blueprint-action is-primary"
                  data-testid="structure-blueprint-import"
                  @click="emitCreativeWorkflowStructurePlan"
                >
                  导入章节草案
                </button>
                <button
                  type="button"
                  class="structure-stage-view__blueprint-action"
                  @click="emitCreativeWorkflowToAI"
                >
                  交给 AI 做蓝图建议
                </button>
              </div>
            </div>

            <div class="structure-stage-view__blueprint-summary">
              <span
                v-if="creativeWorkflowPitch"
                class="structure-stage-view__blueprint-summary-item is-wide"
              >
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
                  v-model="creativeWorkflowImportTarget"
                  class="structure-stage-view__blueprint-select"
                  data-testid="structure-import-target"
                  @change="creativeWorkflowImportTargetTouched = true"
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
                  v-model="creativeWorkflowDuplicateStrategy"
                  class="structure-stage-view__blueprint-select"
                  data-testid="structure-duplicate-strategy"
                >
                  <option value="skip_existing">跳过已存在章节</option>
                  <option value="allow_duplicate">允许重复导入</option>
                </select>
              </label>
            </div>

            <div
              v-if="creativeWorkflowPromises.length"
              class="structure-stage-view__blueprint-promises"
            >
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
                  <tr
                    v-for="chapter in creativeWorkflowGoldenChapters"
                    :key="chapter.chapterNumber"
                  >
                    <td>
                      <span class="structure-stage-view__blueprint-index">
                        第 {{ chapter.chapterNumber }} 章
                      </span>
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

        <template v-else>
          <!-- 模式 1: 分叉总览 -->
          <section v-if="stageViewMode === 'overview'" class="structure-stage-view__branch-ribbon">
            <div class="structure-stage-view__branch-ribbon-header">
              <div>
                <p class="structure-stage-view__branch-eyebrow">Branch Ribbon</p>
                <h3>主线与分叉一眼对齐</h3>
              </div>
              <div class="structure-stage-view__branch-hint">
                先看每条主干的上下分支密度，再进入鱼骨图与节拍板细化。
              </div>
            </div>

            <div v-if="branchSpotlights.length" class="structure-stage-view__branch-cards">
              <button
                v-for="branch in branchSpotlights"
                :key="branch.id"
                type="button"
                class="structure-branch-card"
                :class="{ 'is-selected': selectedNodeId === branch.id }"
                @click="selectNode(branch.node)"
              >
                <span class="structure-branch-card__level">L{{ branch.level }}</span>
                <strong class="structure-branch-card__title">{{ branch.title }}</strong>
                <span class="structure-branch-card__meta">
                  <span>{{ branch.branchCount }} 条分叉</span>
                  <span>上支 {{ branch.topCount }}</span>
                  <span>下支 {{ branch.bottomCount }}</span>
                </span>
                <span class="structure-branch-card__chips">
                  <span class="structure-branch-card__chip">{{ branch.bindingLabel }}</span>
                  <span class="structure-branch-card__chip" :class="`is-${branch.graphTone}`">{{
                    branch.graphLabel
                  }}</span>
                  <span v-if="branch.assetLabel" class="structure-branch-card__chip">{{
                    branch.assetLabel
                  }}</span>
                </span>
              </button>
            </div>
            <div v-else class="structure-stage-view__branch-empty">
              {{
                isOutlineLoading
                  ? '正在编排主干与分叉摘要…'
                  : '还没有主干节点，先创建主线后再展开分叉。'
              }}
            </div>
          </section>

          <!-- 模式 2: 鱼骨聚焦 -->
          <FishboneOutlineBoard
            v-if="stageViewMode === 'fishbone'"
            :nodes="filteredRootNodes"
            :selected-node-id="selectedNodeId"
            :chapters="chapterOptions"
            :chapter-graphs="chapterGraphs"
            :asset-summary-by-chapter-id="assetSummaryByChapterId"
            :current-chapter-id="currentChapterId"
            :loading="isOutlineLoading"
            :can-move-up="canMoveNodeUp"
            :can-move-down="canMoveNodeDown"
            @select="selectNode"
            @edit-node="openEditNode"
            @move-up="moveNodeUp"
            @move-down="moveNodeDown"
            @create-child-node="openCreateChildForNode"
            @bind-current-chapter="bindCurrentChapterForNode"
            @unbind-chapter="unbindChapterForNode"
            @update-status="updateNodeStatus"
            @open-graph="emit('openGraph', $event)"
            @jump-to-chapter="emit('jumpToChapter', $event)"
          />

          <!-- 模式 3: 自由画布 -->
          <CanvasOutlineBoard
            v-if="stageViewMode === 'canvas'"
            :nodes="filteredRootNodes"
            :selected-node-id="selectedNodeId"
            :chapters="chapterOptions"
            :chapter-graphs="chapterGraphs"
            :asset-summary-by-chapter-id="assetSummaryByChapterId"
            :current-chapter-id="currentChapterId"
            :loading="isOutlineLoading"
            :can-move-up="canMoveNodeUp"
            :can-move-down="canMoveNodeDown"
            @select="selectNode"
            @edit-node="handleCanvasEditNode"
            @move-up="moveNodeUp"
            @move-down="moveNodeDown"
            @create-child-node="openCreateChildForNode"
            @delete-node="handleCanvasDeleteNode"
            @update-status="updateNodeStatus"
            @open-graph="emit('openGraph', $event)"
            @jump-to-chapter="emit('jumpToChapter', $event)"
          />

          <!-- 模式 4: 节拍卡片 -->
          <BeatBoardPanel
            v-if="stageViewMode === 'beats'"
            :beats="filteredFlattenedNodes"
            :selected-node-id="selectedNodeId"
            :chapters="chapterOptions"
            :chapter-graphs="chapterGraphs"
            :asset-summary-by-chapter-id="assetSummaryByChapterId"
            :current-chapter-id="currentChapterId"
            :loading="isOutlineLoading"
            :can-move-up="canMoveNodeUp"
            :can-move-down="canMoveNodeDown"
            @select="selectNode"
            @edit-node="openEditNode"
            @move-up="moveNodeUp"
            @move-down="moveNodeDown"
            @create-child-node="openCreateChildForNode"
            @bind-current-chapter="bindCurrentChapterForNode"
            @unbind-chapter="unbindChapterForNode"
            @update-status="updateNodeStatus"
            @open-graph="emit('openGraph', $event)"
            @jump-to-chapter="emit('jumpToChapter', $event)"
            @reorder="handleTreeReorder"
          />
        </template>
      </div>

      <StructureInspectorPanel
        :selected-node="selectedNode"
        :chapters="chapterOptions"
        :chapter-graphs="chapterGraphs"
        :workflow-context="workflowContext"
        :active-entities="activeEntities"
        :current-chapter-id="currentChapterId"
        :current-chapter-title="currentChapterTitle"
        :draft-binding-chapter-id="draftBindingChapterId"
        :bound-chapter="boundChapter"
        :loading="isOutlineLoading"
        @update:draft-binding-chapter-id="draftBindingChapterId = $event"
        @bind-current-chapter="bindNodeToChapter"
        @bind-chapter="bindNodeToChapter"
        @unbind-chapter="unbindNodeFromChapter"
        @trigger-ai-action="emit('trigger-ai-action', $event)"
        @open-graph="emit('openGraph', $event)"
        @jump-to-chapter="emit('jumpToChapter', $event)"
        @switch-tool="emit('switch-tool', $event)"
      />
    </div>

    <StructureNodeEditorDialog
      v-model:visible="editorVisible"
      :mode="editorMode"
      :initial-value="editorForm"
      :submitting="editorSubmitting"
      @submit="submitNodeEditor"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { message, messageBox } from '@/design-system/services'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import { loadCharacterGraphDraftState } from '@/modules/writer/utils/characterGraphDrafts'
import {
  loadWriterAssetRefState,
  summarizeWriterAssetRefs,
  type WriterAssetRefState,
  type WriterAssetSummary,
} from '@/modules/writer/utils/writerAssetRefs'
import { DocumentStatus } from '@/modules/writer/types/document'
import type { OutlineNode } from '@/types/writer'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type { ActiveEntitySummary } from '@/modules/writer/composables/useWorkflowContext'
import {
  buildWriterWorkflowContextPrompt,
  type WriterWorkflowActionRequest,
  type WriterWorkflowContext,
  type WriterStructureDuplicateStrategy,
  type WriterStructureImportTarget,
  type WriterStructurePlanPayload,
} from '@/modules/writer/types/workflow'
import {
  type GoldenChapterPlan,
  getCreativeWorkflowTemplate,
  loadCreativeWorkflow,
  type CreativeWorkflowRecord,
} from '@/modules/writer/services/creativeWorkflow.service'
import FishboneOutlineBoard from './FishboneOutlineBoard.vue'
import CanvasOutlineBoard from './CanvasOutlineBoard.vue'
import BeatBoardPanel from './BeatBoardPanel.vue'
import StructureInspectorPanel from './StructureInspectorPanel.vue'
import StructureNodeEditorDialog, {
  type StructureNodeFormValue,
} from './StructureNodeEditorDialog.vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import type { ToolType } from '@/modules/writer/composables/useToolOverlay'
import {
  type StructureStatusValue,
  findBoundChapter,
  getBoundChapterId,
  getStructureNodeGraphState,
  getStructureNodeLane,
  getStructureNodeStatusText,
  matchesStructureNodeGraphFilter,
  mapLevelToDocumentType,
} from './structureNodeTypes'

type StructureFilterMode =
  | 'all'
  | 'linked'
  | 'unlinked'
  | 'current-chapter'
  | 'asset-ready'
  | 'asset-missing'
  | 'draft'
  | 'writing'
  | 'completed'
  | 'graph-missing'
  | 'graph-ready'
  | 'graph-inherit'
type StageViewMode = 'overview' | 'fishbone' | 'canvas' | 'beats'
type RhythmFilterMode = 'all' | 'nearby' | 'unlinked' | 'asset-missing' | 'writing' | 'completed'

type TreeDropPosition = 'before' | 'after'

const props = withDefaults(
  defineProps<{
    projectId?: string
    chapters?: SidebarChapterSummary[]
    currentChapterId?: string
    currentChapterTitle?: string
    workflowContext?: WriterWorkflowContext
    activeEntities?: ActiveEntitySummary[]
  }>(),
  {
    projectId: '',
    chapters: () => [],
    currentChapterId: '',
    currentChapterTitle: '',
    workflowContext: undefined,
    activeEntities: () => [],
  },
)

// 本地状态管理
const writerStore = useWriterStore()
const expandedNodeIds = ref<string[]>([])
const selectedNodeId = ref('')

// 本地计算属性
const rootNodes = computed<OutlineNode[]>(() => writerStore.outline.tree || [])

// 本地计算属性（基于过滤后的树，用于舞台视图）
const filteredRootNodes = computed<OutlineNode[]>(() => filterOutlineTree(rootNodes.value))
const filteredFlattenedNodes = computed<OutlineNode[]>(() => {
  const list: OutlineNode[] = []
  const walk = (nodes: OutlineNode[]) => {
    for (const node of nodes) {
      list.push(node)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(filteredRootNodes.value)
  return list
})

// 未过滤的扁平化节点（用于节点排序等操作）
const flattenedNodes = computed<OutlineNode[]>(() => {
  const list: OutlineNode[] = []
  const walk = (nodes: OutlineNode[]) => {
    for (const node of nodes) {
      list.push(node)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(rootNodes.value)
  return list
})

const editorVisible = ref(false)
const editorSubmitting = ref(false)
const editorMode = ref<'create-root' | 'create-child' | 'edit'>('create-root')
const editorForm = ref<StructureNodeFormValue>({
  title: '',
  level: 1,
  status: 'planned',
  description: '',
})
const filterText = ref('')
const activeFilter = ref<StructureFilterMode>('all')
const stageViewMode = ref<StageViewMode>('overview')
const showAdvancedControls = ref(false)
const viewModeOptions: Array<{ value: StageViewMode; label: string; icon: string }> = [
  { value: 'overview', label: '分叉总览', icon: 'Connection' },
  { value: 'fishbone', label: '鱼骨聚焦', icon: 'Workflow' },
  { value: 'canvas', label: '自由画布', icon: 'Grid' },
  { value: 'beats', label: '节拍卡片', icon: 'Card' },
]
const draftBindingChapterId = ref('')
const structureRefreshError = ref('')
const creativeWorkflow = ref<CreativeWorkflowRecord | null>(null)
const assetRefState = ref<WriterAssetRefState>({
  chapterRefs: {},
  volumeRefs: {},
})
const emit = defineEmits<{
  (e: 'trigger-ai-action', payload: WriterWorkflowActionRequest): void
  (e: 'create-structure-plan', payload: WriterStructurePlanPayload): void
  (e: 'jumpToChapter', chapterId: string): void
  (e: 'openGraph', chapterId: string): void
  (e: 'switch-tool', toolId: ToolType): void
}>()

const effectiveProjectId = computed(() => props.projectId || writerStore.currentProjectId || '')
const isOutlineLoading = computed(() => writerStore.outline.loading)
const chapterOptions = computed(() =>
  props.chapters.filter((chapter) => chapter.nodeType !== 'directory'),
)
const graphDraftState = computed(() => loadCharacterGraphDraftState(effectiveProjectId.value))
const chapterGraphs = computed(() => graphDraftState.value.chapterGraphs)
const assetSummaryByChapterId = computed<Record<string, WriterAssetSummary>>(() => {
  const summaries: Record<string, WriterAssetSummary> = {}

  for (const chapter of chapterOptions.value) {
    const chapterRefs = assetRefState.value.chapterRefs[chapter.id] || []
    const volumeRefs = chapter.parentId
      ? assetRefState.value.volumeRefs[chapter.parentId] || []
      : []
    const merged = [...chapterRefs]
    const seen = new Set(
      chapterRefs.map((ref) => `${ref.assetType}:${ref.assetId || ref.assetName}`),
    )

    for (const ref of volumeRefs) {
      const key = `${ref.assetType}:${ref.assetId || ref.assetName}`
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(ref)
    }

    summaries[chapter.id] = summarizeWriterAssetRefs(merged)
  }

  return summaries
})
const filterOptions: Array<{ value: StructureFilterMode; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'linked', label: '已绑定' },
  { value: 'unlinked', label: '待绑定' },
  { value: 'current-chapter', label: '当前章节' },
  { value: 'asset-ready', label: '资产已就绪' },
  { value: 'asset-missing', label: '资产待补' },
  { value: 'graph-missing', label: '待建图谱' },
  { value: 'graph-ready', label: '已建图谱' },
  { value: 'graph-inherit', label: '继承图谱' },
  { value: 'draft', label: '草稿' },
  { value: 'writing', label: '推进中' },
  { value: 'completed', label: '已完成' },
]
const primaryFilterValues: StructureFilterMode[] = [
  'all',
  'current-chapter',
  'linked',
  'unlinked',
  'writing',
]
const primaryFilterOptions = computed(() =>
  filterOptions.filter((option) => primaryFilterValues.includes(option.value)),
)
const secondaryFilterOptions = computed(() =>
  filterOptions.filter((option) => !primaryFilterValues.includes(option.value)),
)
const secondaryFilterValue = computed(() =>
  secondaryFilterOptions.value.some((option) => option.value === activeFilter.value)
    ? activeFilter.value
    : '',
)

const branchSpotlights = computed(() =>
  filteredRootNodes.value.map((node) => {
    const children = node.children || []
    const topCount = children.filter((_, index) => index % 2 === 0).length
    const bottomCount = children.length - topCount
    const branchCount = children.length
    const chapterId = getBoundChapterId(node)
    const assetSummary = chapterId ? assetSummaryByChapterId.value[chapterId] : undefined
    const graphState = getStructureNodeGraphState(node, chapterGraphs.value)
    return {
      id: node.id,
      node,
      title: node.title || '未命名节点',
      level: node.level || 1,
      topCount,
      bottomCount,
      branchCount,
      bindingLabel: findBoundChapter(node, chapterOptions.value)?.title || '未绑定章节',
      graphLabel: graphState.label,
      graphTone: graphState.tone,
      assetLabel: assetSummary?.total ? `资产 ${assetSummary.total}` : '',
    }
  }),
)
const selectedNode = computed(
  () => filteredFlattenedNodes.value.find((node) => node.id === selectedNodeId.value) || null,
)
const boundChapter = computed(() => findBoundChapter(selectedNode.value, chapterOptions.value))
const RHYTHM_SEGMENT_SIZE = 50
const RHYTHM_WINDOW_BEFORE_COUNT = 20
const RHYTHM_WINDOW_AFTER_COUNT = 20
const RHYTHM_SEGMENT_INITIAL_LIMIT = 40
const RHYTHM_FILTERED_ROW_LIMIT = 80
const activeSegmentId = ref('')
const rhythmLocatorQuery = ref('')
const rhythmFilterMode = ref<RhythmFilterMode>('nearby')
const rhythmFilterOptions: Array<{ value: RhythmFilterMode; label: string }> = [
  { value: 'nearby', label: '当前窗口' },
  { value: 'all', label: '本区段' },
  { value: 'unlinked', label: '未绑定正文' },
  { value: 'asset-missing', label: '资产待补' },
  { value: 'writing', label: '推进中' },
  { value: 'completed', label: '已完成' },
]
const selectedNodeAssetCount = computed(() => {
  const chapterId = getBoundChapterId(selectedNode.value)
  if (!chapterId) return 0
  return assetSummaryByChapterId.value[chapterId]?.total || 0
})
const defaultStagePrimaryHint = computed(() => {
  if (boundChapter.value) {
    return `已绑定「${boundChapter.value.title}」，可以直接进入正文继续写。`
  }
  if (selectedNode.value && props.currentChapterTitle) {
    return `当前工作章节是「${props.currentChapterTitle}」，可直接把它绑定到这个节点。`
  }
  if (selectedNode.value) {
    return '先确定这个节点落到哪一章，再进入正文会更顺。'
  }
  return '先从左侧大纲树或下方队列选择一个节点。'
})
const defaultStageActionText = computed(() => {
  if (boundChapter.value) {
    return '进入已绑定章节继续写'
  }
  if (selectedNode.value && props.currentChapterTitle) {
    return '绑定当前章节'
  }
  if (selectedNode.value) {
    return '补章节绑定'
  }
  return '先选节点'
})
const rhythmBoardSummary = computed(() => {
  const chaptersWithBinding = filteredFlattenedNodes.value.filter(
    (node) => !!getBoundChapterId(node),
  )
  const writingNodes = filteredFlattenedNodes.value.filter(
    (node) => getStructureNodeLane(node) === 'writing',
  )
  const unboundNodes = filteredFlattenedNodes.value.filter((node) => !getBoundChapterId(node))

  return {
    boundChapters: chaptersWithBinding.length,
    writing: writingNodes.length,
    unbound: unboundNodes.length,
    assets: filteredFlattenedNodes.value.reduce(
      (total, node) => total + getNodeAssetCount(node),
      0,
    ),
  }
})
const volumeTitleById = computed(() => {
  const result: Record<string, string> = {}
  for (const chapter of props.chapters) {
    if (chapter.nodeType === 'directory') {
      result[chapter.id] = chapter.title || '未命名卷'
    }
  }
  return result
})
const hasVolumeSegments = computed(() => Object.keys(volumeTitleById.value).length > 0)
const rhythmAllRows = computed(() =>
  filteredFlattenedNodes.value.map((node, index) => {
    const chapterId = getBoundChapterId(node)
    const boundChapter = findBoundChapter(node, chapterOptions.value)
    const assetCount = getNodeAssetCount(node)
    const statusTone = getStructureNodeLane(node)
    const chapterTitle = boundChapter?.title || props.currentChapterTitle || '未绑定章节'
    const shortDescription =
      node.description || '以章节推进、节点绑定和节奏节拍为主，复杂信息交给下层工具。'
    const segmentId =
      hasVolumeSegments.value &&
      boundChapter?.parentId &&
      volumeTitleById.value[boundChapter.parentId]
        ? `volume:${boundChapter.parentId}`
        : `auto:${Math.floor(index / RHYTHM_SEGMENT_SIZE)}`

    return {
      id: node.id,
      node,
      index,
      segmentId,
      title: node.title || '未命名节点',
      shortTitle: node.title || `节点 ${index + 1}`,
      description: shortDescription,
      chapterId,
      orderLabel: `#${index + 1}`,
      statusTone,
      statusLabel: getStructureNodeStatusText(node),
      hookLabel: shortDescription.slice(0, 24) || '待补节拍',
      timelineLabel: chapterId ? `时间线 · ${chapterTitle}` : '时间线 · 待绑定',
      assetCount,
      assetLabel: assetCount > 0 ? `资产 ${assetCount}` : '资产待补',
      wordCountLabel: `${boundChapter?.wordCount || node.wordCount || 0} 字`,
    }
  }),
)
const rhythmSegments = computed(() => {
  const segments = new Map<
    string,
    {
      id: string
      title: string
      startIndex: number
      endIndex: number
      total: number
      writing: number
      unbound: number
      assetMissing: number
      completed: number
    }
  >()

  for (const row of rhythmAllRows.value) {
    const autoSegmentIndex = Math.floor(row.index / RHYTHM_SEGMENT_SIZE)
    const title = row.segmentId.startsWith('volume:')
      ? volumeTitleById.value[row.segmentId.replace('volume:', '')] || '未命名卷'
      : `第 ${autoSegmentIndex * RHYTHM_SEGMENT_SIZE + 1}-${Math.min(
          (autoSegmentIndex + 1) * RHYTHM_SEGMENT_SIZE,
          rhythmAllRows.value.length,
        )} 节点`
    const segment = segments.get(row.segmentId) || {
      id: row.segmentId,
      title,
      startIndex: row.index,
      endIndex: row.index,
      total: 0,
      writing: 0,
      unbound: 0,
      assetMissing: 0,
      completed: 0,
    }

    segment.endIndex = row.index
    segment.total += 1
    if (row.statusTone === 'writing') segment.writing += 1
    if (row.statusTone === 'completed') segment.completed += 1
    if (!row.chapterId) segment.unbound += 1
    if (row.assetCount === 0) segment.assetMissing += 1
    segments.set(row.segmentId, segment)
  }

  return [...segments.values()]
})
const activeRhythmSegment = computed(
  () => rhythmSegments.value.find((segment) => segment.id === activeSegmentId.value) || null,
)
const activeSegmentRows = computed(() =>
  rhythmAllRows.value.filter((row) => row.segmentId === activeSegmentId.value),
)
const selectedRhythmRow = computed(
  () => rhythmAllRows.value.find((row) => row.id === selectedNodeId.value) || null,
)
const currentChapterRhythmRow = computed(() =>
  props.currentChapterId
    ? rhythmAllRows.value.find((row) => row.chapterId === props.currentChapterId) || null
    : null,
)
const baseWindowAnchorIndex = computed(() => {
  if (selectedRhythmRow.value?.segmentId === activeSegmentId.value) {
    return selectedRhythmRow.value.index
  }
  if (currentChapterRhythmRow.value?.segmentId === activeSegmentId.value) {
    return currentChapterRhythmRow.value.index
  }
  return activeRhythmSegment.value?.startIndex ?? 0
})
const rhythmWindowRows = computed(() => {
  let rows = activeSegmentRows.value

  if (rhythmFilterMode.value === 'nearby') {
    const segment = activeRhythmSegment.value
    if (!segment) return []
    const hasAnchor =
      selectedRhythmRow.value?.segmentId === activeSegmentId.value ||
      currentChapterRhythmRow.value?.segmentId === activeSegmentId.value
    const start = hasAnchor
      ? Math.max(segment.startIndex, baseWindowAnchorIndex.value - RHYTHM_WINDOW_BEFORE_COUNT)
      : segment.startIndex
    const end = hasAnchor
      ? Math.min(segment.endIndex, baseWindowAnchorIndex.value + RHYTHM_WINDOW_AFTER_COUNT)
      : Math.min(segment.endIndex, segment.startIndex + RHYTHM_SEGMENT_INITIAL_LIMIT - 1)
    rows = rows.filter((row) => row.index >= start && row.index <= end)
  }
  if (rhythmFilterMode.value === 'unlinked') {
    rows = rows.filter((row) => !row.chapterId)
  }
  if (rhythmFilterMode.value === 'asset-missing') {
    rows = rows.filter((row) => row.assetCount === 0)
  }
  if (rhythmFilterMode.value === 'writing') {
    rows = rows.filter((row) => row.statusTone === 'writing')
  }
  if (rhythmFilterMode.value === 'completed') {
    rows = rows.filter((row) => row.statusTone === 'completed')
  }

  return rows.slice(0, RHYTHM_FILTERED_ROW_LIMIT)
})
const rhythmWindowRangeLabel = computed(() => {
  if (!activeRhythmSegment.value) return '无可用区段'
  if (!rhythmWindowRows.value.length) return `${activeRhythmSegment.value.title} · 无匹配`
  const first = rhythmWindowRows.value[0]
  const last = rhythmWindowRows.value[rhythmWindowRows.value.length - 1]
  return `${activeRhythmSegment.value.title} · ${first.orderLabel}-${last.orderLabel}`
})
const creativeWorkflowTemplate = computed(() =>
  getCreativeWorkflowTemplate(creativeWorkflow.value?.templateId),
)
const hasCreativeWorkflowBlueprint = computed(() =>
  Boolean(
    creativeWorkflow.value?.templateId ||
    creativeWorkflow.value?.pitchLine ||
    creativeWorkflow.value?.corePromises.length,
  ),
)
const creativeWorkflowTemplateName = computed(() => creativeWorkflowTemplate.value?.name || '')
const creativeWorkflowPitch = computed(() => creativeWorkflow.value?.pitchLine || '')
const creativeWorkflowAudienceLabel = computed(
  () => creativeWorkflow.value?.targetAudience.slice(0, 2).join(' / ') || '',
)
const creativeWorkflowPaceContract = computed(() => creativeWorkflow.value?.paceContract || '')
const creativeWorkflowPromises = computed(() => creativeWorkflow.value?.corePromises || [])
const creativeWorkflowGoldenChapters = computed<GoldenChapterPlan[]>(
  () => creativeWorkflow.value?.goldenChapters || [],
)
const currentVolumeDirectory = computed(() => {
  const currentChapter = props.chapters.find((chapter) => chapter.id === props.currentChapterId)
  if (!currentChapter?.parentId) {
    return ''
  }

  return (
    props.chapters.find(
      (chapter) => chapter.id === currentChapter.parentId && chapter.nodeType === 'directory',
    )?.title || ''
  )
})
const creativeWorkflowImportTarget = ref<WriterStructureImportTarget>('project-root')
const creativeWorkflowImportTargetTouched = ref(false)
const creativeWorkflowDuplicateStrategy = ref<WriterStructureDuplicateStrategy>('skip_existing')
const creativeWorkflowImportTargetLabel = computed(() =>
  creativeWorkflowImportTarget.value === 'current-volume' && currentVolumeDirectory.value
    ? `当前卷：${currentVolumeDirectory.value}`
    : '项目根目录',
)

watch(
  currentVolumeDirectory,
  (value) => {
    if (creativeWorkflowImportTargetTouched.value) {
      return
    }
    creativeWorkflowImportTarget.value = value ? 'current-volume' : 'project-root'
  },
  { immediate: true },
)

function getNodeAssetCount(node: OutlineNode | null | undefined): number {
  const chapterId = getBoundChapterId(node)
  if (!chapterId) return 0
  return assetSummaryByChapterId.value[chapterId]?.total || 0
}

function emitCreativeWorkflowToAI() {
  if (!creativeWorkflow.value) return

  const workflowPrompt = buildWriterWorkflowContextPrompt(props.workflowContext)
  const lines = [
    '阶段 1 创作流输入：',
    creativeWorkflowTemplateName.value ? `题材模板：${creativeWorkflowTemplateName.value}` : '',
    creativeWorkflowPitch.value ? `定位声明：${creativeWorkflowPitch.value}` : '',
    creativeWorkflowAudienceLabel.value ? `目标读者：${creativeWorkflowAudienceLabel.value}` : '',
    creativeWorkflowPromises.value.length
      ? `核心承诺：${creativeWorkflowPromises.value.join('；')}`
      : '',
    creativeWorkflowPaceContract.value ? `节奏合约：${creativeWorkflowPaceContract.value}` : '',
    ...creativeWorkflowGoldenChapters.value.map((chapter) =>
      [
        `第${chapter.chapterNumber}章：${chapter.title}`,
        chapter.summary ? `目标：${chapter.summary}` : '',
        chapter.hook ? `钩子：${chapter.hook}` : '',
        chapter.payoff ? `兑现：${chapter.payoff}` : '',
      ]
        .filter(Boolean)
        .join(' | '),
    ),
    workflowPrompt,
  ].filter(Boolean)

  emit('trigger-ai-action', {
    source: 'workspace',
    action: 'add_to_chat',
    title: `蓝图接力：${creativeWorkflowTemplateName.value || '黄金三章规划'}`,
    text: lines.join('\n'),
    instructions:
      '请把这些阶段 1 输入转成阶段 3 可执行蓝图建议，优先输出结构节点拆分、前三章 beats、爽点兑现顺序与伏笔预埋建议。',
  })
}

function emitCreativeWorkflowStructurePlan() {
  if (!creativeWorkflowGoldenChapters.value.length) {
    message.warning('当前还没有可导入的黄金三章内容')
    return
  }

  emit('create-structure-plan', {
    mode: 'chapter',
    prompt: `基于 ${creativeWorkflowTemplateName.value || '当前模板'} 导入黄金三章`,
    summary:
      creativeWorkflowPitch.value ||
      creativeWorkflowPaceContract.value ||
      '根据阶段 1 的黄金三章规划生成章节草案。',
    importTarget: creativeWorkflowImportTarget.value,
    duplicateStrategy: creativeWorkflowDuplicateStrategy.value,
    items: creativeWorkflowGoldenChapters.value.map((chapter) => ({
      title: chapter.title,
      summary: chapter.summary,
      reason: [
        chapter.hook ? `钩子：${chapter.hook}` : '',
        chapter.payoff ? `兑现：${chapter.payoff}` : '',
      ]
        .filter(Boolean)
        .join('；'),
    })),
  })
}

function getNodeSiblingContext(node: OutlineNode | null | undefined) {
  if (!node) {
    return { siblings: [] as OutlineNode[], index: -1 }
  }

  const siblings = node.parentId
    ? flattenedNodes.value.find((item) => item.id === node.parentId)?.children || []
    : rootNodes.value
  const orderedSiblings = [...siblings].sort(
    (left, right) => (left.order ?? 0) - (right.order ?? 0),
  )

  return {
    siblings: orderedSiblings,
    index: orderedSiblings.findIndex((item) => item.id === node.id),
  }
}

function expandRootNodes() {
  expandedNodeIds.value = rootNodes.value.map((node) => node.id)
}

function handleSecondaryFilterChange(value: string) {
  if (!value) return
  activeFilter.value = value as StructureFilterMode
}

function activateRhythmSegment(segmentId: string) {
  activeSegmentId.value = segmentId
  rhythmFilterMode.value = 'nearby'
  const firstRow = rhythmAllRows.value.find((row) => row.segmentId === segmentId)
  if (firstRow) {
    selectNode(firstRow.node)
  }
}

function normalizeLocatorText(value: string) {
  return value.trim().toLowerCase()
}

function handleRhythmLocate() {
  const query = normalizeLocatorText(rhythmLocatorQuery.value)
  if (!query) return

  const chapterNumberMatch = query.match(/\d+/)
  const chapterNumber = chapterNumberMatch ? Number(chapterNumberMatch[0]) : 0
  const matchedRow = rhythmAllRows.value.find((row) => {
    const chapter = row.chapterId
      ? chapterOptions.value.find((item) => item.id === row.chapterId)
      : null
    if (chapterNumber > 0 && chapter?.chapterNum === chapterNumber) return true
    if (chapterNumber > 0 && row.index + 1 === chapterNumber) return true
    return (
      row.title.toLowerCase().includes(query) ||
      row.description.toLowerCase().includes(query) ||
      chapter?.title.toLowerCase().includes(query)
    )
  })

  if (!matchedRow) {
    message.warning('没有找到匹配的章节或结构节点')
    return
  }

  activeSegmentId.value = matchedRow.segmentId
  rhythmFilterMode.value = 'nearby'
  selectNode(matchedRow.node)
}

function matchesNodeFilter(node: OutlineNode): boolean {
  const normalizedQuery = filterText.value.trim().toLowerCase()
  const matchesQuery =
    !normalizedQuery ||
    node.title?.toLowerCase().includes(normalizedQuery) ||
    node.description?.toLowerCase().includes(normalizedQuery)

  if (!matchesQuery) return false

  if (activeFilter.value === 'linked') return !!getBoundChapterId(node)
  if (activeFilter.value === 'unlinked') return !getBoundChapterId(node)
  if (activeFilter.value === 'current-chapter') {
    return !!props.currentChapterId && getBoundChapterId(node) === props.currentChapterId
  }
  if (activeFilter.value === 'asset-ready') {
    const chapterId = getBoundChapterId(node)
    return !!chapterId && (assetSummaryByChapterId.value[chapterId]?.total || 0) > 0
  }
  if (activeFilter.value === 'asset-missing') {
    const chapterId = getBoundChapterId(node)
    return !chapterId || (assetSummaryByChapterId.value[chapterId]?.total || 0) === 0
  }
  if (activeFilter.value === 'graph-missing') {
    return matchesStructureNodeGraphFilter(node, chapterGraphs.value, 'missing')
  }
  if (activeFilter.value === 'graph-ready') {
    return matchesStructureNodeGraphFilter(node, chapterGraphs.value, 'graphed')
  }
  if (activeFilter.value === 'graph-inherit') {
    return matchesStructureNodeGraphFilter(node, chapterGraphs.value, 'inherit')
  }
  if (activeFilter.value === 'draft') return getStructureNodeLane(node) === 'draft'
  if (activeFilter.value === 'writing') return getStructureNodeLane(node) === 'writing'
  if (activeFilter.value === 'completed') return getStructureNodeLane(node) === 'completed'
  return true
}

function filterOutlineTree(nodes: OutlineNode[]): OutlineNode[] {
  return nodes.reduce<OutlineNode[]>((result, node) => {
    const filteredChildren = filterOutlineTree(node.children || [])
    if (matchesNodeFilter(node) || filteredChildren.length > 0) {
      result.push({
        ...node,
        children: filteredChildren,
      })
    }
    return result
  }, [])
}

function selectNode(node: OutlineNode) {
  selectedNodeId.value = node.id
  draftBindingChapterId.value = getBoundChapterId(node)
  writerStore.setCurrentOutlineNode(node)
}

function openCreateChildForNode(node: OutlineNode) {
  selectNode(node)
  editorMode.value = 'create-child'
  editorForm.value = {
    title: '',
    level: Math.min((node.level || 1) + 1, 3),
    status: 'planned',
    description: '',
  }
  editorVisible.value = true
}

function openEditNode(node: OutlineNode) {
  selectNode(node)
  editorMode.value = 'edit'
  editorForm.value = {
    title: node.title || '',
    level: node.level || 1,
    status: node.status === 'completed' || node.status === 'writing' ? node.status : 'planned',
    description: node.description || '',
  }
  editorVisible.value = true
}

function canMoveNodeUp(node: OutlineNode): boolean {
  return getNodeSiblingContext(node).index > 0
}

function canMoveNodeDown(node: OutlineNode): boolean {
  const { siblings, index } = getNodeSiblingContext(node)
  return index >= 0 && index < siblings.length - 1
}

async function moveNode(node: OutlineNode, direction: 'up' | 'down') {
  if (!effectiveProjectId.value) return

  const { siblings, index } = getNodeSiblingContext(node)
  if (index < 0) return

  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= siblings.length) return

  const targetNode = siblings[targetIndex]
  if (!targetNode) return

  await writerStore.moveOutlineNode(node.id, effectiveProjectId.value, {
    parentId: node.parentId,
    order: targetNode.order,
  })

  selectNode(node)
  await handleRefresh()
  message.success(direction === 'up' ? '结构节点已上移' : '结构节点已下移')
}

async function reorderNodeToSiblingPosition(
  node: OutlineNode,
  targetNode: OutlineNode,
  position: TreeDropPosition,
) {
  if (!effectiveProjectId.value || node.id === targetNode.id) return
  if ((node.parentId || '') !== (targetNode.parentId || '')) return

  const siblingContext = getNodeSiblingContext(targetNode)
  const remainingSiblings = siblingContext.siblings.filter((item) => item.id !== node.id)
  const targetIndex = remainingSiblings.findIndex((item) => item.id === targetNode.id)
  if (targetIndex < 0) return

  const destinationIndex = position === 'before' ? targetIndex : targetIndex + 1

  await writerStore.moveOutlineNode(node.id, effectiveProjectId.value, {
    parentId: node.parentId,
    order: destinationIndex,
  })

  await handleRefresh()
  const refreshedNode = flattenedNodes.value.find((item) => item.id === node.id)
  if (refreshedNode) {
    selectNode(refreshedNode)
  }
  message.success(position === 'before' ? '结构节点已拖拽到目标前' : '结构节点已拖拽到目标后')
}

async function moveNodeUp(node: OutlineNode) {
  await moveNode(node, 'up')
}

async function moveNodeDown(node: OutlineNode) {
  await moveNode(node, 'down')
}

async function handleTreeReorder(payload: {
  draggedNodeId: string
  targetNodeId: string
  position: TreeDropPosition
}) {
  const draggedNode = flattenedNodes.value.find((node) => node.id === payload.draggedNodeId)
  const targetNode = flattenedNodes.value.find((node) => node.id === payload.targetNodeId)
  if (!draggedNode || !targetNode) return

  await reorderNodeToSiblingPosition(draggedNode, targetNode, payload.position)
}

async function bindNodeToChapter(chapterId: string) {
  if (!selectedNode.value) return
  await bindChapterForNode(selectedNode.value, chapterId)
}

async function unbindNodeFromChapter() {
  if (!selectedNode.value || !effectiveProjectId.value) return
  await unbindChapterForNode(selectedNode.value)
}

async function unbindChapterForNode(node: OutlineNode) {
  if (!effectiveProjectId.value) return

  await writerStore.updateOutlineNode(node.id, effectiveProjectId.value, {
    title: node.title,
    status:
      node.status === 'completed' || node.status === 'writing'
        ? node.status
        : DocumentStatus.PLANNED,
    notes: (node as OutlineNode & { notes?: string }).notes,
    tags: [],
    documentId: '',
  })

  selectNode(node)
  draftBindingChapterId.value = ''
  await handleRefresh()
  message.success('章节绑定已解除')
}

async function bindChapterForNode(node: OutlineNode, chapterId: string) {
  if (!effectiveProjectId.value) return

  // 只有 volume 类型的大纲节点才能自动映射到章节
  const nodeWithType = node as OutlineNode & { type?: string }
  if (nodeWithType.type && nodeWithType.type !== 'volume') {
    message.warning('只有卷级别的大纲节点才能绑定章节')
    return
  }

  await writerStore.updateOutlineNode(node.id, effectiveProjectId.value, {
    title: node.title,
    status:
      node.status === 'completed' || node.status === 'writing'
        ? node.status
        : DocumentStatus.PLANNED,
    notes: (node as OutlineNode & { notes?: string }).notes,
    tags: [],
    documentId: chapterId,
  })

  selectNode(node)
  draftBindingChapterId.value = chapterId
  await handleRefresh()
  const chapter = chapterOptions.value.find((item) => item.id === chapterId)
  message.success(chapter ? `已绑定到章节「${chapter.title}」` : '章节绑定已更新')
}

async function bindCurrentChapterForNode(node: OutlineNode) {
  if (!props.currentChapterId) return

  // 只有 volume 类型的大纲节点才能自动映射到章节
  const nodeWithType = node as OutlineNode & { type?: string }
  if (nodeWithType.type && nodeWithType.type !== 'volume') {
    message.warning('只有卷级别的大纲节点才能绑定章节')
    return
  }

  await bindChapterForNode(node, props.currentChapterId)
}

async function updateNodeStatus(node: OutlineNode, status: StructureStatusValue) {
  if (!effectiveProjectId.value) return
  if ((node.status || 'planned') === status) return

  await writerStore.updateOutlineNode(node.id, effectiveProjectId.value, {
    title: node.title,
    status: status === 'planned' ? DocumentStatus.PLANNED : status,
    notes: (node as OutlineNode & { notes?: string }).notes,
    tags: (node as OutlineNode & { tags?: string[] }).tags,
  })

  selectNode(node)
  await handleRefresh()
  message.success(
    `结构节点已切换为「${status === 'planned' ? '草稿' : status === 'writing' ? '写作中' : '已完成'}」`,
  )
}

async function submitNodeEditor(value: StructureNodeFormValue) {
  if (!effectiveProjectId.value) {
    message.warning('当前没有可用项目')
    return
  }
  if (!value.title) {
    message.warning('请输入节点标题')
    return
  }

  editorSubmitting.value = true
  try {
    if (editorMode.value === 'edit' && selectedNode.value) {
      await writerStore.updateOutlineNode(selectedNode.value.id, effectiveProjectId.value, {
        title: value.title,
        status: value.status === 'planned' ? DocumentStatus.PLANNED : value.status,
        notes: value.description,
      })
      message.success('结构节点已更新')
    } else {
      await writerStore.createOutlineNode(effectiveProjectId.value, {
        parentId: editorMode.value === 'create-child' ? selectedNode.value?.id : undefined,
        title: value.title,
        type: mapLevelToDocumentType(value.level),
        order: flattenedNodes.value.length,
      })
      message.success(editorMode.value === 'create-child' ? '子节点已创建' : '主干节点已创建')
    }

    editorVisible.value = false
    await handleRefresh()
  } finally {
    editorSubmitting.value = false
  }
}

/**
 * 画布编辑节点：双击改名时，直接更新标题（不走编辑弹窗）
 */
async function handleCanvasEditNode(node: OutlineNode) {
  if (!effectiveProjectId.value) return
  // 画布双击编辑时，打开编辑弹窗以保留完整表单能力
  openEditNode(node)
}

/**
 * 画布删除节点
 */
async function handleCanvasDeleteNode(node: OutlineNode) {
  if (!effectiveProjectId.value) return
  await messageBox.confirm(`确定删除结构节点"${node.title}"吗？`, '删除节点', {
    type: 'warning',
  })
  await writerStore.deleteOutlineNode(node.id, effectiveProjectId.value)
  if (selectedNodeId.value === node.id) {
    selectedNodeId.value = ''
    draftBindingChapterId.value = ''
  }
  message.success('结构节点已删除')
}

async function handleRefresh() {
  if (!effectiveProjectId.value) return
  structureRefreshError.value = ''
  try {
    await writerStore.loadOutlineTree(effectiveProjectId.value)
    assetRefState.value = loadWriterAssetRefState(effectiveProjectId.value)
    creativeWorkflow.value = await loadCreativeWorkflow(effectiveProjectId.value)
    expandRootNodes()
    if (!selectedNodeId.value && filteredRootNodes.value.length > 0) {
      selectNode(filteredRootNodes.value[0])
    }
  } catch (error) {
    const fallbackMessage =
      error instanceof Error ? error.message : writerStore.error || '结构数据加载失败，请稍后重试'
    structureRefreshError.value = fallbackMessage
    message.error(fallbackMessage)
  }
}

watch(
  () => effectiveProjectId.value,
  async (projectId) => {
    if (!projectId) return
    await handleRefresh()
  },
  { immediate: true },
)

watch(
  () => selectedNode.value?.id,
  () => {
    draftBindingChapterId.value = getBoundChapterId(selectedNode.value)
  },
  { immediate: true },
)

watch(
  () => [
    rhythmSegments.value.map((segment) => segment.id).join('|'),
    props.currentChapterId,
    selectedNodeId.value,
  ],
  () => {
    if (
      activeSegmentId.value &&
      rhythmSegments.value.some((segment) => segment.id === activeSegmentId.value)
    ) {
      return
    }

    const targetSegmentId =
      currentChapterRhythmRow.value?.segmentId ||
      selectedRhythmRow.value?.segmentId ||
      rhythmSegments.value[0]?.id ||
      ''
    activeSegmentId.value = targetSegmentId
  },
  { immediate: true },
)

watch(
  () => props.currentChapterId,
  () => {
    if (currentChapterRhythmRow.value) {
      activeSegmentId.value = currentChapterRhythmRow.value.segmentId
    }
  },
)

watch(
  () => [
    filterText.value,
    activeFilter.value,
    filteredFlattenedNodes.value.map((node) => node.id).join('|'),
  ],
  () => {
    if (
      selectedNodeId.value &&
      filteredFlattenedNodes.value.some((node) => node.id === selectedNodeId.value)
    ) {
      return
    }

    const firstNode = filteredFlattenedNodes.value[0]
    if (firstNode) {
      selectNode(firstNode)
      return
    }

    selectedNodeId.value = ''
    draftBindingChapterId.value = ''
    writerStore.setCurrentOutlineNode(null)
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
/* ==========================================================================
   结构舞台主容器 - 采用现代毛玻璃设计与分层 Flex 布局
   ========================================================================== */
.structure-stage-view {
  --structure-warm: #8f3f2f;
  --structure-accent: #32536a;

  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  position: relative;
  background: transparent;
}

.structure-stage-view__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 2px;
}

.structure-stage-view__header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.structure-stage-view__title-block {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;

  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: var(--editor-text-primary, #0f172a);
    white-space: nowrap;
  }
}

.structure-stage-view__header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.structure-stage-view__header-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 6px;
  min-width: 0;

  span {
    display: inline-flex;
    align-items: center;
    min-height: 22px;
    padding: 0 8px;
    border-radius: 999px;
    background: rgba(248, 250, 252, 0.88);
    border: 1px solid rgba(148, 163, 184, 0.12);
    color: #64748b;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
  }
}

.stage-secondary-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--editor-border, #e2e8f0);
  border-radius: 999px;
  background: var(--editor-bg-base, #fff);
  color: var(--editor-text-secondary, #334155);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 120ms ease-out;

  &:hover {
    border-color: rgba(50, 83, 106, 0.24);
    color: var(--editor-text-primary, #0f172a);
  }

  &.is-active {
    border-color: rgba(6, 182, 212, 0.28);
    background: rgba(236, 254, 255, 0.72);
    color: var(--editor-accent, #06b6d4);
  }
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
    color: #fff;
  }

  &--secondary {
    border-color: rgba(50, 83, 106, 0.16);
    background: rgba(236, 254, 255, 0.72);
    color: var(--editor-accent, #06b6d4);
  }

  &--ghost {
    border-color: var(--editor-border, #e2e8f0);
    background: var(--editor-bg-base, #fff);
    color: var(--editor-text-secondary, #334155);
  }
}

.structure-stage-view__advanced {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

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
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94)),
    radial-gradient(circle at top left, rgba(143, 63, 47, 0.06), transparent 34%);
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

  p {
    margin: 0;
    max-width: 640px;
    color: var(--editor-text-secondary, #475569);
    font-size: 13px;
    line-height: 1.7;
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
    border: 1px solid rgba(148, 163, 184, 0.16);
    background: rgba(255, 255, 255, 0.82);
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
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.88);
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
    color: #94a3b8;
    font-size: 11px;
    font-weight: 800;
  }

  em {
    margin-top: 4px;
    color: #b45309;
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
    border-color: rgba(143, 63, 47, 0.2);
  }

  &.is-active {
    border-color: rgba(143, 63, 47, 0.26);
    background: rgba(255, 247, 237, 0.88);
    box-shadow: inset 0 0 0 1px rgba(143, 63, 47, 0.16);
  }

  &.has-warnings {
    background: linear-gradient(90deg, rgba(251, 191, 36, 0.12), rgba(255, 255, 255, 0.9)), #fff;
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
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.9);
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
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.92);
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
  border-color: rgba(143, 63, 47, 0.22);
  background: rgba(255, 247, 237, 0.92);
  color: var(--structure-warm);
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
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
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
    border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  }

  th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: #f8fafc;
    color: #64748b;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
}

.structure-stage-view__rhythm-row {
  cursor: pointer;
  transition: background-color 120ms ease-out;

  &:hover {
    background: rgba(248, 250, 252, 0.86);
  }

  &.is-selected {
    background: rgba(255, 247, 237, 0.72);
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
  background: rgba(226, 232, 240, 0.86);
  color: #334155;
}

.structure-stage-view__rhythm-status {
  &.is-draft {
    background: rgba(226, 232, 240, 0.9);
    color: #475569;
  }

  &.is-writing {
    background: rgba(236, 254, 255, 0.9);
    color: #0891b2;
  }

  &.is-completed {
    background: rgba(240, 253, 244, 0.94);
    color: #15803d;
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
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.92);
  color: var(--editor-accent, #06b6d4);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.structure-stage-view__rhythm-wordcount {
  background: rgba(248, 250, 252, 0.96);
  color: var(--editor-text-secondary, #475569);
  border: 1px solid rgba(148, 163, 184, 0.14);
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
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.96);
  color: var(--editor-text-secondary, #475569);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;

  &.is-primary {
    border-color: rgba(14, 116, 144, 0.16);
    background: rgba(236, 254, 255, 0.96);
    color: #0f766e;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.56;
  }
}

.structure-stage-view__selected-strip,
.structure-stage-view__rhythm-note {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(248, 250, 252, 0.76);
}

.structure-stage-view__selected-strip {
  span {
    display: block;
    color: #94a3b8;
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

.structure-stage-view__rhythm-note {
  flex-shrink: 0;
  color: var(--editor-text-secondary, #475569);
  font-size: 12px;
  line-height: 1.6;

  button {
    border: none;
    background: transparent;
    color: var(--editor-accent, #06b6d4);
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
  }
}

.structure-stage-view__blueprint-card {
  display: grid;
  gap: 14px;
  padding: 16px;
  border-radius: var(--editor-radius-lg, 8px);
  border: 1px solid rgba(191, 141, 79, 0.14);
  background: rgba(255, 252, 246, 0.76);
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

.structure-stage-view__blueprint-actions {
  align-items: center;
  flex-wrap: wrap;
}

.structure-stage-view__blueprint-action {
  height: 36px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid rgba(91, 72, 50, 0.14);
  background: rgba(255, 255, 255, 0.94);
  color: #6b4f35;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  &.is-primary {
    border-color: rgba(217, 119, 6, 0.26);
    color: #b45309;
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
  border: 1px solid rgba(191, 141, 79, 0.14);
  background: rgba(255, 255, 255, 0.82);

  strong {
    color: #a17648;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  em {
    color: #5b4632;
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
  }
}

.structure-stage-view__blueprint-summary-item.is-wide {
  max-width: min(100%, 520px);
}

.structure-stage-view__blueprint-summary-item.is-accent {
  background: rgba(255, 247, 230, 0.9);
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
    color: #6b4f35;
  }

  > small {
    color: #8b6b4b;
    line-height: 1.4;
  }
}

.structure-stage-view__blueprint-select {
  width: 100%;
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid rgba(191, 141, 79, 0.22);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);
  color: #5b4632;
  font-size: 13px;
}

.structure-stage-view__blueprint-promises,
.structure-stage-view__blueprint-hints {
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
  background: rgba(255, 255, 255, 0.88);
  color: #8b5e34;
  font-size: 12px;
  font-weight: 600;
}

.structure-stage-view__blueprint-table-wrap {
  overflow: auto;
  border: 1px solid rgba(191, 141, 79, 0.14);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
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
    border-bottom: 1px solid rgba(191, 141, 79, 0.1);
  }

  th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: rgba(255, 248, 235, 0.96);
    color: #8b6b4b;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  td {
    color: #5b4632;
    font-size: 13px;
    line-height: 1.65;
    background: rgba(255, 255, 255, 0.92);
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  strong {
    color: #3f3023;
    font-size: 13px;
  }
}

.structure-stage-view__default-hero,
.structure-stage-view__default-queue {
  border-radius: var(--editor-radius-lg, 8px);
  border: 1px solid var(--editor-border, #e2e8f0);
  background: var(--editor-bg-base, #ffffff);
  overflow: hidden;
}

.structure-stage-view__default-hero {
  display: grid;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.98);
}

.structure-stage-view__default-eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--structure-warm);
}

.structure-stage-view__default-hero-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.structure-stage-view__default-hero h3,
.structure-stage-view__default-queue-header h4 {
  margin: 4px 0 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--editor-text-primary, #0f172a);
}

.structure-stage-view__default-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;

  span {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    padding: 0 8px;
    border-radius: 999px;
    background: rgba(248, 250, 252, 0.9);
    border: 1px solid rgba(148, 163, 184, 0.12);
    color: var(--editor-text-secondary, #334155);
    font-size: 11px;
    font-weight: 600;
  }
}

.structure-stage-view__default-focus-table-wrap {
  overflow-x: auto;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.9);
}

.structure-stage-view__default-focus-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 880px;

  th,
  td {
    padding: 10px 12px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.12);
    text-align: left;
    vertical-align: middle;
    white-space: nowrap;
  }

  tr:last-child th,
  tr:last-child td {
    border-bottom: none;
  }

  th {
    color: #64748b;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  td {
    color: #0f172a;
    font-size: 13px;
    font-weight: 600;
  }
}

.structure-stage-view__default-focus-description {
  white-space: normal !important;
  line-height: 1.6;
  color: #475569 !important;
  font-weight: 500 !important;
}

.structure-stage-view__default-work-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.structure-stage-view__default-queue {
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.structure-stage-view__default-queue-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--editor-border, #e2e8f0);
}

.structure-stage-view__default-queue-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.structure-stage-view__default-count {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--editor-bg-surface, #f8fafc);
  color: var(--editor-text-secondary, #475569);
  font-size: 12px;
  font-weight: 700;
}

.structure-stage-view__default-overflow {
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  line-height: 1.5;
  text-align: right;
}

.structure-stage-view__default-list {
  min-height: 0;
  overflow: auto;
  padding: 0;
}

.structure-stage-view__default-table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 12px 14px;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  }

  th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: #f8fafc;
    color: #64748b;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
}

.structure-stage-view__default-row {
  cursor: pointer;
  transition: background-color 120ms ease-out;

  &:hover {
    background: rgba(248, 250, 252, 0.88);
  }

  &.is-selected {
    background: rgba(236, 254, 255, 0.76);
  }
}

.structure-stage-view__default-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(226, 232, 240, 0.9);
  color: #334155;
  font-size: 12px;
  font-weight: 700;
}

.structure-stage-view__default-node {
  display: grid;
  gap: 6px;
}

.structure-stage-view__default-node-header,
.structure-stage-view__default-node-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.structure-stage-view__default-node-status,
.structure-stage-view__default-node-binding,
.structure-stage-view__default-node-meta span {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.structure-stage-view__default-node-status {
  &.is-draft {
    background: rgba(226, 232, 240, 0.9);
    color: #475569;
  }

  &.is-writing {
    background: rgba(236, 254, 255, 0.9);
    color: #0891b2;
  }

  &.is-completed {
    background: rgba(240, 253, 244, 0.94);
    color: #15803d;
  }
}

.structure-stage-view__default-node-binding,
.structure-stage-view__default-node-meta span {
  background: rgba(248, 250, 252, 0.96);
  color: var(--editor-text-secondary, #475569);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.structure-stage-view__default-node-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--editor-text-primary, #0f172a);
}

.structure-stage-view__default-node-copy {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--editor-text-secondary, #475569);
}

.structure-stage-view__default-node-assets {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(248, 250, 252, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.14);
  color: var(--editor-text-secondary, #475569);
  font-size: 11px;
  font-weight: 700;
}

.structure-stage-view__default-node-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.structure-stage-view__default-node-action {
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.96);
  color: var(--editor-text-secondary, #475569);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  &.is-primary {
    border-color: rgba(14, 116, 144, 0.16);
    background: rgba(236, 254, 255, 0.96);
    color: #0f766e;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.56;
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

/* 1. 顶部现代化分段导航栏 (Segmented Control) */
.structure-stage-view__tabs {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--editor-bg-surface, #f8fafc);
  border-radius: var(--editor-radius-lg, 8px);
  border: 1px solid var(--editor-border, #e2e8f0);
  margin: 0 4px;
}

.tabs-group {
  display: flex;
  gap: 2px;
  background: var(--editor-bg-elevated, #f1f5f9);
  padding: 4px;
  border-radius: var(--editor-radius-md, 6px);
  border: 1px solid var(--editor-border, #e2e8f0);
}

.stage-tab {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px;
  border-radius: var(--editor-radius-md, 6px);
  border: 1px solid transparent;
  background: transparent;
  color: var(--editor-text-muted, #64748b);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;

  .stage-tab__icon {
    opacity: 0.5;
    transition: all 0.25s;
    filter: grayscale(1);
    color: currentColor;
  }

  &:hover {
    color: var(--editor-text-secondary, #334155);
    background: var(--editor-bg-elevated, #f1f5f9);

    .stage-tab__icon {
      opacity: 0.8;
      filter: grayscale(0);
      transform: scale(1.1);
    }
  }

  &.is-active {
    background: var(--editor-bg-base, #ffffff);
    color: var(--editor-accent, #06b6d4);
    border-color: var(--editor-accent-soft-border, #a5f3fc);
    box-shadow: none;

    .stage-tab__icon {
      opacity: 1;
      filter: grayscale(0);
    }

    .stage-tab__label {
      font-weight: 700;
    }
  }
}

.tabs-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.refresh-action {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 10px;
  border: 1px solid rgba(143, 63, 47, 0.1);
  background: white;
  color: #5f4e40;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #fffcf9;
    border-color: var(--structure-warm);
    color: var(--structure-warm);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(143, 63, 47, 0.06);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

/* 2. 紧凑工具栏 (搜索 & 指标) */
.structure-stage-view__toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  gap: 16px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.structure-search {
  position: relative;
  width: 260px;

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #a39589;
  }

  .structure-search__input {
    width: 100%;
    height: 36px;
    padding: 0 12px 0 38px;
    border-radius: 12px;
    border: 1px solid rgba(143, 63, 47, 0.1);
    background: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    outline: none;
    transition: all 0.2s;

    &:focus {
      background: white;
      border-color: var(--structure-warm);
      box-shadow: 0 0 0 3px rgba(143, 63, 47, 0.08);
    }
  }
}

.structure-filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.structure-filter-select-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(143, 63, 47, 0.1);
  background: rgba(255, 255, 255, 0.82);
}

.structure-filter-select__label {
  font-size: 11px;
  font-weight: 700;
  color: #8a7e74;
  text-transform: uppercase;
}

.structure-filter-chip {
  padding: 6px 14px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: rgba(143, 63, 47, 0.04);
  color: #746b64;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(143, 63, 47, 0.08);
  }

  &.is-active {
    background: rgba(143, 63, 47, 0.1);
    color: var(--structure-warm);
    border-color: rgba(143, 63, 47, 0.2);
  }
}

.structure-filter-select {
  border: none;
  background: transparent;
  color: #5f4e40;
  font-size: 12px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
}

.mini-metrics {
  display: flex;
  gap: 20px;
  background: rgba(255, 255, 255, 0.5);
  padding: 6px 16px;
  border-radius: 12px;
  border: 1px solid rgba(143, 63, 47, 0.08);
}

.mini-metric {
  display: flex;
  flex-direction: column;
  line-height: 1.3;

  span {
    font-size: 10px;
    color: #a39589;
    font-weight: 700;
    text-transform: uppercase;
  }

  strong {
    font-size: 14px;
    color: #4e443c;
    font-weight: 700;
  }

  &.highlight strong {
    color: var(--structure-warm);
  }
}

/* 3. 双栏网格布局容器（树已移至侧边栏） */
.structure-stage-view__grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  grid-template-areas: 'stage inspector';
  gap: 16px;
  padding: 0 4px 4px;
}

.structure-stage-view__grid > * {
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--editor-bg-surface, #f8fafc);
  border-radius: var(--editor-radius-lg, 8px);
  border: 1px solid var(--editor-border, #e2e8f0);
  overflow: hidden;
}

.structure-stage-view__stage-column {
  grid-area: stage;
  background: transparent;
  border: none;
  gap: 16px;
}

/* 4. 具体视图样式 (分叉总览/鱼骨/节拍) */
.structure-stage-view__branch-ribbon,
:deep(.fishbone-outline-board),
:deep(.beat-board-panel) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--editor-bg-base, #ffffff);
  border-radius: var(--editor-radius-lg, 8px);
  border: 1px solid var(--editor-border, #e2e8f0);
  overflow: hidden;
}

/* 5. 分叉总览 (Branch Ribbon) 卡片流样式 */
.structure-stage-view__branch-ribbon {
  padding: 24px;
}

.structure-stage-view__branch-ribbon-header {
  margin-bottom: 24px;
  flex-shrink: 0;
}

.structure-stage-view__branch-eyebrow {
  font-size: 11px;
  font-weight: 800;
  color: var(--structure-warm);
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.structure-stage-view__branch-ribbon-header h3 {
  margin: 6px 0;
  font-size: 24px;
  font-weight: 800;
  color: #2e2b27;
}

.structure-stage-view__branch-hint {
  font-size: 14px;
  color: #8a7e74;
  line-height: 1.6;
}

.structure-stage-view__branch-cards {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  padding: 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(143, 63, 47, 0.1);
    border-radius: 4px;
  }
}

.structure-branch-card {
  padding: 20px;
  border-radius: 18px;
  border: 1px solid rgba(143, 63, 47, 0.1);
  background: white;
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.25s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 32px rgba(143, 63, 47, 0.1);
    border-color: rgba(143, 63, 47, 0.2);
  }

  &.is-selected {
    background: rgba(143, 63, 47, 0.03);
    border-color: var(--structure-warm);
    box-shadow: 0 8px 24px rgba(143, 63, 47, 0.12);
  }
}

.structure-branch-card__level {
  display: inline-flex;
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(50, 83, 106, 0.08);
  color: #32536a;
  font-size: 11px;
  font-weight: 800;
}

.structure-branch-card__title {
  color: #2b2926;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.35;
}

.structure-branch-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  span {
    font-size: 12px;
    color: #6f6257;
    background: #f5efe7;
    border-radius: 999px;
    padding: 4px 10px;
  }
}

.structure-branch-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.structure-branch-card__chip {
  font-size: 11px;
  color: #65574d;
  border-radius: 999px;
  border: 1px solid rgba(117, 93, 67, 0.12);
  background: rgba(255, 251, 247, 0.88);
  padding: 4px 10px;
}

.structure-branch-card__chip.is-ready {
  color: #1f6a43;
  background: #eaf7ef;
  border-color: rgba(31, 106, 67, 0.16);
}

.structure-branch-card__chip.is-inherit {
  color: #32536a;
  background: #eaf1f6;
  border-color: rgba(50, 83, 106, 0.16);
}

.structure-branch-card__chip.is-missing {
  color: #8f3f2f;
  background: #fff2e7;
  border-color: rgba(143, 63, 47, 0.16);
}

.structure-stage-view__branch-empty {
  border-radius: 18px;
  border: 2px dashed rgba(143, 63, 47, 0.15);
  background: rgba(255, 251, 247, 0.6);
  padding: 32px;
  color: #8a7e74;
  font-size: 15px;
  text-align: center;
}

/* 子组件特殊覆盖 */
:deep(.structure-inspector-panel) {
  grid-area: inspector;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

@media (max-width: 1380px) {
  .structure-stage-view__grid {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'stage'
      'inspector';
  }
}

@media (max-width: 1024px) {
  .structure-stage-view__header-main {
    flex-direction: column;
    align-items: stretch;
  }

  .structure-stage-view__title-block {
    flex-direction: column;
    align-items: flex-start;
  }

  .structure-stage-view__blueprint-head {
    flex-direction: column;
  }

  .structure-stage-view__blueprint-controls {
    grid-template-columns: 1fr;
  }

  .structure-stage-view__header-actions {
    flex-wrap: wrap;
  }

  .structure-stage-view__default-queue-header {
    flex-direction: column;
    align-items: stretch;
  }

  .structure-stage-view__default-hero-head {
    flex-direction: column;
  }

  .structure-stage-view__blueprint-table-wrap,
  .structure-stage-view__default-list,
  .structure-stage-view__default-focus-table-wrap {
    overflow-x: auto;
  }

  .structure-stage-view__grid {
    grid-template-columns: 1fr;
    grid-template-areas:
      'stage'
      'inspector';
  }

  .structure-stage-view__tabs {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .tabs-group {
    justify-content: center;
  }

  .tabs-actions {
    justify-content: space-between;
  }
}
</style>
