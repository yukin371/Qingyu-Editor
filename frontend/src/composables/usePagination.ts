/**
 * usePagination - 无限滚动和分页组合函数
 *
 * 提供完整的分页逻辑，支持无限滚动、手动加载更多等场景
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export interface PaginationOptions {
  pageSize?: number
  initialLoad?: boolean
  autoLoadOnScroll?: boolean
  scrollThreshold?: number
}

export interface PaginationResult<T> {
  items: T[]
  total?: number
}

export interface UsePaginationReturn<T> {
  items: Ref<T[]>
  loading: Ref<boolean>
  hasMore: Ref<boolean>
  currentPage: Ref<number>
  total: Ref<number>
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  reset: () => void
  setupScrollObserver: (element: HTMLElement | null) => void
}

export function usePagination<T>(
  fetchFunction: (page: number, pageSize: number) => Promise<PaginationResult<T>>,
  options: PaginationOptions = {}
): UsePaginationReturn<T> {
  const {
    pageSize = 20,
    initialLoad = false,
    autoLoadOnScroll = false,
    scrollThreshold = 200
  } = options

  // 状态
  const items = ref<T[]>([]) as Ref<T[]>
  const loading = ref(false)
  const currentPage = ref(1)
  const total = ref(0)
  const reachedEnd = ref(false)
  const hasMore = computed(() => !reachedEnd.value && (items.value.length < total.value || total.value === 0))

  // IntersectionObserver 实例
  let observer: IntersectionObserver | null = null
  let observerElement: HTMLElement | null = null

  /**
   * 加载更多数据
   */
  const loadMore = async () => {
    if (loading.value || !hasMore.value) return

    loading.value = true
    try {
      const result = await fetchFunction(currentPage.value, pageSize)

      if (result.items && result.items.length > 0) {
        items.value.push(...result.items)
        currentPage.value++
      } else {
        // 返回空列表时视为已到底，避免触底后无限请求
        reachedEnd.value = true
      }

      if (result.total !== undefined) {
        total.value = result.total
        if (result.total <= items.value.length) {
          reachedEnd.value = true
        }
      } else if (!result.items || result.items.length < pageSize) {
        reachedEnd.value = true
      }
    } catch (error) {
      console.error('加载数据失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新数据（重新从第一页加载）
   */
  const refresh = async () => {
    reset()
    await loadMore()
  }

  /**
   * 重置状态
   */
  const reset = () => {
    items.value = []
    currentPage.value = 1
    total.value = 0
    reachedEnd.value = false
  }

  /**
   * 设置滚动监听器（用于无限滚动）
   */
  const setupScrollObserver = (element: HTMLElement | null) => {
    // 清除旧的观察器
    if (observer) {
      observer.disconnect()
      observer = null
    }

    if (!element || !autoLoadOnScroll) return

    observerElement = element

    // 创建新的观察器
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !loading.value && hasMore.value) {
            loadMore()
          }
        })
      },
      {
        rootMargin: `${scrollThreshold}px`,
        threshold: 0.1
      }
    )

    observer.observe(element)
  }

  /**
   * 窗口滚动监听（备选方案）
   */
  const handleScroll = () => {
    if (!autoLoadOnScroll || loading.value || !hasMore.value) return

    const scrollTop = window.scrollY
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight

    // 距离底部小于阈值时加载
    if (documentHeight - (scrollTop + windowHeight) < scrollThreshold) {
      loadMore()
    }
  }

  // 生命周期
  onMounted(() => {
    if (initialLoad) {
      loadMore()
    }

    // 如果启用了自动滚动加载且没有指定元素，使用窗口滚动
    if (autoLoadOnScroll && !observerElement) {
      window.addEventListener('scroll', handleScroll)
    }
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    items,
    loading,
    hasMore,
    currentPage,
    total,
    loadMore,
    refresh,
    reset,
    setupScrollObserver
  }
}
