import storage from '@/utils/storage'
import type { CreativeWorkflowTemplateId } from './templateCatalog.fallback'

export interface WriterProjectBrief {
  projectId: string
  premise: string
  genreTemplateId?: CreativeWorkflowTemplateId | string
  targetAudience?: string
  readerPromise: string[]
  styleGuide: string[]
  themeQuestion?: string
  protagonistCore?: string
  worldRules: string[]
  commercialLoop?: {
    pressure: string
    expectation: string
    payoff: string
    upgrade: string
    hook: string
  }
  constraints: string[]
  avoid: string[]
  confirmedAt?: number
  updatedAt: number
}

export type WriterProjectBriefPatch = Partial<
  Omit<WriterProjectBrief, 'projectId' | 'updatedAt'>
>

const PROJECT_BRIEF_STORAGE_PREFIX = 'writer_project_brief_v1_'

function now(): number {
  return Date.now()
}

function getStorageKey(projectId: string): string {
  return `${PROJECT_BRIEF_STORAGE_PREFIX}${projectId || 'global'}`
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  return value
    .map((item) => normalizeText(item))
    .filter((item) => {
      if (!item || seen.has(item)) return false
      seen.add(item)
      return true
    })
}

function normalizeCommercialLoop(
  value: WriterProjectBrief['commercialLoop'] | unknown,
): WriterProjectBrief['commercialLoop'] | undefined {
  if (!value || typeof value !== 'object') return undefined
  const record = value as Record<string, unknown>
  const commercialLoop = {
    pressure: normalizeText(record.pressure),
    expectation: normalizeText(record.expectation),
    payoff: normalizeText(record.payoff),
    upgrade: normalizeText(record.upgrade),
    hook: normalizeText(record.hook),
  }
  return Object.values(commercialLoop).some(Boolean) ? commercialLoop : undefined
}

export function createDefaultWriterProjectBrief(projectId: string): WriterProjectBrief {
  return {
    projectId: projectId || 'global',
    premise: '',
    readerPromise: [],
    styleGuide: [],
    worldRules: [],
    constraints: [],
    avoid: [],
    updatedAt: now(),
  }
}

export function normalizeWriterProjectBrief(
  projectId: string,
  raw: Partial<WriterProjectBrief> | null | undefined,
): WriterProjectBrief {
  const fallback = createDefaultWriterProjectBrief(projectId)
  if (!raw) return fallback

  return {
    projectId: normalizeText(raw.projectId) || fallback.projectId,
    premise: normalizeText(raw.premise),
    genreTemplateId: normalizeText(raw.genreTemplateId) || undefined,
    targetAudience: normalizeText(raw.targetAudience) || undefined,
    readerPromise: normalizeStringArray(raw.readerPromise),
    styleGuide: normalizeStringArray(raw.styleGuide),
    themeQuestion: normalizeText(raw.themeQuestion) || undefined,
    protagonistCore: normalizeText(raw.protagonistCore) || undefined,
    worldRules: normalizeStringArray(raw.worldRules),
    commercialLoop: normalizeCommercialLoop(raw.commercialLoop),
    constraints: normalizeStringArray(raw.constraints),
    avoid: normalizeStringArray(raw.avoid),
    confirmedAt: typeof raw.confirmedAt === 'number' ? raw.confirmedAt : undefined,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : fallback.updatedAt,
  }
}

export async function loadWriterProjectBrief(projectId: string): Promise<WriterProjectBrief> {
  const normalizedProjectId = projectId || 'global'
  const saved = storage.get<Partial<WriterProjectBrief> | null>(
    getStorageKey(normalizedProjectId),
    null,
  )
  return normalizeWriterProjectBrief(normalizedProjectId, saved)
}

export async function saveWriterProjectBrief(
  projectId: string,
  patch: WriterProjectBriefPatch,
): Promise<WriterProjectBrief> {
  const normalizedProjectId = projectId || 'global'
  const current = await loadWriterProjectBrief(normalizedProjectId)
  const next = normalizeWriterProjectBrief(normalizedProjectId, {
    ...current,
    ...patch,
    projectId: normalizedProjectId,
    updatedAt: now(),
  })
  storage.set(getStorageKey(normalizedProjectId), next)
  return next
}

export function removeWriterProjectBrief(projectId: string): void {
  storage.remove(getStorageKey(projectId || 'global'))
}

export function buildWriterProjectBriefSummaryLines(
  brief: WriterProjectBrief | null | undefined,
): string[] {
  if (!brief) return []

  const commercialLoop = brief.commercialLoop
    ? [
        brief.commercialLoop.pressure ? `压迫：${brief.commercialLoop.pressure}` : '',
        brief.commercialLoop.expectation ? `期待：${brief.commercialLoop.expectation}` : '',
        brief.commercialLoop.payoff ? `兑现：${brief.commercialLoop.payoff}` : '',
        brief.commercialLoop.hook ? `钩子：${brief.commercialLoop.hook}` : '',
      ]
        .filter(Boolean)
        .join('；')
    : ''

  return [
    brief.premise ? `作品定位：${brief.premise}` : '',
    brief.targetAudience ? `目标读者：${brief.targetAudience}` : '',
    brief.readerPromise.length ? `阅读承诺：${brief.readerPromise.slice(0, 4).join(' / ')}` : '',
    brief.styleGuide.length ? `风格约束：${brief.styleGuide.slice(0, 4).join(' / ')}` : '',
    brief.themeQuestion ? `主题问题：${brief.themeQuestion}` : '',
    brief.protagonistCore ? `主角核心：${brief.protagonistCore}` : '',
    brief.worldRules.length ? `世界规则：${brief.worldRules.slice(0, 4).join(' / ')}` : '',
    commercialLoop ? `商业循环：${commercialLoop}` : '',
    brief.constraints.length ? `硬约束：${brief.constraints.slice(0, 4).join(' / ')}` : '',
    brief.avoid.length ? `避免：${brief.avoid.slice(0, 4).join(' / ')}` : '',
  ].filter(Boolean)
}
