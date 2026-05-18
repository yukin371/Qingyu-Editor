import storage from '@/utils/storage'

export interface WriterUserPreferenceMemory {
  preferredGenres: string[]
  stylePreference: string[]
  commercialPreference?: {
    pace?: 'slow' | 'balanced' | 'fast'
    payoffFrequency?: string
    hookStrength?: 'soft' | 'medium' | 'strong'
  }
  avoid: string[]
  defaultReviewStrictness?: 'low' | 'medium' | 'high'
  preferredPerspective?: string
  updatedAt: number
}

export type WriterUserPreferenceMemoryPatch = Partial<
  Omit<WriterUserPreferenceMemory, 'updatedAt'>
>

const USER_PREFERENCE_MEMORY_STORAGE_KEY = 'writer_user_preference_memory_v1'

function now(): number {
  return Date.now()
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

type WriterCommercialPreference = NonNullable<WriterUserPreferenceMemory['commercialPreference']>

function normalizePace(value: unknown): WriterCommercialPreference['pace'] {
  return value === 'slow' || value === 'balanced' || value === 'fast' ? value : undefined
}

function normalizeHookStrength(
  value: unknown,
): WriterCommercialPreference['hookStrength'] {
  return value === 'soft' || value === 'medium' || value === 'strong' ? value : undefined
}

function normalizeReviewStrictness(
  value: unknown,
): WriterUserPreferenceMemory['defaultReviewStrictness'] {
  return value === 'low' || value === 'medium' || value === 'high' ? value : undefined
}

function normalizeCommercialPreference(
  value: WriterUserPreferenceMemory['commercialPreference'] | unknown,
): WriterUserPreferenceMemory['commercialPreference'] | undefined {
  if (!value || typeof value !== 'object') return undefined
  const record = value as Record<string, unknown>
  const next = {
    pace: normalizePace(record.pace),
    payoffFrequency: normalizeText(record.payoffFrequency) || undefined,
    hookStrength: normalizeHookStrength(record.hookStrength),
  }
  return Object.values(next).some(Boolean) ? next : undefined
}

export function createDefaultWriterUserPreferenceMemory(): WriterUserPreferenceMemory {
  return {
    preferredGenres: [],
    stylePreference: [],
    avoid: [],
    updatedAt: now(),
  }
}

export function normalizeWriterUserPreferenceMemory(
  raw: Partial<WriterUserPreferenceMemory> | null | undefined,
): WriterUserPreferenceMemory {
  const fallback = createDefaultWriterUserPreferenceMemory()
  if (!raw) return fallback

  return {
    preferredGenres: normalizeStringArray(raw.preferredGenres),
    stylePreference: normalizeStringArray(raw.stylePreference),
    commercialPreference: normalizeCommercialPreference(raw.commercialPreference),
    avoid: normalizeStringArray(raw.avoid),
    defaultReviewStrictness: normalizeReviewStrictness(raw.defaultReviewStrictness),
    preferredPerspective: normalizeText(raw.preferredPerspective) || undefined,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : fallback.updatedAt,
  }
}

export async function loadWriterUserPreferenceMemory(): Promise<WriterUserPreferenceMemory> {
  const saved = storage.get<Partial<WriterUserPreferenceMemory> | null>(
    USER_PREFERENCE_MEMORY_STORAGE_KEY,
    null,
  )
  return normalizeWriterUserPreferenceMemory(saved)
}

export async function saveWriterUserPreferenceMemory(
  patch: WriterUserPreferenceMemoryPatch,
): Promise<WriterUserPreferenceMemory> {
  const current = await loadWriterUserPreferenceMemory()
  const next = normalizeWriterUserPreferenceMemory({
    ...current,
    ...patch,
    updatedAt: now(),
  })
  storage.set(USER_PREFERENCE_MEMORY_STORAGE_KEY, next)
  return next
}

export function removeWriterUserPreferenceMemory(): void {
  storage.remove(USER_PREFERENCE_MEMORY_STORAGE_KEY)
}

export function buildWriterUserPreferenceSummaryLines(
  memory: WriterUserPreferenceMemory | null | undefined,
): string[] {
  if (!memory) return []

  const commercial = memory.commercialPreference
    ? [
        memory.commercialPreference.pace ? `节奏：${memory.commercialPreference.pace}` : '',
        memory.commercialPreference.payoffFrequency
          ? `兑现频率：${memory.commercialPreference.payoffFrequency}`
          : '',
        memory.commercialPreference.hookStrength
          ? `钩子强度：${memory.commercialPreference.hookStrength}`
          : '',
      ]
        .filter(Boolean)
        .join('；')
    : ''

  return [
    memory.preferredGenres.length
      ? `偏好题材：${memory.preferredGenres.slice(0, 4).join(' / ')}`
      : '',
    memory.stylePreference.length
      ? `偏好风格：${memory.stylePreference.slice(0, 4).join(' / ')}`
      : '',
    commercial ? `商业偏好：${commercial}` : '',
    memory.defaultReviewStrictness ? `回审严格度：${memory.defaultReviewStrictness}` : '',
    memory.preferredPerspective ? `常用视角：${memory.preferredPerspective}` : '',
    memory.avoid.length ? `用户不喜欢：${memory.avoid.slice(0, 4).join(' / ')}` : '',
  ].filter(Boolean)
}
