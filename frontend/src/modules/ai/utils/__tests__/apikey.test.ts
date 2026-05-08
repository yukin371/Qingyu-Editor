import { describe, it, expect } from 'vitest'
import {
  maskApiKey,
  hasValidApiKey,
  isApiKeyMasked,
  formatApiKeyDisplay
} from '../apikey'

describe('maskApiKey', () => {
  it('应该正确掩码OpenAI格式的密钥', () => {
    const key = 'sk-ant-api03-1234567890abcdefghijklmnopqrstuvwxyz'
    const masked = maskApiKey(key)
    expect(masked).toBe('sk-****...****')
    expect(masked).not.toContain('1234567890')
    expect(masked).not.toContain('abcdefghijklmnopqrstuvwxyz')
  })

  it('应该处理短密钥', () => {
    const key = 'sk-1234'
    const masked = maskApiKey(key)
    expect(masked).toBeTruthy()
    expect(masked).not.toBe(key)
  })

  it('应该处理空值', () => {
    expect(maskApiKey('')).toBe('')
    expect(maskApiKey('   ')).toBe('')
  })

  it('应该保留密钥前缀', () => {
    expect(maskApiKey('sk-test123')).toContain('sk-')
  })
})

describe('hasValidApiKey', () => {
  it('应该验证有效的API密钥格式', () => {
    expect(hasValidApiKey('sk-ant-api03-1234567890abcdef')).toBe(true)
    expect(hasValidApiKey('sk-1234567890abcdefghijklmn')).toBe(true) // 至少20个字符
  })

  it('应该拒绝无效格式', () => {
    expect(hasValidApiKey('')).toBe(false)
    expect(hasValidApiKey('invalid')).toBe(false)
    expect(hasValidApiKey('123')).toBe(false)
  })

  it('应该识别掩码后的密钥', () => {
    expect(hasValidApiKey('sk-****...****')).toBe(false)
  })
})

describe('isApiKeyMasked', () => {
  it('应该识别掩码后的密钥', () => {
    expect(isApiKeyMasked('sk-****...****')).toBe(true)
    expect(isApiKeyMasked('gpt-****...****')).toBe(true)
  })

  it('应该识别未掩码的密钥', () => {
    expect(isApiKeyMasked('sk-1234567890abcdef')).toBe(false)
    expect(isApiKeyMasked('')).toBe(false)
  })
})

describe('formatApiKeyDisplay', () => {
  it('应该格式化显示未掩码的密钥', () => {
    const display = formatApiKeyDisplay('sk-1234567890abcdef')
    expect(display).toContain('•')
    expect(display).not.toContain('1234567890abcdef')
  })

  it('应该显示已掩码的密钥', () => {
    const display = formatApiKeyDisplay('sk-****...****')
    expect(display).toBe('sk-****...****')
  })

  it('应该显示未设置状态', () => {
    const display = formatApiKeyDisplay('')
    expect(display).toBe('未设置')
  })
})
