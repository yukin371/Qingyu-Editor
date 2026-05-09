/**
 * Writer API Wrapper
 * 将orval生成的工厂模式API转换为更易使用的格式
 *
 * 使用方式：
 * import * as writerAPI from '@/modules/writer/api'
 * const projects = await writerAPI.getProjects({ page: 1, size: 20 })
 */

import { getApi } from './generated/writer'
import { request } from '@/utils/request-adapter'
import { documentApi } from './document'
import { editorApi } from './editor'

// 获取生成的API对象
const api = getApi()

// ==================== 类型定义 ====================

/**
 * 写作项目
 */
export interface Project {
  id: string
  name: string
  description?: string
  genre?: string
  targetWords?: number
  currentWords?: number
  status: 'planning' | 'writing' | 'completed' | 'published'
  createdAt?: string
  updatedAt?: string
}

/**
 * 写作文档
 */
export interface Document {
  id: string
  projectId: string
  title: string
  content?: string
  wordCount?: number
  chapterNumber?: number
  status: 'draft' | 'published' | 'archived'
  publishedAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface ParagraphContent {
  paragraphId?: string
  order: number
  content: string
  contentType?: string
  version?: number
  updatedAt?: string
}

/**
 * 文档评论
 */
export interface DocumentComment {
  id: string
  documentId: string
  authorId: string
  authorName: string
  content: string
  parentId?: string
  threadId?: string
  isResolved: boolean
  createdAt: string
  updatedAt: string
}

/**
 * 文档模板
 */
export interface DocumentTemplate {
  id: string
  name: string
  description?: string
  category?: string
  content: string
  variables?: string[]
  createdAt?: string
  updatedAt?: string
}

/**
 * 批量操作状态
 */
export interface BatchOperation {
  id: string
  type: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  totalItems: number
  processedItems: number
  succeededItems: number
  failedItems: number
  errors?: Array<{
    item: string
    error: string
  }>
  createdAt: string
  updatedAt: string
}

/**
 * 导出任务
 */
export interface ExportTask {
  id: string
  projectId: string
  documentId?: string
  format: 'pdf' | 'docx' | 'txt' | 'epub'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  downloadUrl?: string
  createdAt: string
  completedAt?: string
}

/**
 * 发布任务
 */
export interface PublicationTask {
  id: string
  projectId: string
  documentId?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  publishedAt?: string
  createdAt: string
}

/**
 * 书籍统计
 */
export interface BookStatistics {
  bookId: string
  totalViews: number
  totalReads: number
  totalWords: number
  totalChapters: number
  averageReadTime: number
  completionRate: number
  dailyStats?: Array<{
    date: string
    views: number
    reads: number
  }>
}

/**
 * 章节统计
 */
export interface ChapterStatistics {
  chapterId: string
  views: number
  reads: number
  averageReadTime: number
  completionRate: number
  dropOffRate: number
}

// ==================== 类型别名（向后兼容） ====================

/**
 * 项目创建数据类型别名
 * 注意：支持新旧字段映射
 */
export type ProjectCreateData = {
  title: string
  summary?: string // 后端字段（推荐）
  description?: string // 前端旧字段（向后兼容）
  coverUrl?: string // 后端字段（推荐）
  coverImage?: string // 前端旧字段（向后兼容）
  category?: string // 后端字段（推荐）
  genre?: string // 前端旧字段（向后兼容）
  tags?: string[]
  visibility?: 'public' | 'private'
}

/**
 * 项目更新数据类型别名
 * 注意：支持新旧字段映射
 */
export type ProjectUpdateData = {
  title?: string
  summary?: string // 后端字段（推荐）
  description?: string // 前端旧字段（向后兼容）
  coverUrl?: string // 后端字段（推荐）
  coverImage?: string // 前端旧字段（向后兼容）
  category?: string // 后端字段（推荐）
  genre?: string // 前端旧字段（向后兼容）
  tags?: string[]
  status?: string
  visibility?: string
}

/**
 * 文档创建数据类型别名
 */
export type DocumentCreateData = {
  projectId: string
  title: string
  content?: string
  chapterNumber?: number
  status?: 'draft' | 'published' | 'archived'
}

/**
 * 文档更新数据类型别名
 */
export type DocumentUpdateData = {
  title?: string
  content?: string
  status?: 'draft' | 'published' | 'archived'
}

// ==================== 项目相关 API ====================
// 使用 project.ts 中的正确路径（/writer/projects），而不是 generated API 中的错误路径

import * as projectApi from './project'
export const getProjects = projectApi.getProjects
export const getProject = projectApi.getProjectById
export const getProjectById = projectApi.getProjectById
export const createProject = projectApi.createProject
export const updateProject = projectApi.updateProject
export const deleteProject = projectApi.deleteProject

// ==================== 文档相关 API ====================

export const getDocuments = (projectId: string, params?: { page?: number; pageSize?: number }) =>
  documentApi.list(projectId, params)
export const getProjectDocuments = getDocuments
export const getDocument = (id: string) => documentApi.getDetail(id)
export const getDocumentById = getDocument
export const getDocumentContent = (id: string) => editorApi.getContent(id)
export const getDocumentTree = (projectId: string) => documentApi.getTree(projectId)
export const getSaveStatus = (id: string) => editorApi.getSaveStatus(id)

/**
 * 创建文档（在指定项目下）
 */
export const createDocument = (projectId: string, body: Record<string, unknown>) =>
  documentApi.create(projectId, body as any)

export const updateDocument = (id: string, body: Record<string, unknown>) =>
  documentApi.update(id, body as any)
export const deleteDocument = (id: string) => documentApi.delete(id)

/**
 * 自动保存文档
 */
export const autosaveDocument = (
  id: string,
  body: { content: string; currentVersion?: number; saveType?: 'auto' | 'manual' },
) => editorApi.autoSave(id, body as any)

/**
 * 更新文档内容
 */
export const updateDocumentContent = (
  id: string,
  body: { content: string; version?: number; contentType?: string },
) => editorApi.updateContent(id, body as any)

/**
 * 移动文档
 */
export const moveDocument = (id: string, body: Record<string, unknown>) =>
  documentApi.move(id, {
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

/**
 * 更新字数统计
 */
export const updateDocumentWordCount = (
  id: string,
  body: { content: string; filterMarkdown?: boolean },
) =>
  request<{ wordCount: number; charCount: number }>({
    url: `/api/v1/writer/documents/${id}/word-count`,
    method: 'post',
    data: body,
  })

/**
 * 获取文档分段内容（Editor V2）
 */
export const getDocumentContents = (id: string) => editorApi.getContents(id) as any

/**
 * 批量替换文档分段内容（Editor V2）
 */
export const replaceDocumentContents = (id: string, contents: ParagraphContent[]) =>
  editorApi.replaceContents(id, contents) as any

/**
 * 重建文档段落顺序（Editor V2）
 */
export const reindexDocumentContents = (id: string) => editorApi.reindexContents(id) as any

/**
 * 关键词检索（支持拼音模糊/补全）
 */
export const searchProjectKeywords = (projectId: string, q: string, limit = 20) =>
  request<{
    query: string
    suggestions: Array<{ type: string; id: string; name: string; matchMode: string }>
  }>({
    url: `/api/v1/writer/projects/${projectId}/keywords/search`,
    method: 'get',
    params: { q, limit },
  })

/**
 * 复制文档
 */
export const duplicateDocument = api.postApiV1WriterDocumentsIdDuplicate

/**
 * 导出文档
 */
export const exportDocument = api.postApiV1WriterDocumentsIdExport

/**
 * 发布文档
 */
export const publishDocument = api.postApiV1WriterDocumentsIdPublish

/**
 * 更新文档发布状态
 */
export const updateDocumentPublishStatus = api.putApiV1WriterDocumentsIdPublishStatus

// ==================== 文档锁定相关 API ====================

/**
 * 锁定文档
 */
export const lockDocument = api.postApiV1WriterDocumentsIdLock

/**
 * 解锁文档
 */
export const unlockDocument = api.deleteApiV1WriterDocumentsIdLock

/**
 * 刷新文档锁
 */
export const refreshDocumentLock = api.putApiV1WriterDocumentsIdLockRefresh

/**
 * 获取文档锁定状态
 */
export const getDocumentLockStatus = api.getApiV1WriterDocumentsIdLockStatus

/**
 * 延长文档锁
 */
export const extendDocumentLock = api.postApiV1WriterDocumentsIdLockExtend

/**
 * 强制解锁文档
 */
export const forceUnlockDocument = api.postApiV1WriterDocumentsIdLockForce

// ==================== 文档评论相关 API ====================

/**
 * 获取文档评论列表
 */
export const getDocumentComments = api.getApiV1WriterDocumentsIdComments

/**
 * 创建文档评论
 */
export const createDocumentComment = (id: string, body: { content: string; paragraphId: string }) =>
  request<unknown>({
    url: `/api/v1/writer/documents/${id}/comments`,
    method: 'post',
    data: body,
  })

/**
 * 搜索文档评论
 */
export const searchDocumentComments = api.getApiV1WriterDocumentsIdCommentsSearch

/**
 * 获取文档评论统计
 */
export const getDocumentCommentsStats = api.getApiV1WriterDocumentsIdCommentsStats

/**
 * 获取评论详情
 */
export const getComment = api.getApiV1WriterCommentsId

/**
 * 更新评论
 */
export const updateComment = api.putApiV1WriterCommentsId

/**
 * 删除评论
 */
export const deleteComment = api.deleteApiV1WriterCommentsId

/**
 * 回复评论
 */
export const replyToComment = api.postApiV1WriterCommentsIdReply

/**
 * 解决评论
 */
export const resolveComment = api.postApiV1WriterCommentsIdResolve

/**
 * 取消解决评论
 */
export const unresolveComment = api.postApiV1WriterCommentsIdUnresolve

/**
 * 批量删除评论
 */
export const batchDeleteComments = api.postApiV1WriterCommentsBatchDelete

/**
 * 获取评论线程
 */
export const getCommentThread = api.getApiV1WriterCommentsThreadsThreadId

// ==================== 模板相关 API ====================

/**
 * 获取模板列表
 */
export const getTemplates = api.getApiV1WriterTemplates

/**
 * 获取模板详情
 */
export const getTemplate = api.getApiV1WriterTemplatesId

/**
 * 创建模板
 */
export const createTemplate = api.postApiV1WriterTemplates

/**
 * 更新模板
 */
export const updateTemplate = api.putApiV1WriterTemplatesId

/**
 * 删除模板
 */
export const deleteTemplate = api.deleteApiV1WriterTemplatesId

/**
 * 应用模板
 */
export const applyTemplate = api.postApiV1WriterTemplatesIdApply

// ==================== 批量操作相关 API ====================

/**
 * 提交批量操作
 */
export const submitBatchOperation = api.postApiV1WriterBatchOperations

/**
 * 获取批量操作详情
 */
export const getBatchOperation = api.getApiV1WriterBatchOperationsId

/**
 * 取消批量操作
 */
export const cancelBatchOperation = api.postApiV1WriterBatchOperationsIdCancel

/**
 * 撤销批量操作
 */
export const undoBatchOperation = api.postApiV1WriterBatchOperationsIdUndo

// ==================== 导出相关 API ====================

/**
 * 获取导出任务详情
 */
export const getExportTask = api.getApiV1WriterExportsId

/**
 * 取消导出任务
 */
export const cancelExportTask = api.postApiV1WriterExportsIdCancel

/**
 * 下载导出文件
 */
export const downloadExportFile = api.getApiV1WriterExportsIdDownload

/**
 * 删除导出任务
 */
export const deleteExportTask = api.deleteApiV1WriterExportsId

/**
 * 导出项目
 */
export const exportProject = api.postApiV1WriterProjectsIdExport

/**
 * 获取项目导出列表
 */
export const getProjectExports = api.getApiV1WriterProjectsProjectIdExports

// ==================== 发布相关 API ====================

/**
 * 发布项目
 */
export const publishProject = api.postApiV1WriterProjectsIdPublish

/**
 * 取消发布项目
 */
export const unpublishProject = api.postApiV1WriterProjectsIdUnpublish

/**
 * 获取项目发布状态
 */
export const getProjectPublicationStatus = api.getApiV1WriterProjectsIdPublicationStatus

/**
 * 批量发布项目文档
 */
export const batchPublishDocuments = api.postApiV1WriterProjectsProjectIdDocumentsBatchPublish

/**
 * 获取项目发布列表
 */
export const getProjectPublications = api.getApiV1WriterProjectsProjectIdPublications

/**
 * 获取发布详情
 */
export const getPublication = api.getApiV1WriterPublicationsId

// ==================== 统计相关 API ====================

/**
 * 获取书籍统计
 */
export const getBookStatistics = api.getApiV1WriterBooksBookIdStats

/**
 * 获取书籍每日统计
 */
export const getBookDailyStats = api.getApiV1WriterBooksBookIdDailyStats

/**
 * 获取书籍收入统计
 */
export const getBookRevenue = api.getApiV1WriterBooksBookIdRevenue

/**
 * 获取书籍留存率
 */
export const getBookRetention = api.getApiV1WriterBooksBookIdRetention

/**
 * 获取书籍流失点
 */
export const getBookDropOffPoints = api.getApiV1WriterBooksBookIdDropOffPoints

/**
 * 获取书籍热力图
 */
export const getBookHeatmap = api.getApiV1WriterBooksBookIdHeatmap

/**
 * 获取书籍热门章节
 */
export const getBookTopChapters = api.getApiV1WriterBooksBookIdTopChapters

/**
 * 获取章节统计
 */
export const getChapterStatistics = api.getApiV1WriterChaptersChapterIdStats

// ==================== 搜索相关 API ====================

/**
 * 搜索文档
 */
export const searchDocuments = api.getApiV1WriterSearchDocuments

// ==================== 其他便捷方法 ====================

/**
 * 获取文档版本列表
 */
export const getDocumentVersions = api.getApiV1DocumentsDocumentIdVersions

/**
 * 比较文档版本
 */
export const compareDocumentVersions = api.getApiV1DocumentsDocumentIdVersionsCompare

/**
 * 获取文档审计结果
 */
export const getDocumentAuditResult = api.getApiV1DocumentsIdAuditResult

/**
 * 更新快捷方式
 */
export const updateShortcuts = api.putApiV1UserShortcuts

/**
 * 更新字数统计
 */
export const updateWordCount = api.postApiV1DocumentsIdWordCount

/**
 * 获取项目角色关系
 */
export const getProjectCharacterRelations = api.getApiV1ProjectsProjectIdCharactersRelations

/**
 * 导出原始getApi函数（高级用法）
 * 可以传入自定义axios实例
 */
export { getApi }

/**
 * 默认导出
 */
export default {
  // 项目相关
  getProjects,
  getProject,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  // 文档相关
  getDocuments,
  getProjectDocuments,
  getDocument,
  getDocumentById,
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
  duplicateDocument,
  exportDocument,
  publishDocument,
  updateDocumentPublishStatus,
  // 文档锁定相关
  lockDocument,
  unlockDocument,
  refreshDocumentLock,
  getDocumentLockStatus,
  extendDocumentLock,
  forceUnlockDocument,
  // 文档评论相关
  getDocumentComments,
  createDocumentComment,
  searchDocumentComments,
  getDocumentCommentsStats,
  getComment,
  updateComment,
  deleteComment,
  replyToComment,
  resolveComment,
  unresolveComment,
  batchDeleteComments,
  getCommentThread,
  // 模板相关
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  applyTemplate,
  // 批量操作相关
  submitBatchOperation,
  getBatchOperation,
  cancelBatchOperation,
  undoBatchOperation,
  // 导出相关
  getExportTask,
  cancelExportTask,
  downloadExportFile,
  deleteExportTask,
  exportProject,
  getProjectExports,
  // 发布相关
  publishProject,
  unpublishProject,
  getProjectPublicationStatus,
  batchPublishDocuments,
  getProjectPublications,
  getPublication,
  // 统计相关
  getBookStatistics,
  getBookDailyStats,
  getBookRevenue,
  getBookRetention,
  getBookDropOffPoints,
  getBookHeatmap,
  getBookTopChapters,
  getChapterStatistics,
  // 搜索相关
  searchDocuments,
  searchProjectKeywords,
  // 其他便捷方法
  getDocumentVersions,
  compareDocumentVersions,
  getDocumentAuditResult,
  updateShortcuts,
  updateWordCount,
  getProjectCharacterRelations,
  // 工具函数
  getApi,
}
