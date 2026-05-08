/**
 * 性能监控工具
 */

export interface PerformanceMetrics {
  // 页面加载性能
  loadTime?: number
  domReadyTime?: number
  firstPaintTime?: number
  firstContentfulPaint?: number

  // 资源加载
  resourceCount?: number
  resourceLoadTime?: number

  // 内存使用
  memoryUsed?: number
  memoryLimit?: number

  // 自定义指标
  customMetrics?: Record<string, number>
}

/**
 * 性能监控类
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {}
  private marks: Map<string, number> = new Map()
  private measures: Map<string, number> = new Map()

  /**
   * 收集页面加载性能数据
   */
  collectPageMetrics(): PerformanceMetrics {
    if (!window.performance) {
      console.warn('Performance API not supported')
      return {}
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')

    if (navigation) {
      this.metrics.loadTime = Math.round(navigation.loadEventEnd - navigation.fetchStart)
      this.metrics.domReadyTime = Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart)
    }

    // 首次绘制时间
    const fp = paint.find(entry => entry.name === 'first-paint')
    if (fp) {
      this.metrics.firstPaintTime = Math.round(fp.startTime)
    }

    // 首次内容绘制时间
    const fcp = paint.find(entry => entry.name === 'first-contentful-paint')
    if (fcp) {
      this.metrics.firstContentfulPaint = Math.round(fcp.startTime)
    }

    // 资源加载统计
    const resources = performance.getEntriesByType('resource')
    this.metrics.resourceCount = resources.length
    this.metrics.resourceLoadTime = Math.round(
      resources.reduce((total, resource) => total + resource.duration, 0)
    )

    // 内存使用情况（仅部分浏览器支持）
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.metrics.memoryUsed = Math.round(memory.usedJSHeapSize / 1024 / 1024)
      this.metrics.memoryLimit = Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
    }

    return this.metrics
  }

  /**
   * 标记性能时间点
   */
  mark(name: string): void {
    if (window.performance && performance.mark) {
      performance.mark(name)
    }
    this.marks.set(name, Date.now())
  }

  /**
   * 测量两个标记之间的时间
   */
  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark)
    if (!start) {
      console.warn(`Start mark "${startMark}" not found`)
      return 0
    }

    const end = endMark ? this.marks.get(endMark) : Date.now()
    if (!end) {
      console.warn(`End mark "${endMark}" not found`)
      return 0
    }

    const duration = end - start
    this.measures.set(name, duration)

    if (window.performance && performance.measure) {
      try {
        performance.measure(name, startMark, endMark)
      } catch (error) {
        console.warn('Failed to create performance measure:', error)
      }
    }

    return duration
  }

  /**
   * 获取测量结果
   */
  getMeasure(name: string): number | undefined {
    return this.measures.get(name)
  }

  /**
   * 获取所有测量结果
   */
  getAllMeasures(): Record<string, number> {
    return Object.fromEntries(this.measures)
  }

  /**
   * 清除标记和测量
   */
  clear(): void {
    this.marks.clear()
    this.measures.clear()
    if (window.performance) {
      performance.clearMarks()
      performance.clearMeasures()
    }
  }

  /**
   * 监控长任务
   */
  observeLongTasks(callback: (entries: PerformanceEntry[]) => void): PerformanceObserver | null {
    if (!window.PerformanceObserver) {
      return null
    }

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        callback(entries)
      })
      observer.observe({ entryTypes: ['longtask'] })
      return observer
    } catch (error) {
      console.warn('Long task observation not supported:', error)
      return null
    }
  }

  /**
   * 监控资源加载
   */
  observeResources(callback: (entries: PerformanceResourceTiming[]) => void): PerformanceObserver | null {
    if (!window.PerformanceObserver) {
      return null
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceResourceTiming[]
      if (entries.length > 0) {
        callback(entries)
      }
    })

    observer.observe({ entryTypes: ['resource'] })
    return observer
  }

  /**
   * 获取性能报告
   */
  getReport(): string {
    const metrics = this.collectPageMetrics()
    const measures = this.getAllMeasures()

    return `
=== Performance Report ===

Page Load Metrics:
- Load Time: ${metrics.loadTime}ms
- DOM Ready: ${metrics.domReadyTime}ms
- First Paint: ${metrics.firstPaintTime}ms
- First Contentful Paint: ${metrics.firstContentfulPaint}ms

Resources:
- Count: ${metrics.resourceCount}
- Total Load Time: ${metrics.resourceLoadTime}ms

Memory:
- Used: ${metrics.memoryUsed}MB
- Limit: ${metrics.memoryLimit}MB

Custom Measures:
${Object.entries(measures).map(([name, duration]) => `- ${name}: ${duration}ms`).join('\n')}
    `.trim()
  }
}

// 创建默认实例
export const performanceMonitor = new PerformanceMonitor()

/**
 * 性能装饰器（用于函数）
 */
export function measurePerformance(name?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    const measureName = name || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (...args: any[]) {
      const startMark = `${measureName}-start`
      const endMark = `${measureName}-end`

      performanceMonitor.mark(startMark)

      try {
        const result = await originalMethod.apply(this, args)
        performanceMonitor.mark(endMark)
        const duration = performanceMonitor.measure(measureName, startMark, endMark)

        console.log(`[Performance] ${measureName}: ${duration}ms`)

        return result
      } catch (error) {
        performanceMonitor.mark(endMark)
        throw error
      }
    }

    return descriptor
  }
}

/**
 * FPS 监控器
 */
export class FPSMonitor {
  private frameCount = 0
  private lastTime = performance.now()
  private fps = 0
  private rafId: number | null = null

  start(callback?: (fps: number) => void): void {
    const measureFPS = () => {
      this.frameCount++
      const currentTime = performance.now()

      if (currentTime >= this.lastTime + 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime))
        this.frameCount = 0
        this.lastTime = currentTime

        if (callback) {
          callback(this.fps)
        }
      }

      this.rafId = requestAnimationFrame(measureFPS)
    }

    this.rafId = requestAnimationFrame(measureFPS)
  }

  stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  getFPS(): number {
    return this.fps
  }
}

/**
 * 网络信息监控
 */
export interface NetworkInfo {
  effectiveType?: string // '4g', '3g', '2g', 'slow-2g'
  downlink?: number // Mbps
  rtt?: number // ms
  saveData?: boolean
}

export function getNetworkInfo(): NetworkInfo | null {
  const nav = navigator as any
  if (!nav.connection && !nav.mozConnection && !nav.webkitConnection) {
    return null
  }

  const connection = nav.connection || nav.mozConnection || nav.webkitConnection

  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData
  }
}

/**
 * 首屏渲染时间
 */
export function measureFirstScreenTime(callback: (time: number) => void): void {
  // 检查环境
  if (typeof window === 'undefined') return

  try {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
            const time = Math.round(entry.startTime)
            callback(time)
            observer.disconnect()
          }
        }
      })

      observer.observe({ entryTypes: ['paint'] })
    } else {
      // 降级方案（使用已废弃的 API）
      const perf: any = (window as any).performance
      if (perf && perf.timing) {
        (window as any).addEventListener('load', () => {
          const computedTime = perf.timing.domContentLoadedEventEnd - perf.timing.navigationStart
          callback(computedTime)
        })
      }
    }
  } catch (error) {
    // 忽略错误
    console.warn('measureFirstScreenTime failed:', error)
  }
}

/**
 * 监控页面可见性变化对性能的影响
 */
export function observeVisibilityChange(
  onVisible: () => void,
  onHidden: () => void
): () => void {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      onHidden()
    } else {
      onVisible()
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)

  // 返回清理函数
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}

/**
 * 计算并报告 Web Vitals
 */
export interface WebVitals {
  FCP?: number // First Contentful Paint
  LCP?: number // Largest Contentful Paint
  FID?: number // First Input Delay
  CLS?: number // Cumulative Layout Shift
  TTFB?: number // Time to First Byte
}

export function measureWebVitals(): Promise<WebVitals> {
  return new Promise((resolve) => {
    const vitals: WebVitals = {}

    // FCP
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          vitals.FCP = Math.round(entry.startTime)
        }
      }
    })
    fcpObserver.observe({ entryTypes: ['paint'] })

    // LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      vitals.LCP = Math.round(lastEntry.startTime)
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // 延迟返回以确保收集到数据
    setTimeout(() => {
      fcpObserver.disconnect()
      lcpObserver.disconnect()
      resolve(vitals)
    }, 3000)
  })
}

/**
 * 防抖函数（支持flush和保留this上下文）
 * P0修复：flush时必须保留this上下文
 *
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数，带有flush方法
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((this: any, ...args: Parameters<T>) => void) & { flush: (this: any) => void } {
  let timer: number | null = null
  let lastArgs: Parameters<T> | null = null
  let lastThis: any = null

  const debounced = function (this: any, ...args: Parameters<T>) {
    lastArgs = args
    lastThis = this
    if (timer) clearTimeout(timer)
    timer = window.setTimeout(() => {
      fn.apply(this, args)
      timer = null
      lastArgs = null
      lastThis = null
    }, delay)
  } as any

  // P0修复：flush时保留正确的this上下文
  debounced.flush = function(this: any) {
    if (timer) {
      clearTimeout(timer)
    }
    if (lastArgs) {
      fn.apply(this || lastThis, lastArgs)
      timer = null
      lastArgs = null
      lastThis = null
    }
  }

  return debounced
}

/**
 * 节流函数
 *
 * @param fn 要节流的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  return function(this: any, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      fn.apply(this, args)
    }
  }
}

