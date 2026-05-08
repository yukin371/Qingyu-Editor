import { describe, it, expect, vi, beforeEach } from 'vitest'

import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '../App.vue'

// Mock the auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    isLoggedIn: false,
    token: null,
    user: null,
    roles: [],
    permissions: [],
    initAuth: vi.fn().mockResolvedValue(undefined),
    clearAuth: vi.fn(),
  }),
}))

// Mock onboarding composable
vi.mock('@/composables/useOnboarding', () => ({
  useOnboarding: () => ({
    loadFromLocalStorage: vi.fn(),
    registerTour: vi.fn(),
    hasCompleted: vi.fn().mockReturnValue(false),
    hasSkipped: vi.fn().mockReturnValue(false),
    startTour: vi.fn(),
  }),
}))

// Mock onboarding config
vi.mock('@/config/onboarding.config', () => ({
  initializeOnboarding: vi.fn().mockReturnValue([]),
}))

// Mock async component
vi.mock('@/shared/components/onboarding/OnboardingTour.vue', () => ({
  default: { template: '<div class="mock-onboarding"></div>' },
}))

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('mounts renders properly', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia()],
        stubs: {
          'router-view': true,
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
