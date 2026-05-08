/**
 * AI管理模块Store
 * 管理AI提供商、模型、健康状态等数据
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { message } from '@/design-system/services'
import { aiAdminAPI } from '../api/ai.admin'
import type {
  AIProvider,
  AIModel,
  AIHealthStatus,
  AISystemStats,
  AIUsageStats,
  AIActivity
} from '../types/ai-admin.types'

export const useAIAdminStore = defineStore('aiAdmin', () => {
  // ============ 状态 ============

  // 提供商列表
  const providers = ref<AIProvider[]>([])
  const providersLoading = ref(false)

  // 模型列表
  const models = ref<AIModel[]>([])
  const modelsLoading = ref(false)

  // 系统统计
  const systemStats = ref<AISystemStats | null>(null)
  const statsLoading = ref(false)

  // 健康状态
  const healthStatus = ref<AIHealthStatus | null>(null)
  const healthLoading = ref(false)

  // 活动记录
  const activities = ref<AIActivity[]>([])
  const activitiesLoading = ref(false)

  // 使用统计
  const usageStats = ref<AIUsageStats[]>([])
  const usageLoading = ref(false)

  // ============ 计算属性 ============

  const activeProviders = computed(() =>
    providers.value.filter(p => p.status === 'active')
  )

  const activeModels = computed(() =>
    models.value.filter(m => m.status === 'active')
  )

  const providersByStatus = computed(() => {
    const grouped: Record<string, AIProvider[]> = {
      active: [],
      inactive: [],
      error: []
    }
    providers.value.forEach(p => {
      if (grouped[p.status]) {
        grouped[p.status].push(p)
      }
    })
    return grouped
  })

  const modelsByProvider = computed(() => {
    const grouped: Record<string, AIModel[]> = {}
    models.value.forEach(m => {
      if (!grouped[m.provider]) {
        grouped[m.provider] = []
      }
      grouped[m.provider].push(m)
    })
    return grouped
  })

  const overallHealthStatus = computed(() => {
    if (!healthStatus.value) return 'unknown'
    return healthStatus.value.overall
  })

  // ============ 提供商操作 ============

  async function loadProviders() {
    providersLoading.value = true
    try {
      const response = await aiAdminAPI.getProviders()
      providers.value = response.providers || []
    } catch (error: any) {
      message.error(error.message || '加载提供商列表失败')
      console.error('加载提供商失败:', error)
    } finally {
      providersLoading.value = false
    }
  }

  async function createProvider(data: any) {
    try {
      const provider = await aiAdminAPI.createProvider(data)
      providers.value.push(provider)
      message.success('提供商创建成功')
      return provider
    } catch (error: any) {
      message.error(error.message || '创建提供商失败')
      throw error
    }
  }

  async function updateProvider(providerId: string, data: any) {
    try {
      const provider = await aiAdminAPI.updateProvider(providerId, data)
      const index = providers.value.findIndex(p => p.id === providerId)
      if (index !== -1) {
        providers.value[index] = provider
      }
      message.success('提供商更新成功')
      return provider
    } catch (error: any) {
      message.error(error.message || '更新提供商失败')
      throw error
    }
  }

  async function deleteProvider(providerId: string) {
    try {
      await aiAdminAPI.deleteProvider(providerId)
      providers.value = providers.value.filter(p => p.id !== providerId)
      message.success('提供商删除成功')
    } catch (error: any) {
      message.error(error.message || '删除提供商失败')
      throw error
    }
  }

  async function testProvider(providerId: string, testModel?: string) {
    try {
      const result = await aiAdminAPI.testProvider(providerId, testModel)
      if (result.success) {
        message.success(`连接测试成功，响应时间: ${result.responseTime}ms`)
      } else {
        message.warning(result.message || '连接测试失败')
      }
      return result
    } catch (error: any) {
      message.error(error.message || '连接测试失败')
      throw error
    }
  }

  async function toggleProviderStatus(providerId: string, status: 'active' | 'inactive') {
    try {
      const provider = await aiAdminAPI.toggleProviderStatus(providerId, status)
      const index = providers.value.findIndex(p => p.id === providerId)
      if (index !== -1) {
        providers.value[index] = provider
      }
      message.success(`提供商已${status === 'active' ? '启用' : '禁用'}`)
    } catch (error: any) {
      message.error(error.message || '更新状态失败')
      throw error
    }
  }

  // ============ 模型操作 ============

  async function loadModels(provider?: string) {
    modelsLoading.value = true
    try {
      const response = await aiAdminAPI.getModels(provider)
      models.value = response.models || []
    } catch (error: any) {
      message.error(error.message || '加载模型列表失败')
      console.error('加载模型失败:', error)
    } finally {
      modelsLoading.value = false
    }
  }

  async function updateModel(modelId: string, data: any) {
    try {
      const model = await aiAdminAPI.updateModel(modelId, data)
      const index = models.value.findIndex(m => m.id === modelId)
      if (index !== -1) {
        models.value[index] = model
      }
      message.success('模型更新成功')
      return model
    } catch (error: any) {
      message.error(error.message || '更新模型失败')
      throw error
    }
  }

  async function toggleModelStatus(modelId: string, status: 'active' | 'inactive') {
    try {
      const model = await aiAdminAPI.toggleModelStatus(modelId, status)
      const index = models.value.findIndex(m => m.id === modelId)
      if (index !== -1) {
        models.value[index] = model
      }
      message.success(`模型已${status === 'active' ? '启用' : '禁用'}`)
    } catch (error: any) {
      message.error(error.message || '更新状态失败')
      throw error
    }
  }

  // ============ 统计操作 ============

  async function loadSystemStats() {
    statsLoading.value = true
    try {
      systemStats.value = await aiAdminAPI.getSystemStats()
    } catch (error: any) {
      console.error('加载统计数据失败:', error)
    } finally {
      statsLoading.value = false
    }
  }

  async function loadUsageStats(params?: any) {
    usageLoading.value = true
    try {
      usageStats.value = await aiAdminAPI.getUsageStats(params)
    } catch (error: any) {
      console.error('加载使用统计失败:', error)
    } finally {
      usageLoading.value = false
    }
  }

  // ============ 健康检查操作 ============

  async function loadHealthStatus() {
    healthLoading.value = true
    try {
      healthStatus.value = await aiAdminAPI.getHealthStatus()
    } catch (error: any) {
      console.error('加载健康状态失败:', error)
    } finally {
      healthLoading.value = false
    }
  }

  async function triggerHealthCheck() {
    healthLoading.value = true
    try {
      healthStatus.value = await aiAdminAPI.triggerHealthCheck()
      message.success('健康检查完成')
    } catch (error: any) {
      message.error(error.message || '健康检查失败')
    } finally {
      healthLoading.value = false
    }
  }

  // ============ 活动记录操作 ============

  async function loadActivities(params?: any) {
    activitiesLoading.value = true
    try {
      const response = await aiAdminAPI.getActivities(params)
      activities.value = response.activities || []
    } catch (error: any) {
      console.error('加载活动记录失败:', error)
    } finally {
      activitiesLoading.value = false
    }
  }

  // ============ 初始化 ============

  async function initialize() {
    await Promise.all([
      loadProviders(),
      loadModels(),
      loadSystemStats(),
      loadHealthStatus(),
      loadActivities({ limit: 10 })
    ])
  }

  return {
    // 状态
    providers,
    providersLoading,
    models,
    modelsLoading,
    systemStats,
    statsLoading,
    healthStatus,
    healthLoading,
    activities,
    activitiesLoading,
    usageStats,
    usageLoading,

    // 计算属性
    activeProviders,
    activeModels,
    providersByStatus,
    modelsByProvider,
    overallHealthStatus,

    // 方法
    loadProviders,
    createProvider,
    updateProvider,
    deleteProvider,
    testProvider,
    toggleProviderStatus,
    loadModels,
    updateModel,
    toggleModelStatus,
    loadSystemStats,
    loadUsageStats,
    loadHealthStatus,
    triggerHealthCheck,
    loadActivities,
    initialize
  }
})
