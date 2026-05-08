/**
 * useLazyLoadImage - 图片懒加载Composable
 * TDD Phase 7: 性能优化 - 图片懒加载功能
 *
 * 功能特性:
 * - 使用IntersectionObserver检测图片是否进入视口
 * - 支持占位符图片
 * - 支持自定义rootMargin和threshold
 * - 自动清理观察器
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface LazyLoadImageOptions {
  placeholder?: string
  rootMargin?: string
  threshold?: number
}

export function useLazyLoadImage(
  imgRef: Ref<HTMLElement | undefined>,
  src: string,
  options: LazyLoadImageOptions = {}
) {
  const {
    placeholder = '',
    rootMargin = '50px',
    threshold = 0.01
  } = options

  const isLoading = ref(true)
  const error = ref<Error | null>(null)
  const currentSrc = ref(placeholder)
  let observer: IntersectionObserver | null = null
  let isLoaded = false

  const loadImage = () => {
    if (isLoaded || !src) return

    // 立即更新src，让调用者能看到图片URL
    // Image对象的onload会更新isLoading状态
    currentSrc.value = src

    const img = new Image()

    img.onload = () => {
      isLoading.value = false
      error.value = null
      isLoaded = true
    }

    img.onerror = () => {
      isLoading.value = false
      error.value = new Error('图片加载失败')
      isLoaded = true
    }

    img.src = src
  }

  const observe = () => {
    if (!imgRef.value || isLoaded) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage()
            if (observer) {
              observer.unobserve(entry.target)
            }
          }
        })
      },
      {
        rootMargin,
        threshold
      }
    )

    observer.observe(imgRef.value)
  }

  const stop = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  // 初始化函数，用于手动启动懒加载
  const init = () => {
    if (!imgRef.value || isLoaded) return

    // 直接使用观察器，让IntersectionObserver自己判断
    // 这样在测试中更容易控制
    observe()
  }

  // 自动初始化（在组件上下文中）
  try {
    onMounted(init)
    onUnmounted(stop)
  } catch {
    // 如果不在组件上下文中，忽略错误
    // 用户可以手动调用init()
  }

  return {
    isLoading,
    src: currentSrc,
    error,
    load: loadImage,
    stop,
    init
  }
}
