import storage from '@/utils/storage'
import { isWailsWriterAvailable, wailsWriterBridge } from '@/modules/writer/data-bridge/wails'
import {
  getCreativeWorkflowFallbackTemplate,
  listCreativeWorkflowFallbackTemplates,
  type CreativeWorkflowTemplate,
  type CreativeWorkflowTemplateId,
  type GoldenChapterPlan,
} from './templateCatalog.fallback'

export type { CreativeWorkflowTemplate, CreativeWorkflowTemplateId, GoldenChapterPlan } from './templateCatalog.fallback'

export interface CreativeWorkflowSnapshot {
  projectId: string
  templateId: CreativeWorkflowTemplateId | null
  templateName: string
  premise: string
  targetAudience: string[]
  corePromises: string[]
  paceContract: string
  goldenChapters: GoldenChapterPlan[]
  updatedAt: string
}

export interface InspirationGateResult {
  status: 'ready' | 'blocked'
  missing: string[]
  nextActions: string[]
  completedFields: {
    hasPrimaryGenre: boolean
    hasTargetAudience: boolean
    hasCorePromises: boolean
    hasPaceContract: boolean
  }
}

export interface CreativeWorkflowRecord {
  version: 1
  projectId: string
  templateId: CreativeWorkflowTemplateId | null
  pitchLine: string
  targetAudience: string[]
  corePromises: string[]
  paceContract: string
  goldenChapters: GoldenChapterPlan[]
  gate: InspirationGateResult
  createdAt: string
  updatedAt: string
}

type CreativeWorkflowPatch = Partial<
  Pick<
    CreativeWorkflowRecord,
    'pitchLine' | 'targetAudience' | 'corePromises' | 'paceContract' | 'goldenChapters'
  >
> & {
  templateId?: CreativeWorkflowTemplateId | null
}

type CreativeWorkflowRecordLike = Partial<
  Omit<CreativeWorkflowRecord, 'templateId' | 'version' | 'goldenChapters'>
> & {
  templateId?: string | null
  version?: number
  goldenChapters?: Array<Partial<Omit<GoldenChapterPlan, 'chapterNumber'>> & { chapterNumber?: number }>
}

const CREATIVE_WORKFLOW_STORAGE_PREFIX = 'writer_creative_workflow_v1_'

function nowIso(): string {
  return new Date().toISOString()
}

function getStorageKey(projectId: string): string {
  return `${CREATIVE_WORKFLOW_STORAGE_PREFIX}${projectId || 'global'}`
}

function normalizeStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return []
  }

  const seen = new Set<string>()
  return input
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => {
      if (!item || seen.has(item)) {
        return false
      }
      seen.add(item)
      return true
    })
}

function normalizeGoldenChapterPlan(
  input:
    | (Partial<Omit<GoldenChapterPlan, 'chapterNumber'>> & { chapterNumber?: number })
    | undefined,
  fallback: GoldenChapterPlan,
): GoldenChapterPlan {
  return {
    chapterNumber: fallback.chapterNumber,
    title: typeof input?.title === 'string' ? input.title.trim() : fallback.title,
    summary: typeof input?.summary === 'string' ? input.summary.trim() : fallback.summary,
    hook: typeof input?.hook === 'string' ? input.hook.trim() : fallback.hook,
    payoff: typeof input?.payoff === 'string' ? input.payoff.trim() : fallback.payoff,
  }
}

function createBlankGoldenChapters(): GoldenChapterPlan[] {
  return [1, 2, 3].map((chapterNumber) => ({
    chapterNumber: chapterNumber as 1 | 2 | 3,
    title: `第${chapterNumber}章目标`,
    summary: '',
    hook: '',
    payoff: '',
  }))
}

export function listCreativeWorkflowTemplates(): CreativeWorkflowTemplate[] {
  return listCreativeWorkflowFallbackTemplates()
}

export function getCreativeWorkflowTemplate(
  templateId: CreativeWorkflowTemplateId | null | undefined,
): CreativeWorkflowTemplate | null {
  if (!templateId) {
    return null
  }

  return getCreativeWorkflowFallbackTemplate(templateId)
}

export function buildInspirationGate(record: Pick<
  CreativeWorkflowRecord,
  'templateId' | 'targetAudience' | 'corePromises' | 'paceContract'
>): InspirationGateResult {
  const completedFields = {
    hasPrimaryGenre: Boolean(record.templateId),
    hasTargetAudience: record.targetAudience.length > 0,
    hasCorePromises: record.corePromises.length > 0,
    hasPaceContract: record.paceContract.trim().length > 0,
  }

  const missing: string[] = []
  if (!completedFields.hasPrimaryGenre) {
    missing.push('选择题材模板')
  }
  if (!completedFields.hasTargetAudience) {
    missing.push('补充目标读者')
  }
  if (!completedFields.hasCorePromises) {
    missing.push('补充核心卖点承诺')
  }
  if (!completedFields.hasPaceContract) {
    missing.push('补充节奏合约')
  }

  const nextActions = missing.map((item) => `完成：${item}`)

  return {
    status: missing.length === 0 ? 'ready' : 'blocked',
    missing,
    nextActions,
    completedFields,
  }
}

function createDefaultCreativeWorkflow(projectId: string): CreativeWorkflowRecord {
  const createdAt = nowIso()
  const record: CreativeWorkflowRecord = {
    version: 1,
    projectId,
    templateId: null,
    pitchLine: '',
    targetAudience: [],
    corePromises: [],
    paceContract: '',
    goldenChapters: createBlankGoldenChapters(),
    gate: {
      status: 'blocked',
      missing: [],
      nextActions: [],
      completedFields: {
        hasPrimaryGenre: false,
        hasTargetAudience: false,
        hasCorePromises: false,
        hasPaceContract: false,
      },
    },
    createdAt,
    updatedAt: createdAt,
  }

  record.gate = buildInspirationGate(record)
  return record
}

function normalizeCreativeWorkflowRecord(
  projectId: string,
  raw: CreativeWorkflowRecordLike | null | undefined,
): CreativeWorkflowRecord {
  const template = getCreativeWorkflowTemplate(
    (typeof raw?.templateId === 'string' ? raw.templateId : null) as
      | CreativeWorkflowTemplateId
      | null,
  )
  const fallbackChapters = template?.goldenChapterSeeds ?? createBlankGoldenChapters()
  const record: CreativeWorkflowRecord = {
    version: 1,
    projectId,
    templateId: template?.id ?? null,
    pitchLine: typeof raw?.pitchLine === 'string' ? raw.pitchLine.trim() : '',
    targetAudience: normalizeStringArray(raw?.targetAudience),
    corePromises: normalizeStringArray(raw?.corePromises),
    paceContract: typeof raw?.paceContract === 'string' ? raw.paceContract.trim() : '',
    goldenChapters: fallbackChapters.map((chapter, index) =>
      normalizeGoldenChapterPlan(raw?.goldenChapters?.[index], chapter),
    ),
    gate: {
      status: 'blocked',
      missing: [],
      nextActions: [],
      completedFields: {
        hasPrimaryGenre: false,
        hasTargetAudience: false,
        hasCorePromises: false,
        hasPaceContract: false,
      },
    },
    createdAt: typeof raw?.createdAt === 'string' ? raw.createdAt : nowIso(),
    updatedAt: typeof raw?.updatedAt === 'string' ? raw.updatedAt : nowIso(),
  }
  record.gate = buildInspirationGate(record)
  return record
}

export async function loadCreativeWorkflow(projectId: string): Promise<CreativeWorkflowRecord> {
  const normalizedProjectId = projectId || 'global'
  if (isWailsWriterAvailable() && normalizedProjectId !== 'global') {
    try {
      const saved = await wailsWriterBridge.creativeWorkflow.get(normalizedProjectId)
      const normalized = normalizeCreativeWorkflowRecord(normalizedProjectId, saved)
      storage.set(getStorageKey(normalizedProjectId), normalized)
      return normalized
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[creativeWorkflowService] load from Wails failed, fallback to storage:', error)
      }
    }
  }

  const saved = storage.get<CreativeWorkflowRecord | null>(getStorageKey(normalizedProjectId), null)
  return saved
    ? normalizeCreativeWorkflowRecord(normalizedProjectId, saved)
    : createDefaultCreativeWorkflow(normalizedProjectId)
}

export async function saveCreativeWorkflow(
  projectId: string,
  patch: CreativeWorkflowPatch,
): Promise<CreativeWorkflowRecord> {
  const normalizedProjectId = projectId || 'global'
  const current = await loadCreativeWorkflow(normalizedProjectId)

  let nextTemplateId = current.templateId
  let nextTargetAudience = current.targetAudience
  let nextCorePromises = current.corePromises
  let nextPaceContract = current.paceContract
  let nextGoldenChapters = current.goldenChapters

  if (patch.templateId !== undefined) {
    nextTemplateId = patch.templateId
    const template = getCreativeWorkflowTemplate(patch.templateId)
    if (template) {
      nextTargetAudience = [...template.defaultAudience]
      nextCorePromises = [...template.defaultPromises]
      nextPaceContract = template.defaultPaceContract
      nextGoldenChapters = template.goldenChapterSeeds.map((seed) => ({ ...seed }))
    } else {
      nextGoldenChapters = createBlankGoldenChapters()
    }
  }

  if (patch.targetAudience !== undefined) {
    nextTargetAudience = normalizeStringArray(patch.targetAudience)
  }
  if (patch.corePromises !== undefined) {
    nextCorePromises = normalizeStringArray(patch.corePromises)
  }
  if (patch.paceContract !== undefined) {
    nextPaceContract = patch.paceContract.trim()
  }
  if (patch.goldenChapters !== undefined) {
    const fallback = getCreativeWorkflowTemplate(nextTemplateId)?.goldenChapterSeeds ?? createBlankGoldenChapters()
    nextGoldenChapters = fallback.map((chapter, index) =>
      normalizeGoldenChapterPlan(patch.goldenChapters?.[index], chapter),
    )
  }

  const nextRecord = normalizeCreativeWorkflowRecord(normalizedProjectId, {
    ...current,
    pitchLine: patch.pitchLine !== undefined ? patch.pitchLine.trim() : current.pitchLine,
    templateId: nextTemplateId,
    targetAudience: nextTargetAudience,
    corePromises: nextCorePromises,
    paceContract: nextPaceContract,
    goldenChapters: nextGoldenChapters,
    createdAt: current.createdAt,
    updatedAt: nowIso(),
  })

  if (isWailsWriterAvailable() && normalizedProjectId !== 'global') {
    try {
      const saved = await wailsWriterBridge.creativeWorkflow.save(normalizedProjectId, patch as Record<string, unknown>)
      const normalized = normalizeCreativeWorkflowRecord(normalizedProjectId, saved)
      storage.set(getStorageKey(normalizedProjectId), normalized)
      return normalized
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[creativeWorkflowService] save to Wails failed, fallback to storage:', error)
      }
    }
  }

  storage.set(getStorageKey(normalizedProjectId), nextRecord)
  return nextRecord
}

export function removeCreativeWorkflow(projectId: string): void {
  storage.remove(getStorageKey(projectId || 'global'))
}

export function buildCreativeWorkflowSnapshot(
  record: CreativeWorkflowRecord | null | undefined,
): CreativeWorkflowSnapshot | null {
  if (!record) {
    return null
  }

  const template = getCreativeWorkflowTemplate(record.templateId)

  return {
    projectId: record.projectId,
    templateId: record.templateId,
    templateName: template?.name || '',
    premise: record.pitchLine,
    targetAudience: [...record.targetAudience],
    corePromises: [...record.corePromises],
    paceContract: record.paceContract,
    goldenChapters: record.goldenChapters.map((chapter) => ({ ...chapter })),
    updatedAt: record.updatedAt,
  }
}

export function buildCreativeWorkflowSummaryLines(
  snapshot: CreativeWorkflowSnapshot | null | undefined,
): string[] {
  if (!snapshot) {
    return []
  }

  return [
    snapshot.templateName ? `题材模板：${snapshot.templateName}` : '',
    snapshot.premise ? `定位声明：${snapshot.premise}` : '',
    snapshot.targetAudience.length ? `目标读者：${snapshot.targetAudience.slice(0, 2).join(' / ')}` : '',
    snapshot.corePromises.length ? `核心承诺：${snapshot.corePromises.join('；')}` : '',
    snapshot.paceContract ? `节奏合约：${snapshot.paceContract}` : '',
    ...snapshot.goldenChapters.map((chapter) =>
      [
        `第${chapter.chapterNumber}章：${chapter.title}`,
        chapter.summary ? `目标：${chapter.summary}` : '',
        chapter.hook ? `钩子：${chapter.hook}` : '',
        chapter.payoff ? `兑现：${chapter.payoff}` : '',
      ]
        .filter(Boolean)
        .join(' | '),
    ),
  ].filter(Boolean)
}
