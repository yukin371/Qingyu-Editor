import httpService from '@/core/services/http.service'
import type { OutlineNode } from '@/types/writer'

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
    return httpService.post<OutlineNode>(`${BASE_PROJECT_URL}/${projectId}/outlines`, data)
  },

  /**
   * 获取大纲详情
   * GET /api/v1/writer/outlines/{outlineId}
   */
  getDetail(outlineId: string, projectId: string) {
    return httpService.get<OutlineNode>(`${BASE_OUTLINE_URL}/${outlineId}?projectId=${projectId}`)
  },

  /**
   * 更新大纲
   * PUT /api/v1/writer/outlines/{outlineId}
   */
  update(outlineId: string, projectId: string, data: UpdateOutlineRequest) {
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
    return httpService.get<OutlineNode[]>(`${BASE_PROJECT_URL}/${projectId}/outlines`)
  },

  /**
   * 获取大纲树
   * GET /api/v1/writer/projects/{projectId}/outlines/tree
   */
  async getTree(projectId: string): Promise<OutlineTreeNode[]> {
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
    const params = parentId ? `?parentId=${parentId}` : ''
    return httpService.get<OutlineNode[]>(
      `${BASE_PROJECT_URL}/${projectId}/outlines/children${params}`,
    )
  },
}
