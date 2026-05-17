import { computed, ref, watch, type ComputedRef } from 'vue'
import type { ActiveEntitySummary } from '@/modules/writer/composables/useWorkflowContext'
import type { WriterWorkflowContext } from '@/modules/writer/types/workflow'
import type { StoryHarnessChangeRequestPreview } from '@/modules/writer/stores/v3/storyHarnessStore'
import {
  mapActiveEntityToSceneAsset,
  type WriterSceneStageDraft,
  type WriterSceneStageState,
} from '@/modules/writer/types/sceneStage'

const STORAGE_KEY = 'qingyu_editor_scene_stage_drafts_v1'

interface UseWriterSceneStageOptions {
  projectId: ComputedRef<string>
  chapterId: ComputedRef<string>
  chapterTitle: ComputedRef<string>
  scopeLabel: ComputedRef<string | undefined>
  workflowContext: ComputedRef<WriterWorkflowContext>
  activeEntities: ComputedRef<ActiveEntitySummary[]>
  changeRequests: ComputedRef<StoryHarnessChangeRequestPreview[]>
}

function cleanLabel(value: string | undefined | null): string {
  return String(value || '').trim()
}

function getSceneStageStorage(): Storage | null {
  return typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage
}

function buildDraftKey(projectId: string, chapterId: string): string {
  return `${projectId || 'unknown-project'}:${chapterId || 'unknown-chapter'}`
}

function sanitizeDraft(draft: WriterSceneStageDraft | undefined): WriterSceneStageDraft {
  const legacyNextBeat = cleanLabel(draft?.nextBeat)
  const nextBeatTitle = cleanLabel(draft?.nextBeatTitle) || legacyNextBeat
  const beatStatus =
    draft?.beatStatus === 'planned' || draft?.beatStatus === 'done' ? draft.beatStatus : 'active'

  return {
    sceneTitle: cleanLabel(draft?.sceneTitle),
    beatTitle: cleanLabel(draft?.beatTitle),
    goal: cleanLabel(draft?.goal),
    conflict: cleanLabel(draft?.conflict),
    rangeLabel: cleanLabel(draft?.rangeLabel),
    beatStatus,
    doneCondition: cleanLabel(draft?.doneCondition),
    nextBeatTitle,
  }
}

function loadDraftMap(): Record<string, WriterSceneStageDraft> {
  try {
    const raw = getSceneStageStorage()?.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, WriterSceneStageDraft>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function saveDraftMap(drafts: Record<string, WriterSceneStageDraft>) {
  try {
    getSceneStageStorage()?.setItem(STORAGE_KEY, JSON.stringify(drafts))
  } catch (error) {
    console.warn('Failed to save scene stage draft:', error)
  }
}

function hasDraftField(draft: WriterSceneStageDraft | undefined, field: keyof WriterSceneStageDraft): boolean {
  return Object.prototype.hasOwnProperty.call(draft || {}, field)
}

function resolveSceneTitle(scopeLabel: string, chapterTitle: string): string {
  if (scopeLabel) return scopeLabel
  if (chapterTitle) return chapterTitle
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
  characters: string[]
  conflict: string
  nextBeatTitle: string
}): string {
  const parts = ['场景舞台', input.sceneTitle]

  if (input.beatTitle) {
    parts.push(`当前拍：${input.beatTitle}`)
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

  return parts.join(' · ')
}

export function useWriterSceneStage(options: UseWriterSceneStageOptions) {
  const draftMap = ref<Record<string, WriterSceneStageDraft>>(loadDraftMap())
  const draftKey = computed(() =>
    buildDraftKey(cleanLabel(options.projectId.value), cleanLabel(options.chapterId.value)),
  )
  const currentDraft = computed(() => sanitizeDraft(draftMap.value[draftKey.value]))
  const currentRawDraft = computed(() => draftMap.value[draftKey.value])

  const sceneStage = computed<WriterSceneStageState>(() => {
    const chapterTitle = cleanLabel(options.chapterTitle.value)
    const scopeLabel = cleanLabel(options.scopeLabel.value)
    const draft = currentDraft.value
    const rawDraft = currentRawDraft.value
    const sceneTitle = draft.sceneTitle || resolveSceneTitle(scopeLabel, chapterTitle)
    const beatTitle = draft.beatTitle || sceneTitle
    const assets = options.activeEntities.value.map(mapActiveEntityToSceneAsset)
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
    const goal = hasDraftField(rawDraft, 'goal')
      ? draft.goal
      : scopeLabel
        ? `完成 ${scopeLabel} 的场景推进`
        : ''
    const rangeLabel = hasDraftField(rawDraft, 'rangeLabel') ? draft.rangeLabel : chapterTitle
    const doneCondition = draft.doneCondition || ''
    const beatStatus = draft.beatStatus || 'active'

    const evidence = [
      chapterTitle ? { type: 'chapter_text' as const, label: chapterTitle } : null,
      assets.length > 0 ? { type: 'asset_ref' as const, label: `${assets.length} 个在场资产` } : null,
      pending.length > 0 ? { type: 'review_gate' as const, label: `${pending.length} 条审查建议` } : null,
      Object.values(draft).some(Boolean) ? { type: 'manual' as const, label: '手动节拍' } : null,
    ].filter((item): item is NonNullable<typeof item> => Boolean(item))

    return {
      projectId: options.projectId.value,
      chapterId: options.chapterId.value,
      chapterTitle,
      sceneTitle,
      beatTitle,
      locationName: locations[0],
      povCharacterName: characters[0],
      goal,
      conflict,
      rangeLabel,
      beatStatus,
      doneCondition,
      nextBeatTitle,
      assets,
      evidence,
      summaryLine: buildSummaryLine({
        sceneTitle,
        beatTitle,
        characters,
        conflict,
        nextBeatTitle,
      }),
      isEmpty: !chapterTitle && assets.length === 0 && !nextBeatTitle,
      draft,
    }
  })

  const updateSceneStageDraft = (patch: WriterSceneStageDraft) => {
    const key = draftKey.value
    const nextDraft = sanitizeDraft({
      ...draftMap.value[key],
      ...patch,
    })
    draftMap.value = {
      ...draftMap.value,
      [key]: nextDraft,
    }
    saveDraftMap(draftMap.value)
  }

  const advanceSceneStageBeat = () => {
    const current = currentDraft.value
    const nextBeatTitle = cleanLabel(current.nextBeatTitle)
    updateSceneStageDraft({
      beatTitle: nextBeatTitle || '',
      goal: '',
      conflict: '',
      rangeLabel: '',
      beatStatus: 'active',
      doneCondition: '',
      nextBeatTitle: '',
      nextBeat: '',
    })
  }

  watch(draftKey, () => {
    draftMap.value = loadDraftMap()
  })

  return {
    sceneStage,
    updateSceneStageDraft,
    advanceSceneStageBeat,
  }
}
