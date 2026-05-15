import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  DEFAULT_USER_PROVIDER_CONFIG,
  loadAIProviderSettings,
  saveAIProviderSettings,
  type AIAccessMode,
} from '../config/provider'

export const useAIProviderStore = defineStore('writer-ai-provider-settings', () => {
  const snapshot = ref(loadAIProviderSettings())

  const persist = () => {
    snapshot.value = saveAIProviderSettings(snapshot.value)
  }

  const mode = computed<AIAccessMode>({
    get: () => snapshot.value.mode,
    set: (value) => {
      snapshot.value.mode = value === 'user_api' ? 'user_api' : 'system_remote'
      persist()
    },
  })

  const baseURL = computed({
    get: () => snapshot.value.userProvider.baseURL,
    set: (value: string) => {
      snapshot.value.userProvider.baseURL = value
      persist()
    },
  })

  const endpointPath = computed({
    get: () => snapshot.value.userProvider.endpointPath,
    set: (value: string) => {
      snapshot.value.userProvider.endpointPath = value
      persist()
    },
  })

  const model = computed({
    get: () => snapshot.value.userProvider.model,
    set: (value: string) => {
      snapshot.value.userProvider.model = value
      persist()
    },
  })

  const apiKey = computed({
    get: () => snapshot.value.userProvider.apiKey,
    set: (value: string) => {
      snapshot.value.userProvider.apiKey = value
      persist()
    },
  })

  const temperature = computed({
    get: () => snapshot.value.userProvider.temperature,
    set: (value: number) => {
      snapshot.value.userProvider.temperature = value
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

  const resetUserProvider = () => {
    snapshot.value.userProvider = { ...DEFAULT_USER_PROVIDER_CONFIG }
    persist()
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
    resetUserProvider,
  }
})
