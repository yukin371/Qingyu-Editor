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
    { value: 'nearby', label: '当前窗口' },
    { value: 'all', label: '整段' },
    { value: 'unlinked', label: '待绑定' },
    { value: 'asset-missing', label: '待补资产' },
    { value: 'writing', label: '推进中' },
    { value: 'completed', label: '已完成' },
  ]

  const rhythmBoardSummary = computed(() => {
    let boundChapters = 0
    let writing = 0
    let unbound = 0
    let assets = 0

    for (const node of options.flattenedNodes.value) {
      const chapterId = getBoundChapterId(node)
      if (chapterId) {
        boundChapters += 1
        assets += options.assetSummaryByChapterId.value[chapterId]?.total || 0
      } else {
        unbound += 1
      }

      if ((node.status || 'planned') === 'writing') {
        writing += 1
      }
    }

    return { boundChapters, writing, unbound, assets }
  })

  const volumeTitleById = computed(() => {
    const map: Record<string, string> = {}
    for (const chapter of options.chapterOptions.value) {
      if (chapter.nodeType === 'directory') {
        map[chapter.id] = chapter.title || '未命名卷'
      }
    }
    return map
  })

  const hasVolumeSegments = computed(() => Object.keys(volumeTitleById.value).length > 0)

  const rhythmAllRows = computed<RhythmRow[]>(() =>
    options.flattenedNodes.value.map((node, index) => {
      const chapterId = getBoundChapterId(node)
      const chapter = chapterId
        ? options.chapterOptions.value.find((item) => item.id === chapterId) || null
        : null
      const assetCount = chapterId
        ? options.assetSummaryByChapterId.value[chapterId]?.total || 0
        : 0
      const statusLabel = getStructureNodeStatusText(node)
      const statusTone = getStructureNodeLane(node)
      const segmentId = hasVolumeSegments.value
        ? `volume:${chapter?.parentId || 'ungrouped'}`
        : `segment:${Math.floor(index / RHYTHM_SEGMENT_SIZE) + 1}`

      return {
        id: node.id,
        node,
        index,
        title: node.title || '未命名节点',
        description: node.description || '补充这一节的目标、阻力与结果。',
        chapterId: chapter?.id,
        orderLabel: `#${index + 1}`,
        segmentId,
        statusTone,
        statusLabel,
        hookLabel: node.description?.slice(0, 24) || '待补钩子',
        timelineLabel: chapter ? (options.currentChapterId.value === chapter.id ? '当前章节' : '查看时间线') : '待接时间线',
        assetCount,
        assetLabel: assetCount > 0 ? `${assetCount} 项资产` : '待补资产',
        wordCountLabel: chapter?.wordCount ? `${chapter.wordCount} 字` : '未写正文',
      }
    }),
  )

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
          unbound: rows.filter((row) => !row.chapterId).length,
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
      const startLabel = start + 1
      const endLabel = endIndex + 1
      segments.push({
        id: `segment:${Math.floor(start / RHYTHM_SEGMENT_SIZE) + 1}`,
        title: `第 ${startLabel}-${endLabel} 节点`,
        total: rows.length,
        unbound: rows.filter((row) => !row.chapterId).length,
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
        selectedRhythmRow.value?.segmentId === activeSegmentId.value
          ? {
              ...selectedRhythmRow.value,
              order: selectedRhythmRow.value.index,
            }
          : currentChapterRhythmRow.value?.segmentId === activeSegmentId.value
            ? {
                ...currentChapterRhythmRow.value,
                order: currentChapterRhythmRow.value.index,
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
          ? options.chapterOptions.value.find((item) => item.id === row.chapterId)?.chapterNum
          : undefined,
        chapterTitle: row.chapterId
          ? options.chapterOptions.value.find((item) => item.id === row.chapterId)?.title
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

  watch(
    () => [
      rhythmSegments.value.map((segment) => segment.id).join('|'),
      options.currentChapterId.value,
      options.selectedNodeId.value,
    ],
    () => {
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
