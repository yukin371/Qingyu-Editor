/**
 * 系统监控 API 模块
 * 对接后端 /api/v1/system/* 路由
 * 后端路由文档: Qingyu_backend/router/system/system_router.go
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse } from '@/types/api'

/**
 * 服务健康状态
 */
export type ServiceHealthStatus = 'healthy' | 'degraded' | 'down'

/**
 * 服务健康信息
 */
export interface ServiceHealth {
  service: string
  status: ServiceHealthStatus
  latency_ms: number
  last_check: string
  error?: string
}

/**
 * 系统健康信息
 */
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down'
  timestamp: string
  services: ServiceHealth[]
}

/**
 * 服务指标
 */
export interface ServiceMetrics {
  service: string
  metrics: Record<string, number | string>
  timestamp: string
}

/**
 * 系统健康检查 API 接口 (v1.0)
 * 对接后端: /api/v1/system/health
 */
export const healthAPI = {
  /**
   * 系统健康检查
   * GET /api/v1/system/health
   */
  async getSystemHealth(): Promise<APIResponse<SystemHealth>> {
    return httpService.get<APIResponse<SystemHealth>>('/system/health')
  },

  /**
   * 特定服务健康检查
   * GET /api/v1/system/health/:service
   */
  async getServiceHealth(service: string): Promise<APIResponse<ServiceHealth>> {
    return httpService.get<APIResponse<ServiceHealth>>(`/system/health/${service}`)
  },

  /**
   * 获取所有服务指标
   * GET /api/v1/system/metrics
   */
  async getAllMetrics(): Promise<APIResponse<Record<string, ServiceMetrics[]>>> {
    return httpService.get<APIResponse<Record<string, ServiceMetrics[]>>>('/system/metrics')
  },

  /**
   * 获取特定服务指标
   * GET /api/v1/system/metrics/:service
   */
  async getServiceMetrics(service: string): Promise<APIResponse<ServiceMetrics[]>> {
    return httpService.get<APIResponse<ServiceMetrics[]>>(`/system/metrics/${service}`)
  }
}

// 向后兼容：导出旧的函数名
export const getSystemHealth = () => healthAPI.getSystemHealth()
export const getServiceHealth = (service: string) => healthAPI.getServiceHealth(service)
export const getAllMetrics = () => healthAPI.getAllMetrics()
export const getServiceMetrics = (service: string) => healthAPI.getServiceMetrics(service)

export default healthAPI
