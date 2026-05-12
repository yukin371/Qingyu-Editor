import httpService from '@/core/services/http.service'
import { standaloneLocalBridge } from '../data-bridge/standalone-local'
import {
  isStandaloneLocalWriterAvailable,
  isWailsWriterAvailable,
  wailsWriterBridge,
} from '../data-bridge/wails'

// ==========================================
// 类型定义 (对应 Go 后端 Models)
// ==========================================

// 基础的文档摘要 (对应 DocumentSummary)
export interface DocumentSummary {
  id: string
  title: string
  type: string
  wordCount: number
  lastEditAt: string // ISO8601 string
  status: string
  sortOrder: number
}

// 占位类型：由于 Character, Location, Timeline 定义在其他文件中
// 暂时定义为 any 或 基础接口，待后续对接具体模块时可引入详细类型
export interface Character {
  id: string
  name: string
  role?: string
  [key: string]: any
}

export interface Location {
  id: string
  name: string
  [key: string]: any
}

export interface TimelineEvent {
  id: string
  title: string
  [key: string]: any
}

// 项目详情响应 (对应 ProjectDetailResponse)
export interface ProjectDetailResponse {
  id: string
  title: string
  description: string
  coverImage: string
  genre: string
  tags: string[]
  status: string // 'serialized', 'completed', etc.
  visibility: string // 'public', 'private'
  totalWords: number
  chapterCount: number
  lastUpdateTime: string
  createdAt: string
  updatedAt: string
  documents: DocumentSummary[]
  characters: Character[]
  locations: Location[]
  timeline: TimelineEvent[]
}

// 项目摘要 (对应 ProjectSummary)
export interface ProjectSummary {
  id: string
  title: string
  summary?: string
  coverUrl?: string
  coverImage?: string
  genre?: string
  category?: string
  tags?: string[]
  status: string
  visibility?: string
  totalWords?: number
  wordCount?: number
  chapterCount?: number
  lastUpdateTime?: string
  createdAt?: string
  updatedAt?: string
}

// 项目列表响应 (对应 ProjectListResponse)
export interface ProjectListResponse {
  projects?: ProjectSummary[]
  items?: ProjectSummary[]
  total: number
  page: number
  size?: number
  pageSize?: number
}

// ==========================================
// 请求参数类型 (推断自 Go Service)
// ==========================================

// 创建项目请求参数
export interface CreateProjectRequest {
  title: string
  summary?: string // 后端字段：summary（前端旧字段：description）
  description?: string // @deprecated 使用 summary 代替
  coverUrl?: string // 后端字段：coverUrl（前端旧字段：coverImage）
  coverImage?: string // @deprecated 使用 coverUrl 代替
  category?: string // 后端字段：category（前端旧字段：genre）
  genre?: string // @deprecated 使用 category 代替
  tags?: string[]
  visibility?: 'public' | 'private'
}

// 更新项目请求参数
export interface UpdateProjectRequest {
  title?: string
  description?: string
  coverImage?: string
  genre?: string
  tags?: string[]
  status?: string
  visibility?: string
}

// 获取列表查询参数
export interface ProjectListParams {
  page?: number
  pageSize?: number
  status?: string
  category?: string
}

// ==========================================
// API 定义
// ==========================================

const BASE_URL = '/writer/projects'

/**
 * 写作项目 API
 * @description 对接后端 /api/v1/projects 路由，提供写作项目的管理功能
 * @endpoint /api/v1/projects
 * @category writer
 * @tags 项目管理
 */
export const projectApi = {
  /**
   * 创建项目
   * @description 创建新的写作项目
   * @endpoint POST /api/v1/writer/projects
   * @category writer
   * @tags 项目管理
   * @param {CreateProjectRequest} data - 项目创建数据
   * @response {ProjectDetailResponse} 200 - 成功创建项目，返回项目详情
   * @security BearerAuth
   */
  create(data: CreateProjectRequest) {
    // 字段映射：前端兼容字段 -> 后端字段
    const mappedData = {
      title: data.title,
      summary: data.summary || data.description, // 支持 summary 或 description
      coverUrl: data.coverUrl || data.coverImage, // 支持 coverUrl 或 coverImage
      category: data.category || data.genre, // 支持 category 或 genre
      tags: data.tags,
      visibility: data.visibility,
    }
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.project.create(mappedData)
    }
    if (isStandaloneLocalWriterAvailable()) {
      return standaloneLocalBridge.project.create(mappedData)
    }
    return httpService.post<ProjectDetailResponse>(BASE_URL, mappedData)
  },

  /**
   * 获取项目列表
   * @description 获取用户的写作项目列表，支持分页和筛选
   * @endpoint GET /api/v1/projects
   * @category writer
   * @tags 项目管理
   * @param {ProjectListParams} params - 查询参数（页码、每页数量、状态、分类）
   * @response {ProjectListResponse} 200 - 成功返回项目列表
   * @security BearerAuth
   */
  list(params?: ProjectListParams) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.project.list(params)
    }
    if (isStandaloneLocalWriterAvailable()) {
      return standaloneLocalBridge.project.list()
    }
    const query = params
      ? {
          ...params,
          ...(params.pageSize !== undefined ? { page_size: params.pageSize } : {}),
        }
      : undefined
    return httpService.get<ProjectListResponse>(BASE_URL, {
      params: query,
    })
  },

  /**
   * 获取项目详情
   * @description 获取指定项目的详细信息，包含文档、角色、场景等
   * @endpoint GET /api/v1/projects/:id
   * @category writer
   * @tags 项目管理
   * @param {string} id - 项目ID
   * @response {ProjectDetailResponse} 200 - 成功返回项目详情
   * @security BearerAuth
   */
  getDetail(id: string) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.project.get(id)
    }
    if (isStandaloneLocalWriterAvailable()) {
      return standaloneLocalBridge.project.get(id)
    }
    return httpService.get<ProjectDetailResponse>(`${BASE_URL}/${id}`)
  },

  /**
   * 更新项目信息
   * @description 更新项目的基本信息
   * @endpoint PUT /api/v1/projects/:id
   * @category writer
   * @tags 项目管理
   * @param {string} id - 项目ID
   * @param {UpdateProjectRequest} data - 要更新的项目字段
   * @response {void} 200 - 成功更新项目
   * @security BearerAuth
   */
  update(id: string, data: UpdateProjectRequest) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.project.update(id, data as Record<string, unknown>)
    }
    if (isStandaloneLocalWriterAvailable()) {
      return standaloneLocalBridge.project.update(id, data)
    }
    return httpService.put<void>(`${BASE_URL}/${id}`, data)
  },

  /**
   * 删除项目
   * @description 删除指定的写作项目
   * @endpoint DELETE /api/v1/projects/:id
   * @category writer
   * @tags 项目管理
   * @param {string} id - 项目ID
   * @response {void} 204 - 成功删除项目
   * @security BearerAuth
   */
  delete(id: string) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.project.delete(id)
    }
    if (isStandaloneLocalWriterAvailable()) {
      return standaloneLocalBridge.project.delete(id)
    }
    return httpService.delete<void>(`${BASE_URL}/${id}`)
  },

  /**
   * 手动触发更新项目统计信息 (字数、章节数)
   * @description 重新计算并更新项目的统计数据
   * @endpoint PUT /api/v1/projects/:id/statistics
   * @category writer
   * @tags 项目管理
   * @param {string} id - 项目ID
   * @response {void} 200 - 成功更新统计信息
   * @security BearerAuth
   */
  refreshStatistics(id: string) {
    if (isWailsWriterAvailable() || isStandaloneLocalWriterAvailable()) {
      return Promise.resolve()
    }
    return httpService.put<void>(`${BASE_URL}/${id}/statistics`, null, {
      silent: true,
    } as any)
  },
}

// ==========================================
// 便捷导出函数 (向后兼容 writerStore)
// ==========================================

/**
 * 创建项目 - 便捷函数
 */
export const createProject = (data: CreateProjectRequest) => projectApi.create(data)

/**
 * 获取项目列表 - 便捷函数
 */
export const getProjects = (params?: ProjectListParams) => projectApi.list(params)

/**
 * 获取项目详情 - 便捷函数
 */
export const getProjectById = (id: string) => projectApi.getDetail(id)

/**
 * 更新项目 - 便捷函数
 */
export const updateProject = (id: string, data: UpdateProjectRequest) => projectApi.update(id, data)

/**
 * 删除项目 - 便捷函数
 */
export const deleteProject = (id: string) => projectApi.delete(id)

// ==========================================
// 类型别名 (向后兼容)
// ==========================================

/**
 * 项目创建数据类型别名
 */
export type ProjectCreateData = CreateProjectRequest

/**
 * 项目更新数据类型别名
 */
export type ProjectUpdateData = UpdateProjectRequest
