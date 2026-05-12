import httpService from '@/core/services/http.service'
import { standaloneLocalBridge } from '../data-bridge/standalone-local'
import {
  isStandaloneLocalWriterAvailable,
  isWailsWriterAvailable,
} from '../data-bridge/wails'
import type {
  Concept,
  CreateConceptRequest,
  UpdateConceptRequest,
} from '../types/entity'

const BASE_PROJECT_URL = '/writer/projects'
const BASE_CONCEPT_URL = '/concepts'

export const conceptApi = {
  // ==========================================
  // 概念管理 (Concept CRUD)
  // ==========================================

  /**
   * 创建概念
   * @description 在指定项目中创建新概念
   * @endpoint POST /api/v1/projects/:projectId/concepts
   * @category writer
   * @tags 概念管理
   * @param {string} projectId - 项目ID
   * @param {CreateConceptRequest} data - 概念创建数据
   * @response {Concept} 201 - 成功返回创建的概念信息
   */
  create(projectId: string, data: CreateConceptRequest) {
    if (isWailsWriterAvailable() || isStandaloneLocalWriterAvailable()) {
      return standaloneLocalBridge.concept.create(projectId, data)
    }
    return httpService.post<Concept>(`${BASE_PROJECT_URL}/${projectId}/concepts`, data)
  },

  /**
   * 获取概念详情
   * @description 获取指定概念的详细信息
   * @endpoint GET /api/v1/concepts/:conceptId
   * @category writer
   * @tags 概念管理
   * @param {string} conceptId - 概念ID
   * @param {string} projectId - 项目ID（作为查询参数）
   * @response {Concept} 200 - 成功返回概念详情
   */
  getDetail(conceptId: string, projectId: string) {
    if (isWailsWriterAvailable() || isStandaloneLocalWriterAvailable()) {
      return standaloneLocalBridge.concept.get(conceptId)
    }
    return httpService.get<Concept>(
      `${BASE_CONCEPT_URL}/${conceptId}`,
      { params: { projectId } } as any,
    )
  },

  /**
   * 获取项目概念列表
   * @description 获取指定项目的所有概念列表
   * @endpoint GET /api/v1/projects/:projectId/concepts
   * @category writer
   * @tags 概念管理
   * @param {string} projectId - 项目ID
   * @response {Concept[]} 200 - 成功返回概念列表
   */
  list(projectId: string) {
    if (isWailsWriterAvailable() || isStandaloneLocalWriterAvailable()) {
      return standaloneLocalBridge.concept.list(projectId)
    }
    return httpService.get<Concept[]>(`${BASE_PROJECT_URL}/${projectId}/concepts`)
  },

  /**
   * 更新概念
   * @description 更新指定概念的信息
   * @endpoint PUT /api/v1/concepts/:conceptId
   * @category writer
   * @tags 概念管理
   * @param {string} conceptId - 概念ID
   * @param {string} projectId - 项目ID（作为查询参数）
   * @param {updateConceptRequest} data - 概念更新数据
   * @response {Concept} 200 - 成功返回更新后的概念信息
   */
  update(conceptId: string, projectId: string, data: UpdateConceptRequest) {
    if (isWailsWriterAvailable() || isStandaloneLocalWriterAvailable()) {
      return standaloneLocalBridge.concept.update(conceptId, data)
    }
    return httpService.put<Concept>(
      `${BASE_CONCEPT_URL}/${conceptId}`,
      data,
      { params: { projectId } } // projectId 需要在 config 里
    )
  },

  /**
   * 删除概念
   * @description 删除指定概念
   * @endpoint DELETE /api/v1/concepts/:conceptId
   * @category writer
   * @tags 概念管理
   * @param {string} conceptId - 概念ID
   * @param {string} projectId - 项目ID（作为查询参数）
   * @response {void} 204 - 成功删除概念
   */
  delete(conceptId: string, projectId: string) {
    if (isWailsWriterAvailable() || isStandaloneLocalWriterAvailable()) {
      return standaloneLocalBridge.concept.delete(conceptId)
    }
    return httpService.delete<void>(
      `${BASE_CONCEPT_URL}/${conceptId}`,
      { params: { projectId } } as any
    )
  },
}

// 便捷函数导出（兼容旧代码）
export const listConcepts = (projectId: string) => conceptApi.list(projectId)
export const createConceptFn = (projectId: string, data: CreateConceptRequest) =>
  conceptApi.create(projectId, data)
export const updateConceptFn = (conceptId: string, projectId: string, data: UpdateConceptRequest) =>
  conceptApi.update(conceptId, projectId, data)
export const deleteConceptFn = (conceptId: string, projectId: string) =>
  conceptApi.delete(conceptId, projectId)
