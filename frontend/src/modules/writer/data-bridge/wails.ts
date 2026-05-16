import {
  CreateChapter,
  CreateCharacter,
  CreateCharacterRelation,
  CreateInspirationNote,
  CreateLocation,
  CreateLocationRelation,
  CreateProject,
  CreateStoryHarnessBatch,
  CreateTimeline,
  CreateTimelineEvent,
  CreateVolume,
  DeleteChapter,
  DeleteCharacter,
  DeleteCharacterRelation,
  DeleteInspirationNote,
  DeleteLocation,
  DeleteLocationRelation,
  DeleteProject,
  DeleteTimeline,
  DeleteTimelineEvent,
  DeleteVolume,
  GetChapter,
  GetCharacter,
  GetCreativeWorkflow,
  GetLatestStoryHarnessBatch,
  GetLocation,
  GetProject,
  GetStoryHarnessChapterContext,
  GetTimeline,
  GetTimelineEvent,
  GetTimelineVisualization,
  GetWorkbenchTemplateDetail,
  ListChapters,
  ListCharacterRelations,
  ListCharacters,
  ListInspirationNotes,
  ListLocationRelations,
  ListLocations,
  ListProjects,
  ListStoryHarnessChangeRequests,
  ListTimelineEvents,
  ListTimelines,
  ListVolumes,
  ListWorkbenchTemplates,
  MoveChapter,
  ProcessStoryHarnessChangeRequest,
  RebuildStoryHarnessProjection,
  ReorderVolumes,
  SaveCreativeWorkflow,
  TriggerStoryHarnessIndex,
  UpdateChapter,
  UpdateCharacter,
  UpdateLocation,
  UpdateProject,
  UpdateTimeline,
  UpdateTimelineEvent,
  UpdateVolume,
} from '../../../../wailsjs/go/main/App'
import { DocumentType } from '../types/document'
import { calculateWritingWordCount } from '../utils/wordCount'

type BridgeProject = {
  id: string
  title: string
  description?: string
  coverPath?: string
  wordCount?: number
  status?: string
  chapterCount?: number
  createdAt?: string
  updatedAt?: string
}

type BridgeVolume = {
  id: string
  projectId: string
  title: string
  sortOrder: number
  createdAt?: string
}

type BridgeChapter = {
  id: string
  projectId: string
  volumeId?: string
  title: string
  content?: string
  plainText?: string
  wordCount?: number
  sortOrder: number
  status?: string
  createdAt?: string
  updatedAt?: string
}

type BridgeCharacter = {
  id: string
  projectId: string
  name: string
  alias?: string[]
  summary?: string
  traits?: string[]
  background?: string
  avatarUrl?: string
  personalityPrompt?: string
  speechPattern?: string
  currentState?: string
  customStatus?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

type BridgeCharacterRelation = {
  id: string
  projectId: string
  fromId: string
  toId: string
  type: string
  strength?: number
  notes?: string
  validFromChapterId?: string
  validUntilChapterId?: string
  createdAt?: string
  updatedAt?: string
}

type BridgeLocation = {
  id: string
  projectId: string
  name: string
  description?: string
  climate?: string
  culture?: string
  geography?: string
  atmosphere?: string
  parentId?: string
  imageUrl?: string
  createdAt?: string
  updatedAt?: string
  children?: BridgeLocation[]
}

type BridgeLocationRelation = {
  id: string
  projectId: string
  fromId: string
  toId: string
  type: string
  distance?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

type BridgeDocumentNode = {
  id: string
  documentId: string
  projectId: string
  parentId?: string
  title: string
  type: string
  level: number
  order: number
  status: string
  wordCount: number
  createdAt?: string
  updatedAt?: string
  children?: BridgeDocumentNode[]
}

type BridgeStoryTime = {
  year?: number
  month?: number
  day?: number
  hour?: number
  minute?: number
  era?: string
  season?: string
  description?: string
}

type BridgeGoldenChapterPlan = {
  chapterNumber: number
  title: string
  summary?: string
  hook?: string
  payoff?: string
}

type BridgeTemplateDetailSection = {
  id: string
  title: string
  summary?: string
  bullets?: string[]
}

type BridgeCreativeWorkflowTemplate = {
  id: string
  name: string
  tagline: string
  category: string
  templateType: string
  recommendedLabel: string
  applicableTo?: string[]
  emotionCurve?: string
  payoffFocus?: string[]
  defaultAudience?: string[]
  defaultPromises?: string[]
  defaultPaceContract?: string
  blueprintHints?: string[]
  goldenChapterSeeds?: BridgeGoldenChapterPlan[]
  characters?: BridgeTemplateDetailSection[]
  settings?: BridgeTemplateDetailSection[]
  projectCategory?: string
  volumeTitle?: string
  openingLine?: string
}

type BridgeCreativeWorkflowRecord = {
  version?: number
  projectId: string
  templateId?: string
  pitchLine?: string
  targetAudience?: string[]
  corePromises?: string[]
  paceContract?: string
  goldenChapters?: BridgeGoldenChapterPlan[]
  createdAt?: string
  updatedAt?: string
}

type BridgeInspirationNote = {
  id: string
  projectId: string
  chapterId?: string
  chapterTitle?: string
  title: string
  content: string
  createdAt?: string
  updatedAt?: string
}

type BridgeTimeline = {
  id: string
  projectId: string
  name: string
  description?: string
  startTime?: BridgeStoryTime
  endTime?: BridgeStoryTime
  createdAt?: string
  updatedAt?: string
}

type BridgeTimelineEvent = {
  id: string
  projectId: string
  timelineId: string
  title: string
  description?: string
  storyTime?: BridgeStoryTime
  duration?: string
  impact?: string
  participants?: string[]
  locationIds?: string[]
  chapterIds?: string[]
  eventType?: string
  importance?: number
  createdAt?: string
  updatedAt?: string
}

type BridgeStoryHarnessEvidence = {
  documentId?: string
  paragraphIdx?: number
  quoteText?: string
}

type BridgeStoryHarnessChangeRequest = {
  id: string
  batchId?: string
  projectId?: string
  chapterId?: string
  category?: string
  priority?: string
  status?: string
  title: string
  description?: string
  suggestedChange?: Record<string, unknown>
  evidence?: BridgeStoryHarnessEvidence[]
  source?: string
  createdAt?: string
  updatedAt?: string
}

type BridgeStoryHarnessBatch = {
  batchId: string
  projectId: string
  chapterId: string
  chapterTitle?: string
  committedAt: number
  source?: string
  changeRequests?: Array<{
    id?: string
    source?: string
    type?: string
    title?: string
    summary?: string
    reason?: string
    evidence?: string
    severity?: string
    sourceTimestamp?: number
  }>
}

type BridgeStoryHarnessChapterContext = {
  characters?: Array<{
    id: string
    name: string
    alias?: string[]
    traits?: string[]
    currentState?: string
    shortDescription?: string
    avatarUrl?: string
  }>
  relations?: Array<{
    id: string
    fromId: string
    toId: string
    fromName?: string
    toName?: string
    type?: string
    strength?: number
    notes?: string
  }>
  pendingCRs?: number
}

const documentIndex = new Map<string, BridgeDocumentNode>()
const STANDALONE_EDITOR_PORTS = new Set(['34115', '43127'])

function getCurrentWindowUrl(): URL | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return new URL(window.location.href)
  } catch {
    return null
  }
}

export function isWailsWriterAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  const candidate = window as typeof window & { go?: { main?: { App?: Record<string, unknown> } } }
  return !!candidate.go?.main?.App
}

export function isRemoteWriterMode(): boolean {
  const currentUrl = getCurrentWindowUrl()
  return currentUrl?.searchParams.get('remote') === 'true'
}

export function isStandaloneWriterRuntime(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  if (isWailsWriterAvailable()) {
    return true
  }

  if (isRemoteWriterMode()) {
    return false
  }

  if (window.location.protocol === 'file:') {
    return true
  }

  if (STANDALONE_EDITOR_PORTS.has(window.location.port)) {
    return true
  }

  return window.location.protocol === 'http:' || window.location.protocol === 'https:'
}

export function isStandaloneLocalWriterAvailable(): boolean {
  return isStandaloneWriterRuntime() && !isWailsWriterAvailable()
}

function cacheTree(projectId: string, tree: BridgeDocumentNode[]) {
  const visit = (nodes: BridgeDocumentNode[]) => {
    for (const node of nodes) {
      documentIndex.set(node.id, node)
      documentIndex.set(node.documentId, node)
      if (!node.projectId) {
        node.projectId = projectId
      }
      if (node.children?.length) {
        visit(node.children)
      }
    }
  }

  visit(tree)
}

function mapProjectSummary(project: BridgeProject) {
  return {
    id: project.id,
    title: project.title,
    summary: project.description || '',
    description: project.description || '',
    coverUrl: project.coverPath || '',
    coverImage: project.coverPath || '',
    category: '',
    genre: '',
    tags: [] as string[],
    status: project.status || 'draft',
    visibility: 'private',
    totalWords: project.wordCount || 0,
    wordCount: project.wordCount || 0,
    chapterCount: project.chapterCount || 0,
    lastUpdateAt: project.updatedAt || project.createdAt || '',
    lastUpdateTime: project.updatedAt || project.createdAt || '',
    createdAt: project.createdAt || '',
    updatedAt: project.updatedAt || project.createdAt || '',
  }
}

function mapVolumeNode(volume: BridgeVolume): BridgeDocumentNode {
  return {
    id: volume.id,
    documentId: volume.id,
    projectId: volume.projectId,
    title: volume.title,
    type: DocumentType.VOLUME,
    level: 0,
    order: Number(volume.sortOrder || 0),
    status: 'planned',
    wordCount: 0,
    createdAt: volume.createdAt || '',
    updatedAt: volume.createdAt || '',
    children: [],
  }
}

function mapChapterNode(chapter: BridgeChapter): BridgeDocumentNode {
  return {
    id: chapter.id,
    documentId: chapter.id,
    projectId: chapter.projectId,
    parentId: chapter.volumeId || undefined,
    title: chapter.title,
    type: DocumentType.CHAPTER,
    level: chapter.volumeId ? 1 : 0,
    order: Number(chapter.sortOrder || 0),
    status: chapter.status || 'draft',
    wordCount: Number(chapter.wordCount || 0),
    createdAt: chapter.createdAt || '',
    updatedAt: chapter.updatedAt || chapter.createdAt || '',
  }
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

function normalizeRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined
  }
  return value as Record<string, unknown>
}

function mapCharacter(character: BridgeCharacter) {
  return {
    id: character.id,
    projectId: character.projectId,
    name: character.name,
    alias: normalizeStringArray(character.alias),
    summary: character.summary || '',
    traits: normalizeStringArray(character.traits),
    background: character.background || '',
    avatarUrl: character.avatarUrl || '',
    personalityPrompt: character.personalityPrompt || '',
    speechPattern: character.speechPattern || '',
    currentState: character.currentState || '',
    customStatus: normalizeRecord(character.customStatus),
    createdAt: character.createdAt || '',
    updatedAt: character.updatedAt || character.createdAt || '',
  }
}

function mapCharacterRelation(relation: BridgeCharacterRelation) {
  return {
    id: relation.id,
    projectId: relation.projectId,
    fromId: relation.fromId,
    toId: relation.toId,
    type: relation.type || '其他',
    strength: Number(relation.strength || 0),
    notes: relation.notes || '',
    validFromChapterId: relation.validFromChapterId || '',
    validUntilChapterId: relation.validUntilChapterId || '',
    createdAt: relation.createdAt || '',
    updatedAt: relation.updatedAt || relation.createdAt || '',
  }
}

function mapLocation(location: BridgeLocation) {
  return {
    id: location.id,
    projectId: location.projectId,
    name: location.name,
    description: location.description || '',
    climate: location.climate || '',
    culture: location.culture || '',
    geography: location.geography || '',
    atmosphere: location.atmosphere || '',
    parentId: location.parentId || '',
    imageUrl: location.imageUrl || '',
    createdAt: location.createdAt || '',
    updatedAt: location.updatedAt || location.createdAt || '',
  }
}

function mapLocationRelation(relation: BridgeLocationRelation) {
  return {
    id: relation.id,
    projectId: relation.projectId,
    fromId: relation.fromId,
    toId: relation.toId,
    type: relation.type,
    distance: relation.distance || '',
    notes: relation.notes || '',
    createdAt: relation.createdAt || '',
    updatedAt: relation.updatedAt || relation.createdAt || '',
  }
}

function buildLocationTree(locations: BridgeLocation[]) {
  const mapped = locations.map((item) => ({ ...mapLocation(item), children: [] as Array<any> }))
  const byID = new Map(mapped.map((item) => [item.id, item]))
  const roots: typeof mapped = []

  for (const item of mapped) {
    const parentID = item.parentId || ''
    if (parentID && byID.has(parentID)) {
      byID.get(parentID)!.children.push(item)
      continue
    }
    roots.push(item)
  }

  return roots
}

async function buildDocumentTree(projectId: string): Promise<BridgeDocumentNode[]> {
  const [volumes, chapters] = await Promise.all([
    ListVolumes(projectId) as Promise<BridgeVolume[]>,
    ListChapters(projectId) as Promise<BridgeChapter[]>,
  ])

  const volumeMap = new Map<string, BridgeDocumentNode>()
  for (const volume of volumes || []) {
    const node = mapVolumeNode(volume)
    volumeMap.set(node.id, node)
  }

  const rootChapters: BridgeDocumentNode[] = []
  for (const chapter of chapters || []) {
    const node = mapChapterNode(chapter)
    if (node.parentId && volumeMap.has(node.parentId)) {
      const parent = volumeMap.get(node.parentId)!
      parent.children = [...(parent.children || []), node]
    } else {
      rootChapters.push(node)
    }
  }

  const orderedVolumes = Array.from(volumeMap.values()).sort((a, b) => a.order - b.order)
  for (const volume of orderedVolumes) {
    volume.children = (volume.children || []).sort((a, b) => a.order - b.order)
  }

  const tree = [...orderedVolumes, ...rootChapters.sort((a, b) => a.order - b.order)]
  cacheTree(projectId, tree)
  return tree
}

async function resolveDocument(documentId: string): Promise<BridgeDocumentNode | null> {
  const cached = documentIndex.get(documentId)
  if (cached) {
    return cached
  }

  const projects = (await ListProjects()) as BridgeProject[]
  for (const project of projects || []) {
    const tree = await buildDocumentTree(project.id)
    const hit = documentIndex.get(documentId)
    if (hit) {
      return hit
    }
    cacheTree(project.id, tree)
  }

  return null
}

function walkTipTapText(node: any, parts: string[]) {
  if (!node) return
  if (typeof node.text === 'string') {
    parts.push(node.text)
  }
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      walkTipTapText(child, parts)
    }
  }
}

function extractPlainText(content: string): string {
  if (!content) return ''
  try {
    const parsed = JSON.parse(content)
    const parts: string[] = []
    walkTipTapText(parsed, parts)
    return parts.join(' ').trim()
  } catch {
    return String(content).trim()
  }
}

function countWords(text: string): number {
  return calculateWritingWordCount(text)
}

function toParagraphPayload(content: string, updatedAt: string, wordCount: number) {
  if (!content) {
    return []
  }

  return [
    {
      paragraphId: 'root',
      order: 0,
      content,
      contentType: 'tiptap_json',
      version: 1,
      updatedAt,
      wordCount,
    },
  ]
}

function mapStoryTime(value?: BridgeStoryTime) {
  if (!value || typeof value !== 'object') {
    return {}
  }
  return {
    year: typeof value.year === 'number' ? value.year : undefined,
    month: typeof value.month === 'number' ? value.month : undefined,
    day: typeof value.day === 'number' ? value.day : undefined,
    hour: typeof value.hour === 'number' ? value.hour : undefined,
    minute: typeof value.minute === 'number' ? value.minute : undefined,
    era: typeof value.era === 'string' ? value.era : '',
    season: typeof value.season === 'string' ? value.season : '',
    description: typeof value.description === 'string' ? value.description : '',
  }
}

function mapGoldenChapterPlan(value: BridgeGoldenChapterPlan, index: number) {
  return {
    chapterNumber:
      typeof value.chapterNumber === 'number' && Number.isFinite(value.chapterNumber)
        ? value.chapterNumber
        : index + 1,
    title: typeof value.title === 'string' ? value.title : `第${index + 1}章目标`,
    summary: typeof value.summary === 'string' ? value.summary : '',
    hook: typeof value.hook === 'string' ? value.hook : '',
    payoff: typeof value.payoff === 'string' ? value.payoff : '',
  }
}

function mapTemplateDetailSection(section: BridgeTemplateDetailSection) {
  return {
    id: section.id,
    title: section.title,
    summary: section.summary || '',
    bullets: normalizeStringArray(section.bullets),
  }
}

function mapCreativeWorkflowTemplate(template: BridgeCreativeWorkflowTemplate) {
  return {
    id: template.id,
    name: template.name,
    tagline: template.tagline || '',
    category: template.category || '',
    templateType: template.templateType || '',
    recommendedLabel: template.recommendedLabel || '',
    applicableTo: normalizeStringArray(template.applicableTo),
    emotionCurve: template.emotionCurve || '',
    payoffFocus: normalizeStringArray(template.payoffFocus),
    defaultAudience: normalizeStringArray(template.defaultAudience),
    defaultPromises: normalizeStringArray(template.defaultPromises),
    defaultPaceContract: template.defaultPaceContract || '',
    blueprintHints: normalizeStringArray(template.blueprintHints),
    goldenChapterSeeds: Array.isArray(template.goldenChapterSeeds)
      ? template.goldenChapterSeeds.map(mapGoldenChapterPlan)
      : [],
    characters: Array.isArray(template.characters)
      ? template.characters.map(mapTemplateDetailSection)
      : [],
    settings: Array.isArray(template.settings) ? template.settings.map(mapTemplateDetailSection) : [],
    projectCategory: template.projectCategory || '',
    volumeTitle: template.volumeTitle || '',
    openingLine: template.openingLine || '',
  }
}

function mapCreativeWorkflowRecord(record: BridgeCreativeWorkflowRecord) {
  return {
    version: 1 as const,
    projectId: record.projectId,
    templateId: typeof record.templateId === 'string' ? record.templateId : '',
    pitchLine: record.pitchLine || '',
    targetAudience: normalizeStringArray(record.targetAudience),
    corePromises: normalizeStringArray(record.corePromises),
    paceContract: record.paceContract || '',
    goldenChapters: Array.isArray(record.goldenChapters)
      ? record.goldenChapters.map(mapGoldenChapterPlan)
      : [],
    createdAt: record.createdAt || '',
    updatedAt: record.updatedAt || record.createdAt || '',
  }
}

function mapInspirationNote(note: BridgeInspirationNote) {
  return {
    id: note.id,
    projectId: note.projectId,
    chapterId: note.chapterId || '',
    chapterTitle: note.chapterTitle || '',
    title: note.title,
    content: note.content,
    createdAt: note.createdAt || '',
    updatedAt: note.updatedAt || note.createdAt || '',
  }
}

function mapTimeline(timeline: BridgeTimeline) {
  return {
    id: timeline.id,
    projectId: timeline.projectId,
    name: timeline.name,
    description: timeline.description || '',
    startTime: mapStoryTime(timeline.startTime),
    endTime: mapStoryTime(timeline.endTime),
    createdAt: timeline.createdAt || '',
    updatedAt: timeline.updatedAt || timeline.createdAt || '',
  }
}

function mapTimelineEvent(timelineEvent: BridgeTimelineEvent) {
  return {
    id: timelineEvent.id,
    projectId: timelineEvent.projectId,
    timelineId: timelineEvent.timelineId,
    title: timelineEvent.title,
    description: timelineEvent.description || '',
    storyTime: mapStoryTime(timelineEvent.storyTime),
    duration: timelineEvent.duration || '',
    impact: timelineEvent.impact || '',
    participants: normalizeStringArray(timelineEvent.participants),
    locationIds: normalizeStringArray(timelineEvent.locationIds),
    chapterIds: normalizeStringArray(timelineEvent.chapterIds),
    eventType: typeof timelineEvent.eventType === 'string' ? timelineEvent.eventType : 'plot',
    importance:
      typeof timelineEvent.importance === 'number' && Number.isFinite(timelineEvent.importance)
        ? timelineEvent.importance
        : 5,
    createdAt: timelineEvent.createdAt || '',
    updatedAt: timelineEvent.updatedAt || timelineEvent.createdAt || '',
  }
}

function mapStoryHarnessChangeRequest(changeRequest: BridgeStoryHarnessChangeRequest) {
  return {
    id: changeRequest.id,
    batchId: changeRequest.batchId || '',
    projectId: changeRequest.projectId || '',
    chapterId: changeRequest.chapterId || '',
    category: changeRequest.category || 'scene_scope',
    priority: changeRequest.priority || 'medium',
    status: changeRequest.status || 'pending',
    title: changeRequest.title,
    description: changeRequest.description || '',
    suggestedChange: normalizeRecord(changeRequest.suggestedChange) || {},
    evidence: Array.isArray(changeRequest.evidence)
      ? changeRequest.evidence.map((item) => ({
          documentId: item.documentId || '',
          paragraphIdx:
            typeof item.paragraphIdx === 'number' && Number.isFinite(item.paragraphIdx)
              ? item.paragraphIdx
              : 0,
          quoteText: item.quoteText || '',
        }))
      : [],
    source: changeRequest.source || '',
    createdAt: changeRequest.createdAt || '',
    updatedAt: changeRequest.updatedAt || changeRequest.createdAt || '',
  }
}

function mapStoryHarnessBatch(batch: BridgeStoryHarnessBatch | null | undefined) {
  if (!batch) {
    return null
  }
  return {
    batchId: batch.batchId,
    projectId: batch.projectId,
    chapterId: batch.chapterId,
    chapterTitle: batch.chapterTitle || '',
    committedAt: batch.committedAt,
    source: 'remote',
    changeRequests: Array.isArray(batch.changeRequests)
      ? batch.changeRequests.map((item, index) => ({
          id: item.id || `story-harness:${batch.batchId}:${index}`,
          source: item.source || 'save_batch',
          type: item.type || 'scene_scope',
          title: item.title || '正文指令建议',
          summary: item.summary || '',
          reason: item.reason || '',
          evidence: item.evidence || '',
          severity: item.severity || 'hint',
          sourceTimestamp:
            typeof item.sourceTimestamp === 'number' && Number.isFinite(item.sourceTimestamp)
              ? item.sourceTimestamp
              : batch.committedAt,
        }))
      : [],
  }
}

function mapStoryHarnessChapterContext(payload: BridgeStoryHarnessChapterContext) {
  return {
    characters: Array.isArray(payload.characters)
      ? payload.characters.map((item) => ({
          id: item.id,
          name: item.name,
          alias: normalizeStringArray(item.alias),
          traits: normalizeStringArray(item.traits),
          currentState: item.currentState || '',
          shortDescription: item.shortDescription || '',
          avatarUrl: item.avatarUrl || '',
        }))
      : [],
    relations: Array.isArray(payload.relations)
      ? payload.relations.map((item) => ({
          id: item.id,
          fromId: item.fromId,
          toId: item.toId,
          fromName: item.fromName || '',
          toName: item.toName || '',
          type: item.type || '',
          strength:
            typeof item.strength === 'number' && Number.isFinite(item.strength)
              ? item.strength
              : 0,
          notes: item.notes || '',
        }))
      : [],
    pendingCRs:
      typeof payload.pendingCRs === 'number' && Number.isFinite(payload.pendingCRs)
        ? payload.pendingCRs
        : 0,
  }
}

export const wailsWriterBridge = {
  character: {
    async create(projectId: string, payload: Record<string, unknown>) {
      const created = (await CreateCharacter({
        projectId,
        name: String(payload.name || ''),
        alias: Array.isArray(payload.alias) ? payload.alias : [],
        summary: typeof payload.summary === 'string' ? payload.summary : '',
        traits: Array.isArray(payload.traits) ? payload.traits : [],
        background: typeof payload.background === 'string' ? payload.background : '',
        avatarUrl: typeof payload.avatarUrl === 'string' ? payload.avatarUrl : '',
        personalityPrompt:
          typeof payload.personalityPrompt === 'string' ? payload.personalityPrompt : '',
        speechPattern: typeof payload.speechPattern === 'string' ? payload.speechPattern : '',
        currentState: typeof payload.currentState === 'string' ? payload.currentState : '',
        customStatus: normalizeRecord(payload.customStatus) || {},
      })) as BridgeCharacter
      return mapCharacter(created)
    },
    async get(id: string) {
      const item = (await GetCharacter(id)) as BridgeCharacter
      return mapCharacter(item)
    },
    async list(projectId: string) {
      const items = (await ListCharacters(projectId)) as BridgeCharacter[]
      return (items || []).map(mapCharacter)
    },
    async update(id: string, payload: Record<string, unknown>) {
      const updated = (await UpdateCharacter(id, {
        name: typeof payload.name === 'string' ? payload.name : undefined,
        alias: Array.isArray(payload.alias) ? payload.alias : undefined,
        summary: typeof payload.summary === 'string' ? payload.summary : undefined,
        traits: Array.isArray(payload.traits) ? payload.traits : undefined,
        background: typeof payload.background === 'string' ? payload.background : undefined,
        avatarUrl: typeof payload.avatarUrl === 'string' ? payload.avatarUrl : undefined,
        personalityPrompt:
          typeof payload.personalityPrompt === 'string' ? payload.personalityPrompt : undefined,
        speechPattern: typeof payload.speechPattern === 'string' ? payload.speechPattern : undefined,
        currentState: typeof payload.currentState === 'string' ? payload.currentState : undefined,
        customStatus: normalizeRecord(payload.customStatus),
      })) as BridgeCharacter
      return mapCharacter(updated)
    },
    async delete(id: string) {
      await DeleteCharacter(id)
    },
    async createRelation(projectId: string, payload: Record<string, unknown>) {
      const created = (await CreateCharacterRelation({
        projectId,
        fromId: String(payload.fromId || ''),
        toId: String(payload.toId || ''),
        type: String(payload.type || ''),
        strength:
          typeof payload.strength === 'number' && Number.isFinite(payload.strength)
            ? payload.strength
            : undefined,
        notes: typeof payload.notes === 'string' ? payload.notes : '',
        validFromChapterId:
          typeof payload.validFromChapterId === 'string' ? payload.validFromChapterId : '',
        validUntilChapterId:
          typeof payload.validUntilChapterId === 'string' ? payload.validUntilChapterId : '',
      })) as BridgeCharacterRelation
      return mapCharacterRelation(created)
    },
    async listRelations(projectId: string, characterId?: string) {
      const items = (await ListCharacterRelations(
        projectId,
        characterId || '',
      )) as BridgeCharacterRelation[]
      return (items || []).map(mapCharacterRelation)
    },
    async deleteRelation(id: string) {
      await DeleteCharacterRelation(id)
    },
    async getGraph(projectId: string) {
      const [characters, relations] = await Promise.all([
        wailsWriterBridge.character.list(projectId),
        wailsWriterBridge.character.listRelations(projectId),
      ])
      return { characters, relations }
    },
  },
  project: {
    async list(params?: { page?: number; pageSize?: number }) {
      const items = ((await ListProjects()) as BridgeProject[]).map(mapProjectSummary)
      return {
        projects: items,
        items,
        total: items.length,
        page: params?.page || 1,
        size: params?.pageSize || items.length,
        pageSize: params?.pageSize || items.length,
      }
    },
    async get(id: string) {
      const [project, tree] = await Promise.all([
        GetProject(id) as Promise<BridgeProject>,
        buildDocumentTree(id),
      ])

      const documents = flattenDocumentTree(tree).map((node) => ({
        id: node.id,
        title: node.title,
        type: node.type,
        wordCount: node.wordCount || 0,
        lastEditAt: node.updatedAt || node.createdAt || '',
        status: node.status || 'draft',
        sortOrder: node.order || 0,
      }))

      const summary = mapProjectSummary(project)
      return {
        id: summary.id,
        title: summary.title,
        description: summary.description,
        summary: summary.summary,
        coverImage: summary.coverImage,
        coverUrl: summary.coverUrl,
        genre: '',
        category: '',
        tags: [] as string[],
        status: summary.status,
        visibility: 'private',
        totalWords: summary.totalWords,
        wordCount: summary.wordCount,
        chapterCount: summary.chapterCount,
        lastUpdateTime: summary.updatedAt,
        createdAt: summary.createdAt,
        updatedAt: summary.updatedAt,
        documents,
        characters: [] as any[],
        locations: [] as any[],
        timeline: [] as any[],
      }
    },
    async create(payload: {
      title: string
      summary?: string
      description?: string
      coverUrl?: string
      coverImage?: string
      status?: string
    }) {
      const created = (await CreateProject({
        title: payload.title,
        description: payload.summary || payload.description || '',
        coverPath: payload.coverUrl || payload.coverImage || '',
        status: payload.status || 'draft',
      })) as BridgeProject
      return wailsWriterBridge.project.get(created.id)
    },
    async update(id: string, payload: Record<string, unknown>) {
      const updated = (await UpdateProject(id, {
        title: typeof payload.title === 'string' ? payload.title : undefined,
        description:
          typeof payload.summary === 'string'
            ? payload.summary
            : typeof payload.description === 'string'
              ? payload.description
              : undefined,
        coverPath:
          typeof payload.coverUrl === 'string'
            ? payload.coverUrl
            : typeof payload.coverImage === 'string'
              ? payload.coverImage
              : undefined,
        status: typeof payload.status === 'string' ? payload.status : undefined,
      })) as BridgeProject
      return wailsWriterBridge.project.get(updated.id)
    },
    async delete(id: string) {
      await DeleteProject(id)
    },
  },
  location: {
    async create(projectId: string, payload: Record<string, unknown>) {
      const created = (await CreateLocation({
        projectId,
        name: String(payload.name || ''),
        description: typeof payload.description === 'string' ? payload.description : '',
        climate: typeof payload.climate === 'string' ? payload.climate : '',
        culture: typeof payload.culture === 'string' ? payload.culture : '',
        geography: typeof payload.geography === 'string' ? payload.geography : '',
        atmosphere: typeof payload.atmosphere === 'string' ? payload.atmosphere : '',
        parentId: typeof payload.parentId === 'string' ? payload.parentId : '',
        imageUrl: typeof payload.imageUrl === 'string' ? payload.imageUrl : '',
      })) as BridgeLocation
      return mapLocation(created)
    },
    async get(id: string) {
      const item = (await GetLocation(id)) as BridgeLocation
      return mapLocation(item)
    },
    async list(projectId: string) {
      const items = (await ListLocations(projectId)) as BridgeLocation[]
      return (items || []).map(mapLocation)
    },
    async getTree(projectId: string) {
      const items = (await ListLocations(projectId)) as BridgeLocation[]
      return buildLocationTree(items || [])
    },
    async update(id: string, payload: Record<string, unknown>) {
      const updated = (await UpdateLocation(id, {
        name: typeof payload.name === 'string' ? payload.name : undefined,
        description: typeof payload.description === 'string' ? payload.description : undefined,
        climate: typeof payload.climate === 'string' ? payload.climate : undefined,
        culture: typeof payload.culture === 'string' ? payload.culture : undefined,
        geography: typeof payload.geography === 'string' ? payload.geography : undefined,
        atmosphere: typeof payload.atmosphere === 'string' ? payload.atmosphere : undefined,
        parentId: typeof payload.parentId === 'string' ? payload.parentId : undefined,
        imageUrl: typeof payload.imageUrl === 'string' ? payload.imageUrl : undefined,
      })) as BridgeLocation
      return mapLocation(updated)
    },
    async delete(id: string) {
      await DeleteLocation(id)
    },
    async createRelation(projectId: string, payload: Record<string, unknown>) {
      const created = (await CreateLocationRelation({
        projectId,
        fromId: String(payload.fromId || ''),
        toId: String(payload.toId || ''),
        type: String(payload.type || ''),
        distance: typeof payload.distance === 'string' ? payload.distance : '',
        notes: typeof payload.notes === 'string' ? payload.notes : '',
      })) as BridgeLocationRelation
      return mapLocationRelation(created)
    },
    async listRelations(projectId: string, locationId?: string) {
      const items = (await ListLocationRelations(
        projectId,
        locationId || '',
      )) as BridgeLocationRelation[]
      return (items || []).map(mapLocationRelation)
    },
    async deleteRelation(id: string) {
      await DeleteLocationRelation(id)
    },
  },
  document: {
    async list(projectId: string, params?: { page?: number; pageSize?: number }) {
      const tree = await buildDocumentTree(projectId)
      const documents = flattenDocumentTree(tree)
      return {
        documents,
        total: documents.length,
        page: params?.page || 1,
        size: params?.pageSize || documents.length,
      }
    },
    async getTree(projectId: string) {
      return buildDocumentTree(projectId)
    },
    async get(documentId: string) {
      const node = await resolveDocument(documentId)
      if (!node) {
        throw new Error('文档不存在')
      }
      return {
        ...node,
        version: 1,
      }
    },
    async create(projectId: string, payload: Record<string, unknown>) {
      const type = String(payload.type || '')
      const title = String(payload.title || '').trim()
      const orderValue =
        typeof payload.order === 'number' && Number.isFinite(payload.order) ? payload.order : undefined

      if (type === DocumentType.VOLUME) {
        const created = (await CreateVolume({
          projectId,
          title,
          sortOrder: orderValue,
        })) as BridgeVolume
        return mapVolumeNode(created)
      }

      if (type !== DocumentType.CHAPTER) {
        throw new Error(`桌面端暂不支持创建 ${type || 'unknown'} 类型文档`)
      }

      const created = (await CreateChapter({
        projectId,
        volumeId: typeof payload.parentId === 'string' ? payload.parentId : '',
        title,
        sortOrder: orderValue,
        content: typeof payload.content === 'string' ? payload.content : '',
        plainText: typeof payload.plainText === 'string' ? payload.plainText : '',
        status: typeof payload.status === 'string' ? payload.status : 'draft',
      })) as BridgeChapter
      return mapChapterNode(created)
    },
    async update(documentId: string, payload: Record<string, unknown>) {
      const node = await resolveDocument(documentId)
      if (!node) {
        throw new Error('文档不存在')
      }

      if (node.type === DocumentType.VOLUME) {
        await UpdateVolume(documentId, {
          title: typeof payload.title === 'string' ? payload.title : undefined,
          sortOrder:
            typeof payload.order === 'number' && Number.isFinite(payload.order) ? payload.order : undefined,
        })
        return
      }

      await UpdateChapter(documentId, {
        title: typeof payload.title === 'string' ? payload.title : undefined,
        status: typeof payload.status === 'string' ? payload.status : undefined,
        sortOrder:
          typeof payload.order === 'number' && Number.isFinite(payload.order) ? payload.order : undefined,
      })
    },
    async delete(documentId: string) {
      const node = await resolveDocument(documentId)
      if (!node) {
        throw new Error('文档不存在')
      }
      if (node.type === DocumentType.VOLUME) {
        await DeleteVolume(documentId)
        return
      }
      await DeleteChapter(documentId)
    },
    async move(documentId: string, payload: { parentId?: string; order?: number }) {
      const node = await resolveDocument(documentId)
      if (!node) {
        throw new Error('文档不存在')
      }
      const targetParentId =
        payload.parentId || (payload as { newParentId?: string }).newParentId || undefined
      const targetOrder =
        typeof payload.order === 'number'
          ? payload.order
          : typeof (payload as { newOrder?: number }).newOrder === 'number'
            ? (payload as { newOrder?: number }).newOrder
            : 0
      const normalizedTargetOrder = Number.isFinite(targetOrder) ? Number(targetOrder) : 0
      if (node.type === DocumentType.VOLUME) {
        const tree = await buildDocumentTree(node.projectId)
        const orderedRootVolumes = tree.filter((item) => item.type === DocumentType.VOLUME)
        const orderedIDs = orderedRootVolumes
          .map((item) => item.id)
          .filter((id) => id !== documentId)
        const targetIndex = normalizedTargetOrder
        orderedIDs.splice(Math.max(0, Math.min(targetIndex, orderedIDs.length)), 0, documentId)
        await ReorderVolumes({
          projectId: node.projectId,
          orderedIds: orderedIDs,
        })
        return { code: 200, message: 'ok' }
      }
      await MoveChapter({
        chapterId: documentId,
        targetVolumeId: targetParentId,
        targetIndex: normalizedTargetOrder,
      })
      return { code: 200, message: 'ok' }
    },
  },
  editor: {
    async getContent(documentId: string) {
      const chapter = (await GetChapter(documentId)) as BridgeChapter
      return {
        documentId,
        content: chapter.content || '',
        version: 1,
        wordCount: Number(chapter.wordCount || 0),
        updatedAt: chapter.updatedAt || chapter.createdAt || '',
      }
    },
    async updateContent(
      documentId: string,
      payload: { content: string; version?: number; contentType?: string },
    ) {
      const plainText = extractPlainText(payload.content || '')
      const wordCount = countWords(plainText)
      await UpdateChapter(documentId, {
        content: payload.content || '',
        plainText,
        wordCount,
      })
      return undefined
    },
    async autoSave(
      documentId: string,
      payload: { content: string; currentVersion?: number; saveType?: 'auto' | 'manual' },
    ) {
      await wailsWriterBridge.editor.updateContent(documentId, {
        content: payload.content,
        version: payload.currentVersion,
      })
      return {
        saved: true,
        newVersion: (payload.currentVersion || 0) + 1,
        wordCount: countWords(extractPlainText(payload.content || '')),
        savedAt: new Date().toISOString(),
        hasConflict: false,
      }
    },
    async getSaveStatus(documentId: string) {
      const chapter = (await GetChapter(documentId)) as BridgeChapter
      return {
        documentId,
        lastSavedAt: chapter.updatedAt || chapter.createdAt || '',
        currentVersion: 1,
        isSaving: false,
        wordCount: Number(chapter.wordCount || 0),
      }
    },
    async getContents(documentId: string) {
      const chapter = (await GetChapter(documentId)) as BridgeChapter
      return {
        documentId,
        contents: toParagraphPayload(
          chapter.content || '',
          chapter.updatedAt || chapter.createdAt || '',
          Number(chapter.wordCount || 0),
        ),
        total: chapter.content ? 1 : 0,
        wordCount: Number(chapter.wordCount || 0),
        updatedAt: chapter.updatedAt || chapter.createdAt || '',
      }
    },
    async replaceContents(
      documentId: string,
      contents: Array<{ content?: string; version?: number; contentType?: string }>,
    ) {
      const first = contents[0]
      await wailsWriterBridge.editor.updateContent(documentId, {
        content: first?.content || '',
        version: first?.version,
        contentType: first?.contentType,
      })
      const chapter = (await GetChapter(documentId)) as BridgeChapter
      return {
        documentId,
        total: contents.length,
        wordCount: Number(chapter.wordCount || 0),
        updatedAt: chapter.updatedAt || chapter.createdAt || '',
      }
    },
    async reindexContents(documentId: string) {
      const payload = await wailsWriterBridge.editor.getContents(documentId)
      return {
        documentId,
        total: payload.total,
      }
    },
  },
  template: {
    async list() {
      const items = (await ListWorkbenchTemplates()) as BridgeCreativeWorkflowTemplate[]
      return (items || []).map(mapCreativeWorkflowTemplate)
    },
    async getDetail(templateId: string) {
      const detail = (await GetWorkbenchTemplateDetail(templateId)) as BridgeCreativeWorkflowTemplate
      return mapCreativeWorkflowTemplate(detail)
    },
  },
  creativeWorkflow: {
    async get(projectId: string) {
      const record = (await GetCreativeWorkflow(projectId)) as BridgeCreativeWorkflowRecord
      return mapCreativeWorkflowRecord(record)
    },
    async save(projectId: string, payload: Record<string, unknown>) {
      const record = (await SaveCreativeWorkflow(projectId, {
        templateId:
          payload.templateId === null
            ? ''
            : typeof payload.templateId === 'string'
              ? payload.templateId
              : undefined,
        pitchLine: typeof payload.pitchLine === 'string' ? payload.pitchLine : undefined,
        targetAudience: Array.isArray(payload.targetAudience) ? normalizeStringArray(payload.targetAudience) : undefined,
        corePromises: Array.isArray(payload.corePromises) ? normalizeStringArray(payload.corePromises) : undefined,
        paceContract: typeof payload.paceContract === 'string' ? payload.paceContract : undefined,
        goldenChapters: Array.isArray(payload.goldenChapters)
          ? payload.goldenChapters.map((item, index) => mapGoldenChapterPlan(item as BridgeGoldenChapterPlan, index))
          : undefined,
      } as any)) as BridgeCreativeWorkflowRecord
      return mapCreativeWorkflowRecord(record)
    },
  },
  inspiration: {
    async list(projectId: string) {
      const items = (await ListInspirationNotes(projectId)) as BridgeInspirationNote[]
      return (items || []).map(mapInspirationNote)
    },
    async create(payload: {
      projectId: string
      chapterId?: string
      chapterTitle?: string
      title: string
      content: string
    }) {
      const note = (await CreateInspirationNote({
        projectId: payload.projectId,
        chapterId: payload.chapterId || '',
        chapterTitle: payload.chapterTitle || '',
        title: payload.title,
        content: payload.content,
      })) as BridgeInspirationNote
      return mapInspirationNote(note)
    },
    async delete(id: string) {
      await DeleteInspirationNote(id)
    },
  },
  timeline: {
    async create(projectId: string, payload: Record<string, unknown>) {
      const created = (await CreateTimeline({
        projectId,
        name: String(payload.name || ''),
        description: typeof payload.description === 'string' ? payload.description : '',
        startTime: mapStoryTime(payload.startTime as BridgeStoryTime),
        endTime: mapStoryTime(payload.endTime as BridgeStoryTime),
      } as any)) as BridgeTimeline
      return mapTimeline(created)
    },
    async get(id: string) {
      const item = (await GetTimeline(id)) as BridgeTimeline
      return mapTimeline(item)
    },
    async list(projectId: string) {
      const items = (await ListTimelines(projectId)) as BridgeTimeline[]
      return (items || []).map(mapTimeline)
    },
    async update(id: string, payload: Record<string, unknown>) {
      const item = (await UpdateTimeline(id, {
        name: typeof payload.name === 'string' ? payload.name : undefined,
        description: typeof payload.description === 'string' ? payload.description : undefined,
        startTime:
          payload.startTime && typeof payload.startTime === 'object'
            ? mapStoryTime(payload.startTime as BridgeStoryTime)
            : undefined,
        endTime:
          payload.endTime && typeof payload.endTime === 'object'
            ? mapStoryTime(payload.endTime as BridgeStoryTime)
            : undefined,
      } as any)) as BridgeTimeline
      return mapTimeline(item)
    },
    async delete(id: string) {
      await DeleteTimeline(id)
    },
    async getVisualization(id: string) {
      const payload = (await GetTimelineVisualization(id)) as {
        timeline?: BridgeTimeline
        events?: BridgeTimelineEvent[]
      }
      return {
        timeline: payload.timeline ? mapTimeline(payload.timeline) : null,
        events: Array.isArray(payload.events) ? payload.events.map(mapTimelineEvent) : [],
      }
    },
    async createEvent(timelineId: string, projectId: string, payload: Record<string, unknown>) {
      const created = (await CreateTimelineEvent({
        projectId,
        timelineId,
        title: String(payload.title || ''),
        description: typeof payload.description === 'string' ? payload.description : '',
        storyTime: mapStoryTime(payload.storyTime as BridgeStoryTime),
        duration: typeof payload.duration === 'string' ? payload.duration : '',
        impact: typeof payload.impact === 'string' ? payload.impact : '',
        participants: Array.isArray(payload.participants) ? normalizeStringArray(payload.participants) : [],
        locationIds: Array.isArray(payload.locationIds) ? normalizeStringArray(payload.locationIds) : [],
        chapterIds: Array.isArray(payload.chapterIds) ? normalizeStringArray(payload.chapterIds) : [],
        eventType: typeof payload.eventType === 'string' ? payload.eventType : 'plot',
        importance:
          typeof payload.importance === 'number' && Number.isFinite(payload.importance)
            ? payload.importance
            : undefined,
      } as any)) as BridgeTimelineEvent
      return mapTimelineEvent(created)
    },
    async getEvent(id: string) {
      const item = (await GetTimelineEvent(id)) as BridgeTimelineEvent
      return mapTimelineEvent(item)
    },
    async listEvents(timelineId: string) {
      const items = (await ListTimelineEvents(timelineId)) as BridgeTimelineEvent[]
      return (items || []).map(mapTimelineEvent)
    },
    async updateEvent(id: string, _projectId: string, payload: Record<string, unknown>) {
      const item = (await UpdateTimelineEvent(id, {
        title: typeof payload.title === 'string' ? payload.title : undefined,
        description: typeof payload.description === 'string' ? payload.description : undefined,
        storyTime:
          payload.storyTime && typeof payload.storyTime === 'object'
            ? mapStoryTime(payload.storyTime as BridgeStoryTime)
            : undefined,
        duration: typeof payload.duration === 'string' ? payload.duration : undefined,
        impact: typeof payload.impact === 'string' ? payload.impact : undefined,
        participants: Array.isArray(payload.participants) ? normalizeStringArray(payload.participants) : undefined,
        locationIds: Array.isArray(payload.locationIds) ? normalizeStringArray(payload.locationIds) : undefined,
        chapterIds: Array.isArray(payload.chapterIds) ? normalizeStringArray(payload.chapterIds) : undefined,
        eventType: typeof payload.eventType === 'string' ? payload.eventType : undefined,
        importance:
          typeof payload.importance === 'number' && Number.isFinite(payload.importance)
            ? payload.importance
            : undefined,
      } as any)) as BridgeTimelineEvent
      return mapTimelineEvent(item)
    },
    async deleteEvent(id: string) {
      await DeleteTimelineEvent(id)
    },
  },
  storyHarness: {
    async createBatch(payload: {
      projectId: string
      chapterId: string
      chapterTitle: string
      changeRequests: Array<Record<string, unknown>>
    }) {
      const batch = (await CreateStoryHarnessBatch({
        projectId: payload.projectId,
        chapterId: payload.chapterId,
        chapterTitle: payload.chapterTitle,
        source: 'save_batch',
        changeRequests: payload.changeRequests.map((item) => ({
          id: typeof item.id === 'string' ? item.id : '',
          source: typeof item.source === 'string' ? item.source : 'save_batch',
          type: typeof item.type === 'string' ? item.type : 'scene_scope',
          title: typeof item.title === 'string' ? item.title : '正文指令建议',
          summary: typeof item.summary === 'string' ? item.summary : '',
          reason: typeof item.reason === 'string' ? item.reason : '',
          evidence: typeof item.evidence === 'string' ? item.evidence : '',
          severity: typeof item.severity === 'string' ? item.severity : 'hint',
          sourceTimestamp:
            typeof item.sourceTimestamp === 'number' && Number.isFinite(item.sourceTimestamp)
              ? item.sourceTimestamp
              : undefined,
        })),
      } as any)) as BridgeStoryHarnessBatch
      return mapStoryHarnessBatch(batch)
    },
    async getLatestBatch(projectId: string, chapterId: string) {
      const batch = (await GetLatestStoryHarnessBatch(projectId, chapterId)) as
        | BridgeStoryHarnessBatch
        | null
        | undefined
      return mapStoryHarnessBatch(batch)
    },
    async getChapterContext(projectId: string, chapterId: string) {
      const payload = (await GetStoryHarnessChapterContext(
        projectId,
        chapterId,
      )) as BridgeStoryHarnessChapterContext
      return mapStoryHarnessChapterContext(payload)
    },
    async listChangeRequests(projectId: string, chapterId: string, status = 'pending') {
      const items = (await ListStoryHarnessChangeRequests(
        projectId,
        chapterId,
        status,
      )) as BridgeStoryHarnessChangeRequest[]
      return (items || []).map(mapStoryHarnessChangeRequest)
    },
    async processChangeRequest(requestId: string, status: string) {
      const item = (await ProcessStoryHarnessChangeRequest(requestId, {
        status,
      })) as BridgeStoryHarnessChangeRequest
      return mapStoryHarnessChangeRequest(item)
    },
    async triggerIndex(projectId: string, chapterId: string) {
      return TriggerStoryHarnessIndex(projectId, chapterId)
    },
    async rebuildProjection(projectId: string, chapterId: string) {
      return RebuildStoryHarnessProjection(projectId, chapterId)
    },
  },
}

function flattenDocumentTree(tree: BridgeDocumentNode[]): BridgeDocumentNode[] {
  const result: BridgeDocumentNode[] = []
  for (const node of tree) {
    result.push(node)
    if (node.children?.length) {
      result.push(...flattenDocumentTree(node.children))
    }
  }
  return result
}
