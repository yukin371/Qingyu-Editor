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

const STORAGE_KEY = 'qingyu-ai-provider-settings'
const DEFAULT_ENDPOINT_PATH = '/v1/chat/completions'

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

export function loadAIProviderSettings(): AIProviderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        ...DEFAULT_AI_PROVIDER_SETTINGS,
        userProvider: { ...DEFAULT_USER_PROVIDER_CONFIG },
      }
    }
    const parsed = JSON.parse(raw) as Partial<AIProviderSettings>
    return {
      mode: normalizeMode(parsed.mode),
      userProvider: normalizeUserProvider(parsed.userProvider),
    }
  } catch {
    return {
      ...DEFAULT_AI_PROVIDER_SETTINGS,
      userProvider: { ...DEFAULT_USER_PROVIDER_CONFIG },
    }
  }
}

export function saveAIProviderSettings(settings: AIProviderSettings): AIProviderSettings {
  const normalized: AIProviderSettings = {
    mode: normalizeMode(settings.mode),
    userProvider: normalizeUserProvider(settings.userProvider),
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  } catch {
    // ignore localStorage failures
  }

  return normalized
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

export function getUserProviderRuntimeConfig(): AIUserProviderConfig {
  const settings = loadAIProviderSettings()
  if (!isUserProviderModeEnabled(settings)) {
    throw new Error('当前未启用用户自接 AI provider。')
  }
  if (!hasUsableUserProviderConfig(settings.userProvider)) {
    throw new Error('请先完成 AI provider 的地址、接口路径和模型配置。')
  }
  return settings.userProvider
}
