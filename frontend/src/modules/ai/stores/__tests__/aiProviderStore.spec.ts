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
      description: '本地模型',
      baseURL: 'http://localhost:11434',
      endpointPath: '/v1/chat/completions',
      providerType: 'openai-compatible',
      models: ['qwen3', 'llama3.1'],
      recommendedModel: 'qwen3',
    },
    {
      id: 'custom',
      label: '自定义',
      description: '自定义 provider',
      baseURL: '',
      endpointPath: '/v1/chat/completions',
      providerType: 'openai-compatible',
      models: [],
      recommendedModel: '',
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
  clearAIProviderProfileSecretFromDesktop: vi.fn(),
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

const defaultUserProvider = () => ({
    providerType: 'openai-compatible' as const,
    baseURL: '',
    endpointPath: '/v1/chat/completions',
    model: '',
    apiKey: '',
    temperature: 0.7,
})

const defaultRoleModels = () => ({
  writing: '',
  review: '',
  organize: '',
})

const defaultSettings = () => ({
  mode: 'system_remote' as const,
  userProvider: defaultUserProvider(),
  roleModels: {
    writing: '',
    review: '',
    organize: '',
  },
  activeProviderProfileId: 'default',
  providerProfiles: [
    {
      id: 'default',
      label: '默认配置',
      userProvider: defaultUserProvider(),
      roleModels: defaultRoleModels(),
    },
  ],
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
      roleModels: {
        writing: 'qwen3',
        review: 'llama3.1',
        organize: '',
      },
      activeProviderProfileId: 'default',
      providerProfiles: [
        {
          id: 'default',
          label: '默认配置',
          userProvider: {
            providerType: 'openai-compatible' as const,
            baseURL: 'http://127.0.0.1:11434',
            endpointPath: '/v1/chat/completions',
            model: 'qwen3',
            apiKey: 'sk-1234567890abcdefghijkl',
            temperature: 0.7,
          },
          roleModels: {
            writing: 'qwen3',
            review: 'llama3.1',
            organize: '',
          },
        },
      ],
    }
    parseAIProviderConfigText.mockReturnValue(imported)

    store.importConfigText('{"mode":"user_api"}')

    expect(parseAIProviderConfigText).toHaveBeenCalledWith('{"mode":"user_api"}')
    expect(store.mode).toBe('user_api')
    expect(store.baseURL).toBe('http://127.0.0.1:11434')
    expect(store.health).toBeNull()
    expect(store.exportConfigText()).toContain('qwen3')
    expect(store.createConfigTemplate()).toBe('{"mode":"user_api"}')
    expect(store.writingModel).toBe('qwen3')
    expect(store.reviewModel).toBe('llama3.1')
  })

  it('creates and switches provider profiles without losing existing config', async () => {
    const store = useAIProviderStore()
    store.baseURL = 'http://localhost:11434'
    store.model = 'qwen3'

    store.createProviderProfile('custom')

    expect(store.providerProfiles).toHaveLength(2)
    expect(store.activeProviderProfileId).not.toBe('default')
    expect(store.baseURL).toBe('')

    store.activeProviderProfileId = 'default'

    expect(store.baseURL).toBe('http://localhost:11434')
    expect(store.model).toBe('qwen3')
  })

  it('deletes active provider profile and falls back to remaining profile', async () => {
    const store = useAIProviderStore()
    store.baseURL = 'http://localhost:11434'
    store.model = 'qwen3'
    store.createProviderProfile('custom')
    const deletingId = store.activeProviderProfileId

    await store.deleteActiveProviderProfile()

    expect(store.providerProfiles).toHaveLength(1)
    expect(store.activeProviderProfileId).toBe('default')
    expect(store.activeProviderProfileId).not.toBe(deletingId)
    expect(store.baseURL).toBe('http://localhost:11434')
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

  it('supports custom provider and optional role model assignments', async () => {
    const store = useAIProviderStore()
    store.baseURL = 'http://localhost:11434'
    store.model = 'qwen3'
    store.writingModel = 'qwen3'
    store.reviewModel = 'llama3.1'

    store.applyPreset('custom')

    expect(store.baseURL).toBe('')
    expect(store.model).toBe('')
    expect(store.writingModel).toBe('qwen3')
    expect(store.reviewModel).toBe('llama3.1')
  })
})
