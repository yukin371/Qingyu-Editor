/**
 * 本地存储工具类
 */

const PREFIX = 'qingyu_'

export class Storage {
  /**
   * 设置存储项
   */
  set(key: string, value: any): void {
    try {
      const serialized = JSON.stringify(value)
      localStorage.setItem(PREFIX + key, serialized)
    } catch (error) {
      console.error('Storage set error:', error)
    }
  }

  /**
   * 获取存储项
   */
  get<T = any>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(PREFIX + key)
      if (item == null || item === 'undefined' || item === 'null') {
        return defaultValue !== undefined ? defaultValue : null
      }
      return JSON.parse(item) as T
    } catch (error) {
      console.error('Storage get error:', error)
      // 清除无效的存储项
      localStorage.removeItem(PREFIX + key)
      return defaultValue !== undefined ? defaultValue : null
    }
  }

  /**
   * 删除存储项
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(PREFIX + key)
    } catch (error) {
      console.error('Storage remove error:', error)
    }
  }

  /**
   * 清空所有存储项
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith(PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Storage clear error:', error)
    }
  }

  /**
   * 检查键是否存在
   */
  has(key: string): boolean {
    return localStorage.getItem(PREFIX + key) !== null
  }
}

const storage = new Storage()

export default storage

/**
 * 读取存储的认证 token
 * @returns token 字符串或 null
 */
export function readStoredAuthToken(): string | null {
  try {
    const item = localStorage.getItem(PREFIX + 'token')
    if (item == null || item === 'undefined' || item === 'null') {
      return null
    }
    // 支持直接存储的字符串或 JSON 格式
    try {
      return JSON.parse(item) as string
    } catch {
      return item
    }
  } catch {
    return null
  }
}
