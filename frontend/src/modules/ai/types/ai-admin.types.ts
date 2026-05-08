/**
 * AI管理模块类型定义
 */

// ============ AI提供商类型 ============

export interface AIProvider {
  id: string
  name: string
  displayName: string
  status: 'active' | 'inactive' | 'error'
  apiKeyMask?: string  // 只存储掩码 "sk-****...****"
  hasApiKey: boolean   // 是否已配置密钥
  endpoint?: string
  modelCount: number
  createdAt: string
  updatedAt: string
}

// ============ AI模型类型 ============

export interface AIModel {
  id: string
  name: string
  displayName: string
  provider: string
  status: 'active' | 'inactive' | 'error'
  type: 'chat' | 'completion' | 'embedding' | 'image'
  pricing?: {
    input: number // 每1K tokens价格
    output: number
    unit: 'token' | 'request'
  }
  capabilities: string[]
  createdAt: string
  updatedAt: string
}

// ============ AI健康状态类型 ============

export interface AIHealthStatus {
  overall: 'healthy' | 'degraded' | 'down'
  providers: ProviderHealth[]
  lastCheck: string
}

export interface ProviderHealth {
  provider: string
  status: 'healthy' | 'degraded' | 'down'
  responseTime: number // 毫秒
  errorRate: number // 百分比
  uptime: number // 百分比
  lastError?: string
}

// ============ AI使用统计类型 ============

export interface AIUsageStats {
  date: string
  provider: string
  model: string
  requests: number
  tokens: {
    input: number
    output: number
    total: number
  }
  cost: number
  avgResponseTime: number
}

// ============ AI系统统计类型 ============

export interface AISystemStats {
  totalProviders: number
  activeProviders: number
  totalModels: number
  activeModels: number
  todayRequests: number
  todayCost: number
  avgResponseTime: number
  errorRate: number
}

// ============ API响应类型 ============

export interface AIProvidersResponse {
  providers: AIProvider[]
  total: number
}

export interface AIModelsResponse {
  models: AIModel[]
  total: number
}

// ============ 请求类型 ============

export interface CreateProviderRequest {
  name: string
  displayName: string
  apiKey: string  // 仅在创建时传输
  endpoint?: string
}

export interface UpdateProviderRequest {
  displayName?: string
  apiKey?: string  // 仅在更新时传输
  endpoint?: string
  status?: 'active' | 'inactive'
}

export interface AIProviderUpdateRequest {
  providerId: string
  apiKey?: string  // 仅在更新时传输
}

export interface TestProviderRequest {
  providerId: string
  testModel?: string
}

export interface UpdateModelRequest {
  status?: 'active' | 'inactive'
  pricing?: {
    input: number
    output: number
    unit: 'token' | 'request'
  }
}

// ============ 活动记录类型 ============

export interface AIActivity {
  id: string
  type: 'request' | 'error' | 'config_change' | 'health_check'
  message: string
  provider?: string
  model?: string
  timestamp: string
  details?: Record<string, any>
}
