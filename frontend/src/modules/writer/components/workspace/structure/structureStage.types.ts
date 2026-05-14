import type { OutlineNode } from '@/types/writer'

export type StageViewMode = 'overview' | 'fishbone' | 'canvas' | 'beats'

export type StructureFilterMode =
  | 'all'
  | 'linked'
  | 'unlinked'
  | 'current-chapter'
  | 'asset-ready'
  | 'asset-missing'
  | 'draft'
  | 'writing'
  | 'completed'
  | 'graph-missing'
  | 'graph-ready'
  | 'graph-inherit'

export type RhythmFilterMode =
  | 'all'
  | 'nearby'
  | 'unlinked'
  | 'asset-missing'
  | 'writing'
  | 'completed'

export interface RhythmBoardSummary {
  boundChapters: number
  writing: number
  unbound: number
  assets: number
}

export interface RhythmSegment {
  id: string
  title: string
  total: number
  unbound: number
  assetMissing: number
}

export interface RhythmRow {
  id: string
  node: OutlineNode
  title: string
  description: string
  chapterId?: string
  orderLabel: string
  statusTone: string
  statusLabel: string
  hookLabel: string
  timelineLabel: string
  assetCount: number
  assetLabel: string
  wordCountLabel: string
}

export interface GoldenChapterPlanLike {
  chapterNumber: number
  title: string
  summary?: string
  hook?: string
  payoff?: string
}

export interface BranchSpotlight {
  id: string
  node: OutlineNode
  title: string
  level: number
  topCount: number
  bottomCount: number
  branchCount: number
  bindingLabel: string
  graphLabel: string
  graphTone: string
  assetLabel: string
}
