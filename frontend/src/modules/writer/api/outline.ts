import httpService from '@/core/services/http.service'
import type { OutlineNode } from '@/types/writer'
import { isWailsWriterAvailable, wailsWriterBridge } from '../data-bridge/wails'
import { DocumentType } from '../types/document'

// ============================================================================
// 请求/响应类型定义
// ============================================================================

export interface CreateOutlineRequest {
  title: string
  parentId?: string
  summary?: string
  type?: string
  tension?: number
  documentId?: string
  characters?: string[]
  items?: string[]
  order?: number
}

export interface UpdateOutlineRequest {
  title?: string
  parentId?: string
  summary?: string
  type?: string
  tension?: number
  documentId?: string
  characters?: string[]
  items?: string[]
  order?: number
}

export interface OutlineTreeNode extends OutlineNode {
  children?: OutlineTreeNode[]
}

export type OutlineTreeResponse =
  | OutlineTreeNode[]
  | {
      data?: OutlineTreeNode[]
      list?: OutlineTreeNode[]
      tree?: OutlineTreeNode[]
    }

type WailsDocumentNode = {
  id: string
  documentId?: string
  projectId: string
  parentId?: string
  title: string
  type?: string
  level?: number
  order?: number
  status?: string
  wordCount?: number
  createdAt?: string
  updatedAt?: string
  children?: WailsDocumentNode[]
}

// ============================================================================
// 大纲节点类型配置
// ============================================================================

export const OUTLINE_NODE_TYPE_CONFIG: Record<
  string,
  {
    label: string
    icon: string
    color: string
  }
> = {
  volume: { label: '卷', icon: '📚', color: '#8B5CF6' },
  plot: { label: '情节', icon: '📖', color: '#409EFF' },
  idea: { label: '灵感', icon: '💡', color: '#E6A23C' },
  draft: { label: '草稿', icon: '📝', color: '#909399' },
  setting: { label: '设定', icon: '⚙️', color: '#67C23A' },
  chapter: { label: '章节', icon: '📄', color: '#F56C6C' },
}

/** 所有可选的节点类型 */
export const OUTLINE_NODE_TYPES = Object.keys(OUTLINE_NODE_TYPE_CONFIG) as string[]

/** 兼容旧类型映射 */
export const LEGACY_TYPE_MAP: Record<string, string> = {
  arc: 'plot',
  scene: 'chapter',
}

/** 获取节点类型的显示信息 */
export function getOutlineNodeTypeInfo(type?: string | null): {
  label: string
  icon: string
  color: string
} {
  if (!type) return { label: '未分类', icon: '📋', color: '#C0C4CC' }
  // 兼容旧类型
  const resolvedType = LEGACY_TYPE_MAP[type] || type
  return OUTLINE_NODE_TYPE_CONFIG[resolvedType] || { label: type, icon: '📋', color: '#C0C4CC' }
}

export function normalizeOutlineTreeResponse(response: unknown): OutlineTreeNode[] {
  if (Array.isArray(response)) {
    return response
  }

  if (!response || typeof response !== 'object') {
    return []
  }

  const wrapped = response as {
    data?: OutlineTreeNode[]
    list?: OutlineTreeNode[]
    tree?: OutlineTreeNode[]
  }

  if (Array.isArray(wrapped.data)) {
    return wrapped.data
  }

  if (Array.isArray(wrapped.list)) {
    return wrapped.list
  }

  if (Array.isArray(wrapped.tree)) {
    return wrapped.tree
  }

  return []
}

function mapWailsDocumentNodeToOutlineNode(
  node: WailsDocumentNode,
  projectId?: string,
): OutlineTreeNode {
  return {
    id: node.id,
    projectId: node.projectId || projectId || '',
    documentId: node.documentId || node.id,
    title: node.title,
    description: '',
    order: Number(node.order ?? 0),
    level: Number(node.level ?? 0),
    parentId: node.parentId || undefined,
    wordCount: Number(node.wordCount ?? 0),
    status: (node.status as OutlineNode['status']) || 'draft',
    type: node.type || DocumentType.CHAPTER,
    children: (node.children || []).map((child) =>
      mapWailsDocumentNodeToOutlineNode(child, node.projectId || projectId),
    ),
  }
}

function mapWailsTreeToOutlineTree(
  response: unknown,
  projectId: string,
): OutlineTreeNode[] {
  if (!Array.isArray(response)) {
    return []
  }

  return response.map((node) =>
    mapWailsDocumentNodeToOutlineNode(node as WailsDocumentNode, projectId),
  )
}

async function getWailsOutlineNode(nodeId: string) {
  const node = (await wailsWriterBridge.document.get(nodeId)) as WailsDocumentNode
  return mapWailsDocumentNodeToOutlineNode(node, node.projectId)
}

async function createWailsOutlineNode(projectId: string, data: CreateOutlineRequest) {
  const normalizedType = data.type || ''

  if (!data.parentId) {
    const created = (await wailsWriterBridge.document.create(projectId, {
      projectId,
      title: data.title,
      type: DocumentType.VOLUME,
      order: data.order,
    })) as WailsDocumentNode
    return mapWailsDocumentNodeToOutlineNode(created, projectId)
  }

  const parent = (await wailsWriterBridge.document.get(data.parentId)) as WailsDocumentNode

  if (data.documentId) {
    if (parent.type === DocumentType.VOLUME) {
      await wailsWriterBridge.document.move(data.documentId, {
        parentId: parent.id,
        order: data.order,
      })
      if (data.title) {
        await wailsWriterBridge.document.update(data.documentId, {
          title: data.title,
        })
      }
      return getWailsOutlineNode(data.documentId)
    }

    return getWailsOutlineNode(data.documentId)
  }

  if (parent.type === DocumentType.VOLUME && (!normalizedType || normalizedType === DocumentType.CHAPTER)) {
    const created = (await wailsWriterBridge.document.create(projectId, {
      projectId,
      parentId: parent.id,
      title: data.title,
      type: DocumentType.CHAPTER,
      order: data.order,
    })) as WailsDocumentNode
    return mapWailsDocumentNodeToOutlineNode(created, projectId)
  }

  throw new Error('桌面端当前仅支持卷/章节结构；独立大纲节点仍待后续本地化')
}

async function updateWailsOutlineNode(
  outlineId: string,
  data: UpdateOutlineRequest,
) {
  const node = (await wailsWriterBridge.document.get(outlineId)) as WailsDocumentNode
  const documentId = node.documentId || node.id

  if (typeof data.parentId === 'string' || typeof data.order === 'number') {
    await wailsWriterBridge.document.move(documentId, {
      parentId: data.parentId,
      order: data.order,
    })
  }

  if (typeof data.title === 'string') {
    await wailsWriterBridge.document.update(documentId, {
      title: data.title,
    })
  }

  return getWailsOutlineNode(documentId)
}

async function deleteWailsOutlineNode(outlineId: string) {
  const node = (await wailsWriterBridge.document.get(outlineId)) as WailsDocumentNode
  await wailsWriterBridge.document.delete(node.documentId || node.id)
}

// ============================================================================
// API 常量
// ============================================================================

const BASE_OUTLINE_URL = '/writer/outlines'
const BASE_PROJECT_URL = '/writer/projects'

// ============================================================================
// 大纲 API
// ============================================================================

export const outlineApi = {
  // ==========================================
  // 基础 CRUD
  // ==========================================

  /**
   * 创建大纲节点
   * POST /api/v1/writer/projects/{projectId}/outlines
   */
  create(projectId: string, data: CreateOutlineRequest) {
    if (isWailsWriterAvailable()) {
      return createWailsOutlineNode(projectId, data)
    }
    return httpService.post<OutlineNode>(`${BASE_PROJECT_URL}/${projectId}/outlines`, data)
  },

  /**
   * 获取大纲详情
   * GET /api/v1/writer/outlines/{outlineId}
   */
  getDetail(outlineId: string, projectId: string) {
    if (isWailsWriterAvailable()) {
      return getWailsOutlineNode(outlineId)
    }
    return httpService.get<OutlineNode>(`${BASE_OUTLINE_URL}/${outlineId}?projectId=${projectId}`)
  },

  /**
   * 更新大纲
   * PUT /api/v1/writer/outlines/{outlineId}
   */
  update(outlineId: string, projectId: string, data: UpdateOutlineRequest) {
    if (isWailsWriterAvailable()) {
      return updateWailsOutlineNode(outlineId, data)
    }
    return httpService.put<OutlineNode>(
      `${BASE_OUTLINE_URL}/${outlineId}?projectId=${projectId}`,
      data,
    )
  },

  /**
   * 删除大纲
   * DELETE /api/v1/writer/outlines/{outlineId}
   */
  delete(outlineId: string, projectId: string) {
    if (isWailsWriterAvailable()) {
      return deleteWailsOutlineNode(outlineId)
    }
    return httpService.delete<void>(`${BASE_OUTLINE_URL}/${outlineId}?projectId=${projectId}`)
  },

  // ==========================================
  // 列表与树形结构
  // ==========================================

  /**
   * 获取项目大纲列表
   * GET /api/v1/writer/projects/{projectId}/outlines
   */
  list(projectId: string) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.document.getTree(projectId).then((tree) =>
        mapWailsTreeToOutlineTree(tree, projectId),
      )
    }
    return httpService.get<OutlineNode[]>(`${BASE_PROJECT_URL}/${projectId}/outlines`)
  },

  /**
   * 获取大纲树
   * GET /api/v1/writer/projects/{projectId}/outlines/tree
   */
  async getTree(projectId: string): Promise<OutlineTreeNode[]> {
    if (isWailsWriterAvailable()) {
      const tree = await wailsWriterBridge.document.getTree(projectId)
      return mapWailsTreeToOutlineTree(tree, projectId)
    }
    const response = await httpService.get<unknown>(
      `${BASE_PROJECT_URL}/${projectId}/outlines/tree`,
    )
    return normalizeOutlineTreeResponse(response)
  },

  /**
   * 获取子节点列表
   * GET /api/v1/writer/projects/{projectId}/outlines/children
   */
  getChildren(projectId: string, parentId?: string) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.document.getTree(projectId).then((tree) => {
        const outlineTree = mapWailsTreeToOutlineTree(tree, projectId)
        if (!parentId) {
          return outlineTree
        }

        const queue = [...outlineTree]
        while (queue.length > 0) {
          const current = queue.shift()
          if (!current) {
            continue
          }
          if (current.id === parentId) {
            return current.children || []
          }
          if (current.children?.length) {
            queue.push(...current.children)
          }
        }

        return []
      })
    }
    const params = parentId ? `?parentId=${parentId}` : ''
    return httpService.get<OutlineNode[]>(
      `${BASE_PROJECT_URL}/${projectId}/outlines/children${params}`,
    )
  },
}
