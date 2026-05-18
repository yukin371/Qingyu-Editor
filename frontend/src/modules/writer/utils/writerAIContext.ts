import type { WriterWorkflowContext } from '@/modules/writer/types/workflow'
import { buildWriterWorkflowContextPrompt } from '@/modules/writer/types/workflow'
import type {
  WriterAIMinimalWorkflow,
  WriterAIToolHintId,
  WriterAIWritingSkillId,
} from '@/modules/writer/config/writerAIPromptPresets'

export type WriterAIRoute =
  | 'chat'
  | 'analysis'
  | 'single_document_edit'
  | 'search_then_edit'
  | 'asset_assist'
  | 'plan_only'

export interface WriterDocumentContext {
  documentId?: string | null
  documentTitle?: string | null
  sourceText?: string | null
}

export interface WriterSelectionContext {
  kind: 'selection' | 'revision'
  text: string
  instructions?: string
}

export interface WriterDocumentTarget {
  kind:
    | 'current_document'
    | 'selection'
    | 'revision_candidate'
    | 'resolved_document'
    | 'search_results'
  documentId?: string
  documentTitle?: string
  label?: string
}

export interface WriterAIAssetSummary {
  scope: 'global' | 'volume' | 'chapter'
  assetType: 'character' | 'location' | 'item' | 'organization' | 'concept'
  assetId?: string
  assetName: string
  summary?: string
  latestChapterId?: string
  referenceCount: number
  unresolved?: boolean
}

export interface WriterAISceneStageSummary {
  sceneId?: string
  beatId?: string
  sceneTitle?: string
  beatTitle?: string
  beatStatus?: 'planned' | 'active' | 'done'
  coverageLabel?: string
  chapterCount?: number
  goal?: string
  conflict?: string
  rangeLabel?: string
  doneCondition?: string
  nextBeatTitle?: string
  locationName?: string
  povCharacterName?: string
  assetNames?: string[]
}

export interface WriterAIContextEvidence {
  id: string
  label: string
  detail?: string
  source:
    | 'current_document'
    | 'selection'
    | 'revision'
    | 'asset'
    | 'workflow'
    | 'chapter_task'
    | 'scene_stage'
}

export interface WriterChapterTaskCard {
  goal?: string
  emotionalFunction?: string
  readerPayoff?: string
  protagonistAction?: string
  conflict?: string
  hook?: string
  assetChanges?: string
}

export interface WriterAIContextPacket {
  projectId: string
  currentDocument?: WriterDocumentContext
  target?: WriterDocumentTarget
  selection?: WriterSelectionContext
  sceneStage?: WriterAISceneStageSummary
  chapterTask?: WriterChapterTaskCard
  assets: WriterAIAssetSummary[]
  workflowSummary: string[]
  evidence: WriterAIContextEvidence[]
  budget: {
    maxChars: number
    truncated: boolean
  }
}

export interface WriterAIPlan {
  route: WriterAIRoute
  mutationMode: 'none' | 'single_document_diff' | 'multi_document_plan' | 'chapter_create_plan'
  target: WriterDocumentTarget
  context: WriterAIContextPacket
  workflow?: WriterAIMinimalWorkflow
  skillId?: WriterAIWritingSkillId
  toolHintIds?: WriterAIToolHintId[]
  intent?: {
    action?: 'summarize' | 'rewrite' | 'continue' | 'proofread' | 'expand'
    targetLength?: number
  }
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
  requiresConfirmation: boolean
  userVisibleSummary: string
}

export interface WriterAIContextOptions {
  projectId?: string | null
  currentDocument?: WriterDocumentContext | null
  target?: WriterDocumentTarget | null
  selection?: WriterSelectionContext | null
  assets?: WriterAIAssetSummary[] | null
  sceneStage?: WriterAISceneStageSummary | null
  chapterTask?: WriterChapterTaskCard | null
  workflowContext?: WriterWorkflowContext | null
  aiSummaryContextText?: string | null | undefined
  maxContextChars?: number
}

const DEFAULT_CONTEXT_BUDGET = 6000

function normalizeLine(value: string | null | undefined): string {
  return String(value || '').trim()
}

function splitSummaryLines(value: string | null | undefined): string[] {
  return String(value || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function truncateText(value: string | null | undefined, maxChars: number) {
  const text = String(value || '')
  if (text.length <= maxChars) {
    return { text, truncated: false }
  }
  return {
    text: `${text.slice(0, Math.max(0, maxChars - 20)).trimEnd()}\n[context truncated]`,
    truncated: true,
  }
}

function buildWorkflowSummary(options: WriterAIContextOptions): string[] {
  return [
    ...splitSummaryLines(buildWriterWorkflowContextPrompt(options.workflowContext)),
    ...splitSummaryLines(options.aiSummaryContextText),
  ].slice(0, 12)
}

function hasChapterTask(task: WriterChapterTaskCard | null | undefined): task is WriterChapterTaskCard {
  return Boolean(
    task &&
      Object.values(task).some((value) => typeof value === 'string' && value.trim().length > 0),
  )
}

export function inferWriterChapterTaskCard(
  value: string | null | undefined,
): WriterChapterTaskCard | undefined {
  const lines = splitSummaryLines(value)
  if (lines.length === 0) return undefined

  const task: WriterChapterTaskCard = {}
  const matchers: Array<[keyof WriterChapterTaskCard, RegExp]> = [
    ['goal', /^(?:本章)?(?:目标|任务|章节目标)[：:]\s*(.+)$/],
    ['emotionalFunction', /^(?:情绪|情绪功能|情绪价值|章节情绪)[：:]\s*(.+)$/],
    ['readerPayoff', /^(?:读者收益|爽点|看点|兑现)[：:]\s*(.+)$/],
    ['protagonistAction', /^(?:主角行动|主角选择|人物选择)[：:]\s*(.+)$/],
    ['conflict', /^(?:冲突|阻力|对抗对象)[：:]\s*(.+)$/],
    ['hook', /^(?:钩子|章末钩子|断章|悬念)[：:]\s*(.+)$/],
    ['assetChanges', /^(?:资产变更|新增资产|设定变更)[：:]\s*(.+)$/],
  ]

  for (const line of lines) {
    for (const [key, matcher] of matchers) {
      const match = line.match(matcher)
      if (match?.[1]) {
        task[key] = match[1].trim()
      }
    }
  }

  return hasChapterTask(task) ? task : undefined
}

function hasSceneStage(
  sceneStage: WriterAISceneStageSummary | null | undefined,
): sceneStage is WriterAISceneStageSummary {
  return Boolean(
    sceneStage &&
      Object.entries(sceneStage).some(([key, value]) => {
        if (key === 'assetNames') return Array.isArray(value) && value.length > 0
        return typeof value === 'string' && value.trim().length > 0
      }),
  )
}

function formatBeatStatus(status: WriterAISceneStageSummary['beatStatus']): string {
  if (status === 'planned') return '未开始'
  if (status === 'done') return '已完成'
  return '进行中'
}

function formatSceneStageLines(sceneStage: WriterAISceneStageSummary | null | undefined): string[] {
  if (!hasSceneStage(sceneStage)) return []

  const lines = [
    sceneStage.sceneTitle ? `- 场景：${sceneStage.sceneTitle}` : '',
    sceneStage.beatTitle ? `- 当前拍：${sceneStage.beatTitle}` : '',
    sceneStage.beatStatus ? `- 状态：${formatBeatStatus(sceneStage.beatStatus)}` : '',
    sceneStage.coverageLabel ? `- 覆盖章节：${sceneStage.coverageLabel}` : '',
    sceneStage.rangeLabel ? `- 范围：${sceneStage.rangeLabel}` : '',
    sceneStage.locationName ? `- 地点：${sceneStage.locationName}` : '',
    sceneStage.povCharacterName ? `- 视角：${sceneStage.povCharacterName}` : '',
    sceneStage.goal ? `- 目标：${sceneStage.goal}` : '',
    sceneStage.conflict ? `- 冲突：${sceneStage.conflict}` : '',
    sceneStage.doneCondition ? `- 完成条件：${sceneStage.doneCondition}` : '',
    sceneStage.nextBeatTitle ? `- 下一拍：${sceneStage.nextBeatTitle}` : '',
    sceneStage.assetNames?.length
      ? `- 在场资产：${sceneStage.assetNames.slice(0, 8).join(' / ')}`
      : '',
  ]

  return lines.filter(Boolean)
}

function formatChapterTaskLines(task: WriterChapterTaskCard | null | undefined): string[] {
  if (!hasChapterTask(task)) return []

  const fields: Array<[keyof WriterChapterTaskCard, string]> = [
    ['goal', '目标'],
    ['emotionalFunction', '情绪功能'],
    ['readerPayoff', '读者收益'],
    ['protagonistAction', '主角行动'],
    ['conflict', '冲突'],
    ['hook', '章末钩子'],
    ['assetChanges', '资产变更'],
  ]

  return fields
    .map(([key, label]) => {
      const text = task[key]?.trim()
      return text ? `- ${label}：${text}` : ''
    })
    .filter(Boolean)
}

function buildContextEvidence(
  options: WriterAIContextOptions,
  workflowSummary: string[],
): WriterAIContextEvidence[] {
  const evidence: WriterAIContextEvidence[] = []
  const currentDocumentTitle = normalizeLine(options.currentDocument?.documentTitle)

  if (normalizeLine(options.currentDocument?.sourceText)) {
    evidence.push({
      id: `current:${options.currentDocument?.documentId || currentDocumentTitle || 'document'}`,
      label: currentDocumentTitle || '当前章节正文',
      detail: '作为本次请求的主要正文上下文',
      source: 'current_document',
    })
  }

  if (options.selection?.text.trim()) {
    evidence.push({
      id: `${options.selection.kind}:${options.selection.text.slice(0, 24)}`,
      label: options.selection.kind === 'revision' ? '候选稿上下文' : '选区上下文',
      detail: options.selection.instructions || options.selection.text.slice(0, 80),
      source: options.selection.kind,
    })
  }

  for (const asset of (options.assets || []).slice(0, 6)) {
    evidence.push({
      id: `asset:${asset.scope}:${asset.assetType}:${asset.assetId || asset.assetName}`,
      label: `${asset.assetName} · ${asset.scope}`,
      detail: `${asset.assetType}，引用 ${asset.referenceCount}`,
      source: 'asset',
    })
  }

  if (workflowSummary.length > 0) {
    evidence.push({
      id: 'workflow-summary',
      label: '创作蓝图与节奏摘要',
      detail: `${workflowSummary.length} 条简化上下文`,
      source: 'workflow',
    })
  }

  if (hasSceneStage(options.sceneStage)) {
    evidence.push({
      id: 'scene-stage',
      label: options.sceneStage.beatTitle || options.sceneStage.sceneTitle || '当前场景舞台',
      detail: options.sceneStage.goal || options.sceneStage.conflict || '当前拍与场景约束',
      source: 'scene_stage',
    })
  }

  if (hasChapterTask(options.chapterTask)) {
    evidence.push({
      id: 'chapter-task',
      label: '本章任务卡',
      detail: '用于约束创作冲刺与质量回审',
      source: 'chapter_task',
    })
  }

  return evidence
}

export function buildWriterAIContextPacket(options: WriterAIContextOptions): WriterAIContextPacket {
  const maxChars = options.maxContextChars ?? DEFAULT_CONTEXT_BUDGET
  const currentDocument = options.currentDocument
    ? {
        ...options.currentDocument,
        sourceText: truncateText(options.currentDocument.sourceText, maxChars).text,
      }
    : undefined
  const truncated = Boolean(
    options.currentDocument?.sourceText &&
    options.currentDocument.sourceText.length > (options.maxContextChars ?? DEFAULT_CONTEXT_BUDGET),
  )
  const workflowSummary = buildWorkflowSummary(options)
  const chapterTask =
    options.chapterTask || inferWriterChapterTaskCard(options.aiSummaryContextText) || undefined

  return {
    projectId:
      normalizeLine(options.projectId) ||
      normalizeLine(options.workflowContext?.projectId) ||
      'local-writer-project',
    currentDocument,
    target: options.target || undefined,
    selection: options.selection || undefined,
    sceneStage: hasSceneStage(options.sceneStage) ? options.sceneStage : undefined,
    chapterTask,
    assets: (options.assets || []).slice(0, 24),
    workflowSummary,
    evidence: buildContextEvidence({ ...options, chapterTask }, workflowSummary),
    budget: {
      maxChars,
      truncated,
    },
  }
}

export function formatWriterAIContextEvidence(packet: WriterAIContextPacket): string {
  if (packet.evidence.length === 0) {
    return ''
  }

  return [
    '本次 AI 可见上下文证据：',
    ...packet.evidence.slice(0, 8).map((item) => {
      const detail = item.detail ? `：${item.detail}` : ''
      return `- ${item.label}${detail}`
    }),
  ].join('\n')
}

export function formatWriterAIContextPacket(packet: WriterAIContextPacket): string {
  const lines: string[] = []
  const currentDocumentTitle = normalizeLine(packet.currentDocument?.documentTitle)
  const currentDocumentText = normalizeLine(packet.currentDocument?.sourceText)

  if (currentDocumentTitle || packet.currentDocument?.documentId) {
    lines.push(
      `当前章节：${currentDocumentTitle || packet.currentDocument?.documentId || '未命名章节'}`,
    )
  }

  if (packet.target?.label || packet.target?.documentTitle) {
    lines.push(`当前目标：${packet.target.label || packet.target.documentTitle}`)
  }

  if (packet.selection?.text.trim()) {
    lines.push(
      `${packet.selection.kind === 'revision' ? '候选稿' : '选区'}：${packet.selection.text
        .trim()
        .slice(0, 240)}`,
    )
  }

  const chapterTaskLines = formatChapterTaskLines(packet.chapterTask)
  if (chapterTaskLines.length > 0) {
    lines.push('本章任务卡：')
    lines.push(...chapterTaskLines)
  }

  const sceneStageLines = formatSceneStageLines(packet.sceneStage)
  if (sceneStageLines.length > 0) {
    lines.push('当前场景舞台：')
    lines.push(...sceneStageLines)
  }

  if (packet.workflowSummary.length > 0) {
    lines.push('创作蓝图与节奏摘要：')
    lines.push(...packet.workflowSummary.slice(0, 8).map((line) => `- ${line}`))
  }

  if (packet.assets.length > 0) {
    lines.push('资产简表：')
    lines.push(
      ...packet.assets.slice(0, 12).map((asset) => {
        const scope = asset.scope === 'chapter' ? '章节' : asset.scope === 'volume' ? '卷' : '全局'
        const status = asset.unresolved ? '，待确认' : ''
        const summary = asset.summary ? `，${asset.summary.slice(0, 48)}` : ''
        return `- [${scope}] ${asset.assetName}（${asset.assetType}，引用 ${asset.referenceCount}${status}${summary}）`
      }),
    )
  }

  if (packet.budget.truncated) {
    lines.push(`上下文预算：正文已按 ${packet.budget.maxChars} 字符截断。`)
  }

  if (currentDocumentText) {
    lines.push('当前章节正文：')
    lines.push(currentDocumentText)
  }

  const evidence = formatWriterAIContextEvidence(packet)
  if (evidence) {
    lines.push(evidence)
  }

  return lines.join('\n')
}

export function buildWriterAIContextBlock(options: WriterAIContextOptions): string {
  return formatWriterAIContextPacket(buildWriterAIContextPacket(options))
}

export function mergeWriterAIInstructions(
  parts: Array<string | null | undefined>,
  options: WriterAIContextOptions,
): string | undefined {
  const merged = [...parts, buildWriterAIContextBlock(options)]
    .filter((item) => item && item.trim())
    .join('\n\n')

  return merged || undefined
}
