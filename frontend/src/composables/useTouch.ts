/**
 * 触摸手势组合式函数
 */
import { ref, onMounted, onUnmounted } from 'vue'

export interface TouchPosition {
  x: number
  y: number
}

export interface SwipeDirection {
  horizontal: 'left' | 'right' | null
  vertical: 'up' | 'down' | null
}

export interface UseTouchOptions {
  threshold?: number // 滑动阈值（px）
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onTap?: () => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  longPressDelay?: number // 长按延迟（ms）
}

export function useTouch(targetRef: any, options: UseTouchOptions = {}) {
  const {
    threshold = 50,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    onLongPress,
    longPressDelay = 500
  } = options

  const touchStart = ref<TouchPosition>({ x: 0, y: 0 })
  const touchEnd = ref<TouchPosition>({ x: 0, y: 0 })
  const lastTapTime = ref(0)
  const longPressTimer = ref<number | null>(null)

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    touchStart.value = {
      x: touch.clientX,
      y: touch.clientY
    }

    // 长按检测
    if (onLongPress) {
      longPressTimer.value = window.setTimeout(() => {
        onLongPress()
      }, longPressDelay)
    }
  }

  const handleTouchMove = () => {
    // 移动时取消长按
    if (longPressTimer.value) {
      clearTimeout(longPressTimer.value)
      longPressTimer.value = null
    }
  }

  const handleTouchEnd = (e: TouchEvent) => {
    // 清除长按定时器
    if (longPressTimer.value) {
      clearTimeout(longPressTimer.value)
      longPressTimer.value = null
    }

    const touch = e.changedTouches[0]
    touchEnd.value = {
      x: touch.clientX,
      y: touch.clientY
    }

    const deltaX = touchEnd.value.x - touchStart.value.x
    const deltaY = touchEnd.value.y - touchStart.value.y
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // 判断是否为滑动
    if (absDeltaX > threshold || absDeltaY > threshold) {
      // 水平滑动优先
      if (absDeltaX > absDeltaY) {
        if (deltaX > 0) {
          onSwipeRight?.()
        } else {
          onSwipeLeft?.()
        }
      } else {
        // 垂直滑动
        if (deltaY > 0) {
          onSwipeDown?.()
        } else {
          onSwipeUp?.()
        }
      }
    } else {
      // 判断为点击
      const now = Date.now()
      const timeDiff = now - lastTapTime.value

      if (timeDiff < 300 && onDoubleTap) {
        // 双击
        onDoubleTap()
        lastTapTime.value = 0
      } else {
        // 单击
        onTap?.()
        lastTapTime.value = now
      }
    }
  }

  onMounted(() => {
    const element = targetRef?.value?.$el || targetRef?.value
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: true })
      element.addEventListener('touchmove', handleTouchMove, { passive: true })
      element.addEventListener('touchend', handleTouchEnd, { passive: true })
    }
  })

  onUnmounted(() => {
    const element = targetRef?.value?.$el || targetRef?.value
    if (element) {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }

    if (longPressTimer.value) {
      clearTimeout(longPressTimer.value)
    }
  })

  return {
    touchStart,
    touchEnd
  }
}

/**
 * 阻止默认滚动行为（用于下拉刷新等场景）
 */
export function usePreventScroll() {
  const preventDefault = (e: TouchEvent) => {
    e.preventDefault()
  }

  const enable = () => {
    document.addEventListener('touchmove', preventDefault, { passive: false })
  }

  const disable = () => {
    document.removeEventListener('touchmove', preventDefault)
  }

  onUnmounted(() => {
    disable()
  })

  return {
    enable,
    disable
  }
}

/**
 * 下拉刷新
 */
export interface UsePullRefreshOptions {
  threshold?: number // 触发刷新的距离
  maxDistance?: number // 最大下拉距离
  onRefresh: () => Promise<void>
}

export function usePullRefresh(
  containerRef: any,
  options: UsePullRefreshOptions
) {
  const { threshold = 80, maxDistance = 200, onRefresh } = options

  const isPulling = ref(false)
  const isRefreshing = ref(false)
  const pullDistance = ref(0)
  const startY = ref(0)
  const currentY = ref(0)

  const handleTouchStart = (e: TouchEvent) => {
    if (isRefreshing.value) return

    const scrollTop = containerRef.value?.scrollTop || 0
    if (scrollTop === 0) {
      startY.value = e.touches[0].clientY
      isPulling.value = true
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling.value || isRefreshing.value) return

    currentY.value = e.touches[0].clientY
    const distance = currentY.value - startY.value

    if (distance > 0) {
      // 计算阻尼效果
      pullDistance.value = Math.min(
        distance * 0.5,
        maxDistance
      )

      // 阻止默认滚动
      if (pullDistance.value > 10) {
        e.preventDefault()
      }
    }
  }

  const handleTouchEnd = async () => {
    if (!isPulling.value || isRefreshing.value) return

    isPulling.value = false

    if (pullDistance.value >= threshold) {
      isRefreshing.value = true
      try {
        await onRefresh()
      } finally {
        isRefreshing.value = false
        pullDistance.value = 0
      }
    } else {
      pullDistance.value = 0
    }
  }

  onMounted(() => {
    const element = containerRef?.value
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: true })
      element.addEventListener('touchmove', handleTouchMove, { passive: false })
      element.addEventListener('touchend', handleTouchEnd, { passive: true })
    }
  })

  onUnmounted(() => {
    const element = containerRef?.value
    if (element) {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  })

  return {
    isPulling,
    isRefreshing,
    pullDistance
  }
}


