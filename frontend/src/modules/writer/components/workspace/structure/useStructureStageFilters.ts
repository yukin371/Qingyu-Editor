import { computed, type ComputedRef, type Ref } from 'vue'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type { ChapterGraph } from '@/modules/writer/types/character'
import type { WriterAssetSummary } from '@/modules/writer/utils/writerAssetRefs'
import type { OutlineNode } from '@/types/writer'
import type { StructureFilterMode } from './structureStage.types'
import {
  findBoundChapter,
  getBoundChapterId,
  getStructureNodeGraphState,
  getStructureNodeLane,
  matchesStructureNodeGraphFilter,
} from './structureNodeTypes'

interface UseStructureStageFiltersOptions {
  filterText: Ref<string>
  activeFilter: Ref<StructureFilterMode>
  rootNodes: ComputedRef<OutlineNode[]>
  currentChapterId: Ref<string>
  chapterOptions: ComputedRef<SidebarChapterSummary[]>
  chapterGraphs: ComputedRef<ChapterGraph[]>
  assetSummaryByChapterId: ComputedRef<Record<string, WriterAssetSummary>>
}

export function useStructureStageFilters(options: UseStructureStageFiltersOptions) {
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
    secondaryFilterOptions.value.some((option) => option.value === options.activeFilter.value)
      ? options.activeFilter.value
      : '',
  )

  function matchesNodeFilter(node: OutlineNode): boolean {
    const normalizedQuery = options.filterText.value.trim().toLowerCase()
    const matchesQuery =
      !normalizedQuery ||
      node.title?.toLowerCase().includes(normalizedQuery) ||
      node.description?.toLowerCase().includes(normalizedQuery)

    if (!matchesQuery) return false

    if (options.activeFilter.value === 'linked') return !!getBoundChapterId(node)
    if (options.activeFilter.value === 'unlinked') return !getBoundChapterId(node)
    if (options.activeFilter.value === 'current-chapter') {
      return (
        !!options.currentChapterId.value &&
        getBoundChapterId(node) === options.currentChapterId.value
      )
    }
    if (options.activeFilter.value === 'asset-ready') {
      const chapterId = getBoundChapterId(node)
      return !!chapterId && (options.assetSummaryByChapterId.value[chapterId]?.total || 0) > 0
    }
    if (options.activeFilter.value === 'asset-missing') {
      const chapterId = getBoundChapterId(node)
      return !chapterId || (options.assetSummaryByChapterId.value[chapterId]?.total || 0) === 0
    }
    if (options.activeFilter.value === 'graph-missing') {
      return matchesStructureNodeGraphFilter(node, options.chapterGraphs.value, 'missing')
    }
    if (options.activeFilter.value === 'graph-ready') {
      return matchesStructureNodeGraphFilter(node, options.chapterGraphs.value, 'graphed')
    }
    if (options.activeFilter.value === 'graph-inherit') {
      return matchesStructureNodeGraphFilter(node, options.chapterGraphs.value, 'inherit')
    }
    if (options.activeFilter.value === 'draft') return getStructureNodeLane(node) === 'draft'
    if (options.activeFilter.value === 'writing') return getStructureNodeLane(node) === 'writing'
    if (options.activeFilter.value === 'completed') return getStructureNodeLane(node) === 'completed'
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

  const filteredRootNodes = computed<OutlineNode[]>(() => filterOutlineTree(options.rootNodes.value))
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

  const branchSpotlights = computed(() =>
    filteredRootNodes.value.map((node) => {
      const children = node.children || []
      const topCount = children.filter((_, index) => index % 2 === 0).length
      const bottomCount = children.length - topCount
      const branchCount = children.length
      const chapterId = getBoundChapterId(node)
      const assetSummary = chapterId
        ? options.assetSummaryByChapterId.value[chapterId]
        : undefined
      const graphState = getStructureNodeGraphState(node, options.chapterGraphs.value)

      return {
        id: node.id,
        node,
        title: node.title || '未命名节点',
        level: node.level || 1,
        topCount,
        bottomCount,
        branchCount,
        bindingLabel: findBoundChapter(node, options.chapterOptions.value)?.title || '未绑定章节',
        graphLabel: graphState.label,
        graphTone: graphState.tone,
        assetLabel: assetSummary?.total ? `资产 ${assetSummary.total}` : '',
      }
    }),
  )

  return {
    primaryFilterOptions,
    secondaryFilterOptions,
    secondaryFilterValue,
    filteredRootNodes,
    filteredFlattenedNodes,
    branchSpotlights,
  }
}
