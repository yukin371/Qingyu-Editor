/**
 * 懒加载组合式函数
 */
import { ref, onMounted, onUnmounted } from 'vue'

export interface UseLazyLoadOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  onIntersect?: (entry: IntersectionObserverEntry) => void
}

/**
 * 图片懒加载
 */
export function useLazyLoad(targetRef: any, options: UseLazyLoadOptions = {}) {
  const {
    root = null,
    rootMargin = '50px',
    threshold = 0.01,
    onIntersect
  } = options

  const isIntersecting = ref(false)
  const hasIntersected = ref(false)
  let observer: IntersectionObserver | null = null

  const observe = () => {
    const element = targetRef?.value?.$el || targetRef?.value
    if (!element) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry: IntersectionObserverEntry) => {
          isIntersecting.value = entry.isIntersecting

          if (entry.isIntersecting && !hasIntersected.value) {
            hasIntersected.value = true
            onIntersect?.(entry)
          }
        })
      },
      {
        root,
        rootMargin,
        threshold
      }
    )

    observer.observe(element)
  }

  const unobserve = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  onMounted(() => {
    observe()
  })

  onUnmounted(() => {
    unobserve()
  })

  return {
    isIntersecting,
    hasIntersected,
    observe,
    unobserve
  }
}

/**
 * 无限滚动
 */
export interface UseInfiniteScrollOptions {
  distance?: number // 触发加载的距离（px）
  disabled?: boolean
  onLoadMore: () => Promise<void>
}

export function useInfiniteScroll(
  containerRef: any,
  options: UseInfiniteScrollOptions
) {
  const { distance = 100, disabled = false, onLoadMore } = options

  const isLoading = ref(false)
  const hasMore = ref(true)

  const handleScroll = async () => {
    if (disabled || isLoading.value || !hasMore.value) return

    const element = containerRef.value
    if (!element) return

    const scrollHeight = element.scrollHeight
    const scrollTop = element.scrollTop
    const clientHeight = element.clientHeight

    const distanceToBottom = scrollHeight - scrollTop - clientHeight

    if (distanceToBottom < distance) {
      isLoading.value = true
      try {
        await onLoadMore()
      } catch (error) {
        console.error('加载更多失败:', error)
      } finally {
        isLoading.value = false
      }
    }
  }

  onMounted(() => {
    const element = containerRef.value
    if (element) {
      element.addEventListener('scroll', handleScroll, { passive: true })
    }
  })

  onUnmounted(() => {
    const element = containerRef.value
    if (element) {
      element.removeEventListener('scroll', handleScroll)
    }
  })

  return {
    isLoading,
    hasMore,
    setHasMore: (value: boolean) => {
      hasMore.value = value
    }
  }
}

/**
 * 图片预加载
 */
export function useImagePreload(urls: string[]) {
  const loadedCount = ref(0)
  const totalCount = ref(urls.length)
  const isLoading = ref(false)
  const isComplete = ref(false)

  const preload = () => {
    if (urls.length === 0) {
      isComplete.value = true
      return Promise.resolve()
    }

    isLoading.value = true
    loadedCount.value = 0

    const promises = urls.map((url) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          loadedCount.value++
          resolve()
        }
        img.onerror = () => {
          loadedCount.value++
          reject(new Error(`Failed to load image: ${url}`))
        }
        img.src = url
      })
    })

    return Promise.allSettled(promises).then(() => {
      isLoading.value = false
      isComplete.value = true
    })
  }

  return {
    loadedCount,
    totalCount,
    isLoading,
    isComplete,
    progress: () => (loadedCount.value / totalCount.value) * 100,
    preload
  }
}

/**
 * 虚拟滚动（简化版）
 */
export interface UseVirtualScrollOptions<T> {
  itemHeight: number // 每项高度
  buffer?: number // 缓冲区项数
  items: T[]
}

export function useVirtualScroll<T>(
  containerRef: any,
  options: UseVirtualScrollOptions<T>
) {
  const { itemHeight, buffer = 5, items } = options

  const scrollTop = ref(0)
  const containerHeight = ref(0)
  const visibleStart = ref(0)
  const visibleEnd = ref(0)
  const visibleItems = ref<T[]>([])

  const totalHeight = ref(items.length * itemHeight)

  const updateVisibleItems = () => {
    const start = Math.max(0, Math.floor(scrollTop.value / itemHeight) - buffer)
    const end = Math.min(
      items.length,
      Math.ceil((scrollTop.value + containerHeight.value) / itemHeight) + buffer
    )

    visibleStart.value = start
    visibleEnd.value = end
    visibleItems.value = items.slice(start, end)
  }

  const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement
    scrollTop.value = target.scrollTop
    updateVisibleItems()
  }

  const updateContainerHeight = () => {
    const element = containerRef.value
    if (element) {
      containerHeight.value = element.clientHeight
      updateVisibleItems()
    }
  }

  onMounted(() => {
    const element = containerRef.value
    if (element) {
      updateContainerHeight()
      element.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('resize', updateContainerHeight)
    }
  })

  onUnmounted(() => {
    const element = containerRef.value
    if (element) {
      element.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', updateContainerHeight)
    }
  })

  return {
    visibleItems,
    visibleStart,
    visibleEnd,
    totalHeight,
    offsetY: () => visibleStart.value * itemHeight
  }
}

