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

export interface AIProviderRoleModels {
  writing: string
  review: string
  organize: string
}

export interface AIProviderSettings {
  mode: AIAccessMode
  userProvider: AIUserProviderConfig
  roleModels: AIProviderRoleModels
}

export interface AIProviderPreset {
  id: string
  label: string
  description: string
  baseURL: string
  endpointPath: string
  providerType: AIUserProviderType
  models: string[]
  recommendedModel: string
}

export interface AIProviderConfigFile {
  version?: 1
  mode?: AIAccessMode
  providerPresetId?: string
  baseURL?: string
  endpointPath?: string
  model?: string
  apiKey?: string
  temperature?: number
  userProvider?: Partial<AIUserProviderConfig>
  roleModels?: Partial<AIProviderRoleModels>
}

const STORAGE_KEY = 'qingyu-ai-provider-settings'
const SESSION_API_KEY_STORAGE_KEY = 'qingyu-ai-provider-session-api-key'
const DESKTOP_SETTING_KEY = 'ai.provider.settings'
const DESKTOP_SECRET_KEY = 'ai.provider.api-key'
const DEFAULT_ENDPOINT_PATH = '/v1/chat/completions'

export const AI_PROVIDER_PRESETS: AIProviderPreset[] = [
  {
    id: 'ollama',
    label: 'Ollama',
    description: '本地模型，适合离线写作与快速回审',
    baseURL: 'http://localhost:11434',
    endpointPath: DEFAULT_ENDPOINT_PATH,
    providerType: 'openai-compatible',
    models: ['qwen3', 'qwen2.5', 'llama3.1', 'deepseek-r1'],
    recommendedModel: 'qwen3',
  },
  {
    id: 'qwen',
    label: 'Qwen / 百炼',
    description: '国内常用，兼容 OpenAI 协议',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    endpointPath: '/chat/completions',
    providerType: 'openai-compatible',
    models: ['qwen-max', 'qwen-plus', 'qwen3-max', 'qwen3-plus'],
    recommendedModel: 'qwen3-max',
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    description: '适合长文写作、审校与思考型任务',
    baseURL: 'https://api.deepseek.com/v1',
    endpointPath: '/chat/completions',
    providerType: 'openai-compatible',
    models: ['deepseek-v4-pro', 'deepseek-chat', 'deepseek-reasoner'],
    recommendedModel: 'deepseek-v4-pro',
  },
  {
    id: 'kimi',
    label: 'Kimi',
    description: '长上下文友好，适合整章整理与复盘',
    baseURL: 'https://api.moonshot.cn/v1',
    endpointPath: '/chat/completions',
    providerType: 'openai-compatible',
    models: ['kimi-k2.5', 'moonshot-v1-128k', 'moonshot-v1-32k'],
    recommendedModel: 'kimi-k2.5',
  },
  {
    id: 'glm',
    label: 'GLM / Z.AI',
    description: '适合结构化生成与中文创作',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    endpointPath: '/chat/completions',
    providerType: 'openai-compatible',
    models: ['GLM-5', 'GLM-4.7', 'GLM-4.6', 'glm-5.1'],
    recommendedModel: 'GLM-5',
  },
  {
    id: 'gemini',
    label: 'Gemini',
    description: '适合多模态与跨段分析，兼容 OpenAI 端点',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
    endpointPath: '/chat/completions',
    providerType: 'openai-compatible',
    models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
    recommendedModel: 'gemini-2.5-flash',
  },
  {
    id: 'gpt',
    label: 'GPT / OpenAI',
    description: '通用基线，适合稳定聊天和轻量写作',
    baseURL: 'https://api.openai.com/v1',
    endpointPath: '/chat/completions',
    providerType: 'openai-compatible',
    models: ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4o', 'gpt-4o-mini'],
    recommendedModel: 'gpt-4.1',
  },
  {
    id: 'claude',
    label: 'Claude / Anthropic',
    description: '擅长长文理解与审校，支持兼容层',
    baseURL: 'https://api.anthropic.com/v1',
    endpointPath: '/chat/completions',
    providerType: 'openai-compatible',
    models: ['claude-opus-4-1-20250805', 'claude-sonnet-4-20250514', 'claude-haiku-4-20250514'],
    recommendedModel: 'claude-sonnet-4-20250514',
  },
  {
    id: 'custom',
    label: '自定义',
    description: '填入自有兼容 provider，适合代理或私有网关',
    baseURL: '',
    endpointPath: DEFAULT_ENDPOINT_PATH,
    providerType: 'openai-compatible',
    models: [],
    recommendedModel: '',
  },
  {
    id: 'lm-studio',
    label: 'LM Studio',
    description: '本地兼容服务，适合调试与离线试写',
    baseURL: 'http://localhost:1234',
    endpointPath: DEFAULT_ENDPOINT_PATH,
    providerType: 'openai-compatible',
    models: ['local-model', 'qwen3', 'llama3.1'],
    recommendedModel: 'local-model',
  },
]

function cloneDefaultRoleModels(): AIProviderRoleModels {
  return { ...DEFAULT_AI_PROVIDER_SETTINGS.roleModels }
}

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
  roleModels: {
    writing: '',
    review: '',
    organize: '',
  },
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
    providerType: value?.providerType || 'openai-compatible',
    baseURL: normalizeBaseURL(value?.baseURL),
    endpointPath: normalizeEndpointPath(value?.endpointPath),
    model: sanitizeText(value?.model, 200),
    apiKey: sanitizeText(value?.apiKey, 500),
    temperature: clampTemperature(value?.temperature),
  }
}

function normalizeRoleModels(
  value: Partial<AIProviderRoleModels> | undefined,
): AIProviderRoleModels {
  return {
    writing: sanitizeText(value?.writing, 200),
    review: sanitizeText(value?.review, 200),
    organize: sanitizeText(value?.organize, 200),
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
      roleModels: normalizeRoleModels(parsed.roleModels),
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
    roleModels: normalizeRoleModels(value.roleModels),
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
      roleModels: {
        writing: 'qwen3',
        review: 'qwen3',
        organize: 'qwen3',
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
      roleModels: normalized.roleModels,
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
        roleModels: cloneDefaultRoleModels(),
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
      roleModels: normalizeRoleModels(parsed.roleModels),
    }
  } catch {
    return {
      ...DEFAULT_AI_PROVIDER_SETTINGS,
      userProvider: { ...DEFAULT_USER_PROVIDER_CONFIG },
      roleModels: cloneDefaultRoleModels(),
    }
  }
}

export function saveAIProviderSettings(settings: AIProviderSettings): AIProviderSettings {
  const sessionApiKey = loadSessionApiKey()
  const normalized: AIProviderSettings = {
    mode: normalizeMode(settings.mode),
    userProvider: normalizeUserProvider(settings.userProvider),
    roleModels: normalizeRoleModels(settings.roleModels),
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
      roleModels: { ...hydrated.roleModels },
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
    roleModels: sanitized.roleModels,
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
