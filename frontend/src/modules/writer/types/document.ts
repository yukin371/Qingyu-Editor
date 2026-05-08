import type { BaseEntity, ID, ISODate } from './core'
import type { CharacterAppearance } from './character'

// =======================
// Enums
// =======================

export enum DocumentType {
  VOLUME = 'volume', // 卷
  CHAPTER = 'chapter', // 章
  SECTION = 'section', // 节
  SCENE = 'scene', // 场景
}

// 对应后端 Status string: planned | writing | completed
export enum DocumentStatus {
  PLANNED = 'planned',
  WRITING = 'writing',
  COMPLETED = 'completed',
}

export enum ContentType {
  MARKDOWN = 'markdown',
  RICHTEXT = 'richtext',
}

// =======================
// Entities
// =======================

/**
 * 文档元数据（用于目录树）
 * 不包含 content
 */
export interface Document extends BaseEntity {
  projectId: ID
  documentId?: ID // 别名，指向id字段
  parentId?: ID // 空字符串或 undefined 表示根节点
  title: string
  type: DocumentType
  level: number // 0-2
  order: number
  status: DocumentStatus | string

  // 统计
  wordCount: number

  // 关联信息 IDs
  characterIds?: ID[]
  locationIds?: ID[]
  timelineIds?: ID[]

  // 写作辅助
  plotThreads?: string[]
  keyPoints?: string[]
  writingHints?: string[]

  tags?: string[]
  notes?: string

  // 批量操作支持字段
  stableRef?: string  // 稳定引用（ULID），用于跨会话标识文档
  orderKey?: string   // 排序键（LexoRank），支持精确的相对排序

  // 前端辅助字段（非后端返回，可选）
  children?: Document[] // 用于构建树形结构
  characterAppearances?: CharacterAppearance[] // 该节点的角色登场详情
}

/**
 * 文档内容（用于编辑器）
 * 对应后端 DocumentContent
 */
export interface DocumentContent {
  id: ID
  documentId: ID
  content: string
  contentType: ContentType
  wordCount: number
  charCount: number
  gridfsId?: string // 大文件 ID
  version: number
  lastSavedAt: ISODate
  lastEditedBy: string
  updatedAt: ISODate
  createdAt: ISODate
}

// =======================
// DTOs (Data Transfer Objects) - 请求参数
// =======================

export interface CreateDocumentRequest {
  projectId: ID
  parentId?: ID
  title: string
  type: DocumentType
  order?: number // 如果不传，后端通常会自动追加到最后
}

export interface UpdateDocumentMetaRequest {
  title?: string
  status?: DocumentStatus
  characterIds?: ID[]
  locationIds?: ID[]
  timelineIds?: ID[]
  tags?: string[]
  notes?: string
  plotThreads?: string[]
}

export interface SaveContentRequest {
  content: string
  wordCount?: number // 可选
  force?: boolean // 用于解决版本冲突
}

// 移动文档请求
export interface MoveDocumentRequest {
  documentId?: string // 虽然通常在 path 参数中，但有些后端也会要求 body 里传
  parentId?: string // 移动目标父节点 ID
  order?: number // 移动后的排序位置
}

// 重排序请求
export interface ReorderDocumentsRequest {
  projectId?: string
  documentIds: string[] // 排序后的 ID 列表
  parentId?: string // 这些文档所属的父节点
}

// =======================
// Responses - 响应结构
// =======================

/**
 * 创建文档响应
 * 通常后端会返回创建完整的文档对象（包含生成的 ID、创建时间等）
 */
export type CreateDocumentResponse = Document

/**
 * 文档树响应
 * 如果后端返回的是根节点数组（每个节点包含 children），则类型如下
 */
export type DocumentTreeResponse = Document[]

// 如果后端返回的是包裹对象（例如 { tree: [...] }），请使用下方定义：
// export interface DocumentTreeResponse {
//   tree: Document[];
// }

// =======================
// List Responses
// =======================

export interface ListDocumentsResponse {
  documents: Document[]
  total: number
  page: number
  size: number
}
