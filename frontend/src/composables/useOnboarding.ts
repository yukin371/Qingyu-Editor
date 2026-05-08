/**
 * 新手引导 Composable
 * 提供引导相关的便捷方法
 */

import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOnboarding as useOnboardingStore } from '@/stores/onboarding'

export function useOnboarding() {
  const onboarding = useOnboardingStore()
  const router = useRouter()

  // 开始引导
  const startTour = (tourId: string) => {
    onboarding.startTour(tourId)
  }

  // 检查并自动开始引导
  const checkAndStartTour = (tourId: string) => {
    if (!onboarding.hasCompleted(tourId) && !onboarding.hasSkipped(tourId)) {
      onboarding.startTour(tourId)
    }
  }

  // 根据路由自动触发引导
  const setupRouteBasedTour = () => {
    const tourTriggers: Record<string, string> = {
      '/auth': 'welcome-tour',
      '/account/wallet': 'wallet-tour',
      '/bookstore': 'bookstore-tour',
      '/writer': 'writer-tour',
      '/reader': 'reader-tour'
    }

    const currentPath = router.currentRoute.value.path
    const tourId = tourTriggers[currentPath]

    if (tourId) {
      checkAndStartTour(tourId)
    }
  }

  // 组件挂载时自动检查引导
  const onMountedCheckTour = (tourId?: string) => {
    onMounted(() => {
      if (tourId) {
        checkAndStartTour(tourId)
      } else {
        setupRouteBasedTour()
      }
    })
  }

  // 重新开始引导
  const restartTour = (tourId: string) => {
    onboarding.restartTour(tourId)
  }

  // 重置所有引导（用于测试）
  const resetAll = () => {
    onboarding.resetAllTours()
  }

  return {
    ...onboarding,
    startTour,
    checkAndStartTour,
    setupRouteBasedTour,
    onMountedCheckTour,
    restartTour,
    resetAll
  }
}
