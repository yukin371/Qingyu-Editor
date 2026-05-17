import type { ActiveEntitySummary } from '@/modules/writer/composables/useWorkflowContext'

export type WriterSceneStageAssetType =
  | 'character'
  | 'location'
  | 'item'
  | 'organization'
  | 'concept'
  | 'foreshadowing'
  | string

export interface WriterSceneStageAsset {
  key: string
  assetType: WriterSceneStageAssetType
  typeLabel: string
  assetId?: string
  assetName: string
  summary?: string
  unresolved?: boolean
}

export interface WriterSceneStageEvidence {
  type: 'chapter_text' | 'asset_ref' | 'review_gate' | 'manual'
  label: string
}

export interface WriterSceneStageDraft {
  sceneTitle?: string
  beatTitle?: string
  goal?: string
  conflict?: string
  rangeLabel?: string
  beatStatus?: 'planned' | 'active' | 'done'
  doneCondition?: string
  nextBeatTitle?: string
  nextBeat?: string
}

export interface WriterSceneStageState {
  projectId: string
  chapterId: string
  chapterTitle: string
  sceneTitle: string
  beatTitle?: string
  locationName?: string
  povCharacterName?: string
  goal?: string
  conflict?: string
  rangeLabel?: string
  beatStatus: 'planned' | 'active' | 'done'
  doneCondition?: string
  nextBeatTitle?: string
  assets: WriterSceneStageAsset[]
  evidence: WriterSceneStageEvidence[]
  summaryLine: string
  isEmpty: boolean
  draft: WriterSceneStageDraft
}

export function buildWriterSceneStagePrompt(sceneStage: WriterSceneStageState): string {
  const lines = [
    `场景：${sceneStage.sceneTitle}`,
    sceneStage.chapterTitle ? `章节：${sceneStage.chapterTitle}` : '',
    sceneStage.locationName ? `地点：${sceneStage.locationName}` : '',
    sceneStage.povCharacterName ? `视角：${sceneStage.povCharacterName}` : '',
    sceneStage.goal ? `目标：${sceneStage.goal}` : '',
    sceneStage.conflict ? `冲突：${sceneStage.conflict}` : '',
    sceneStage.rangeLabel ? `范围：${sceneStage.rangeLabel}` : '',
    sceneStage.doneCondition ? `完成条件：${sceneStage.doneCondition}` : '',
    sceneStage.nextBeatTitle ? `下一拍预告：${sceneStage.nextBeatTitle}` : '',
    sceneStage.assets.length > 0
      ? `在场资产：${sceneStage.assets
          .slice(0, 6)
          .map((asset) => `${asset.typeLabel}${asset.assetName ? ` ${asset.assetName}` : ''}`)
          .join(' / ')}`
      : '',
  ]

  return lines.filter(Boolean).join('\n')
}

export function mapActiveEntityToSceneAsset(entity: ActiveEntitySummary): WriterSceneStageAsset {
  const typeLabelMap: Record<string, string> = {
    character: '角色',
    item: '物品',
    location: '地点',
    concept: '概念',
    organization: '组织',
    foreshadowing: '伏笔',
  }

  return {
    key: `${entity.type}:${entity.id || entity.name}`,
    assetType: entity.type,
    typeLabel: typeLabelMap[entity.type] || entity.type || '资产',
    assetId: entity.id,
    assetName: entity.name,
    summary: entity.summary,
  }
}
