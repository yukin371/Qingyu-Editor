// src/modules/bookstore/stores/meta.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { browseService } from '../services/browse.service'
import type { Category, Tag } from '@/types/models'

const normalizeCategoryTree = (items: any[] = []): Category[] => {
  return items.map((item: any) => ({
    ...item,
    id: item.id || item._id || '',
    children: Array.isArray(item.children) ? normalizeCategoryTree(item.children) : []
  }))
}

const extractList = (response: any): any[] => {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.list)) return response.list
  if (Array.isArray(response?.data?.list)) return response.data.list
  return []
}

export const useMetaStore = defineStore('bookstoreMeta', () => {
  // State
  const categories = ref<Category[]>([])
  const years = ref<string[]>([])
  const tags = ref<Tag[]>([])
  const _categoriesLoaded = ref(false)
  const _yearsLoaded = ref(false)
  const _tagsLoaded = ref(false)

  // Actions
  const getCategories = async (force = false) => {
    if (_categoriesLoaded.value && !force) {
      return categories.value
    }

    try {
      const response = await browseService.getCategories()
      categories.value = normalizeCategoryTree(extractList(response))
      _categoriesLoaded.value = categories.value.length > 0
      return categories.value
    } catch (error) {
      console.error('获取分类失败:', error)
      categories.value = []
      return categories.value
    }
  }

  const getYears = async (force = false) => {
    if (_yearsLoaded.value && !force) {
      return years.value
    }

    try {
      const response = await browseService.getYears()
      years.value = extractList(response)
      _yearsLoaded.value = years.value.length > 0
      return years.value
    } catch (error) {
      console.error('获取年份失败:', error)
      years.value = []
      return years.value
    }
  }

  const getTags = async (categoryId?: string, force = false) => {
    // 简化版本，实际可以根据categoryId缓存不同结果
    if (_tagsLoaded.value && !force) {
      return tags.value
    }

    try {
      const response = await browseService.getTags(categoryId)
      tags.value = extractList(response)
      _tagsLoaded.value = tags.value.length > 0
      return tags.value
    } catch (error) {
      console.error('获取标签失败:', error)
      tags.value = []
      return tags.value
    }
  }

  return {
    categories,
    years,
    tags,
    getCategories,
    getYears,
    getTags
  }
})
