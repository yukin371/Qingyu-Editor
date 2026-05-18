import { computed, ref, watch, type ComputedRef } from 'vue'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import { useWriterAssetRefState } from '@/modules/writer/composables/useWriterAssetRefState'
import type { WriterWorkflowContext } from '@/modules/writer/types/workflow'
import type { StoryHarnessChangeRequestPreview } from '@/modules/writer/stores/v3/storyHarnessStore'
import {
  type WriterSceneStageAsset,
  type WriterSceneStageCoverageOption,
  type WriterSceneStageDraft,
  type WriterSceneStageState,
} from '@/modules/writer/types/sceneStage'
import {
  createWriterAssetRefKey,
  mergeWriterAssetRefs,
  type WriterAssetRef,
} from '@/modules/writer/utils/writerAssetRefs'

const LEGACY_STORAGE_KEY = 'qingyu_editor_scene_stage_drafts_v1'
const STORAGE_KEY = 'qingyu_editor_scene_stage_sidecars_v2'
const MAX_COVERAGE_OPTION_COUNT = 12

interface UseWriterSceneStageOptions {
  projectId: ComputedRef<string>
  chapterId: ComputedRef<string>
  chapterTitle: ComputedRef<string>
  scopeLabel: ComputedRef<string | undefined>
  workflowContext: ComputedRef<WriterWorkflowContext>
  activeEntities: ComputedRef<unknown[]>
  changeRequests: ComputedRef<StoryHarnessChangeRequestPreview[]>
  chapters?: ComputedRef<SidebarChapterSummary[]>
}

interface ProjectSceneStageSidecar {
  activeSceneId: string
  scenes: Record<string, WriterSceneStageDraft>
  archivedSceneIds?: string[]
}

function cleanLabel(value: string | undefined | null): string {
  return String(value || '').trim()
}

function getSceneStageStorage(): Storage | null {
  return typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage
}

function createStageId(prefix: 'scene' | 'beat'): string {
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `${prefix}-${Date.now().toString(36)}-${randomPart}`
}

function uniqueCleanIds(ids: Array<string | undefined | null>): string[] {
  return Array.from(new Set(ids.map((id) => cleanLabel(id)).filter(Boolean)))
}

function toPositiveInteger(value: unknown): number | undefined {
  const numeric = Number(value)
  return Number.isInteger(numeric) && numeric > 0 ? numeric : undefined
}

function sanitizeDraft(draft: WriterSceneStageDraft | undefined): WriterSceneStageDraft {
  const legacyNextBeat = cleanLabel(draft?.nextBeat)
  const nextBeatTitle = cleanLabel(draft?.nextBeatTitle) || legacyNextBeat
  const beatStatus =
    draft?.beatStatus === 'planned' || draft?.beatStatus === 'done' ? draft.beatStatus : 'active'

  return {
    sceneId: cleanLabel(draft?.sceneId),
    beatId: cleanLabel(draft?.beatId),
    chapterIds: uniqueCleanIds(draft?.chapterIds || []),
    coverageChapterCount: toPositiveInteger(draft?.coverageChapterCount),
    sceneTitle: cleanLabel(draft?.sceneTitle),
    manualSceneTitle: Boolean(draft?.manualSceneTitle),
    beatTitle: cleanLabel(draft?.beatTitle),
    goal: cleanLabel(draft?.goal),
    conflict: cleanLabel(draft?.conflict),
    rangeLabel: cleanLabel(draft?.rangeLabel),
    beatStatus,
    doneCondition: cleanLabel(draft?.doneCondition),
    nextBeatTitle,
  }
}

function normalizeStoredSidecar(value: unknown): ProjectSceneStageSidecar {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const rawScenes =
    record.scenes && typeof record.scenes === 'object'
      ? (record.scenes as Record<string, WriterSceneStageDraft>)
      : null

  if (rawScenes) {
    const scenes = Object.fromEntries(
      Object.entries(rawScenes).map(([sceneId, draft]) => {
        const nextDraft = sanitizeDraft({
          ...draft,
          sceneId: cleanLabel(draft.sceneId) || sceneId,
        })
        return [nextDraft.sceneId || sceneId, nextDraft]
      }),
    )
    const firstSceneId = Object.keys(scenes)[0] || createStageId('scene')
    const activeSceneId = cleanLabel(record.activeSceneId as string) || firstSceneId
    return {
      activeSceneId,
      scenes: Object.keys(scenes).length
        ? scenes
        : {
            [activeSceneId]: sanitizeDraft({
              sceneId: activeSceneId,
              beatId: createStageId('beat'),
            }),
          },
      archivedSceneIds: Array.isArray(record.archivedSceneIds)
        ? uniqueCleanIds(record.archivedSceneIds as string[])
        : [],
    }
  }

  const draft = sanitizeDraft(value as WriterSceneStageDraft)
  const sceneId = draft.sceneId || createStageId('scene')
  const beatId = draft.beatId || createStageId('beat')
  const nextDraft = sanitizeDraft({
    ...draft,
    sceneId,
    beatId,
  })

  return {
    activeSceneId: sceneId,
    scenes: {
      [sceneId]: nextDraft,
    },
    archivedSceneIds: [],
  }
}

function loadSidecarMap(): Record<string, ProjectSceneStageSidecar> {
  try {
    const raw = getSceneStageStorage()?.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (!parsed || typeof parsed !== 'object') return {}
    return Object.fromEntries(
      Object.entries(parsed).map(([projectId, value]) => [projectId, normalizeStoredSidecar(value)]),
    )
  } catch {
    return {}
  }
}

function loadLegacyDraftMap(): Record<string, WriterSceneStageDraft> {
  try {
    const raw = getSceneStageStorage()?.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, WriterSceneStageDraft>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function saveSidecarMap(drafts: Record<string, ProjectSceneStageSidecar>) {
  try {
    getSceneStageStorage()?.setItem(STORAGE_KEY, JSON.stringify(drafts))
  } catch (error) {
    console.warn('Failed to save scene stage draft:', error)
  }
}

function hasDraftField(draft: WriterSceneStageDraft | undefined, field: keyof WriterSceneStageDraft): boolean {
  return Object.prototype.hasOwnProperty.call(draft || {}, field)
}

function resolveSceneTitle(): string {
  return '未命名场景'
}

function resolveNextBeat(changeRequests: StoryHarnessChangeRequestPreview[]): string {
  const focused = changeRequests.find((item) => item.severity === 'focus') ?? changeRequests[0]
  if (!focused) return ''
  return focused.summary || focused.title
}

function buildSummaryLine(input: {
  sceneTitle: string
  beatTitle: string
  coverageLabel: string
  chapterTitle: string
  goal: string
  characters: string[]
  conflict: string
  nextBeatTitle: string
}): string {
  const isUnnamedScene = input.sceneTitle === '未命名场景'
  const parts = isUnnamedScene ? [] : ['当前场景', input.sceneTitle]

  if (input.beatTitle && (isUnnamedScene || input.beatTitle !== input.sceneTitle)) {
    parts.push(input.beatTitle)
  }

  if (input.goal) {
    parts.push(`目标：${input.goal}`)
  }

  if (input.characters.length > 0) {
    parts.push(input.characters.slice(0, 3).join(' / '))
  }

  if (input.conflict) {
    parts.push(`冲突：${input.conflict}`)
  }

  if (input.nextBeatTitle) {
    parts.push(`下一拍：${input.nextBeatTitle}`)
  }

  if (isUnnamedScene) {
    const facts = [
      input.chapterTitle ? `当前章节：${input.chapterTitle}` : '',
      input.coverageLabel ? `系统覆盖：${input.coverageLabel}` : '',
    ].filter(Boolean)
    const trailing = parts.length > 0 ? parts : ['在场资产：待自动检出']
    return [...facts, ...trailing].join(' · ')
  } else if (parts.length <= 2 && input.coverageLabel) {
    parts.push(`系统覆盖：${input.coverageLabel}`)
  }

  return parts.join(' · ')
}

function isChapterLikeSceneTitle(params: {
  sceneTitle: string
  chapterTitle: string
  linkedChapterTitles: string[]
}): boolean {
  if (!params.sceneTitle) return false
  return uniqueCleanIds([params.chapterTitle, ...params.linkedChapterTitles]).includes(params.sceneTitle)
}

function mapAssetTypeLabel(assetType: string) {
  const typeLabelMap: Record<string, string> = {
    character: '角色',
    item: '物品',
    location: '地点',
    concept: '概念',
    organization: '组织',
    foreshadowing: '伏笔',
  }
  return typeLabelMap[assetType] || assetType || '资产'
}

function mapAssetRefToSceneAsset(ref: WriterAssetRef): WriterSceneStageAsset {
  return {
    key: createWriterAssetRefKey(ref.assetType, ref.assetId, ref.assetName),
    assetType: ref.assetType,
    typeLabel: mapAssetTypeLabel(ref.assetType),
    assetId: ref.assetId,
    assetName: ref.assetName,
    summary: ref.evidence,
    unresolved: ref.unresolved,
  }
}

function buildCoverageLabel(params: {
  chapterIds: string[]
  chapterTitle: string
  chapters: SidebarChapterSummary[]
}) {
  const chapterById = new Map(params.chapters.map((chapter) => [chapter.id, chapter]))
  const indexById = new Map(params.chapters.map((chapter, index) => [chapter.id, index]))
  const linkedChapters = params.chapterIds
    .map((id) => chapterById.get(id))
    .filter((chapter): chapter is SidebarChapterSummary => Boolean(chapter))
    .sort((a, b) => (indexById.get(a.id) ?? 0) - (indexById.get(b.id) ?? 0))

  if (linkedChapters.length === 0) {
    return params.chapterTitle || '未关联章节'
  }

  if (linkedChapters.length === 1) {
    return linkedChapters[0].title
  }

  return `${linkedChapters[0].title} - ${linkedChapters[linkedChapters.length - 1].title}（${linkedChapters.length}章）`
}

function buildOrderedChapterWindow(params: {
  currentChapterId: string
  chapters: SidebarChapterSummary[]
}): SidebarChapterSummary[] {
  const orderedChapters = params.chapters.filter((chapter) => chapter.nodeType !== 'directory')
  const currentIndex = orderedChapters.findIndex((chapter) => chapter.id === params.currentChapterId)
  if (currentIndex < 0) return []
  const startIndex = Math.max(0, currentIndex - MAX_COVERAGE_OPTION_COUNT + 1)
  return orderedChapters.slice(startIndex, currentIndex + 1)
}

function buildCoverageOptions(params: {
  currentChapterId: string
  chapterTitle: string
  chapters: SidebarChapterSummary[]
}): WriterSceneStageCoverageOption[] {
  const windowChapters = buildOrderedChapterWindow({
    currentChapterId: params.currentChapterId,
    chapters: params.chapters,
  })

  if (windowChapters.length === 0) {
    return params.currentChapterId || params.chapterTitle
      ? [
          {
            value: 1,
            label: params.chapterTitle ? `仅 ${params.chapterTitle}` : '当前章节',
            chapterIds: uniqueCleanIds([params.currentChapterId]),
          },
        ]
      : []
  }

  return windowChapters
    .map((_, index) => {
      const selectedChapters = windowChapters.slice(windowChapters.length - index - 1)
      const first = selectedChapters[0]
      const last = selectedChapters[selectedChapters.length - 1]
      const label =
        selectedChapters.length === 1
          ? `仅 ${last.title}`
          : `${first.title} - ${last.title}（${selectedChapters.length}章）`
      return {
        value: selectedChapters.length,
        label,
        chapterIds: selectedChapters.map((chapter) => chapter.id),
      }
    })
    .sort((a, b) => a.value - b.value)
}

function resolveCoverageChapterIds(params: {
  draft: WriterSceneStageDraft
  currentChapterId: string
  chapterTitle: string
  chapters: SidebarChapterSummary[]
}): string[] {
  const coverageOptions = buildCoverageOptions({
    currentChapterId: params.currentChapterId,
    chapterTitle: params.chapterTitle,
    chapters: params.chapters,
  })
  if (coverageOptions.length === 0) return []

  const legacyCount = params.draft.chapterIds?.length || 1
  const wantedCount = params.draft.coverageChapterCount || legacyCount
  const resolved =
    coverageOptions.find((option) => option.value === wantedCount) ||
    coverageOptions[coverageOptions.length - 1] ||
    coverageOptions[0]
  return resolved.chapterIds
}

function pickLegacyDraft(params: {
  projectId: string
  chapterId: string
  legacyDrafts: Record<string, WriterSceneStageDraft>
}): WriterSceneStageDraft | undefined {
  const exact = params.legacyDrafts[`${params.projectId}:${params.chapterId}`]
  if (exact) return exact

  return Object.entries(params.legacyDrafts).find(([key]) => key.startsWith(`${params.projectId}:`))?.[1]
}

export function useWriterSceneStage(options: UseWriterSceneStageOptions) {
  const sidecarMap = ref<Record<string, ProjectSceneStageSidecar>>(loadSidecarMap())
  const legacyDraftMap = ref<Record<string, WriterSceneStageDraft>>(loadLegacyDraftMap())
  const projectKey = computed(() => cleanLabel(options.projectId.value) || 'unknown-project')
  const currentChapterId = computed(() => cleanLabel(options.chapterId.value))
  const chapters = computed(() => options.chapters?.value || [])
  const { assetRefState } = useWriterAssetRefState(options.projectId)

  const ensureProjectSidecar = () => {
    const key = projectKey.value
    const chapterId = currentChapterId.value
    const existing = sidecarMap.value[key]
    const legacy = existing
      ? undefined
      : pickLegacyDraft({
          projectId: key,
          chapterId,
          legacyDrafts: legacyDraftMap.value,
        })
    const baseSidecar = existing || normalizeStoredSidecar(legacy || {})
    const activeScene = baseSidecar.scenes[baseSidecar.activeSceneId] || sanitizeDraft({})
    const chapterTitle =
      chapters.value.find((chapter) => chapter.id === chapterId)?.title ||
      cleanLabel(options.chapterTitle.value)
    const legacyCount = activeScene.coverageChapterCount || activeScene.chapterIds?.length || 1
    const coverageChapterIds = resolveCoverageChapterIds({
      draft: {
        ...activeScene,
        coverageChapterCount: legacyCount,
      },
      currentChapterId: chapterId,
      chapterTitle,
      chapters: chapters.value,
    })
    const nextDraft = sanitizeDraft({
      ...activeScene,
      sceneId: activeScene.sceneId || baseSidecar.activeSceneId,
      beatId: activeScene.beatId || createStageId('beat'),
      coverageChapterCount: legacyCount,
      chapterIds: coverageChapterIds,
    })
    const activeSceneId = nextDraft.sceneId || baseSidecar.activeSceneId || createStageId('scene')
    const nextSidecar: ProjectSceneStageSidecar = {
      activeSceneId,
      scenes: {
        ...baseSidecar.scenes,
        [activeSceneId]: nextDraft,
      },
      archivedSceneIds: baseSidecar.archivedSceneIds || [],
    }

    const before = JSON.stringify(sidecarMap.value[key] || {})
    const after = JSON.stringify(nextSidecar)
    if (before === after) return

    sidecarMap.value = {
      ...sidecarMap.value,
      [key]: nextSidecar,
    }
    saveSidecarMap(sidecarMap.value)
  }

  watch([projectKey, currentChapterId], ensureProjectSidecar, { immediate: true })

  const currentSidecar = computed(() => sidecarMap.value[projectKey.value])
  const currentSceneId = computed(() => currentSidecar.value?.activeSceneId || '')
  const currentRawDraft = computed(() => currentSidecar.value?.scenes[currentSceneId.value])
  const currentDraft = computed(() => sanitizeDraft(currentRawDraft.value))
  const currentCoverageChapterIds = computed(() =>
    resolveCoverageChapterIds({
      draft: currentDraft.value,
      currentChapterId: currentChapterId.value,
      chapterTitle: cleanLabel(options.chapterTitle.value),
      chapters: chapters.value,
    }),
  )
  const coverageLabel = computed(() =>
    buildCoverageLabel({
      chapterIds: currentCoverageChapterIds.value,
      chapterTitle: cleanLabel(options.chapterTitle.value),
      chapters: chapters.value,
    }),
  )

  const sceneAssets = computed(() => {
    const refs: WriterAssetRef[] = []
    const seenVolumeIds = new Set<string>()
    const chapterById = new Map(chapters.value.map((chapter) => [chapter.id, chapter]))

    for (const chapterId of currentCoverageChapterIds.value) {
      refs.push(...(assetRefState.value.chapterRefs[chapterId] || []))
      const volumeId = chapterById.get(chapterId)?.parentId
      if (volumeId && !seenVolumeIds.has(volumeId)) {
        seenVolumeIds.add(volumeId)
        refs.push(...(assetRefState.value.volumeRefs[volumeId] || []))
      }
    }

    return mergeWriterAssetRefs({ chapterRefs: refs }).map(mapAssetRefToSceneAsset)
  })

  const sceneStage = computed<WriterSceneStageState>(() => {
    const chapterTitle = cleanLabel(options.chapterTitle.value)
    const draft = currentDraft.value
    const rawDraft = currentRawDraft.value
    const chapterById = new Map(chapters.value.map((chapter) => [chapter.id, chapter]))
    const coverageChapterIds = currentCoverageChapterIds.value
    const linkedChapterTitles = coverageChapterIds
      .map((chapterId) => cleanLabel(chapterById.get(chapterId)?.title))
      .filter(Boolean)
    const sceneTitle =
      draft.sceneTitle &&
      (draft.manualSceneTitle ||
        !isChapterLikeSceneTitle({
          sceneTitle: draft.sceneTitle,
          chapterTitle,
          linkedChapterTitles,
        }))
        ? draft.sceneTitle
        : resolveSceneTitle()
    const beatTitle = draft.beatTitle || ''
    const assets = sceneAssets.value
    const characters = assets
      .filter((asset) => asset.assetType === 'character')
      .map((asset) => asset.assetName)
    const locations = assets
      .filter((asset) => asset.assetType === 'location')
      .map((asset) => asset.assetName)
    const pending = options.workflowContext.value.pendingChangeRequests
    const conflict =
      draft.conflict ||
      cleanLabel(pending.find((item) => item.type === 'relation')?.summary) ||
      cleanLabel(pending[0]?.summary)
    const nextBeatTitle = draft.nextBeatTitle || resolveNextBeat(options.changeRequests.value)
    const goal = hasDraftField(rawDraft, 'goal') ? draft.goal : ''
    const rangeLabel = hasDraftField(rawDraft, 'rangeLabel') ? draft.rangeLabel : ''
    const doneCondition = draft.doneCondition || ''
    const beatStatus = draft.beatStatus || 'active'
    const chapterIds = coverageChapterIds
    const currentLinked = currentChapterId.value ? chapterIds.includes(currentChapterId.value) : false
    const coverageChapterCount = draft.coverageChapterCount || chapterIds.length || 1
    const coverageOptions = buildCoverageOptions({
      currentChapterId: currentChapterId.value,
      chapterTitle,
      chapters: chapters.value,
    })

    const evidence = [
      coverageLabel.value ? { type: 'chapter_text' as const, label: coverageLabel.value } : null,
      assets.length > 0 ? { type: 'asset_ref' as const, label: `${assets.length} 个在场资产` } : null,
      pending.length > 0 ? { type: 'review_gate' as const, label: `${pending.length} 条审查建议` } : null,
      Object.values(draft).some(Boolean) ? { type: 'manual' as const, label: '手动场景' } : null,
    ].filter((item): item is NonNullable<typeof item> => Boolean(item))

    return {
      projectId: options.projectId.value,
      sceneId: draft.sceneId || createStageId('scene'),
      beatId: draft.beatId || createStageId('beat'),
      chapterId: currentChapterId.value,
      chapterTitle,
      chapterIds,
      chapterCount: chapterIds.length,
      coverageLabel: coverageLabel.value,
      coverageChapterCount,
      coverageOptions,
      currentChapterLinked: currentLinked,
      sceneTitle,
      beatTitle,
      locationName: locations[0],
      povCharacterName: characters[0],
      goal: goal || '',
      conflict: conflict || '',
      rangeLabel: rangeLabel || '',
      beatStatus,
      doneCondition: doneCondition || '',
      nextBeatTitle: nextBeatTitle || '',
      assets,
      evidence,
      summaryLine: buildSummaryLine({
        sceneTitle,
        beatTitle,
        coverageLabel: coverageLabel.value,
        chapterTitle,
        goal: goal || '',
        characters,
        conflict: conflict || '',
        nextBeatTitle: nextBeatTitle || '',
      }),
      isEmpty: !chapterTitle && assets.length === 0 && !nextBeatTitle,
      draft,
    }
  })

  const updateSceneStageDraft = (patch: Partial<WriterSceneStageDraft>) => {
    const key = projectKey.value
    const current = currentSidecar.value || normalizeStoredSidecar({})
    const nextPatch = { ...patch }
    if (hasDraftField(patch, 'sceneTitle')) {
      nextPatch.manualSceneTitle = Boolean(cleanLabel(patch.sceneTitle))
    }
    if (hasDraftField(patch, 'coverageChapterCount')) {
      const count = toPositiveInteger(patch.coverageChapterCount)
      nextPatch.coverageChapterCount = count
    }
    const nextDraft = sanitizeDraft({
      ...(current.scenes[current.activeSceneId] || {}),
      ...nextPatch,
    })
    const activeSceneId = nextDraft.sceneId || current.activeSceneId || createStageId('scene')
    const nextSidecar: ProjectSceneStageSidecar = {
      activeSceneId,
      scenes: {
        ...current.scenes,
        [activeSceneId]: nextDraft,
      },
      archivedSceneIds: current.archivedSceneIds || [],
    }
    sidecarMap.value = {
      ...sidecarMap.value,
      [key]: nextSidecar,
    }
    saveSidecarMap(sidecarMap.value)
  }

  const startNewSceneStage = () => {
    const key = projectKey.value
    const current = currentSidecar.value || normalizeStoredSidecar({})
    const activeDraft = current.scenes[current.activeSceneId] || currentDraft.value
    const nextSceneId = createStageId('scene')
    const nextBeatTitle = cleanLabel(activeDraft.nextBeatTitle)
    const nextDraft = sanitizeDraft({
      sceneId: nextSceneId,
      beatId: createStageId('beat'),
      sceneTitle: '',
      manualSceneTitle: false,
      beatTitle: nextBeatTitle,
      coverageChapterCount: 1,
      chapterIds: uniqueCleanIds([currentChapterId.value]),
      beatStatus: 'planned',
    })

    const completedDraft = sanitizeDraft({
      ...activeDraft,
      beatStatus: 'done',
    })

    const nextSidecar: ProjectSceneStageSidecar = {
      activeSceneId: nextSceneId,
      scenes: {
        ...current.scenes,
        [current.activeSceneId]: completedDraft,
        [nextSceneId]: nextDraft,
      },
      archivedSceneIds: uniqueCleanIds([...(current.archivedSceneIds || []), current.activeSceneId]),
    }

    sidecarMap.value = {
      ...sidecarMap.value,
      [key]: nextSidecar,
    }
    saveSidecarMap(sidecarMap.value)
  }

  const advanceSceneStageBeat = () => {
    const current = currentDraft.value
    const nextBeatTitle = cleanLabel(current.nextBeatTitle)
    updateSceneStageDraft({
      beatId: createStageId('beat'),
      beatTitle: nextBeatTitle || '',
      goal: '',
      conflict: '',
      beatStatus: 'active',
      doneCondition: '',
      nextBeatTitle: '',
      nextBeat: '',
    })
  }

  return {
    sceneStage,
    updateSceneStageDraft,
    advanceSceneStageBeat,
    startNewSceneStage,
  }
}
