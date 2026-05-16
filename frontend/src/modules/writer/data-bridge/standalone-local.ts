import storage from '@/utils/storage'
import {
  DocumentStatus,
  DocumentType,
  type CreateDocumentRequest,
  type Document,
  type UpdateDocumentMetaRequest,
} from '../types/document'
import type {
  AutoSaveRequest,
  AutoSaveResponse,
  DocumentContentResponse,
  SaveStatusResponse,
  UpdateContentRequest,
} from '../types/editor'
import type {
  Character,
  CharacterGraph,
  CharacterRelation,
  CreateCharacterRequest,
  SaveRelationRequest,
  UpdateCharacterRequest,
} from '../types/character'
import type {
  Location,
  LocationRelation,
  SaveLocationRelationRequest,
  SaveLocationRequest,
} from '../types/location'
import type { Concept, CreateConceptRequest, UpdateConceptRequest } from '../types/entity'
import type {
  SaveTimelineEventRequest,
  SaveTimelineRequest,
  Timeline,
  TimelineEvent,
} from '../types/timeline'
import type {
  CreateProjectRequest,
  ProjectDetailResponse,
  ProjectListResponse,
  ProjectSummary,
  UpdateProjectRequest,
} from '../api/project'
import type { EntityGraph, EntitySummary, StateValue } from '../api/entities'
import type { CreateOutlineRequest, OutlineTreeNode, UpdateOutlineRequest } from '../api/outline'
import { calculateWritingWordCount } from '../utils/wordCount'

type LocalProjectRecord = {
  id: string
  title: string
  summary: string
  coverUrl: string
  category: string
  tags: string[]
  status: string
  visibility: string
  createdAt: string
  updatedAt: string
}

type LocalDocumentRecord = Document
type LocalCharacterRecord = Character
type LocalCharacterRelationRecord = CharacterRelation
type LocalLocationRecord = Location
type LocalLocationRelationRecord = LocationRelation
type LocalConceptRecord = Concept
type LocalTimelineRecord = Timeline
type LocalTimelineEventRecord = TimelineEvent
type LocalGenericEntityRecord = {
  id: string
  projectId: string
  entityType: 'item' | 'organization'
  name: string
  alias?: string[]
  summary?: string
  createdAt: string
  updatedAt: string
}

type LocalDocumentContentRecord = {
  documentId: string
  content: string
  contentType: string
  version: number
  createdAt: string
  updatedAt: string
  lastSavedAt: string
}

type LocalWriterState = {
  projects: LocalProjectRecord[]
  documents: LocalDocumentRecord[]
  contents: Record<string, LocalDocumentContentRecord>
  characters: LocalCharacterRecord[]
  characterRelations: LocalCharacterRelationRecord[]
  locations: LocalLocationRecord[]
  locationRelations: LocalLocationRelationRecord[]
  concepts: LocalConceptRecord[]
  timelines: LocalTimelineRecord[]
  timelineEvents: LocalTimelineEventRecord[]
  genericEntities: LocalGenericEntityRecord[]
  entityStateFields: Record<string, Record<string, StateValue>>
}

type LegacyWriterItemRecord = {
  id: string
  projectId: string
  name: string
  alias?: string[]
  summary?: string
  category?: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'writer_standalone_local_state'

function nowIso(): string {
  return new Date().toISOString()
}

function createId(prefix: string): string {
  const randomPart = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${Date.now()}-${randomPart}`
}

function createEmptyState(): LocalWriterState {
  return {
    projects: [],
    documents: [],
    contents: {},
    characters: [],
    characterRelations: [],
    locations: [],
    locationRelations: [],
    concepts: [],
    timelines: [],
    timelineEvents: [],
    genericEntities: [],
    entityStateFields: {},
  }
}

function readState(): LocalWriterState {
  const saved = storage.get<LocalWriterState | null>(STORAGE_KEY, null)
  if (!saved) {
    return createEmptyState()
  }

  return {
    projects: Array.isArray(saved.projects) ? saved.projects : [],
    documents: Array.isArray(saved.documents) ? saved.documents : [],
    contents:
      saved.contents && typeof saved.contents === 'object' && !Array.isArray(saved.contents)
        ? saved.contents
        : {},
    characters: Array.isArray(saved.characters) ? saved.characters : [],
    characterRelations: Array.isArray(saved.characterRelations) ? saved.characterRelations : [],
    locations: Array.isArray(saved.locations) ? saved.locations : [],
    locationRelations: Array.isArray(saved.locationRelations) ? saved.locationRelations : [],
    concepts: Array.isArray(saved.concepts) ? saved.concepts : [],
    timelines: Array.isArray(saved.timelines) ? saved.timelines : [],
    timelineEvents: Array.isArray(saved.timelineEvents) ? saved.timelineEvents : [],
    genericEntities: Array.isArray(saved.genericEntities) ? saved.genericEntities : [],
    entityStateFields:
      saved.entityStateFields &&
      typeof saved.entityStateFields === 'object' &&
      !Array.isArray(saved.entityStateFields)
        ? saved.entityStateFields
        : {},
  }
}

function writeState(state: LocalWriterState): LocalWriterState {
  storage.set(STORAGE_KEY, state)
  return state
}

function migrateLegacyWriterItemsForProject(
  state: LocalWriterState,
  projectId: string,
): LocalWriterState {
  if (!projectId) {
    return state
  }

  if (typeof localStorage === 'undefined' || !localStorage.getItem(`qingyu_writer_items:${projectId}`)) {
    return state
  }

  const existingIds = new Set(state.genericEntities.map((entity) => entity.id))
  let migrated = false

  for (const item of loadLegacyWriterItems(projectId)) {
    if (!item.id || !item.name?.trim() || existingIds.has(item.id)) {
      continue
    }

    state.genericEntities.push({
      id: item.id,
      projectId,
      entityType: item.category === 'organization' ? 'organization' : 'item',
      name: item.name.trim(),
      alias: normalizeStringArray(item.alias),
      summary: item.summary || '',
      createdAt: item.createdAt || nowIso(),
      updatedAt: item.updatedAt || nowIso(),
    })
    existingIds.add(item.id)
    migrated = true
  }

  if (migrated) {
    writeState(state)
  }

  return state
}

function loadLegacyWriterItems(projectId: string): LegacyWriterItemRecord[] {
  if (!projectId || typeof localStorage === 'undefined') {
    return []
  }

  try {
    const raw = localStorage.getItem(`qingyu_writer_items:${projectId}`)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as LegacyWriterItemRecord[]) : []
  } catch {
    return []
  }
}

function isRootParent(parentId?: string): boolean {
  return !parentId || parentId === '000000000000000000000000'
}

function extractPlainText(content: string): string {
  if (!content) {
    return ''
  }

  try {
    const parsed = JSON.parse(content) as { type?: string; text?: string; content?: unknown[] }
    const walk = (node: unknown): string => {
      if (!node || typeof node !== 'object') {
        return ''
      }
      const typed = node as { type?: string; text?: string; content?: unknown[] }
      if (typed.type === 'text') {
        return typed.text || ''
      }
      if (!Array.isArray(typed.content)) {
        return ''
      }
      return typed.content.map(walk).join('')
    }
    return walk(parsed)
  } catch {
    return content
  }
}

function countWords(content: string): number {
  return calculateWritingWordCount(extractPlainText(content))
}

function buildDefaultDocumentContent(title: string): string {
  return JSON.stringify({
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: title }],
      },
      {
        type: 'paragraph',
        content: [],
      },
    ],
  })
}

function normalizeStoredContent(contents: unknown[]): string {
  if (!Array.isArray(contents) || contents.length === 0) {
    return JSON.stringify({ type: 'doc', content: [] })
  }

  const paragraphBlocks = contents
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return ''
      }
      return typeof (item as { content?: unknown }).content === 'string'
        ? ((item as { content: string }).content || '')
        : ''
    })
    .filter((item) => item.length > 0)

  if (paragraphBlocks.length === 1) {
    const [singleBlock] = paragraphBlocks
    try {
      const parsed = JSON.parse(singleBlock) as { type?: string; content?: unknown[] }
      if (parsed.type === 'doc' && Array.isArray(parsed.content)) {
        return singleBlock
      }
    } catch {
      // treat as plain text block below
    }
  }

  if (paragraphBlocks.length > 0) {
    return paragraphBlocks.join('\n\n')
  }

  const firstItem = contents[0]
  return typeof firstItem === 'string'
    ? firstItem
    : JSON.stringify(firstItem ?? { type: 'doc', content: [] })
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

function getProjectDocuments(state: LocalWriterState, projectId: string): LocalDocumentRecord[] {
  return state.documents
    .filter((document) => document.projectId === projectId)
    .sort((left, right) => {
      const orderDelta = Number(left.order || 0) - Number(right.order || 0)
      if (orderDelta !== 0) {
        return orderDelta
      }
      return left.createdAt.localeCompare(right.createdAt)
    })
}

function getProjectCharacters(state: LocalWriterState, projectId: string): LocalCharacterRecord[] {
  return state.characters
    .filter((character) => character.projectId === projectId)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
}

function getProjectCharacterRelations(
  state: LocalWriterState,
  projectId: string,
  characterId?: string,
): LocalCharacterRelationRecord[] {
  return state.characterRelations
    .filter((relation) => relation.projectId === projectId)
    .filter((relation) =>
      characterId ? relation.fromId === characterId || relation.toId === characterId : true,
    )
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
}

function getProjectLocations(state: LocalWriterState, projectId: string): LocalLocationRecord[] {
  return state.locations
    .filter((location) => location.projectId === projectId)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
}

function getProjectConcepts(state: LocalWriterState, projectId: string): LocalConceptRecord[] {
  return state.concepts
    .filter((concept) => concept.projectId === projectId)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
}

function getProjectLocationRelations(
  state: LocalWriterState,
  projectId: string,
  locationId?: string,
): LocalLocationRelationRecord[] {
  return state.locationRelations
    .filter((relation) => relation.projectId === projectId)
    .filter((relation) =>
      locationId ? relation.fromId === locationId || relation.toId === locationId : true,
    )
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
}

function getProjectTimelines(state: LocalWriterState, projectId: string): LocalTimelineRecord[] {
  return state.timelines
    .filter((timeline) => timeline.projectId === projectId)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
}

function getTimelineEvents(state: LocalWriterState, timelineId: string): LocalTimelineEventRecord[] {
  return state.timelineEvents
    .filter((event) => event.timelineId === timelineId)
    .sort((left, right) => {
      const leftTime = JSON.stringify(left.storyTime || {})
      const rightTime = JSON.stringify(right.storyTime || {})
      return leftTime.localeCompare(rightTime) || left.createdAt.localeCompare(right.createdAt)
    })
}

function enrichProjectSummary(
  project: LocalProjectRecord,
  documents: LocalDocumentRecord[],
): ProjectSummary {
  const chapterCount = documents.filter((document) => document.type === DocumentType.CHAPTER).length
  const totalWords = documents.reduce((sum, document) => sum + Number(document.wordCount || 0), 0)

  return {
    id: project.id,
    title: project.title,
    summary: project.summary,
    coverUrl: project.coverUrl,
    category: project.category,
    tags: project.tags,
    status: project.status,
    visibility: project.visibility,
    chapterCount,
    totalWords,
    wordCount: totalWords,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    lastUpdateTime: project.updatedAt,
  }
}

function buildProjectDetail(
  state: LocalWriterState,
  project: LocalProjectRecord,
): ProjectDetailResponse {
  const documents = getProjectDocuments(state, project.id)
  const characters = getProjectCharacters(state, project.id)
  const locations = getProjectLocations(state, project.id)
  const timelines = getProjectTimelines(state, project.id)
  const summary = enrichProjectSummary(project, documents)

  return {
    id: project.id,
    title: project.title,
    description: project.summary,
    coverImage: project.coverUrl,
    genre: project.category,
    tags: project.tags,
    status: project.status,
    visibility: project.visibility,
    totalWords: summary.totalWords || 0,
    chapterCount: summary.chapterCount || 0,
    lastUpdateTime: project.updatedAt,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    documents: documents.map((document) => ({
      id: document.id,
      title: document.title,
      type: document.type,
      wordCount: document.wordCount,
      lastEditAt: document.updatedAt || project.updatedAt,
      status: String(document.status || DocumentStatus.WRITING),
      sortOrder: Number(document.order || 0),
    })),
    characters,
    locations,
    timeline: timelines.flatMap((timeline) => getTimelineEvents(state, timeline.id)),
  }
}

function cloneDocument(document: LocalDocumentRecord): LocalDocumentRecord {
  return {
    ...document,
    children: Array.isArray(document.children) ? document.children.map(cloneDocument) : undefined,
  }
}

function cloneLocation(location: LocalLocationRecord): LocalLocationRecord {
  return {
    ...location,
    children: Array.isArray(location.children) ? location.children.map(cloneLocation) : undefined,
  }
}

function buildDocumentTree(documents: LocalDocumentRecord[]): LocalDocumentRecord[] {
  const nodes: LocalDocumentRecord[] = documents.map((document) => ({
    ...cloneDocument(document),
    children: [] as LocalDocumentRecord[],
  }))
  const nodeMap = new Map(nodes.map((document) => [document.id, document]))
  const roots: LocalDocumentRecord[] = []

  for (const node of nodes) {
    const parentId = node.parentId
    if (!parentId || !nodeMap.has(parentId)) {
      roots.push(node)
      continue
    }

    nodeMap.get(parentId)?.children?.push(node)
  }

  const sortTree = (items: LocalDocumentRecord[]) => {
    items.sort((left, right) => Number(left.order || 0) - Number(right.order || 0))
    for (const item of items) {
      if (item.children?.length) {
        sortTree(item.children)
      }
    }
  }

  sortTree(roots)
  return roots
}

function buildLocationTree(locations: LocalLocationRecord[]): LocalLocationRecord[] {
  const nodes = locations.map((location) => ({
    ...cloneLocation(location),
    children: [] as LocalLocationRecord[],
  }))
  const nodeMap = new Map(nodes.map((location) => [location.id, location]))
  const roots: LocalLocationRecord[] = []

  for (const node of nodes) {
    const parentId = node.parentId
    if (!parentId || !nodeMap.has(parentId)) {
      roots.push(node)
      continue
    }

    nodeMap.get(parentId)?.children?.push(node)
  }

  const sortTree = (items: LocalLocationRecord[]) => {
    items.sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    for (const item of items) {
      if (item.children?.length) {
        sortTree(item.children)
      }
    }
  }

  sortTree(roots)
  return roots
}

function buildContentResponse(
  state: LocalWriterState,
  documentId: string,
): DocumentContentResponse {
  const contentRecord = state.contents[documentId]
  const content = contentRecord?.content || ''
  const plainText = extractPlainText(content)
  const charCount = plainText.length

  return {
    id: `content-${documentId}`,
    documentId,
    content,
    contentType: (contentRecord?.contentType as any) || 'tiptap_json',
    wordCount: countWords(content),
    charCount,
    version: Number(contentRecord?.version || 1),
    lastSavedAt: contentRecord?.lastSavedAt || nowIso(),
    lastEditedBy: 'standalone-local',
    updatedAt: contentRecord?.updatedAt || nowIso(),
    createdAt: contentRecord?.createdAt || nowIso(),
  }
}

function touchProject(state: LocalWriterState, projectId: string): void {
  const project = state.projects.find((item) => item.id === projectId)
  if (project) {
    project.updatedAt = nowIso()
  }
}

function scrubDeletedEntityRefs(state: LocalWriterState, key: 'characterIds' | 'locationIds', entityId: string) {
  for (const document of state.documents) {
    const existing = Array.isArray(document[key]) ? document[key] : []
    if (existing.includes(entityId)) {
      document[key] = existing.filter((item) => item !== entityId) as never
      document.updatedAt = nowIso()
    }
  }
}

function removeDocumentRecursively(state: LocalWriterState, documentId: string): void {
  const children = state.documents.filter((document) => document.parentId === documentId)
  for (const child of children) {
    removeDocumentRecursively(state, child.id)
  }

  state.documents = state.documents.filter((document) => document.id !== documentId)
  delete state.contents[documentId]
}

function getDocumentOrThrow(state: LocalWriterState, documentId: string): LocalDocumentRecord {
  const document = state.documents.find((item) => item.id === documentId)
  if (!document) {
    throw new Error(`文档不存在: ${documentId}`)
  }
  return document
}

function getCharacterOrThrow(state: LocalWriterState, characterId: string): LocalCharacterRecord {
  const character = state.characters.find((item) => item.id === characterId)
  if (!character) {
    throw new Error(`角色不存在: ${characterId}`)
  }
  return character
}

function getLocationOrThrow(state: LocalWriterState, locationId: string): LocalLocationRecord {
  const location = state.locations.find((item) => item.id === locationId)
  if (!location) {
    throw new Error(`地点不存在: ${locationId}`)
  }
  return location
}

function getConceptOrThrow(state: LocalWriterState, conceptId: string): LocalConceptRecord {
  const concept = state.concepts.find((item) => item.id === conceptId)
  if (!concept) {
    throw new Error(`概念不存在: ${conceptId}`)
  }
  return concept
}

function getTimelineOrThrow(state: LocalWriterState, timelineId: string): LocalTimelineRecord {
  const timeline = state.timelines.find((item) => item.id === timelineId)
  if (!timeline) {
    throw new Error(`时间线不存在: ${timelineId}`)
  }
  return timeline
}

function getTimelineEventOrThrow(
  state: LocalWriterState,
  eventId: string,
): LocalTimelineEventRecord {
  const event = state.timelineEvents.find((item) => item.id === eventId)
  if (!event) {
    throw new Error(`时间线事件不存在: ${eventId}`)
  }
  return event
}

function getEntityStateFields(
  state: LocalWriterState,
  entityId: string,
): Record<string, StateValue> | undefined {
  return state.entityStateFields[entityId]
}

function removeLocationRecursively(state: LocalWriterState, locationId: string): string[] {
  const children = state.locations.filter((location) => location.parentId === locationId)
  const removedIds = [locationId]
  for (const child of children) {
    removedIds.push(...removeLocationRecursively(state, child.id))
  }

  state.locations = state.locations.filter((location) => location.id !== locationId)
  state.locationRelations = state.locationRelations.filter(
    (relation) => relation.fromId !== locationId && relation.toId !== locationId,
  )
  return removedIds
}

function ensureProjectDefaultTimeline(
  state: LocalWriterState,
  projectId: string,
): LocalTimelineRecord {
  const existing = getProjectTimelines(state, projectId)[0]
  if (existing) {
    return existing
  }

  const createdAt = nowIso()
  const timeline: LocalTimelineRecord = {
    id: createId('local-timeline'),
    projectId,
    name: '主时间线',
    description: '',
    createdAt,
    updatedAt: createdAt,
  }
  state.timelines.push(timeline)
  touchProject(state, projectId)
  writeState(state)
  return timeline
}

function mapConceptToEntitySummary(
  state: LocalWriterState,
  concept: LocalConceptRecord,
): EntitySummary {
  return {
    id: concept.id,
    name: concept.name,
    entityType: 'concept',
    summary: concept.summary || concept.description || '',
    stateFields: getEntityStateFields(state, concept.id),
  }
}

function updateSiblingOrder(
  state: LocalWriterState,
  projectId: string,
  parentId: string | undefined,
  movedId?: string,
  preferredOrder?: number,
): void {
  const siblings = state.documents
    .filter(
      (document) =>
        document.projectId === projectId &&
        (document.parentId || undefined) === (parentId || undefined),
    )
    .sort((left, right) => Number(left.order || 0) - Number(right.order || 0))

  if (movedId) {
    const movedIndex = siblings.findIndex((item) => item.id === movedId)
    if (movedIndex >= 0) {
      const [moved] = siblings.splice(movedIndex, 1)
      const nextIndex =
        typeof preferredOrder === 'number' && preferredOrder >= 0
          ? Math.min(preferredOrder, siblings.length)
          : siblings.length
      siblings.splice(nextIndex, 0, moved)
    }
  }

  siblings.forEach((document, index) => {
    document.order = index
  })
}

function resolveNextDocumentOrder(
  state: LocalWriterState,
  projectId: string,
  parentId: string | undefined,
): number {
  const siblingOrders = state.documents
    .filter(
      (document) =>
        document.projectId === projectId &&
        (document.parentId || undefined) === (parentId || undefined),
    )
    .map((document) => Number(document.order || 0))
    .filter((order) => Number.isFinite(order))

  if (siblingOrders.length === 0) {
    return 0
  }

  return Math.max(...siblingOrders) + 1
}

async function listProjects(): Promise<ProjectListResponse> {
  const state = readState()
  const projects = state.projects.map((project) =>
    enrichProjectSummary(project, getProjectDocuments(state, project.id)),
  )

  return {
    projects,
    total: projects.length,
    page: 1,
    size: projects.length,
    pageSize: projects.length,
  }
}

async function createProject(data: CreateProjectRequest): Promise<ProjectDetailResponse> {
  const state = readState()
  const createdAt = nowIso()
  const project: LocalProjectRecord = {
    id: createId('local-project'),
    title: data.title?.trim() || '未命名项目',
    summary: data.summary || data.description || '',
    coverUrl: data.coverUrl || data.coverImage || '',
    category: data.category || data.genre || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    status: 'draft',
    visibility: data.visibility || 'private',
    createdAt,
    updatedAt: createdAt,
  }

  state.projects.unshift(project)
  writeState(state)
  return buildProjectDetail(state, project)
}

async function getProject(projectId: string): Promise<ProjectDetailResponse> {
  const state = readState()
  const project = state.projects.find((item) => item.id === projectId)
  if (!project) {
    throw new Error(`项目不存在: ${projectId}`)
  }
  return buildProjectDetail(state, project)
}

async function updateProject(projectId: string, data: UpdateProjectRequest): Promise<void> {
  const state = readState()
  const project = state.projects.find((item) => item.id === projectId)
  if (!project) {
    throw new Error(`项目不存在: ${projectId}`)
  }

  project.title = data.title?.trim() || project.title
  project.summary = data.description ?? project.summary
  project.coverUrl = data.coverImage ?? project.coverUrl
  project.category = data.genre ?? project.category
  project.tags = Array.isArray(data.tags) ? data.tags : project.tags
  project.status = data.status || project.status
  project.visibility = data.visibility || project.visibility
  project.updatedAt = nowIso()
  writeState(state)
}

async function deleteProject(projectId: string): Promise<void> {
  const state = readState()
  state.projects = state.projects.filter((project) => project.id !== projectId)
  const projectDocumentIds = state.documents
    .filter((document) => document.projectId === projectId)
    .map((document) => document.id)
  state.documents = state.documents.filter((document) => document.projectId !== projectId)
  for (const documentId of projectDocumentIds) {
    delete state.contents[documentId]
  }
  writeState(state)
}

async function listDocuments(projectId: string): Promise<{ documents: Document[]; total: number }> {
  const state = readState()
  const documents = getProjectDocuments(state, projectId).map(cloneDocument)
  return {
    documents,
    total: documents.length,
  }
}

async function getDocumentTree(projectId: string): Promise<Document[]> {
  const state = readState()
  return buildDocumentTree(getProjectDocuments(state, projectId))
}

async function getDocument(documentId: string): Promise<Document> {
  const state = readState()
  return cloneDocument(getDocumentOrThrow(state, documentId))
}

async function createDocument(projectId: string, data: CreateDocumentRequest): Promise<Document> {
  const state = readState()
  const createdAt = nowIso()
  const parentId = isRootParent(data.parentId) ? undefined : data.parentId
  const order =
    typeof data.order === 'number' && Number.isFinite(data.order)
      ? data.order
      : resolveNextDocumentOrder(state, projectId, parentId)
  const document: LocalDocumentRecord = {
    id: createId('local-doc'),
    documentId: undefined,
    projectId,
    parentId,
    title: data.title?.trim() || '未命名文档',
    type: data.type,
    level: parentId ? 1 : 0,
    order,
    status: DocumentStatus.WRITING,
    wordCount: 0,
    createdAt,
    updatedAt: createdAt,
    children: [],
  }

  state.documents.push(document)
  state.contents[document.id] = {
    documentId: document.id,
    content: buildDefaultDocumentContent(document.title),
    contentType: 'tiptap_json',
    version: 1,
    createdAt,
    updatedAt: createdAt,
    lastSavedAt: createdAt,
  }
  updateSiblingOrder(state, projectId, document.parentId, document.id, document.order)
  touchProject(state, projectId)
  writeState(state)
  return cloneDocument(document)
}

async function updateDocument(documentId: string, data: UpdateDocumentMetaRequest): Promise<void> {
  const state = readState()
  const document = getDocumentOrThrow(state, documentId)
  const previousTitle = document.title

  if (data.title?.trim()) {
    document.title = data.title.trim()
  }
  if (data.status) {
    document.status = data.status
  }
  if (Array.isArray(data.characterIds)) {
    document.characterIds = data.characterIds
  }
  if (Array.isArray(data.locationIds)) {
    document.locationIds = data.locationIds
  }
  if (Array.isArray(data.timelineIds)) {
    document.timelineIds = data.timelineIds
  }
  if (Array.isArray(data.tags)) {
    document.tags = data.tags
  }
  if (typeof data.notes === 'string') {
    document.notes = data.notes
  }
  if (Array.isArray(data.plotThreads)) {
    document.plotThreads = data.plotThreads
  }

  document.updatedAt = nowIso()

  const contentRecord = state.contents[documentId]
  if (contentRecord && contentRecord.content === buildDefaultDocumentContent(previousTitle)) {
    contentRecord.content = buildDefaultDocumentContent(document.title)
    contentRecord.version += 1
    contentRecord.updatedAt = document.updatedAt
    contentRecord.lastSavedAt = document.updatedAt
  }

  touchProject(state, document.projectId)
  writeState(state)
}

async function deleteDocument(documentId: string): Promise<void> {
  const state = readState()
  const document = getDocumentOrThrow(state, documentId)
  removeDocumentRecursively(state, documentId)
  updateSiblingOrder(state, document.projectId, document.parentId)
  touchProject(state, document.projectId)
  writeState(state)
}

async function moveDocument(
  documentId: string,
  data: { parentId?: string; order?: number },
): Promise<{ code: number; message: string }> {
  const state = readState()
  const document = getDocumentOrThrow(state, documentId)
  const previousParentId = document.parentId
  document.parentId = isRootParent(data.parentId) ? undefined : data.parentId
  document.level = document.parentId ? 1 : 0
  document.updatedAt = nowIso()

  updateSiblingOrder(state, document.projectId, previousParentId)
  updateSiblingOrder(state, document.projectId, document.parentId, documentId, data.order)
  touchProject(state, document.projectId)
  writeState(state)
  return { code: 200, message: 'ok' }
}

async function getContent(documentId: string): Promise<DocumentContentResponse> {
  const state = readState()
  getDocumentOrThrow(state, documentId)
  return buildContentResponse(state, documentId)
}

async function updateContent(documentId: string, data: UpdateContentRequest): Promise<void> {
  const state = readState()
  const document = getDocumentOrThrow(state, documentId)
  const existing = state.contents[documentId]
  const updatedAt = nowIso()
  const nextVersion = Math.max(Number(existing?.version || 0) + 1, Number(data.version || 0) + 1)

  state.contents[documentId] = {
    documentId,
    content: data.content || '',
    contentType: 'tiptap_json',
    version: nextVersion,
    createdAt: existing?.createdAt || updatedAt,
    updatedAt,
    lastSavedAt: updatedAt,
  }
  document.wordCount = countWords(data.content || '')
  document.updatedAt = updatedAt
  touchProject(state, document.projectId)
  writeState(state)
}

async function autoSave(documentId: string, data: AutoSaveRequest): Promise<AutoSaveResponse> {
  await updateContent(documentId, data)
  const saved = await getContent(documentId)
  return {
    version: saved.version,
    lastSavedAt: saved.lastSavedAt,
    status: 'success',
  }
}

async function getSaveStatus(documentId: string): Promise<SaveStatusResponse> {
  const content = await getContent(documentId)
  return {
    isSaved: true,
    lastSavedAt: content.lastSavedAt,
    version: content.version,
    lastEditedBy: 'standalone-local',
  }
}

async function getContents(documentId: string): Promise<{ contents: Array<Record<string, unknown>> }> {
  const content = await getContent(documentId)
  return {
    contents: [
      {
        paragraphId: `p-${documentId}`,
        order: 1,
        content: content.content,
        contentType: content.contentType,
        version: content.version,
        updatedAt: content.updatedAt,
      },
    ],
  }
}

async function replaceContents(documentId: string, contents: unknown[]): Promise<void> {
  await updateContent(documentId, {
    documentId,
    content: normalizeStoredContent(contents),
    version: 1,
  })
}

async function reindexContents(_documentId?: string): Promise<void> {
  return
}

async function listCharacters(projectId: string): Promise<Character[]> {
  const state = readState()
  return getProjectCharacters(state, projectId).map((character) => ({ ...character }))
}

async function getCharacter(characterId: string): Promise<Character> {
  const state = readState()
  return { ...getCharacterOrThrow(state, characterId) }
}

async function createCharacter(
  projectId: string,
  data: CreateCharacterRequest,
): Promise<Character> {
  const state = readState()
  const createdAt = nowIso()
  const character: LocalCharacterRecord = {
    id: createId('local-character'),
    projectId,
    name: data.name.trim(),
    alias: normalizeStringArray(data.alias),
    summary: data.summary || '',
    traits: normalizeStringArray(data.traits),
    background: data.background || '',
    avatarUrl: data.avatarUrl || '',
    personalityPrompt: data.personalityPrompt || '',
    speechPattern: data.speechPattern || '',
    currentState: '',
    customStatus: data.customStatus,
    createdAt,
    updatedAt: createdAt,
  }

  state.characters.push(character)
  touchProject(state, projectId)
  writeState(state)
  return { ...character }
}

async function updateCharacter(
  characterId: string,
  data: UpdateCharacterRequest,
): Promise<Character> {
  const state = readState()
  const character = getCharacterOrThrow(state, characterId)

  if (typeof data.name === 'string' && data.name.trim()) {
    character.name = data.name.trim()
  }
  if (Array.isArray(data.alias)) {
    character.alias = normalizeStringArray(data.alias)
  }
  if (typeof data.summary === 'string') {
    character.summary = data.summary
  }
  if (Array.isArray(data.traits)) {
    character.traits = normalizeStringArray(data.traits)
  }
  if (typeof data.background === 'string') {
    character.background = data.background
  }
  if (typeof data.avatarUrl === 'string') {
    character.avatarUrl = data.avatarUrl
  }
  if (typeof data.personalityPrompt === 'string') {
    character.personalityPrompt = data.personalityPrompt
  }
  if (typeof data.speechPattern === 'string') {
    character.speechPattern = data.speechPattern
  }
  if (typeof data.currentState === 'string') {
    character.currentState = data.currentState
  }
  if (data.customStatus) {
    character.customStatus = data.customStatus
  }

  character.updatedAt = nowIso()
  touchProject(state, character.projectId)
  writeState(state)
  return { ...character }
}

async function deleteCharacter(characterId: string): Promise<void> {
  const state = readState()
  const character = getCharacterOrThrow(state, characterId)
  state.characters = state.characters.filter((item) => item.id !== characterId)
  state.characterRelations = state.characterRelations.filter(
    (relation) => relation.fromId !== characterId && relation.toId !== characterId,
  )
  scrubDeletedEntityRefs(state, 'characterIds', characterId)
  touchProject(state, character.projectId)
  writeState(state)
}

async function listCharacterRelations(
  projectId: string,
  characterId?: string,
): Promise<CharacterRelation[]> {
  const state = readState()
  return getProjectCharacterRelations(state, projectId, characterId).map((relation) => ({
    ...relation,
  }))
}

async function createCharacterRelation(
  projectId: string,
  data: SaveRelationRequest,
): Promise<CharacterRelation> {
  const state = readState()
  getCharacterOrThrow(state, data.fromId)
  getCharacterOrThrow(state, data.toId)

  const createdAt = nowIso()
  const relation: LocalCharacterRelationRecord = {
    id: createId('local-character-relation'),
    projectId,
    fromId: data.fromId,
    toId: data.toId,
    type: data.type,
    strength: Number(data.strength ?? 50),
    notes: data.notes || '',
    createdAt,
    updatedAt: createdAt,
  }

  state.characterRelations.push(relation)
  touchProject(state, projectId)
  writeState(state)
  return { ...relation }
}

async function deleteCharacterRelation(relationId: string): Promise<void> {
  const state = readState()
  const relation = state.characterRelations.find((item) => item.id === relationId)
  if (!relation) {
    throw new Error(`角色关系不存在: ${relationId}`)
  }

  state.characterRelations = state.characterRelations.filter((item) => item.id !== relationId)
  touchProject(state, relation.projectId)
  writeState(state)
}

async function getCharacterGraph(projectId: string): Promise<CharacterGraph> {
  const state = readState()
  return {
    characters: getProjectCharacters(state, projectId).map((character) => ({ ...character })),
    relations: getProjectCharacterRelations(state, projectId).map((relation) => ({ ...relation })),
  }
}

async function listLocations(projectId: string): Promise<Location[]> {
  const state = readState()
  return getProjectLocations(state, projectId).map((location) => ({ ...location }))
}

async function getLocationTree(projectId: string): Promise<Location[]> {
  const state = readState()
  return buildLocationTree(getProjectLocations(state, projectId))
}

async function getLocation(locationId: string): Promise<Location> {
  const state = readState()
  return { ...getLocationOrThrow(state, locationId) }
}

async function createLocation(projectId: string, data: SaveLocationRequest): Promise<Location> {
  const state = readState()
  const createdAt = nowIso()
  const location: LocalLocationRecord = {
    id: createId('local-location'),
    projectId,
    name: data.name.trim(),
    description: data.description || '',
    climate: data.climate || '',
    culture: data.culture || '',
    geography: data.geography || '',
    atmosphere: data.atmosphere || '',
    parentId: data.parentId || undefined,
    imageUrl: data.imageUrl || '',
    createdAt,
    updatedAt: createdAt,
  }

  state.locations.push(location)
  touchProject(state, projectId)
  writeState(state)
  return { ...location }
}

async function updateLocation(locationId: string, data: SaveLocationRequest): Promise<Location> {
  const state = readState()
  const location = getLocationOrThrow(state, locationId)

  if (typeof data.name === 'string' && data.name.trim()) {
    location.name = data.name.trim()
  }
  if (typeof data.description === 'string') {
    location.description = data.description
  }
  if (typeof data.climate === 'string') {
    location.climate = data.climate
  }
  if (typeof data.culture === 'string') {
    location.culture = data.culture
  }
  if (typeof data.geography === 'string') {
    location.geography = data.geography
  }
  if (typeof data.atmosphere === 'string') {
    location.atmosphere = data.atmosphere
  }
  if (typeof data.imageUrl === 'string') {
    location.imageUrl = data.imageUrl
  }
  if ('parentId' in data) {
    location.parentId = data.parentId || undefined
  }

  location.updatedAt = nowIso()
  touchProject(state, location.projectId)
  writeState(state)
  return { ...location }
}

async function deleteLocation(locationId: string): Promise<void> {
  const state = readState()
  const location = getLocationOrThrow(state, locationId)
  const removedIds = removeLocationRecursively(state, locationId)
  for (const removedId of removedIds) {
    scrubDeletedEntityRefs(state, 'locationIds', removedId)
  }
  touchProject(state, location.projectId)
  writeState(state)
}

async function listLocationRelations(
  projectId: string,
  locationId?: string,
): Promise<LocationRelation[]> {
  const state = readState()
  return getProjectLocationRelations(state, projectId, locationId).map((relation) => ({
    ...relation,
  }))
}

async function createLocationRelation(
  projectId: string,
  data: SaveLocationRelationRequest,
): Promise<LocationRelation> {
  const state = readState()
  getLocationOrThrow(state, data.fromId)
  getLocationOrThrow(state, data.toId)

  const createdAt = nowIso()
  const relation: LocalLocationRelationRecord = {
    id: createId('local-location-relation'),
    projectId,
    fromId: data.fromId,
    toId: data.toId,
    type: data.type,
    distance: data.distance || '',
    notes: data.notes || '',
    createdAt,
    updatedAt: createdAt,
  }

  state.locationRelations.push(relation)
  touchProject(state, projectId)
  writeState(state)
  return { ...relation }
}

async function deleteLocationRelation(relationId: string): Promise<void> {
  const state = readState()
  const relation = state.locationRelations.find((item) => item.id === relationId)
  if (!relation) {
    throw new Error(`地点关系不存在: ${relationId}`)
  }

  state.locationRelations = state.locationRelations.filter((item) => item.id !== relationId)
  touchProject(state, relation.projectId)
  writeState(state)
}

async function listConcepts(projectId: string): Promise<Concept[]> {
  const state = readState()
  return getProjectConcepts(state, projectId).map((concept) => ({ ...concept }))
}

async function getConcept(conceptId: string): Promise<Concept> {
  const state = readState()
  return { ...getConceptOrThrow(state, conceptId) }
}

async function createConcept(projectId: string, data: CreateConceptRequest): Promise<Concept> {
  const state = readState()
  const createdAt = nowIso()
  const concept: LocalConceptRecord = {
    id: createId('local-concept'),
    projectId,
    name: data.name.trim(),
    alias: normalizeStringArray(data.alias),
    summary: data.summary || '',
    description: data.description || '',
    category: data.category || '',
    relatedConcepts: [],
    relatedCharacters: [],
    relatedLocations: [],
    relatedItems: [],
    createdAt,
    updatedAt: createdAt,
  }

  state.concepts.push(concept)
  touchProject(state, projectId)
  writeState(state)
  return { ...concept }
}

async function updateConcept(conceptId: string, data: UpdateConceptRequest): Promise<Concept> {
  const state = readState()
  const concept = getConceptOrThrow(state, conceptId)

  if (typeof data.name === 'string' && data.name.trim()) {
    concept.name = data.name.trim()
  }
  if (Array.isArray(data.alias)) {
    concept.alias = normalizeStringArray(data.alias)
  }
  if (typeof data.summary === 'string') {
    concept.summary = data.summary
  }
  if (typeof data.description === 'string') {
    concept.description = data.description
  }
  if (typeof data.category === 'string') {
    concept.category = data.category
  }
  if (Array.isArray(data.relatedConcepts)) {
    concept.relatedConcepts = data.relatedConcepts
  }
  if (Array.isArray(data.relatedCharacters)) {
    concept.relatedCharacters = data.relatedCharacters
  }
  if (Array.isArray(data.relatedLocations)) {
    concept.relatedLocations = data.relatedLocations
  }
  if (Array.isArray(data.relatedItems)) {
    concept.relatedItems = data.relatedItems
  }

  concept.updatedAt = nowIso()
  touchProject(state, concept.projectId)
  writeState(state)
  return { ...concept }
}

async function deleteConcept(conceptId: string): Promise<void> {
  const state = readState()
  const concept = getConceptOrThrow(state, conceptId)
  state.concepts = state.concepts.filter((item) => item.id !== conceptId)
  delete state.entityStateFields[conceptId]
  touchProject(state, concept.projectId)
  writeState(state)
}

async function listTimelines(projectId: string): Promise<Timeline[]> {
  const state = readState()
  ensureProjectDefaultTimeline(state, projectId)
  const nextState = readState()
  return getProjectTimelines(nextState, projectId).map((timeline) => ({ ...timeline }))
}

async function createTimeline(projectId: string, data: SaveTimelineRequest): Promise<Timeline> {
  const state = readState()
  const createdAt = nowIso()
  const timeline: LocalTimelineRecord = {
    id: createId('local-timeline'),
    projectId,
    name: data.name.trim(),
    description: data.description || '',
    startTime: data.startTime,
    endTime: data.endTime,
    createdAt,
    updatedAt: createdAt,
  }

  state.timelines.push(timeline)
  touchProject(state, projectId)
  writeState(state)
  return { ...timeline }
}

async function getTimeline(timelineId: string): Promise<Timeline> {
  const state = readState()
  return { ...getTimelineOrThrow(state, timelineId) }
}

async function deleteTimeline(timelineId: string): Promise<void> {
  const state = readState()
  const timeline = getTimelineOrThrow(state, timelineId)
  state.timelines = state.timelines.filter((item) => item.id !== timelineId)
  state.timelineEvents = state.timelineEvents.filter((item) => item.timelineId !== timelineId)
  touchProject(state, timeline.projectId)
  writeState(state)
}

async function getTimelineVisualization(timelineId: string): Promise<{ events: TimelineEvent[]; links: [] }> {
  const state = readState()
  return {
    events: getTimelineEvents(state, timelineId).map((event) => ({ ...event })),
    links: [],
  }
}

async function listTimelineEvents(timelineId: string): Promise<TimelineEvent[]> {
  const state = readState()
  return getTimelineEvents(state, timelineId).map((event) => ({ ...event }))
}

async function createTimelineEvent(
  timelineId: string,
  projectId: string,
  data: SaveTimelineEventRequest,
): Promise<TimelineEvent> {
  const state = readState()
  getTimelineOrThrow(state, timelineId)
  const createdAt = nowIso()
  const event: LocalTimelineEventRecord = {
    id: createId('local-timeline-event'),
    projectId,
    timelineId,
    title: data.title.trim(),
    description: data.description || '',
    storyTime: data.storyTime,
    duration: data.duration || '',
    impact: data.impact || '',
    participants: Array.isArray(data.participants) ? data.participants : [],
    locationIds: Array.isArray(data.locationIds) ? data.locationIds : [],
    chapterIds: Array.isArray(data.chapterIds) ? data.chapterIds : [],
    eventType: data.eventType,
    importance: Number(data.importance ?? 5),
    createdAt,
    updatedAt: createdAt,
  }

  state.timelineEvents.push(event)
  const timeline = getTimelineOrThrow(state, timelineId)
  timeline.updatedAt = createdAt
  touchProject(state, projectId)
  writeState(state)
  return { ...event }
}

async function getTimelineEvent(eventId: string): Promise<TimelineEvent> {
  const state = readState()
  return { ...getTimelineEventOrThrow(state, eventId) }
}

async function updateTimelineEvent(
  eventId: string,
  projectId: string,
  data: SaveTimelineEventRequest,
): Promise<TimelineEvent> {
  const state = readState()
  const event = getTimelineEventOrThrow(state, eventId)

  if (typeof data.title === 'string' && data.title.trim()) {
    event.title = data.title.trim()
  }
  if (typeof data.description === 'string') {
    event.description = data.description
  }
  if (data.storyTime) {
    event.storyTime = data.storyTime
  }
  if (typeof data.duration === 'string') {
    event.duration = data.duration
  }
  if (typeof data.impact === 'string') {
    event.impact = data.impact
  }
  if (Array.isArray(data.participants)) {
    event.participants = data.participants
  }
  if (Array.isArray(data.locationIds)) {
    event.locationIds = data.locationIds
  }
  if (Array.isArray(data.chapterIds)) {
    event.chapterIds = data.chapterIds
  }
  event.eventType = data.eventType
  event.importance = Number(data.importance ?? event.importance)
  event.updatedAt = nowIso()

  const timeline = getTimelineOrThrow(state, event.timelineId)
  timeline.updatedAt = event.updatedAt
  touchProject(state, projectId)
  writeState(state)
  return { ...event }
}

async function deleteTimelineEvent(eventId: string, projectId: string): Promise<void> {
  const state = readState()
  const event = getTimelineEventOrThrow(state, eventId)
  state.timelineEvents = state.timelineEvents.filter((item) => item.id !== eventId)
  const timeline = getTimelineOrThrow(state, event.timelineId)
  timeline.updatedAt = nowIso()
  touchProject(state, projectId)
  writeState(state)
}

function buildLocalEntitySummaryList(
  state: LocalWriterState,
  projectId: string,
  entityType?: EntitySummary['entityType'],
): EntitySummary[] {
  const characterSummaries = getProjectCharacters(state, projectId).map((character) => ({
    id: character.id,
    name: character.name,
    entityType: 'character' as const,
    summary: character.summary || '',
    stateFields: getEntityStateFields(state, character.id),
  }))
  const locationSummaries = getProjectLocations(state, projectId).map((location) => ({
    id: location.id,
    name: location.name,
    entityType: 'location' as const,
    summary: location.description || '',
    stateFields: getEntityStateFields(state, location.id),
  }))
  const conceptSummaries = getProjectConcepts(state, projectId).map((concept) =>
    mapConceptToEntitySummary(state, concept),
  )
  const genericEntitySummaries = state.genericEntities
    .filter((entity) => entity.projectId === projectId)
    .map((item) => ({
      id: item.id,
      name: item.name,
      entityType: item.entityType,
      alias: item.alias || [],
      summary: item.summary || '',
      stateFields: getEntityStateFields(state, item.id),
    }))

  const all = [
    ...characterSummaries,
    ...locationSummaries,
    ...genericEntitySummaries,
    ...conceptSummaries,
  ]
  return entityType ? all.filter((entity) => entity.entityType === entityType) : all
}

async function createLocalEntity(payload: {
  projectId: string
  type: 'item' | 'organization'
  name: string
  alias?: string[]
  summary?: string
}): Promise<EntitySummary> {
  const state = migrateLegacyWriterItemsForProject(readState(), payload.projectId)
  const createdAt = nowIso()
  const entity: LocalGenericEntityRecord = {
    id: createId(`local-${payload.type}`),
    projectId: payload.projectId,
    entityType: payload.type,
    name: payload.name.trim(),
    alias: normalizeStringArray(payload.alias),
    summary: payload.summary || '',
    createdAt,
    updatedAt: createdAt,
  }
  state.genericEntities.push(entity)
  touchProject(state, payload.projectId)
  writeState(state)

  return {
    id: entity.id,
    name: entity.name,
    entityType: payload.type,
    alias: entity.alias || [],
    summary: entity.summary || '',
    stateFields: getEntityStateFields(state, entity.id),
  }
}

async function updateLocalEntity(payload: {
  entityId: string
  projectId: string
  name: string
  alias?: string[]
  summary?: string
}): Promise<EntitySummary> {
  const state = migrateLegacyWriterItemsForProject(readState(), payload.projectId)
  const entity = state.genericEntities.find(
    (item) => item.id === payload.entityId && item.projectId === payload.projectId,
  )

  if (!entity) {
    throw new Error('未找到要更新的本地资产')
  }

  entity.name = payload.name.trim()
  entity.alias = normalizeStringArray(payload.alias)
  entity.summary = payload.summary || ''
  entity.updatedAt = nowIso()
  touchProject(state, payload.projectId)
  writeState(state)

  return {
    id: entity.id,
    name: entity.name,
    entityType: entity.entityType,
    alias: entity.alias || [],
    summary: entity.summary || '',
    stateFields: getEntityStateFields(state, entity.id),
  }
}

async function deleteLocalEntity(entityId: string, projectId: string): Promise<void> {
  const state = migrateLegacyWriterItemsForProject(readState(), projectId)
  state.genericEntities = state.genericEntities.filter((entity) => entity.id !== entityId)
  delete state.entityStateFields[entityId]
  touchProject(state, projectId)
  writeState(state)
}

async function listLocalEntities(
  projectId: string,
  entityType?: EntitySummary['entityType'],
): Promise<EntitySummary[]> {
  const state = migrateLegacyWriterItemsForProject(readState(), projectId)
  return buildLocalEntitySummaryList(state, projectId, entityType)
}

async function getLocalEntityGraph(projectId: string): Promise<EntityGraph> {
  const state = migrateLegacyWriterItemsForProject(readState(), projectId)
  const nodes = buildLocalEntitySummaryList(state, projectId)
  const edges = [
    ...getProjectCharacterRelations(state, projectId).map((relation) => ({
      fromId: relation.fromId,
      toId: relation.toId,
      fromType: 'character' as const,
      toType: 'character' as const,
      type: relation.type,
      strength: relation.strength,
      notes: relation.notes,
    })),
    ...getProjectLocationRelations(state, projectId).map((relation) => ({
      fromId: relation.fromId,
      toId: relation.toId,
      fromType: 'location' as const,
      toType: 'location' as const,
      type: relation.type,
      notes: relation.notes,
    })),
  ]

  return { nodes, edges }
}

async function updateLocalEntityStateFields(
  entityId: string,
  stateFields: Record<string, StateValue>,
): Promise<void> {
  const state = readState()
  state.entityStateFields[entityId] = stateFields
  writeState(state)
}

function mapDocumentToOutlineNode(document: Document): OutlineTreeNode {
  return {
    id: document.id,
    projectId: document.projectId,
    documentId: document.id,
    title: document.title,
    description: document.notes || '',
    order: Number(document.order || 0),
    level: Number(document.level || 0),
    parentId: document.parentId || undefined,
    wordCount: Number(document.wordCount || 0),
    status: (document.status as any) || 'draft',
    type: document.type,
    children: Array.isArray(document.children)
      ? document.children.map((child) => mapDocumentToOutlineNode(child))
      : [],
  }
}

async function getOutlineTree(projectId: string): Promise<OutlineTreeNode[]> {
  const tree = await getDocumentTree(projectId)
  return tree.map((document) => mapDocumentToOutlineNode(document))
}

async function createOutline(projectId: string, data: CreateOutlineRequest): Promise<OutlineTreeNode> {
  if (!data.parentId) {
    const created = await createDocument(projectId, {
      projectId,
      title: data.title,
      type: DocumentType.VOLUME,
      order: data.order,
    })
    return mapDocumentToOutlineNode(created)
  }

  if (data.documentId) {
    await moveDocument(data.documentId, {
      parentId: data.parentId,
      order: data.order,
    })
    if (data.title?.trim()) {
      await updateDocument(data.documentId, { title: data.title })
    }
    return mapDocumentToOutlineNode(await getDocument(data.documentId))
  }

  const created = await createDocument(projectId, {
    projectId,
    parentId: data.parentId,
    title: data.title,
    type: DocumentType.CHAPTER,
    order: data.order,
  })
  return mapDocumentToOutlineNode(created)
}

async function updateOutline(
  outlineId: string,
  _projectId: string,
  data: UpdateOutlineRequest,
): Promise<OutlineTreeNode> {
  if (typeof data.parentId === 'string' || typeof data.order === 'number') {
    await moveDocument(outlineId, {
      parentId: data.parentId,
      order: data.order,
    })
  }

  if (typeof data.title === 'string') {
    await updateDocument(outlineId, { title: data.title })
  }

  return mapDocumentToOutlineNode(await getDocument(outlineId))
}

async function deleteOutline(outlineId: string): Promise<void> {
  await deleteDocument(outlineId)
}

export const standaloneLocalBridge = {
  character: {
    list: listCharacters,
    get: getCharacter,
    create: createCharacter,
    update: updateCharacter,
    delete: deleteCharacter,
    listRelations: listCharacterRelations,
    createRelation: createCharacterRelation,
    deleteRelation: deleteCharacterRelation,
    getGraph: getCharacterGraph,
  },
  concept: {
    list: listConcepts,
    get: getConcept,
    create: createConcept,
    update: updateConcept,
    delete: deleteConcept,
  },
  entity: {
    create: createLocalEntity,
    update: updateLocalEntity,
    list: listLocalEntities,
    getGraph: getLocalEntityGraph,
    updateStateFields: updateLocalEntityStateFields,
    delete: deleteLocalEntity,
  },
  project: {
    list: listProjects,
    create: createProject,
    get: getProject,
    update: updateProject,
    delete: deleteProject,
  },
  document: {
    list: listDocuments,
    getTree: getDocumentTree,
    get: getDocument,
    create: createDocument,
    update: updateDocument,
    delete: deleteDocument,
    move: moveDocument,
  },
  editor: {
    getContent,
    updateContent,
    autoSave,
    getSaveStatus,
    getContents,
    replaceContents,
    reindexContents,
  },
  outline: {
    getTree: getOutlineTree,
    create: createOutline,
    update: updateOutline,
    delete: deleteOutline,
  },
  location: {
    list: listLocations,
    getTree: getLocationTree,
    get: getLocation,
    create: createLocation,
    update: updateLocation,
    delete: deleteLocation,
    listRelations: listLocationRelations,
    createRelation: createLocationRelation,
    deleteRelation: deleteLocationRelation,
  },
  timeline: {
    create: createTimeline,
    list: listTimelines,
    get: getTimeline,
    delete: deleteTimeline,
    getVisualization: getTimelineVisualization,
    createEvent: createTimelineEvent,
    listEvents: listTimelineEvents,
    getEvent: getTimelineEvent,
    updateEvent: updateTimelineEvent,
    deleteEvent: deleteTimelineEvent,
  },
}
