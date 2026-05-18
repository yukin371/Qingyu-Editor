import { hasValidApiKey, isApiKeyMasked, maskApiKey } from '../utils/apikey'
import {
  DeleteAppSetting,
  DeleteAppSecret,
  GetAppSetting,
  GetAppSecret,
  SetAppSetting,
  SetAppSecret,
} from '../../../../wailsjs/go/main/App'

export type AIAccessMode = 'system_remote' | 'user_api'
export type AIUserProviderType = 'openai-compatible'

export interface AIUserProviderConfig {
  providerType: AIUserProviderType
  baseURL: string
  endpointPath: string
  model: string
  apiKey: string
  temperature: number
}

export interface AIProviderSettings {
  mode: AIAccessMode
  userProvider: AIUserProviderConfig
}

export interface AIProviderPreset {
  id: string
  label: string
  baseURL: string
  endpointPath: string
  models: string[]
}

export interface AIProviderConfigFile {
  version?: 1
  mode?: AIAccessMode
  baseURL?: string
  endpointPath?: string
  model?: string
  apiKey?: string
  temperature?: number
  userProvider?: Partial<AIUserProviderConfig>
}

const STORAGE_KEY = 'qingyu-ai-provider-settings'
const SESSION_API_KEY_STORAGE_KEY = 'qingyu-ai-provider-session-api-key'
const DESKTOP_SETTING_KEY = 'ai.provider.settings'
const DESKTOP_SECRET_KEY = 'ai.provider.api-key'
const DEFAULT_ENDPOINT_PATH = '/v1/chat/completions'

export const AI_PROVIDER_PRESETS: AIProviderPreset[] = [
  {
    id: 'ollama',
    label: 'Ollama 本地',
    baseURL: 'http://localhost:11434',
    endpointPath: DEFAULT_ENDPOINT_PATH,
    models: ['qwen3', 'qwen2.5', 'llama3.1', 'deepseek-r1'],
  },
  {
    id: 'lm-studio',
    label: 'LM Studio 本地',
    baseURL: 'http://localhost:1234',
    endpointPath: DEFAULT_ENDPOINT_PATH,
    models: ['local-model', 'qwen3', 'llama3.1'],
  },
  {
    id: 'openai',
    label: 'OpenAI',
    baseURL: 'https://api.openai.com',
    endpointPath: DEFAULT_ENDPOINT_PATH,
    models: ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4o', 'gpt-4o-mini'],
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api',
    endpointPath: DEFAULT_ENDPOINT_PATH,
    models: ['openai/gpt-4.1-mini', 'anthropic/claude-3.5-sonnet', 'qwen/qwen3-coder'],
  },
]

export const DEFAULT_USER_PROVIDER_CONFIG: AIUserProviderConfig = {
  providerType: 'openai-compatible',
  baseURL: '',
  endpointPath: DEFAULT_ENDPOINT_PATH,
  model: '',
  apiKey: '',
  temperature: 0.7,
}

export const DEFAULT_AI_PROVIDER_SETTINGS: AIProviderSettings = {
  mode: 'system_remote',
  userProvider: { ...DEFAULT_USER_PROVIDER_CONFIG },
}

function sanitizeText(value: unknown, maxLength: number = 500): string {
  if (typeof value !== 'string') {
    return ''
  }
  return value.trim().slice(0, maxLength)
}

function clampTemperature(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return DEFAULT_USER_PROVIDER_CONFIG.temperature
  }
  return Number(Math.min(2, Math.max(0, value)).toFixed(2))
}

function normalizeEndpointPath(value: unknown): string {
  const trimmed = sanitizeText(value, 200)
  if (!trimmed) {
    return DEFAULT_ENDPOINT_PATH
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

function normalizeBaseURL(value: unknown): string {
  return sanitizeText(value, 500).replace(/\/+$/, '')
}

function normalizeMode(value: unknown): AIAccessMode {
  return value === 'user_api' ? 'user_api' : 'system_remote'
}

function normalizeUserProvider(
  value: Partial<AIUserProviderConfig> | undefined,
): AIUserProviderConfig {
  return {
    providerType: 'openai-compatible',
    baseURL: normalizeBaseURL(value?.baseURL),
    endpointPath: normalizeEndpointPath(value?.endpointPath),
    model: sanitizeText(value?.model, 200),
    apiKey: sanitizeText(value?.apiKey, 500),
    temperature: clampTemperature(value?.temperature),
  }
}

function isDesktopBridgeAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  const candidate = window as typeof window & { go?: { main?: { App?: Record<string, unknown> } } }
  return Boolean(candidate.go?.main?.App)
}

function parseAIProviderSettings(raw: string | null | undefined): AIProviderSettings | null {
  if (!raw || !raw.trim()) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AIProviderSettings>
    return {
      mode: normalizeMode(parsed.mode),
      userProvider: normalizeUserProvider(parsed.userProvider),
    }
  } catch {
    return null
  }
}

function normalizeProviderConfigFile(value: AIProviderConfigFile): AIProviderSettings {
  const userProvider = {
    ...value.userProvider,
    baseURL: value.userProvider?.baseURL ?? value.baseURL,
    endpointPath: value.userProvider?.endpointPath ?? value.endpointPath,
    model: value.userProvider?.model ?? value.model,
    apiKey: value.userProvider?.apiKey ?? value.apiKey,
    temperature: value.userProvider?.temperature ?? value.temperature,
  }

  return {
    mode: normalizeMode(value.mode ?? 'user_api'),
    userProvider: normalizeUserProvider(userProvider),
  }
}

export function parseAIProviderConfigText(raw: string): AIProviderSettings {
  if (!raw.trim()) {
    throw new Error('请粘贴 AI provider 配置 JSON。')
  }

  let parsed: AIProviderConfigFile
  try {
    parsed = JSON.parse(raw) as AIProviderConfigFile
  } catch {
    throw new Error('配置文件不是有效 JSON。')
  }

  const settings = normalizeProviderConfigFile(parsed)
  if (settings.mode === 'user_api' && !hasUsableUserProviderConfig(settings.userProvider)) {
    throw new Error('配置文件缺少服务地址、接口路径或模型。')
  }

  return settings
}

export function createAIProviderConfigTemplate(): string {
  return JSON.stringify(
    {
      version: 1,
      mode: 'user_api',
      userProvider: {
        providerType: 'openai-compatible',
        baseURL: 'http://localhost:11434',
        endpointPath: DEFAULT_ENDPOINT_PATH,
        model: 'qwen3',
        apiKey: '',
        temperature: DEFAULT_USER_PROVIDER_CONFIG.temperature,
      },
    } satisfies AIProviderConfigFile,
    null,
    2,
  )
}

export function exportAIProviderConfigText(
  settings: AIProviderSettings = loadAIProviderSettings(),
): string {
  const normalized = normalizeProviderConfigFile(settings)
  return JSON.stringify(
    {
      version: 1,
      mode: normalized.mode,
      userProvider: {
        ...normalized.userProvider,
        apiKey: '',
      },
    } satisfies AIProviderConfigFile,
    null,
    2,
  )
}

function loadSessionApiKey(): string {
  try {
    const raw = sessionStorage.getItem(SESSION_API_KEY_STORAGE_KEY)
    return typeof raw === 'string' ? raw.trim() : ''
  } catch {
    return ''
  }
}

function saveSessionApiKey(apiKey: string): void {
  try {
    if (apiKey.trim()) {
      sessionStorage.setItem(SESSION_API_KEY_STORAGE_KEY, apiKey.trim())
      return
    }
    sessionStorage.removeItem(SESSION_API_KEY_STORAGE_KEY)
  } catch {
    // ignore sessionStorage failures
  }
}

export function loadAIProviderSettings(): AIProviderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = parseAIProviderSettings(raw)
    if (!parsed) {
      return {
        ...DEFAULT_AI_PROVIDER_SETTINGS,
        userProvider: { ...DEFAULT_USER_PROVIDER_CONFIG },
      }
    }
    const sessionApiKey = loadSessionApiKey()
    const normalizedUserProvider = normalizeUserProvider(parsed.userProvider)
    return {
      mode: normalizeMode(parsed.mode),
      userProvider: {
        ...normalizedUserProvider,
        apiKey: sessionApiKey || normalizedUserProvider.apiKey,
      },
    }
  } catch {
    return {
      ...DEFAULT_AI_PROVIDER_SETTINGS,
      userProvider: { ...DEFAULT_USER_PROVIDER_CONFIG },
    }
  }
}

export function saveAIProviderSettings(settings: AIProviderSettings): AIProviderSettings {
  const sessionApiKey = loadSessionApiKey()
  const normalized: AIProviderSettings = {
    mode: normalizeMode(settings.mode),
    userProvider: normalizeUserProvider(settings.userProvider),
  }
  const nextApiKey = normalized.userProvider.apiKey

  if (hasValidApiKey(nextApiKey)) {
    saveSessionApiKey(nextApiKey)
    normalized.userProvider.apiKey = maskApiKey(nextApiKey)
  } else if (isApiKeyMasked(nextApiKey)) {
    normalized.userProvider.apiKey = nextApiKey
  } else if (!nextApiKey && sessionApiKey) {
    saveSessionApiKey('')
  } else {
    normalized.userProvider.apiKey = ''
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  } catch {
    // ignore localStorage failures
  }

  return normalized
}

export async function hydrateAIProviderSettingsFromDesktop(): Promise<AIProviderSettings | null> {
  if (!isDesktopBridgeAvailable()) {
    return null
  }

  try {
    const [raw, secret] = await Promise.all([
      GetAppSetting(DESKTOP_SETTING_KEY),
      GetAppSecret(DESKTOP_SECRET_KEY),
    ])
    const parsed = parseAIProviderSettings(raw)
    if (!parsed) {
      return null
    }

    const hydrated = saveAIProviderSettings(parsed)
    if (hasValidApiKey(secret)) {
      saveSessionApiKey(secret)
    }
    return {
      ...hydrated,
      userProvider: {
        ...hydrated.userProvider,
        apiKey: loadSessionApiKey() || hydrated.userProvider.apiKey,
      },
    }
  } catch {
    return null
  }
}

export async function persistAIProviderSettingsToDesktop(
  settings: AIProviderSettings,
): Promise<void> {
  if (!isDesktopBridgeAvailable()) {
    return
  }

  const sanitized = saveAIProviderSettings(settings)
  const inputApiKey = sanitizeText(settings.userProvider.apiKey, 500)
  const runtimeApiKey = loadSessionApiKey()
  const payload = JSON.stringify({
    mode: sanitized.mode,
    userProvider: {
      ...sanitized.userProvider,
      apiKey: isApiKeyMasked(sanitized.userProvider.apiKey) ? sanitized.userProvider.apiKey : '',
    },
  } satisfies AIProviderSettings)

  try {
    await SetAppSetting(DESKTOP_SETTING_KEY, payload)

    if (hasValidApiKey(runtimeApiKey)) {
      await SetAppSecret(DESKTOP_SECRET_KEY, runtimeApiKey)
      return
    }

    if (!inputApiKey || !isApiKeyMasked(inputApiKey)) {
      await DeleteAppSecret(DESKTOP_SECRET_KEY)
    }
  } catch {
    // ignore desktop persistence failures and keep browser/session fallback available
  }
}

export async function clearAIProviderSettingsFromDesktop(): Promise<void> {
  if (!isDesktopBridgeAvailable()) {
    return
  }
  try {
    await Promise.all([
      DeleteAppSetting(DESKTOP_SETTING_KEY),
      DeleteAppSecret(DESKTOP_SECRET_KEY),
    ])
  } catch {
    // ignore desktop cleanup failures
  }
}

export function isUserProviderModeEnabled(
  settings: AIProviderSettings = loadAIProviderSettings(),
): boolean {
  return settings.mode === 'user_api'
}

export function hasUsableUserProviderConfig(
  config: AIUserProviderConfig | undefined,
): config is AIUserProviderConfig {
  if (!config) {
    return false
  }
  return (
    Boolean(config.baseURL.trim()) &&
    Boolean(config.model.trim()) &&
    Boolean(config.endpointPath.trim())
  )
}

export function hasSessionApiKey(): boolean {
  return hasValidApiKey(loadSessionApiKey())
}

export function getUserProviderRuntimeConfig(): AIUserProviderConfig {
  const settings = loadAIProviderSettings()
  if (!isUserProviderModeEnabled(settings)) {
    throw new Error('当前未启用用户自接 AI provider。')
  }
  if (!hasUsableUserProviderConfig(settings.userProvider)) {
    throw new Error('请先完成 AI provider 的地址、接口路径和模型配置。')
  }
  return {
    ...settings.userProvider,
    apiKey: loadSessionApiKey(),
  }
}
