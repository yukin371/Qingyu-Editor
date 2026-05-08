import { describe, it, expect } from 'vitest'
import { API_VERSIONS, CURRENT_API_VERSION, getApiBaseUrl, isApiVersionDeprecated } from '../apiVersions'

describe('API版本配置', () => {
  it('应该正确导出API版本配置', () => {
    expect(API_VERSIONS.v1).toBeDefined()
    expect(API_VERSIONS.v1.baseUrl).toBe('/api/v1')
    expect(API_VERSIONS.v1.deprecated).toBe(false)
    
    expect(API_VERSIONS.v2).toBeDefined()
    expect(API_VERSIONS.v2.baseUrl).toBe('/api/v2')
    expect(API_VERSIONS.v2.deprecated).toBe(false)
  })

  it('应该正确获取当前API基础URL', () => {
    expect(getApiBaseUrl()).toBe('/api/v1')
  })

  it('应该正确判断API版本是否废弃', () => {
    expect(isApiVersionDeprecated('v1')).toBe(false)
    expect(isApiVersionDeprecated('v2')).toBe(false)
  })

  it('应该正确返回当前API版本', () => {
    expect(CURRENT_API_VERSION).toBe('v1')
  })
})
