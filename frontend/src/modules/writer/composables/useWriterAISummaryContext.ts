import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import { useWriterAssetSummary } from '@/modules/writer/composables/useWriterAssetSummary'
import type {
  WriterAIAssetSummary,
  WriterAISceneStageSummary,
} from '@/modules/writer/utils/writerAIContext'
import type { WriterSceneStageState } from '@/modules/writer/types/sceneStage'
import {
  buildCreativeWorkflowSnapshot,
  buildCreativeWorkflowSummaryLines,
  loadCreativeWorkflow,
  type CreativeWorkflowSnapshot,
} from '@/modules/writer/services/creativeWorkflow.service'
import {
  loadWriterProjectBrief,
  type WriterProjectBrief,
} from '@/modules/writer/services/writerProjectBrief.service'
import {
  loadWriterUserPreferenceMemory,
  type WriterUserPreferenceMemory,
} from '@/modules/writer/services/writerUserPreferenceMemory.service'
import {
  mergeWriterAssetRefs,
  type WriterAssetRef,
} from '@/modules/writer/utils/writerAssetRefs'

type MaybeComputed<T> = Ref<T> | ComputedRef<T>

export function useWriterAISummaryContext(options: {
  projectId: MaybeComputed<string>
  chapterId: MaybeComputed<string>
  chapters: MaybeComputed<SidebarChapterSummary[]>
  sceneStage?: MaybeComputed<WriterSceneStageState | null | undefined>
}) {
  const creativeWorkflowSnapshot = ref<CreativeWorkflowSnapshot | null>(null)
  const writerProjectBrief = ref<WriterProjectBrief | null>(null)
  const writerUserPreference = ref<WriterUserPreferenceMemory | null>(null)
  const loading = ref(false)

  const { assetRefState, currentWriterAssetSummaryItems } = useWriterAssetSummary({
    projectId: options.projectId,
    chapterId: computed(() => options.chapterId.value),
    chapters: computed(() => options.chapters.value),
  })

  watch(
    () => options.projectId.value,
    async (projectId) => {
      if (!projectId) {
        creativeWorkflowSnapshot.value = null
        writerProjectBrief.value = null
        writerUserPreference.value = null
        return
      }

      loading.value = true
      try {
        const [workflow, projectBrief, userPreference] = await Promise.all([
          loadCreativeWorkflow(projectId),
          loadWriterProjectBrief(projectId),
          loadWriterUserPreferenceMemory(),
        ])
        creativeWorkflowSnapshot.value = buildCreativeWorkflowSnapshot(workflow)
        writerProjectBrief.value = projectBrief
        writerUserPreference.value = userPreference
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

  const currentChapter = computed(() =>
    options.chapters.value.find((chapter) => chapter.id === options.chapterId.value),
  )

  const mapAssetRefToSummary = (
    ref: WriterAssetRef,
    scope: WriterAIAssetSummary['scope'],
  ): WriterAIAssetSummary => ({
    scope,
    assetType: ref.assetType,
    assetId: ref.assetId,
    assetName: ref.assetName,
    summary: ref.evidence,
    latestChapterId: ref.scopeType === 'chapter' ? ref.scopeId : undefined,
    referenceCount: 1,
    unresolved: ref.unresolved,
  })

  const aiAssetSummaries = computed<WriterAIAssetSummary[]>(() => {
    const chapterId = options.chapterId.value
    if (!chapterId) return []

    const chapterRefs = assetRefState.value.chapterRefs[chapterId] || []
    const volumeRefs = currentChapter.value?.parentId
      ? assetRefState.value.volumeRefs[currentChapter.value.parentId] || []
      : []
    const mergedRefs = mergeWriterAssetRefs({ chapterRefs, volumeRefs })

    return mergedRefs.map((ref) =>
      mapAssetRefToSummary(ref, ref.scopeType === 'volume' ? 'volume' : 'chapter'),
    )
  })

  const aiSceneStageSummary = computed<WriterAISceneStageSummary | undefined>(() => {
    const sceneStage = options.sceneStage?.value
    if (!sceneStage || sceneStage.isEmpty) return undefined

    return {
      sceneId: sceneStage.sceneId,
      beatId: sceneStage.beatId,
      sceneTitle: sceneStage.sceneTitle,
      beatTitle: sceneStage.beatTitle,
      beatStatus: sceneStage.beatStatus,
      coverageLabel: sceneStage.coverageLabel,
      chapterCount: sceneStage.chapterCount,
      goal: sceneStage.goal,
      conflict: sceneStage.conflict,
      rangeLabel: sceneStage.rangeLabel,
      doneCondition: sceneStage.doneCondition,
      nextBeatTitle: sceneStage.nextBeatTitle,
      locationName: sceneStage.locationName,
      povCharacterName: sceneStage.povCharacterName,
      assetNames: sceneStage.assets
        .map((asset) => asset.assetName)
        .filter((name) => name.trim())
        .slice(0, 8),
    }
  })

  const sceneStageSummaryLine = computed(() => {
    const sceneStage = aiSceneStageSummary.value
    if (!sceneStage) return ''

    const parts = [
      sceneStage.sceneTitle,
      sceneStage.beatTitle ? `当前拍：${sceneStage.beatTitle}` : '',
      sceneStage.coverageLabel ? `覆盖：${sceneStage.coverageLabel}` : '',
      sceneStage.goal ? `目标：${sceneStage.goal}` : '',
      sceneStage.conflict ? `冲突：${sceneStage.conflict}` : '',
      sceneStage.nextBeatTitle ? `下一拍：${sceneStage.nextBeatTitle}` : '',
    ].filter(Boolean)

    return parts.length ? `当前场景舞台：${parts.join('；')}` : ''
  })

  const summaryLines = computed(() => {
    const workflowLines = buildCreativeWorkflowSummaryLines(creativeWorkflowSnapshot.value).slice(0, 5)
    return [...workflowLines, assetSummaryLine.value, sceneStageSummaryLine.value].filter(Boolean)
  })

  const summaryText = computed(() =>
    summaryLines.value.length ? `创作蓝图与资产摘要：\n${summaryLines.value.join('\n')}` : '',
  )

  return {
    loading,
    creativeWorkflowSnapshot,
    writerProjectBrief,
    writerUserPreference,
    currentWriterAssetSummaryItems,
    aiAssetSummaries,
    aiSceneStageSummary,
    aiSummaryContextLines: summaryLines,
    aiSummaryContextText: summaryText,
  }
}
