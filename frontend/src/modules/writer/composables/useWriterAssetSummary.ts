import { computed, unref, type ComputedRef, type Ref } from 'vue'
import { useWriterAssetRefState } from '@/modules/writer/composables/useWriterAssetRefState'
import {
  buildWriterAssetSummaryByChapterId,
  buildWriterAssetSummaryItems,
  type WriterAssetSummary,
  type WriterAssetSummaryItem,
} from '@/modules/writer/utils/writerAssetRefs'
import {
  buildActiveEntityTypeSummary,
  type ActiveEntitySummary,
} from '@/modules/writer/composables/useWorkflowContext'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>

const EMPTY_ASSET_SUMMARY: WriterAssetSummary = {
  total: 0,
  characters: 0,
  locations: 0,
  items: 0,
  organizations: 0,
  concepts: 0,
}

export interface VisibleAssetSummaryItem {
  key: string
  label: string
  count: number
}

export function useWriterAssetSummary(options: {
  projectId: MaybeRef<string>
  chapterId: MaybeRef<string | undefined>
  chapters: MaybeRef<SidebarChapterSummary[] | undefined>
  activeEntities?: MaybeRef<ActiveEntitySummary[] | undefined>
}) {
  const { assetRefState } = useWriterAssetRefState(
    computed(() => String(unref(options.projectId) || '')),
  )
  const chapterAssetSummaryById = computed(() =>
    buildWriterAssetSummaryByChapterId(assetRefState.value, unref(options.chapters) || []),
  )
  const currentChapterAssetSummary = computed<WriterAssetSummary>(() => {
    const chapterId = String(unref(options.chapterId) || '')
    if (!chapterId) return EMPTY_ASSET_SUMMARY
    return chapterAssetSummaryById.value[chapterId] || EMPTY_ASSET_SUMMARY
  })
  const currentWriterAssetSummaryItems = computed<WriterAssetSummaryItem[]>(() =>
    buildWriterAssetSummaryItems(currentChapterAssetSummary.value),
  )
  const fallbackActiveEntitySummary = computed(() =>
    buildActiveEntityTypeSummary(unref(options.activeEntities)),
  )
  const visibleAssetSummaryItems = computed<VisibleAssetSummaryItem[]>(() =>
    currentWriterAssetSummaryItems.value.length
      ? currentWriterAssetSummaryItems.value.map((item) => ({
          key: item.type,
          label: item.label,
          count: item.count,
        }))
      : fallbackActiveEntitySummary.value.items.map((item) => ({
          key: item.type,
          label: item.typeLabel,
          count: item.count,
        })),
  )

  return {
    assetRefState,
    chapterAssetSummaryById,
    currentChapterAssetSummary,
    currentWriterAssetSummaryItems,
    visibleAssetSummaryItems,
  }
}
