import { computed, ref, type ComputedRef } from 'vue'
import { message } from '@/design-system/services'
import {
  extractAssetsWithWorkbench,
  type WorkbenchExtractedAssetCandidate,
} from '@/modules/ai/api/workbench'
import { useToolRightAssetActions } from '@/modules/writer/composables/useToolRightAssetActions'
import {
  useWriterAssetCatalog,
  type WriterAssetScopeView,
} from '@/modules/writer/composables/useWriterAssetCatalog'
import type { EncyclopediaCategory, SidebarChapterSummary } from '@/modules/writer/composables/types'
import {
  createWriterAssetRefKey,
  replaceScopeAssetRefs,
  type WriterAssetCandidate,
  type WriterAssetType,
} from '@/modules/writer/utils/writerAssetRefs'
import { resolveWriterAIErrorState } from '@/modules/writer/utils/writerAIError'

interface UseToolRightAssetsOptions {
  projectId: ComputedRef<string>
  chapterId: ComputedRef<string>
  chapterTitle: ComputedRef<string>
  sourceText: ComputedRef<string>
  chapters: ComputedRef<SidebarChapterSummary[]>
}

interface ExtractedAssetCandidateState extends WorkbenchExtractedAssetCandidate {
  id: string
  writerCategory: EncyclopediaCategory
  selected: boolean
  status: 'pending' | 'creating' | 'created' | 'exists' | 'ignored' | 'error'
  errorMessage?: string
}

const extractedTypeToCategory: Record<WorkbenchExtractedAssetCandidate['category'], EncyclopediaCategory> = {
  character: 'characters',
  location: 'locations',
  item: 'items',
  organization: 'organizations',
  concept: 'concepts',
}

const categoryToAssetType: Record<EncyclopediaCategory, WriterAssetType> = {
  characters: 'character',
  locations: 'location',
  items: 'item',
  organizations: 'organization',
  concepts: 'concept',
}

const categoryLabelMap: Record<EncyclopediaCategory, string> = {
  characters: '角色',
  locations: '地点',
  items: '物件',
  organizations: '组织',
  concepts: '概念',
}

const normalizeAssetName = (value: string) => value.trim().toLocaleLowerCase()

const isEditableExtractedAssetCandidate = (candidate: ExtractedAssetCandidateState) =>
  candidate.status === 'pending' || candidate.status === 'error'

const createExtractedAssetDuplicateKey = (
  category: EncyclopediaCategory,
  name: string,
) => `${categoryToAssetType[category]}:${normalizeAssetName(name)}`

const syncExtractedAssetCandidateValidation = (
  candidates: ExtractedAssetCandidateState[],
  existingAssetKeys: Set<string>,
): ExtractedAssetCandidateState[] => {
  const editableDuplicateCountMap = new Map<string, number>()

  for (const candidate of candidates) {
    if (!isEditableExtractedAssetCandidate(candidate)) {
      continue
    }
    const trimmedName = candidate.name.trim()
    if (!trimmedName) {
      continue
    }
    const duplicateKey = createExtractedAssetDuplicateKey(candidate.writerCategory, trimmedName)
    editableDuplicateCountMap.set(duplicateKey, (editableDuplicateCountMap.get(duplicateKey) || 0) + 1)
  }

  return candidates.map((candidate) => {
    if (!isEditableExtractedAssetCandidate(candidate)) {
      return candidate
    }

    const trimmedName = candidate.name.trim()
    if (!trimmedName) {
      return {
        ...candidate,
        status: 'error' as const,
        errorMessage: '资产名称不能为空',
      }
    }

    const duplicateKey = createExtractedAssetDuplicateKey(candidate.writerCategory, trimmedName)
    if (existingAssetKeys.has(duplicateKey)) {
      return {
        ...candidate,
        status: 'error' as const,
        errorMessage: '已存在同名资产',
      }
    }

    if ((editableDuplicateCountMap.get(duplicateKey) || 0) > 1) {
      return {
        ...candidate,
        status: 'error' as const,
        errorMessage: '候选列表中已有同名资产',
      }
    }

    return {
      ...candidate,
      status: 'pending' as const,
      errorMessage: undefined,
    }
  })
}

export const useToolRightAssets = ({
  projectId,
  chapterId,
  chapterTitle,
  sourceText,
  chapters,
}: UseToolRightAssetsOptions) => {
  const searchKeyword = ref('')
  const assetCategory = ref<EncyclopediaCategory>('characters')
  const assetScopeView = ref<WriterAssetScopeView>('global')
  const isExtractingAssets = ref(false)
  const isCreatingExtractedAssets = ref(false)
  const extractedAssetSummary = ref('')
  const extractedAssetError = ref('')
  const extractedAssetCandidates = ref<ExtractedAssetCandidateState[]>([])
  const currentVolumeId = computed(
    () => chapters.value.find((chapter) => chapter.id === chapterId.value)?.parentId,
  )

  const catalog = useWriterAssetCatalog({
    projectId,
    chapters,
    activeCategory: assetCategory,
    searchKeyword,
    scopeView: assetScopeView,
    chapterId,
    volumeId: currentVolumeId,
  })

  const actions = useToolRightAssetActions({
    assetCategory,
    filteredAssets: catalog.filteredAssets,
    selectedAsset: catalog.selectedAsset,
    selectAsset: catalog.selectAsset,
    createAsset: catalog.createAsset,
    updateAsset: catalog.updateAsset,
    deleteAsset: catalog.deleteAsset,
    buildGraphFocusTarget: catalog.buildGraphFocusTarget,
    assetScopeView,
  })

  const handleAssetCategoryChange = (category: EncyclopediaCategory) => {
    assetCategory.value = category
  }

  const handleAssetScopeViewChange = (scopeView: WriterAssetScopeView) => {
    assetScopeView.value = scopeView
    catalog.selectAsset(null)
  }

  const handleAssetSearchKeywordChange = (value: string) => {
    searchKeyword.value = value
  }

  const canExtractAssets = computed(
    () => Boolean(projectId.value && chapterId.value && sourceText.value.trim()),
  )

  const selectableExtractedAssetCandidates = computed(() =>
    extractedAssetCandidates.value.filter((candidate) => candidate.status === 'pending'),
  )

  const selectedExtractedAssetCount = computed(
    () => selectableExtractedAssetCandidates.value.filter((candidate) => candidate.selected).length,
  )

  const canCreateSelectedExtractedAssets = computed(
    () =>
      !isCreatingExtractedAssets.value &&
      selectedExtractedAssetCount.value > 0 &&
      Boolean(projectId.value && chapterId.value),
  )

  const existingGlobalAssetKeySet = computed(() => {
    const keys = new Set<string>()
    for (const asset of catalog.globalAssets.value) {
      const assetType = categoryToAssetType[asset.category]
      keys.add(`${assetType}:${normalizeAssetName(asset.name)}`)
    }
    return keys
  })

  const toAssetMutationInput = (candidate: ExtractedAssetCandidateState) => ({
    category: candidate.writerCategory,
    name: candidate.name.trim(),
    summary: candidate.summary?.trim(),
    alias: candidate.alias,
  })

  const toWriterAssetCandidate = (
    candidate: ExtractedAssetCandidateState,
    assetId?: string,
  ): WriterAssetCandidate => {
    const assetType = categoryToAssetType[candidate.writerCategory]
    return {
      key: createWriterAssetRefKey(assetType, assetId, candidate.name),
      assetType,
      assetId,
      assetName: candidate.name,
      source: 'manual',
      evidence: candidate.evidence,
    }
  }

  const handleExtractAssets = async () => {
    if (!canExtractAssets.value) {
      extractedAssetError.value = '请先打开带正文内容的章节，再执行 AI 提取。'
      return
    }

    isExtractingAssets.value = true
    extractedAssetError.value = ''

    try {
      const result = await extractAssetsWithWorkbench({
        content: sourceText.value,
        projectId: projectId.value,
        chapterId: chapterId.value,
        chapterTitle: chapterTitle.value,
        existingAssets: catalog.globalAssets.value.map((asset) => ({
          scope: 'global',
          assetName: asset.name,
          assetType: categoryToAssetType[asset.category],
          referenceCount: asset.totalReferenceCount,
        })),
      })

      extractedAssetSummary.value = result.summary
      extractedAssetCandidates.value = syncExtractedAssetCandidateValidation(
        result.candidates.map((candidate, index) => {
          const writerCategory = extractedTypeToCategory[candidate.category]
          const exists = existingGlobalAssetKeySet.value.has(
            `${candidate.category}:${normalizeAssetName(candidate.name)}`,
          )

          return {
            ...candidate,
            id: `extract-${index}-${candidate.category}-${candidate.name}`,
            writerCategory,
            selected: !exists,
            status: exists ? 'exists' : 'pending',
          }
        }),
        existingGlobalAssetKeySet.value,
      )
    } catch (error) {
      extractedAssetCandidates.value = []
      extractedAssetSummary.value = ''
      extractedAssetError.value =
        resolveWriterAIErrorState(error).message || 'AI 资产提取失败，请稍后重试。'
    } finally {
      isExtractingAssets.value = false
    }
  }

  const handleToggleExtractedAsset = (candidateId: string, selected: boolean) => {
    extractedAssetCandidates.value = extractedAssetCandidates.value.map((candidate) =>
      candidate.id === candidateId && candidate.status === 'pending'
        ? { ...candidate, selected }
        : candidate,
    )
  }

  const handleUpdateExtractedAssetField = (
    candidateId: string,
    field: 'name' | 'summary' | 'writerCategory',
    value: string,
  ) => {
    extractedAssetCandidates.value = syncExtractedAssetCandidateValidation(
      extractedAssetCandidates.value.map((candidate) => {
        if (candidate.id !== candidateId) {
          return candidate
        }
        if (!isEditableExtractedAssetCandidate(candidate)) {
          return candidate
        }
        if (field === 'writerCategory') {
          return {
            ...candidate,
            writerCategory: value as EncyclopediaCategory,
          }
        }
        return {
          ...candidate,
          [field]: value,
        }
      }),
      existingGlobalAssetKeySet.value,
    )
  }

  const handleDismissExtractedAsset = (candidateId: string) => {
    extractedAssetCandidates.value = extractedAssetCandidates.value.map((candidate) =>
      candidate.id === candidateId && (candidate.status === 'pending' || candidate.status === 'error')
        ? { ...candidate, selected: false, status: 'ignored', errorMessage: undefined }
        : candidate,
    )
  }

  const handleCreateSelectedExtractedAssets = async () => {
    if (!canCreateSelectedExtractedAssets.value) {
      return
    }

    extractedAssetCandidates.value = syncExtractedAssetCandidateValidation(
      extractedAssetCandidates.value,
      existingGlobalAssetKeySet.value,
    )

    const selectedCandidates = extractedAssetCandidates.value.filter(
      (candidate) => candidate.status === 'pending' && candidate.selected,
    )
    if (selectedCandidates.length === 0) {
      return
    }

    isCreatingExtractedAssets.value = true
    const createdRefs: WriterAssetCandidate[] = []

    try {
      for (const selectedCandidate of selectedCandidates) {
        const trimmedName = selectedCandidate.name.trim()
        if (!trimmedName) {
          extractedAssetCandidates.value = extractedAssetCandidates.value.map((candidate) =>
            candidate.id === selectedCandidate.id
              ? {
                  ...candidate,
                  status: 'error',
                  errorMessage: '资产名称不能为空',
                }
              : candidate,
          )
          continue
        }

        const nextAssetType = categoryToAssetType[selectedCandidate.writerCategory]
        const duplicateKey = `${nextAssetType}:${normalizeAssetName(trimmedName)}`
        if (existingGlobalAssetKeySet.value.has(duplicateKey)) {
          extractedAssetCandidates.value = extractedAssetCandidates.value.map((candidate) =>
            candidate.id === selectedCandidate.id
              ? {
                  ...candidate,
                  name: trimmedName,
                  selected: false,
                  status: 'exists',
                  errorMessage: undefined,
                }
              : candidate,
          )
          continue
        }

        extractedAssetCandidates.value = extractedAssetCandidates.value.map((candidate) =>
          candidate.id === selectedCandidate.id
            ? { ...candidate, status: 'creating', errorMessage: undefined }
            : candidate,
        )

        try {
          const createdAsset = await catalog.createAsset(toAssetMutationInput(selectedCandidate))
          const createdAssetId = createdAsset?.id || undefined
          createdRefs.push(toWriterAssetCandidate(selectedCandidate, createdAssetId))

          extractedAssetCandidates.value = extractedAssetCandidates.value.map((candidate) =>
            candidate.id === selectedCandidate.id
              ? { ...candidate, selected: false, status: 'created', errorMessage: undefined }
              : candidate,
          )
        } catch (error) {
          extractedAssetCandidates.value = extractedAssetCandidates.value.map((candidate) =>
            candidate.id === selectedCandidate.id
              ? {
                  ...candidate,
                  status: 'error',
                  errorMessage: (error as Error).message || '创建失败',
                }
              : candidate,
          )
        }
      }

      if (createdRefs.length > 0) {
        replaceScopeAssetRefs({
          projectId: projectId.value,
          scopeType: 'chapter',
          scopeId: chapterId.value,
          candidates: createdRefs,
        })
        message.success(`已创建 ${createdRefs.length} 个资产`)
      }

      if (createdRefs.length < selectedCandidates.length) {
        message.error('部分资产创建失败，请检查候选列表后重试')
      }
    } finally {
      isCreatingExtractedAssets.value = false
    }
  }

  const assetListPanelProps = computed(() => ({
    loading: catalog.loading.value,
    searchKeyword: searchKeyword.value,
    activeCategory: assetCategory.value,
    categoryOptions: catalog.categoryOptions.value,
    emptyMessage: catalog.emptyMessage.value,
    assets: catalog.filteredAssets.value,
    selectedAssetId: catalog.selectedAsset.value?.id,
    scopeView: assetScopeView.value,
    canExtractAssets: canExtractAssets.value,
    isExtractingAssets: isExtractingAssets.value,
    isCreatingExtractedAssets: isCreatingExtractedAssets.value,
    extractedAssetSummary: extractedAssetSummary.value,
    extractedAssetError: extractedAssetError.value,
    selectedExtractedAssetCount: selectedExtractedAssetCount.value,
      extractedCandidates: extractedAssetCandidates.value.map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        category: candidate.writerCategory,
        categoryLabel: categoryLabelMap[candidate.writerCategory],
        summary: candidate.summary,
        evidence: candidate.evidence,
        selected: candidate.selected,
        status: candidate.status,
        errorMessage: candidate.errorMessage,
    })),
  }))

  const assetDetailPanelProps = computed(() => ({
    asset: catalog.selectedAsset.value,
    detailFields: catalog.selectedDetailFields.value,
    stateFields: catalog.selectedStateFields.value,
    dataHint: catalog.selectedDataHint.value,
  }))

  return {
    searchKeyword,
    assetCategory,
    assetScopeView,
    handleAssetCategoryChange,
    handleAssetScopeViewChange,
    handleAssetSearchKeywordChange,
    handleExtractAssets,
    handleToggleExtractedAsset,
    handleUpdateExtractedAssetField,
    handleDismissExtractedAsset,
    handleCreateSelectedExtractedAssets,
    assetListPanelProps,
    assetDetailPanelProps,
    ...catalog,
    ...actions,
  }
}
