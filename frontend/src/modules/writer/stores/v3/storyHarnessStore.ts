import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { storyHarnessService } from '@/modules/writer/services/storyHarness.service'

export interface StoryHarnessSessionPayload {
  projectId: string
  chapterId: string
  chapterTitle: string
  content: string
  chapterCount: number
}

export interface StoryHarnessCharacterSummary {
  id: string
  name: string
  traits: string[]
  currentState?: string
}

export interface StoryHarnessRelationSummary {
  id: string
  fromName: string
  toName: string
  type: string
  strength: number
}

export type StoryHarnessChangeRequestSource = 'live' | 'save_batch'

export interface StoryHarnessChangeRequestPreview {
  id: string
  source: StoryHarnessChangeRequestSource
  type: 'scene_scope' | 'relation' | 'state'
  title: string
  summary: string
  reason: string
  evidence?: string
  severity: 'hint' | 'focus'
  sourceTimestamp?: number
}

export type StoryHarnessChangeRequestDecision = 'pending' | 'accepted' | 'ignored' | 'deferred'
export type StoryHarnessResolvedChangeRequestDecision = Exclude<StoryHarnessChangeRequestDecision, 'pending'>

export interface StoryHarnessChangeRequestActivity {
  changeRequestId: string
  decision: StoryHarnessChangeRequestDecision
  timestamp: number
}

export interface StoryHarnessSavedBatchReceipt {
  chapterId: string
  chapterTitle: string
  count: number
  committedAt: number
  batchId?: string
  source?: 'remote' | 'local_fallback'
}

export const useStoryHarnessStore = defineStore('writer-story-harness', () => {
  const projectId = ref('')
  const chapterId = ref('')
  const chapterTitle = ref('')
  const content = ref('')
  const chapterCount = ref(0)
  const activeChangeRequestIds = ref<string[]>([])
  const changeRequestDecisions = ref<Record<string, StoryHarnessChangeRequestDecision>>({})
  const changeRequestActivities = ref<StoryHarnessChangeRequestActivity[]>([])
  const savedBatchChangeRequests = ref<StoryHarnessChangeRequestPreview[]>([])
  const savedBatchReceipt = ref<StoryHarnessSavedBatchReceipt | null>(null)

  const hasActiveChapter = computed(() => Boolean(chapterId.value))
  const draftLength = computed(() => content.value.trim().length)
  const pendingChangeRequestCount = computed(
    () =>
      activeChangeRequestIds.value.filter(
        (changeRequestId) => (changeRequestDecisions.value[changeRequestId] ?? 'pending') === 'pending',
      ).length,
  )
  const acceptedChangeRequestCount = computed(
    () =>
      activeChangeRequestIds.value.filter(
        (changeRequestId) => changeRequestDecisions.value[changeRequestId] === 'accepted',
      ).length,
  )
  const ignoredChangeRequestCount = computed(
    () =>
      activeChangeRequestIds.value.filter(
        (changeRequestId) => changeRequestDecisions.value[changeRequestId] === 'ignored',
      ).length,
  )
  const deferredChangeRequestCount = computed(
    () =>
      activeChangeRequestIds.value.filter(
        (changeRequestId) => changeRequestDecisions.value[changeRequestId] === 'deferred',
      ).length,
  )
  const recentChangeRequestActivities = computed(() => changeRequestActivities.value.slice(0, 3))
  const writingStateLabel = computed(() => {
    if (!hasActiveChapter.value) return '未绑定章节'
    if (draftLength.value === 0) return '待写作'
    if (draftLength.value < 200) return '起笔中'
    return '写作中'
  })
  const chapterProgressLabel = computed(() => {
    if (!hasActiveChapter.value) return '未进入章节'
    return `第 ${chapterCount.value > 0 ? chapterCount.value : 1} 章流转宿主已接入`
  })

  function syncSession(payload: StoryHarnessSessionPayload) {
    const previousChapterId = chapterId.value
    projectId.value = payload.projectId
    chapterId.value = payload.chapterId
    chapterTitle.value = payload.chapterTitle
    content.value = payload.content
    chapterCount.value = payload.chapterCount

    if (previousChapterId && previousChapterId !== payload.chapterId) {
      activeChangeRequestIds.value = []
      changeRequestDecisions.value = {}
      changeRequestActivities.value = []
      savedBatchChangeRequests.value = []
      savedBatchReceipt.value = null
    }
  }

  function syncChangeRequests(changeRequestIds: string[]) {
    activeChangeRequestIds.value = [...changeRequestIds]
    const nextDecisionMap = Object.fromEntries(
      changeRequestIds.map((changeRequestId) => [
        changeRequestId,
        changeRequestDecisions.value[changeRequestId] ?? 'pending',
      ]),
    ) as Record<string, StoryHarnessChangeRequestDecision>
    changeRequestDecisions.value = nextDecisionMap
    changeRequestActivities.value = changeRequestActivities.value.filter((activity) =>
      changeRequestIds.includes(activity.changeRequestId),
    )
  }

  function getChangeRequestDecision(changeRequestId: string): StoryHarnessChangeRequestDecision {
    return changeRequestDecisions.value[changeRequestId] ?? 'pending'
  }

  function commitSavedBatch(changeRequests: StoryHarnessChangeRequestPreview[]) {
    const committedAt = Date.now()
    savedBatchChangeRequests.value = changeRequests.map((changeRequest, index) => ({
      ...changeRequest,
      id: `save-batch:${chapterId.value || 'chapter'}:${index}:${changeRequest.id}`,
      source: 'save_batch',
      sourceTimestamp: committedAt,
    }))
    savedBatchReceipt.value = {
      chapterId: chapterId.value,
      chapterTitle: chapterTitle.value,
      count: changeRequests.length,
      committedAt,
    }
  }

  function clearSavedBatch() {
    savedBatchChangeRequests.value = []
    savedBatchReceipt.value = null
  }

  async function hydrateSavedBatch(projectIdValue: string, chapterIdValue: string) {
    if (!projectIdValue || !chapterIdValue) {
      clearSavedBatch()
      return
    }

    const persistedBatch = await storyHarnessService.getLatestBatch(projectIdValue, chapterIdValue)
    if (!persistedBatch) {
      clearSavedBatch()
      return
    }

    savedBatchChangeRequests.value = persistedBatch.changeRequests
    savedBatchReceipt.value = persistedBatch.receipt
  }

  async function persistSavedBatch(
    projectIdValue: string,
    chapterIdValue: string,
    chapterTitleValue: string,
    changeRequests: StoryHarnessChangeRequestPreview[],
  ) {
    const persistedBatch = await storyHarnessService.persistBatch({
      projectId: projectIdValue,
      chapterId: chapterIdValue,
      chapterTitle: chapterTitleValue,
      changeRequests,
    })

    savedBatchChangeRequests.value = persistedBatch.changeRequests
    savedBatchReceipt.value = persistedBatch.receipt
  }

  function setChangeRequestDecision(
    changeRequestId: string,
    decision: StoryHarnessChangeRequestDecision,
  ) {
    if (!activeChangeRequestIds.value.includes(changeRequestId)) {
      return
    }

    const previousDecision = getChangeRequestDecision(changeRequestId)
    if (previousDecision === decision) {
      return
    }

    changeRequestDecisions.value = {
      ...changeRequestDecisions.value,
      [changeRequestId]: decision,
    }
    changeRequestActivities.value = [
      {
        changeRequestId,
        decision,
        timestamp: Date.now(),
      },
      ...changeRequestActivities.value.filter((activity) => activity.changeRequestId !== changeRequestId),
    ].slice(0, 8)
  }

  return {
    projectId,
    chapterId,
    chapterTitle,
    content,
    chapterCount,
    activeChangeRequestIds,
    changeRequestDecisions,
    changeRequestActivities,
    savedBatchChangeRequests,
    savedBatchReceipt,
    pendingChangeRequestCount,
    acceptedChangeRequestCount,
    ignoredChangeRequestCount,
    deferredChangeRequestCount,
    recentChangeRequestActivities,
    hasActiveChapter,
    draftLength,
    writingStateLabel,
    chapterProgressLabel,
    syncSession,
    syncChangeRequests,
    getChangeRequestDecision,
    commitSavedBatch,
    clearSavedBatch,
    hydrateSavedBatch,
    persistSavedBatch,
    setChangeRequestDecision,
  }
})
