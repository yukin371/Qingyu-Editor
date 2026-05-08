/**
 * v-lazy 图片懒加载指令
 *
 * 使用 IntersectionObserver API 实现图片懒加载
 *
 * 使用方法:
 * <img v-lazy="imageUrl" />
 * <img v-lazy="{ src: imageUrl, loading: loadingUrl, error: errorUrl }" />
 */

import { DirectiveBinding } from 'vue'

interface LazyOptions {
  src: string
  loading?: string
  error?: string
  threshold?: number
  rootMargin?: string
}

// 默认占位图
const DEFAULT_LOADING = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3C/svg%3E'

// 存储观察器实例
const observerMap = new WeakMap<HTMLElement, IntersectionObserver>()

// 已加载图片缓存
const loadedImages = new Set<string>()

/**
 * 加载图片
 */
const loadImage = (
  el: HTMLImageElement,
  src: string,
  errorSrc?: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 检查缓存，如果已加载则直接设置
    if (loadedImages.has(src)) {
      el.src = src
      el.classList.remove('lazy-loading')
      el.classList.add('lazy-loaded')
      resolve()
      return
    }

    const img = new Image()

    img.onload = () => {
      el.src = src
      el.classList.remove('lazy-loading')
      el.classList.add('lazy-loaded')
      // 添加到缓存
      loadedImages.add(src)
      resolve()
    }

    img.onerror = () => {
      if (errorSrc) {
        el.src = errorSrc
      }
      el.classList.remove('lazy-loading')
      el.classList.add('lazy-error')
      reject(new Error(`Failed to load image: ${src}`))
    }

    img.src = src
  })
}

/**
 * 创建观察器
 */
const createObserver = (
  _el: HTMLImageElement,
  options: LazyOptions
): IntersectionObserver => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLImageElement

          // 加载真实图片
          loadImage(target, options.src, options.error)
            .catch((err) => {
              console.error('Lazy load image failed:', err)
            })

          // 停止观察
          observer.unobserve(target)
        }
      })
    },
    {
      rootMargin: options.rootMargin || '50px',
      threshold: options.threshold || 0.01
    }
  )

  return observer
}

/**
 * 解析指令参数
 */
const parseBinding = (binding: DirectiveBinding): LazyOptions => {
  if (typeof binding.value === 'string') {
    return { src: binding.value }
  }

  if (typeof binding.value === 'object') {
    return {
      src: binding.value.src || '',
      loading: binding.value.loading,
      error: binding.value.error,
      threshold: binding.value.threshold,
      rootMargin: binding.value.rootMargin
    }
  }

  return { src: '' }
}

/**
 * v-lazy 指令定义
 */
export const vLazy = {
  /**
   * 元素挂载时
   */
  mounted(el: HTMLImageElement, binding: DirectiveBinding) {
    // 只处理 img 元素
    if (el.tagName.toLowerCase() !== 'img') {
      console.warn('v-lazy directive can only be used on <img> elements')
      return
    }

    const options = parseBinding(binding)

    if (!options.src) {
      console.warn('v-lazy directive requires a src value')
      return
    }

    // 添加懒加载class
    el.classList.add('lazy-loading')

    // 设置占位图
    if (options.loading) {
      el.src = options.loading
    } else {
      el.src = DEFAULT_LOADING
    }

    // 设置 alt 属性（如果没有）
    if (!el.alt) {
      el.alt = 'Loading...'
    }

    // 创建并启动观察器
    const observer = createObserver(el, options)
    observer.observe(el)

    // 保存观察器实例
    observerMap.set(el, observer)
  },

  /**
   * 元素更新时
   */
  updated(el: HTMLImageElement, binding: DirectiveBinding) {
    const options = parseBinding(binding)

    // 如果 src 变化，重新加载
    if (options.src && !el.classList.contains('lazy-loaded')) {
      // 先停止旧的观察器
      const oldObserver = observerMap.get(el)
      if (oldObserver) {
        oldObserver.unobserve(el)
      }

      // 创建新的观察器
      const newObserver = createObserver(el, options)
      newObserver.observe(el)
      observerMap.set(el, newObserver)
    }
  },

  /**
   * 元素卸载时
   */
  unmounted(el: HTMLImageElement) {
    // 清理观察器
    const observer = observerMap.get(el)
    if (observer) {
      observer.unobserve(el)
      observer.disconnect()
      observerMap.delete(el)
    }
  }
}

/**
 * 默认导出（用于全局注册）
 */
export default vLazy

/**
 * 清除已加载图片缓存
 * 用于需要重新加载图片的场景（如刷新、更新等）
 */
export function clearLoadedImagesCache(): void {
  loadedImages.clear()
}

/**
 * 获取已加载图片列表
 * 用于调试和监控
 */
export function getLoadedImages(): string[] {
  return Array.from(loadedImages)
}

