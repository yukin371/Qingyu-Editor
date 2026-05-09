import httpService from '@/core/services/http.service'
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
import { editorApi } from './editor'

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
) =>
  httpService.post<{ wordCount: number; charCount: number }>(`/writer/documents/${id}/word-count`, body)

export const getDocumentContents = (id: string) => editorApi.getContents(id) as any
export const replaceDocumentContents = (id: string, contents: ParagraphContent[]) =>
  editorApi.replaceContents(id, contents as unknown[]) as any
export const reindexDocumentContents = (id: string) => editorApi.reindexContents(id) as any

export const searchProjectKeywords = (projectId: string, q: string, limit = 20) =>
  httpService.get<{
    query: string
    suggestions: Array<{ type: string; id: string; name: string; matchMode: string }>
  }>(`/writer/projects/${projectId}/keywords/search`, {
    params: { q, limit },
  })

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
