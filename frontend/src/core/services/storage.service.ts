/**
 * Storage Service
 * Abstraction layer for browser storage (localStorage and sessionStorage)
 */

export interface StorageOptions {
  type?: 'local' | 'session'
  ttl?: number // Time to live in milliseconds
}

interface StorageItem<T> {
  value: T
  expires?: number
}

class StorageService {
  /**
   * Set item in storage
   */
  public set<T>(key: string, value: T, options: StorageOptions = {}): void {
    const { type = 'local', ttl } = options
    const storage = type === 'local' ? localStorage : sessionStorage

    const item: StorageItem<T> = {
      value,
      expires: ttl ? Date.now() + ttl : undefined
    }

    try {
      storage.setItem(key, JSON.stringify(item))
    } catch (error) {
      console.error(`Failed to set item in ${type} storage:`, error)
    }
  }

  /**
   * Get item from storage
   */
  public get<T>(key: string, options: StorageOptions = {}): T | null {
    const { type = 'local' } = options
    const storage = type === 'local' ? localStorage : sessionStorage

    try {
      const itemStr = storage.getItem(key)
      if (!itemStr) {
        return null
      }

      const item: StorageItem<T> = JSON.parse(itemStr)

      // Check if item has expired
      if (item.expires && Date.now() > item.expires) {
        this.remove(key, options)
        return null
      }

      return item.value
    } catch (error) {
      console.error(`Failed to get item from ${type} storage:`, error)
      return null
    }
  }

  /**
   * Remove item from storage
   */
  public remove(key: string, options: StorageOptions = {}): void {
    const { type = 'local' } = options
    const storage = type === 'local' ? localStorage : sessionStorage

    try {
      storage.removeItem(key)
    } catch (error) {
      console.error(`Failed to remove item from ${type} storage:`, error)
    }
  }

  /**
   * Clear all items from storage
   */
  public clear(options: StorageOptions = {}): void {
    const { type = 'local' } = options
    const storage = type === 'local' ? localStorage : sessionStorage

    try {
      storage.clear()
    } catch (error) {
      console.error(`Failed to clear ${type} storage:`, error)
    }
  }

  /**
   * Check if key exists in storage
   */
  public has(key: string, options: StorageOptions = {}): boolean {
    const { type = 'local' } = options
    const storage = type === 'local' ? localStorage : sessionStorage

    return storage.getItem(key) !== null
  }

  /**
   * Get all keys from storage
   */
  public keys(options: StorageOptions = {}): string[] {
    const { type = 'local' } = options
    const storage = type === 'local' ? localStorage : sessionStorage

    return Object.keys(storage)
  }

  /**
   * Get storage size in bytes
   */
  public getSize(options: StorageOptions = {}): number {
    const { type = 'local' } = options
    const storage = type === 'local' ? localStorage : sessionStorage

    let size = 0
    for (const key in storage) {
      if (storage.hasOwnProperty(key)) {
        size += key.length + (storage.getItem(key)?.length || 0)
      }
    }

    return size
  }

  /**
   * Clean up expired items
   */
  public cleanExpired(options: StorageOptions = {}): void {
    const { type = 'local' } = options
    const storage = type === 'local' ? localStorage : sessionStorage

    const keysToRemove: string[] = []

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key) {
        try {
          const itemStr = storage.getItem(key)
          if (itemStr) {
            const item: StorageItem<any> = JSON.parse(itemStr)
            if (item.expires && Date.now() > item.expires) {
              keysToRemove.push(key)
            }
          }
        } catch (error) {
          // Invalid JSON, remove it
          keysToRemove.push(key)
        }
      }
    }

    keysToRemove.forEach(key => storage.removeItem(key))
  }
}

// Export singleton instance
export const storageService = new StorageService()

export default storageService

