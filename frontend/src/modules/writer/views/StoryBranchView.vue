<template>
  <section class="interactive-branch-view">
    <header class="interactive-branch-view__header">
      <div class="interactive-branch-view__header-main">
        <div class="interactive-branch-view__title-row">
          <h2>互动分支</h2>
          <ToolAssetSummaryChips :items="visibleAssetSummaryItems" />
        </div>
      </div>

      <div class="interactive-branch-view__header-actions">
        <QyButton
          v-if="showDemoBranchEntry"
          variant="secondary"
          size="sm"
          @click="toggleDemoBranchData"
        >
          {{ useDemoBranchData ? '返回项目' : '查看示例' }}
        </QyButton>
        <div class="interactive-branch-view__mode-switch">
          <button
            type="button"
            :class="{ 'is-active': viewMode === 'compact' }"
            @click="viewMode = 'compact'"
          >
            轻量模式
          </button>
          <button
            type="button"
            :class="{ 'is-active': viewMode === 'interactive-flow' }"
            @click="viewMode = 'interactive-flow'"
          >
            互动流
          </button>
        </div>
        <QyButton variant="secondary" size="sm" @click="refreshOutline" :loading="isLoading">
          <QyIcon name="Refresh" :size="14" />
          刷新
        </QyButton>
      </div>
    </header>

    <div class="interactive-branch-view__stats">
      <div class="interactive-branch-stat">
        <span>路线</span>
        <strong>{{ routeStats.routeCount }}</strong>
      </div>
      <div class="interactive-branch-stat">
        <span>选择点</span>
        <strong>{{ routeStats.choiceCount }}</strong>
      </div>
      <div class="interactive-branch-stat">
        <span>结局</span>
        <strong>{{ routeStats.endingCount }}</strong>
      </div>
      <div class="interactive-branch-stat">
        <span>未回收</span>
        <strong>{{ routeStats.openBranchCount }}</strong>
      </div>
      <span class="interactive-branch-view__stats-summary">
        {{ narrativeModeLabel }} · {{ currentRouteSummary }}
      </span>
    </div>

    <div class="interactive-branch-view__body">
      <aside class="interactive-branch-view__routes">
        <div class="interactive-branch-view__section-head">
          <span>路线</span>
          <strong>{{ filteredRouteCount }}</strong>
        </div>
        <label class="interactive-branch-view__search">
          <QyIcon name="Search" :size="14" />
          <input
            v-model.trim="routeQuery"
            type="text"
            name="interactive-branch-route-search"
            aria-label="搜索路线"
            placeholder="搜索路线、选择或结局"
          />
        </label>

        <div class="interactive-branch-view__route-list">
          <section
            v-for="group in displayedRouteGroups"
            :key="group.id"
            class="interactive-route-group"
            :data-group-kind="group.kind"
          >
            <button
              type="button"
              class="interactive-route-group__header"
              :data-testid="`route-group-${group.id}`"
              @click="toggleRouteGroup(group.id)"
            >
              <span class="interactive-route-group__title">{{ group.title }}</span>
              <span class="interactive-route-group__meta">
                <span>{{ group.routes.length }}</span>
                <span>{{ isRouteGroupCollapsed(group.id) ? '展开' : '收起' }}</span>
              </span>
            </button>
            <div v-if="!isRouteGroupCollapsed(group.id)" class="interactive-route-group__body">
              <button
                v-for="route in group.visibleRoutes"
                :key="route.id"
                type="button"
                class="interactive-route-card"
                :class="{ 'is-active': route.id === activeRouteId }"
                @click="selectRoute(route.id)"
              >
                <div class="interactive-route-card__header">
                  <span class="interactive-route-card__kind" :class="`is-${route.kind}`">
                    {{ getRouteKindLabel(route.kind) }}
                  </span>
                  <span class="interactive-route-card__count">{{ route.nodeIds.length }} 节点</span>
                </div>
                <strong class="interactive-route-card__title">{{ route.title }}</strong>
                <span class="interactive-route-card__summary">{{ route.summary }}</span>
              </button>
              <button
                v-if="group.hiddenRouteCount > 0"
                type="button"
                class="interactive-route-group__more"
                :data-testid="`route-group-more-${group.id}`"
                @click="toggleRouteGroupExpansion(group.id)"
              >
                展开其余 {{ group.hiddenRouteCount }} 条
              </button>
              <button
                v-else-if="expandedRouteGroups[group.id] && group.routes.length > ROUTE_GROUP_WINDOW_SIZE"
                type="button"
                class="interactive-route-group__more"
                :data-testid="`route-group-less-${group.id}`"
                @click="toggleRouteGroupExpansion(group.id)"
              >
                收起更多
              </button>
            </div>
          </section>
        </div>
      </aside>

      <main class="interactive-branch-view__flow">
        <div class="interactive-branch-view__flow-toolbar">
          <div class="interactive-branch-view__section-head">
            <span>分支流</span>
            <strong>{{ visibleNodes.length }} / {{ activeRouteNodes.length }}</strong>
          </div>
          <div class="interactive-branch-view__locator">
            <label>
              <QyIcon name="Search" :size="14" />
              <input
                v-model.trim="branchLocatorQuery"
                type="text"
                name="interactive-branch-node-locate"
                aria-label="定位互动分支节点"
                placeholder="定位章节号、节点标题或关键词"
                @keyup.enter="handleBranchLocate"
              />
            </label>
            <button type="button" @click="handleBranchLocate">定位</button>
          </div>
        </div>

        <div class="interactive-branch-view__route-summary">
          <span class="interactive-branch-view__route-label">
            {{ activeRoute?.title || '全部路线' }}
          </span>
          <span>{{ currentWindowLabel }}</span>
          <span v-if="currentChapterNode">当前章节落点：{{ currentChapterNode.title }}</span>
        </div>

        <div
          v-if="branchLocateFeedback"
          class="interactive-branch-view__locate-feedback"
          :class="{ 'is-miss': !branchLocateFeedback.matched }"
          data-testid="branch-locate-feedback"
        >
          <span>{{ branchLocateFeedbackText }}</span>
          <div class="interactive-branch-view__locate-feedback-actions">
            <button
              v-if="branchLocateFeedback.matched && branchLocateFeedback.routeId"
              type="button"
              class="interactive-branch-view__locate-action"
              data-testid="branch-locate-open-route"
              @click="openBranchLocateRoute"
            >
              前往路线
            </button>
            <button
              type="button"
              class="interactive-branch-view__locate-action interactive-branch-view__locate-action--ghost"
              data-testid="branch-locate-clear"
              @click="clearBranchLocateFeedback"
            >
              清除
            </button>
          </div>
        </div>

        <div
          v-if="displayedOverview.visibleSegments.length"
          class="interactive-branch-view__overview"
          data-testid="branch-overview"
        >
          <button
            v-for="segment in displayedOverview.visibleSegments"
            :key="segment.id"
            type="button"
            class="interactive-branch-view__overview-segment"
            :class="{
              'is-active': segment.routeId === activeRouteId,
              'is-related': segment.chapterRelated,
            }"
            :data-testid="`branch-overview-${segment.routeId}`"
            @click="selectRoute(segment.routeId)"
          >
            <span class="interactive-branch-view__overview-title">{{ segment.title }}</span>
            <span class="interactive-branch-view__overview-meta">
              <span>{{ segment.nodeCount }} 节点</span>
              <span v-if="segment.choiceCount">{{ segment.choiceCount }} 选择</span>
              <span v-if="segment.endingCount">{{ segment.endingCount }} 结局</span>
              <span v-if="segment.unresolved">未回收</span>
              <span v-if="segment.hasDraft">草案</span>
              <span v-if="segment.chapterRelated">当前</span>
            </span>
          </button>
          <button
            v-if="displayedOverview.hiddenSegmentCount > 0"
            type="button"
            class="interactive-branch-view__overview-more"
            data-testid="branch-overview-more"
            @click="toggleOverviewExpansion"
          >
            其余 {{ displayedOverview.hiddenSegmentCount }} 条
          </button>
          <button
            v-else-if="expandedOverview && filteredOverviewSegments.length > OVERVIEW_WINDOW_SIZE"
            type="button"
            class="interactive-branch-view__overview-more"
            data-testid="branch-overview-less"
            @click="toggleOverviewExpansion"
          >
            收起概览
          </button>
        </div>

        <div
          v-if="viewMode === 'compact' && focusBreadcrumbNodes.length"
          class="interactive-branch-view__focus-breadcrumb"
        >
          <span class="interactive-branch-view__focus-label">路径</span>
          <button
            v-for="node in focusBreadcrumbNodes"
            :key="node.id"
            type="button"
            class="interactive-branch-view__focus-crumb"
            :class="{ 'is-active': node.id === focusAnchorNode?.id }"
            @click="selectNode(node.id)"
          >
            {{ node.title }}
          </button>
          <span v-if="focusWindowOverflowChildCount > 0" class="interactive-branch-view__focus-overflow">
            其余后续 {{ focusWindowOverflowChildCount }}
          </span>
        </div>

        <div v-if="visibleNodes.length" class="interactive-flow-lane" :class="`is-${viewMode}`">
          <article
            v-for="node in visibleNodes"
            :key="node.id"
            class="interactive-flow-card"
            :class="[
              `is-${node.nodeType}`,
              {
                'is-selected': node.id === selectedNodeId,
                'is-focused': node.id === focusNodeId,
                'is-current': node.id === currentChapterNode?.id,
              },
            ]"
            :style="{ '--branch-depth': String(node.flowDepth) }"
            @click="selectNode(node.id)"
          >
            <div class="interactive-flow-card__rail"></div>
            <div class="interactive-flow-card__body">
              <div class="interactive-flow-card__header">
                <span
                  v-if="viewMode === 'compact' && focusWindowRoleByNodeId[node.id]"
                  class="interactive-flow-card__scope"
                  :class="`is-${focusWindowRoleByNodeId[node.id]}`"
                >
                  {{ focusWindowRoleLabel(focusWindowRoleByNodeId[node.id]) }}
                </span>
                <span class="interactive-flow-card__type">{{ getNodeTypeLabel(node.nodeType) }}</span>
                <span class="interactive-flow-card__meta">{{ node.chapterLabel }}</span>
              </div>
              <strong class="interactive-flow-card__title">{{ node.title }}</strong>
              <p class="interactive-flow-card__summary">
                {{ node.description || node.routeHint || '暂无节点说明' }}
              </p>
              <div class="interactive-flow-card__chips">
                <span>{{ statusText(node.status) }}</span>
                <span v-if="node.childCount">出口 {{ node.childCount }}</span>
                <span v-if="node.parentId">承接上一节点</span>
                <span v-if="node.outlineNode.documentId">绑定章节</span>
              </div>
              <div
                v-if="node.parentTitle || node.childrenPreview.length"
                class="interactive-flow-card__relations"
              >
                <span v-if="node.parentTitle" class="interactive-flow-card__relation">
                  来自：{{ node.parentTitle }}
                </span>
                <span
                  v-if="node.childrenPreview.length"
                  class="interactive-flow-card__relation interactive-flow-card__relation--accent"
                >
                  去向：{{ node.childrenPreview.map((child) => child.title).join(' / ') }}
                </span>
              </div>
              <div
                v-if="node.childrenPreview.length"
                class="interactive-flow-card__branches"
              >
                <span class="interactive-flow-card__branch-label">后续分支</span>
                <span
                  v-for="child in node.childrenPreview"
                  :key="child.id"
                  class="interactive-flow-card__branch-chip"
                >
                  {{ child.title }}
                </span>
              </div>
            </div>
          </article>
        </div>

        <div v-else-if="!isLoading" class="interactive-branch-view__empty">
          <Empty
            description="还没有可分析的互动路线。先创建大纲或分支节点，再回来整理路径。"
            iconSize="medium"
          />
          <QyButton
            v-if="showDemoBranchEntry && !useDemoBranchData"
            variant="secondary"
            size="sm"
            @click="toggleDemoBranchData"
          >
            查看示例分支
          </QyButton>
        </div>
      </main>

      <aside class="interactive-branch-view__detail">
        <div v-if="selectedNode" class="interactive-branch-detail">
          <div class="interactive-branch-detail__header">
            <div>
              <span class="interactive-branch-detail__type">
                {{ getNodeTypeLabel(selectedNode.nodeType) }}
              </span>
              <h3 v-if="!selectedDraftNode">{{ selectedNode.title }}</h3>
              <input
                v-else
                v-model.trim="draftEditTitle"
                type="text"
                class="interactive-branch-detail__field"
                name="interactive-branch-draft-edit-title"
                aria-label="草案节点标题"
                placeholder="节点标题"
              />
            </div>
            <button type="button" class="interactive-branch-detail__link" @click="clearSelection">
              清空
            </button>
          </div>

          <p v-if="!selectedDraftNode" class="interactive-branch-detail__summary">
            {{ selectedNode.description || '暂无节点说明' }}
          </p>
          <textarea
            v-else
            v-model.trim="draftEditDescription"
            class="interactive-branch-detail__textarea"
            name="interactive-branch-draft-edit-description"
            aria-label="草案节点说明"
            rows="3"
            placeholder="节点说明（可选）"
          />

          <div class="interactive-branch-detail__meta">
            <div>
              <span>所属路线</span>
              <strong>{{ selectedNode.routeHint }}</strong>
            </div>
            <div>
              <span>绑定章节</span>
              <strong>{{ selectedNode.chapterLabel }}</strong>
            </div>
            <div>
              <span>节点状态</span>
              <strong>{{ statusText(selectedNode.status) }}</strong>
            </div>
            <div>
              <span>出口数量</span>
              <strong>{{ selectedNode.childCount }}</strong>
            </div>
          </div>

          <div v-if="selectedDraftNode" class="interactive-branch-detail__section">
            <span class="interactive-branch-detail__section-title">草案设置</span>
            <div class="interactive-branch-detail__editor-grid">
              <label class="interactive-branch-detail__editor-field">
                <span>节点类型</span>
                <select
                  v-model="draftEditType"
                  name="interactive-branch-draft-edit-type"
                  aria-label="草案节点类型"
                >
                  <option value="story">剧情</option>
                  <option value="choice">选择</option>
                  <option value="condition">条件</option>
                  <option value="merge">汇合</option>
                  <option value="ending">结局</option>
                </select>
              </label>
              <label class="interactive-branch-detail__editor-field">
                <span>挂载到</span>
                <select
                  v-model="draftEditParentId"
                  name="interactive-branch-draft-parent"
                  aria-label="草案挂载节点"
                >
                  <option
                    v-for="option in selectedDraftParentOptions"
                    :key="option.id"
                    :value="option.id"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </label>
            </div>
            <div class="interactive-branch-detail__inline-actions">
              <button
                type="button"
                class="interactive-branch-detail__action interactive-branch-detail__action--secondary"
                :disabled="!canSaveDraftEdit"
                data-testid="branch-save-draft"
                @click="saveDraftBranchNode"
              >
                保存草案
              </button>
              <button
                type="button"
                class="interactive-branch-detail__action interactive-branch-detail__action--ghost"
                data-testid="branch-delete-draft"
                @click="removeSelectedDraftBranchNode"
              >
                删除草案
              </button>
            </div>
          </div>

          <div class="interactive-branch-detail__section">
            <span class="interactive-branch-detail__section-title">提示</span>
            <p>
              {{ selectedNodeHint }}
            </p>
          </div>

          <div v-if="selectedNode.childrenPreview.length" class="interactive-branch-detail__section">
            <span class="interactive-branch-detail__section-title">后续路径</span>
            <div class="interactive-branch-detail__links">
              <button
                v-for="child in selectedNode.childrenPreview"
                :key="child.id"
                type="button"
                class="interactive-branch-detail__path"
                @click="selectNode(child.id)"
              >
                <span>{{ getNodeTypeLabel(child.nodeType) }}</span>
                <strong>{{ child.title }}</strong>
              </button>
            </div>
          </div>

          <div class="interactive-branch-detail__section">
            <span class="interactive-branch-detail__section-title">新增后续节点</span>
            <div class="interactive-branch-detail__composer">
              <input
                v-model.trim="draftNodeTitle"
                type="text"
                name="interactive-branch-draft-title"
                aria-label="后续节点标题"
                placeholder="节点标题"
              />
              <input
                v-model.trim="draftNodeDescription"
                type="text"
                name="interactive-branch-draft-description"
                aria-label="后续节点说明"
                placeholder="节点说明（可选）"
              />
              <div class="interactive-branch-detail__composer-row">
                <select
                  v-model="draftNodeType"
                  name="interactive-branch-draft-type"
                  aria-label="后续节点类型"
                >
                  <option value="story">剧情</option>
                  <option value="choice">选择</option>
                  <option value="condition">条件</option>
                  <option value="merge">汇合</option>
                  <option value="ending">结局</option>
                </select>
                <button
                  type="button"
                  class="interactive-branch-detail__action interactive-branch-detail__action--secondary"
                  :disabled="!draftNodeTitle"
                  data-testid="branch-add-draft"
                  @click="addDraftBranchNode"
                >
                  添加草案
                </button>
              </div>
            </div>
          </div>

          <div class="interactive-branch-detail__actions">
            <button
              type="button"
              class="interactive-branch-detail__action interactive-branch-detail__action--secondary"
              data-testid="branch-send-to-ai"
              @click="sendSelectedNodeToAI"
            >
              <QyIcon name="MagicStick" :size="14" />
              交给 AI
            </button>
            <button
              v-if="selectedNode.outlineNode.documentId"
              type="button"
              class="interactive-branch-detail__action"
              @click="jumpToNodeChapter(selectedNode.id)"
            >
              <QyIcon name="Right" :size="14" />
              前往正文
            </button>
          </div>
        </div>

        <div v-else class="interactive-branch-detail interactive-branch-detail--empty">
          <span class="interactive-branch-detail__type">节点检视</span>
          <h3>选择一个节点</h3>
          <p>这里会显示当前分支节点的类型、所属路线、绑定章节和后续路径。</p>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { QyButton } from '@/design-system/components'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import { Empty } from '@/design-system/base'
import type { OutlineNode } from '@/types/writer'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import ToolAssetSummaryChips from '@/modules/writer/components/workspace/tool-overlay/ToolAssetSummaryChips.vue'
import { createInteractiveBranchDemoTree } from '@/modules/writer/mock/workspaceMock'
import {
  formatActiveEntitiesPrompt,
  type ActiveEntitySummary,
} from '@/modules/writer/composables/useWorkflowContext'
import { useWriterAssetSummary } from '@/modules/writer/composables/useWriterAssetSummary'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import { locateWriterCandidate } from '@/modules/writer/utils/longformLocate'
import type {
  WriterWorkflowActionRequest,
  WriterWorkflowContext,
} from '@/modules/writer/types/workflow'

const BRANCH_DRAFT_STORAGE_KEY = 'qingyu_writer_interactive_branch_drafts_v1'

type BranchViewMode = 'compact' | 'interactive-flow'
type InteractiveRouteKind = 'all' | 'main' | 'branch' | 'ending'
type InteractiveNodeType = 'story' | 'choice' | 'condition' | 'merge' | 'ending'
type BranchRouteGroupKind =
  | 'chapter_related'
  | 'overview'
  | 'main'
  | 'choice'
  | 'branch'
  | 'ending'
  | 'unresolved'

interface OutlineBranchMeta {
  id: string
  title: string
  description: string
  parentId: string | null
  level: number
  status: string
  childIds: string[]
  pathIds: string[]
  chapterIndex: number
  outlineNode: OutlineNode
}

interface InteractiveNodeViewModel extends OutlineBranchMeta {
  nodeType: InteractiveNodeType
  routeHint: string
  childCount: number
  chapterLabel: string
  parentTitle: string
  flowDepth: number
  childrenPreview: InteractiveNodeViewModel[]
}

interface InteractiveRouteViewModel {
  id: string
  title: string
  kind: InteractiveRouteKind
  summary: string
  nodeIds: string[]
  depth: number
}

interface BranchRouteGroupViewModel {
  id: string
  title: string
  kind: BranchRouteGroupKind
  routes: InteractiveRouteViewModel[]
}

interface BranchRouteGroupDisplayViewModel extends BranchRouteGroupViewModel {
  visibleRoutes: InteractiveRouteViewModel[]
  hiddenRouteCount: number
}

interface BranchOverviewSegmentViewModel {
  id: string
  routeId: string
  title: string
  nodeCount: number
  choiceCount: number
  endingCount: number
  hasDraft: boolean
  unresolved: boolean
  chapterRelated: boolean
}

interface DisplayedBranchOverviewViewModel {
  visibleSegments: BranchOverviewSegmentViewModel[]
  hiddenSegmentCount: number
}

interface BranchLocateFeedback {
  query: string
  matched: boolean
  title?: string
  routeId?: string
  routeTitle?: string
  chapterLabel?: string
  modeLabel?: string
}

type FocusWindowRole = 'upstream' | 'focus' | 'downstream'

function getBranchDraftStorage(): Storage | null {
  return typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage
}

function cloneOutlineNode(node: OutlineNode): OutlineNode {
  return {
    ...node,
    children: Array.isArray(node.children) ? node.children.map(cloneOutlineNode) : [],
  }
}

function loadBranchDraftMap(): Record<string, OutlineNode[]> {
  try {
    const raw = getBranchDraftStorage()?.getItem(BRANCH_DRAFT_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, OutlineNode[]>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function saveBranchDraftMap(drafts: Record<string, OutlineNode[]>) {
  try {
    getBranchDraftStorage()?.setItem(BRANCH_DRAFT_STORAGE_KEY, JSON.stringify(drafts))
  } catch (error) {
    console.warn('Failed to save interactive branch drafts:', error)
  }
}

function createBranchDraftId() {
  return `interactive-branch-draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function mergeOutlineWithDrafts(baseNodes: OutlineNode[], draftNodes: OutlineNode[]): OutlineNode[] {
  const roots = baseNodes.map(cloneOutlineNode)
  const nodeMap = new Map<string, OutlineNode>()

  const indexBase = (nodes: OutlineNode[]) => {
    nodes.forEach((node) => {
      nodeMap.set(node.id, node)
      if (!Array.isArray(node.children)) {
        node.children = []
      }
      indexBase(node.children)
    })
  }

  indexBase(roots)

  const draftClones = draftNodes
    .map((node) => cloneOutlineNode(node))
    .sort((left, right) => Number(left.order || 0) - Number(right.order || 0))

  draftClones.forEach((node) => {
    node.children = []
    nodeMap.set(node.id, node)
  })

  draftClones.forEach((node) => {
    const parentId = node.parentId
    if (parentId && nodeMap.has(parentId)) {
      const parent = nodeMap.get(parentId)!
      const existingChildren = Array.isArray(parent.children) ? parent.children : []
      parent.children = [...existingChildren, node].sort(
        (left, right) => Number(left.order || 0) - Number(right.order || 0),
      )
      return
    }
    roots.push(node)
  })

  return roots.sort((left, right) => Number(left.order || 0) - Number(right.order || 0))
}

const props = withDefaults(
  defineProps<{
    projectId?: string
    chapterId?: string
    chapterTitle?: string
    chapters?: SidebarChapterSummary[]
    workflowContext?: WriterWorkflowContext
    activeEntities?: ActiveEntitySummary[]
  }>(),
  {
    projectId: '',
    chapterId: '',
    chapterTitle: '',
    chapters: () => [],
    workflowContext: undefined,
    activeEntities: () => [],
  },
)

const emit = defineEmits<{
  (e: 'trigger-ai-action', payload: WriterWorkflowActionRequest): void
  (e: 'jump-to-chapter', chapterId: string): void
}>()

const writerStore = useWriterStore()
const routeQuery = ref('')
const branchLocatorQuery = ref('')
const viewMode = ref<BranchViewMode>('compact')
const useDemoBranchData = ref(false)
const activeRouteId = ref('all')
const selectedNodeId = ref('')
const focusNodeId = ref('')
const routeGroupCollapseState = ref<Record<string, boolean>>({})
const draftNodeTitle = ref('')
const draftNodeDescription = ref('')
const draftNodeType = ref<InteractiveNodeType>('story')
const draftEditTitle = ref('')
const draftEditDescription = ref('')
const draftEditType = ref<InteractiveNodeType>('story')
const draftEditParentId = ref('')
const WINDOW_SIZE = 18
const ROUTE_GROUP_WINDOW_SIZE = 6
const ROUTE_GROUP_QUERY_WINDOW_SIZE = 12
const OVERVIEW_WINDOW_SIZE = 6
const OVERVIEW_QUERY_WINDOW_SIZE = 10
const branchLocateFeedback = ref<BranchLocateFeedback | null>(null)

const effectiveProjectId = computed(() => props.projectId || writerStore.currentProjectId || '')
const isLoading = computed(() => writerStore.outline.loading)
const branchDraftScopeKey = computed(() =>
  `${effectiveProjectId.value || 'interactive-branch'}:${useDemoBranchData.value ? 'demo' : 'project'}`,
)
const branchDraftMap = ref<Record<string, OutlineNode[]>>(loadBranchDraftMap())
const activeBranchDrafts = computed(() => branchDraftMap.value[branchDraftScopeKey.value] || [])
const expandedOverview = ref(false)
const { visibleAssetSummaryItems } = useWriterAssetSummary({
  projectId: effectiveProjectId,
  chapterId: computed(() => props.chapterId),
  chapters: computed(() => props.chapters || []),
  activeEntities: computed(() => props.activeEntities || []),
})

const realRootNodes = computed<OutlineNode[]>(() => writerStore.outline.tree || [])
const demoRootNodes = computed<OutlineNode[]>(() =>
  createInteractiveBranchDemoTree(effectiveProjectId.value || 'interactive-branch-demo'),
)
const rootNodes = computed<OutlineNode[]>(() =>
  mergeOutlineWithDrafts(
    useDemoBranchData.value ? demoRootNodes.value : realRootNodes.value,
    activeBranchDrafts.value,
  ),
)

const flattenOutlineNodes = (
  nodes: OutlineNode[],
  parentId: string | null = null,
  level = 0,
  pathIds: string[] = [],
): OutlineBranchMeta[] => {
  const result: OutlineBranchMeta[] = []
  nodes.forEach((node, index) => {
    const currentPath = [...pathIds, node.id]
    const meta: OutlineBranchMeta = {
      id: node.id,
      title: node.title || '未命名节点',
      description: node.description || '',
      parentId,
      level,
      status: node.status || 'draft',
      childIds: (node.children || []).map((child) => child.id),
      pathIds: currentPath,
      chapterIndex: index,
      outlineNode: node,
    }
    result.push(meta)
    if (node.children?.length) {
      result.push(...flattenOutlineNodes(node.children, node.id, level + 1, currentPath))
    }
  })
  return result
}

const outlineMetas = computed(() => flattenOutlineNodes(rootNodes.value))
const outlineMetaMap = computed(
  () => new Map(outlineMetas.value.map((meta) => [meta.id, meta] as const)),
)
const baseOutlineMetas = computed(() =>
  flattenOutlineNodes(useDemoBranchData.value ? demoRootNodes.value : realRootNodes.value),
)
const baseOutlineMetaMap = computed(
  () => new Map(baseOutlineMetas.value.map((meta) => [meta.id, meta] as const)),
)

const inferInteractiveNodeType = (meta: OutlineBranchMeta): InteractiveNodeType => {
  const explicitType = String(meta.outlineNode.type || '').toLowerCase()
  if (explicitType === 'choice') return 'choice'
  if (explicitType === 'condition') return 'condition'
  if (explicitType === 'merge') return 'merge'
  if (explicitType === 'ending') return 'ending'
  if (explicitType === 'story') return 'story'
  const text = `${meta.title} ${meta.description}`.toLowerCase()
  if (
    ['条件', '判定', '好感', '变量', 'flag', 'if', '达成'].some((keyword) =>
      text.includes(keyword.toLowerCase()),
    )
  ) {
    return 'condition'
  }
  if (['汇合', '合流', '回收', '收束'].some((keyword) => text.includes(keyword))) {
    return 'merge'
  }
  if (meta.childIds.length > 1) {
    return 'choice'
  }
  if (meta.childIds.length === 0) {
    return 'ending'
  }
  return 'story'
}

const collectSubtreeIds = (rootId: string): string[] => {
  const ids: string[] = []
  const walk = (nodeId: string) => {
    const meta = outlineMetaMap.value.get(nodeId)
    if (!meta) return
    ids.push(meta.id)
    meta.childIds.forEach(walk)
  }
  walk(rootId)
  return ids
}

const interactiveRoutes = computed<InteractiveRouteViewModel[]>(() => {
  const routes: InteractiveRouteViewModel[] = [
    {
      id: 'all',
      title: '全部路线',
      kind: 'all',
      summary: '适合普通小说，整体查看主线与关键分叉点。',
      nodeIds: outlineMetas.value.map((meta) => meta.id),
      depth: -1,
    },
  ]
  const usedIds = new Set<string>(['all'])

  rootNodes.value.forEach((node) => {
    if (usedIds.has(node.id)) return
    usedIds.add(node.id)
    routes.push({
      id: node.id,
      title: node.title || '未命名路线',
      kind: 'main',
      summary: '主路线入口。',
      nodeIds: collectSubtreeIds(node.id),
      depth: 0,
    })
  })

  outlineMetas.value.forEach((meta) => {
    if (inferInteractiveNodeType(meta) !== 'choice') return
    meta.childIds.forEach((childId) => {
      if (usedIds.has(childId)) return
      const child = outlineMetaMap.value.get(childId)
      if (!child) return
      usedIds.add(childId)
      routes.push({
        id: child.id,
        title: child.title,
        kind: inferInteractiveNodeType(child) === 'ending' ? 'ending' : 'branch',
        summary: `由“${meta.title}”分出的路径。`,
        nodeIds: collectSubtreeIds(child.id),
        depth: child.level,
      })
    })
  })

  return routes
})

const nodeRouteLookup = computed(() => {
  const map = new Map<string, string>()
  interactiveRoutes.value
    .filter((route) => route.id !== 'all')
    .forEach((route) => {
      route.nodeIds.forEach((nodeId) => {
        const currentRoute = interactiveRoutes.value.find((item) => item.id === map.get(nodeId))
        if (!currentRoute || currentRoute.depth <= route.depth) {
          map.set(nodeId, route.title)
        }
      })
    })
  return map
})

const interactiveNodes = computed<InteractiveNodeViewModel[]>(() =>
  outlineMetas.value.map((meta) => ({
    ...meta,
    nodeType: inferInteractiveNodeType(meta),
    routeHint: nodeRouteLookup.value.get(meta.id) || '全部路线',
    childCount: meta.childIds.length,
    chapterLabel:
      meta.outlineNode.documentId || meta.title === props.chapterTitle
        ? props.chapters?.find(
            (chapter) =>
              chapter.id === meta.outlineNode.documentId || chapter.title === meta.title,
          )?.title || meta.title
        : `第 ${meta.level + 1} 层节点`,
    parentTitle: '',
    flowDepth: 0,
    childrenPreview: [],
  })),
)

const interactiveNodeMap = computed(
  () => new Map(interactiveNodes.value.map((node) => [node.id, node] as const)),
)

const linkedInteractiveNodes = computed<InteractiveNodeViewModel[]>(() =>
  interactiveNodes.value.map((node) => ({
    ...node,
    parentTitle: node.parentId
      ? interactiveNodeMap.value.get(node.parentId)?.title || ''
      : '',
    flowDepth: Math.max(node.pathIds.length - 2, 0),
    childrenPreview: node.childIds
      .map((childId) => interactiveNodeMap.value.get(childId))
      .filter((child): child is InteractiveNodeViewModel => !!child)
      .slice(0, 4),
  })),
)

const linkedInteractiveNodeMap = computed(
  () => new Map(linkedInteractiveNodes.value.map((node) => [node.id, node] as const)),
)

const currentChapterNode = computed(() => {
  const chapterTitle = props.chapterTitle?.trim()
  const chapterId = props.chapterId?.trim()
  return (
    linkedInteractiveNodes.value.find(
      (node) =>
        (!!chapterId && node.outlineNode.documentId === chapterId) ||
        (!!chapterTitle && node.title === chapterTitle),
    ) || null
  )
})

const currentChapterPathNodeIds = computed(() => new Set(currentChapterNode.value?.pathIds || []))

const isRouteUnresolved = (route: InteractiveRouteViewModel) => {
  if (route.kind !== 'branch') return false
  return route.nodeIds.every((nodeId) => {
    const node = linkedInteractiveNodeMap.value.get(nodeId)
    return node ? !['merge', 'ending'].includes(node.nodeType) : true
  })
}

const routeGroups = computed<BranchRouteGroupViewModel[]>(() => {
  const groups: BranchRouteGroupViewModel[] = []
  const chapterRelatedRoutes = interactiveRoutes.value.filter((route) =>
    route.nodeIds.some((nodeId) => currentChapterPathNodeIds.value.has(nodeId)),
  )
  if (chapterRelatedRoutes.length) {
    groups.push({
      id: 'chapter_related',
      title: '当前章节相关',
      kind: 'chapter_related',
      routes: chapterRelatedRoutes,
    })
  }

  groups.push({
    id: 'overview',
    title: '总览',
    kind: 'overview',
    routes: interactiveRoutes.value.filter((route) => route.kind === 'all'),
  })
  groups.push({
    id: 'main',
    title: '主线',
    kind: 'main',
    routes: interactiveRoutes.value.filter((route) => route.kind === 'main'),
  })

  const choiceRoutes = interactiveRoutes.value.filter((route) => {
    const node = linkedInteractiveNodeMap.value.get(route.id)
    return node?.nodeType === 'choice'
  })
  if (choiceRoutes.length) {
    groups.push({
      id: 'choice',
      title: '关键选择',
      kind: 'choice',
      routes: choiceRoutes,
    })
  }

  const branchRoutes = interactiveRoutes.value.filter((route) => route.kind === 'branch')
  if (branchRoutes.length) {
    groups.push({
      id: 'branch',
      title: '活跃支线',
      kind: 'branch',
      routes: branchRoutes,
    })
  }

  const endingRoutes = interactiveRoutes.value.filter((route) => route.kind === 'ending')
  if (endingRoutes.length) {
    groups.push({
      id: 'ending',
      title: '结局',
      kind: 'ending',
      routes: endingRoutes,
    })
  }

  const unresolvedRoutes = branchRoutes.filter(isRouteUnresolved)
  if (unresolvedRoutes.length) {
    groups.push({
      id: 'unresolved',
      title: '未回收',
      kind: 'unresolved',
      routes: unresolvedRoutes,
    })
  }

  return groups.filter((group) => group.routes.length > 0)
})

const filteredRouteGroups = computed(() => {
  const query = routeQuery.value.trim().toLowerCase()
  if (!query) return routeGroups.value
  return routeGroups.value
    .map((group) => ({
      ...group,
      routes: group.routes.filter((route) => {
        if (route.title.toLowerCase().includes(query)) return true
        return route.summary.toLowerCase().includes(query)
      }),
    }))
    .filter((group) => group.routes.length > 0)
})

const expandedRouteGroups = ref<Record<string, boolean>>({})
const filteredRouteCount = computed(() =>
  filteredRouteGroups.value.reduce((total, group) => total + group.routes.length, 0),
)

const recentRouteIds = ref<string[]>([])

const activeRoute = computed(
  () => interactiveRoutes.value.find((route) => route.id === activeRouteId.value) || null,
)

const activeRouteNodes = computed(() => {
  const nodeIds = new Set(activeRoute.value?.nodeIds || interactiveRoutes.value[0]?.nodeIds || [])
  return linkedInteractiveNodes.value.filter((node) => nodeIds.has(node.id))
})

const overviewSegments = computed<BranchOverviewSegmentViewModel[]>(() =>
  interactiveRoutes.value
    .filter((route) => route.id !== 'all' || interactiveRoutes.value.length === 1)
    .map((route) => {
      const nodes = route.nodeIds
        .map((nodeId) => linkedInteractiveNodeMap.value.get(nodeId))
        .filter((node): node is InteractiveNodeViewModel => !!node)
      return {
        id: route.id,
        routeId: route.id,
        title: route.title,
        nodeCount: nodes.length,
        choiceCount: nodes.filter((node) => node.nodeType === 'choice').length,
        endingCount: nodes.filter((node) => node.nodeType === 'ending').length,
        hasDraft: nodes.some((node) => !baseOutlineMetaMap.value.has(node.id)),
        unresolved: isRouteUnresolved(route),
        chapterRelated: route.nodeIds.some((nodeId) => currentChapterPathNodeIds.value.has(nodeId)),
      }
    }),
)

const filteredOverviewSegments = computed<BranchOverviewSegmentViewModel[]>(() => {
  const query = routeQuery.value.trim().toLowerCase()
  if (!query) return overviewSegments.value
  return overviewSegments.value.filter((segment) => {
    if (segment.title.toLowerCase().includes(query)) return true
    const route = interactiveRoutes.value.find((item) => item.id === segment.routeId)
    return route?.summary.toLowerCase().includes(query) || false
  })
})

const displayedOverview = computed<DisplayedBranchOverviewViewModel>(() => {
  const queryActive = !!routeQuery.value.trim()
  const baseWindowSize = queryActive ? OVERVIEW_QUERY_WINDOW_SIZE : OVERVIEW_WINDOW_SIZE

  if (expandedOverview.value || filteredOverviewSegments.value.length <= baseWindowSize) {
    return {
      visibleSegments: filteredOverviewSegments.value,
      hiddenSegmentCount: 0,
    }
  }

  const visibleIds = new Set<string>()
  const fillSegment = (routeId: string | undefined | null) => {
    if (!routeId || visibleIds.size >= baseWindowSize) return
    if (!filteredOverviewSegments.value.some((segment) => segment.routeId === routeId)) return
    visibleIds.add(routeId)
  }

  fillSegment(activeRouteId.value)

  filteredOverviewSegments.value.forEach((segment) => {
    if (visibleIds.size >= baseWindowSize) return
    if (segment.chapterRelated) {
      visibleIds.add(segment.routeId)
    }
  })

  recentRouteIds.value.forEach((routeId) => fillSegment(routeId))
  filteredOverviewSegments.value.forEach((segment) => fillSegment(segment.routeId))

  const visibleSegments = filteredOverviewSegments.value.filter((segment) =>
    visibleIds.has(segment.routeId),
  )

  return {
    visibleSegments,
    hiddenSegmentCount: Math.max(filteredOverviewSegments.value.length - visibleSegments.length, 0),
  }
})

const displayedRouteGroups = computed<BranchRouteGroupDisplayViewModel[]>(() => {
  const queryActive = !!routeQuery.value.trim()
  const baseWindowSize = queryActive ? ROUTE_GROUP_QUERY_WINDOW_SIZE : ROUTE_GROUP_WINDOW_SIZE

  return filteredRouteGroups.value.map((group) => {
    if (expandedRouteGroups.value[group.id] || group.routes.length <= baseWindowSize) {
      return {
        ...group,
        visibleRoutes: group.routes,
        hiddenRouteCount: 0,
      }
    }

    const visibleIds = new Set<string>()
    const fillRoute = (routeId: string | undefined | null) => {
      if (!routeId || visibleIds.size >= baseWindowSize) return
      if (!group.routes.some((route) => route.id === routeId)) return
      visibleIds.add(routeId)
    }

    fillRoute(activeRouteId.value)

    group.routes.forEach((route) => {
      if (visibleIds.size >= baseWindowSize) return
      if (route.nodeIds.some((nodeId) => currentChapterPathNodeIds.value.has(nodeId))) {
        visibleIds.add(route.id)
      }
    })

    recentRouteIds.value.forEach((routeId) => fillRoute(routeId))
    group.routes.forEach((route) => fillRoute(route.id))

    const visibleRoutes = group.routes.filter((route) => visibleIds.has(route.id))

    return {
      ...group,
      visibleRoutes,
      hiddenRouteCount: Math.max(group.routes.length - visibleRoutes.length, 0),
    }
  })
})

const selectedNode = computed(() =>
  selectedNodeId.value ? linkedInteractiveNodeMap.value.get(selectedNodeId.value) || null : null,
)
const focusAnchorNode = computed(
  () => selectedNode.value || currentChapterNode.value || activeRouteNodes.value[0] || null,
)
const selectedDraftNode = computed(() =>
  selectedNodeId.value
    ? activeBranchDrafts.value.find((node) => node.id === selectedNodeId.value) || null
    : null,
)
const selectedDraftSubtreeIds = computed(() =>
  selectedDraftNode.value ? new Set(collectSubtreeIds(selectedDraftNode.value.id)) : new Set<string>(),
)
const selectedDraftParentOptions = computed(() => {
  if (!selectedDraftNode.value) return []
  return linkedInteractiveNodes.value
    .filter((node) => !selectedDraftSubtreeIds.value.has(node.id))
    .map((node) => ({
      id: node.id,
      label: `${node.title} · ${getNodeTypeLabel(node.nodeType)}`,
    }))
})
const canSaveDraftEdit = computed(() => {
  if (!selectedDraftNode.value) return false
  const title = draftEditTitle.value.trim()
  if (!title || !draftEditParentId.value) return false
  return (
    title !== (selectedDraftNode.value.title || '') ||
    draftEditDescription.value.trim() !== (selectedDraftNode.value.description || '') ||
    draftEditType.value !== String(selectedDraftNode.value.type || 'story') ||
    draftEditParentId.value !== String(selectedDraftNode.value.parentId || '')
  )
})

const routeStats = computed(() => ({
  routeCount: Math.max(interactiveRoutes.value.length - 1, 0),
  choiceCount: linkedInteractiveNodes.value.filter((node) => node.nodeType === 'choice').length,
  endingCount: linkedInteractiveNodes.value.filter((node) => node.nodeType === 'ending').length,
  openBranchCount: linkedInteractiveNodes.value.filter(
    (node) => node.nodeType === 'choice' && node.childCount > 0,
  ).length,
}))

const hasRealBranches = computed(
  () =>
    interactiveNodes.value.some((node) => node.nodeType === 'choice') &&
    !useDemoBranchData.value,
)
const showDemoBranchEntry = computed(() => useDemoBranchData.value || !hasRealBranches.value)

const currentRouteSummary = computed(
  () =>
    activeRoute.value?.summary ||
    (useDemoBranchData.value
      ? '当前展示只读示例分支，用来预览互动叙事的分岔与回收。'
      : '适合多结局、视觉小说与游戏叙事的路径管理。'),
)
const narrativeModeLabel = computed(() =>
  useDemoBranchData.value
    ? '示例分支'
    : viewMode.value === 'compact'
      ? '默认轻量模式'
      : '互动流模式',
)

const focusBreadcrumbNodes = computed(() => {
  const focus = focusAnchorNode.value
  if (!focus) return []
  return focus.pathIds
    .map((nodeId) => linkedInteractiveNodeMap.value.get(nodeId))
    .filter((node): node is InteractiveNodeViewModel => !!node)
})

const focusWindowNodes = computed(() => {
  const focus = focusAnchorNode.value
  if (!focus) return []

  const upstream = focus.pathIds
    .slice(0, -1)
    .map((nodeId) => linkedInteractiveNodeMap.value.get(nodeId))
    .filter((node): node is InteractiveNodeViewModel => !!node)
    .slice(-3)

  const downstream = focus.childIds
    .map((nodeId) => linkedInteractiveNodeMap.value.get(nodeId))
    .filter((node): node is InteractiveNodeViewModel => !!node)

  const primaryDownstream = downstream.slice(0, 4)
  const endings = primaryDownstream.flatMap((node) => {
    if (['merge', 'ending'].includes(node.nodeType)) {
      return []
    }
    if (node.childIds.length !== 1) return []
    const next = linkedInteractiveNodeMap.value.get(node.childIds[0])
    return next && ['merge', 'ending'].includes(next.nodeType) ? [next] : []
  })

  const nodes = [...upstream, focus, ...primaryDownstream, ...endings]
  const seen = new Set<string>()
  return nodes.filter((node) => {
    if (seen.has(node.id)) return false
    seen.add(node.id)
    return true
  })
})

const focusWindowRoleByNodeId = computed<Record<string, FocusWindowRole>>(() => {
  const focus = focusAnchorNode.value
  if (!focus) return {}
  const map: Record<string, FocusWindowRole> = {}
  focusWindowNodes.value.forEach((node) => {
    if (node.id === focus.id) {
      map[node.id] = 'focus'
      return
    }
    map[node.id] = focus.pathIds.includes(node.id) ? 'upstream' : 'downstream'
  })
  return map
})

const focusWindowOverflowChildCount = computed(() => {
  const focus = focusAnchorNode.value
  if (!focus) return 0
  return Math.max(focus.childIds.length - 4, 0)
})

const visibleNodes = computed(() => {
  const nodes = activeRouteNodes.value
  if (viewMode.value === 'interactive-flow') {
    return nodes
  }
  if (nodes.length <= WINDOW_SIZE) {
    return nodes
  }
  return focusWindowNodes.value
})

const currentWindowLabel = computed(() => {
  if (!visibleNodes.value.length) return '暂无节点'
  if (viewMode.value === 'compact' && focusAnchorNode.value) {
    return `聚焦：${focusAnchorNode.value.title}`
  }
  const first = visibleNodes.value[0]
  const last = visibleNodes.value[visibleNodes.value.length - 1]
  return `窗口：${first.title} → ${last.title}`
})

const branchLocateFeedbackText = computed(() => {
  if (!branchLocateFeedback.value) return ''
  if (!branchLocateFeedback.value.matched) {
    return `未命中：${branchLocateFeedback.value.query}`
  }
  const parts = [
    `命中：${branchLocateFeedback.value.title || branchLocateFeedback.value.query}`,
    branchLocateFeedback.value.routeTitle ? `路线 ${branchLocateFeedback.value.routeTitle}` : '',
    branchLocateFeedback.value.chapterLabel ? `落点 ${branchLocateFeedback.value.chapterLabel}` : '',
    branchLocateFeedback.value.modeLabel ? `方式 ${branchLocateFeedback.value.modeLabel}` : '',
  ].filter(Boolean)
  return parts.join(' · ')
})

const selectedNodeHint = computed(() => {
  if (!selectedNode.value) return ''
  if (selectedNode.value.nodeType === 'choice') {
    return '这是选择节点，重点检查选项是否清晰、后续分路是否有明显差异。'
  }
  if (selectedNode.value.nodeType === 'condition') {
    return '这是条件门，适合记录进入该路线需要满足的前置条件。'
  }
  if (selectedNode.value.nodeType === 'merge') {
    return '这是汇合节点，用来回收多条路线并重新并入主叙事。'
  }
  if (selectedNode.value.nodeType === 'ending') {
    return '这是结局节点，建议检查它是否有足够铺垫和清晰的进入条件。'
  }
  return '这是剧情推进节点，适合承接前序冲突并为后续分叉做准备。'
})

const outlineRows = computed(() =>
  linkedInteractiveNodes.value.map((node, index) => ({
    id: node.id,
    order: index,
    segmentId: node.routeHint,
    title: node.title,
    description: node.description,
    chapterNumber: index + 1,
    chapterTitle: node.title,
    aliases: [getNodeTypeLabel(node.nodeType), node.routeHint],
  })),
)

const getRouteKindLabel = (kind: InteractiveRouteKind) => {
  if (kind === 'all') return '总览'
  if (kind === 'main') return '主线'
  if (kind === 'ending') return '结局'
  return '分支'
}

const defaultRouteGroupCollapsed = (groupId: string) => !['chapter_related', 'main'].includes(groupId)

const isRouteGroupCollapsed = (groupId: string) => {
  const state = routeGroupCollapseState.value[groupId]
  return typeof state === 'boolean' ? state : defaultRouteGroupCollapsed(groupId)
}

function toggleRouteGroup(groupId: string) {
  routeGroupCollapseState.value = {
    ...routeGroupCollapseState.value,
    [groupId]: !isRouteGroupCollapsed(groupId),
  }
}

function toggleRouteGroupExpansion(groupId: string) {
  expandedRouteGroups.value = {
    ...expandedRouteGroups.value,
    [groupId]: !expandedRouteGroups.value[groupId],
  }
}

function toggleOverviewExpansion() {
  expandedOverview.value = !expandedOverview.value
}

function rememberRecentRoute(routeId: string) {
  if (!routeId || routeId === 'all') return
  recentRouteIds.value = [routeId, ...recentRouteIds.value.filter((item) => item !== routeId)].slice(
    0,
    8,
  )
}

const getNodeTypeLabel = (nodeType: InteractiveNodeType) => {
  if (nodeType === 'story') return '剧情'
  if (nodeType === 'choice') return '选择'
  if (nodeType === 'condition') return '条件'
  if (nodeType === 'merge') return '汇合'
  return '结局'
}

const focusWindowRoleLabel = (role: FocusWindowRole) => {
  if (role === 'upstream') return '前情'
  if (role === 'focus') return '焦点'
  return '后续'
}

function statusText(status: string): string {
  if (status === 'writing') return '写作中'
  if (status === 'reviewing') return '审核中'
  if (status === 'completed') return '已完成'
  return '草稿'
}

function toggleDemoBranchData() {
  useDemoBranchData.value = !useDemoBranchData.value
  routeQuery.value = ''
  branchLocatorQuery.value = ''
  activeRouteId.value = 'all'
  selectedNodeId.value = ''
  focusNodeId.value = ''
  expandedOverview.value = false
}

function persistBranchDrafts(nextDrafts: OutlineNode[]) {
  branchDraftMap.value = {
    ...branchDraftMap.value,
    [branchDraftScopeKey.value]: nextDrafts,
  }
  saveBranchDraftMap(branchDraftMap.value)
}

function getSiblingOrderBase(parentId: string | null | undefined) {
  if (!parentId) {
    return (useDemoBranchData.value ? demoRootNodes.value : realRootNodes.value).length
  }
  if (baseOutlineMetaMap.value.has(parentId)) {
    return baseOutlineMetaMap.value.get(parentId)?.childIds.length || 0
  }
  return 0
}

function normalizeDraftBranchNodes(drafts: OutlineNode[]) {
  const clones = drafts.map((node) => ({
    ...cloneOutlineNode(node),
    title: node.title || '未命名节点',
    description: node.description || '',
    children: [],
  }))
  const draftMap = new Map(clones.map((node) => [node.id, node] as const))
  const childGroups = new Map<string, OutlineNode[]>()

  clones.forEach((node) => {
    const key = node.parentId || '__root__'
    const group = childGroups.get(key) || []
    group.push(node)
    childGroups.set(key, group)
  })

  childGroups.forEach((group, parentKey) => {
    const sorted = group.sort((left, right) => Number(left.order || 0) - Number(right.order || 0))
    const offset = parentKey === '__root__' ? getSiblingOrderBase(null) : getSiblingOrderBase(parentKey)
    sorted.forEach((node, index) => {
      node.order = offset + index
    })
  })

  const resolveLevel = (node: OutlineNode, stack: Set<string> = new Set()): number => {
    if (stack.has(node.id)) {
      return Number(node.level || 0)
    }
    const parentId = node.parentId
    if (!parentId) return Number(node.level || 0)
    if (draftMap.has(parentId)) {
      stack.add(node.id)
      const level: number = resolveLevel(draftMap.get(parentId)!, stack) + 1
      stack.delete(node.id)
      return level
    }
    if (baseOutlineMetaMap.value.has(parentId)) {
      return baseOutlineMetaMap.value.get(parentId)!.level + 1
    }
    return Number(node.level || 0)
  }

  const now = new Date().toISOString()
  return clones.map((node) => ({
    ...node,
    level: resolveLevel(node),
    updatedAt: now,
  }))
}

function resetDraftComposer() {
  draftNodeTitle.value = ''
  draftNodeDescription.value = ''
  draftNodeType.value = 'story'
}

function syncSelectedDraftEditor() {
  const draft = selectedDraftNode.value
  if (!draft) {
    draftEditTitle.value = ''
    draftEditDescription.value = ''
    draftEditType.value = 'story'
    draftEditParentId.value = ''
    return
  }
  draftEditTitle.value = draft.title || ''
  draftEditDescription.value = draft.description || ''
  draftEditType.value = (String(draft.type || 'story') as InteractiveNodeType) || 'story'
  draftEditParentId.value = String(draft.parentId || '')
}

function addDraftBranchNode() {
  const parent = selectedNode.value
  const title = draftNodeTitle.value.trim()
  if (!parent || !title) return

  const siblings = activeBranchDrafts.value.filter((node) => node.parentId === parent.id)
  const nextOrder =
    siblings.length > 0
      ? Math.max(...siblings.map((node) => Number(node.order || 0))) + 1
      : parent.childCount

  const newNode: OutlineNode = {
    id: createBranchDraftId(),
    projectId: effectiveProjectId.value || 'interactive-branch',
    parentId: parent.id,
    title,
    description: draftNodeDescription.value.trim(),
    order: nextOrder,
    level: parent.level + 1,
    status: 'draft',
    type: draftNodeType.value,
    wordCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    children: [],
  }

  const nextDrafts = normalizeDraftBranchNodes([...activeBranchDrafts.value, newNode])
  persistBranchDrafts(nextDrafts)
  resetDraftComposer()
  selectedNodeId.value = newNode.id
  focusNodeId.value = newNode.id
}

function updateDraftBranchNode(
  nodeId: string,
  patch: Partial<Pick<OutlineNode, 'title' | 'description' | 'type' | 'parentId'>>,
) {
  const nextDrafts = activeBranchDrafts.value.map((node) =>
    node.id === nodeId
      ? {
          ...node,
          ...patch,
          title: patch.title ?? node.title,
          description: patch.description ?? node.description,
          type: patch.type ?? node.type,
          parentId: patch.parentId ?? node.parentId,
        }
      : node,
  )
  persistBranchDrafts(normalizeDraftBranchNodes(nextDrafts))
}

function saveDraftBranchNode() {
  if (!selectedDraftNode.value || !canSaveDraftEdit.value) return
  updateDraftBranchNode(selectedDraftNode.value.id, {
    title: draftEditTitle.value.trim(),
    description: draftEditDescription.value.trim(),
    type: draftEditType.value,
    parentId: draftEditParentId.value,
  })
}

function removeDraftBranchNode(nodeId: string) {
  const subtreeIds = new Set(collectSubtreeIds(nodeId))
  const nextDrafts = activeBranchDrafts.value.filter((node) => !subtreeIds.has(node.id))
  persistBranchDrafts(normalizeDraftBranchNodes(nextDrafts))
}

function removeSelectedDraftBranchNode() {
  if (!selectedDraftNode.value) return
  const parentId = selectedDraftNode.value.parentId || ''
  removeDraftBranchNode(selectedDraftNode.value.id)
  selectedNodeId.value = parentId
  focusNodeId.value = parentId
}

function selectRoute(routeId: string) {
  activeRouteId.value = routeId
  rememberRecentRoute(routeId)
  const fallbackNode =
    activeRouteNodes.value.find((node) => node.id === currentChapterNode.value?.id) ||
    activeRouteNodes.value[0]
  if (fallbackNode) {
    focusNodeId.value = fallbackNode.id
    selectedNodeId.value = fallbackNode.id
    writerStore.setCurrentOutlineNode(fallbackNode.outlineNode)
  }
}

function selectNode(nodeId: string) {
  selectedNodeId.value = nodeId
  focusNodeId.value = nodeId
  const node = linkedInteractiveNodeMap.value.get(nodeId)
  if (node) {
    rememberRecentRoute(findBestRouteForNode(node.id))
    writerStore.setCurrentOutlineNode(node.outlineNode)
  }
}

function clearSelection() {
  selectedNodeId.value = ''
}

function clearBranchLocateFeedback() {
  branchLocateFeedback.value = null
}

function openBranchLocateRoute() {
  const routeId = branchLocateFeedback.value?.routeId
  if (!routeId) return
  selectRoute(routeId)
}

function findBestRouteForNode(nodeId: string): string {
  const matched = interactiveRoutes.value
    .filter((route) => route.id !== 'all' && route.nodeIds.includes(nodeId))
    .sort((a, b) => b.depth - a.depth)
  return matched[0]?.id || 'all'
}

function handleBranchLocate() {
  const located = locateWriterCandidate(
    outlineRows.value,
    branchLocatorQuery.value,
    () => outlineRows.value,
    {
      beforeCount: 0,
      afterCount: WINDOW_SIZE - 1,
      initialCount: WINDOW_SIZE,
    },
  )
  if (!located) {
    branchLocateFeedback.value = {
      query: branchLocatorQuery.value.trim(),
      matched: false,
    }
    return
  }
  const matchedNode = linkedInteractiveNodeMap.value.get(located.candidate.id)
  if (!matchedNode) {
    branchLocateFeedback.value = {
      query: branchLocatorQuery.value.trim(),
      matched: false,
    }
    return
  }
  const matchedRouteId = findBestRouteForNode(matchedNode.id)
  activeRouteId.value = matchedRouteId
  selectedNodeId.value = matchedNode.id
  focusNodeId.value = matchedNode.id
  branchLocateFeedback.value = {
    query: branchLocatorQuery.value.trim(),
    matched: true,
    title: matchedNode.title,
    routeId: matchedRouteId,
    routeTitle: matchedNode.routeHint,
    chapterLabel: matchedNode.chapterLabel,
    modeLabel:
      located.request.mode === 'chapter-number'
        ? '章节号'
        : located.request.mode === 'node-id'
          ? '节点标识'
          : located.request.mode === 'asset-name'
            ? '@资产'
            : '标题关键词',
  }
  writerStore.setCurrentOutlineNode(matchedNode.outlineNode)
}

function buildSelectedNodeAIContextText(node: InteractiveNodeViewModel): string {
  const lines = [
    `互动分支节点：${node.title}`,
    props.chapterTitle ? `当前章节：${props.chapterTitle}` : '',
    props.workflowContext?.scopeLabel ? `场景作用域：${props.workflowContext.scopeLabel}` : '',
    formatActiveEntitiesPrompt(props.activeEntities),
    `节点类型：${getNodeTypeLabel(node.nodeType)}`,
    `所属路线：${node.routeHint}`,
    `节点状态：${statusText(node.status)}`,
    node.description ? `节点描述：${node.description}` : '',
    `后续出口：${node.childCount}`,
  ].filter(Boolean)

  return lines.join('\n')
}

function sendSelectedNodeToAI() {
  const node = selectedNode.value
  if (!node) return

  emit('trigger-ai-action', {
    source: 'workspace',
    action: 'add_to_chat',
    title: `互动分支分析：${node.title}`,
    text: buildSelectedNodeAIContextText(node),
    instructions:
      '请分析这个互动分支节点的选择动机、条件约束、后续路线差异，以及是否需要补强铺垫或回收。',
  })
}

function jumpToNodeChapter(nodeId: string) {
  const node = linkedInteractiveNodeMap.value.get(nodeId)
  const documentId = node?.outlineNode.documentId?.trim()
  if (!documentId) return
  emit('jump-to-chapter', documentId)
}

async function refreshOutline() {
  if (!effectiveProjectId.value) return
  await writerStore.loadOutlineTree(effectiveProjectId.value)
}

watch(
  () => effectiveProjectId.value,
  async (projectId) => {
    if (!projectId) return
    await refreshOutline()
  },
  { immediate: true },
)

watch(
  () => [interactiveRoutes.value.map((route) => route.id).join('|'), currentChapterNode.value?.id] as const,
  () => {
    if (interactiveRoutes.value.some((route) => route.id === activeRouteId.value)) {
      return
    }
    activeRouteId.value = currentChapterNode.value?.id
      ? findBestRouteForNode(currentChapterNode.value.id)
      : 'all'
  },
  { immediate: true },
)

watch(
  () => [activeRouteId.value, currentChapterNode.value?.id] as const,
  () => {
    const routeNode = activeRouteNodes.value.find((node) => node.id === currentChapterNode.value?.id)
    const fallbackNode = routeNode || activeRouteNodes.value[0] || null
    if (fallbackNode && !selectedNodeId.value) {
      selectedNodeId.value = fallbackNode.id
      focusNodeId.value = fallbackNode.id
    }
  },
  { immediate: true },
)

watch(
  () =>
    [
      selectedNodeId.value,
      branchDraftScopeKey.value,
      selectedDraftNode.value?.updatedAt || '',
      selectedDraftNode.value?.parentId || '',
      selectedDraftNode.value?.title || '',
      selectedDraftNode.value?.description || '',
      String(selectedDraftNode.value?.type || ''),
    ] as const,
  () => {
    syncSelectedDraftEditor()
  },
  { immediate: true },
)

watch(branchDraftScopeKey, () => {
  branchDraftMap.value = loadBranchDraftMap()
  resetDraftComposer()
  syncSelectedDraftEditor()
})
</script>

<style scoped lang="scss">
.interactive-branch-view {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--editor-bg-surface, #f8fafc);
}

.interactive-branch-view__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--editor-border, #d7dff0);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 96%, transparent);
}

.interactive-branch-view__header-main {
  min-width: 0;
  display: flex;
  align-items: center;
}

.interactive-branch-view__title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;

  h2 {
    margin: 0;
    color: var(--editor-text-primary, #0f172a);
    font-size: 20px;
    font-weight: 800;
  }
}

.interactive-branch-view__header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.interactive-branch-view__mode-switch {
  display: inline-flex;
  padding: 3px;
  border-radius: 999px;
  border: 1px solid var(--editor-border, #d7dff0);
  background: color-mix(in srgb, var(--editor-layer-soft, #eef4ff) 64%, transparent);

  button {
    height: 30px;
    padding: 0 11px;
    border: none;
    border-radius: 999px;
    background: transparent;
    color: var(--editor-text-muted, #64748b);
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;

    &.is-active {
      background: var(--editor-layer-panel, #ffffff);
      color: var(--editor-text-primary, #0f172a);
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
    }
  }
}

.interactive-branch-view__stats {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 20px 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--editor-border, #d7dff0) 72%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 76%, transparent);
}

.interactive-branch-stat,
.interactive-branch-view__stats-summary {
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #d7dff0) 84%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 88%, transparent);
}

.interactive-branch-stat {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  span {
    color: var(--editor-text-muted, #64748b);
    font-size: 12px;
  }

  strong {
    color: var(--editor-text-primary, #0f172a);
    font-size: 12px;
    font-weight: 800;
  }
}

.interactive-branch-view__stats-summary {
  display: inline-flex;
  align-items: center;
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
}

.interactive-branch-view__body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr) 292px;
  gap: 0;
}

.interactive-branch-view__routes,
.interactive-branch-view__flow,
.interactive-branch-view__detail {
  min-width: 0;
  min-height: 0;
}

.interactive-branch-view__routes,
.interactive-branch-view__detail {
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 94%, transparent);
}

.interactive-branch-view__routes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border-right: 1px solid var(--editor-border, #d7dff0);
}

.interactive-branch-view__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  span {
    color: var(--editor-text-ghost, #94a3b8);
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  strong {
    color: var(--editor-text-primary, #0f172a);
    font-size: 12px;
  }
}

.interactive-branch-view__search,
.interactive-branch-view__locator label {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #d7dff0) 88%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 84%, transparent);
  color: var(--editor-text-muted, #64748b);

  input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: var(--editor-text-primary, #0f172a);
    font-size: 12px;
  }
}

.interactive-branch-view__route-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: grid;
  gap: 6px;
}

.interactive-route-group {
  display: grid;
  gap: 6px;
}

.interactive-route-group__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #d7dff0) 88%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 42%, transparent);
  color: var(--editor-text-primary, #0f172a);
  cursor: pointer;
}

.interactive-route-group__title {
  font-size: 12px;
  font-weight: 800;
}

.interactive-route-group__meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--editor-text-muted, #64748b);
  font-size: 11px;
  font-weight: 700;
}

.interactive-route-group__body {
  display: grid;
  gap: 6px;
  padding-left: 8px;
}

.interactive-route-group__more {
  min-height: 32px;
  padding: 0 11px;
  border: 1px dashed color-mix(in srgb, var(--editor-border, #d7dff0) 82%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 52%, transparent);
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.interactive-route-card {
  padding: 10px 11px;
  border-radius: 12px;
  border: 1px solid transparent;
  border-left-color: color-mix(in srgb, var(--editor-border, #d7dff0) 92%, transparent);
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 140ms ease,
    background-color 140ms ease;

  &:hover {
    border-left-color: color-mix(in srgb, var(--editor-accent, #2563eb) 32%, transparent);
    background: color-mix(in srgb, var(--editor-accent-soft, #eef4ff) 18%, transparent);
  }

  &.is-active {
    border-color: color-mix(in srgb, var(--editor-accent, #2563eb) 18%, transparent);
    border-left-color: color-mix(in srgb, var(--editor-accent, #2563eb) 44%, transparent);
    background: color-mix(in srgb, var(--editor-accent-soft, #eef4ff) 36%, transparent);
  }
}

.interactive-route-card__header,
.interactive-flow-card__header,
.interactive-flow-card__chips,
.interactive-branch-view__route-summary,
.interactive-branch-view__locator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.interactive-route-card__header {
  justify-content: space-between;
  margin-bottom: 6px;
}

.interactive-route-card__kind,
.interactive-flow-card__type {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}

.interactive-route-card__kind.is-main,
.interactive-flow-card.is-story .interactive-flow-card__type {
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}

.interactive-route-card__kind.is-branch,
.interactive-flow-card.is-choice .interactive-flow-card__type {
  background: rgba(168, 85, 247, 0.12);
  color: #7c3aed;
}

.interactive-route-card__kind.is-ending,
.interactive-flow-card.is-ending .interactive-flow-card__type {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}

.interactive-route-card__kind.is-all,
.interactive-flow-card.is-merge .interactive-flow-card__type,
.interactive-flow-card.is-condition .interactive-flow-card__type {
  background: rgba(15, 23, 42, 0.08);
  color: #334155;
}

.interactive-route-card__count,
.interactive-route-card__summary,
.interactive-flow-card__meta,
.interactive-flow-card__summary,
.interactive-flow-card__chips span,
.interactive-branch-view__overview-meta,
.interactive-branch-view__route-summary span,
.interactive-branch-detail__summary,
.interactive-branch-detail__section p {
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
}

.interactive-route-card__title,
.interactive-flow-card__title,
.interactive-branch-detail h3 {
  color: var(--editor-text-primary, #0f172a);
  font-weight: 800;
}

.interactive-route-card__title {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
}

.interactive-branch-view__flow {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  overflow: hidden;
}

.interactive-branch-view__flow-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.interactive-branch-view__locator {
  justify-content: flex-end;

  label {
    min-width: 260px;
  }

  button {
    height: 34px;
    padding: 0 12px;
    border: 1px solid var(--editor-border, #d7dff0);
    border-radius: 999px;
    background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 90%, transparent);
    color: var(--editor-text-primary, #0f172a);
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
  }
}

.interactive-branch-view__route-summary {
  flex-wrap: wrap;
  padding: 0 2px 2px;
}

.interactive-branch-view__locate-feedback {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 32px;
  padding: 7px 11px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--editor-accent, #2563eb) 18%, transparent);
  background: color-mix(in srgb, var(--editor-accent-soft, #eef4ff) 24%, transparent);
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  line-height: 1.5;

  &.is-miss {
    border-color: color-mix(in srgb, var(--editor-danger, #dc2626) 18%, transparent);
    background: color-mix(in srgb, var(--editor-danger-soft, #fee2e2) 30%, transparent);
  }
}

.interactive-branch-view__locate-feedback-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.interactive-branch-view__locate-action {
  min-height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--editor-accent, #2563eb) 18%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 72%, transparent);
  color: var(--editor-text-primary, #0f172a);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.interactive-branch-view__locate-action--ghost {
  border-color: color-mix(in srgb, var(--editor-border, #d7dff0) 82%, transparent);
  color: var(--editor-text-muted, #64748b);
}

.interactive-branch-view__overview {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 2px 4px;
  scrollbar-width: thin;
}

.interactive-branch-view__overview-more,
.interactive-branch-view__overview-segment {
  flex: 0 0 auto;
}

.interactive-branch-view__overview-more {
  min-height: 56px;
  padding: 0 12px;
  border: 1px dashed color-mix(in srgb, var(--editor-border, #d7dff0) 82%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 52%, transparent);
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.interactive-branch-view__overview-segment {
  display: grid;
  gap: 4px;
  min-width: 148px;
  padding: 9px 11px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #d7dff0) 84%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 86%, transparent);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 140ms ease,
    background-color 140ms ease;

  &:hover {
    border-color: color-mix(in srgb, var(--editor-accent, #2563eb) 24%, transparent);
    background: color-mix(in srgb, var(--editor-accent-soft, #eef4ff) 18%, transparent);
  }

  &.is-active {
    border-color: color-mix(in srgb, var(--editor-accent, #2563eb) 34%, transparent);
    background: color-mix(in srgb, var(--editor-accent-soft, #eef4ff) 28%, transparent);
  }

  &.is-related:not(.is-active) {
    border-color: color-mix(in srgb, var(--editor-accent, #2563eb) 16%, transparent);
  }
}

.interactive-branch-view__overview-title {
  color: var(--editor-text-primary, #0f172a);
  font-size: 13px;
  font-weight: 800;
}

.interactive-branch-view__overview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 8px;
  line-height: 1.4;
}

.interactive-branch-view__route-label {
  color: var(--editor-text-primary, #0f172a) !important;
  font-weight: 800;
}

.interactive-branch-view__focus-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--editor-layer-soft, #eef4ff) 52%, transparent);
}

.interactive-branch-view__focus-label,
.interactive-branch-view__focus-overflow {
  color: var(--editor-text-muted, #64748b);
  font-size: 11px;
  font-weight: 700;
}

.interactive-branch-view__focus-crumb {
  height: 28px;
  padding: 0 10px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #d7dff0) 84%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 88%, transparent);
  color: var(--editor-text-primary, #0f172a);
  font-size: 12px;
  cursor: pointer;

  &.is-active {
    border-color: color-mix(in srgb, var(--editor-accent, #2563eb) 26%, transparent);
    background: color-mix(in srgb, var(--editor-accent-soft, #eef4ff) 42%, transparent);
  }
}

.interactive-flow-lane {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: grid;
  gap: 8px;
  padding-right: 4px;
}

.interactive-flow-lane.is-compact {
  grid-auto-rows: min-content;
}

.interactive-flow-card {
  position: relative;
  display: flex;
  gap: 10px;
  margin-left: calc(var(--branch-depth, 0) * 18px);
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #d7dff0) 82%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 82%, transparent);
  cursor: pointer;
  transition:
    border-color 140ms ease,
    background-color 140ms ease;

  &:hover {
    border-color: color-mix(in srgb, var(--editor-accent, #2563eb) 22%, transparent);
    background: color-mix(in srgb, var(--editor-accent-soft, #eef4ff) 18%, transparent);
  }

  &.is-selected {
    border-color: color-mix(in srgb, var(--editor-accent, #2563eb) 34%, transparent);
    background: color-mix(in srgb, var(--editor-accent-soft, #eef4ff) 26%, transparent);
  }

  &.is-focused {
    background: color-mix(in srgb, var(--editor-accent-soft, #eef4ff) 34%, transparent);
  }

  &.is-current {
    outline: 1px solid color-mix(in srgb, var(--editor-accent, #2563eb) 28%, transparent);
    outline-offset: -1px;
  }

  &::before {
    content: '';
    position: absolute;
    left: -12px;
    top: 18px;
    width: 10px;
    height: 1px;
    background: color-mix(in srgb, var(--editor-border, #d7dff0) 78%, transparent);
    opacity: min(calc(var(--branch-depth, 0)), 1);
  }
}

.interactive-flow-card__rail {
  width: 3px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--editor-accent, #2563eb) 34%, transparent);
}

.interactive-flow-card.is-choice .interactive-flow-card__rail {
  background: rgba(168, 85, 247, 0.46);
}

.interactive-flow-card.is-ending .interactive-flow-card__rail {
  background: rgba(239, 68, 68, 0.46);
}

.interactive-flow-card.is-condition .interactive-flow-card__rail {
  background: rgba(245, 158, 11, 0.46);
}

.interactive-flow-card.is-merge .interactive-flow-card__rail {
  background: rgba(14, 165, 233, 0.46);
}

.interactive-flow-card__body {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 6px;
}

.interactive-flow-card__header {
  justify-content: space-between;
  flex-wrap: wrap;
}

.interactive-flow-card__scope {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  background: color-mix(in srgb, var(--editor-layer-soft, #eef4ff) 88%, transparent);
  color: var(--editor-text-muted, #64748b);
}

.interactive-flow-card__scope.is-focus {
  background: color-mix(in srgb, var(--editor-accent-soft, #eef4ff) 72%, transparent);
  color: color-mix(in srgb, var(--editor-accent, #2563eb) 82%, var(--editor-text-primary, #0f172a));
}

.interactive-flow-card__title {
  font-size: 14px;
}

.interactive-flow-card__summary {
  margin: 0;
  line-height: 1.65;
}

.interactive-flow-card__chips {
  flex-wrap: wrap;
}

.interactive-flow-card__relations {
  display: grid;
  gap: 4px;
}

.interactive-flow-card__relation {
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  line-height: 1.55;
}

.interactive-flow-card__relation--accent {
  color: color-mix(in srgb, var(--editor-accent, #2563eb) 72%, var(--editor-text-muted, #64748b));
}

.interactive-flow-card__chips span,
.interactive-flow-card__branch-chip,
.interactive-branch-detail__path span {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--editor-layer-soft, #eef4ff) 72%, transparent);
}

.interactive-flow-card__branches,
.interactive-branch-detail__links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.interactive-flow-card__branch-label {
  color: var(--editor-text-ghost, #94a3b8);
  font-size: 11px;
  font-weight: 700;
}

.interactive-branch-view__detail {
  padding: 14px;
  border-left: 1px solid var(--editor-border, #d7dff0);
}

.interactive-branch-detail {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0;
  background: transparent;
  border: none;
}

.interactive-branch-detail--empty {
  justify-content: center;
}

.interactive-branch-detail__header,
.interactive-branch-detail__meta,
.interactive-branch-detail__actions {
  display: flex;
  gap: 10px;
}

.interactive-branch-detail__header {
  align-items: flex-start;
  justify-content: space-between;
}

.interactive-branch-detail__type {
  color: var(--editor-text-ghost, #94a3b8);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.interactive-branch-detail h3 {
  margin: 4px 0 0;
  font-size: 18px;
}

.interactive-branch-detail__field,
.interactive-branch-detail__textarea,
.interactive-branch-detail__editor-field select {
  border: 1px solid color-mix(in srgb, var(--editor-border, #d7dff0) 82%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 88%, transparent);
  color: var(--editor-text-primary, #0f172a);
}

.interactive-branch-detail__field {
  width: 100%;
  min-height: 38px;
  margin-top: 6px;
  padding: 0 12px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
}

.interactive-branch-detail__textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  resize: vertical;
  line-height: 1.6;
  font-size: 13px;
}

.interactive-branch-detail__link {
  border: none;
  background: transparent;
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.interactive-branch-detail__summary,
.interactive-branch-detail__section p {
  margin: 0;
  line-height: 1.7;
}

.interactive-branch-detail__meta {
  flex-wrap: wrap;

  div {
    flex: 1 1 120px;
    display: grid;
    gap: 4px;
    padding: 9px 10px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--editor-layer-soft, #eef4ff) 58%, transparent);
  }

  span {
    color: var(--editor-text-ghost, #94a3b8);
    font-size: 11px;
    font-weight: 700;
  }

  strong {
    color: var(--editor-text-primary, #0f172a);
    font-size: 13px;
  }
}

.interactive-branch-detail__section {
  display: grid;
  gap: 8px;
}

.interactive-branch-detail__editor-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.interactive-branch-detail__editor-field {
  display: grid;
  gap: 6px;

  span {
    color: var(--editor-text-ghost, #94a3b8);
    font-size: 11px;
    font-weight: 700;
  }

  select {
    min-height: 34px;
    padding: 0 10px;
    border-radius: 10px;
    font-size: 12px;
  }
}

.interactive-branch-detail__composer {
  display: grid;
  gap: 8px;

  input,
  select {
    min-height: 34px;
    padding: 0 10px;
    border-radius: 10px;
    border: 1px solid color-mix(in srgb, var(--editor-border, #d7dff0) 82%, transparent);
    background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 88%, transparent);
    color: var(--editor-text-primary, #0f172a);
    font-size: 12px;
  }
}

.interactive-branch-detail__composer-row {
  display: grid;
  grid-template-columns: minmax(0, 112px) minmax(0, 1fr);
  gap: 8px;
}

.interactive-branch-detail__section-title {
  color: var(--editor-text-ghost, #94a3b8);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.interactive-branch-detail__path {
  display: grid;
  gap: 4px;
  padding: 9px 10px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #d7dff0) 82%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 84%, transparent);
  text-align: left;
  cursor: pointer;

  strong {
    color: var(--editor-text-primary, #0f172a);
    font-size: 13px;
  }
}

.interactive-branch-detail__actions {
  margin-top: auto;
  flex-wrap: wrap;
}

.interactive-branch-detail__inline-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.interactive-branch-detail__action {
  flex: 1 1 132px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 38px;
  border: 1px solid color-mix(in srgb, var(--editor-accent, #2563eb) 22%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--editor-accent-soft, #eef4ff) 26%, transparent);
  color: var(--editor-text-primary, #0f172a);
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.interactive-branch-detail__action--secondary {
  border-color: var(--editor-border, #d7dff0);
  background: var(--editor-layer-panel, #ffffff);
}

.interactive-branch-detail__action--ghost {
  border-color: color-mix(in srgb, var(--editor-danger, #dc2626) 20%, transparent);
  background: color-mix(in srgb, var(--editor-danger-soft, #fee2e2) 38%, transparent);
  color: color-mix(in srgb, var(--editor-danger, #dc2626) 78%, var(--editor-text-primary, #0f172a));
}

.interactive-branch-view__empty {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

@media (max-width: 1200px) {
  .interactive-branch-view__body {
    grid-template-columns: 228px minmax(0, 1fr);
  }

  .interactive-branch-view__detail {
    grid-column: 1 / -1;
    border-left: none;
    border-top: 1px solid var(--editor-border, #d7dff0);
  }
}

@media (max-width: 900px) {
  .interactive-branch-view__header,
  .interactive-branch-view__flow-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .interactive-branch-view__header-actions,
  .interactive-branch-view__title-row {
    justify-content: space-between;
  }

  .interactive-branch-view__body {
    grid-template-columns: 1fr;
  }

  .interactive-branch-view__routes {
    border-right: none;
    border-bottom: 1px solid var(--editor-border, #d7dff0);
  }
}
</style>
