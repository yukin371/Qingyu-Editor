import { computed, type ComputedRef } from 'vue'
import type { ActiveEntitySummary } from '@/modules/writer/composables/useWorkflowContext'
import type { WriterWorkflowContext } from '@/modules/writer/types/workflow'
import type { StoryHarnessChangeRequestPreview } from '@/modules/writer/stores/v3/storyHarnessStore'
import {
  mapActiveEntityToSceneAsset,
  type WriterSceneStageState,
} from '@/modules/writer/types/sceneStage'

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
  characters: string[]
  conflict: string
  nextBeat: string
}): string {
  const parts = ['场景舞台', input.sceneTitle]

  if (input.characters.length > 0) {
    parts.push(input.characters.slice(0, 3).join(' / '))
  }

  if (input.conflict) {
    parts.push(`冲突：${input.conflict}`)
  }

  if (input.nextBeat) {
    parts.push(`下一拍：${input.nextBeat}`)
  }

  return parts.join(' · ')
}

export function useWriterSceneStage(options: UseWriterSceneStageOptions) {
  const sceneStage = computed<WriterSceneStageState>(() => {
    const chapterTitle = cleanLabel(options.chapterTitle.value)
    const scopeLabel = cleanLabel(options.scopeLabel.value)
    const sceneTitle = resolveSceneTitle(scopeLabel, chapterTitle)
    const assets = options.activeEntities.value.map(mapActiveEntityToSceneAsset)
    const characters = assets
      .filter((asset) => asset.assetType === 'character')
      .map((asset) => asset.assetName)
    const locations = assets
      .filter((asset) => asset.assetType === 'location')
      .map((asset) => asset.assetName)
    const pending = options.workflowContext.value.pendingChangeRequests
    const conflict =
      cleanLabel(pending.find((item) => item.type === 'relation')?.summary) ||
      cleanLabel(pending[0]?.summary)
    const nextBeat = resolveNextBeat(options.changeRequests.value)

    const evidence = [
      chapterTitle ? { type: 'chapter_text' as const, label: chapterTitle } : null,
      assets.length > 0 ? { type: 'asset_ref' as const, label: `${assets.length} 个在场资产` } : null,
      pending.length > 0 ? { type: 'review_gate' as const, label: `${pending.length} 条审查建议` } : null,
    ].filter((item): item is NonNullable<typeof item> => Boolean(item))

    return {
      projectId: options.projectId.value,
      chapterId: options.chapterId.value,
      chapterTitle,
      sceneTitle,
      locationName: locations[0],
      povCharacterName: characters[0],
      goal: scopeLabel ? `完成 ${scopeLabel} 的场景推进` : '',
      conflict,
      nextBeat,
      assets,
      evidence,
      summaryLine: buildSummaryLine({
        sceneTitle,
        characters,
        conflict,
        nextBeat,
      }),
      isEmpty: !chapterTitle && assets.length === 0 && !nextBeat,
    }
  })

  return {
    sceneStage,
  }
}
