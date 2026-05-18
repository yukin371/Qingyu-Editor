import { beforeEach, describe, expect, it, vi } from 'vitest'

const { GetAppSetting, SetAppSetting, DeleteAppSetting, GetAppSecret, SetAppSecret, DeleteAppSecret } = vi.hoisted(() => ({
  GetAppSetting: vi.fn(),
  SetAppSetting: vi.fn(),
  DeleteAppSetting: vi.fn(),
  GetAppSecret: vi.fn(),
  SetAppSecret: vi.fn(),
  DeleteAppSecret: vi.fn(),
}))

vi.mock('../../../../wailsjs/go/main/App', () => ({
  GetAppSetting,
  SetAppSetting,
  DeleteAppSetting,
  GetAppSecret,
  SetAppSecret,
  DeleteAppSecret,
}))

import {
  AI_PROVIDER_PRESETS,
  DEFAULT_AI_PROVIDER_SETTINGS,
  createAIProviderConfigTemplate,
  exportAIProviderConfigText,
  getUserProviderRuntimeConfig,
  hasUsableUserProviderConfig,
  hasSessionApiKey,
  hydrateAIProviderSettingsFromDesktop,
  loadAIProviderSettings,
  parseAIProviderConfigText,
  persistAIProviderSettingsToDesktop,
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
    GetAppSetting.mockReset()
    SetAppSetting.mockReset()
    DeleteAppSetting.mockReset()
    GetAppSecret.mockReset()
    SetAppSecret.mockReset()
    DeleteAppSecret.mockReset()
  })

  it('loads default settings when storage is empty', () => {
    expect(loadAIProviderSettings()).toEqual(DEFAULT_AI_PROVIDER_SETTINGS)
  })

  it('provides common provider presets and custom provider entry', () => {
    const presetIds = AI_PROVIDER_PRESETS.map((preset) => preset.id)

    expect(presetIds).toEqual(
      expect.arrayContaining(['qwen', 'deepseek', 'kimi', 'glm', 'gemini', 'gpt', 'claude', 'custom']),
    )
    expect(AI_PROVIDER_PRESETS.find((preset) => preset.id === 'custom')?.baseURL).toBe('')
    expect(AI_PROVIDER_PRESETS.find((preset) => preset.id === 'qwen')?.endpointPath).toBe(
      '/chat/completions',
    )
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

  it('imports provider settings from config file text and stores api key only in session', () => {
    const imported = parseAIProviderConfigText(
      JSON.stringify({
        mode: 'user_api',
        baseURL: 'http://127.0.0.1:11434/',
        endpointPath: 'v1/chat/completions',
        model: ' qwen3 ',
        apiKey: 'sk-1234567890abcdefghijkl',
        temperature: 0.4,
      }),
    )
    const saved = saveAIProviderSettings(imported)

    expect(saved.userProvider.baseURL).toBe('http://127.0.0.1:11434')
    expect(saved.userProvider.endpointPath).toBe('/v1/chat/completions')
    expect(saved.userProvider.apiKey).toContain('****')
    expect(getUserProviderRuntimeConfig().apiKey).toBe('sk-1234567890abcdefghijkl')
  })

  it('exports and templates provider config without leaking api key', () => {
    const exported = exportAIProviderConfigText({
      mode: 'user_api',
      userProvider: {
        providerType: 'openai-compatible',
        baseURL: 'http://127.0.0.1:11434',
        endpointPath: '/v1/chat/completions',
        model: 'qwen3',
        apiKey: 'sk-1234567890abcdefghijkl',
        temperature: 0.7,
      },
    })
    const template = createAIProviderConfigTemplate()

    expect(exported).toContain('"apiKey": ""')
    expect(exported).not.toContain('sk-1234567890abcdefghijkl')
    expect(template).toContain('"version": 1')
    expect(template).toContain('"mode": "user_api"')
    expect(template).toContain('"baseURL": "http://localhost:11434"')
    expect(template).toContain('"roleModels"')
  })

  it('hydrates provider settings from desktop storage when wails runtime is available', async () => {
    vi.stubGlobal('window', {
      ...window,
      go: {
        main: {
          App: {
            GetAppSetting,
            GetAppSecret,
          },
        },
      },
    })
    GetAppSetting.mockResolvedValue(
      JSON.stringify({
        mode: 'user_api',
        userProvider: {
          providerType: 'openai-compatible',
          baseURL: 'http://127.0.0.1:11434',
          endpointPath: '/v1/chat/completions',
          model: 'qwen3',
          apiKey: 'sk-****...****',
          temperature: 0.8,
        },
      }),
    )
    GetAppSecret.mockResolvedValue('sk-1234567890abcdefghijkl')

    const hydrated = await hydrateAIProviderSettingsFromDesktop()

    expect(GetAppSetting).toHaveBeenCalledWith('ai.provider.settings')
    expect(GetAppSecret).toHaveBeenCalledWith('ai.provider.api-key')
    expect(hydrated?.mode).toBe('user_api')
    expect(hydrated?.userProvider.baseURL).toBe('http://127.0.0.1:11434')
    expect(hydrated?.userProvider.apiKey).toBe('sk-1234567890abcdefghijkl')
  })

  it('persists sanitized provider settings to desktop storage', async () => {
    vi.stubGlobal('window', {
      ...window,
      go: {
        main: {
          App: {
            SetAppSetting,
            SetAppSecret,
          },
        },
      },
    })

    await persistAIProviderSettingsToDesktop({
      mode: 'user_api',
      userProvider: {
        providerType: 'openai-compatible',
        baseURL: 'http://127.0.0.1:11434',
        endpointPath: '/v1/chat/completions',
        model: 'qwen3',
        apiKey: 'sk-1234567890abcdefghijkl',
        temperature: 0.7,
      },
    })

    expect(SetAppSetting).toHaveBeenCalledTimes(1)
    expect(SetAppSecret).toHaveBeenCalledWith('ai.provider.api-key', 'sk-1234567890abcdefghijkl')
    const payload = JSON.parse(SetAppSetting.mock.calls[0]![1])
    expect(payload.userProvider.apiKey).toContain('****')
    expect(payload.userProvider.baseURL).toBe('http://127.0.0.1:11434')
  })

  it('does not delete desktop secret when only masked api key is present', async () => {
    vi.stubGlobal('window', {
      ...window,
      go: {
        main: {
          App: {
            SetAppSetting,
            DeleteAppSecret,
          },
        },
      },
    })

    await persistAIProviderSettingsToDesktop({
      mode: 'user_api',
      userProvider: {
        providerType: 'openai-compatible',
        baseURL: 'http://127.0.0.1:11434',
        endpointPath: '/v1/chat/completions',
        model: 'qwen3',
        apiKey: 'sk-****...****',
        temperature: 0.7,
      },
    })

    expect(SetAppSetting).toHaveBeenCalledTimes(1)
    expect(DeleteAppSecret).not.toHaveBeenCalled()
  })

  it('deletes desktop secret when api key is explicitly cleared', async () => {
    vi.stubGlobal('window', {
      ...window,
      go: {
        main: {
          App: {
            SetAppSetting,
            DeleteAppSecret,
          },
        },
      },
    })

    await persistAIProviderSettingsToDesktop({
      mode: 'user_api',
      userProvider: {
        providerType: 'openai-compatible',
        baseURL: 'http://127.0.0.1:11434',
        endpointPath: '/v1/chat/completions',
        model: 'qwen3',
        apiKey: '',
        temperature: 0.7,
      },
    })

    expect(DeleteAppSecret).toHaveBeenCalledWith('ai.provider.api-key')
  })
})
