/**
 * 模板管理 API
 *
 * 提供模板的增删改查、应用等功能
 *
 * @module writer/api/template
 */

import httpService from '@/core/services/http.service'

type HttpClientLike = {
  get<T>(url: string, config?: unknown): Promise<T>
  post<T>(url: string, data?: unknown, config?: unknown): Promise<T>
  put<T>(url: string, data?: unknown, config?: unknown): Promise<T>
  delete<T>(url: string, config?: unknown): Promise<T>
}

const httpClient = httpService as unknown as HttpClientLike

// ==========================================
// 类型定义
// ==========================================

/**
 * 模板变量
 */
export interface TemplateVariable {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number'
  placeholder?: string
  defaultValue?: string
  required: boolean
  order: number
  options?: Array<{ label: string; value: string }>
}

/**
 * 模板类型
 */
export type TemplateType = 'chapter' | 'outline' | 'setting'

/**
 * 模板
 */
export interface Template {
  id: string
  name: string
  description: string
  type: TemplateType
  category?: string
  content: string
  variables?: TemplateVariable[]
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

/**
 * 应用模板请求
 */
export interface ApplyTemplateRequest {
  documentId: string
  variables: Record<string, string>
}

/**
 * 应用模板响应
 */
export interface ApplyTemplateResponse {
  templateId: string
  renderedContent: string
  variables: Record<string, string>
}

/**
 * 创建模板请求
 */
export interface CreateTemplateRequest {
  name: string
  description?: string
  type: TemplateType
  category?: string
  content: string
  variables?: TemplateVariable[]
}

/**
 * 更新模板请求
 */
export interface UpdateTemplateRequest {
  name?: string
  description?: string
  category?: string
  content?: string
  variables?: TemplateVariable[]
}

/**
 * 列表查询参数
 */
export interface ListTemplatesParams {
  projectId?: string
  type?: TemplateType
  status?: string
  category?: string
  keyword?: string
  isSystem?: boolean
  page?: number
  pageSize?: number
}

/**
 * 列表响应
 */
export interface ListTemplatesResponse {
  templates: Template[]
  total: number
}

// ==========================================
// API 常量
// ==========================================

const BASE_TEMPLATE_URL = '/writer/templates'

// ==========================================
// templateApi 对象
// ==========================================

/**
 * 模板 API 对象
 * 提供所有模板相关的 HTTP 接口调用
 */
export const templateApi = {
  /**
   * 获取模板列表
   * GET /api/v1/writer/templates
   */
  list(params?: ListTemplatesParams) {
    return httpClient.get<ListTemplatesResponse>(BASE_TEMPLATE_URL, params)
  },

  /**
   * 获取模板详情
   * GET /api/v1/writer/templates/:id
   */
  getDetail(templateId: string) {
    return httpClient.get<Template>(`${BASE_TEMPLATE_URL}/${templateId}`)
  },

  /**
   * 创建模板
   * POST /api/v1/writer/templates
   */
  create(data: CreateTemplateRequest) {
    return httpClient.post<Template>(BASE_TEMPLATE_URL, data)
  },

  /**
   * 更新模板
   * PUT /api/v1/writer/templates/:id
   */
  update(templateId: string, data: UpdateTemplateRequest) {
    return httpClient.put<Template>(`${BASE_TEMPLATE_URL}/${templateId}`, data)
  },

  /**
   * 删除模板
   * DELETE /api/v1/writer/templates/:id
   */
  delete(templateId: string) {
    return httpClient.delete<void>(`${BASE_TEMPLATE_URL}/${templateId}`)
  },

  /**
   * 应用模板
   * POST /api/v1/writer/templates/:id/apply
   */
  applyTemplate(templateId: string, data: ApplyTemplateRequest) {
    return httpClient.post<ApplyTemplateResponse>(
      `${BASE_TEMPLATE_URL}/${templateId}/apply`,
      data
    )
  },
}

// ==========================================
// 命名导出函数 (便捷调用)
// ==========================================

/**
 * 获取模板列表
 */
export const getTemplates = (params?: ListTemplatesParams) =>
  templateApi.list(params)

/**
 * 获取模板详情
 */
export const getTemplateById = (templateId: string) =>
  templateApi.getDetail(templateId)

/**
 * 创建模板
 */
export const createTemplate = (data: CreateTemplateRequest) =>
  templateApi.create(data)

/**
 * 更新模板
 */
export const updateTemplate = (templateId: string, data: UpdateTemplateRequest) =>
  templateApi.update(templateId, data)

/**
 * 删除模板
 */
export const deleteTemplate = (templateId: string) =>
  templateApi.delete(templateId)

/**
 * 应用模板
 */
export const applyTemplate = (templateId: string, data: ApplyTemplateRequest) =>
  templateApi.applyTemplate(templateId, data)

