import type { RouteLocationRaw } from 'vue-router'
import { importProjectFromZip, type ImportResult } from '@/utils/exportImport'
import { createDocument, getDocumentTree } from '../api/document'
import { projectApi, type ProjectDetailResponse, type ProjectSummary } from '../api/project'
import { WRITER_ROUTE_NAMES } from '../routes'
import { DocumentType, type Document } from '../types/document'
import type { WorkbenchRecentProjectCard } from '../types/workbench'

type ProjectDocumentSummary = ProjectDetailResponse['documents'][number]

function parseTimestamp(value: string | undefined): number {
  if (!value) {
    return 0
  }

  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function getSummaryUpdatedAt(project: ProjectSummary): string {
  return project.updatedAt || project.lastUpdateTime || project.createdAt || ''
}

function getProjectStatusLabel(status: string | undefined): string {
  switch (status) {
    case 'completed':
      return '已完结'
    case 'serializing':
      return '连载中'
    case 'suspended':
      return '暂停中'
    case 'archived':
      return '已归档'
    default:
      return '筹备中'
  }
}

function findLatestChapter(detail: ProjectDetailResponse | null): ProjectDocumentSummary | null {
  if (!detail?.documents?.length) {
    return null
  }

  const chapters = detail.documents.filter((document) => document.type === 'chapter')
  if (chapters.length === 0) {
    return null
  }

  return [...chapters].sort(
    (left, right) => parseTimestamp(right.lastEditAt) - parseTimestamp(left.lastEditAt),
  )[0]
}

function flattenDocuments(documents: Document[]): Document[] {
  const result: Document[] = []
  const visit = (nodes: Document[]) => {
    for (const node of nodes) {
      result.push(node)
      if (node.children?.length) {
        visit(node.children)
      }
    }
  }

  visit(documents)
  return result
}

function normalizeDocumentTree(payload: unknown): Document[] {
  if (Array.isArray(payload)) {
    return payload as Document[]
  }
  if (payload && typeof payload === 'object') {
    const record = payload as { documents?: Document[]; tree?: Document[] }
    if (Array.isArray(record.documents)) return record.documents
    if (Array.isArray(record.tree)) return record.tree
  }
  return []
}

function sortDocumentsByOrder(documents: Document[]): Document[] {
  return [...documents].sort(
    (left, right) =>
      String(left.orderKey || '').localeCompare(String(right.orderKey || '')) ||
      Number(left.order ?? 0) - Number(right.order ?? 0) ||
      String(left.createdAt || '').localeCompare(String(right.createdAt || '')),
  )
}

export function sortProjectsByRecent(projects: ProjectSummary[]): ProjectSummary[] {
  return [...projects].sort(
    (left, right) =>
      parseTimestamp(getSummaryUpdatedAt(right)) - parseTimestamp(getSummaryUpdatedAt(left)),
  )
}

export async function resolveProjectContinueTarget(projectId: string): Promise<RouteLocationRaw> {
  try {
    const detail = (await projectApi.getDetail(projectId)) as ProjectDetailResponse
    const latestChapter = findLatestChapter(detail)

    return {
      name: WRITER_ROUTE_NAMES.project,
      params: { projectId },
      query: latestChapter?.id ? { chapterId: latestChapter.id } : undefined,
    }
  } catch {
    return {
      name: WRITER_ROUTE_NAMES.project,
      params: { projectId },
    }
  }
}

export async function ensureProjectBaseSkeleton(projectId: string): Promise<{ chapterId?: string }> {
  if (!projectId) {
    return {}
  }

  const tree = normalizeDocumentTree(await getDocumentTree(projectId))
  const flatDocs = flattenDocuments(tree)
  const existingChapter = sortDocumentsByOrder(
    flatDocs.filter((document) => document.type === DocumentType.CHAPTER),
  )[0]

  if (existingChapter?.id) {
    return { chapterId: existingChapter.id }
  }

  const existingVolume = sortDocumentsByOrder(
    flatDocs.filter((document) => document.type === DocumentType.VOLUME),
  )[0]

  const volume =
    existingVolume ||
    (await createDocument(projectId, {
      projectId,
      title: '第一卷',
      type: DocumentType.VOLUME,
      order: 0,
    }))

  const chapter = await createDocument(projectId, {
    projectId,
    parentId: volume.id,
    title: '第一章',
    type: DocumentType.CHAPTER,
    order: 0,
  })

  return { chapterId: chapter.id }
}

export async function buildWorkbenchRecentProjectCards(
  projects: ProjectSummary[],
  limit = 4,
): Promise<WorkbenchRecentProjectCard[]> {
  const candidates = sortProjectsByRecent(projects).slice(0, limit)

  const detailPairs = await Promise.all(
    candidates.map(async (project) => {
      try {
        const detail = (await projectApi.getDetail(project.id)) as ProjectDetailResponse
        return [project.id, detail] as const
      } catch {
        return [project.id, null] as const
      }
    }),
  )

  const detailMap = new Map(detailPairs)

  return candidates.map((project) => {
    const detail = detailMap.get(project.id) ?? null
    const latestChapter = findLatestChapter(detail)

    return {
      id: project.id,
      title: project.title,
      summary: project.summary || '还没有补充项目摘要',
      status: project.status,
      statusLabel: getProjectStatusLabel(project.status),
      category: project.category || project.genre || '未分类',
      totalWords: Number(project.totalWords ?? project.wordCount ?? 0),
      chapterCount: Number(project.chapterCount ?? 0),
      updatedAt: getSummaryUpdatedAt(project),
      lastChapterId: latestChapter?.id,
      lastChapterTitle: latestChapter?.title,
      continueTarget: latestChapter?.id
        ? {
            name: WRITER_ROUTE_NAMES.project,
            params: { projectId: project.id },
            query: { chapterId: latestChapter.id },
          }
        : {
            name: WRITER_ROUTE_NAMES.project,
            params: { projectId: project.id },
          },
    }
  })
}

export async function importProjectArchive(file: File): Promise<ImportResult> {
  return importProjectFromZip(file)
}

export { getProjectStatusLabel }
