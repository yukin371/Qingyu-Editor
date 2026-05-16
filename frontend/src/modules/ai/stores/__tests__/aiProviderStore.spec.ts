import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAIProviderStore } from '../aiProviderStore'

const {
  checkAIProviderHealth,
  hydrateAIProviderSettingsFromDesktop,
  loadAIProviderSettings,
  persistAIProviderSettingsToDesktop,
  saveAIProviderSettings,
} = vi.hoisted(() => ({
  checkAIProviderHealth: vi.fn(),
  hydrateAIProviderSettingsFromDesktop: vi.fn(),
  loadAIProviderSettings: vi.fn(),
  persistAIProviderSettingsToDesktop: vi.fn(),
  saveAIProviderSettings: vi.fn(),
}))

vi.mock('../../config/provider', () => ({
  DEFAULT_USER_PROVIDER_CONFIG: {
    providerType: 'openai-compatible',
    baseURL: '',
    endpointPath: '/v1/chat/completions',
    model: '',
    apiKey: '',
    temperature: 0.7,
  },
  clearAIProviderSettingsFromDesktop: vi.fn(),
  hasSessionApiKey: vi.fn(() => false),
  hydrateAIProviderSettingsFromDesktop,
  isUserProviderModeEnabled: vi.fn((settings) => settings.mode === 'user_api'),
  loadAIProviderSettings,
  persistAIProviderSettingsToDesktop,
  saveAIProviderSettings,
}))

vi.mock('../../utils/apikey', () => ({
  hasValidApiKey: (value: string) => value.startsWith('sk-'),
  isApiKeyMasked: (value: string) => value.includes('****'),
}))

vi.mock('../../api/ai', () => ({
  checkAIProviderHealth,
}))

const defaultSettings = () => ({
  mode: 'system_remote' as const,
  userProvider: {
    providerType: 'openai-compatible' as const,
    baseURL: '',
    endpointPath: '/v1/chat/completions',
    model: '',
    apiKey: '',
    temperature: 0.7,
  },
})

describe('aiProviderStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    loadAIProviderSettings.mockReturnValue(defaultSettings())
    saveAIProviderSettings.mockImplementation((settings) => settings)
    hydrateAIProviderSettingsFromDesktop.mockResolvedValue(null)
    checkAIProviderHealth.mockResolvedValue({
      mode: 'system_remote',
      ok: true,
      configured: true,
      hasRuntimeSecret: false,
      message: '系统远程 AI 服务可用。',
      checkedAt: Date.now(),
    })
  })

  it('clears stale health result when provider config changes', async () => {
    const store = useAIProviderStore()

    await store.checkHealth()
    expect(store.health?.ok).toBe(true)

    store.mode = 'user_api'
    expect(store.health).toBeNull()

    await store.checkHealth()
    store.baseURL = 'http://127.0.0.1:11434'
    expect(store.health).toBeNull()
  })

  it('clears stale health result when user provider is reset', async () => {
    const store = useAIProviderStore()
    store.mode = 'user_api'
    store.baseURL = 'http://127.0.0.1:11434'
    store.model = 'qwen'

    await store.checkHealth()
    expect(store.health?.message).toContain('系统远程')

    store.resetUserProvider()

    expect(store.health).toBeNull()
    expect(store.baseURL).toBe('')
    expect(store.model).toBe('')
  })
})
