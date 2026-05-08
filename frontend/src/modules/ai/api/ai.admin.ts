/**
 * AI管理模块API
 * 管理员专用：提供商管理、模型管理、健康检查
 */

import { httpService } from '@/core/services/http.service'
import type {
  AIProvider,
  AIModel,
  AIHealthStatus,
  AISystemStats,
  AIUsageStats,
  AIActivity,
  AIProvidersResponse,
  AIModelsResponse,
  CreateProviderRequest,
  UpdateProviderRequest,
  TestProviderRequest,
  UpdateModelRequest,
  ProviderHealth
} from '../types/ai-admin.types'

// ============ API基础路径 ============
const BASE_URL = '/api/v1/admin/ai'

// ============ 提供商管理 API ============

/**
 * 获取所有AI提供商列表
 * @description 获取系统中所有配置的AI服务提供商信息
 * @endpoint GET /api/v1/admin/ai/providers
 * @category ai
 * @tags AI管理
 * @response {AIProvidersResponse} 200 - 成功返回提供商列表
 * @security BearerAuth
 */
export async function getProviders(): Promise<AIProvidersResponse> {
  return httpService.get(`${BASE_URL}/providers`)
}

/**
 * 获取单个提供商详情
 * @description 根据提供商ID获取详细的AI服务提供商信息
 * @endpoint GET /api/v1/admin/ai/providers/:providerId
 * @category ai
 * @tags AI管理
 * @param {string} providerId - 提供商ID
 * @response {AIProvider} 200 - 成功返回提供商详情
 * @security BearerAuth
 */
export async function getProvider(providerId: string): Promise<AIProvider> {
  return httpService.get(`${BASE_URL}/providers/${providerId}`)
}

/**
 * 创建新的AI提供商
 * @description 在系统中添加新的AI服务提供商配置
 * @endpoint POST /api/v1/admin/ai/providers
 * @category ai
 * @tags AI管理
 * @param {CreateProviderRequest} data - 提供商创建数据（名称、类型、API密钥等）
 * @response {AIProvider} 201 - 成功返回创建的提供商信息
 * @security BearerAuth
 */
export async function createProvider(data: CreateProviderRequest): Promise<AIProvider> {
  return httpService.post(`${BASE_URL}/providers`, data)
}

/**
 * 更新提供商信息
 * @description 更新指定AI服务提供商的配置信息
 * @endpoint PUT /api/v1/admin/ai/providers/:providerId
 * @category ai
 * @tags AI管理
 * @param {string} providerId - 提供商ID
 * @param {UpdateProviderRequest} data - 提供商更新数据
 * @response {AIProvider} 200 - 成功返回更新后的提供商信息
 * @security BearerAuth
 */
export async function updateProvider(
  providerId: string,
  data: UpdateProviderRequest
): Promise<AIProvider> {
  return httpService.put(`${BASE_URL}/providers/${providerId}`, data)
}

/**
 * 删除提供商
 * @description 从系统中删除指定的AI服务提供商
 * @endpoint DELETE /api/v1/admin/ai/providers/:providerId
 * @category ai
 * @tags AI管理
 * @param {string} providerId - 提供商ID
 * @response {void} 200 - 删除成功
 * @security BearerAuth
 */
export async function deleteProvider(providerId: string): Promise<void> {
  return httpService.delete(`${BASE_URL}/providers/${providerId}`)
}

/**
 * 测试提供商连接
 * @description 测试指定AI服务提供商的API连接是否正常
 * @endpoint POST /api/v1/admin/ai/providers/:providerId/test
 * @category ai
 * @tags AI管理
 * @param {string} providerId - 提供商ID
 * @param {string} testModel - 测试使用的模型ID（可选）
 * @response {Object} 200 - 成功返回测试结果
 * @response {boolean} success - 测试是否成功
 * @response {string} message - 测试结果消息
 * @response {number} responseTime - 响应时间（毫秒）
 * @security BearerAuth
 */
export async function testProvider(
  providerId: string,
  testModel?: string
): Promise<{ success: boolean; message: string; responseTime: number }> {
  const data: TestProviderRequest = { providerId, testModel }
  return httpService.post(`${BASE_URL}/providers/${providerId}/test`, data)
}

/**
 * 启用/禁用提供商
 * @description 切换指定AI服务提供商的启用状态
 * @endpoint PATCH /api/v1/admin/ai/providers/:providerId/status
 * @category ai
 * @tags AI管理
 * @param {string} providerId - 提供商ID
 * @param {string} status - 目标状态（active/inactive）
 * @response {AIProvider} 200 - 成功返回更新后的提供商信息
 * @security BearerAuth
 */
export async function toggleProviderStatus(
  providerId: string,
  status: 'active' | 'inactive'
): Promise<AIProvider> {
  return httpService.patch(`${BASE_URL}/providers/${providerId}/status`, { status })
}

// ============ 模型管理 API ============

/**
 * 获取所有AI模型列表
 * @description 获取系统中所有可用的AI模型信息，可按提供商筛选
 * @endpoint GET /api/v1/admin/ai/models
 * @category ai
 * @tags AI管理
 * @param {string} provider - 提供商ID（可选，用于筛选）
 * @response {AIModelsResponse} 200 - 成功返回模型列表
 * @security BearerAuth
 */
export async function getModels(provider?: string): Promise<AIModelsResponse> {
  const params = provider ? { provider } : {}
  return httpService.get(`${BASE_URL}/models`, { params })
}

/**
 * 获取单个模型详情
 * @description 根据模型ID获取详细的AI模型信息
 * @endpoint GET /api/v1/admin/ai/models/:modelId
 * @category ai
 * @tags AI管理
 * @param {string} modelId - 模型ID
 * @response {AIModel} 200 - 成功返回模型详情
 * @security BearerAuth
 */
export async function getModel(modelId: string): Promise<AIModel> {
  return httpService.get(`${BASE_URL}/models/${modelId}`)
}

/**
 * 更新模型信息
 * @description 更新指定AI模型的配置信息
 * @endpoint PUT /api/v1/admin/ai/models/:modelId
 * @category ai
 * @tags AI管理
 * @param {string} modelId - 模型ID
 * @param {UpdateModelRequest} data - 模型更新数据
 * @response {AIModel} 200 - 成功返回更新后的模型信息
 * @security BearerAuth
 */
export async function updateModel(
  modelId: string,
  data: UpdateModelRequest
): Promise<AIModel> {
  return httpService.put(`${BASE_URL}/models/${modelId}`, data)
}

/**
 * 启用/禁用模型
 * @description 切换指定AI模型的启用状态
 * @endpoint PATCH /api/v1/admin/ai/models/:modelId/status
 * @category ai
 * @tags AI管理
 * @param {string} modelId - 模型ID
 * @param {string} status - 目标状态（active/inactive）
 * @response {AIModel} 200 - 成功返回更新后的模型信息
 * @security BearerAuth
 */
export async function toggleModelStatus(
  modelId: string,
  status: 'active' | 'inactive'
): Promise<AIModel> {
  return httpService.patch(`${BASE_URL}/models/${modelId}/status`, { status })
}

/**
 * 获取指定提供商的模型列表
 * @description 获取指定AI服务提供商下的所有模型
 * @endpoint GET /api/v1/admin/ai/providers/:providerId/models
 * @category ai
 * @tags AI管理
 * @param {string} providerId - 提供商ID
 * @response {AIModel[]} 200 - 成功返回模型列表
 * @security BearerAuth
 */
export async function getProviderModels(providerId: string): Promise<AIModel[]> {
  return httpService.get(`${BASE_URL}/providers/${providerId}/models`)
}

// ============ 系统统计 API ============

/**
 * 获取AI系统统计数据
 * @description 获取AI系统的整体统计数据，包括总请求数、活跃用户等
 * @endpoint GET /api/v1/admin/ai/stats
 * @category ai
 * @tags AI管理
 * @response {AISystemStats} 200 - 成功返回系统统计数据
 * @security BearerAuth
 */
export async function getSystemStats(): Promise<AISystemStats> {
  return httpService.get(`${BASE_URL}/stats`)
}

/**
 * 获取AI使用统计数据
 * @description 获取AI服务使用统计数据，支持按日期、提供商、模型筛选
 * @endpoint GET /api/v1/admin/ai/stats/usage
 * @category ai
 * @tags AI管理
 * @param {string} startDate - 开始日期（可选）
 * @param {string} endDate - 结束日期（可选）
 * @param {string} provider - 提供商ID（可选）
 * @param {string} model - 模型ID（可选）
 * @response {AIUsageStats[]} 200 - 成功返回使用统计列表
 * @security BearerAuth
 */
export async function getUsageStats(params?: {
  startDate?: string
  endDate?: string
  provider?: string
  model?: string
}): Promise<AIUsageStats[]> {
  return httpService.get(`${BASE_URL}/stats/usage`, { params })
}

// ============ 健康检查 API ============

/**
 * 获取AI系统健康状态
 * @description 获取AI系统的整体健康状态概览
 * @endpoint GET /api/v1/admin/ai/health
 * @category ai
 * @tags AI管理
 * @response {AIHealthStatus} 200 - 成功返回系统健康状态
 * @security BearerAuth
 */
export async function getHealthStatus(): Promise<AIHealthStatus> {
  return httpService.get(`${BASE_URL}/health`)
}

/**
 * 触发健康检查
 * @description 手动触发AI系统健康检查
 * @endpoint POST /api/v1/admin/ai/health/check
 * @category ai
 * @tags AI管理
 * @response {AIHealthStatus} 200 - 成功返回健康检查结果
 * @security BearerAuth
 */
export async function triggerHealthCheck(): Promise<AIHealthStatus> {
  return httpService.post(`${BASE_URL}/health/check`, {})
}

/**
 * 获取指定提供商的健康状态
 * @description 获取指定AI服务提供商的健康检查状态
 * @endpoint GET /api/v1/admin/ai/providers/:providerId/health
 * @category ai
 * @tags AI管理
 * @param {string} providerId - 提供商ID
 * @response {ProviderHealth} 200 - 成功返回提供商健康状态
 * @security BearerAuth
 */
export async function getProviderHealth(providerId: string): Promise<ProviderHealth> {
  return httpService.get(`${BASE_URL}/providers/${providerId}/health`)
}

// ============ 活动日志 API ============

/**
 * 获取AI系统活动记录
 * @description 获取AI系统活动日志，支持按类型、提供商筛选和分页
 * @endpoint GET /api/v1/admin/ai/activities
 * @category ai
 * @tags AI管理
 * @param {string} type - 活动类型（可选）
 * @param {string} provider - 提供商ID（可选）
 * @param {number} limit - 返回数量限制（可选）
 * @param {number} offset - 偏移量（可选）
 * @response {Object} 200 - 成功返回活动记录
 * @response {AIActivity[]} activities - 活动记录列表
 * @response {number} total - 总记录数
 * @security BearerAuth
 */
export async function getActivities(params?: {
  type?: string
  provider?: string
  limit?: number
  offset?: number
}): Promise<{ activities: AIActivity[]; total: number }> {
  return httpService.get(`${BASE_URL}/activities`, { params })
}

// ============ 设置 API ============

/**
 * 获取AI系统设置
 * @description 获取AI系统的全局配置设置
 * @endpoint GET /api/v1/admin/ai/settings
 * @category ai
 * @tags AI管理
 * @response {Record<string, any>} 200 - 成功返回系统设置
 * @security BearerAuth
 */
export async function getSettings(): Promise<Record<string, any>> {
  return httpService.get(`${BASE_URL}/settings`)
}

/**
 * 更新AI系统设置
 * @description 更新AI系统的全局配置设置
 * @endpoint PUT /api/v1/admin/ai/settings
 * @category ai
 * @tags AI管理
 * @param {Record<string, any>} settings - 系统设置数据
 * @response {void} 200 - 更新成功
 * @security BearerAuth
 */
export async function updateSettings(settings: Record<string, any>): Promise<void> {
  return httpService.put(`${BASE_URL}/settings`, settings)
}

// 导出所有API
export const aiAdminAPI = {
  // 提供商
  getProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
  testProvider,
  toggleProviderStatus,
  getProviderModels,

  // 模型
  getModels,
  getModel,
  updateModel,
  toggleModelStatus,

  // 统计
  getSystemStats,
  getUsageStats,

  // 健康检查
  getHealthStatus,
  triggerHealthCheck,
  getProviderHealth,

  // 活动
  getActivities,

  // 设置
  getSettings,
  updateSettings
}
