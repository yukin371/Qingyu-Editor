import httpService from '@/core/services/http.service'
import { match } from 'pinyin-pro'
import { isRemoteWriterMode } from '../data-bridge/wails'
import {
  createProject as createWriterProject,
  deleteProject as deleteWriterProject,
  getProjectById,
  getProjects as listWriterProjects,
  type ProjectCreateData,
  type ProjectListParams,
  type ProjectSummary,
  type ProjectUpdateData,
  updateProject as updateWriterProject,
} from './project'
import {
  createDocument as createWriterDocument,
  deleteDocument as deleteWriterDocument,
  duplicateDocument as duplicateWriterDocument,
  getDocumentById,
  getDocumentTree as getWriterDocumentTree,
  getDocuments as listWriterDocuments,
  moveDocument as moveWriterDocument,
  updateDocument as updateWriterDocument,
} from './document'
import { listCharacters } from './character'
import { listLocations } from './location'
import { listTimelines } from './timeline'
import { listConcepts } from './concept'
import { listEntities } from './entities'
import { editorApi } from './editor'

type KeywordSuggestion = {
  type: string
  id: string
  name: string
  matchMode: 'exact' | 'prefix' | 'pinyin_prefix' | 'fuzzy'
}

type RankedKeywordSuggestion = KeywordSuggestion & {
  rank: number
}

export type Project = ProjectSummary
export type Document = Awaited<ReturnType<typeof getDocumentById>>

export interface ParagraphContent {
  paragraphId?: string
  order: number
  content: string
  contentType?: string
  version?: number
  updatedAt?: string
}

export { ProjectCreateData, ProjectUpdateData }

export const getProjects = (params?: ProjectListParams) => listWriterProjects(params)
export const getProject = (id: string) => getProjectById(id)
export const getProjectByIdCompat = (id: string) => getProjectById(id)
export const createProject = (data: ProjectCreateData) => createWriterProject(data)
export const updateProject = (id: string, data: ProjectUpdateData) => updateWriterProject(id, data)
export const deleteProject = (id: string) => deleteWriterProject(id)

export const getDocuments = (projectId: string, params?: { page?: number; pageSize?: number }) =>
  listWriterDocuments(projectId, params)
export const getProjectDocuments = getDocuments
export const getDocument = (id: string) => getDocumentById(id)
export const getDocumentByIdCompat = getDocument
export const getDocumentContent = (id: string) => editorApi.getContent(id)
export const getDocumentTree = (projectId: string) => getWriterDocumentTree(projectId)
export const getSaveStatus = (id: string) => editorApi.getSaveStatus(id)

export const createDocument = (projectId: string, body: Record<string, unknown>) =>
  createWriterDocument(projectId, body as never)
export const updateDocument = (id: string, body: Record<string, unknown>) =>
  updateWriterDocument(id, body as never)
export const deleteDocument = (id: string) => deleteWriterDocument(id)

export const autosaveDocument = (
  id: string,
  body: { content: string; currentVersion?: number; saveType?: 'auto' | 'manual' },
) => editorApi.autoSave(id, body as never)

export const updateDocumentContent = (
  id: string,
  body: { content: string; version?: number; contentType?: string },
) => editorApi.updateContent(id, body as never)

export const moveDocument = (id: string, body: Record<string, unknown>) =>
  moveWriterDocument(id, {
    parentId:
      typeof body.parentId === 'string'
        ? body.parentId
        : typeof body.newParentId === 'string'
          ? body.newParentId
          : undefined,
    order:
      typeof body.order === 'number'
        ? body.order
        : typeof body.newOrder === 'number'
          ? body.newOrder
          : undefined,
  })

export const updateDocumentWordCount = (
  id: string,
  body: { content: string; filterMarkdown?: boolean },
) => editorApi.calculateWordCount(id, body)

export const getDocumentContents = (id: string) => editorApi.getContents(id) as any
export const replaceDocumentContents = (id: string, contents: ParagraphContent[]) =>
  editorApi.replaceContents(id, contents as unknown[]) as any
export const reindexDocumentContents = (id: string) => editorApi.reindexContents(id) as any

export const searchProjectKeywords = async (projectId: string, q: string, limit = 20) => {
  if (isRemoteWriterMode()) {
    return httpService.get<{
      query: string
      suggestions: Array<{ type: string; id: string; name: string; matchMode: string }>
    }>(`/writer/projects/${projectId}/keywords/search`, {
      params: { q, limit },
    })
  }

  const query = q.trim().toLowerCase()
  if (!query) {
    return { query: q, suggestions: [] }
  }

  const [documentTree, characters, locations, timelines, concepts, entities] = await Promise.all([
    getWriterDocumentTree(projectId).catch(() => []),
    listCharacters(projectId).catch(() => []),
    listLocations(projectId).catch(() => []),
    listTimelines(projectId).catch(() => []),
    listConcepts(projectId).catch(() => []),
    listEntities(projectId).catch(() => []),
  ])

  const flattenDocuments = (nodes: Array<{ id: string; title?: string; type?: string; children?: any[] }>) => {
    const collector: Array<{ id: string; title?: string; type?: string }> = []
    const visit = (items: Array<{ id: string; title?: string; type?: string; children?: any[] }>) => {
      for (const item of items) {
        collector.push(item)
        if (Array.isArray(item.children) && item.children.length > 0) {
          visit(item.children)
        }
      }
    }
    visit(nodes)
    return collector
  }

  const candidates = [
    ...flattenDocuments(Array.isArray(documentTree) ? documentTree : []).map((item) => ({
      type: item.type === 'volume' ? 'chapter' : (item.type || 'chapter'),
      id: item.id,
      name: item.title || '',
    })),
    ...(Array.isArray(characters) ? characters : []).map((item) => ({
      type: 'character',
      id: item.id,
      name: item.name || '',
    })),
    ...(Array.isArray(locations) ? locations : []).map((item) => ({
      type: 'location',
      id: item.id,
      name: item.name || '',
    })),
    ...(Array.isArray(timelines) ? timelines : []).map((item) => ({
      type: 'timeline',
      id: item.id,
      name: item.name || '',
    })),
    ...(Array.isArray(concepts) ? concepts : []).map((item) => ({
      type: 'concept',
      id: item.id,
      name: item.name || '',
    })),
    ...(Array.isArray(entities) ? entities : []).map((item) => ({
      type: item.entityType || 'keyword',
      id: item.id,
      name: item.name || '',
    })),
  ]

  const seen = new Set<string>()
  const rankedSuggestions = candidates
    .filter((item) => item.id && item.name)
    .flatMap<RankedKeywordSuggestion>((item) => {
      const normalizedName = item.name.trim().toLowerCase()
      const pinyinMatchIndexes = /^[a-z]+$/i.test(query) ? match(item.name, query) : null
      if (!normalizedName) {
        return []
      }

      let matchMode: KeywordSuggestion['matchMode'] | null = null
      let rank = 0
      if (normalizedName === query) {
        matchMode = 'exact'
        rank = 0
      } else if (normalizedName.startsWith(query)) {
        matchMode = 'prefix'
        rank = 1
      } else if ((pinyinMatchIndexes?.length ?? 0) > 0) {
        matchMode = 'pinyin_prefix'
        rank = 2
      } else if (normalizedName.includes(query)) {
        matchMode = 'fuzzy'
        rank = 3
      }

      if (!matchMode) {
        return []
      }

      return [{ ...item, matchMode, rank }]
    })
    .sort((left, right) => left.rank - right.rank || left.name.length - right.name.length)
    .filter((item) => {
      const key = `${item.type}:${item.id}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
    .slice(0, limit)
    .map<KeywordSuggestion>(({ rank: _rank, ...item }) => item)

  return {
    query: q,
    suggestions: rankedSuggestions,
  }
}

export const duplicateDocument = duplicateWriterDocument

export {
  getProjectByIdCompat as getProjectById,
  getDocumentByIdCompat as getDocumentById,
}

export default {
  getProjects,
  getProject,
  getProjectById: getProjectByIdCompat,
  createProject,
  updateProject,
  deleteProject,
  getDocuments,
  getProjectDocuments,
  getDocument,
  getDocumentById: getDocumentByIdCompat,
  getDocumentContent,
  getDocumentContents,
  getDocumentTree,
  getSaveStatus,
  createDocument,
  updateDocument,
  deleteDocument,
  autosaveDocument,
  updateDocumentContent,
  replaceDocumentContents,
  reindexDocumentContents,
  moveDocument,
  updateDocumentWordCount,
  searchProjectKeywords,
  duplicateDocument,
}
