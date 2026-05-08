/**
 * API版本配置
 * 
 * 用于管理多个API版本，支持版本切换和废弃检测
 */

export interface APIVersionConfig {
  version: string           // API版本（v1, v2）
  baseUrl: string          // 基础URL
  deprecated: boolean       // 是否废弃
  sunsetDate?: string       // 废弃日期
  migrationPath?: string    // 迁移指南
}

export const API_VERSIONS: Record<string, APIVersionConfig> = {
  v1: {
    version: 'v1',
    baseUrl: '/api/v1',
    deprecated: false
  },
  v2: {
    version: 'v2',
    baseUrl: '/api/v2',
    deprecated: false
  }
}

export const CURRENT_API_VERSION = 'v1'

/**
 * 获取当前API版本的基础URL
 */
export function getApiBaseUrl(): string {
  return API_VERSIONS[CURRENT_API_VERSION].baseUrl
}

/**
 * 检查API版本是否废弃
 */
export function isApiVersionDeprecated(version: string): boolean {
  return API_VERSIONS[version]?.deprecated || false
}
