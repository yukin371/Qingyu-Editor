import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  clearAIProviderSettingsFromDesktop,
  clearAIProviderProfileSecretFromDesktop,
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
  type AIProviderProfile,
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

  const activeProviderProfile = computed(
    () =>
      snapshot.value.providerProfiles.find(
        (profile) => profile.id === snapshot.value.activeProviderProfileId,
      ) || snapshot.value.providerProfiles[0],
  )

  const syncActiveProfileToRuntime = () => {
    const profile = activeProviderProfile.value
    if (!profile) {
      return
    }
    snapshot.value.userProvider = { ...profile.userProvider }
    snapshot.value.roleModels = { ...profile.roleModels }
  }

  const updateActiveProfile = (updater: (profile: AIProviderProfile) => AIProviderProfile) => {
    const activeId = snapshot.value.activeProviderProfileId
    snapshot.value.providerProfiles = snapshot.value.providerProfiles.map((profile) =>
      profile.id === activeId ? updater(profile) : profile,
    )
    syncActiveProfileToRuntime()
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
      updateActiveProfile((profile) => ({
        ...profile,
        userProvider: { ...profile.userProvider, baseURL: value },
      }))
      clearHealth()
      persist()
    },
  })

  const endpointPath = computed({
    get: () => snapshot.value.userProvider.endpointPath,
    set: (value: string) => {
      snapshot.value.userProvider.endpointPath = value
      updateActiveProfile((profile) => ({
        ...profile,
        userProvider: { ...profile.userProvider, endpointPath: value },
      }))
      clearHealth()
      persist()
    },
  })

  const model = computed({
    get: () => snapshot.value.userProvider.model,
    set: (value: string) => {
      snapshot.value.userProvider.model = value
      updateActiveProfile((profile) => ({
        ...profile,
        userProvider: { ...profile.userProvider, model: value },
      }))
      clearHealth()
      persist()
    },
  })

  const apiKey = computed({
    get: () => snapshot.value.userProvider.apiKey,
    set: (value: string) => {
      snapshot.value.userProvider.apiKey = value
      updateActiveProfile((profile) => ({
        ...profile,
        userProvider: { ...profile.userProvider, apiKey: value },
      }))
      clearHealth()
      persist()
    },
  })

  const temperature = computed({
    get: () => snapshot.value.userProvider.temperature,
    set: (value: number) => {
      snapshot.value.userProvider.temperature = value
      updateActiveProfile((profile) => ({
        ...profile,
        userProvider: { ...profile.userProvider, temperature: value },
      }))
      clearHealth()
      persist()
    },
  })

  const writingModel = computed({
    get: () => snapshot.value.roleModels.writing,
    set: (value: string) => {
      snapshot.value.roleModels.writing = value
      updateActiveProfile((profile) => ({
        ...profile,
        roleModels: { ...profile.roleModels, writing: value },
      }))
      clearHealth()
      persist()
    },
  })

  const reviewModel = computed({
    get: () => snapshot.value.roleModels.review,
    set: (value: string) => {
      snapshot.value.roleModels.review = value
      updateActiveProfile((profile) => ({
        ...profile,
        roleModels: { ...profile.roleModels, review: value },
      }))
      clearHealth()
      persist()
    },
  })

  const organizeModel = computed({
    get: () => snapshot.value.roleModels.organize,
    set: (value: string) => {
      snapshot.value.roleModels.organize = value
      updateActiveProfile((profile) => ({
        ...profile,
        roleModels: { ...profile.roleModels, organize: value },
      }))
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
    snapshot.value.roleModels = { writing: '', review: '', organize: '' }
    updateActiveProfile((profile) => ({
      ...profile,
      presetId: undefined,
      userProvider: { ...DEFAULT_USER_PROVIDER_CONFIG },
      roleModels: { writing: '', review: '', organize: '' },
    }))
    clearHealth()
    persist()
  }

  const applyPreset = (presetId: string) => {
    const preset = AI_PROVIDER_PRESETS.find((item) => item.id === presetId)
    if (!preset) {
      return
    }
    if (preset.id === 'custom') {
      snapshot.value.userProvider.baseURL = ''
      snapshot.value.userProvider.endpointPath = preset.endpointPath
      snapshot.value.userProvider.model = ''
      updateActiveProfile((profile) => ({
        ...profile,
        presetId: preset.id,
        userProvider: {
          ...profile.userProvider,
          baseURL: '',
          endpointPath: preset.endpointPath,
          model: '',
        },
      }))
      clearHealth()
      persist()
      return
    }
    snapshot.value.userProvider.baseURL = preset.baseURL
    snapshot.value.userProvider.endpointPath = preset.endpointPath
    if (!preset.models.includes(snapshot.value.userProvider.model.trim())) {
      snapshot.value.userProvider.model = preset.recommendedModel || preset.models[0] || ''
    }
    updateActiveProfile((profile) => ({
      ...profile,
      label: profile.label === '默认配置' ? preset.label : profile.label,
      presetId: preset.id,
      userProvider: {
        ...profile.userProvider,
        baseURL: snapshot.value.userProvider.baseURL,
        endpointPath: snapshot.value.userProvider.endpointPath,
        model: snapshot.value.userProvider.model,
      },
    }))
    clearHealth()
    persist()
  }

  const activeProviderProfileId = computed({
    get: () => snapshot.value.activeProviderProfileId,
    set: (value: string) => {
      if (!snapshot.value.providerProfiles.some((profile) => profile.id === value)) {
        return
      }
      snapshot.value.activeProviderProfileId = value
      syncActiveProfileToRuntime()
      clearHealth()
      persist()
    },
  })

  const providerProfiles = computed(() => snapshot.value.providerProfiles)

  const createProviderProfile = (presetId: string = 'custom') => {
    const preset = AI_PROVIDER_PRESETS.find((item) => item.id === presetId)
    const id = `provider-${Date.now().toString(36)}`
    const profile: AIProviderProfile = {
      id,
      label: preset?.label || `配置 ${snapshot.value.providerProfiles.length + 1}`,
      presetId: preset?.id,
      userProvider: {
        ...DEFAULT_USER_PROVIDER_CONFIG,
        baseURL: preset?.baseURL || '',
        endpointPath: preset?.endpointPath || DEFAULT_USER_PROVIDER_CONFIG.endpointPath,
        model: preset?.recommendedModel || preset?.models[0] || '',
      },
      roleModels: { writing: '', review: '', organize: '' },
    }
    snapshot.value.providerProfiles = [...snapshot.value.providerProfiles, profile]
    snapshot.value.activeProviderProfileId = id
    syncActiveProfileToRuntime()
    clearHealth()
    persist()
  }

  const deleteActiveProviderProfile = async () => {
    if (snapshot.value.providerProfiles.length <= 1) {
      return
    }
    const deletingId = snapshot.value.activeProviderProfileId
    const nextProfiles = snapshot.value.providerProfiles.filter((profile) => profile.id !== deletingId)
    snapshot.value.providerProfiles = nextProfiles
    snapshot.value.activeProviderProfileId = nextProfiles[0]!.id
    syncActiveProfileToRuntime()
    clearHealth()
    await clearAIProviderProfileSecretFromDesktop(deletingId)
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
      roleModels: { writing: '', review: '', organize: '' },
      activeProviderProfileId: 'default',
      providerProfiles: [],
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
    activeProviderProfileId,
    activeProviderProfile,
    providerProfiles,
    baseURL,
    endpointPath,
    model,
    writingModel,
    reviewModel,
    organizeModel,
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
    createProviderProfile,
    deleteActiveProviderProfile,
    importConfigText,
    exportConfigText,
    createConfigTemplate,
    resetAll,
    resetUserProvider,
  }
})
