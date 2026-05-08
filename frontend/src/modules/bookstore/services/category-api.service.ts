// Qingyu_fronted/src/modules/bookstore/services/category-api.service.ts

import { ref } from 'vue'
import type { CategorySimple } from '../types/search.types'

export interface Category {
  id: string
  name: string
  count?: number
}

/**
 * 分类API服务
 */
export class CategoryApiService {
  private cache = ref<CategorySimple[]>([])
  private loading = ref(false)
  private error = ref<string | null>(null)

  /**
   * 获取分类列表
   */
  async fetchCategories(): Promise<CategorySimple[]> {
    if (this.cache.value.length > 0) {
      return this.cache.value
    }

    this.loading.value = true
    this.error.value = null

    try {
      const response = await fetch('/api/v1/bookstore/categories')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const categories = data.data?.categories || []

      this.cache.value = categories
      return categories
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : '获取分类失败'
      throw err
    } finally {
      this.loading.value = false
    }
  }

  /**
   * 获取加载状态
   */
  get isLoading() {
    return this.loading.value
  }

  /**
   * 获取错误信息
   */
  get getError() {
    return this.error.value
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.value = []
  }
}

export const categoryApiService = new CategoryApiService()
