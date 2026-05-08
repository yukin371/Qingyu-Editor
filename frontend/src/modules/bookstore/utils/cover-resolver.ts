const defaultCover = '/default-book-cover.svg'

const fallbackCoverPool = [
  '/images/covers/yunlan-cover.png',
  '/images/covers/fallback-cover-aurora.svg',
  '/images/covers/fallback-cover-ember.svg',
  '/images/covers/fallback-cover-verdant.svg',
  defaultCover,
]

const showcaseCoverAliases: Record<string, string> = {
  '/images/covers/showcase-yunhai.jpg': '/images/covers/yunlan-cover.png',
  '/images/covers/showcase-changan.jpg': '/images/covers/fallback-cover-ember.svg',
  '/images/covers/showcase-nihong.jpg': '/images/covers/fallback-cover-aurora.svg',
  '/images/covers/showcase-yehang.jpg': '/images/covers/fallback-cover-verdant.svg',
  '/images/covers/showcase-youxi.jpg': defaultCover,
  '/default-book-cover.jpg': defaultCover,
}

type CoverLike = {
  id?: string | number
  title?: string
  cover?: string | null
  coverUrl?: string | null
  book?: {
    id?: string | number
    title?: string
    cover?: string | null
    coverUrl?: string | null
  }
}

function normalizeCoverPath(source?: string | null): string {
  const normalized = typeof source === 'string' ? source.trim() : ''
  if (!normalized) return ''
  return showcaseCoverAliases[normalized] || normalized
}

function hashSeed(seed: string): number {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  }
  return hash
}

function buildSeed(payload?: CoverLike): string {
  return [payload?.book?.id, payload?.id, payload?.book?.title, payload?.title]
    .filter(Boolean)
    .join('|')
}

export function getFallbackBookCover(payload?: CoverLike): string {
  const seed = buildSeed(payload)
  if (!seed) return defaultCover
  return fallbackCoverPool[hashSeed(seed) % fallbackCoverPool.length]
}

export function resolveBookCover(payload?: CoverLike): string {
  const candidates = [
    payload?.book?.cover,
    payload?.book?.coverUrl,
    payload?.cover,
    payload?.coverUrl,
  ]

  for (const candidate of candidates) {
    const normalized = normalizeCoverPath(candidate)
    if (normalized) {
      return normalized
    }
  }

  return getFallbackBookCover(payload)
}
