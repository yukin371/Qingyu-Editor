/**
 * useReaderGestures
 * TDD Phase 3.6: 阅读器手势操作功能
 *
 * 功能:
 * - T3.6: 左右滑动翻页
 * - 长按显示菜单
 * - 边缘区域检测避免冲突（iOS左滑返回）
 */

import { ref, getCurrentInstance, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * 手势回调函数
 */
export interface ReaderGestureCallbacks {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onLongPress?: () => void
}

/**
 * 手势配置选项
 */
export interface ReaderGestureOptions {
  swipeThreshold?: number // 滑动阈值，默认50px
  longPressDelay?: number // 长按延迟，默认500ms
  edgeThreshold?: number // 边缘阈值，默认20px
  preventDefault?: boolean // 是否阻止默认行为
}

export type ReaderGestureConfig = ReaderGestureCallbacks & ReaderGestureOptions

/**
 * 阅读器手势Composable
 */
export function useReaderGestures(
  element: Ref<HTMLElement | undefined>,
  callbacksOrConfig: ReaderGestureConfig,
  options: ReaderGestureOptions = {},
) {
  const mergedConfig = {
    ...callbacksOrConfig,
    ...options,
  }

  const {
    swipeThreshold = 50,
    longPressDelay = 500,
    edgeThreshold = 20,
    preventDefault = true,
  } = mergedConfig

  const { onSwipeLeft, onSwipeRight, onLongPress } = mergedConfig

  // 内部状态
  const startX = ref(0)
  const startY = ref(0)
  const startTime = ref(0)
  const longPressTimer = ref<number | null>(null)

  /**
   * T3.6: 边缘区域检测
   * 避免与iOS左滑返回手势冲突
   */
  const isEdgeArea = (x: number): boolean => {
    const windowWidth = window.innerWidth
    return x <= edgeThreshold || x >= windowWidth - edgeThreshold
  }

  /**
   * 处理触摸开始
   */
  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    startX.value = touch.clientX
    startY.value = touch.clientY
    startTime.value = Date.now()

    // 启动长按定时器
    if (onLongPress) {
      longPressTimer.value = window.setTimeout(() => {
        // 触发长按回调
        onLongPress()
      }, longPressDelay)
    }
  }

  /**
   * T3.6: 处理触摸结束（翻页手势）
   */
  const handleTouchEnd = (e: TouchEvent) => {
    // 清除长按定时器
    if (longPressTimer.value) {
      clearTimeout(longPressTimer.value)
      longPressTimer.value = null
    }

    const touch = e.changedTouches[0]
    const endX = touch.clientX
    const endY = touch.clientY
    const diffX = endX - startX.value
    const diffY = endY - startY.value

    // 检查是否在边缘区域
    if (isEdgeArea(startX.value)) {
      // 边缘区域不触发手势（避免与系统手势冲突）
      return
    }

    // 检查是否达到滑动阈值
    if (Math.abs(diffX) > swipeThreshold) {
      // 检查主要是水平滑动（避免误触垂直滚动）
      if (Math.abs(diffY) < Math.abs(diffX)) {
        if (diffX > 0) {
          // 右滑
          onSwipeRight?.()
        } else {
          // 左滑
          onSwipeLeft?.()
        }
      }
    }
  }

  /**
   * 处理触摸取消
   */
  const handleTouchCancel = () => {
    // 清除长按定时器
    if (longPressTimer.value) {
      clearTimeout(longPressTimer.value)
      longPressTimer.value = null
    }
  }

  /**
   * 处理触摸移动
   * 检测是否移动超过阈值，如果是则取消长按
   */
  const handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0]
    const moveX = Math.abs(touch.clientX - startX.value)
    const moveY = Math.abs(touch.clientY - startY.value)

    // 如果移动超过阈值，取消长按
    if (moveX > 10 || moveY > 10) {
      if (longPressTimer.value) {
        clearTimeout(longPressTimer.value)
        longPressTimer.value = null
      }
    }
  }

  /**
   * 初始化手势监听
   */
  const initGestures = () => {
    if (!element.value) return

    const el = element.value

    // 添加事件监听
    el.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault })
    el.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault })
    el.addEventListener('touchcancel', handleTouchCancel, { passive: !preventDefault })
    el.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault })
  }

  /**
   * 清理手势监听
   */
  const cleanup = () => {
    if (!element.value) return

    const el = element.value

    // 移除事件监听
    el.removeEventListener('touchstart', handleTouchStart)
    el.removeEventListener('touchend', handleTouchEnd)
    el.removeEventListener('touchcancel', handleTouchCancel)
    el.removeEventListener('touchmove', handleTouchMove)

    // 清理定时器
    if (longPressTimer.value) {
      clearTimeout(longPressTimer.value)
      longPressTimer.value = null
    }
  }

  // 生命周期管理
  if (getCurrentInstance()) {
    onMounted(() => {
      initGestures()
    })

    onUnmounted(() => {
      cleanup()
    })
  }

  return {
    initGestures,
    cleanup,
  }
}
