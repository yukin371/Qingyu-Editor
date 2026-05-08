import { computed, ref, watch, type ComputedRef } from 'vue'
import type { Document } from '@/modules/writer/types/document'
import {
  useStoryHarnessStore,
  type StoryHarnessChangeRequestDecision,
  type StoryHarnessCharacterSummary,
  type StoryHarnessChangeRequestPreview,
  type StoryHarnessRelationSummary,
} from '@/modules/writer/stores/v3/storyHarnessStore'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import { buildStoryHarnessSuggestions } from '@/modules/writer/utils/v3/storyHarnessSuggestions'
import { storyHarnessService } from '@/modules/writer/services/storyHarness.service'
import type {
  BackendChangeRequestDTO,
  BackendChapterContextResponse,
} from '@/modules/writer/api/story-harness'
import type { OutlineNode } from '@/types/writer'

type OutlineScopeNode = OutlineNode & {
  characters?: string[]
  children?: OutlineScopeNode[]
}

export interface UseStoryHarnessWorkspaceOptions {
  projectId: ComputedRef<string>
  displayChapterId: ComputedRef<string>
  displayChapterTitle: ComputedRef<string>
  currentChapterPlainText: ComputedRef<string>
  availableDocMap: ComputedRef<Map<string, Document>>
}

export interface UseStoryHarnessWorkspaceReturn {
  currentScopeLabel: ComputedRef<string>
  activeScopeCharacters: ComputedRef<StoryHarnessCharacterSummary[]>
  activeScopeRelations: ComputedRef<StoryHarnessRelationSummary[]>
  storyHarnessLiveChangeRequests: ComputedRef<StoryHarnessChangeRequestPreview[]>
  storyHarnessChangeRequests: ComputedRef<StoryHarnessChangeRequestPreview[]>
  persistCurrentLiveChangeRequests: () => Promise<void>
  loadBackendContext: () => Promise<BackendChapterContextResponse | null>
  loadBackendChangeRequests: (status?: string) => Promise<BackendChangeRequestDTO[]>
  handleChangeRequestDecision: (
    requestId: string,
    decision: StoryHarnessChangeRequestDecision,
  ) => Promise<boolean>
  triggerIndexAndRefresh: () => Promise<{
    batchId: string
    generated: number
    pending: number
    deduplicated: number
    source: string
  } | null>
  refreshAfterSave: () => Promise<void>
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })

const buildStoryHarnessChangeRequestSignature = (
  changeRequest: Pick<StoryHarnessChangeRequestPreview, 'type' | 'title'>,
) => `${changeRequest.type}::${changeRequest.title}`

const getChangeRequestPriority = (changeRequest: StoryHarnessChangeRequestPreview) => {
  const sourcePriority = changeRequest.source === 'save_batch' ? 0 : 1
  const directivePriority =
    changeRequest.title.includes('正文指令建议') || changeRequest.evidence?.trim().startsWith('// @')
      ? 0
      : 1
  const severityPriority = changeRequest.severity === 'focus' ? 0 : 1
  const typePriority =
    changeRequest.type === 'state' ? 0 : changeRequest.type === 'relation' ? 1 : 2
  const recencyPriority = -(changeRequest.sourceTimestamp ?? 0)

  return [sourcePriority, directivePriority, severityPriority, typePriority, recencyPriority]
}

const sortStoryHarnessChangeRequests = (
  changeRequests: StoryHarnessChangeRequestPreview[],
): StoryHarnessChangeRequestPreview[] =>
  [...changeRequests].sort((left, right) => {
    const leftPriority = getChangeRequestPriority(left)
    const rightPriority = getChangeRequestPriority(right)

    for (let index = 0; index < leftPriority.length; index += 1) {
      const delta = leftPriority[index] - rightPriority[index]
      if (delta !== 0) {
        return delta
      }
    }

    return left.title.localeCompare(right.title, 'zh-CN')
  })

const findOutlineNodeByDocumentId = (
  nodes: OutlineScopeNode[],
  documentId: string,
): OutlineScopeNode | null => {
  for (const node of nodes) {
    if (node.documentId === documentId || node.id === documentId) {
      return node
    }

    if (node.children?.length) {
      const matchedChild = findOutlineNodeByDocumentId(node.children, documentId)
      if (matchedChild) {
        return matchedChild
      }
    }
  }

  return null
}

const mapBackendCategoryToType = (
  category: string | undefined,
): StoryHarnessChangeRequestPreview['type'] => {
  const normalizedCategory = (category ?? '').toLowerCase()

  if (normalizedCategory.includes('relation')) {
    return 'relation'
  }

  if (normalizedCategory.includes('scene') || normalizedCategory.includes('scope')) {
    return 'scene_scope'
  }

  return 'state'
}

const mapBackendPriorityToSeverity = (
  priority: string | undefined,
): StoryHarnessChangeRequestPreview['severity'] => {
  const normalizedPriority = (priority ?? '').toLowerCase()
  return ['p0', 'critical', 'high', 'urgent'].includes(normalizedPriority) ? 'focus' : 'hint'
}

const buildBackendEvidenceText = (
  evidence: BackendChangeRequestDTO['evidence'],
): string | undefined => {
  if (!Array.isArray(evidence) || evidence.length === 0) {
    return undefined
  }

  return evidence
    .map((item) => item.quoteText?.trim())
    .filter((item): item is string => Boolean(item))
    .slice(0, 2)
    .join('\n')
}

const buildBackendReasonText = (
  changeRequest: BackendChangeRequestDTO,
  evidenceText?: string,
): string => {
  if (evidenceText) {
    return '后端索引器已根据正文证据生成正式建议。'
  }

  return changeRequest.description?.trim() || '后端索引器已生成正式建议。'
}

const mapBackendChangeRequestToPreview = (
  changeRequest: BackendChangeRequestDTO,
): StoryHarnessChangeRequestPreview => {
  const evidenceText = buildBackendEvidenceText(changeRequest.evidence)
  const createdAt = changeRequest.createdAt ? Date.parse(changeRequest.createdAt) : Number.NaN

  return {
    id: changeRequest.id,
    source: 'save_batch',
    type: mapBackendCategoryToType(changeRequest.category),
    title: changeRequest.title,
    summary: changeRequest.description?.trim() || '后端已生成正式变更建议。',
    reason: buildBackendReasonText(changeRequest, evidenceText),
    evidence: evidenceText,
    severity: mapBackendPriorityToSeverity(changeRequest.priority),
    sourceTimestamp: Number.isFinite(createdAt) ? createdAt : Date.now(),
  }
}

export function useStoryHarnessWorkspace(
  options: UseStoryHarnessWorkspaceOptions,
): UseStoryHarnessWorkspaceReturn {
  const { projectId, displayChapterId, displayChapterTitle, currentChapterPlainText, availableDocMap } =
    options
  const writerStore = useWriterStore()
  const storyHarnessStore = useStoryHarnessStore()
  const backendContext = ref<BackendChapterContextResponse | null>(null)
  const backendChangeRequests = ref<BackendChangeRequestDTO[]>([])

  const currentScopeNode = computed<OutlineScopeNode | null>(() => {
    const currentNode = writerStore.outline.currentNode as OutlineScopeNode | null
    const chapterId = displayChapterId.value

    if (currentNode && (!chapterId || currentNode.documentId === chapterId || currentNode.id === chapterId)) {
      return currentNode
    }

    if (!chapterId) {
      return null
    }

    return findOutlineNodeByDocumentId(writerStore.outline.tree as OutlineScopeNode[], chapterId)
  })

  const activeScopeCharacterIds = computed<string[]>(() => {
    const scopedIds = currentScopeNode.value?.characters ?? []
    const documentCharacterIds = availableDocMap.value.get(displayChapterId.value)?.characterIds ?? []
    return Array.from(new Set([...scopedIds, ...documentCharacterIds].filter(Boolean)))
  })

  const activeScopeCharacters = computed<StoryHarnessCharacterSummary[]>(() => {
    const scopedIdSet = new Set(activeScopeCharacterIds.value)

    if (backendContext.value?.characters?.length) {
      const scopedBackendCharacters = scopedIdSet.size
        ? backendContext.value.characters.filter((character) => scopedIdSet.has(character.id))
        : backendContext.value.characters
      const backendCharacters =
        scopedBackendCharacters.length > 0 ? scopedBackendCharacters : backendContext.value.characters

      if (backendCharacters.length > 0) {
        return backendCharacters.map((character) => ({
          id: character.id,
          name: character.name,
          traits: character.traits ?? [],
          currentState: character.currentState,
        }))
      }
    }

    if (scopedIdSet.size === 0) {
      return []
    }

    return writerStore.characters.list
      .filter((character) => scopedIdSet.has(character.id))
      .map((character) => ({
        id: character.id,
        name: character.name,
        traits: character.traits ?? [],
        currentState: character.currentState,
      }))
  })

  const activeScopeRelations = computed<StoryHarnessRelationSummary[]>(() => {
    const scopedIdSet = new Set(activeScopeCharacterIds.value)

    if (backendContext.value?.relations?.length) {
      const scopedBackendRelations = scopedIdSet.size >= 2
        ? backendContext.value.relations.filter(
            (relation) => scopedIdSet.has(relation.fromId) && scopedIdSet.has(relation.toId),
          )
        : backendContext.value.relations
      const backendRelations =
        scopedBackendRelations.length > 0 ? scopedBackendRelations : backendContext.value.relations

      if (backendRelations.length > 0) {
        return backendRelations.map((relation) => ({
          id: relation.id,
          fromName: relation.fromName,
          toName: relation.toName,
          type: relation.type,
          strength: relation.strength,
        }))
      }
    }

    if (scopedIdSet.size < 2) {
      return []
    }

    const characterNameMap = new Map(
      writerStore.characters.list.map((character) => [character.id, character.name]),
    )

    return writerStore.characters.relations
      .filter((relation) => scopedIdSet.has(relation.fromId) && scopedIdSet.has(relation.toId))
      .map((relation) => ({
        id: relation.id,
        fromName: characterNameMap.get(relation.fromId) || '未命名角色',
        toName: characterNameMap.get(relation.toId) || '未命名角色',
        type: relation.type,
        strength: relation.strength,
      }))
  })

  const currentScopeLabel = computed(() => {
    if (currentScopeNode.value?.title) {
      return currentScopeNode.value.title
    }

    if (displayChapterTitle.value) {
      return `${displayChapterTitle.value} / 当前章节`
    }

    return '未声明场景作用域'
  })

  const storyHarnessLiveChangeRequests = computed<StoryHarnessChangeRequestPreview[]>(() =>
    buildStoryHarnessSuggestions({
      chapterTitle: displayChapterTitle.value,
      content: currentChapterPlainText.value,
      activeCharacters: activeScopeCharacters.value,
      activeRelations: activeScopeRelations.value,
      allCharacters: writerStore.characters.list.map((character) => ({
        id: character.id,
        name: character.name,
      })),
    }),
  )

  const backendPersistedChangeRequests = computed<StoryHarnessChangeRequestPreview[]>(() =>
    backendChangeRequests.value.map(mapBackendChangeRequestToPreview),
  )

  const storyHarnessChangeRequests = computed<StoryHarnessChangeRequestPreview[]>(() => {
    const savedBatchChangeRequests = storyHarnessStore.savedBatchChangeRequests
    const backendSignatureSet = new Set(
      backendPersistedChangeRequests.value.map((changeRequest) =>
        buildStoryHarnessChangeRequestSignature(changeRequest),
      ),
    )
    const mergedFormalChangeRequests = [
      ...backendPersistedChangeRequests.value,
      ...savedBatchChangeRequests.filter(
        (changeRequest) =>
          !backendSignatureSet.has(buildStoryHarnessChangeRequestSignature(changeRequest)),
      ),
    ]
    const formalSignatureSet = new Set(
      mergedFormalChangeRequests.map((changeRequest) =>
        buildStoryHarnessChangeRequestSignature(changeRequest),
      ),
    )

    return sortStoryHarnessChangeRequests([
      ...mergedFormalChangeRequests,
      ...storyHarnessLiveChangeRequests.value.filter(
        (changeRequest) =>
          !formalSignatureSet.has(buildStoryHarnessChangeRequestSignature(changeRequest)),
      ),
    ])
  })

  const backendChangeRequestIdSet = computed(
    () => new Set(backendChangeRequests.value.map((changeRequest) => changeRequest.id)),
  )

  const persistCurrentLiveChangeRequests = async () => {
    await storyHarnessStore.persistSavedBatch(
      projectId.value,
      displayChapterId.value,
      displayChapterTitle.value,
      storyHarnessLiveChangeRequests.value,
    )
  }

  const loadBackendContext = async () => {
    if (!projectId.value || !displayChapterId.value) {
      backendContext.value = null
      return null
    }

    const context = await storyHarnessService.fetchChapterContext(projectId.value, displayChapterId.value)
    backendContext.value = context
    return context
  }

  const loadBackendChangeRequests = async (status = 'pending') => {
    if (!projectId.value || !displayChapterId.value) {
      backendChangeRequests.value = []
      return []
    }

    const changeRequests = await storyHarnessService.fetchChangeRequests(
      projectId.value,
      displayChapterId.value,
      status,
    )

    if (status === 'pending') {
      backendChangeRequests.value = changeRequests
    }

    return changeRequests
  }

  const reloadBackendState = async () => {
    await Promise.all([loadBackendContext(), loadBackendChangeRequests()])
  }

  watch(
    () => [projectId.value, displayChapterId.value] as const,
    ([nextProjectId, nextChapterId]) => {
      if (!nextProjectId || !nextChapterId) {
        backendContext.value = null
        backendChangeRequests.value = []
        return
      }

      void reloadBackendState()
    },
    { immediate: true },
  )

  const handleChangeRequestDecision = async (
    requestId: string,
    decision: StoryHarnessChangeRequestDecision,
  ) => {
    if (decision === 'pending') {
      storyHarnessStore.setChangeRequestDecision(requestId, decision)
      return true
    }

    const isBackendChangeRequest = backendChangeRequestIdSet.value.has(requestId)
    if (!isBackendChangeRequest) {
      storyHarnessStore.setChangeRequestDecision(requestId, decision)
      return true
    }

    const success = await storyHarnessService.processChangeRequest(requestId, decision)
    if (!success) {
      if (import.meta.env.DEV) {
        console.warn('[useStoryHarnessWorkspace] failed to sync CR decision to backend')
      }
      return false
    }

    storyHarnessStore.setChangeRequestDecision(requestId, decision)
    await loadBackendChangeRequests()

    if (decision === 'accepted') {
      const context = await loadBackendContext()
      if (!context) {
        await storyHarnessService.rebuildProjection(projectId.value, displayChapterId.value)
        await loadBackendContext()
      }
    }

    return true
  }

  const triggerIndexAndRefresh = async () => {
    if (!projectId.value || !displayChapterId.value) return null
    const result = await storyHarnessService.triggerIndex(projectId.value, displayChapterId.value)
    if (result) {
      await Promise.all([loadBackendChangeRequests(), loadBackendContext()])
    }
    return result
  }

  const refreshAfterSave = async () => {
    if (!projectId.value || !displayChapterId.value) {
      return
    }

    for (let attempt = 0; attempt < 2; attempt += 1) {
      await wait(800)
      const refreshedChangeRequests = await loadBackendChangeRequests()

      if (refreshedChangeRequests.length > 0) {
        await loadBackendContext()
        return
      }
    }

    await triggerIndexAndRefresh()
    await loadBackendContext()
  }

  return {
    currentScopeLabel,
    activeScopeCharacters,
    activeScopeRelations,
    storyHarnessLiveChangeRequests,
    storyHarnessChangeRequests,
    persistCurrentLiveChangeRequests,
    loadBackendContext,
    loadBackendChangeRequests,
    handleChangeRequestDecision,
    triggerIndexAndRefresh,
    refreshAfterSave,
  }
}
