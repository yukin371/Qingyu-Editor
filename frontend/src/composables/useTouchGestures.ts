/**
 * useTouchGestures
 * TDD Phase 6: 通用手势操作功能
 *
 * 功能:
 * - 左右上下滑动手势检测
 * - 长按手势检测
 * - 边缘区域检测避免冲突（iOS左滑返回）
 * - 可配置的阈值参数
 */

import { onMounted, onUnmounted, type Ref } from 'vue'

/**
 * 手势回调函数
 */
export interface TouchGestureCallbacks {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onLongPress?: () => void
}

/**
 * 手势配置选项
 */
export interface TouchGestureOptions {
  swipeThreshold?: number // 滑动阈值，默认50px
  edgeThreshold?: number // 边缘阈值，默认20px
  longPressDelay?: number // 长按延迟，默认500ms
  preventDefault?: boolean // 是否阻止默认行为
}

/**
 * 合并配置类型
 */
export type TouchGestureConfig = TouchGestureCallbacks & TouchGestureOptions

/**
 * 通用手势Composable
 */
export function useTouchGestures(
  element: Ref<HTMLElement | undefined>,
  config: TouchGestureConfig = {}
) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onLongPress,
    swipeThreshold = 50,
    edgeThreshold = 20,
    longPressDelay = 500,
    preventDefault = true
  } = config

  // 内部状态
  let startX = 0
  let startY = 0
  let startTime = 0
  let longPressTimer: number | null = null
  let isEdgeArea = false

  /**
   * 边缘区域检测
   * 避免与iOS左滑返回手势冲突
   */
  const checkEdgeArea = (x: number): boolean => {
    const windowWidth = window.innerWidth
    return x < edgeThreshold || x > windowWidth - edgeThreshold
  }

  /**
   * 处理触摸开始
   */
  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    startX = touch.clientX
    startY = touch.clientY
    startTime = Date.now()

    // 检查是否在边缘区域
    isEdgeArea = checkEdgeArea(startX)

    // 启动长按定时器（边缘区域不启动）
    if (onLongPress && !isEdgeArea) {
      longPressTimer = window.setTimeout(() => {
        onLongPress()
      }, longPressDelay)
    }
  }

  /**
   * 处理触摸移动
   * 检测是否移动超过阈值，如果是则取消长按
   */
  const handleTouchMove = (e: TouchEvent) => {
    // 如果移动了，取消长按
    if (longPressTimer) {
      const touch = e.touches[0]
      const deltaX = Math.abs(touch.clientX - startX)
      const deltaY = Math.abs(touch.clientY - startY)

      if (deltaX > 10 || deltaY > 10) {
        clearTimeout(longPressTimer)
        longPressTimer = null
      }
    }
  }

  /**
   * 处理触摸结束（手势检测）
   */
  const handleTouchEnd = (e: TouchEvent) => {
    // 清除长按定时器
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY
    const deltaTime = Date.now() - startTime

    // P0修复：边缘区域完全不触发手势
    if (isEdgeArea) {
      return
    }

    // 检查长按（如果在touchend时时间达到长按阈值）
    if (deltaTime >= longPressDelay && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      if (onLongPress) {
        onLongPress()
      }
      return
    }

    // 检测水平滑动
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    }
    // 检测垂直滑动
    else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > swipeThreshold) {
      if (deltaY > 0 && onSwipeDown) {
        onSwipeDown()
      } else if (deltaY < 0 && onSwipeUp) {
        onSwipeUp()
      }
    }
  }

  /**
   * 处理触摸取消
   */
  const handleTouchCancel = () => {
    // 清除长按定时器
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
  }

  /**
   * 初始化手势监听
   */
  const init = () => {
    if (!element.value) return

    element.value.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault })
    element.value.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.value.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault })
    element.value.addEventListener('touchcancel', handleTouchCancel, { passive: !preventDefault })
  }

  /**
   * 清理手势监听
   */
  const stop = () => {
    if (element.value) {
      element.value.removeEventListener('touchstart', handleTouchStart)
      element.value.removeEventListener('touchmove', handleTouchMove)
      element.value.removeEventListener('touchend', handleTouchEnd)
      element.value.removeEventListener('touchcancel', handleTouchCancel)
    }
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
  }

  // 生命周期管理
  try {
    onMounted(() => {
      init()
    })

    onUnmounted(() => {
      stop()
    })
  } catch {
    // 在非组件环境中调用时忽略错误
    // 这种情况下用户需要手动调用 init() 和 stop()
  }

  return {
    init,
    stop
  }
}
