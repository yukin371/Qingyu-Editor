/**
 * 移动端手势操作 Composable
 * 支持滑动返回、下拉刷新、上拉加载、双击点赞、长按等手势
 */
import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface MobileGestureOptions {
  // 滑动返回
  enableSwipeBack?: boolean
  onSwipeBack?: () => void

  // 下拉刷新
  enablePullRefresh?: boolean
  onPullRefresh?: () => Promise<void>

  // 上拉加载
  enableLoadMore?: boolean
  onLoadMore?: () => Promise<void>

  // 双击点赞
  enableDoubleTap?: boolean
  onDoubleTap?: () => void

  // 长按
  enableLongPress?: boolean
  onLongPress?: () => void

  // 阈值配置
  swipeThreshold?: number      // 滑动阈值（px）
  pullThreshold?: number       // 下拉阈值（px）
  longPressDelay?: number      // 长按延迟（ms）
  doubleTapDelay?: number      // 双击间隔（ms）
}

export interface MobileGestureState {
  isRefreshing: Ref<boolean>
  isLoadingMore: Ref<boolean>
  pullDistance: Ref<number>
}

/**
 * 移动端手势 Hook
 */
export function useMobileGesture(
  targetRef: Ref<HTMLElement | undefined>,
  options: MobileGestureOptions = {}
): MobileGestureState {
  const {
    enableSwipeBack = true,
    onSwipeBack,
    enablePullRefresh = true,
    onPullRefresh,
    enableLoadMore = true,
    onLoadMore,
    enableDoubleTap = true,
    onDoubleTap,
    enableLongPress = true,
    onLongPress,
    swipeThreshold = 80,
    pullThreshold = 100,
    longPressDelay = 500,
    doubleTapDelay = 300
  } = options

  const isRefreshing = ref(false)
  const isLoadingMore = ref(false)
  const pullDistance = ref(0)

  // 触摸状态
  let touchStartX = 0
  let touchStartY = 0
  let touchStartTime = 0
  let lastTapTime = 0
  let longPressTimer: number | null = null
  let isPulling = false

  /**
   * 触摸开始
   */
  const handleTouchStart = (e: TouchEvent) => {
    if (!e.touches || e.touches.length === 0) return

    const touch = e.touches[0]
    touchStartX = touch.clientX
    touchStartY = touch.clientY
    touchStartTime = Date.now()
    isPulling = false

    // 启动长按定时器
    if (enableLongPress && onLongPress) {
      longPressTimer = window.setTimeout(() => {
        onLongPress()
        // 震动反馈
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }
      }, longPressDelay)
    }
  }

  /**
   * 触摸移动
   */
  const handleTouchMove = (e: TouchEvent) => {
    if (!e.touches || e.touches.length === 0) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartX
    const deltaY = touch.clientY - touchStartY

    // 移动超过一定距离，取消长按
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      if (longPressTimer) {
        clearTimeout(longPressTimer)
        longPressTimer = null
      }
    }

    // 下拉刷新处理
    if (enablePullRefresh && onPullRefresh && deltaY > 0) {
      const element = targetRef.value
      if (element && element.scrollTop === 0) {
        e.preventDefault()
        isPulling = true
        // 阻力效果
        pullDistance.value = Math.min(deltaY * 0.4, 150)
      }
    }
  }

  /**
   * 触摸结束
   */
  const handleTouchEnd = (e: TouchEvent) => {
    // 清除长按定时器
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }

    if (!e.changedTouches || e.changedTouches.length === 0) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartX
    const deltaY = touch.clientY - touchStartY
    const deltaTime = Date.now() - touchStartTime

    // 下拉刷新
    if (isPulling && pullDistance.value > pullThreshold && !isRefreshing.value) {
      isPulling = false
      isRefreshing.value = true
      pullDistance.value = 0

      if (onPullRefresh) {
        onPullRefresh().finally(() => {
          isRefreshing.value = false
        })
      }
      return
    }

    // 重置下拉状态
    if (isPulling) {
      isPulling = false
      pullDistance.value = 0
    }

    // 左滑返回
    if (enableSwipeBack && onSwipeBack) {
      if (deltaX > swipeThreshold && Math.abs(deltaY) < 50 && deltaTime < 300) {
        onSwipeBack()
        return
      }
    }

    // 上拉加载
    if (enableLoadMore && onLoadMore && deltaY < -swipeThreshold) {
      if (Math.abs(deltaX) < 50 && !isLoadingMore.value) {
        const element = targetRef.value
        if (element) {
          const scrollHeight = element.scrollHeight
          const scrollTop = element.scrollTop
          const clientHeight = element.clientHeight

          // 滚动到底部
          if (scrollTop + clientHeight >= scrollHeight - 50) {
            isLoadingMore.value = true
            onLoadMore().finally(() => {
              isLoadingMore.value = false
            })
            return
          }
        }
      }
    }

    // 双击检测
    if (enableDoubleTap && onDoubleTap) {
      const now = Date.now()
      if (now - lastTapTime < doubleTapDelay &&
          Math.abs(deltaX) < 20 && Math.abs(deltaY) < 20) {
        onDoubleTap()
        // 震动反馈
        if (navigator.vibrate) {
          navigator.vibrate(30)
        }
        lastTapTime = 0
        return
      }
      lastTapTime = now
    }
  }

  /**
   * 触摸取消
   */
  const handleTouchCancel = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }

    isPulling = false
    pullDistance.value = 0
  }

  onMounted(() => {
    const element = targetRef.value
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: false })
      element.addEventListener('touchmove', handleTouchMove, { passive: false })
      element.addEventListener('touchend', handleTouchEnd, { passive: false })
      element.addEventListener('touchcancel', handleTouchCancel, { passive: false })
    }
  })

  onUnmounted(() => {
    const element = targetRef.value
    if (element) {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchCancel)
    }
  })

  return {
    isRefreshing,
    isLoadingMore,
    pullDistance
  }
}

/**
 * 检测是否为移动设备
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * 检测是否支持触摸
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * 获取安全区域
 */
export function getSafeAreaInset() {
  const style = getComputedStyle(document.documentElement)

  return {
    top: parseInt(style.getPropertyValue('safe-area-inset-top')) || 0,
    right: parseInt(style.getPropertyValue('safe-area-inset-right')) || 0,
    bottom: parseInt(style.getPropertyValue('safe-area-inset-bottom')) || 0,
    left: parseInt(style.getPropertyValue('safe-area-inset-left')) || 0
  }
}
