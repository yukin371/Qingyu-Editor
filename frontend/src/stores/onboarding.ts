/**
 * 新手引导系统状态管理
 * 管理引导状态、进度和配置
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface TourStep {
  target: string
  title: string
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  action?: () => void
  skipable?: boolean
}

export interface TourConfig {
  id: string
  name: string
  description?: string
  steps: TourStep[]
  autoStart?: boolean
  skippable?: boolean
  showProgress?: boolean
  prerequisite?: string // 前置引导ID
  triggerOn?: string[] // 触发条件
}

export const OnboardingStore = defineStore('onboarding', () => {
  // 状态
  const activeTour = ref<string | null>(null)
  const currentStepIndex = ref(0)
  const tourVisible = ref(false)
  const skippedTours = ref<Set<string>>(new Set())
  const completedTours = ref<Set<string>>(new Set())

  // 注册的引导配置
  const registeredTours = ref<Map<string, TourConfig>>(new Map())

  // 当前引导步骤
  const currentStep = computed(() => {
    if (!activeTour.value) return null
    const tour = registeredTours.value.get(activeTour.value)
    if (!tour) return null
    return tour.steps[currentStepIndex.value] || null
  })

  const currentTourConfig = computed(() => {
    if (!activeTour.value) return null
    return registeredTours.value.get(activeTour.value) || null
  })

  const totalSteps = computed(() => {
    return currentTourConfig.value?.steps.length || 0
  })

  const progress = computed(() => {
    if (totalSteps.value === 0) return 0
    return ((currentStepIndex.value + 1) / totalSteps.value) * 100
  })

  // 注册引导配置
  function registerTour(config: TourConfig) {
    registeredTours.value.set(config.id, config)
  }

  // 检查引导是否完成
  function hasCompleted(tourId: string): boolean {
    return completedTours.value.has(tourId)
  }

  // 检查引导是否跳过
  function hasSkipped(tourId: string): boolean {
    return skippedTours.value.has(tourId)
  }

  // 开始引导
  function startTour(tourId: string) {
    const tour = registeredTours.value.get(tourId)
    if (!tour) {
      if (import.meta.env.DEV) console.warn(`Tour "${tourId}" not found`)
      return
    }

    // 检查是否已完成
    if (completedTours.value.has(tourId)) {
      return
    }

    // 检查前置条件
    if (tour.prerequisite && !completedTours.value.has(tour.prerequisite)) {
      return
    }

    activeTour.value = tourId
    currentStepIndex.value = 0
    tourVisible.value = true
  }

  // 下一步
  function nextStep() {
    if (!activeTour.value || !currentTourConfig.value) return

    // 执行当前步骤的action
    if (currentStep.value?.action) {
      try {
        currentStep.value.action()
      } catch (error) {
        console.error('Error executing step action:', error)
      }
    }

    if (currentStepIndex.value < totalSteps.value - 1) {
      currentStepIndex.value++
    } else {
      completeTour()
    }
  }

  // 上一步
  function prevStep() {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value--
    }
  }

  // 跳过引导
  function skipTour() {
    if (!activeTour.value || !currentTourConfig.value) return

    if (currentTourConfig.value.skippable !== false) {
      skippedTours.value.add(activeTour.value)
      endTour()
    }
  }

  // 完成引导
  function completeTour() {
    if (activeTour.value) {
      completedTours.value.add(activeTour.value)
      // 持久化到localStorage
      saveToLocalStorage()
    }
    endTour()
  }

  // 结束引导
  function endTour() {
    activeTour.value = null
    currentStepIndex.value = 0
    tourVisible.value = false
  }

  // 重新开始引导
  function restartTour(tourId: string) {
    completedTours.value.delete(tourId)
    skippedTours.value.delete(tourId)
    saveToLocalStorage()
    startTour(tourId)
  }

  // 重置所有引导
  function resetAllTours() {
    completedTours.value.clear()
    skippedTours.value.clear()
    activeTour.value = null
    currentStepIndex.value = 0
    tourVisible.value = false
    saveToLocalStorage()
  }

  // 保存到localStorage
  function saveToLocalStorage() {
    try {
      const data = {
        completed: Array.from(completedTours.value),
        skipped: Array.from(skippedTours.value)
      }
      localStorage.setItem('onboarding_progress', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save onboarding progress:', error)
    }
  }

  // 从localStorage加载
  function loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('onboarding_progress')
      if (data) {
        const parsed = JSON.parse(data)
        completedTours.value = new Set(parsed.completed || [])
        skippedTours.value = new Set(parsed.skipped || [])
      }
    } catch (error) {
      console.error('Failed to load onboarding progress:', error)
    }
  }

  return {
    // 状态
    activeTour,
    currentStepIndex,
    tourVisible,
    currentStep,
    currentTourConfig,
    totalSteps,
    progress,
    registeredTours,

    // 方法
    registerTour,
    hasCompleted,
    hasSkipped,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    endTour,
    restartTour,
    resetAllTours,
    loadFromLocalStorage
  }
})

export const useOnboarding = () => OnboardingStore()
