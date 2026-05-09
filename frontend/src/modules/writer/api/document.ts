import { httpService } from '@/core/services/http.service'
import type {
  Document,
  CreateDocumentRequest,
  UpdateDocumentMetaRequest,
  CreateDocumentResponse, // 假设你需要后端返回的新ID等
} from '../types/document'
import { outlineApi } from './outline'
import { isWailsWriterAvailable, wailsWriterBridge } from '../data-bridge/wails'

// 为了处理移动和排序，我们需要定义额外的请求接口
// 这些接口通常比较简单，直接定义在 API 文件中即可，或者放在 types/document.ts 中
export interface MoveDocumentRequest {
  parentId?: string // 移动到哪个父节点下，为空则移到根目录
  order?: number // 新的排序位置 (可选)
}

export interface ReorderDocumentsRequest {
  documentIds: string[] // 按顺序排列的 ID 列表
  parentId?: string // 这些文档属于哪个父节点
}

export interface DuplicateDocumentRequest {
  targetParentId?: string // 目标父文档ID
  position: 'inner' | 'before' | 'after' // 放置位置
  copyContent: boolean // 是否复制内容
}

export interface DuplicateDocumentResponse {
  documentId: string
  title: string
  stableRef: string
}

const BASE_DOC_URL = '/writer/documents'
// 文档操作使用单数 project 路径（后端路由定义）
const BASE_PROJECT_DOC_URL = '/writer/project'

export const documentApi = {
  // ==========================================
  // 基础 CRUD
  // ==========================================

  /**
   * 创建文档
   * POST /api/v1/writer/project/{projectId}/documents
   */
  create(projectId: string, data: CreateDocumentRequest) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.document.create(projectId, data as unknown as Record<string, unknown>)
    }
    return httpService.post<CreateDocumentResponse>(
      `${BASE_PROJECT_DOC_URL}/${projectId}/documents`,
      data,
    )
  },

  /**
   * 获取文档详情 (通常是元数据)
   * GET /api/v1/writer/documents/{id}
   */
  getDetail(documentId: string) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.document.get(documentId)
    }
    return httpService.get<Document>(`${BASE_DOC_URL}/${documentId}`)
  },

  /**
   * 更新文档 (元数据/属性)
   * PUT /api/v1/writer/documents/{id}
   */
  update(documentId: string, data: UpdateDocumentMetaRequest) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.document.update(documentId, data as Record<string, unknown>)
    }
    return httpService.put<void>(`${BASE_DOC_URL}/${documentId}`, data)
  },

  /**
   * 删除文档
   * DELETE /api/v1/writer/documents/{id}
   */
  delete(documentId: string) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.document.delete(documentId)
    }
    return httpService.delete<void>(`${BASE_DOC_URL}/${documentId}`)
  },

  // ==========================================
  // 列表与树形结构
  // ==========================================

  /**
   * 获取文档列表 (分页)
   * GET /api/v1/writer/project/{projectId}/documents
   */
  list(projectId: string, params?: { page?: number; pageSize?: number }) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.document.list(projectId, params)
    }
    return httpService.get<{ documents: Document[]; total: number }>(
      `${BASE_PROJECT_DOC_URL}/${projectId}/documents`,
      params as any,
    )
  },

  /**
   * 获取文档树
   * GET /api/v1/writer/project/{projectId}/documents/tree
   */
  getTree(projectId: string) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.document.getTree(projectId)
    }
    // 根据后端返回类型调整泛型，可能是 Document[] 也可能是 { tree: Document[] }
    // 这里假设后端 DocumentTreeResponse 结构包含 tree 字段或本身就是数组
    return httpService.get<any>(`${BASE_PROJECT_DOC_URL}/${projectId}/documents/tree`)
  },

  // ==========================================
  // 结构调整 (Move & Reorder)
  // ==========================================

  /**
   * 移动文档 (修改 ParentID)
   * PUT /api/v1/writer/documents/{id}/move
   */
  move(documentId: string, data: MoveDocumentRequest) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.document.move(documentId, data)
    }
    return httpService.put<{ code: number; message?: string }>(`${BASE_DOC_URL}/${documentId}/move`, data)
  },

  /**
   * 重新排序 (批量更新同级文档)
   * PUT /api/v1/writer/project/{projectId}/documents/reorder
   */
  reorder(projectId: string, data: ReorderDocumentsRequest) {
    return httpService.put<void>(`${BASE_PROJECT_DOC_URL}/${projectId}/documents/reorder`, data)
  },

  // ==========================================
  // 复制操作 (Duplicate)
  // ==========================================

  /**
   * 复制文档
   * POST /api/v1/writer/documents/{id}/duplicate
   */
  duplicate(documentId: string, data: DuplicateDocumentRequest) {
    return httpService.post<DuplicateDocumentResponse>(
      `/writer/documents/${documentId}/duplicate`,
      data,
    )
  },

  // ==========================================
  // 内容操作 (Content) - 如果内容操作也在 DocumentApi 中
  // 若不在，可能在 ContentApi，但通常通过 ID 获取内容也是文档操作的一部分
  // ==========================================

  // 假设获取正文内容的接口 (虽然你给的代码里没看到，但通常会有)
  // GET /api/v1/documents/{id}/content
  // getContent(documentId: string) { ... }
}

// ==========================================
// 命名导出函数 (为了向后兼容 writerStore)
// ==========================================

/**
 * 获取文档列表
 */
export const getDocuments = (projectId: string, params?: { page?: number; pageSize?: number }) => {
  return documentApi.list(projectId, params)
}

/**
 * 获取文档树
 */
export const getDocumentTree = (projectId: string) => {
  return documentApi.getTree(projectId)
}

/**
 * 获取文档详情
 */
export const getDocumentById = (documentId: string) => {
  return documentApi.getDetail(documentId)
}

/**
 * 创建文档
 */
export const createDocument = (projectId: string, data: CreateDocumentRequest) => {
  return documentApi.create(projectId, data)
}

/**
 * 更新文档元数据
 */
export const updateDocument = (documentId: string, data: UpdateDocumentMetaRequest) => {
  return documentApi.update(documentId, data)
}

/**
 * 删除文档
 */
export const deleteDocument = (documentId: string) => {
  return documentApi.delete(documentId)
}

/**
 * 移动文档
 */
export const moveDocument = (documentId: string, data: MoveDocumentRequest) => {
  return documentApi.move(documentId, data)
}

/**
 * 获取大纲树
 */
export const getOutlineTree = (projectId: string) => {
  return outlineApi.getTree(projectId)
}

/**
 * 创建大纲节点
 */
export const createOutlineNode = (projectId: string, data: any) => {
  return outlineApi.create(projectId, {
    parentId: data.parentId,
    title: data.title,
    type: data.type,
    order: data.order,
    summary: data.summary,
    documentId: data.documentId,
    characters: data.characters,
    items: data.items,
  })
}

/**
 * 更新大纲节点
 */
export const updateOutlineNode = (documentId: string, data: UpdateDocumentMetaRequest) => {
  return documentApi.update(documentId, data)
}

/**
 * 删除大纲节点
 */
export const deleteOutlineNode = (documentId: string) => {
  return documentApi.delete(documentId)
}

/**
 * 复制文档
 */
export const duplicateDocument = (documentId: string, data: DuplicateDocumentRequest) => {
  return documentApi.duplicate(documentId, data)
}
