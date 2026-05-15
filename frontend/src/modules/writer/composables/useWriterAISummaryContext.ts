import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import { useWriterAssetSummary } from '@/modules/writer/composables/useWriterAssetSummary'
import {
  buildCreativeWorkflowSnapshot,
  buildCreativeWorkflowSummaryLines,
  loadCreativeWorkflow,
  type CreativeWorkflowSnapshot,
} from '@/modules/writer/services/creativeWorkflow.service'

type MaybeComputed<T> = Ref<T> | ComputedRef<T>

export function useWriterAISummaryContext(options: {
  projectId: MaybeComputed<string>
  chapterId: MaybeComputed<string>
  chapters: MaybeComputed<SidebarChapterSummary[]>
}) {
  const creativeWorkflowSnapshot = ref<CreativeWorkflowSnapshot | null>(null)
  const loading = ref(false)

  const { currentWriterAssetSummaryItems } = useWriterAssetSummary({
    projectId: options.projectId,
    chapterId: computed(() => options.chapterId.value),
    chapters: computed(() => options.chapters.value),
  })

  watch(
    () => options.projectId.value,
    async (projectId) => {
      if (!projectId) {
        creativeWorkflowSnapshot.value = null
        return
      }

      loading.value = true
      try {
        const workflow = await loadCreativeWorkflow(projectId)
        creativeWorkflowSnapshot.value = buildCreativeWorkflowSnapshot(workflow)
      } finally {
        loading.value = false
      }
    },
    { immediate: true },
  )

  const assetSummaryLine = computed(() => {
    if (!currentWriterAssetSummaryItems.value.length) {
      return ''
    }

    return `当前章节资产：${currentWriterAssetSummaryItems.value
      .map((item) => `${item.label} ${item.count}`)
      .join('；')}`
  })

  const summaryLines = computed(() => {
    const workflowLines = buildCreativeWorkflowSummaryLines(creativeWorkflowSnapshot.value).slice(0, 5)
    return [...workflowLines, assetSummaryLine.value].filter(Boolean)
  })

  const summaryText = computed(() =>
    summaryLines.value.length ? `创作蓝图与资产摘要：\n${summaryLines.value.join('\n')}` : '',
  )

  return {
    loading,
    creativeWorkflowSnapshot,
    currentWriterAssetSummaryItems,
    aiSummaryContextLines: summaryLines,
    aiSummaryContextText: summaryText,
  }
}
