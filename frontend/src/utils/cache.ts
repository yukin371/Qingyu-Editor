/**
 * 高级缓存管理工具 v2.0
 */

// --- 类型定义 ---

export interface CacheItem<T> {
  data: T
  timestamp: number
  expiresIn: number
}

export interface CacheOptions {
  expiresIn?: number
  storage?: 'memory' | 'localStorage' | 'sessionStorage'
  prefix?: string
  maxSize?: number // 新增：内存缓存最大数量限制
}

// 判断是否为浏览器环境
const isBrowser = typeof window !== 'undefined'

/**
 * 统一缓存管理器
 */
export class CacheManager {
  private memoryCache: Map<string, CacheItem<any>> = new Map()
  private options: Required<CacheOptions>
  private timer: ReturnType<typeof setInterval> | null = null

  constructor(options: CacheOptions = {}) {
    this.options = {
      expiresIn: options.expiresIn || 5 * 60 * 1000,
      storage: options.storage || 'memory',
      prefix: options.prefix || 'cache:',
      maxSize: options.maxSize || 1000 // 默认限制 1000 条
    }

    // 自动启动清理任务（如果需要）
    this.startCleanupTimer()
  }

  private getKey(key: string): string {
    return `${this.options.prefix}${key}`
  }

  // --- 核心操作 ---

  get<T>(key: string): T | null {
    const fullKey = this.getKey(key)
    if (this.options.storage === 'memory') {
      return this.getFromMemory<T>(fullKey)
    }
    return this.getFromStorage<T>(fullKey, this.options.storage)
  }

  set<T>(key: string, data: T, expiresIn?: number): void {
    const fullKey = this.getKey(key)
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresIn: expiresIn || this.options.expiresIn
    }

    if (this.options.storage === 'memory') {
      this.setToMemory(fullKey, item)
    } else {
      this.setToStorage(fullKey, item, this.options.storage)
    }
  }

  delete(key: string): void {
    const fullKey = this.getKey(key)
    if (this.options.storage === 'memory') {
      this.memoryCache.delete(fullKey)
    } else {
      this.deleteFromStorage(fullKey, this.options.storage)
    }
  }

  clear(): void {
    if (this.options.storage === 'memory') {
      this.memoryCache.clear()
    } else {
      this.clearStorage(this.options.storage)
    }
  }

  // --- 内存操作 (集成 LRU 策略) ---

  private getFromMemory<T>(key: string): T | null {
    const item = this.memoryCache.get(key)
    if (!item) return null

    if (this.isExpired(item)) {
      this.memoryCache.delete(key)
      return null
    }

    return item.data
  }

  private setToMemory<T>(key: string, item: CacheItem<T>): void {
    // LRU 策略：如果已存在，先删除再添加（更新位置）
    if (this.memoryCache.has(key)) {
      this.memoryCache.delete(key)
    }
    
    // 容量检查：如果满了，删除最旧的（Map 的第一个元素）
    if (this.memoryCache.size >= this.options.maxSize) {
      const firstKey = this.memoryCache.keys().next().value
      if (firstKey) this.memoryCache.delete(firstKey)
    }

    this.memoryCache.set(key, item)
  }

  // --- Storage 操作 (SSR 安全) ---

  private getStorage(type: 'localStorage' | 'sessionStorage'): Storage | null {
    if (!isBrowser) return null
    return type === 'localStorage' ? localStorage : sessionStorage
  }

  private getFromStorage<T>(key: string, type: 'localStorage' | 'sessionStorage'): T | null {
    const storage = this.getStorage(type)
    if (!storage) return null

    try {
      const jsonStr = storage.getItem(key)
      if (!jsonStr) return null

      const item = JSON.parse(jsonStr) as CacheItem<T>
      
      // 检查过期
      if (this.isExpired(item)) {
        storage.removeItem(key)
        return null
      }
      
      return item.data
    } catch (e) {
      return null
    }
  }

  private setToStorage<T>(key: string, item: CacheItem<T>, type: 'localStorage' | 'sessionStorage'): void {
    const storage = this.getStorage(type)
    if (!storage) return

    try {
      storage.setItem(key, JSON.stringify(item))
    } catch (e) {
      // QuotaExceededError 处理：如果存满了，尝试清理过期的再存，或者直接忽略
      console.warn('Storage full, cleanup triggered')
      this.cleanup() 
    }
  }

  private deleteFromStorage(key: string, type: 'localStorage' | 'sessionStorage'): void {
    this.getStorage(type)?.removeItem(key)
  }

  private clearStorage(type: 'localStorage' | 'sessionStorage'): void {
    const storage = this.getStorage(type)
    if (!storage) return

    // 仅删除匹配前缀的 key，避免误删其他业务数据
    const keysToRemove: string[] = []
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i)
      if (k && k.startsWith(this.options.prefix)) {
        keysToRemove.push(k)
      }
    }
    keysToRemove.forEach(k => storage.removeItem(k))
  }

  // --- 辅助 ---

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.expiresIn
  }

  // 公开清理方法
  cleanup(): void {
    if (this.options.storage === 'memory') {
      for (const [key, item] of this.memoryCache) {
        if (this.isExpired(item)) this.memoryCache.delete(key)
      }
    } else {
      const storage = this.getStorage(this.options.storage)
      if (!storage) return
      
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i)
        if (key && key.startsWith(this.options.prefix)) {
          try {
            const item = JSON.parse(storage.getItem(key) || '') as CacheItem<any>
            if (this.isExpired(item)) storage.removeItem(key)
          } catch { /* ignore */ }
        }
      }
    }
  }

  // 启动自动清理
  private startCleanupTimer() {
    // 避免重复启动，且仅在浏览器端运行
    if (this.timer || !isBrowser) return
    this.timer = setInterval(() => this.cleanup(), 60 * 1000)
  }
  
  // 销毁实例（停止计时器）
  dispose() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.memoryCache.clear()
  }
}

// --- 单例导出 ---

export const apiCache = new CacheManager({
  expiresIn: 5 * 60 * 1000,
  storage: 'memory',
  prefix: 'api:',
  maxSize: 500 // 限制 API 缓存最多 500 个
})

export const storageCache = new CacheManager({
  expiresIn: 24 * 60 * 60 * 1000,
  storage: 'localStorage',
  prefix: 'app:'
})

// --- 请求去重 + 缓存 组合工具 ---

class RequestDeduplicator {
  private pending = new Map<string, Promise<any>>()

  async deduplicate<T>(key: string, fn: () => Promise<T>): Promise<T> {
    if (this.pending.has(key)) {
      return this.pending.get(key) as Promise<T>
    }
    const promise = fn().finally(() => this.pending.delete(key))
    this.pending.set(key, promise)
    return promise
  }
}
const deduplicator = new RequestDeduplicator()

/**
 * 终极请求包装器：缓存 + 防抖
 * 
 * 解决了"缓存击穿"问题：当缓存失效时，多个并发请求只会有一个真正发给后端，
 * 其他请求会等待这第一个请求的结果。
 */
export async function cacheRequest<T>(
  key: string,
  requestFn: () => Promise<T>,
  options: {
    cache?: CacheManager
    expiresIn?: number
    forceRefresh?: boolean
    useDeduplication?: boolean // 是否开启去重
  } = {}
): Promise<T> {
  const { 
    cache = apiCache, 
    expiresIn, 
    forceRefresh = false,
    useDeduplication = true 
  } = options

  // 1. 查缓存
  if (!forceRefresh) {
    const cached = cache.get<T>(key)
    if (cached !== null) return cached
  }

  // 2. 定义实际请求逻辑（含写入缓存）
  const executeRequest = async () => {
    const data = await requestFn()
    cache.set(key, data, expiresIn)
    return data
  }

  // 3. 去重执行 或 直接执行
  if (useDeduplication) {
    // 使用去重器，key 需要包含特定的前缀以防冲突
    return deduplicator.deduplicate<T>(`req:${key}`, executeRequest)
  } else {
    return executeRequest()
  }
}