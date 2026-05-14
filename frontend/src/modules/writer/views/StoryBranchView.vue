<template>
  <section class="story-branch-view">
    <header class="story-branch-view__header">
      <ToolAssetSummaryChips :items="visibleAssetSummaryItems" />
      <div class="story-branch-view__header-actions">
        <div v-if="activeBranchId" class="branch-breadcrumb">
          <span class="branch-breadcrumb__label">当前分支：</span>
          <span class="branch-breadcrumb__name">{{ activeBranchTitle }}</span>
          <button type="button" class="branch-breadcrumb__back" @click="exitBranch">
            <QyIcon name="Close" :size="12" />
            返回全部
          </button>
        </div>
        <QyButton variant="secondary" size="sm" @click="refreshOutline" :loading="isLoading">
          <QyIcon name="Refresh" :size="14" />
          刷新
        </QyButton>
      </div>
    </header>

    <div class="story-branch-view__stats">
      <SystemStatCard label="节点总数" :value="flatNodes.length" hint="大纲树" tone="info" />
      <SystemStatCard label="分支点" :value="branchPointCount" hint="多子节点" tone="warning" />
      <SystemStatCard label="结局数" :value="endingCount" hint="叶子节点" tone="success" />
    </div>

    <section class="story-branch-view__navigator">
      <div class="story-branch-view__segment-map">
        <button
          v-for="segment in branchSegments"
          :key="segment.id"
          type="button"
          class="story-branch-view__segment"
          :class="{ 'is-active': segment.id === activeBranchSegmentId }"
          @click="activateBranchSegment(segment.id)"
        >
          <strong>{{ segment.title }}</strong>
          <span>{{ segment.total }} 节点</span>
        </button>
      </div>
      <div class="story-branch-view__locator">
        <label>
          <QyIcon name="Search" :size="14" />
          <input
            v-model.trim="branchLocatorQuery"
            type="text"
            placeholder="定位章节号、节点标题或分支关键词"
            @keyup.enter="handleBranchLocate"
          />
        </label>
        <button type="button" @click="handleBranchLocate">定位</button>
        <span>{{ activeBranchSegment?.title || '无可用区段' }}</span>
      </div>
    </section>

    <div class="story-branch-view__canvas-area">
      <!-- 画布 -->
      <CanvasCore
        ref="canvasCoreRef"
        class="story-branch-canvas"
        :show-grid="true"
        :grid-size="24"
        :initial-zoom="0.85"
        @canvas-click="handleCanvasClick"
      >
        <!-- SVG 连线 -->
        <template #connections>
          <g v-for="edge in edges" :key="edge.id">
            <path
              :d="edge.path"
              class="org-edge"
              :class="{ 'org-edge--active': isEdgeActive(edge) }"
              fill="none"
              stroke-width="2"
            />
          </g>
        </template>

        <!-- 节点卡片 -->
        <template #default>
          <div
            v-for="node in flatNodes"
            :key="node.id"
            class="org-node"
            :class="[
              `org-node--${node.category}`,
              {
                'org-node--selected': selectedNodeId === node.id,
                'org-node--active-branch': activeBranchId === node.id,
                'org-node--dimmed': isDimmed(node),
              },
            ]"
            :style="nodeStyle(node)"
            @click.stop="selectNode(node)"
            @dblclick.stop="enterBranch(node)"
          >
            <div class="org-node__icon" :style="{ background: getCategoryColor(node.category) }">
              <QyIcon :name="getCategoryIcon(node.category)" :size="14" color="#fff" />
            </div>
            <div class="org-node__body">
              <span class="org-node__title">{{ node.title }}</span>
              <span class="org-node__badge" :style="badgeStyle(node.category)">
                {{ getCategoryLabel(node.category) }}
              </span>
            </div>
            <div class="org-node__status">
              <span class="org-node__status-dot" :class="`status-${node.status}`" />
            </div>
          </div>
        </template>

        <!-- 工具栏 -->
        <template #toolbar>
          <div class="story-branch-view__toolbar-actions">
            <button
              type="button"
              class="toolbar-btn"
              title="自动适配"
              @click.stop="handleZoomToFit"
            >
              <QyIcon name="FullScreen" :size="14" />
            </button>
          </div>
        </template>
      </CanvasCore>

      <!-- 无数据提示 -->
      <div v-if="!flatNodes.length && !isLoading" class="story-branch-view__empty">
        <Empty description="暂无大纲节点，请先创建大纲后再查看分支结构" iconSize="medium" />
      </div>
    </div>

    <!-- 右侧详情面板 -->
    <aside v-if="selectedOrgNode" class="story-branch-detail">
      <div class="story-branch-detail__header">
        <div
          class="story-branch-detail__type"
          :style="{ color: getCategoryColor(selectedOrgNode.category) }"
        >
          <QyIcon :name="getCategoryIcon(selectedOrgNode.category)" :size="16" />
          {{ getCategoryLabel(selectedOrgNode.category) }}
        </div>
        <button type="button" class="detail-close" @click="clearSelection">
          <QyIcon name="Close" :size="14" />
        </button>
      </div>

      <h3 class="story-branch-detail__title">{{ selectedOrgNode.title }}</h3>
      <p class="story-branch-detail__desc">
        {{ selectedOrgNode.outlineNode.description || '暂无描述' }}
      </p>

      <div class="story-branch-detail__meta">
        <div class="meta-item">
          <span class="meta-label">层级</span>
          <span class="meta-value">L{{ selectedOrgNode.level }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">字数</span>
          <span class="meta-value">{{ selectedOrgNode.outlineNode.wordCount ?? 0 }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">状态</span>
          <span class="meta-value">{{ statusText(selectedOrgNode.status) }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">子节点</span>
          <span class="meta-value">{{ selectedOrgNode.children.length }}</span>
        </div>
      </div>

      <!-- 子分支列表 -->
      <div v-if="selectedOrgNode.children.length" class="story-branch-detail__children">
        <div class="detail-section-title">子分支</div>
        <button
          v-for="child in selectedOrgNode.children"
          :key="child.id"
          type="button"
          class="child-item"
          :class="{ 'child-item--active': selectedNodeId === child.id }"
          @click="selectNode(child)"
        >
          <span class="child-item__dot" :style="{ background: getCategoryColor(child.category) }" />
          <span class="child-item__name">{{ child.title }}</span>
          <span class="child-item__badge">{{ getCategoryLabel(child.category) }}</span>
        </button>
      </div>

      <!-- 进入分支按钮 -->
      <div class="story-branch-detail__actions">
        <button
          type="button"
          class="enter-branch-btn enter-branch-btn--secondary"
          data-testid="branch-send-to-ai"
          @click="sendSelectedNodeToAI"
        >
          <QyIcon name="MagicStick" :size="14" />
          交给 AI
        </button>
        <button
          v-if="selectedOrgNode.children.length > 0 && activeBranchId !== selectedOrgNode.id"
          type="button"
          class="enter-branch-btn"
          @click="enterBranch(selectedOrgNode)"
        >
          <QyIcon name="Right" :size="14" />
          进入此分支
        </button>
      </div>
    </aside>
  </section>
</template>

<script setup lang="ts">
/**
 * StoryBranchView - 故事分支组织结构图
 *
 * 以组织结构图（Org Chart）形式可视化展示故事分支结构，
 * 支持多结局剧本写作和分支叙事管理。
 *
 * @features
 * - 组织结构图样式展示大纲树
 * - 不同节点类型（主线/章节/支线/结局/分支点）不同颜色/图标
 * - 点击选择节点，双击进入分支
 * - 分支切换后只显示该分支的大纲子树
 * - 普通小说模式（无分支时线性显示）
 * - 画布平移/缩放
 */

import { computed, ref, watch } from 'vue'
import { QyButton } from '@/design-system/components'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import { Empty } from '@/design-system/base'
import type { OutlineNode } from '@/types/writer'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import { CanvasCore } from '@/modules/writer/components/canvas'
import ToolAssetSummaryChips from '@/modules/writer/components/workspace/tool-overlay/ToolAssetSummaryChips.vue'
import {
  formatActiveEntitiesPrompt,
  type ActiveEntitySummary,
} from '@/modules/writer/composables/useWorkflowContext'
import { useWriterAssetSummary } from '@/modules/writer/composables/useWriterAssetSummary'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import SystemStatCard from '@/modules/writer/components/system-design/SystemStatCard.vue'
import type {
  WriterWorkflowActionRequest,
  WriterWorkflowContext,
} from '@/modules/writer/types/workflow'
import {
  useOrgTreeLayout,
  getCategoryColor,
  getCategoryBgColor,
  getCategoryLabel,
  getCategoryIcon,
  type OrgTreeNode,
  type OrgTreeEdge,
} from '@/modules/writer/composables/useOrgTreeLayout'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

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
}>()

// ---------------------------------------------------------------------------
// Store & State
// ---------------------------------------------------------------------------

const writerStore = useWriterStore()
const selectedNodeId = ref('')
const activeBranchId = ref('')
const activeBranchSegmentId = ref('')
const branchLocatorQuery = ref('')
const canvasCoreRef = ref<InstanceType<typeof CanvasCore>>()
const BRANCH_SEGMENT_SIZE = 50

// ---------------------------------------------------------------------------
// 数据源
// ---------------------------------------------------------------------------

const effectiveProjectId = computed(() => props.projectId || writerStore.currentProjectId || '')
const isLoading = computed(() => writerStore.outline.loading)
const { visibleAssetSummaryItems } = useWriterAssetSummary({
  projectId: effectiveProjectId,
  chapterId: computed(() => props.chapterId),
  chapters: computed(() => props.chapters || []),
  activeEntities: computed(() => props.activeEntities || []),
})

/** 原始大纲根节点 */
const rootNodes = computed<OutlineNode[]>(() => writerStore.outline.tree || [])
const flatOutlineNodes = computed(() => flattenOutlineNodes(rootNodes.value))
const branchSegments = computed(() => {
  const segments = new Map<string, { id: string; title: string; total: number }>()
  flatOutlineNodes.value.forEach((_, index) => {
    const segmentIndex = Math.floor(index / BRANCH_SEGMENT_SIZE)
    const id = `segment:${segmentIndex}`
    const segment =
      segments.get(id) ||
      ({
        id,
        title: `第 ${segmentIndex * BRANCH_SEGMENT_SIZE + 1}-${Math.min(
          (segmentIndex + 1) * BRANCH_SEGMENT_SIZE,
          flatOutlineNodes.value.length,
        )} 节点`,
        total: 0,
      } as { id: string; title: string; total: number })
    segment.total += 1
    segments.set(id, segment)
  })
  return [...segments.values()]
})
const activeBranchSegment = computed(
  () => branchSegments.value.find((segment) => segment.id === activeBranchSegmentId.value) || null,
)
const activeSegmentNodeIds = computed(() => {
  if (!activeBranchSegmentId.value) return new Set<string>()
  const segmentIndex = Number(activeBranchSegmentId.value.replace('segment:', '')) || 0
  const start = segmentIndex * BRANCH_SEGMENT_SIZE
  const end = start + BRANCH_SEGMENT_SIZE
  return new Set(flatOutlineNodes.value.slice(start, end).map((node) => node.id))
})

/** 当前活跃分支的子树根节点列表 */
const activeBranchSubtree = computed<OutlineNode[]>(() => {
  if (!activeBranchId.value) return rootNodes.value

  // 在完整树中查找分支节点
  const branchNode = findOutlineNode(rootNodes.value, activeBranchId.value)
  if (!branchNode) return rootNodes.value

  return [branchNode]
})

/** 传给布局 composable 的根节点 */
const layoutInput = computed(() => {
  if (activeBranchId.value) return activeBranchSubtree.value
  if (!activeSegmentNodeIds.value.size) return activeBranchSubtree.value
  return pruneOutlineTreeByIds(activeBranchSubtree.value, activeSegmentNodeIds.value)
})

// ---------------------------------------------------------------------------
// 布局
// ---------------------------------------------------------------------------

const { flatNodes, edges, contentWidth, contentHeight, findNode } = useOrgTreeLayout(layoutInput)

// ---------------------------------------------------------------------------
// 统计
// ---------------------------------------------------------------------------

const branchPointCount = computed(
  () => flatNodes.value.filter((n) => n.category === 'branch-point').length,
)
const endingCount = computed(() => flatNodes.value.filter((n) => n.category === 'ending').length)

const activeBranchTitle = computed(() => {
  if (!activeBranchId.value) return ''
  const node = findNode(activeBranchId.value)
  return node?.title ?? ''
})

// ---------------------------------------------------------------------------
// 选择
// ---------------------------------------------------------------------------

const selectedOrgNode = computed(() =>
  selectedNodeId.value ? findNode(selectedNodeId.value) : null,
)

function selectNode(node: OrgTreeNode) {
  selectedNodeId.value = node.id
  writerStore.setCurrentOutlineNode(node.outlineNode)
}

function clearSelection() {
  selectedNodeId.value = ''
}

function handleCanvasClick() {
  // 点击空白区域不取消选择（保留详情面板）
}

// ---------------------------------------------------------------------------
// 分支切换
// ---------------------------------------------------------------------------

function enterBranch(node: OrgTreeNode) {
  if (node.children.length === 0) return
  activeBranchId.value = node.id
  selectedNodeId.value = ''
  // 重新适配视图
  requestAnimationFrame(() => {
    handleZoomToFit()
  })
}

function activateBranchSegment(segmentId: string) {
  activeBranchSegmentId.value = segmentId
  activeBranchId.value = ''
  const firstNode = flatOutlineNodes.value.find((node) => activeSegmentNodeIds.value.has(node.id))
  if (firstNode) {
    selectedNodeId.value = firstNode.id
    writerStore.setCurrentOutlineNode(firstNode)
  }
  requestAnimationFrame(() => {
    handleZoomToFit()
  })
}

function handleBranchLocate() {
  const query = branchLocatorQuery.value.trim().toLowerCase()
  if (!query) return
  const numberMatch = query.match(/\d+/)
  const number = numberMatch ? Number(numberMatch[0]) : 0
  const matchedIndex = flatOutlineNodes.value.findIndex((node, index) => {
    if (number > 0 && index + 1 === number) return true
    return (
      node.title.toLowerCase().includes(query) ||
      node.description?.toLowerCase().includes(query) ||
      node.type?.toLowerCase().includes(query)
    )
  })
  if (matchedIndex < 0) return
  const matchedNode = flatOutlineNodes.value[matchedIndex]
  activeBranchId.value = ''
  activeBranchSegmentId.value = `segment:${Math.floor(matchedIndex / BRANCH_SEGMENT_SIZE)}`
  selectedNodeId.value = matchedNode.id
  writerStore.setCurrentOutlineNode(matchedNode)
  requestAnimationFrame(() => {
    handleZoomToFit()
  })
}

function exitBranch() {
  activeBranchId.value = ''
  selectedNodeId.value = ''
  requestAnimationFrame(() => {
    handleZoomToFit()
  })
}

// ---------------------------------------------------------------------------
// 视图
// ---------------------------------------------------------------------------

function nodeStyle(node: OrgTreeNode) {
  return {
    left: `${node.x}px`,
    top: `${node.y}px`,
    width: `${node.width}px`,
    height: `${node.height}px`,
  }
}

function badgeStyle(category: string) {
  return {
    color: getCategoryColor(category as OrgTreeNode['category']),
    background: getCategoryBgColor(category as OrgTreeNode['category']),
  }
}

function isEdgeActive(edge: OrgTreeEdge): boolean {
  return edge.sourceId === selectedNodeId.value || edge.targetId === selectedNodeId.value
}

function isDimmed(node: OrgTreeNode): boolean {
  if (!selectedNodeId.value) return false
  return node.id !== selectedNodeId.value && !isAncestorOrDescendant(node.id, selectedNodeId.value)
}

/** 判断 targetId 是否是 nodeId 的祖先或后代 */
function isAncestorOrDescendant(nodeId: string, targetId: string): boolean {
  // 向上查找
  const target = findNode(targetId)
  if (!target) return false

  function checkDescendants(current: OrgTreeNode): boolean {
    if (current.id === nodeId) return true
    return current.children.some((child) => checkDescendants(child))
  }

  // 检查 target 是否是 nodeId 的后代
  if (checkDescendants(target)) return true

  // 检查 nodeId 是否是 target 的后代（向上遍历比较困难，简化处理）
  const node = findNode(nodeId)
  if (node && checkDescendants(node)) return true

  return false
}

function handleZoomToFit() {
  if (!canvasCoreRef.value) return
  const w = contentWidth.value || 800
  const h = contentHeight.value || 600
  canvasCoreRef.value.zoomToFit(w, h, 80)
}

// ---------------------------------------------------------------------------
// 辅助函数
// ---------------------------------------------------------------------------

function statusText(status: string): string {
  if (status === 'writing') return '写作中'
  if (status === 'reviewing') return '审核中'
  if (status === 'completed') return '已完成'
  return '草稿'
}

function buildSelectedNodeAIContextText(node: OrgTreeNode): string {
  const lines = [
    `故事分支节点：${node.title}`,
    props.chapterTitle ? `当前章节：${props.chapterTitle}` : '',
    props.workflowContext?.scopeLabel ? `场景作用域：${props.workflowContext.scopeLabel}` : '',
    formatActiveEntitiesPrompt(props.activeEntities),
    `节点类型：${getCategoryLabel(node.category)}`,
    `节点状态：${statusText(node.status)}`,
    node.outlineNode.description ? `节点描述：${node.outlineNode.description}` : '',
    `子分支数：${node.children.length}`,
  ].filter(Boolean)

  return lines.join('\n')
}

function sendSelectedNodeToAI() {
  const node = selectedOrgNode.value
  if (!node) return

  emit('trigger-ai-action', {
    source: 'workspace',
    action: 'add_to_chat',
    title: `故事分支分析：${node.title}`,
    text: buildSelectedNodeAIContextText(node),
    instructions:
      '请分析这个分支节点对当前叙事结构的作用，优先给出分支动机、冲突承接和后续展开建议。',
  })
}

function findOutlineNode(nodes: OutlineNode[], id: string): OutlineNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children?.length) {
      const found = findOutlineNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

function flattenOutlineNodes(nodes: OutlineNode[]): OutlineNode[] {
  const result: OutlineNode[] = []
  const walk = (nodeList: OutlineNode[]) => {
    for (const node of nodeList) {
      result.push(node)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(nodes)
  return result
}

function pruneOutlineTreeByIds(nodes: OutlineNode[], allowedIds: Set<string>): OutlineNode[] {
  const result: OutlineNode[] = []
  for (const node of nodes) {
    const children = pruneOutlineTreeByIds(node.children || [], allowedIds)
    if (allowedIds.has(node.id) || children.length) {
      result.push({
        ...node,
        children,
      })
    }
  }
  return result
}

// ---------------------------------------------------------------------------
// 数据加载
// ---------------------------------------------------------------------------

async function refreshOutline() {
  if (!effectiveProjectId.value) return
  await writerStore.loadOutlineTree(effectiveProjectId.value)
  if (!selectedNodeId.value && flatNodes.value.length > 0) {
    selectNode(flatNodes.value[0])
  }
  requestAnimationFrame(() => {
    handleZoomToFit()
  })
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
  () => branchSegments.value.map((segment) => segment.id).join('|'),
  () => {
    if (
      activeBranchSegmentId.value &&
      branchSegments.value.some((segment) => segment.id === activeBranchSegmentId.value)
    ) {
      return
    }
    activeBranchSegmentId.value = branchSegments.value[0]?.id || ''
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
/* ==========================================================================
   StoryBranchView - 故事分支组织结构图
   ========================================================================== */

.story-branch-view {
  --branch-main: #4d79da;
  --branch-chapter: #52c41a;
  --branch-sidetrack: #faad14;
  --branch-ending: #ff4d4f;
  --branch-point: #722ed1;

  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--editor-bg-surface, #f7f9ff);
  position: relative;
}

// ---------------------------------------------------------------------------
// 头部
// ---------------------------------------------------------------------------

.story-branch-view__header {
  padding: 14px 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--editor-bg-base, #ffffff);
  border-bottom: 1px solid var(--editor-border, #d7dff0);
  flex-shrink: 0;
}

.story-branch-view__header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.branch-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--editor-radius-md, 8px);
  background: var(--editor-bg-elevated, #f0f4ff);
  border: 1px solid var(--editor-border, #d6dff2);
  font-size: 12px;
}

.branch-breadcrumb__label {
  color: var(--editor-text-ghost, #8a9cc0);
}

.branch-breadcrumb__name {
  color: #3253a8;
  font-weight: 700;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.branch-breadcrumb__back {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--editor-text-ghost, #c8d2ea);
  background: var(--editor-bg-base, #ffffff);
  color: var(--editor-text-muted, #68799a);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: var(--editor-text-ghost, #8a9cc0);
    color: var(--editor-text-primary, #3253a8);
  }
}

// ---------------------------------------------------------------------------
// 统计栏
// ---------------------------------------------------------------------------

.story-branch-view__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 12px 16px;
  flex-shrink: 0;
}

.story-branch-view__navigator {
  display: grid;
  gap: 8px;
  padding: 0 16px 12px;
}

.story-branch-view__segment-map {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.story-branch-view__segment {
  min-width: 148px;
  padding: 9px 11px;
  border-radius: 12px;
  border: 1px solid var(--editor-border, #d6dff2);
  background: rgba(255, 255, 255, 0.92);
  color: var(--editor-text-secondary, #475569);
  text-align: left;
  cursor: pointer;

  strong,
  span {
    display: block;
  }

  strong {
    color: var(--editor-text-primary, #24365d);
    font-size: 12px;
  }

  span {
    margin-top: 3px;
    color: var(--editor-text-muted, #68799a);
    font-size: 11px;
  }

  &.is-active {
    border-color: rgba(77, 121, 218, 0.28);
    background: rgba(236, 243, 255, 0.9);
  }
}

.story-branch-view__locator {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;

  label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex: 1 1 280px;
    min-height: 34px;
    padding: 0 10px;
    border-radius: 12px;
    border: 1px solid var(--editor-border, #d6dff2);
    background: rgba(255, 255, 255, 0.92);
  }

  input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: var(--editor-text-primary, #24365d);
    font-size: 12px;
  }

  button {
    min-height: 32px;
    padding: 0 11px;
    border-radius: 999px;
    border: 1px solid var(--editor-border, #d6dff2);
    background: rgba(255, 255, 255, 0.92);
    color: var(--branch-main);
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
  }

  span {
    margin-left: auto;
    color: var(--editor-text-muted, #68799a);
    font-size: 12px;
    font-weight: 800;
  }
}

// ---------------------------------------------------------------------------
// 画布区域
// ---------------------------------------------------------------------------

.story-branch-view__canvas-area {
  flex: 1;
  min-height: 0;
  margin: 0 16px 16px;
  border-radius: var(--editor-radius-lg, 14px);
  border: 1px solid var(--editor-border, #d6dff2);
  background: var(--editor-bg-base, #ffffff);
  overflow: hidden;
  position: relative;
}

.story-branch-canvas {
  width: 100%;
  height: 100%;
  --canvas-bg: #fafbff;
  --canvas-grid-dot: #dfe5f0;
}

.story-branch-view__toolbar-actions {
  display: flex;
  gap: 4px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--editor-border, #d6dff2);
  border-radius: var(--editor-radius-md, 8px);
  background: rgba(255, 255, 255, 0.95);
  color: var(--editor-text-muted, #5f7292);
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: var(--editor-text-ghost, #8a9cc0);
    color: var(--editor-text-primary, #3253a8);
    background: var(--editor-bg-base, #ffffff);
  }
}

.story-branch-view__empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

// ---------------------------------------------------------------------------
// 节点卡片
// ---------------------------------------------------------------------------

.org-node {
  position: absolute;
  border-radius: var(--editor-radius-lg, 12px);
  border: 1.5px solid var(--editor-border, #e1e8f6);
  background: var(--editor-bg-base, #ffffff);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    border-color: var(--editor-text-ghost, #b8c8e8);
  }

  &.org-node--selected {
    border-color: var(--branch-main);
    box-shadow:
      0 0 0 3px rgba(77, 121, 218, 0.15),
      0 8px 20px rgba(77, 121, 218, 0.12);
    transform: translateY(-2px);
  }

  &.org-node--active-branch {
    border-color: var(--branch-point);
    box-shadow:
      0 0 0 3px rgba(114, 46, 209, 0.15),
      0 8px 20px rgba(114, 46, 209, 0.1);
  }

  &.org-node--dimmed {
    opacity: 0.4;
  }

  // 类型边框色
  &.org-node--main {
    border-left: 3px solid var(--branch-main);
  }

  &.org-node--chapter {
    border-left: 3px solid var(--branch-chapter);
  }

  &.org-node--sidetrack {
    border-left: 3px solid var(--branch-sidetrack);
  }

  &.org-node--ending {
    border-left: 3px solid var(--branch-ending);
  }

  &.org-node--branch-point {
    border-left: 3px solid var(--branch-point);
  }
}

.org-node__icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.org-node__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.org-node__title {
  font-size: 13px;
  font-weight: 700;
  color: var(--editor-text-primary, #24365d);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.org-node__badge {
  display: inline-block;
  width: fit-content;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.4;
}

.org-node__status {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.org-node__status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &.status-draft {
    background: #bfbfbf;
  }

  &.status-writing {
    background: #faad14;
    box-shadow: 0 0 6px rgba(250, 173, 20, 0.4);
  }

  &.status-reviewing {
    background: #1890ff;
    box-shadow: 0 0 6px rgba(24, 144, 255, 0.4);
  }

  &.status-completed {
    background: #52c41a;
    box-shadow: 0 0 6px rgba(82, 196, 26, 0.4);
  }

  &.status-planned {
    background: #bfbfbf;
  }
}

// ---------------------------------------------------------------------------
// SVG 连线
// ---------------------------------------------------------------------------

.org-edge {
  stroke: var(--editor-border, #c8d2ea);
  transition: stroke 0.2s;

  &.org-edge--active {
    stroke: var(--branch-main);
    stroke-width: 2.5;
  }
}

// ---------------------------------------------------------------------------
// 右侧详情面板
// ---------------------------------------------------------------------------

.story-branch-detail {
  position: absolute;
  right: 16px;
  bottom: 16px;
  width: 280px;
  max-height: calc(100% - 180px);
  border-radius: var(--editor-radius-lg, 14px);
  border: 1px solid var(--editor-border, #d6dff2);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  padding: 16px;
  overflow-y: auto;
  z-index: 20;
}

.story-branch-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.story-branch-detail__type {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 800;
}

.detail-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 1px solid var(--editor-border, #e1e8f6);
  border-radius: 6px;
  background: transparent;
  color: var(--editor-text-ghost, #8a9cc0);
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: var(--editor-bg-elevated, #f0f4ff);
    color: var(--editor-text-primary, #3253a8);
  }
}

.story-branch-detail__title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: var(--editor-text-primary, #203258);
  line-height: 1.4;
}

.story-branch-detail__desc {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--editor-text-muted, #5f7292);
}

.story-branch-detail__meta {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 8px;
  border-radius: var(--editor-radius-md, 8px);
  background: var(--editor-bg-elevated, #f5f8ff);
}

.meta-label {
  font-size: 10px;
  color: var(--editor-text-ghost, #8a9cc0);
  font-weight: 700;
  text-transform: uppercase;
}

.meta-value {
  font-size: 14px;
  color: var(--editor-text-primary, #24365d);
  font-weight: 700;
}

// ---------------------------------------------------------------------------
// 子分支列表
// ---------------------------------------------------------------------------

.story-branch-detail__children {
  margin-top: 16px;
}

.detail-section-title {
  font-size: 11px;
  font-weight: 800;
  color: var(--editor-text-ghost, #8a9cc0);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}

.child-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--editor-radius-md, 8px);
  border: 1px solid var(--editor-border, #e1e8f6);
  background: var(--editor-bg-surface, #fafbff);
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 6px;

  &:hover {
    background: var(--editor-bg-elevated, #f0f4ff);
    border-color: var(--editor-text-ghost, #b8c8e8);
  }

  &.child-item--active {
    background: var(--editor-bg-elevated, #ecf3ff);
    border-color: var(--branch-main);
  }
}

.child-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.child-item__name {
  flex: 1;
  font-size: 13px;
  color: var(--editor-text-primary, #24365d);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.child-item__badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--editor-bg-elevated, #f0f4ff);
  color: var(--editor-text-muted, #68799a);
  font-weight: 700;
}

// ---------------------------------------------------------------------------
// 操作按钮
// ---------------------------------------------------------------------------

.story-branch-detail__actions {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.enter-branch-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid rgba(114, 46, 209, 0.2);
  background: rgba(114, 46, 209, 0.06);
  color: var(--branch-point);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(114, 46, 209, 0.12);
    border-color: rgba(114, 46, 209, 0.35);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(114, 46, 209, 0.1);
  }
}

.enter-branch-btn--secondary {
  border-color: var(--editor-border, #dbe5f5);
  background: var(--editor-bg-base, #ffffff);
  color: var(--editor-text-primary, #24365d);

  &:hover {
    background: var(--editor-bg-elevated, #f3f7ff);
    border-color: rgba(77, 121, 218, 0.35);
    box-shadow: 0 4px 12px rgba(77, 121, 218, 0.08);
  }
}

// ---------------------------------------------------------------------------
// 响应式
// ---------------------------------------------------------------------------

@media (max-width: 1100px) {
  .story-branch-view__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .story-branch-detail {
    width: 240px;
  }
}

@media (max-width: 768px) {
  .story-branch-view__header {
    flex-direction: column;
  }

  .story-branch-detail {
    position: relative;
    right: auto;
    bottom: auto;
    width: 100%;
    max-height: none;
    margin: 0 16px 16px;
  }
}
</style>
