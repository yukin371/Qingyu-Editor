import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_AI_PROVIDER_SETTINGS,
  getUserProviderRuntimeConfig,
  hasUsableUserProviderConfig,
  hasSessionApiKey,
  loadAIProviderSettings,
  saveAIProviderSettings,
} from '../provider'

describe('ai provider settings', () => {
  beforeEach(() => {
    const localStorageData = new Map<string, string>()
    const sessionStorageData = new Map<string, string>()
    vi.mocked(localStorage.getItem).mockImplementation(
      (key: string) => localStorageData.get(key) ?? null,
    )
    vi.mocked(localStorage.setItem).mockImplementation((key: string, value: string) => {
      localStorageData.set(key, value)
    })
    vi.mocked(localStorage.removeItem).mockImplementation((key: string) => {
      localStorageData.delete(key)
    })
    vi.mocked(localStorage.clear).mockImplementation(() => {
      localStorageData.clear()
    })
    vi.mocked(sessionStorage.getItem).mockImplementation(
      (key: string) => sessionStorageData.get(key) ?? null,
    )
    vi.mocked(sessionStorage.setItem).mockImplementation((key: string, value: string) => {
      sessionStorageData.set(key, value)
    })
    vi.mocked(sessionStorage.removeItem).mockImplementation((key: string) => {
      sessionStorageData.delete(key)
    })
    vi.mocked(sessionStorage.clear).mockImplementation(() => {
      sessionStorageData.clear()
    })
    localStorage.clear()
    sessionStorage.clear()
  })

  it('loads default settings when storage is empty', () => {
    expect(loadAIProviderSettings()).toEqual(DEFAULT_AI_PROVIDER_SETTINGS)
  })

  it('normalizes and persists user provider settings', () => {
    const saved = saveAIProviderSettings({
      mode: 'user_api',
      userProvider: {
        providerType: 'openai-compatible',
        baseURL: 'http://127.0.0.1:11434///',
        endpointPath: 'v1/chat/completions',
        model: ' qwen3 ',
        apiKey: '  sk-1234567890abcdefghijkl  ',
        temperature: 1.9,
      },
    })

    expect(saved.userProvider.baseURL).toBe('http://127.0.0.1:11434')
    expect(saved.userProvider.endpointPath).toBe('/v1/chat/completions')
    expect(saved.userProvider.model).toBe('qwen3')
    expect(saved.userProvider.apiKey).toContain('****')
    expect(saved.userProvider.temperature).toBe(1.9)
    expect(loadAIProviderSettings().userProvider.apiKey).toBe('sk-1234567890abcdefghijkl')
    expect(hasSessionApiKey()).toBe(true)
    expect(getUserProviderRuntimeConfig().apiKey).toBe('sk-1234567890abcdefghijkl')
  })

  it('requires mode and ready config before exposing runtime settings', () => {
    saveAIProviderSettings({
      mode: 'user_api',
      userProvider: {
        providerType: 'openai-compatible',
        baseURL: '',
        endpointPath: '/v1/chat/completions',
        model: '',
        apiKey: '',
        temperature: 0.7,
      },
    })

    expect(() => getUserProviderRuntimeConfig()).toThrow('请先完成 AI provider')
    expect(
      hasUsableUserProviderConfig({
        providerType: 'openai-compatible',
        baseURL: 'http://127.0.0.1:11434',
        endpointPath: '/v1/chat/completions',
        model: 'qwen3',
        apiKey: '',
        temperature: 0.7,
      }),
    ).toBe(true)
  })
})
