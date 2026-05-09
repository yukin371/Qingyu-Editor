import {
  CreateChapter,
  CreateProject,
  CreateVolume,
  DeleteChapter,
  DeleteProject,
  DeleteVolume,
  GetChapter,
  GetProject,
  ListChapters,
  ListProjects,
  ListVolumes,
  MoveChapter,
  ReorderVolumes,
  UpdateChapter,
  UpdateProject,
  UpdateVolume,
} from '../../../../wailsjs/go/main/App'
import { DocumentType } from '../types/document'

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

const documentIndex = new Map<string, BridgeDocumentNode>()

export function isWailsWriterAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  const candidate = window as typeof window & { go?: { main?: { App?: Record<string, unknown> } } }
  return !!candidate.go?.main?.App
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
  const normalized = text.trim()
  if (!normalized) {
    return 0
  }
  const segments = normalized.split(/\s+/).filter(Boolean)
  if (segments.length > 1) {
    return segments.length
  }
  return normalized.replace(/\s+/g, '').length
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

export const wailsWriterBridge = {
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
