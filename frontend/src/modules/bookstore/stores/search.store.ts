/**
 * Search Store with URL Sync
 * 管理搜索状态并与URL参数双向同步
 */

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { SEARCH_CONFIG } from '../config/search.config'

export const useSearchStore = defineStore('search', () => {
  // State
  const keyword = ref('')
  const selectedTags = ref<string[]>([])

  /**
   * 从URL同步参数到State
   */
  const syncFromURL = () => {
    const params = new URLSearchParams(window.location.search)

    // 读取keyword参数
    const keywordParam = params.get('keyword')
    if (keywordParam) {
      keyword.value = decodeURIComponent(keywordParam)
    }

    // 读取tags参数（逗号分隔）
    const tagsParam = params.get('tags')
    if (tagsParam) {
      selectedTags.value = tagsParam.split(',').map(tag => decodeURIComponent(tag))
    }
  }

  /**
   * 从State同步参数到URL
   */
  const syncToURL = () => {
    const params = new URLSearchParams()

    // 添加keyword参数（如果非空）
    // URLSearchParams会自动编码，不需要手动encodeURIComponent
    if (keyword.value) {
      params.set('keyword', keyword.value)
    }

    // 添加tags参数（如果有选择标签）
    if (selectedTags.value.length > 0) {
      params.set('tags', selectedTags.value.join(','))
    }

    // 构建新的URL
    const queryString = params.toString()
    const newURL = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname

    // 使用replaceState更新URL（不刷新页面）
    window.history.replaceState({}, '', newURL)
  }

  /**
   * 设置关键词
   */
  const setKeyword = (value: string) => {
    keyword.value = value
  }

  /**
   * 设置标签
   */
  const setSelectedTags = (tags: string[]) => {
    selectedTags.value = tags
  }

  /**
   * 添加标签
   */
  const addTag = (tag: string) => {
    if (!selectedTags.value.includes(tag)) {
      selectedTags.value.push(tag)
    }
  }

  /**
   * 移除标签
   */
  const removeTag = (tag: string) => {
    const index = selectedTags.value.indexOf(tag)
    if (index > -1) {
      selectedTags.value.splice(index, 1)
    }
  }

  /**
   * 清空搜索
   */
  const clearSearch = () => {
    keyword.value = ''
    selectedTags.value = []
  }

  /**
   * 重置状态
   */
  const reset = () => {
    keyword.value = ''
    selectedTags.value = []
  }

  // 监听状态变化，自动同步到URL（使用配置的防抖延迟）
  let syncTimeout: ReturnType<typeof setTimeout> | null = null
  watch([keyword, selectedTags], () => {
    if (syncTimeout) {
      clearTimeout(syncTimeout)
    }
    syncTimeout = setTimeout(() => {
      syncToURL()
    }, SEARCH_CONFIG.URL_DEBOUNCE_MS)
  }, { deep: true })

  return {
    // State
    keyword,
    selectedTags,

    // Actions
    syncFromURL,
    syncToURL,
    setKeyword,
    setSelectedTags,
    addTag,
    removeTag,
    clearSearch,
    reset
  }
})

export default useSearchStore
