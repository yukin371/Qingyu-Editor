import httpService from '@/core/services/http.service'
import { isWailsWriterAvailable, wailsWriterBridge } from '../data-bridge/wails'
import type {
  Location,
  LocationRelation,
  SaveLocationRequest,
  SaveLocationRelationRequest,
} from '../types/location'

const BASE_PROJECT_URL = '/writer/projects'
const BASE_LOCATION_URL = '/locations'

export const locationApi = {
  // ==========================================
  // 地点管理 (Location CRUD)
  // ==========================================

  /**
   * 创建地点
   * POST /api/v1/projects/{projectId}/locations
   */
  create(projectId: string, data: SaveLocationRequest) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.location.create(
        projectId,
        data as unknown as Record<string, unknown>,
      ) as Promise<Location>
    }
    return httpService.post<Location>(`${BASE_PROJECT_URL}/${projectId}/locations`, data)
  },

  /**
   * 获取项目地点列表 (扁平结构)
   * GET /api/v1/projects/{projectId}/locations
   */
  list(projectId: string) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.location.list(projectId) as Promise<Location[]>
    }
    return httpService.get<Location[]>(`${BASE_PROJECT_URL}/${projectId}/locations`)
  },

  /**
   * 获取项目地点树 (层级结构)
   * GET /api/v1/projects/{projectId}/locations/tree
   * 后端已经组装好了 children，前端可直接渲染
   */
  getTree(projectId: string) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.location.getTree(projectId) as Promise<Location[]>
    }
    return httpService.get<Location[]>(`${BASE_PROJECT_URL}/${projectId}/locations/tree`)
  },

  /**
   * 获取地点详情
   * GET /api/v1/locations/{locationId}?projectId=...
   */
  getDetail(locationId: string, projectId: string) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.location.get(locationId) as Promise<Location>
    }
    return httpService.get<Location>(
      `${BASE_LOCATION_URL}/${locationId}`,
      { params: { projectId } } as any
    )
  },

  /**
   * 更新地点
   * PUT /api/v1/locations/{locationId}?projectId=...
   */
  update(locationId: string, projectId: string, data: SaveLocationRequest) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.location.update(
        locationId,
        data as unknown as Record<string, unknown>,
      ) as Promise<Location>
    }
    // 注意：PUT 请求的第三个参数才是 config (包含 params)
    return httpService.put<Location>(`${BASE_LOCATION_URL}/${locationId}`, data, {
      params: { projectId },
    })
  },

  /**
   * 删除地点
   * DELETE /api/v1/locations/{locationId}?projectId=...
   */
  delete(locationId: string, projectId: string) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.location.delete(locationId) as Promise<void>
    }
    return httpService.delete<void>(
      `${BASE_LOCATION_URL}/${locationId}`,
      { params: { projectId } } as any
    )
  },

  // ==========================================
  // 关系管理 (Relation Management)
  // ==========================================

  /**
   * 创建地点关系
   * POST /api/v1/locations/relations?projectId=...
   */
  createRelation(projectId: string, data: SaveLocationRelationRequest) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.location.createRelation(
        projectId,
        data as unknown as Record<string, unknown>,
      ) as Promise<LocationRelation>
    }
    return httpService.post<LocationRelation>(`${BASE_LOCATION_URL}/relations`, data, {
      params: { projectId },
    })
  },

  /**
   * 获取地点关系列表
   * GET /api/v1/projects/{projectId}/locations/relations
   * 可选参数: locationId (筛选特定地点的关系)
   */
  listRelations(projectId: string, locationId?: string) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.location.listRelations(
        projectId,
        locationId,
      ) as Promise<LocationRelation[]>
    }
    const params: any = {}
    if (locationId) params.locationId = locationId

    return httpService.get<LocationRelation[]>(
      `${BASE_PROJECT_URL}/${projectId}/locations/relations`,
      params
    )
  },

  /**
   * 删除地点关系
   * DELETE /api/v1/locations/relations/{relationId}?projectId=...
   */
  deleteRelation(relationId: string, projectId: string) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.location.deleteRelation(relationId) as Promise<void>
    }
    return httpService.delete<void>(`${BASE_LOCATION_URL}/relations/${relationId}`, { params: { projectId } } as any)
  },
}

// 便捷函数导出（兼容旧代码）
export const listLocations = (projectId: string) => locationApi.list(projectId)
export const getLocationTree = (projectId: string) => locationApi.getTree(projectId)
