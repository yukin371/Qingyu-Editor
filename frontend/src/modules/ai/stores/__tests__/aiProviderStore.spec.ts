import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAIProviderStore } from '../aiProviderStore'

const {
  checkAIProviderHealth,
  createAIProviderConfigTemplate,
  exportAIProviderConfigText,
  hydrateAIProviderSettingsFromDesktop,
  loadAIProviderSettings,
  parseAIProviderConfigText,
  persistAIProviderSettingsToDesktop,
  saveAIProviderSettings,
} = vi.hoisted(() => ({
  checkAIProviderHealth: vi.fn(),
  createAIProviderConfigTemplate: vi.fn(),
  exportAIProviderConfigText: vi.fn(),
  hydrateAIProviderSettingsFromDesktop: vi.fn(),
  loadAIProviderSettings: vi.fn(),
  parseAIProviderConfigText: vi.fn(),
  persistAIProviderSettingsToDesktop: vi.fn(),
  saveAIProviderSettings: vi.fn(),
}))

vi.mock('../../config/provider', () => ({
  AI_PROVIDER_PRESETS: [
    {
      id: 'ollama',
      label: 'Ollama 本地',
      baseURL: 'http://localhost:11434',
      endpointPath: '/v1/chat/completions',
      models: ['qwen3', 'llama3.1'],
    },
  ],
  DEFAULT_USER_PROVIDER_CONFIG: {
    providerType: 'openai-compatible',
    baseURL: '',
    endpointPath: '/v1/chat/completions',
    model: '',
    apiKey: '',
    temperature: 0.7,
  },
  clearAIProviderSettingsFromDesktop: vi.fn(),
  createAIProviderConfigTemplate,
  exportAIProviderConfigText,
  hasSessionApiKey: vi.fn(() => false),
  hydrateAIProviderSettingsFromDesktop,
  isUserProviderModeEnabled: vi.fn((settings) => settings.mode === 'user_api'),
  loadAIProviderSettings,
  parseAIProviderConfigText,
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
    parseAIProviderConfigText.mockImplementation((raw) => JSON.parse(raw))
    exportAIProviderConfigText.mockImplementation((settings) => JSON.stringify(settings))
    createAIProviderConfigTemplate.mockReturnValue('{"mode":"user_api"}')
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

  it('imports and exports provider config text through the store boundary', async () => {
    const store = useAIProviderStore()
    await store.checkHealth()

    const imported = {
      mode: 'user_api' as const,
      userProvider: {
        providerType: 'openai-compatible' as const,
        baseURL: 'http://127.0.0.1:11434',
        endpointPath: '/v1/chat/completions',
        model: 'qwen3',
        apiKey: 'sk-1234567890abcdefghijkl',
        temperature: 0.7,
      },
    }
    parseAIProviderConfigText.mockReturnValue(imported)

    store.importConfigText('{"mode":"user_api"}')

    expect(parseAIProviderConfigText).toHaveBeenCalledWith('{"mode":"user_api"}')
    expect(store.mode).toBe('user_api')
    expect(store.baseURL).toBe('http://127.0.0.1:11434')
    expect(store.health).toBeNull()
    expect(store.exportConfigText()).toContain('qwen3')
    expect(store.createConfigTemplate()).toBe('{"mode":"user_api"}')
  })

  it('applies provider presets and keeps model selection reusable', async () => {
    const store = useAIProviderStore()
    store.model = 'custom-model'

    store.applyPreset('ollama')

    expect(store.baseURL).toBe('http://localhost:11434')
    expect(store.endpointPath).toBe('/v1/chat/completions')
    expect(store.model).toBe('qwen3')
    expect(store.providerPresets[0]?.models).toContain('llama3.1')
  })
})
