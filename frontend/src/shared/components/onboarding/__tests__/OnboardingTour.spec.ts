import { reactive } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OnboardingTour from '../OnboardingTour.vue'

const { mocks } = vi.hoisted(() => ({
  mocks: {
    onboarding: null as any,
    ElMessage: {
      info: vi.fn(),
      success: vi.fn(),
    },
  },
}))

vi.mock('@/composables/useOnboarding', () => ({
  useOnboarding: () => mocks.onboarding,
}))

vi.mock('element-plus', () => ({
  ElMessage: mocks.ElMessage,
}))

function createOnboardingState(overrides: Record<string, unknown> = {}) {
  return reactive({
    tourVisible: true,
    currentStep: {
      target: 'body',
      title: '欢迎使用',
      content: '这是一个全屏引导步骤。',
    },
    currentStepIndex: 0,
    totalSteps: 2,
    progress: 50,
    currentTourConfig: {
      skippable: true,
      showProgress: true,
    },
    nextStep: vi.fn(),
    prevStep: vi.fn(),
    skipTour: vi.fn(),
    completeTour: vi.fn(),
    endTour: vi.fn(),
    ...overrides,
  })
}

function mountComponent() {
  return mount(OnboardingTour, {
    global: {
      stubs: {
        teleport: true,
        transition: false,
      },
    },
  })
}

function findButtonByText(wrapper: ReturnType<typeof mountComponent>, label: string) {
  return wrapper.findAll('button').find(button => button.text().trim() === label)
}

describe('OnboardingTour', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.onboarding = createOnboardingState()
  })

  it('should trigger next step from fullscreen action button', async () => {
    const wrapper = mountComponent()

    const nextButton = findButtonByText(wrapper, '下一步')
    expect(nextButton).toBeTruthy()

    await nextButton!.trigger('click')

    expect(mocks.onboarding.nextStep).toHaveBeenCalledTimes(1)
  })

  it('should trigger skip action from fullscreen toolbar', async () => {
    const wrapper = mountComponent()

    const skipButton = findButtonByText(wrapper, '跳过')
    expect(skipButton).toBeTruthy()

    await skipButton!.trigger('click')

    expect(mocks.onboarding.skipTour).toHaveBeenCalledTimes(1)
    expect(mocks.ElMessage.info).toHaveBeenCalledTimes(1)
  })

  it('should trigger endTour from fullscreen close button', async () => {
    const wrapper = mountComponent()

    const closeButton = wrapper.find('.tour-close')
    expect(closeButton.exists()).toBe(true)

    await closeButton.trigger('click')

    expect(mocks.onboarding.endTour).toHaveBeenCalledTimes(1)
  })
})
