// Qingyu_fronted/src/modules/bookstore/services/tag-api.service.ts

import { ref } from 'vue'

export interface Tag {
  id: string
  name: string
  count: number
}

/**
 * 标签API服务
 */
export class TagApiService {
  private cache = ref<string[]>([])
  private loading = ref(false)
  private error = ref<string | null>(null)

  /**
   * 获取热门标签
   */
  async fetchPopularTags(): Promise<string[]> {
    if (this.cache.value.length > 0) {
      return this.cache.value
    }

    this.loading.value = true
    this.error.value = null

    try {
      const response = await fetch('/api/v1/bookstore/tags/popular')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const tags = data.data?.tags || []

      this.cache.value = tags
      return tags
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : '获取标签失败'
      // 降级：返回默认热门标签
      return this.getDefaultTags()
    } finally {
      this.loading.value = false
    }
  }

  /**
   * 获取默认标签
   */
  private getDefaultTags(): string[] {
    return ['玄幻', '修仙', '都市', '重生', '穿越', '系统', '历史', '武侠']
  }

  /**
   * 获取加载状态
   */
  get isLoading() {
    return this.loading.value
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.value = []
  }
}

export const tagApiService = new TagApiService()
