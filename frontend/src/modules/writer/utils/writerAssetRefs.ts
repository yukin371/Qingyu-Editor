const STORAGE_PREFIX = 'qingyu_writer_asset_refs'
export const WRITER_ASSET_REFS_UPDATED_EVENT = 'qingyu:writer-asset-refs-updated'

export type WriterAssetType = 'character' | 'location' | 'item' | 'organization' | 'concept'
export type WriterAssetScopeType = 'chapter' | 'volume'
export type WriterAssetSource = 'mention' | 'name' | 'alias' | 'manual' | 'chapter_rollup'

export interface WriterAssetRef {
  id: string
  assetType: WriterAssetType
  assetId?: string
  assetName: string
  scopeType: WriterAssetScopeType
  scopeId: string
  source: WriterAssetSource
  createdAt: string
  updatedAt: string
  evidence?: string
  unresolved?: boolean
}

export interface WriterAssetCandidate {
  key: string
  assetType: WriterAssetType
  assetId?: string
  assetName: string
  source: WriterAssetSource
  evidence?: string
  unresolved?: boolean
  requiresTypeSelection?: boolean
}

export interface WriterAssetRefState {
  chapterRefs: Record<string, WriterAssetRef[]>
  volumeRefs: Record<string, WriterAssetRef[]>
}

export interface WriterAssetSummary {
  total: number
  characters: number
  locations: number
  items: number
  organizations: number
  concepts: number
}

export interface WriterAssetSummaryItem {
  type: WriterAssetType
  label: string
  count: number
}

export interface WriterAssetReferenceProjection {
  key: string
  assetType: WriterAssetType
  assetId?: string
  assetName: string
  totalReferenceCount: number
  chapterReferenceCount: number
  volumeReferenceCount: number
  latestChapterId?: string
  latestUpdatedAt?: string
  chapterIds: string[]
  volumeIds: string[]
  unresolved: boolean
}

interface ExtractionParams {
  text: string
  characters: Array<{ id: string; name: string; alias?: string[] }>
  locations: Array<{ id: string; name: string }>
  items?: Array<{ id: string; name: string; alias?: string[] }>
  organizations?: Array<{ id: string; name: string; alias?: string[] }>
  concepts?: Array<{ id: string; name: string; alias?: string[] }>
  entityReferences?: Array<{ id?: string; name: string; type: string }>
}

type CharacterInput = ExtractionParams['characters'][number]
type LocationInput = ExtractionParams['locations'][number]
type ItemInput = NonNullable<ExtractionParams['items']>[number]
type OrganizationInput = NonNullable<ExtractionParams['organizations']>[number]
type ConceptInput = NonNullable<ExtractionParams['concepts']>[number]

const createDefaultState = (): WriterAssetRefState => ({
  chapterRefs: {},
  volumeRefs: {},
})

export function summarizeWriterAssetRefs(refs: WriterAssetRef[]): WriterAssetSummary {
  return refs.reduce<WriterAssetSummary>(
    (summary, ref) => {
      summary.total += 1
      if (ref.assetType === 'character') summary.characters += 1
      else if (ref.assetType === 'location') summary.locations += 1
      else if (ref.assetType === 'item') summary.items += 1
      else if (ref.assetType === 'organization') summary.organizations += 1
      else if (ref.assetType === 'concept') summary.concepts += 1
      return summary
    },
    {
      total: 0,
      characters: 0,
      locations: 0,
      items: 0,
      organizations: 0,
      concepts: 0,
    },
  )
}

export function buildWriterAssetSummaryItems(summary: WriterAssetSummary): WriterAssetSummaryItem[] {
  const items: WriterAssetSummaryItem[] = [
    { type: 'character', label: '角色', count: summary.characters },
    { type: 'location', label: '地点', count: summary.locations },
    { type: 'item', label: '物品', count: summary.items },
    { type: 'organization', label: '组织', count: summary.organizations },
    { type: 'concept', label: '概念', count: summary.concepts },
  ]

  return items.filter((item) => item.count > 0)
}

export function mergeWriterAssetRefs(params: {
  chapterRefs?: WriterAssetRef[]
  volumeRefs?: WriterAssetRef[]
}) {
  const merged = [...(params.chapterRefs || [])]
  const seen = new Set(
    merged.map((ref) => createWriterAssetRefKey(ref.assetType, ref.assetId, ref.assetName)),
  )

  for (const ref of params.volumeRefs || []) {
    const key = createWriterAssetRefKey(ref.assetType, ref.assetId, ref.assetName)
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(ref)
  }

  return merged
}

export function buildWriterAssetSummaryByChapterId(
  state: WriterAssetRefState,
  chapters: Array<{ id: string; parentId?: string | null }>,
): Record<string, WriterAssetSummary> {
  const summaries: Record<string, WriterAssetSummary> = {}

  for (const chapter of chapters) {
    const merged = mergeWriterAssetRefs({
      chapterRefs: state.chapterRefs[chapter.id] || [],
      volumeRefs: chapter.parentId ? state.volumeRefs[chapter.parentId] || [] : [],
    })
    summaries[chapter.id] = summarizeWriterAssetRefs(merged)
  }

  return summaries
}

export function buildWriterAssetReferenceProjection(
  state: WriterAssetRefState,
): Map<string, WriterAssetReferenceProjection> {
  const projectionByKey = new Map<string, WriterAssetReferenceProjection>()

  const upsertProjection = (
    ref: WriterAssetRef,
    scopeType: WriterAssetScopeType,
    scopeId: string,
    chapterId?: string,
  ) => {
    const key = createWriterAssetRefKey(ref.assetType, ref.assetId, ref.assetName)
    const existing = projectionByKey.get(key)
    const chapterIds = new Set(existing?.chapterIds || [])
    const volumeIds = new Set(existing?.volumeIds || [])

    if (scopeType === 'chapter') {
      chapterIds.add(scopeId)
    } else {
      volumeIds.add(scopeId)
      if (chapterId) {
        chapterIds.add(chapterId)
      }
    }

    const latestUpdatedAt =
      !existing?.latestUpdatedAt || existing.latestUpdatedAt < ref.updatedAt
        ? ref.updatedAt
        : existing.latestUpdatedAt
    const latestChapterId =
      scopeType === 'chapter' && latestUpdatedAt === ref.updatedAt
        ? chapterId || scopeId
        : existing?.latestChapterId

    projectionByKey.set(key, {
      key,
      assetType: ref.assetType,
      assetId: ref.assetId,
      assetName: ref.assetName,
      totalReferenceCount: (existing?.totalReferenceCount || 0) + 1,
      chapterReferenceCount:
        (existing?.chapterReferenceCount || 0) + (scopeType === 'chapter' ? 1 : 0),
      volumeReferenceCount:
        (existing?.volumeReferenceCount || 0) + (scopeType === 'volume' ? 1 : 0),
      latestChapterId,
      latestUpdatedAt,
      chapterIds: Array.from(chapterIds),
      volumeIds: Array.from(volumeIds),
      unresolved: existing?.unresolved ? true : Boolean(ref.unresolved),
    })
  }

  for (const [chapterId, refs] of Object.entries(state.chapterRefs || {})) {
    for (const ref of refs) {
      upsertProjection(ref, 'chapter', chapterId, chapterId)
    }
  }

  for (const [volumeId, refs] of Object.entries(state.volumeRefs || {})) {
    for (const ref of refs) {
      upsertProjection(ref, 'volume', volumeId)
    }
  }

  return projectionByKey
}

const getStorageKey = (projectId: string) => `${STORAGE_PREFIX}:${projectId}`

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase()
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function createWriterAssetRefKey(
  assetType: WriterAssetType,
  assetId: string | undefined,
  assetName: string,
) {
  return `${assetType}:${assetId || assetName}`
}

function indexCharacters(characters: Array<{ id: string; name: string; alias?: string[] }>) {
  const exactNameMap = new Map<string, CharacterInput>()
  const aliasMap = new Map<string, CharacterInput>()

  for (const character of characters) {
    exactNameMap.set(normalizeName(character.name), character)
    for (const alias of character.alias || []) {
      if (!alias.trim()) continue
      aliasMap.set(normalizeName(alias), character)
    }
  }

  return { exactNameMap, aliasMap }
}

function indexLocations(locations: Array<{ id: string; name: string }>) {
  const exactNameMap = new Map<string, LocationInput>()

  for (const location of locations) {
    exactNameMap.set(normalizeName(location.name), location)
  }

  return { exactNameMap }
}

function indexItems(items: Array<{ id: string; name: string; alias?: string[] }>) {
  const exactNameMap = new Map<string, ItemInput>()
  const aliasMap = new Map<string, ItemInput>()

  for (const item of items) {
    exactNameMap.set(normalizeName(item.name), item)
    for (const alias of item.alias || []) {
      if (!alias.trim()) continue
      aliasMap.set(normalizeName(alias), item)
    }
  }

  return { exactNameMap, aliasMap }
}

function indexOrganizations(organizations: Array<{ id: string; name: string; alias?: string[] }>) {
  const exactNameMap = new Map<string, OrganizationInput>()
  const aliasMap = new Map<string, OrganizationInput>()

  for (const organization of organizations) {
    exactNameMap.set(normalizeName(organization.name), organization)
    for (const alias of organization.alias || []) {
      if (!alias.trim()) continue
      aliasMap.set(normalizeName(alias), organization)
    }
  }

  return { exactNameMap, aliasMap }
}

function indexConcepts(concepts: Array<{ id: string; name: string; alias?: string[] }>) {
  const exactNameMap = new Map<string, ConceptInput>()
  const aliasMap = new Map<string, ConceptInput>()

  for (const concept of concepts) {
    exactNameMap.set(normalizeName(concept.name), concept)
    for (const alias of concept.alias || []) {
      if (!alias.trim()) continue
      aliasMap.set(normalizeName(alias), concept)
    }
  }

  return { exactNameMap, aliasMap }
}

export function loadWriterAssetRefState(projectId: string): WriterAssetRefState {
  if (!projectId) return createDefaultState()

  try {
    const raw = localStorage.getItem(getStorageKey(projectId))
    if (!raw) return createDefaultState()

    const parsed = JSON.parse(raw) as Partial<WriterAssetRefState>
    return {
      chapterRefs:
        parsed.chapterRefs && typeof parsed.chapterRefs === 'object'
          ? (parsed.chapterRefs as Record<string, WriterAssetRef[]>)
          : {},
      volumeRefs:
        parsed.volumeRefs && typeof parsed.volumeRefs === 'object'
          ? (parsed.volumeRefs as Record<string, WriterAssetRef[]>)
          : {},
    }
  } catch {
    return createDefaultState()
  }
}

export function saveWriterAssetRefState(projectId: string, state: WriterAssetRefState) {
  if (!projectId) return
  localStorage.setItem(getStorageKey(projectId), JSON.stringify(state))
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(WRITER_ASSET_REFS_UPDATED_EVENT, {
        detail: { projectId },
      }),
    )
  }
}

export function updateWriterAssetRefState(
  projectId: string,
  updater: (state: WriterAssetRefState) => WriterAssetRefState,
) {
  const nextState = updater(loadWriterAssetRefState(projectId))
  saveWriterAssetRefState(projectId, nextState)
  return nextState
}

export function upsertScopeAssetRef(params: {
  projectId: string
  scopeType: WriterAssetScopeType
  scopeId: string
  assetType: WriterAssetType
  assetId?: string
  assetName: string
  source: WriterAssetSource
  evidence?: string
  unresolved?: boolean
}) {
  const {
    projectId,
    scopeType,
    scopeId,
    assetType,
    assetId,
    assetName,
    source,
    evidence,
    unresolved,
  } = params

  return updateWriterAssetRefState(projectId, (state) => {
    const refMap = scopeType === 'volume' ? state.volumeRefs : state.chapterRefs
    const currentRefs = refMap[scopeId] || []
    const matchKey = createWriterAssetRefKey(assetType, assetId, assetName)
    const now = new Date().toISOString()
    const existing = currentRefs.find(
      (item) => createWriterAssetRefKey(item.assetType, item.assetId, item.assetName) === matchKey,
    )

    const nextRef: WriterAssetRef = existing
      ? {
          ...existing,
          assetName,
          source,
          evidence: evidence || existing.evidence,
          unresolved: unresolved ?? existing.unresolved,
          updatedAt: now,
        }
      : {
          id: `asset-ref-${scopeType}-${scopeId}-${Date.now()}-${currentRefs.length}`,
          assetType,
          assetId,
          assetName,
          scopeType,
          scopeId,
          source,
          evidence,
          unresolved,
          createdAt: now,
          updatedAt: now,
        }

    const nextRefs = existing
      ? currentRefs.map((item) => (item.id === existing.id ? nextRef : item))
      : [...currentRefs, nextRef]

    if (scopeType === 'volume') {
      return {
        ...state,
        volumeRefs: {
          ...state.volumeRefs,
          [scopeId]: nextRefs,
        },
      }
    }

    return {
      ...state,
      chapterRefs: {
        ...state.chapterRefs,
        [scopeId]: nextRefs,
      },
    }
  })
}

export function removeScopeAssetRef(
  projectId: string,
  scopeType: WriterAssetScopeType,
  scopeId: string,
  refId: string,
) {
  return updateWriterAssetRefState(projectId, (state) => {
    const refMap = scopeType === 'volume' ? state.volumeRefs : state.chapterRefs
    const nextRefs = (refMap[scopeId] || []).filter((item) => item.id !== refId)

    if (scopeType === 'volume') {
      return {
        ...state,
        volumeRefs: {
          ...state.volumeRefs,
          [scopeId]: nextRefs,
        },
      }
    }

    return {
      ...state,
      chapterRefs: {
        ...state.chapterRefs,
        [scopeId]: nextRefs,
      },
    }
  })
}

export function replaceScopeAssetRefs(params: {
  projectId: string
  scopeType: WriterAssetScopeType
  scopeId: string
  candidates: WriterAssetCandidate[]
}) {
  const { projectId, scopeType, scopeId, candidates } = params

  return updateWriterAssetRefState(projectId, (state) => {
    const refMap = scopeType === 'volume' ? state.volumeRefs : state.chapterRefs
    const currentRefs = refMap[scopeId] || []
    const existingByKey = new Map(
      currentRefs.map((ref) => [createWriterAssetRefKey(ref.assetType, ref.assetId, ref.assetName), ref]),
    )
    const now = new Date().toISOString()
    const nextRefs = candidates.map((candidate, index) => {
      const key = createWriterAssetRefKey(candidate.assetType, candidate.assetId, candidate.assetName)
      const existing = existingByKey.get(key)
      return existing
        ? {
            ...existing,
            assetName: candidate.assetName,
            source: candidate.source,
            evidence: candidate.evidence || existing.evidence,
            unresolved: candidate.unresolved ?? existing.unresolved,
            updatedAt: now,
          }
        : {
            id: `asset-ref-${scopeType}-${scopeId}-${Date.now()}-${index}`,
            assetType: candidate.assetType,
            assetId: candidate.assetId,
            assetName: candidate.assetName,
            scopeType,
            scopeId,
            source: candidate.source,
            evidence: candidate.evidence,
            unresolved: candidate.unresolved,
            createdAt: now,
            updatedAt: now,
          }
    })

    if (scopeType === 'volume') {
      return {
        ...state,
        volumeRefs: {
          ...state.volumeRefs,
          [scopeId]: nextRefs,
        },
      }
    }

    return {
      ...state,
      chapterRefs: {
        ...state.chapterRefs,
        [scopeId]: nextRefs,
      },
    }
  })
}

export function replaceProjectChapterAssetRefs(params: {
  projectId: string
  entries: Array<{
    chapterId: string
    candidates: WriterAssetCandidate[]
  }>
}) {
  const { projectId, entries } = params
  if (!projectId || entries.length === 0) {
    return loadWriterAssetRefState(projectId)
  }

  const now = new Date().toISOString()
  const nextState = updateWriterAssetRefState(projectId, (state) => {
    const chapterRefs = { ...state.chapterRefs }

    for (const entry of entries) {
      chapterRefs[entry.chapterId] = entry.candidates.map((candidate, index) => ({
        id: `asset-ref-chapter-${entry.chapterId}-${index}`,
        assetType: candidate.assetType,
        assetId: candidate.assetId,
        assetName: candidate.assetName,
        scopeType: 'chapter',
        scopeId: entry.chapterId,
        source: candidate.source,
        evidence: candidate.evidence,
        unresolved: candidate.unresolved,
        createdAt: now,
        updatedAt: now,
      }))
    }

    return {
      ...state,
      chapterRefs,
    }
  })

  return nextState
}

export function extractWriterAssetCandidates(params: ExtractionParams): WriterAssetCandidate[] {
  const text = params.text || ''
  const summary = new Map<string, WriterAssetCandidate>()
  const { exactNameMap: characterNameMap, aliasMap } = indexCharacters(params.characters || [])
  const { exactNameMap: locationNameMap } = indexLocations(params.locations || [])
  const { exactNameMap: itemNameMap, aliasMap: itemAliasMap } = indexItems(params.items || [])
  const { exactNameMap: organizationNameMap, aliasMap: organizationAliasMap } = indexOrganizations(
    params.organizations || [],
  )
  const { exactNameMap: conceptNameMap, aliasMap: conceptAliasMap } = indexConcepts(
    params.concepts || [],
  )

  const pushCandidate = (candidate: WriterAssetCandidate) => {
    const existing = summary.get(candidate.key)
    if (existing) {
      if (!existing.evidence && candidate.evidence) {
        existing.evidence = candidate.evidence
      }
      if (existing.unresolved && !candidate.unresolved) {
        existing.unresolved = false
      }
      if (existing.source === 'name' && candidate.source === 'mention') {
        existing.source = candidate.source
      }
      return
    }
    summary.set(candidate.key, candidate)
  }

  const matchEntityReference = (reference: { id?: string; name: string; type: string }) => {
    const normalized = normalizeName(reference.name)
    if (reference.type === 'character') {
      const entity =
        params.characters.find((item) => item.id === reference.id) ||
        characterNameMap.get(normalized) ||
        aliasMap.get(normalized)
      return entity
        ? {
            assetType: 'character' as const,
            assetId: entity.id,
            assetName: entity.name,
            unresolved: false,
          }
        : {
            assetType: 'character' as const,
            assetId: reference.id,
            assetName: reference.name,
            unresolved: true,
          }
    }

    if (reference.type === 'location') {
      const entity =
        params.locations.find((item) => item.id === reference.id) || locationNameMap.get(normalized)
      return entity
        ? {
            assetType: 'location' as const,
            assetId: entity.id,
            assetName: entity.name,
            unresolved: false,
          }
        : {
            assetType: 'location' as const,
            assetId: reference.id,
            assetName: reference.name,
            unresolved: true,
          }
    }

    if (reference.type === 'item') {
      const entity =
        (params.items || []).find((item) => item.id === reference.id) ||
        itemNameMap.get(normalized) ||
        itemAliasMap.get(normalized)
      return entity
        ? {
            assetType: 'item' as const,
            assetId: entity.id,
            assetName: entity.name,
            unresolved: false,
          }
        : {
            assetType: 'item' as const,
            assetId: reference.id,
            assetName: reference.name,
            unresolved: true,
          }
    }

    if (reference.type === 'organization') {
      const entity =
        (params.organizations || []).find((item) => item.id === reference.id) ||
        organizationNameMap.get(normalized) ||
        organizationAliasMap.get(normalized)
      return entity
        ? {
            assetType: 'organization' as const,
            assetId: entity.id,
            assetName: entity.name,
            unresolved: false,
          }
        : {
            assetType: 'organization' as const,
            assetId: reference.id,
            assetName: reference.name,
            unresolved: true,
          }
    }

    if (reference.type === 'concept') {
      const entity =
        (params.concepts || []).find((item) => item.id === reference.id) ||
        conceptNameMap.get(normalized) ||
        conceptAliasMap.get(normalized)
      return entity
        ? {
            assetType: 'concept' as const,
            assetId: entity.id,
            assetName: entity.name,
            unresolved: false,
          }
        : {
            assetType: 'concept' as const,
            assetId: reference.id,
            assetName: reference.name,
            unresolved: true,
          }
    }

    return null
  }

  for (const reference of params.entityReferences || []) {
    const matched = matchEntityReference(reference)
    if (!matched) continue
    pushCandidate({
      key: createWriterAssetRefKey(matched.assetType, matched.assetId, matched.assetName),
      assetType: matched.assetType,
      assetId: matched.assetId,
      assetName: matched.assetName,
      source: 'mention',
      evidence: reference.name,
      unresolved: matched.unresolved,
    })
  }

  for (const match of text.matchAll(/@([\u4e00-\u9fa5\w-]{1,30})/g)) {
    const rawName = match[1]?.trim()
    if (!rawName) continue
    const normalized = normalizeName(rawName)
    const matchedCandidates: WriterAssetCandidate[] = []

    const character = characterNameMap.get(normalized) || aliasMap.get(normalized)
    if (character) {
      matchedCandidates.push({
        key: createWriterAssetRefKey('character', character.id, character.name),
        assetType: 'character',
        assetId: character.id,
        assetName: character.name,
        source: characterNameMap.get(normalized) ? 'mention' : 'alias',
        evidence: rawName,
        unresolved: false,
      })
    }

    const location = locationNameMap.get(normalized)
    if (location) {
      matchedCandidates.push({
        key: createWriterAssetRefKey('location', location.id, location.name),
        assetType: 'location',
        assetId: location.id,
        assetName: location.name,
        source: 'mention',
        evidence: rawName,
        unresolved: false,
      })
    }

    const item = itemNameMap.get(normalized) || itemAliasMap.get(normalized)
    if (item) {
      matchedCandidates.push({
        key: createWriterAssetRefKey('item', item.id, item.name),
        assetType: 'item',
        assetId: item.id,
        assetName: item.name,
        source: itemNameMap.get(normalized) ? 'mention' : 'alias',
        evidence: rawName,
        unresolved: false,
      })
    }

    const organization = organizationNameMap.get(normalized) || organizationAliasMap.get(normalized)
    if (organization) {
      matchedCandidates.push({
        key: createWriterAssetRefKey('organization', organization.id, organization.name),
        assetType: 'organization',
        assetId: organization.id,
        assetName: organization.name,
        source: organizationNameMap.get(normalized) ? 'mention' : 'alias',
        evidence: rawName,
        unresolved: false,
      })
    }

    const concept = conceptNameMap.get(normalized) || conceptAliasMap.get(normalized)
    if (concept) {
      matchedCandidates.push({
        key: createWriterAssetRefKey('concept', concept.id, concept.name),
        assetType: 'concept',
        assetId: concept.id,
        assetName: concept.name,
        source: conceptNameMap.get(normalized) ? 'mention' : 'alias',
        evidence: rawName,
        unresolved: false,
      })
    }

    if (matchedCandidates.length === 0) {
      matchedCandidates.push({
        key: createWriterAssetRefKey('character', undefined, rawName),
        assetType: 'character',
        assetId: undefined,
        assetName: rawName,
        source: 'mention',
        evidence: rawName,
        unresolved: true,
        requiresTypeSelection: true,
      })
    }

    for (const candidate of matchedCandidates) {
      pushCandidate(candidate)
    }
  }

  const legacyMentionPatterns: Array<{ assetType: WriterAssetType; regex: RegExp }> = [
    { assetType: 'location', regex: /#([\u4e00-\u9fa5\w-]{1,30})/g },
    { assetType: 'item', regex: /%([\u4e00-\u9fa5\w-]{1,30})/g },
  ]

  for (const pattern of legacyMentionPatterns) {
    for (const match of text.matchAll(pattern.regex)) {
      const rawName = match[1]?.trim()
      if (!rawName) continue
      const normalized = normalizeName(rawName)

      if (pattern.assetType === 'location') {
        const location = locationNameMap.get(normalized)
        pushCandidate({
          key: createWriterAssetRefKey('location', location?.id, location?.name || rawName),
          assetType: 'location',
          assetId: location?.id,
          assetName: location?.name || rawName,
          source: 'mention',
          evidence: rawName,
          unresolved: !location,
        })
        continue
      }

      const item = itemNameMap.get(normalized) || itemAliasMap.get(normalized)
      pushCandidate({
        key: createWriterAssetRefKey('item', item?.id, item?.name || rawName),
        assetType: 'item',
        assetId: item?.id,
        assetName: item?.name || rawName,
        source: itemNameMap.get(normalized) ? 'mention' : itemAliasMap.get(normalized) ? 'alias' : 'mention',
        evidence: rawName,
        unresolved: !item,
      })
    }
  }

  const normalizedText = normalizeName(text)

  for (const character of params.characters || []) {
    if (normalizedText.includes(normalizeName(character.name))) {
      pushCandidate({
        key: createWriterAssetRefKey('character', character.id, character.name),
        assetType: 'character',
        assetId: character.id,
        assetName: character.name,
        source: 'name',
        evidence: character.name,
      })
      continue
    }

    const matchedAlias = (character.alias || []).find((alias) => {
      if (!alias.trim()) return false
      const pattern = new RegExp(
        `(^|[^\\w\\u4e00-\\u9fa5])${escapeRegExp(alias)}([^\\w\\u4e00-\\u9fa5]|$)`,
        'i',
      )
      return pattern.test(text)
    })

    if (matchedAlias) {
      pushCandidate({
        key: createWriterAssetRefKey('character', character.id, character.name),
        assetType: 'character',
        assetId: character.id,
        assetName: character.name,
        source: 'alias',
        evidence: matchedAlias,
      })
    }
  }

  for (const location of params.locations || []) {
    if (!location.name.trim()) continue
    const pattern = new RegExp(
      `(^|[^\\w\\u4e00-\\u9fa5])${escapeRegExp(location.name)}([^\\w\\u4e00-\\u9fa5]|$)`,
      'i',
    )
    if (!pattern.test(text)) continue

    pushCandidate({
      key: createWriterAssetRefKey('location', location.id, location.name),
      assetType: 'location',
      assetId: location.id,
      assetName: location.name,
      source: 'name',
      evidence: location.name,
    })
  }

  for (const item of params.items || []) {
    if (normalizedText.includes(normalizeName(item.name))) {
      pushCandidate({
        key: createWriterAssetRefKey('item', item.id, item.name),
        assetType: 'item',
        assetId: item.id,
        assetName: item.name,
        source: 'name',
        evidence: item.name,
      })
      continue
    }

    const matchedAlias = (item.alias || []).find((alias) => {
      if (!alias.trim()) return false
      const pattern = new RegExp(
        `(^|[^\\w\\u4e00-\\u9fa5])${escapeRegExp(alias)}([^\\w\\u4e00-\\u9fa5]|$)`,
        'i',
      )
      return pattern.test(text)
    })

    if (matchedAlias) {
      pushCandidate({
        key: createWriterAssetRefKey('item', item.id, item.name),
        assetType: 'item',
        assetId: item.id,
        assetName: item.name,
        source: 'alias',
        evidence: matchedAlias,
      })
    }
  }

  for (const organization of params.organizations || []) {
    if (normalizedText.includes(normalizeName(organization.name))) {
      pushCandidate({
        key: createWriterAssetRefKey('organization', organization.id, organization.name),
        assetType: 'organization',
        assetId: organization.id,
        assetName: organization.name,
        source: 'name',
        evidence: organization.name,
      })
      continue
    }

    const matchedAlias = (organization.alias || []).find((alias) => {
      if (!alias.trim()) return false
      const pattern = new RegExp(
        `(^|[^\\w\\u4e00-\\u9fa5])${escapeRegExp(alias)}([^\\w\\u4e00-\\u9fa5]|$)`,
        'i',
      )
      return pattern.test(text)
    })

    if (matchedAlias) {
      pushCandidate({
        key: createWriterAssetRefKey('organization', organization.id, organization.name),
        assetType: 'organization',
        assetId: organization.id,
        assetName: organization.name,
        source: 'alias',
        evidence: matchedAlias,
      })
    }
  }

  for (const concept of params.concepts || []) {
    if (normalizedText.includes(normalizeName(concept.name))) {
      pushCandidate({
        key: createWriterAssetRefKey('concept', concept.id, concept.name),
        assetType: 'concept',
        assetId: concept.id,
        assetName: concept.name,
        source: 'name',
        evidence: concept.name,
      })
      continue
    }

    const matchedAlias = (concept.alias || []).find((alias) => {
      if (!alias.trim()) return false
      const pattern = new RegExp(
        `(^|[^\\w\\u4e00-\\u9fa5])${escapeRegExp(alias)}([^\\w\\u4e00-\\u9fa5]|$)`,
        'i',
      )
      return pattern.test(text)
    })

    if (matchedAlias) {
      pushCandidate({
        key: createWriterAssetRefKey('concept', concept.id, concept.name),
        assetType: 'concept',
        assetId: concept.id,
        assetName: concept.name,
        source: 'alias',
        evidence: matchedAlias,
      })
    }
  }

  const sourceWeight: Record<WriterAssetSource, number> = {
    mention: 0,
    alias: 1,
    name: 2,
    manual: 3,
    chapter_rollup: 4,
  }

  return Array.from(summary.values()).sort((a, b) => {
    if (Number(a.unresolved) !== Number(b.unresolved)) {
      return Number(a.unresolved) - Number(b.unresolved)
    }
    if (sourceWeight[a.source] !== sourceWeight[b.source]) {
      return sourceWeight[a.source] - sourceWeight[b.source]
    }
    return a.assetName.localeCompare(b.assetName, 'zh-CN')
  })
}
