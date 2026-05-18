import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  clearAIProviderSettingsFromDesktop,
  AI_PROVIDER_PRESETS,
  createAIProviderConfigTemplate,
  DEFAULT_USER_PROVIDER_CONFIG,
  exportAIProviderConfigText,
  hasSessionApiKey,
  hydrateAIProviderSettingsFromDesktop,
  isUserProviderModeEnabled,
  loadAIProviderSettings,
  parseAIProviderConfigText,
  persistAIProviderSettingsToDesktop,
  saveAIProviderSettings,
  type AIAccessMode,
} from '../config/provider'
import { hasValidApiKey, isApiKeyMasked } from '../utils/apikey'
import { checkAIProviderHealth, type AIProviderHealth } from '../api/ai'

export const useAIProviderStore = defineStore('writer-ai-provider-settings', () => {
  const snapshot = ref(loadAIProviderSettings())
  const hydrated = ref(false)
  const health = ref<AIProviderHealth | null>(null)
  const healthChecking = ref(false)

  const clearHealth = () => {
    health.value = null
  }

  const persist = () => {
    snapshot.value = saveAIProviderSettings(snapshot.value)
    void persistAIProviderSettingsToDesktop(snapshot.value)
  }

  const mode = computed<AIAccessMode>({
    get: () => snapshot.value.mode,
    set: (value) => {
      snapshot.value.mode = value === 'user_api' ? 'user_api' : 'system_remote'
      clearHealth()
      persist()
    },
  })

  const baseURL = computed({
    get: () => snapshot.value.userProvider.baseURL,
    set: (value: string) => {
      snapshot.value.userProvider.baseURL = value
      clearHealth()
      persist()
    },
  })

  const endpointPath = computed({
    get: () => snapshot.value.userProvider.endpointPath,
    set: (value: string) => {
      snapshot.value.userProvider.endpointPath = value
      clearHealth()
      persist()
    },
  })

  const model = computed({
    get: () => snapshot.value.userProvider.model,
    set: (value: string) => {
      snapshot.value.userProvider.model = value
      clearHealth()
      persist()
    },
  })

  const apiKey = computed({
    get: () => snapshot.value.userProvider.apiKey,
    set: (value: string) => {
      snapshot.value.userProvider.apiKey = value
      clearHealth()
      persist()
    },
  })

  const temperature = computed({
    get: () => snapshot.value.userProvider.temperature,
    set: (value: number) => {
      snapshot.value.userProvider.temperature = value
      clearHealth()
      persist()
    },
  })

  const providerReady = computed(
    () =>
      snapshot.value.userProvider.baseURL.trim().length > 0 &&
      snapshot.value.userProvider.model.trim().length > 0 &&
      snapshot.value.userProvider.endpointPath.trim().length > 0,
  )

  const hasApiKey = computed(() => snapshot.value.userProvider.apiKey.trim().length > 0)
  const hasRuntimeApiKey = computed(() => {
    void snapshot.value.userProvider.apiKey
    return hasSessionApiKey()
  })
  const apiKeyMasked = computed(() => isApiKeyMasked(snapshot.value.userProvider.apiKey))
  const apiKeyNeedsRefresh = computed(
    () =>
      apiKeyMasked.value &&
      !hasValidApiKey(snapshot.value.userProvider.apiKey) &&
      !hasRuntimeApiKey.value,
  )
  const userModeEnabled = computed(() => isUserProviderModeEnabled(snapshot.value))

  const resetUserProvider = () => {
    snapshot.value.userProvider = { ...DEFAULT_USER_PROVIDER_CONFIG }
    clearHealth()
    persist()
  }

  const applyPreset = (presetId: string) => {
    const preset = AI_PROVIDER_PRESETS.find((item) => item.id === presetId)
    if (!preset) {
      return
    }
    snapshot.value.userProvider.baseURL = preset.baseURL
    snapshot.value.userProvider.endpointPath = preset.endpointPath
    if (!preset.models.includes(snapshot.value.userProvider.model.trim())) {
      snapshot.value.userProvider.model = preset.models[0] || ''
    }
    clearHealth()
    persist()
  }

  const importConfigText = (raw: string) => {
    snapshot.value = parseAIProviderConfigText(raw)
    clearHealth()
    persist()
    return snapshot.value
  }

  const exportConfigText = () => exportAIProviderConfigText(snapshot.value)

  const createConfigTemplate = () => createAIProviderConfigTemplate()

  const hydrate = async () => {
    if (hydrated.value) {
      return
    }
    const desktopSnapshot = await hydrateAIProviderSettingsFromDesktop()
    if (desktopSnapshot) {
      snapshot.value = desktopSnapshot
      clearHealth()
    }
    hydrated.value = true
  }

  const resetAll = async () => {
    snapshot.value = saveAIProviderSettings({
      mode: 'system_remote',
      userProvider: { ...DEFAULT_USER_PROVIDER_CONFIG },
    })
    health.value = null
    await clearAIProviderSettingsFromDesktop()
  }

  const checkHealth = async () => {
    healthChecking.value = true
    try {
      health.value = await checkAIProviderHealth(snapshot.value)
      return health.value
    } finally {
      healthChecking.value = false
    }
  }

  return {
    mode,
    baseURL,
    endpointPath,
    model,
    apiKey,
    temperature,
    providerReady,
    hasApiKey,
    hasRuntimeApiKey,
    apiKeyMasked,
    apiKeyNeedsRefresh,
    userModeEnabled,
    health,
    healthChecking,
    checkHealth,
    hydrate,
    providerPresets: AI_PROVIDER_PRESETS,
    applyPreset,
    importConfigText,
    exportConfigText,
    createConfigTemplate,
    resetAll,
    resetUserProvider,
  }
})
