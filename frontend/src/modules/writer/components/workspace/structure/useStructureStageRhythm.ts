import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import { message } from '@/design-system/services'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type { WriterAssetSummary } from '@/modules/writer/utils/writerAssetRefs'
import {
  locateWriterCandidate,
  resolveStableWriterSegmentId,
  resolveWriterWindowRange,
} from '@/modules/writer/utils/longformLocate'
import type { OutlineNode } from '@/types/writer'
import { getBoundChapterId, getStructureNodeLane, getStructureNodeStatusText } from './structureNodeTypes'

export type RhythmFilterMode =
  | 'all'
  | 'nearby'
  | 'unlinked'
  | 'asset-missing'
  | 'writing'
  | 'completed'

export interface RhythmSegment {
  id: string
  title: string
  total: number
  unbound: number
  assetMissing: number
  startIndex: number
  endIndex: number
}

export interface RhythmRow {
  id: string
  node: OutlineNode
  index: number
  title: string
  description: string
  hasStructurePlan: boolean
  chapterId?: string
  orderLabel: string
  segmentId: string
  statusTone: string
  statusLabel: string
  hookLabel: string
  timelineLabel: string
  assetCount: number
  assetLabel: string
  wordCountLabel: string
}

interface UseStructureStageRhythmOptions {
  currentChapterId: Ref<string>
  currentChapterTitle: Ref<string>
  chapterEntries?: ComputedRef<SidebarChapterSummary[]>
  chapterOptions: ComputedRef<SidebarChapterSummary[]>
  rootNodes: ComputedRef<OutlineNode[]>
  flattenedNodes: ComputedRef<OutlineNode[]>
  selectedNodeId: Ref<string>
  selectedNode: ComputedRef<OutlineNode | null>
  assetSummaryByChapterId: ComputedRef<Record<string, WriterAssetSummary>>
  selectNode: (node: OutlineNode) => void
}

const RHYTHM_SEGMENT_SIZE = 50
const RHYTHM_WINDOW_BEFORE_COUNT = 20
const RHYTHM_WINDOW_AFTER_COUNT = 20
const RHYTHM_SEGMENT_INITIAL_LIMIT = 40
const RHYTHM_FILTERED_ROW_LIMIT = 80
const RHYTHM_WINDOW_OPTIONS = {
  beforeCount: RHYTHM_WINDOW_BEFORE_COUNT,
  afterCount: RHYTHM_WINDOW_AFTER_COUNT,
  initialCount: RHYTHM_SEGMENT_INITIAL_LIMIT,
} as const

export function useStructureStageRhythm(options: UseStructureStageRhythmOptions) {
  const activeSegmentId = ref('')
  const rhythmLocatorQuery = ref('')
  const rhythmFilterMode = ref<RhythmFilterMode>('nearby')
  const rhythmFilterOptions: Array<{ value: RhythmFilterMode; label: string }> = [
    { value: 'nearby', label: '附近' },
    { value: 'all', label: '全部' },
    { value: 'unlinked', label: '未入纲' },
    { value: 'asset-missing', label: '待补资产' },
    { value: 'writing', label: '推进中' },
    { value: 'completed', label: '已完成' },
  ]

  const chapterEntries = computed(() =>
    options.chapterEntries?.value?.length ? options.chapterEntries.value : options.chapterOptions.value,
  )

  const volumeTitleById = computed(() => {
    const map: Record<string, string> = {}
    for (const chapter of chapterEntries.value) {
      if (chapter.nodeType === 'directory') {
        map[chapter.id] = chapter.title || '未命名卷'
      }
    }
    return map
  })

  const hasVolumeSegments = computed(() => Object.keys(volumeTitleById.value).length > 0)

  const chapterRows = computed(() =>
    chapterEntries.value.filter((chapter) => chapter.nodeType !== 'directory'),
  )

  const chapterVolumeIndexById = computed(() => {
    const counters = new Map<string, number>()
    const map: Record<string, number> = {}
    for (const chapter of chapterRows.value) {
      const volumeId = chapter.parentId || 'ungrouped'
      const nextIndex = (counters.get(volumeId) || 0) + 1
      counters.set(volumeId, nextIndex)
      map[chapter.id] = nextIndex
    }
    return map
  })

  const chapterById = computed(() => {
    const map: Record<string, SidebarChapterSummary> = {}
    for (const chapter of chapterRows.value) {
      map[chapter.id] = chapter
    }
    return map
  })

  const structureNodeByChapterId = computed(() => {
    const map: Record<string, OutlineNode> = {}
    for (const node of options.flattenedNodes.value) {
      const chapterId = getBoundChapterId(node)
      if (chapterId && chapterById.value[chapterId] && !map[chapterId]) {
        map[chapterId] = node
      }
    }
    return map
  })

  const rhythmAllRows = computed<RhythmRow[]>(() =>
    chapterRows.value.map((chapter, index) => {
      const linkedStructureNode = structureNodeByChapterId.value[chapter.id] || null
      const node = linkedStructureNode || {
        id: `chapter-row:${chapter.id}`,
        projectId: chapter.projectId,
        documentId: chapter.id,
        title: chapter.title || `第${chapter.chapterNum || index + 1}章`,
        description: '',
        order: index,
        level: 1,
        status: chapter.status === 'published' ? 'completed' : 'draft',
        type: 'chapter',
        wordCount: chapter.wordCount,
      } as OutlineNode
      const assetCount = options.assetSummaryByChapterId.value[chapter.id]?.total || 0
      const statusLabel = linkedStructureNode
        ? getStructureNodeStatusText(node)
        : chapter.status === 'published'
          ? '已完成'
          : chapter.wordCount > 0
            ? '写作中'
            : '草稿'
      const statusTone = linkedStructureNode
        ? getStructureNodeLane(node)
        : chapter.status === 'published'
          ? 'completed'
          : chapter.wordCount > 0
            ? 'writing'
            : 'draft'
      const volumeId = chapter.parentId || 'ungrouped'
      const volumeTitle = chapter.parentId ? volumeTitleById.value[chapter.parentId] : ''
      const volumeChapterIndex = chapterVolumeIndexById.value[chapter.id] || index + 1
      const segmentId = hasVolumeSegments.value
        ? `volume:${volumeId}`
        : `segment:${Math.floor(index / RHYTHM_SEGMENT_SIZE) + 1}`
      const orderLabel = hasVolumeSegments.value
        ? `${volumeTitle || '未归卷'} · 第 ${volumeChapterIndex} 章`
        : chapter.chapterNum ? `第 ${chapter.chapterNum} 章` : `章节 ${index + 1}`

      return {
        id: node.id,
        node,
        index,
        title: chapter.title || node.title || `第${chapter.chapterNum || index + 1}章`,
        description: linkedStructureNode?.description || '',
        hasStructurePlan: !!linkedStructureNode,
        chapterId: chapter.id,
        orderLabel,
        segmentId,
        statusTone,
        statusLabel,
        hookLabel: node.description?.slice(0, 24) || '待补钩子',
        timelineLabel: options.currentChapterId.value === chapter.id ? '当前章节' : '查看时间线',
        assetCount,
        assetLabel: assetCount > 0 ? `${assetCount} 项资产` : '待补资产',
        wordCountLabel: chapter.wordCount ? `${chapter.wordCount} 字` : '未写正文',
      }
    }),
  )

  const rhythmBoardSummary = computed(() => {
    const chapterIds = new Set(chapterRows.value.map((chapter) => chapter.id))
    const boundChapterIds = new Set<string>()
    let writing = 0
    let assets = 0

    for (const row of rhythmAllRows.value) {
      if (row.chapterId && structureNodeByChapterId.value[row.chapterId]) {
        boundChapterIds.add(row.chapterId)
      }
      if (row.chapterId) {
        assets += options.assetSummaryByChapterId.value[row.chapterId]?.total || 0
      }
      if (row.statusTone === 'writing') {
        writing += 1
      }
    }

    return {
      boundChapters: boundChapterIds.size,
      writing,
      unbound: Math.max(0, chapterIds.size - boundChapterIds.size),
      assets,
    }
  })

  const rhythmSegments = computed<RhythmSegment[]>(() => {
    if (!rhythmAllRows.value.length) return []

    if (hasVolumeSegments.value) {
      const grouped = new Map<string, RhythmRow[]>()
      for (const row of rhythmAllRows.value) {
        const rows = grouped.get(row.segmentId) || []
        rows.push(row)
        grouped.set(row.segmentId, rows)
      }

      return Array.from(grouped.entries()).map(([segmentId, rows]) => {
        const first = rows[0]
        const volumeId = segmentId.replace('volume:', '')
        return {
          id: segmentId,
          title:
            volumeId === 'ungrouped'
              ? '未归卷章节'
              : volumeTitleById.value[volumeId] || first?.title || '未命名卷',
          total: rows.length,
          unbound: rows.filter(
            (row) => row.chapterId && !structureNodeByChapterId.value[row.chapterId],
          ).length,
          assetMissing: rows.filter((row) => row.assetCount === 0).length,
          startIndex: first?.index ?? 0,
          endIndex: rows[rows.length - 1]?.index ?? first?.index ?? 0,
        }
      })
    }

    const segments: RhythmSegment[] = []
    for (let start = 0; start < rhythmAllRows.value.length; start += RHYTHM_SEGMENT_SIZE) {
      const rows = rhythmAllRows.value.slice(start, start + RHYTHM_SEGMENT_SIZE)
      const endIndex = rows[rows.length - 1]?.index ?? start
      const firstChapter = rows[0]
      const lastChapter = rows[rows.length - 1]
      const startLabel = firstChapter?.orderLabel.replace(/\s+/g, '') || `章节${start + 1}`
      const endLabel = lastChapter?.orderLabel.replace(/\s+/g, '') || `章节${endIndex + 1}`
      segments.push({
        id: `segment:${Math.floor(start / RHYTHM_SEGMENT_SIZE) + 1}`,
        title: `${startLabel}-${endLabel}`,
        total: rows.length,
        unbound: rows.filter(
          (row) => row.chapterId && !structureNodeByChapterId.value[row.chapterId],
        ).length,
        assetMissing: rows.filter((row) => row.assetCount === 0).length,
        startIndex: start,
        endIndex,
      })
    }
    return segments
  })

  const activeRhythmSegment = computed(
    () => rhythmSegments.value.find((segment) => segment.id === activeSegmentId.value) || null,
  )
  const activeSegmentRows = computed(() =>
    rhythmAllRows.value.filter((row) => row.segmentId === activeSegmentId.value),
  )
  const selectedRhythmRow = computed(
    () => rhythmAllRows.value.find((row) => row.id === options.selectedNodeId.value) || null,
  )
  const currentChapterRhythmRow = computed(() =>
    options.currentChapterId.value
      ? rhythmAllRows.value.find((row) => row.chapterId === options.currentChapterId.value) || null
      : null,
  )
  const rhythmWindowRows = computed(() => {
    let rows = activeSegmentRows.value

    if (rhythmFilterMode.value === 'nearby') {
      const anchor =
        currentChapterRhythmRow.value?.segmentId === activeSegmentId.value
          ? {
              ...currentChapterRhythmRow.value,
              order: currentChapterRhythmRow.value.index,
            }
          : selectedRhythmRow.value?.segmentId === activeSegmentId.value
            ? {
                ...selectedRhythmRow.value,
                order: selectedRhythmRow.value.index,
              }
            : null
      const windowRange = resolveWriterWindowRange(
        activeSegmentRows.value.map((row) => ({
          ...row,
          order: row.index,
        })),
        anchor,
        anchor ? 'around-target' : 'segment',
        RHYTHM_WINDOW_OPTIONS,
      )
      if (!windowRange) {
        return []
      }
      rows = rows.filter(
        (row) => row.index >= windowRange.startOrder && row.index <= windowRange.endOrder,
      )
    }
    if (rhythmFilterMode.value === 'unlinked') {
      rows = rows.filter(
        (row) => row.chapterId && !structureNodeByChapterId.value[row.chapterId],
      )
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
    if (!activeRhythmSegment.value) return '无章节'
    if (!rhythmWindowRows.value.length) return '无匹配'
    const first = rhythmWindowRows.value[0]
    const last = rhythmWindowRows.value[rhythmWindowRows.value.length - 1]
    return `显示 ${first.orderLabel}-${last.orderLabel}`
  })

  function activateRhythmSegment(segmentId: string) {
    activeSegmentId.value = segmentId
    rhythmFilterMode.value = 'nearby'
    const firstRow = rhythmAllRows.value.find((row) => row.segmentId === segmentId)
    if (firstRow) {
      options.selectNode(firstRow.node)
    }
  }

  function handleRhythmLocate() {
    const located = locateWriterCandidate(
      rhythmAllRows.value.map((row) => ({
        ...row,
        order: row.index,
        chapterNumber: row.chapterId
          ? chapterEntries.value.find((item) => item.id === row.chapterId)?.chapterNum
          : undefined,
        chapterTitle: row.chapterId
          ? [
              chapterEntries.value.find((item) => item.id === row.chapterId)?.title,
              row.orderLabel,
            ].filter(Boolean).join(' ')
          : undefined,
      })),
      rhythmLocatorQuery.value,
      (segmentId) =>
        rhythmAllRows.value
          .filter((row) => row.segmentId === segmentId)
          .map((row) => ({
            ...row,
            order: row.index,
          })),
      RHYTHM_WINDOW_OPTIONS,
    )

    if (!located) {
      message.warning('没有找到匹配的章节或结构节点')
      return
    }

    activeSegmentId.value = located.segmentId
    rhythmFilterMode.value = 'nearby'
    options.selectNode(located.candidate.node)
  }

  let lastCurrentChapterId = ''
  watch(
    () => [
      rhythmSegments.value.map((segment) => segment.id).join('|'),
      options.currentChapterId.value,
      options.selectedNodeId.value,
    ],
    () => {
      const currentChapterChanged = options.currentChapterId.value !== lastCurrentChapterId
      lastCurrentChapterId = options.currentChapterId.value
      if (
        currentChapterChanged &&
        currentChapterRhythmRow.value?.segmentId &&
        currentChapterRhythmRow.value.segmentId !== activeSegmentId.value
      ) {
        activeSegmentId.value = currentChapterRhythmRow.value.segmentId
        return
      }

      if (
        activeSegmentId.value &&
        rhythmSegments.value.some((segment) => segment.id === activeSegmentId.value)
      ) {
        return
      }

      activeSegmentId.value = resolveStableWriterSegmentId(
        activeSegmentId.value,
        rhythmSegments.value.map((segment) => segment.id),
        [
          selectedRhythmRow.value?.segmentId,
          currentChapterRhythmRow.value?.segmentId,
        ],
      )
    },
    { immediate: true },
  )

  return {
    activeSegmentId,
    rhythmLocatorQuery,
    rhythmFilterMode,
    rhythmFilterOptions,
    rhythmBoardSummary,
    rhythmAllRows,
    rhythmSegments,
    activeRhythmSegment,
    selectedRhythmRow,
    currentChapterRhythmRow,
    rhythmWindowRows,
    rhythmWindowRangeLabel,
    activateRhythmSegment,
    handleRhythmLocate,
  }
}
