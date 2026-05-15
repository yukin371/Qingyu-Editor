export type WriterLocateMode = 'chapter-number' | 'chapter-title' | 'node-id' | 'asset-name'
export type WriterLocateWindowMode = 'current' | 'segment' | 'around-target'

export interface WriterLocateRequest {
  mode: WriterLocateMode
  query: string
  windowMode: WriterLocateWindowMode
}

export interface WriterWindowRange {
  startOrder: number
  endOrder: number
}

export interface WriterLocateCandidate {
  id: string
  order: number
  segmentId: string
  title: string
  description?: string
  chapterId?: string
  chapterNumber?: number
  chapterTitle?: string
  assetNames?: string[]
  aliases?: string[]
}

export interface WriterLocateResult<T extends WriterLocateCandidate = WriterLocateCandidate> {
  request: WriterLocateRequest
  candidate: T
  segmentId: string
  windowRange: WriterWindowRange
}

export interface WriterLocateWindowOptions {
  beforeCount: number
  afterCount: number
  initialCount: number
}

export function normalizeWriterLocateQuery(value: string): string {
  return value.trim().toLowerCase()
}

export function buildWriterLocateRequest(
  rawQuery: string,
  windowMode: WriterLocateWindowMode = 'around-target',
): WriterLocateRequest | null {
  const query = normalizeWriterLocateQuery(rawQuery)
  if (!query) {
    return null
  }

  if (/^(node|event|chapter|asset|char|loc|item|org|concept)[-:_]/.test(query)) {
    return {
      mode: 'node-id',
      query,
      windowMode,
    }
  }

  if (/^@\S+/.test(query)) {
    return {
      mode: 'asset-name',
      query: query.replace(/^@+/, ''),
      windowMode,
    }
  }

  if (/^\d+$/.test(query) || /^第\s*\d+/.test(query)) {
    return {
      mode: 'chapter-number',
      query,
      windowMode,
    }
  }

  return {
    mode: 'chapter-title',
    query,
    windowMode,
  }
}

function extractChapterNumber(query: string): number {
  const matched = query.match(/\d+/)
  if (!matched) {
    return 0
  }

  const value = Number(matched[0])
  return Number.isFinite(value) ? value : 0
}

function matchesCandidate(candidate: WriterLocateCandidate, request: WriterLocateRequest): boolean {
  if (request.mode === 'chapter-number') {
    const chapterNumber = extractChapterNumber(request.query)
    if (!chapterNumber) {
      return false
    }
    return candidate.chapterNumber === chapterNumber || candidate.order + 1 === chapterNumber
  }

  if (request.mode === 'node-id') {
    const normalizedId = candidate.id.toLowerCase()
    return normalizedId.includes(request.query)
  }

  if (request.mode === 'asset-name') {
    const assetNames = [...(candidate.assetNames || []), ...(candidate.aliases || [])]
    return assetNames.some((name) => name.toLowerCase().includes(request.query))
  }

  const searchPool = [
    candidate.title,
    candidate.description,
    candidate.chapterTitle,
    ...(candidate.aliases || []),
  ]
    .filter((item): item is string => Boolean(item))
    .map((item) => item.toLowerCase())

  return searchPool.some((item) => item.includes(request.query))
}

export function resolveWriterWindowRange<T extends WriterLocateCandidate>(
  segmentRows: T[],
  anchor: T | null | undefined,
  windowMode: WriterLocateWindowMode,
  options: WriterLocateWindowOptions,
): WriterWindowRange | null {
  if (!segmentRows.length) {
    return null
  }

  const firstOrder = segmentRows[0].order
  const lastOrder = segmentRows[segmentRows.length - 1].order

  if (windowMode === 'segment') {
    return {
      startOrder: firstOrder,
      endOrder: lastOrder,
    }
  }

  if (!anchor) {
    return {
      startOrder: firstOrder,
      endOrder: Math.min(lastOrder, firstOrder + options.initialCount - 1),
    }
  }

  if (windowMode === 'current') {
    return {
      startOrder: anchor.order,
      endOrder: anchor.order,
    }
  }

  return {
    startOrder: Math.max(firstOrder, anchor.order - options.beforeCount),
    endOrder: Math.min(lastOrder, anchor.order + options.afterCount),
  }
}

export function locateWriterCandidate<T extends WriterLocateCandidate>(
  rows: T[],
  rawQuery: string,
  segmentRowsResolver: (segmentId: string) => T[],
  windowOptions: WriterLocateWindowOptions,
  windowMode: WriterLocateWindowMode = 'around-target',
): WriterLocateResult<T> | null {
  const request = buildWriterLocateRequest(rawQuery, windowMode)
  if (!request) {
    return null
  }

  const candidate = rows.find((row) => matchesCandidate(row, request))
  if (!candidate) {
    return null
  }

  const segmentRows = segmentRowsResolver(candidate.segmentId)
  const windowRange =
    resolveWriterWindowRange(segmentRows, candidate, request.windowMode, windowOptions) || {
      startOrder: candidate.order,
      endOrder: candidate.order,
    }

  return {
    request,
    candidate,
    segmentId: candidate.segmentId,
    windowRange,
  }
}

export function resolveStableWriterSegmentId(
  currentSegmentId: string,
  segmentIds: string[],
  preferredSegmentIds: Array<string | null | undefined>,
): string {
  if (currentSegmentId && segmentIds.includes(currentSegmentId)) {
    return currentSegmentId
  }

  for (const segmentId of preferredSegmentIds) {
    if (segmentId && segmentIds.includes(segmentId)) {
      return segmentId
    }
  }

  return segmentIds[0] || ''
}
