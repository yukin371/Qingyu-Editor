import { ref } from 'vue'

const STORAGE_KEY = 'qingyu-storage'

export function useStorage<T>(key: string, defaultValue: T) {
  const data = ref<T>(defaultValue)

  // 清理最旧的数据（保留最新的70%）
  function cleanupOldData() {
    try {
      const allData = localStorage.getItem(STORAGE_KEY)
      if (allData) {
        const parsed = JSON.parse(allData)
        const keys = Object.keys(parsed).filter((k) => k !== key) // 排除当前key
        const deleteCount = Math.max(1, Math.floor(keys.length * 0.3))

        // 删除最旧的数据
        for (let i = 0; i < deleteCount && i < keys.length; i++) {
          delete parsed[keys[i]]
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      }
    } catch (e) {
      console.warn('Cleanup failed:', e)
    }
  }

  function save() {
    try {
      // 获取现有数据
      const existingData = localStorage.getItem(STORAGE_KEY)
      const allData = existingData ? JSON.parse(existingData) : {}

      // 更新当前key的数据
      allData[key] = data.value

      // P0 Fix: 处理QuotaExceededError
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allData))
    } catch (e) {
      if ((e as Error).name === 'QuotaExceededError') {
        // 清理旧数据后重试
        cleanupOldData()
        try {
          const existingData = localStorage.getItem(STORAGE_KEY)
          const allData = existingData ? JSON.parse(existingData) : {}
          allData[key] = data.value
          localStorage.setItem(STORAGE_KEY, JSON.stringify(allData))
        } catch (retryError) {
          console.warn('Failed after cleanup:', retryError)
        }
      } else {
        console.error('Storage error:', e)
      }
    }
  }

  function load() {
    try {
      const existingData = localStorage.getItem(STORAGE_KEY)
      if (existingData) {
        const allData = JSON.parse(existingData)
        if (allData[key] !== undefined) {
          data.value = allData[key]
        }
      }
    } catch (e) {
      console.error('Load error:', e)
    }
  }

  // 初始加载
  load()

  return { data, save, load }
}
