/**
 * 写作导出 API
 * 与后端API契约保持一致
 *
 * 后端路由：
 * - POST /api/v1/writer/documents/:id/export - 导出文档
 * - POST /api/v1/writer/projects/:id/export - 导出项目
 * - GET /api/v1/writer/exports/:id - 获取导出任务
 * - GET /api/v1/writer/projects/:projectId/exports - 列出项目的导出任务
 * - GET /api/v1/writer/exports/:id/download - 下载导出文件
 * - DELETE /api/v1/writer/exports/:id - 删除导出任务
 * - POST /api/v1/writer/exports/:id/cancel - 取消导出任务
 */
import { request } from '@/utils/request-adapter'
import type {
  ExportDocumentRequest,
  ExportProjectRequest,
  ExportTask,
  ExportTaskListResponse
} from '../types/export'

/**
 * 导出API对象
 */
export const exportApi = {
  /**
   * 导出文档
   * POST /api/v1/writer/documents/:id/export
   *
   * @param documentId - 文档ID
   * @param projectId - 项目ID（通过query参数传递）
   * @param options - 导出选项
   * @returns 导出任务
   */
  async exportDocument(
    documentId: string,
    projectId: string,
    options: ExportDocumentRequest
  ): Promise<ExportTask> {
    return request<ExportTask>({
      url: `/api/v1/writer/documents/${documentId}/export`,
      method: 'post',
      params: { projectId },
      data: options
    })
  },

  /**
   * 导出项目
   * POST /api/v1/writer/projects/:id/export
   *
   * @param projectId - 项目ID
   * @param options - 导出选项
   * @returns 导出任务
   */
  async exportProject(projectId: string, options: ExportProjectRequest): Promise<ExportTask> {
    return request<ExportTask>({
      url: `/api/v1/writer/projects/${projectId}/export`,
      method: 'post',
      data: options
    })
  },

  /**
   * 获取导出任务
   * GET /api/v1/writer/exports/:id
   *
   * @param taskId - 任务ID
   * @returns 导出任务详情
   */
  async getTask(taskId: string): Promise<ExportTask> {
    return request<ExportTask>({
      url: `/api/v1/writer/exports/${taskId}`,
      method: 'get'
    })
  },

  /**
   * 列出项目的导出任务
   * GET /api/v1/writer/projects/:projectId/exports
   *
   * @param projectId - 项目ID
   * @param page - 页码（默认1）
   * @param pageSize - 每页数量（默认20）
   * @returns 导出任务列表
   */
  async listTasks(
    projectId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<ExportTaskListResponse> {
    return request<ExportTaskListResponse>({
      url: `/api/v1/writer/projects/${projectId}/exports`,
      method: 'get',
      params: { page, pageSize }
    })
  },

  /**
   * 下载导出文件
   * GET /api/v1/writer/exports/:id/download
   *
   * @param taskId - 任务ID
   * @returns 文件Blob
   */
  async downloadFile(taskId: string): Promise<Blob> {
    return request<Blob>({
      url: `/api/v1/writer/exports/${taskId}/download`,
      method: 'get',
      responseType: 'blob'
    })
  },

  /**
   * 取消导出任务
   * POST /api/v1/writer/exports/:id/cancel
   *
   * @param taskId - 任务ID
   * @returns 成功响应
   */
  async cancelTask(taskId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>({
      url: `/api/v1/writer/exports/${taskId}/cancel`,
      method: 'post'
    })
  },

  /**
   * 删除导出任务
   * DELETE /api/v1/writer/exports/:id
   *
   * @param taskId - 任务ID
   * @returns 成功响应
   */
  async deleteTask(taskId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>({
      url: `/api/v1/writer/exports/${taskId}`,
      method: 'delete'
    })
  }
}

// 导出类型和常量
export * from '../types/export'

// 为了向后兼容，保留旧的导出格式（已废弃）
// @deprecated 请使用 exportApi.exportDocument 代替
export { exportApi as default }

/**
 * @deprecated 请使用 exportApi.exportDocument(documentId, projectId, options) 代替
 * 旧版本的创建导出任务方法
 */
export function createExportTask(bookId: string, options: any) {
  if (import.meta.env.DEV) console.warn('[DEPRECATED] createExportTask 已废弃，请使用 exportApi.exportDocument 代替')
  return exportApi.exportProject(bookId, options)
}

/**
 * @deprecated 请使用 exportApi.exportDocument 代替
 * 旧版本的导出章节方法
 */
export function exportChapter(chapterId: string, format: string) {
  if (import.meta.env.DEV) console.warn('[DEPRECATED] exportChapter 已废弃，请使用 exportApi.exportDocument 代替')
  return exportApi.exportDocument(chapterId, '', { format: format as any })
}

/**
 * @deprecated 后端不支持此功能
 * 旧版本的导出选中文本方法
 */
export function exportSelection(_data: any) {
  if (import.meta.env.DEV) console.warn('[DEPRECATED] exportSelection 功能后端不支持，此方法将失效')
  return Promise.reject(new Error('后端不支持导出选中内容'))
}

/**
 * @deprecated 请使用 exportApi.getTask 代替
 * 旧版本的获取导出任务状态方法
 */
export function getExportTaskStatus(taskId: string) {
  if (import.meta.env.DEV) console.warn('[DEPRECATED] getExportTaskStatus 已废弃，请使用 exportApi.getTask 代替')
  return exportApi.getTask(taskId)
}

/**
 * @deprecated 请使用 exportApi.cancelTask 代替
 * 旧版本的取消导出任务方法
 */
export function cancelExportTask(taskId: string) {
  if (import.meta.env.DEV) console.warn('[DEPRECATED] cancelExportTask 已废弃，请使用 exportApi.cancelTask 代替')
  return exportApi.cancelTask(taskId)
}

/**
 * @deprecated 请使用 exportApi.listTasks 代替
 * 旧版本的获取书籍导出历史方法
 */
export function getExportHistory(bookId: string, params?: any) {
  if (import.meta.env.DEV) console.warn('[DEPRECATED] getExportHistory 已废弃，请使用 exportApi.listTasks 代替')
  return exportApi.listTasks(bookId, params?.page, params?.page_size)
}

/**
 * @deprecated 后端不支持此功能
 * 旧版本的获取用户所有导出历史方法
 */
export function getAllExportHistory(_params?: any) {
  if (import.meta.env.DEV) console.warn('[DEPRECATED] getAllExportHistory 功能后端不支持，此方法将失效')
  return Promise.reject(new Error('后端不支持全局导出历史查询'))
}

/**
 * @deprecated 请使用 exportApi.downloadFile 代替
 * 旧版本的下载导出文件方法
 */
export function downloadExportFile(taskId: string) {
  if (import.meta.env.DEV) console.warn('[DEPRECATED] downloadExportFile 已废弃，请使用 exportApi.downloadFile 代替')
  return exportApi.downloadFile(taskId)
}

/**
 * @deprecated 请使用 exportApi.deleteTask 代替
 * 旧版本的删除导出任务方法
 */
export function deleteExportTask(taskId: string) {
  if (import.meta.env.DEV) console.warn('[DEPRECATED] deleteExportTask 已废弃，请使用 exportApi.deleteTask 代替')
  return exportApi.deleteTask(taskId)
}

/**
 * @deprecated 后端不支持此功能
 * 旧版本的获取导出模板列表方法
 */
export function getExportTemplates() {
  if (import.meta.env.DEV) console.warn('[DEPRECATED] getExportTemplates 功能后端不支持，此方法将失效')
  return Promise.reject(new Error('后端不支持导出模板管理'))
}

/**
 * @deprecated 后端不支持此功能
 * 旧版本的保存导出模板方法
 */
export function saveExportTemplate(_data: any) {
  if (import.meta.env.DEV) console.warn('[DEPRECATED] saveExportTemplate 功能后端不支持，此方法将失效')
  return Promise.reject(new Error('后端不支持导出模板管理'))
}

/**
 * @deprecated 后端不支持此功能
 * 旧版本的批量导出方法
 */
export function batchExport(_data: any) {
  if (import.meta.env.DEV) console.warn('[DEPRECATED] batchExport 功能后端不支持，此方法将失效')
  return Promise.reject(new Error('后端不支持批量导出'))
}
